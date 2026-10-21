"""AI Engine API - career twin, what-if simulator, voice query"""
from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.models import (
    Career, StudentProfile, User, CareerSkill, Skill,
    StudentProgress, LearningMilestone, Opportunity
)
from app.api.auth import get_current_user

router = APIRouter()


class WhatIfRequest(BaseModel):
    career_slug: str
    constraints: dict  # e.g. {"daily_minutes": 30, "no_laptop": True, "no_internet": True}


class VoiceQueryRequest(BaseModel):
    text: str
    language: str = "en"


@router.get("/career-twin/{slug}")
def get_career_twin(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Explainable Career Twin: shows current skills vs target career requirements,
    skill gap, and next steps.
    """
    career = db.query(Career).filter(Career.slug == slug).first()
    if not career:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Career not found")

    career_skills = db.query(CareerSkill).filter(CareerSkill.career_id == career.id).all()
    student_skills = []
    profile = None

    if current_user:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if profile:
            student_skills = profile.existing_skills or []

    skill_map = {"has": [], "missing_required": [], "missing_recommended": []}
    for cs in career_skills:
        skill = db.query(Skill).filter(Skill.id == cs.skill_id).first()
        if not skill:
            continue
        entry = {
            "id": skill.id,
            "name": skill.name,
            "category": skill.category,
            "level_required": cs.level_required.value,
            "importance": cs.importance,
        }
        if skill.name in student_skills:
            skill_map["has"].append(entry)
        elif cs.importance == "required":
            skill_map["missing_required"].append(entry)
        else:
            skill_map["missing_recommended"].append(entry)

    total = len(career_skills)
    has_count = len(skill_map["has"])
    readiness = round(has_count / max(total, 1) * 100, 1)

    # Find next milestone
    next_milestone = None
    if profile:
        progress = db.query(StudentProgress).filter(
            StudentProgress.student_id == profile.id,
            StudentProgress.career_id == career.id,
            StudentProgress.is_complete == True,
        ).all()
        completed_ids = {p.milestone_id for p in progress}
        all_milestones = db.query(LearningMilestone).filter(
            LearningMilestone.career_id == career.id
        ).order_by(LearningMilestone.order_index).all()
        for m in all_milestones:
            if m.id not in completed_ids:
                next_milestone = {
                    "id": m.id,
                    "title": m.title,
                    "phase": m.phase.value,
                    "estimated_weeks": m.estimated_weeks,
                    "practical_task": m.practical_task,
                }
                break

    # Estimate time to career-ready
    daily_minutes = profile.daily_study_minutes if profile else 60
    weeks_per_month = 4
    hours_per_week = (daily_minutes * 5) / 60  # 5 days/week
    total_weeks = career.estimated_duration_months * weeks_per_month
    # Adjust for existing skills
    adjustment = has_count / max(total, 1)
    adjusted_weeks = total_weeks * (1 - adjustment * 0.4)  # partial credit

    return {
        "career_title": career.title,
        "career_slug": career.slug,
        "readiness_percentage": readiness,
        "skills_you_have": skill_map["has"],
        "skills_to_develop": skill_map["missing_required"],
        "optional_skills": skill_map["missing_recommended"],
        "next_step": next_milestone,
        "estimated_weeks_to_ready": round(adjusted_weeks),
        "daily_study_minutes": daily_minutes,
        "note": (
            "This is a guidance estimate based on your profile data. "
            "Actual time to readiness depends on practice, opportunity, and individual learning pace."
        ),
    }


@router.post("/what-if")
def what_if_simulator(
    req: WhatIfRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    What-if simulator: recalculates pathway under different constraints.
    """
    career = db.query(Career).filter(Career.slug == req.career_slug).first()
    if not career:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Career not found")

    constraints = req.constraints
    daily_minutes = constraints.get("daily_minutes", 60)
    no_laptop = constraints.get("no_laptop", False)
    no_internet = constraints.get("no_internet", False)
    prefer_vocational = constraints.get("prefer_vocational", False)

    milestones = db.query(LearningMilestone).filter(
        LearningMilestone.career_id == career.id
    ).order_by(LearningMilestone.order_index).all()

    # Recalculate timeline
    total_weeks = sum(m.estimated_weeks for m in milestones)
    study_hours_per_week = (daily_minutes * 5) / 60
    standard_hours_per_week = (60 * 5) / 60
    time_multiplier = standard_hours_per_week / max(study_hours_per_week, 0.5)
    adjusted_weeks = round(total_weeks * time_multiplier)

    # Build adapted notes
    adaptations = []
    if daily_minutes < 60:
        adaptations.append(
            f"With {daily_minutes} minutes/day, the journey takes approximately "
            f"{adjusted_weeks} weeks instead of {total_weeks} weeks. "
            "Focus on one milestone at a time."
        )
    if no_laptop:
        adaptations.append(
            "Without a laptop: Use a smartphone for most learning. "
            "Prefer video and audio resources. Practical tasks can be done offline."
        )
    if no_internet:
        adaptations.append(
            "Without regular internet: Download resources when connectivity is available. "
            "Focus on hands-on practice between downloads. "
            "Ask your facilitator for offline materials."
        )
    if prefer_vocational and not career.is_vocational:
        adaptations.append(
            f"{career.title} is primarily a digital career. "
            "Consider also exploring vocational pathways such as Electrician or "
            "Agri-Entrepreneur, which have less dependency on continuous internet access."
        )

    # Suggest alternative career if constraints are severe
    alternative = None
    if no_internet and no_laptop and not career.is_vocational:
        alternative_career = db.query(Career).filter(
            Career.is_vocational == True
        ).first()
        if alternative_career:
            alternative = {
                "title": alternative_career.title,
                "slug": alternative_career.slug,
                "reason": "Better suited for limited connectivity and no-laptop scenarios",
            }

    return {
        "career_title": career.title,
        "original_weeks": total_weeks,
        "adjusted_weeks": adjusted_weeks,
        "daily_minutes": daily_minutes,
        "adaptations": adaptations,
        "alternative_pathway": alternative,
        "disclaimer": "These are rough estimates for guidance only. Actual timelines vary significantly.",
    }


@router.post("/voice-query")
def voice_query(
    req: VoiceQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Process a text query (from voice transcription or typed) and return a grounded response.
    Uses keyword matching + retrieval from the careers/opportunities knowledge base.
    This is the local fallback engine — no external LLM required.
    """
    text = req.text.lower()

    # Simple keyword-based routing
    if any(w in text for w in ["career", "kaunsa career", "field", "job karna", "kya banu"]):
        careers = db.query(Career).all()
        career_titles = [c.title for c in careers[:5]]
        answer = (
            f"RaahSetu can guide you across {len(careers)} career pathways including: "
            f"{', '.join(career_titles)}. "
            "After completing your profile, you will receive personalized recommendations. "
            "Would you like to start the career discovery quiz?"
        )
    elif any(w in text for w in ["scholarship", "scholarship ke liye", "paisa", "fees"]):
        scholarships = db.query(Opportunity).filter(
            Opportunity.opportunity_type == "scholarship"
        ).all()
        answer = (
            f"There are {len(scholarships)} scholarship listings in our database. "
            "Please note these are illustrative demo records — verify details at scholarships.gov.in. "
            "Key requirement: Most post-matric scholarships require Class 10 or 12 pass. "
            "Would you like to see the scholarship listings?"
        )
    elif any(w in text for w in ["laptop", "computer nahi", "internet nahi", "phone se"]):
        answer = (
            "You can learn many skills using just a smartphone. "
            "Recommended pathways: Data Entry, Office Administration, Electrician (ITI), "
            "and Agri-Entrepreneurship all have mobile-friendly or hands-on learning options. "
            "RaahSetu will save your progress so you can continue when you have connectivity."
        )
    elif any(w in text for w in ["document", "certificate", "proof"]):
        answer = (
            "Common documents required for most opportunities: "
            "1) Aadhaar card (identity proof), "
            "2) Class 10/12 mark sheets, "
            "3) Caste certificate if applicable, "
            "4) Income certificate if required, "
            "5) Bank account details. "
            "Check each specific opportunity for its exact requirements."
        )
    elif any(w in text for w in ["electrician", "bijli", "wiring"]):
        career = db.query(Career).filter(Career.slug == "electrician").first()
        if career:
            answer = (
                f"Electrician is a promising vocational career. "
                f"You can start with {career.typical_education}. "
                f"The ITI electrician course typically takes about {career.estimated_duration_months} months. "
                "NSDC supports training centres across India. "
                "Shall I show you the learning roadmap?"
            )
        else:
            answer = "I couldn't find electrician career details right now. Please try the career directory."
    elif any(w in text for w in ["hello", "hi", "namaste", "help", "start", "shuru"]):
        answer = (
            "Namaste! I am your RaahSetu career guide. I can help you: "
            "1) Discover suitable careers based on your interests, "
            "2) Find learning roadmaps and free resources, "
            "3) Explore scholarships and training opportunities. "
            "What would you like to know today?"
        )
    else:
        # General fallback
        answer = (
            "I understood your question, but I need more context to give you the best answer. "
            "You can ask me about: careers, scholarships, learning resources, or required documents. "
            "For example: 'What career suits me?' or 'Scholarship ke liye kya chahiye?'"
        )

    return {
        "query": req.text,
        "language": req.language,
        "response": answer,
        "response_type": "local_fallback",
        "note": (
            "This response uses RaahSetu's local knowledge base. "
            "An optional LLM integration can be configured for more nuanced answers."
        ),
        "sources_used": ["careers_database", "opportunities_database"],
    }
