"""Opportunities API - listing, filtering, eligibility, trust signals"""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import (
    Opportunity, StudentProfile, User, OpportunityType,
    VerificationStatus
)
from app.api.auth import get_current_user

router = APIRouter()


def serialize_opportunity(opp: Opportunity) -> dict:
    return {
        "id": opp.id,
        "title": opp.title,
        "provider": opp.provider,
        "opportunity_type": opp.opportunity_type.value,
        "description": opp.description,
        "location": opp.location,
        "is_remote": opp.is_remote,
        "min_education": opp.min_education,
        "max_age": opp.max_age,
        "min_age": opp.min_age,
        "required_skills": opp.required_skills or [],
        "eligible_states": opp.eligible_states or [],
        "stipend_amount": opp.stipend_amount,
        "award_amount": opp.award_amount,
        "is_free": opp.is_free,
        "cost_inr": opp.cost_inr,
        "application_deadline": opp.application_deadline.isoformat() if opp.application_deadline else None,
        "application_url": opp.application_url,
        "verification_status": opp.verification_status.value,
        "last_verified_at": opp.last_verified_at.isoformat() if opp.last_verified_at else None,
        "is_demo_record": opp.is_demo_record,
        "trust_score": opp.trust_score,
        "trust_signals": opp.trust_signals or {},
        "tags": opp.tags or [],
        "career_id": opp.career_id,
        "duration_months": opp.duration_months,
        "is_active": opp.is_active,
    }


def check_eligibility(opp: Opportunity, profile: Optional[StudentProfile]) -> dict:
    """Run rule-based eligibility check."""
    if not profile:
        return {"status": "unknown", "reasons": ["Log in to check your eligibility"]}

    issues = []
    passed = []

    # Education check
    edu_order = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Diploma", "Graduate", "Postgraduate"]
    if opp.min_education and opp.min_education != "None":
        profile_idx = next((i for i, e in enumerate(edu_order) if e.lower() in (profile.education_level or "").lower()), -1)
        required_idx = next((i for i, e in enumerate(edu_order) if e.lower() in opp.min_education.lower()), -1)
        if profile_idx >= required_idx:
            passed.append(f"Meets education requirement ({opp.min_education})")
        else:
            issues.append(f"Requires minimum {opp.min_education}")

    # Age check
    if opp.min_age and profile.age and profile.age < opp.min_age:
        issues.append(f"Minimum age {opp.min_age} years required")
    elif opp.min_age and profile.age:
        passed.append(f"Meets age requirement ({opp.min_age}+)")

    if opp.max_age and profile.age and profile.age > opp.max_age:
        issues.append(f"Maximum age {opp.max_age} years")
    elif opp.max_age and profile.age:
        passed.append(f"Within age limit (under {opp.max_age})")

    # State eligibility
    if opp.eligible_states and profile.state:
        if profile.state not in opp.eligible_states:
            issues.append(f"Currently open for: {', '.join(opp.eligible_states[:3])}")
        else:
            passed.append(f"{profile.state} is eligible")

    # Skill requirements
    required_skills = opp.required_skills or []
    if required_skills:
        student_skills = profile.existing_skills or []
        missing_skills = [s for s in required_skills if s not in student_skills]
        if missing_skills:
            issues.append(f"Missing required skill(s): {', '.join(missing_skills)}")
        else:
            passed.append("Has all required skills")

    if not issues:
        status = "eligible"
    elif len(issues) <= 1 and len(passed) >= 1:
        status = "potentially_eligible"
    else:
        status = "check_required" if not passed else "partially_eligible"

    return {
        "status": status,
        "passed_checks": passed,
        "issues": issues,
        "missing_info": [],
    }


@router.get("/")
def list_opportunities(
    opp_type: Optional[str] = None,
    career_id: Optional[int] = None,
    is_free: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Opportunity).filter(Opportunity.is_active == True)
    if opp_type:
        try:
            q = q.filter(Opportunity.opportunity_type == OpportunityType(opp_type))
        except ValueError:
            pass
    if career_id:
        q = q.filter(Opportunity.career_id == career_id)
    if is_free is not None:
        q = q.filter(Opportunity.is_free == is_free)

    opportunities = q.all()

    # Get profile for eligibility hints
    profile = None
    if current_user:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()

    result = []
    for opp in opportunities:
        o = serialize_opportunity(opp)
        o["eligibility"] = check_eligibility(opp, profile)
        result.append(o)

    # Sort by trust score desc
    result.sort(key=lambda x: x["trust_score"], reverse=True)
    return result


@router.get("/{opp_id}")
def get_opportunity(
    opp_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Opportunity not found")

    profile = None
    if current_user:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()

    result = serialize_opportunity(opp)
    result["eligibility"] = check_eligibility(opp, profile)

    # Build action checklist
    checklist = []
    eligibility = result["eligibility"]
    if eligibility["issues"]:
        for issue in eligibility["issues"]:
            checklist.append({"action": f"Address: {issue}", "done": False, "type": "prerequisite"})
    if opp.application_url:
        checklist.append({"action": "Visit the application link", "done": False, "type": "apply"})
    else:
        checklist.append({"action": "Contact the provider directly for application details", "done": False, "type": "apply"})
    if opp.application_deadline:
        checklist.append({
            "action": f"Apply before {opp.application_deadline.strftime('%d %b %Y')}",
            "done": False,
            "type": "deadline"
        })
    checklist.append({"action": "Prepare required documents (ID proof, mark sheets, etc.)", "done": False, "type": "document"})

    result["action_checklist"] = checklist
    return result


@router.get("/matched/for-me")
def get_matched_opportunities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.models import StudentCareerSelection
    profile = None
    selected_career_ids = []

    if current_user:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if profile:
            selections = db.query(StudentCareerSelection).filter(
                StudentCareerSelection.student_id == profile.id
            ).all()
            selected_career_ids = [s.career_id for s in selections]

    all_opps = db.query(Opportunity).filter(Opportunity.is_active == True).all()

    scored = []
    for opp in all_opps:
        rel_score = 0.5  # base
        if opp.career_id and opp.career_id in selected_career_ids:
            rel_score = 0.9
        elif opp.opportunity_type == OpportunityType.SCHOLARSHIP:
            rel_score = 0.7  # scholarships are broadly relevant

        eligibility = check_eligibility(opp, profile)
        if eligibility["status"] == "eligible":
            rel_score += 0.1
        elif eligibility["status"] == "potentially_eligible":
            rel_score += 0.05

        o = serialize_opportunity(opp)
        o["eligibility"] = eligibility
        o["relevance_score"] = round(rel_score, 2)
        scored.append(o)

    scored.sort(key=lambda x: (x["relevance_score"], x["trust_score"]), reverse=True)
    return scored
