"""Careers API - list, detail, recommendations, skill gap"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Career, CareerSkill, Skill, StudentProfile, User
from app.api.auth import get_current_user
from app.services.recommender import CareerRecommender

router = APIRouter()
recommender = CareerRecommender()


def serialize_career(c: Career, db: Session, include_skills: bool = False) -> dict:
    result = {
        "id": c.id,
        "title": c.title,
        "slug": c.slug,
        "category": c.category,
        "description": c.description,
        "short_description": c.short_description,
        "typical_education": c.typical_education,
        "estimated_duration_months": c.estimated_duration_months,
        "salary_range_min": c.salary_range_min,
        "salary_range_max": c.salary_range_max,
        "salary_label": c.salary_label,
        "work_environment": c.work_environment,
        "growth_potential": c.growth_potential,
        "icon_name": c.icon_name,
        "is_vocational": c.is_vocational,
        "tags": c.tags or [],
    }
    if include_skills:
        career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == c.id).all()
        skills_list = []
        for cs in career_skills:
            skill = db.query(Skill).filter(Skill.id == cs.skill_id).first()
            if skill:
                skills_list.append({
                    "id": skill.id,
                    "name": skill.name,
                    "category": skill.category,
                    "importance": cs.importance,
                    "level_required": cs.level_required.value,
                    "milestone_phase": cs.milestone_phase,
                })
        result["required_skills"] = skills_list
    return result


@router.get("/")
def list_careers(
    category: Optional[str] = None,
    vocational: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Career)
    if category:
        q = q.filter(Career.category == category)
    if vocational is not None:
        q = q.filter(Career.is_vocational == vocational)
    careers = q.all()
    return [serialize_career(c, db) for c in careers]


@router.get("/recommendations")
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user:
        # Return all careers as default
        careers = db.query(Career).all()
        return {
            "recommendations": [serialize_career(c, db) for c in careers],
            "personalized": False,
            "explanation": "Log in to get personalized recommendations based on your profile.",
        }

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile or not profile.onboarding_complete:
        careers = db.query(Career).all()
        return {
            "recommendations": [serialize_career(c, db) for c in careers],
            "personalized": False,
            "explanation": "Complete onboarding to get personalized recommendations.",
        }

    all_careers = db.query(Career).all()
    ranked = recommender.rank_careers(profile, all_careers, db)

    result = []
    for career, score, reasons in ranked:
        c_data = serialize_career(career, db, include_skills=True)
        c_data["match_score"] = round(score * 100, 1)
        c_data["match_reasons"] = reasons
        result.append(c_data)

    return {
        "recommendations": result,
        "personalized": True,
        "explanation": (
            "Rankings are based on your interests, existing skills, education level, "
            "and stated constraints. These are guidance suggestions — not aptitude test results."
        ),
    }


@router.get("/{slug}")
def get_career(slug: str, db: Session = Depends(get_db)):
    career = db.query(Career).filter(Career.slug == slug).first()
    if not career:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Career not found")
    return serialize_career(career, db, include_skills=True)


@router.get("/{slug}/skill-gap")
def get_skill_gap(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    career = db.query(Career).filter(Career.slug == slug).first()
    if not career:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Career not found")

    career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == career.id).all()

    # Get student's existing skills
    student_skills = []
    if current_user:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if profile:
            student_skills = profile.existing_skills or []

    required = []
    has = []
    missing = []

    for cs in career_skills:
        skill = db.query(Skill).filter(Skill.id == cs.skill_id).first()
        if not skill:
            continue
        skill_data = {
            "id": skill.id,
            "name": skill.name,
            "category": skill.category,
            "importance": cs.importance,
            "level_required": cs.level_required.value,
            "milestone_phase": cs.milestone_phase,
        }
        required.append(skill_data)
        if skill.name in student_skills:
            has.append(skill_data)
        elif cs.importance == "required":
            missing.append(skill_data)

    readiness = len(has) / max(len(required), 1) * 100
    return {
        "career_title": career.title,
        "career_slug": career.slug,
        "total_skills": len(required),
        "skills_you_have": has,
        "skills_to_develop": missing,
        "readiness_percentage": round(readiness, 1),
        "estimated_months_to_ready": career.estimated_duration_months,
        "note": "Skill gap is based on self-reported profile data. Actual readiness may vary.",
    }
