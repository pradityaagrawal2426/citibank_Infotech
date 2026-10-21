"""Demo Control API - 1-Click Reset to pristine Priya state & Guided Tour tracking"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db, Base, engine
from app.services.seed import seed_database, _seed_all
from app.models.models import (
    User, StudentProfile, StudentWallet, MicroGigSubmission,
    BridgeFundingRequest, PravasKavachRecord, SavedOpportunity,
    StudentFraudDojoRecord, MockInterviewSession
)
from app.api.auth import get_current_user

router = APIRouter()


@router.post("/reset")
def reset_demo(db: Session = Depends(get_db)):
    """
    Reset entire database to the pristine Priya demo state.
    Drops and recreates all tables and re-executes seed_database.
    """
    try:
        # Drop all tables and recreate
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        _seed_all(db)
        return {
            "success": True,
            "message": "Demo reset complete! Pristine Priya state and all seed records reloaded.",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Reset error: {str(e)}")


@router.get("/guided-tour-status")
def get_guided_tour_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the completion status of the 4 Guided Tour Acts for Priya:
    Act 1: Discover Local Demand (Solar Microgrid)
    Act 2: Earn & Prove (Completed Micro-gig)
    Act 3: Pehla Kadam Bridge (₹8,000 Bridge Funded)
    Act 4: Pravas Kavach & Safe Transition (Checklist & Joining Confirmed)
    """
    if not current_user:
        return {
            "act_1_demand": True,
            "act_2_microgig": True,
            "act_3_bridge": False,
            "act_4_transition": False,
            "current_act": 3,
        }

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        return {"current_act": 1}

    # Act 2: check if any micro-gig completed
    gig_completed = db.query(MicroGigSubmission).filter(
        MicroGigSubmission.student_id == profile.id,
        MicroGigSubmission.status == "approved"
    ).count() > 0

    # Act 3: check if bridge funding requested
    bridge_done = db.query(BridgeFundingRequest).filter(
        BridgeFundingRequest.student_id == profile.id
    ).count() > 0

    # Act 4: check if joined or checklist completed
    pravas = db.query(PravasKavachRecord).filter(
        PravasKavachRecord.student_id == profile.id
    ).first()
    has_joined = pravas.has_joined if pravas else False

    current_act = 1
    if not gig_completed:
        current_act = 2
    elif not bridge_done:
        current_act = 3
    elif not has_joined:
        current_act = 4
    else:
        current_act = 5  # Completed all acts!

    return {
        "act_1_demand": True,
        "act_2_microgig": gig_completed,
        "act_3_bridge": bridge_done,
        "act_4_transition": has_joined,
        "current_act": current_act,
        "student_name": profile.full_name or "Priya Sharma",
        "has_joined": has_joined,
    }
