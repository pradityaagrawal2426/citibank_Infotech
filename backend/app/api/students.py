"""Students API - profile, onboarding, progress, skill passport"""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.models import (
    StudentProfile, StudentProgress, SkillEvidence,
    LearningMilestone, Skill, User, StudentHelpRequest,
    StudentCareerSelection, EvidenceType, VerificationStatus
)
from app.api.auth import get_current_user, require_user

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class OnboardingData(BaseModel):
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    education_level: str
    education_stream: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    interests: List[str] = []
    existing_skills: List[str] = []
    aspirations: Optional[str] = None
    has_smartphone: bool = True
    has_internet: bool = True
    has_laptop: bool = False
    daily_study_minutes: int = 60
    financial_constraints: bool = False
    preferred_language: str = "en"


class ProgressUpdate(BaseModel):
    milestone_id: int
    career_id: int
    is_complete: bool
    notes: Optional[str] = None


class SkillEvidenceCreate(BaseModel):
    skill_id: int
    evidence_type: str = "self_reported"
    task_description: Optional[str] = None
    submission_url: Optional[str] = None
    submission_notes: Optional[str] = None


class HelpRequestCreate(BaseModel):
    topic: str
    message: str


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/onboarding")
def complete_onboarding(
    data: OnboardingData,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in data.model_dump().items():
        setattr(profile, field, value)
    profile.onboarding_complete = True
    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return {"message": "Onboarding complete", "profile_id": profile.id}


@router.get("/profile")
def get_profile(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _serialize_profile(profile)


@router.get("/profile/{user_id}")
def get_profile_by_id(
    user_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    # Allow self, facilitators, admins
    from app.models.models import UserRole
    if current_user.id != user_id and current_user.role not in [UserRole.FACILITATOR, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _serialize_profile(profile)


def _serialize_profile(profile: StudentProfile) -> dict:
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "full_name": profile.full_name,
        "age": profile.age,
        "gender": profile.gender,
        "education_level": profile.education_level,
        "education_stream": profile.education_stream,
        "state": profile.state,
        "district": profile.district,
        "interests": profile.interests or [],
        "existing_skills": profile.existing_skills or [],
        "aspirations": profile.aspirations,
        "has_smartphone": profile.has_smartphone,
        "has_internet": profile.has_internet,
        "has_laptop": profile.has_laptop,
        "daily_study_minutes": profile.daily_study_minutes,
        "financial_constraints": profile.financial_constraints,
        "preferred_language": profile.preferred_language,
        "onboarding_complete": profile.onboarding_complete,
        "created_at": profile.created_at.isoformat(),
    }


@router.post("/progress")
def update_progress(
    data: ProgressUpdate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    existing = db.query(StudentProgress).filter(
        StudentProgress.student_id == profile.id,
        StudentProgress.milestone_id == data.milestone_id,
    ).first()

    if existing:
        existing.is_complete = data.is_complete
        existing.notes = data.notes
        if data.is_complete and not existing.completion_date:
            existing.completion_date = datetime.utcnow()
    else:
        progress = StudentProgress(
            student_id=profile.id,
            milestone_id=data.milestone_id,
            career_id=data.career_id,
            is_complete=data.is_complete,
            notes=data.notes,
            completion_date=datetime.utcnow() if data.is_complete else None,
        )
        db.add(progress)

    db.commit()
    return {"message": "Progress updated"}


@router.get("/progress/{career_id}")
def get_progress(
    career_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        return {"milestones": [], "completion_rate": 0}

    progress_records = db.query(StudentProgress).filter(
        StudentProgress.student_id == profile.id,
        StudentProgress.career_id == career_id,
    ).all()

    total_milestones = db.query(LearningMilestone).filter(
        LearningMilestone.career_id == career_id
    ).count()

    completed_ids = {p.milestone_id for p in progress_records if p.is_complete}
    completion_rate = len(completed_ids) / max(total_milestones, 1) * 100

    return {
        "completed_milestone_ids": list(completed_ids),
        "total_milestones": total_milestones,
        "completion_rate": round(completion_rate, 1),
    }


@router.post("/skill-evidence")
def add_skill_evidence(
    data: SkillEvidenceCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    skill = db.query(Skill).filter(Skill.id == data.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    evidence = SkillEvidence(
        student_id=profile.id,
        skill_id=data.skill_id,
        evidence_type=EvidenceType(data.evidence_type),
        task_description=data.task_description,
        submission_url=data.submission_url,
        submission_notes=data.submission_notes,
        verification_status=VerificationStatus.PENDING if data.submission_url else VerificationStatus.UNVERIFIED,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return {
        "id": evidence.id,
        "skill_name": skill.name,
        "evidence_type": evidence.evidence_type.value,
        "verification_status": evidence.verification_status.value,
        "completed_at": evidence.completed_at.isoformat(),
    }


@router.get("/skill-passport")
def get_skill_passport(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    evidences = db.query(SkillEvidence).filter(
        SkillEvidence.student_id == profile.id
    ).all()

    result = []
    for ev in evidences:
        skill = db.query(Skill).filter(Skill.id == ev.skill_id).first()
        result.append({
            "id": ev.id,
            "skill_id": ev.skill_id,
            "skill_name": skill.name if skill else "Unknown",
            "skill_category": skill.category if skill else "",
            "evidence_type": ev.evidence_type.value,
            "task_description": ev.task_description,
            "submission_url": ev.submission_url,
            "submission_notes": ev.submission_notes,
            "reviewer_feedback": ev.reviewer_feedback,
            "verification_status": ev.verification_status.value,
            "completed_at": ev.completed_at.isoformat(),
        })

    return {
        "student_name": profile.full_name,
        "total_skills": len(result),
        "verified_skills": sum(1 for e in result if e["verification_status"] == "verified"),
        "self_reported": sum(1 for e in result if e["evidence_type"] == "self_reported"),
        "evidences": result,
    }


@router.post("/help-request")
def create_help_request(
    data: HelpRequestCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    req = StudentHelpRequest(
        student_id=profile.id,
        topic=data.topic,
        message=data.message,
    )
    db.add(req)
    db.commit()
    return {"message": "Help request submitted", "id": req.id}


@router.get("/selected-careers")
def get_selected_careers(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        return {"careers": []}

    selections = db.query(StudentCareerSelection).filter(
        StudentCareerSelection.student_id == profile.id
    ).all()

    result = []
    for sel in selections:
        result.append({
            "id": sel.id,
            "career_id": sel.career_id,
            "career_title": sel.career.title if sel.career else "",
            "career_slug": sel.career.slug if sel.career else "",
            "match_score": sel.match_score,
            "match_reasons": sel.match_reasons or [],
            "is_primary": sel.is_primary,
            "selected_at": sel.selected_at.isoformat(),
        })

    return {"careers": result}


@router.post("/select-career/{career_id}")
def select_career(
    career_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    from app.models.models import Career
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    career = db.query(Career).filter(Career.id == career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")

    existing = db.query(StudentCareerSelection).filter(
        StudentCareerSelection.student_id == profile.id,
        StudentCareerSelection.career_id == career_id,
    ).first()

    if not existing:
        sel = StudentCareerSelection(
            student_id=profile.id,
            career_id=career_id,
            match_score=0.5,
            match_reasons=["Manually selected by student"],
            is_primary=True,
        )
        db.add(sel)
        db.commit()
        return {"message": "Career selected", "career_title": career.title}
    return {"message": "Already selected", "career_title": career.title}
