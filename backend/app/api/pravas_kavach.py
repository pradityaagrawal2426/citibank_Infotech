"""Pravas Kavach API - Migration safety, employer/hostel audit, emergency network & transition tracking"""
from datetime import datetime
from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.models import (
    PravasKavachRecord, Opportunity, StudentProfile, User, SavedOpportunity
)
from app.api.auth import get_current_user, require_user

router = APIRouter()


class ChecklistUpdateRequest(BaseModel):
    checklist_status: Dict[str, bool]


@router.get("/plan/{opportunity_id}")
def get_migration_plan(
    opportunity_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """Get migration safety dossier and buddy support for an opportunity."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    plan = db.query(PravasKavachRecord).filter(
        PravasKavachRecord.student_id == profile.id,
        PravasKavachRecord.opportunity_id == opp.id
    ).first()

    default_checklist = {
        "train_ticket": True,
        "identity_docs": True,
        "safety_gear": True,
        "emergency_cash": True,
        "hostel_booking": True,
        "family_consent": True,
    }

    if not plan:
        plan = PravasKavachRecord(
            student_id=profile.id,
            opportunity_id=opp.id,
            destination_city="Pune, Maharashtra",
            employer_name=opp.provider,
            workplace_audit_status="Verified (Grade A Safety)",
            workplace_audit_notes="Physical audit verified by District Skill Mission. CCTV at entrance, female shift supervisors present, registered bus transport.",
            accommodation_name="Suman Mahila Working Women & Apprentice PG Hostel",
            accommodation_address="Plot 14, Near Kharadi EON IT Park Bypass, Pune 411014",
            accommodation_verified=True,
            warden_contact="Mrs. Rekha Patil",
            warden_phone="+91 98221 44501",
            emergency_contacts=[
                {"name": "National Women's Helpline (24x7)", "phone": "181", "type": "National Emergency"},
                {"name": "National Police Emergency", "phone": "112", "type": "Emergency"},
                {"name": "RaahSetu Student Pravas Desk", "phone": "+91 800-722-4738", "type": "Platform Desk"},
                {"name": "Mrs. Anjali Deshmukh (Pune District Facilitator)", "phone": "+91 98450 12345", "type": "Local Mentor"},
            ],
            checklist_status=default_checklist,
            buddy_assigned_name="Sunita D. (Senior ITI Apprentice, Batch 2023)",
            buddy_phone="+91 98234 11029",
            buddy_checkins=[
                {"stage": "Day -1 (Pre-departure)", "status": "Completed", "note": "Checked luggage, train berth, original ITI certificate"},
                {"stage": "Day 1 (Arrival at Pune Junction)", "status": "Completed", "note": "Met auto prepaid counter, arrived at Suman PG safely"},
                {"stage": "Day 7 (First Week on Shift)", "status": "Upcoming", "note": "Weekly check-in on workplace safety & tool assignment"},
                {"stage": "Day 30 (Stipend & Waiver)", "status": "Scheduled", "note": "Confirm ₹12,000 stipend credit & bridge grant waiver certificate"},
            ],
            has_joined=False,
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

    total_items = len(plan.checklist_status or default_checklist)
    completed_items = sum(1 for v in (plan.checklist_status or {}).values() if v)
    progress_pct = round((completed_items / max(total_items, 1)) * 100)

    return {
        "id": plan.id,
        "destination_city": plan.destination_city,
        "employer_name": plan.employer_name,
        "workplace_audit_status": plan.workplace_audit_status,
        "workplace_audit_notes": plan.workplace_audit_notes,
        "accommodation": {
            "name": plan.accommodation_name,
            "address": plan.accommodation_address,
            "verified": plan.accommodation_verified,
            "warden_contact": plan.warden_contact,
            "warden_phone": plan.warden_phone,
            "distance_to_work": "2.1 km (Direct auto/bus line)",
            "safety_rating": "4.8 / 5 (38 verified rural apprentices accommodated)",
        },
        "emergency_contacts": plan.emergency_contacts or [],
        "checklist_status": plan.checklist_status or default_checklist,
        "checklist_progress_pct": progress_pct,
        "buddy": {
            "name": plan.buddy_assigned_name,
            "phone": plan.buddy_phone,
            "role": "Peer Support Apprentice & Kharadi Resident",
            "checkins": plan.buddy_checkins or [],
        },
        "has_joined": plan.has_joined,
        "joined_date": plan.joined_date.strftime("%d %b %Y") if plan.joined_date else None,
        "disclaimer": "Emergency contacts and verification details are demo simulations; in live production, local district helplines and verified NGO networks provide physical response.",
    }


@router.post("/update-checklist/{opportunity_id}")
def update_checklist(
    opportunity_id: int,
    req: ChecklistUpdateRequest,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """Update migration checklist items."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    plan = db.query(PravasKavachRecord).filter(
        PravasKavachRecord.student_id == profile.id,
        PravasKavachRecord.opportunity_id == opportunity_id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Migration plan not found")

    plan.checklist_status = req.checklist_status
    plan.updated_at = datetime.utcnow()
    db.commit()

    completed = sum(1 for v in req.checklist_status.values() if v)
    total = len(req.checklist_status)
    return {
        "success": True,
        "checklist_status": plan.checklist_status,
        "progress_pct": round((completed / max(total, 1)) * 100),
    }


@router.post("/confirm-joined/{opportunity_id}")
def confirm_joined(
    opportunity_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """Confirm student has successfully joined the opportunity."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    plan = db.query(PravasKavachRecord).filter(
        PravasKavachRecord.student_id == profile.id,
        PravasKavachRecord.opportunity_id == opportunity_id
    ).first()
    if plan:
        plan.has_joined = True
        plan.joined_date = datetime.utcnow()
        plan.updated_at = datetime.utcnow()

    # Update or create saved opportunity status
    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.student_id == profile.id,
        SavedOpportunity.opportunity_id == opportunity_id
    ).first()
    if not saved:
        saved = SavedOpportunity(
            student_id=profile.id,
            opportunity_id=opportunity_id,
            status="joined",
            saved_at=datetime.utcnow()
        )
        db.add(saved)
    else:
        saved.status = "joined"

    db.commit()

    return {
        "success": True,
        "has_joined": True,
        "joined_date": datetime.utcnow().strftime("%d %b %Y"),
        "message": "Congratulations! You have confirmed joining the apprenticeship. Your transition journey is complete!",
    }
