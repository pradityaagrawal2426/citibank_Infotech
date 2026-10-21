"""Roadmaps API - learning milestones, resources"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Career, LearningMilestone, LearningResource, Skill, StudentProgress, StudentProfile, User
from app.api.auth import get_current_user

router = APIRouter()


def serialize_milestone(m: LearningMilestone, db: Session, completed_ids: set = None) -> dict:
    skill_names = []
    for skill_id in (m.skills_covered or []):
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if skill:
            skill_names.append(skill.name)

    return {
        "id": m.id,
        "career_id": m.career_id,
        "phase": m.phase.value,
        "title": m.title,
        "description": m.description,
        "order_index": m.order_index,
        "estimated_weeks": m.estimated_weeks,
        "practical_task": m.practical_task,
        "skills_covered": skill_names,
        "is_complete": m.id in (completed_ids or set()),
    }


@router.get("/career/{slug}")
def get_roadmap(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    career = db.query(Career).filter(Career.slug == slug).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")

    milestones = (
        db.query(LearningMilestone)
        .filter(LearningMilestone.career_id == career.id)
        .order_by(LearningMilestone.order_index)
        .all()
    )

    # Get completed milestone IDs for this user
    completed_ids = set()
    if current_user:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if profile:
            progress = db.query(StudentProgress).filter(
                StudentProgress.student_id == profile.id,
                StudentProgress.career_id == career.id,
                StudentProgress.is_complete == True,
            ).all()
            completed_ids = {p.milestone_id for p in progress}

    phases = {"beginner": [], "intermediate": [], "advanced": []}
    for m in milestones:
        phase_key = m.phase.value
        if phase_key in phases:
            phases[phase_key].append(serialize_milestone(m, db, completed_ids))

    total = len(milestones)
    completed = len(completed_ids)

    return {
        "career_id": career.id,
        "career_title": career.title,
        "career_slug": career.slug,
        "total_milestones": total,
        "completed_milestones": completed,
        "completion_rate": round(completed / max(total, 1) * 100, 1),
        "phases": phases,
        "estimated_total_weeks": sum(m.estimated_weeks for m in milestones),
    }


@router.get("/milestone/{milestone_id}")
def get_milestone(
    milestone_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    milestone = db.query(LearningMilestone).filter(LearningMilestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    completed_ids = set()
    if current_user:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if profile:
            progress = db.query(StudentProgress).filter(
                StudentProgress.student_id == profile.id,
                StudentProgress.milestone_id == milestone_id,
                StudentProgress.is_complete == True,
            ).first()
            if progress:
                completed_ids = {milestone_id}

    result = serialize_milestone(milestone, db, completed_ids)

    # Add illustrative resources
    resources = _get_resources_for_skills(milestone.skills_covered or [], db)
    result["resources"] = resources
    return result


def _get_resources_for_skills(skill_ids: list, db: Session) -> list:
    """Generate illustrative resources for milestone skills."""
    # In production, these come from LearningResource table
    # For demo, we return structured illustrative examples
    resources = []
    for skill_id in skill_ids[:2]:
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if skill:
            if skill.category == "tech":
                resources.append({
                    "title": f"[DEMO] Introduction to {skill.name}",
                    "type": "video",
                    "provider": "SWAYAM/NPTEL (Illustrative)",
                    "url": "https://swayam.gov.in",
                    "duration_minutes": 45,
                    "is_free": True,
                    "works_on_mobile": True,
                    "is_demo": True,
                })
            elif skill.category == "vocational":
                resources.append({
                    "title": f"[DEMO] {skill.name} Practice Guide",
                    "type": "article",
                    "provider": "NSDC (Illustrative)",
                    "url": "https://nsdcindia.org",
                    "duration_minutes": 30,
                    "is_free": True,
                    "works_on_mobile": True,
                    "is_demo": True,
                })
            else:
                resources.append({
                    "title": f"[DEMO] {skill.name} Basics",
                    "type": "article",
                    "provider": "Illustrative Resource",
                    "url": None,
                    "duration_minutes": 20,
                    "is_free": True,
                    "works_on_mobile": True,
                    "is_demo": True,
                })
    return resources
