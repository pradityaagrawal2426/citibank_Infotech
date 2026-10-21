"""Recommender service - rule-based + profile matching"""
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.models import Career, StudentProfile, CareerSkill, Skill


INTEREST_CAREER_MAP = {
    "computers": ["software-developer", "data-analyst", "office-administrator"],
    "programming": ["software-developer", "data-analyst"],
    "technology": ["software-developer", "data-analyst"],
    "math": ["software-developer", "data-analyst"],
    "data": ["data-analyst", "software-developer"],
    "numbers": ["data-analyst", "office-administrator"],
    "business": ["retail-entrepreneur", "agri-entrepreneur", "office-administrator"],
    "entrepreneurship": ["retail-entrepreneur", "agri-entrepreneur"],
    "farming": ["agri-entrepreneur"],
    "agriculture": ["agri-entrepreneur"],
    "electrical": ["electrician"],
    "electronics": ["electrician"],
    "fixing": ["electrician"],
    "hands-on": ["electrician", "agri-entrepreneur"],
    "healthcare": ["healthcare-support"],
    "helping people": ["healthcare-support"],
    "community": ["healthcare-support", "agri-entrepreneur"],
    "office": ["office-administrator"],
    "writing": ["office-administrator"],
    "communication": ["office-administrator", "retail-entrepreneur"],
    "problem-solving": ["software-developer", "data-analyst"],
    "management": ["retail-entrepreneur", "office-administrator"],
    "sales": ["retail-entrepreneur"],
    "animals": ["agri-entrepreneur"],
    "environment": ["agri-entrepreneur"],
}

EDUCATION_CAREER_WEIGHTS = {
    "Class 8": {
        "electrician": 0.9,
        "agri-entrepreneur": 0.9,
        "retail-entrepreneur": 0.8,
        "healthcare-support": 0.5,
        "office-administrator": 0.4,
        "data-analyst": 0.2,
        "software-developer": 0.1,
    },
    "Class 10": {
        "electrician": 1.0,
        "agri-entrepreneur": 0.9,
        "retail-entrepreneur": 0.9,
        "healthcare-support": 0.8,
        "office-administrator": 0.8,
        "data-analyst": 0.5,
        "software-developer": 0.4,
    },
    "Class 12": {
        "electrician": 0.8,
        "agri-entrepreneur": 0.8,
        "retail-entrepreneur": 0.8,
        "healthcare-support": 0.9,
        "office-administrator": 0.9,
        "data-analyst": 0.9,
        "software-developer": 0.8,
    },
    "Graduate": {
        "electrician": 0.5,
        "agri-entrepreneur": 0.7,
        "retail-entrepreneur": 0.8,
        "healthcare-support": 0.8,
        "office-administrator": 0.9,
        "data-analyst": 1.0,
        "software-developer": 1.0,
    },
    "Diploma": {
        "electrician": 1.0,
        "agri-entrepreneur": 0.8,
        "retail-entrepreneur": 0.8,
        "healthcare-support": 0.8,
        "office-administrator": 0.9,
        "data-analyst": 0.8,
        "software-developer": 0.8,
    },
}


class CareerRecommender:
    """
    Rule-based + interest matching career recommender.
    Transparent and explainable — no hidden ML black box.
    """

    def rank_careers(
        self,
        profile: StudentProfile,
        careers: List[Career],
        db: Session,
    ) -> List[Tuple[Career, float, List[str]]]:
        results = []
        for career in careers:
            score, reasons = self._score_career(profile, career, db)
            results.append((career, score, reasons))
        results.sort(key=lambda x: x[1], reverse=True)
        return results

    def _score_career(
        self,
        profile: StudentProfile,
        career: Career,
        db: Session,
    ) -> Tuple[float, List[str]]:
        score = 0.0
        reasons = []
        max_score = 4.0  # normalise to 0-1

        # 1. Interest matching (weight: 1.5)
        interests = [i.lower() for i in (profile.interests or [])]
        matching_interests = []
        for interest in interests:
            for keyword, slugs in INTEREST_CAREER_MAP.items():
                if keyword in interest and career.slug in slugs:
                    matching_interests.append(interest)
                    break

        if matching_interests:
            interest_score = min(1.5, len(matching_interests) * 0.5)
            score += interest_score
            if len(matching_interests) == 1:
                reasons.append(f"Matches your interest in {matching_interests[0]}")
            else:
                reasons.append(f"Matches {len(matching_interests)} of your interests: {', '.join(matching_interests[:3])}")

        # 2. Education level fit (weight: 1.0)
        edu_level = profile.education_level or "Class 10"
        # normalise common variations
        edu_norm = "Graduate" if "gradu" in edu_level.lower() else edu_level
        edu_weights = EDUCATION_CAREER_WEIGHTS.get(edu_norm, EDUCATION_CAREER_WEIGHTS["Class 10"])
        edu_weight = edu_weights.get(career.slug, 0.5)
        score += edu_weight
        if edu_weight >= 0.8:
            reasons.append(f"Well-suited for your {edu_level} qualification")
        elif edu_weight >= 0.5:
            reasons.append(f"Accessible from {edu_level} with additional learning")

        # 3. Existing skill overlap (weight: 1.0)
        career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == career.id).all()
        student_skills = profile.existing_skills or []
        required_skill_ids = [cs.skill_id for cs in career_skills if cs.importance == "required"]
        matched_skills = []
        for cs in career_skills:
            skill = db.query(Skill).filter(Skill.id == cs.skill_id).first()
            if skill and skill.name in student_skills:
                matched_skills.append(skill.name)

        if matched_skills:
            skill_score = min(1.0, len(matched_skills) * 0.33)
            score += skill_score
            reasons.append(f"You already have {len(matched_skills)} relevant skill(s): {', '.join(matched_skills[:2])}")

        # 4. Constraints fit (weight: 0.5)
        if not profile.has_laptop and not profile.has_internet:
            # Prefer vocational and field careers
            if career.is_vocational or career.work_environment in ["On-site", "Farm/Field", "Local Business"]:
                score += 0.5
                reasons.append("Works well without a laptop or reliable internet")
        elif not profile.has_laptop:
            if career.is_vocational:
                score += 0.3
                reasons.append("Suitable for mobile-only learners")

        if profile.financial_constraints:
            if career.is_vocational and career.estimated_duration_months <= 9:
                score += 0.2
                reasons.append("Shorter training pathway suits your constraints")

        # 5. Daily study time fit
        if profile.daily_study_minutes and profile.daily_study_minutes < 60:
            if career.estimated_duration_months <= 9:
                score += 0.2
                reasons.append("Can be completed with limited daily study time")

        normalized = min(1.0, score / max_score)

        if not reasons:
            reasons.append("General career option based on your profile")

        return normalized, reasons
