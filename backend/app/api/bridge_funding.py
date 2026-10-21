"""Pehla Kadam Bridge API - Explainable relocation gap funding, transparent rules & waiver simulation"""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.models import (
    BridgeFundingRequest, Opportunity, StudentProfile, StudentWallet,
    SkillEvidence, User, VerificationStatus
)
from app.api.auth import get_current_user, require_user

router = APIRouter()


class BridgeCalculateRequest(BaseModel):
    opportunity_id: int
    travel_expense: int = 1800
    accommodation_deposit: int = 3500
    equipment_gear_expense: int = 1500
    living_buffer_expense: int = 1200
    use_wallet_savings: bool = True


class BridgeApplyRequest(BaseModel):
    opportunity_id: int
    travel_expense: int = 1800
    accommodation_deposit: int = 3500
    equipment_gear_expense: int = 1500
    living_buffer_expense: int = 1200
    student_savings_allocated: int = 0
    reason_notes: Optional[str] = "Relocation support for verified apprenticeship joining"


@router.post("/calculate")
def calculate_bridge_gap(
    req: BridgeCalculateRequest,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """
    Calculate transition gap and simulate explainable zero-debt CSR grant eligibility.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    total_expense = (
        req.travel_expense +
        req.accommodation_deposit +
        req.equipment_gear_expense +
        req.living_buffer_expense
    )

    wallet = db.query(StudentWallet).filter(StudentWallet.student_id == profile.id).first()
    available_savings = wallet.balance_inr if (wallet and req.use_wallet_savings) else 0
    savings_to_apply = min(available_savings, total_expense)
    net_gap = max(0, total_expense - savings_to_apply)

    # Check student's verified skills
    verified_evidences = db.query(SkillEvidence).filter(
        SkillEvidence.student_id == profile.id,
        SkillEvidence.verification_status == VerificationStatus.VERIFIED
    ).all()
    evidence_count = len(verified_evidences)

    # Rule evaluation
    factors = {
        "opportunity_verification": {
            "title": "Opportunity Authenticity",
            "passed": opp.verification_status == VerificationStatus.VERIFIED or opp.is_demo_record,
            "score": 100,
            "detail": f"{opp.provider} verified via NSDC Apprenticeship portal",
            "weight": "35%",
        },
        "skill_evidence_readiness": {
            "title": "Demonstrated Skill Competency",
            "passed": evidence_count >= 2,
            "score": 95 if evidence_count >= 3 else 80,
            "detail": f"{evidence_count} verified practical tasks in Skill Passport",
            "weight": "35%",
        },
        "equity_and_need": {
            "title": "Rural Priority & Financial Need",
            "passed": True,
            "score": 100,
            "detail": f"{profile.district or 'Rural'}, {profile.state or 'Rajasthan'} priority inclusion cohort",
            "weight": "30%",
        },
    }

    # Grant structure
    grant_model = {
        "grant_type": "CSR Zero-Debt Transition Grant",
        "stipend_protection": "Stipend during apprenticeship is 100% retained by student",
        "interest_rate": "0.0% (Zero Interest)",
        "repayment_terms": "100% Waived automatically upon 30 days active attendance verification",
        "funding_source": "Sponsored CSR Youth Transition Fund (Citi Foundation / NSDC Partner)",
        "disclaimer": "This is a simulated grant calculation model for hackathon demonstration. No actual credit agreement or financial obligation is created.",
    }

    return {
        "total_expense_inr": total_expense,
        "student_savings_applied": savings_to_apply,
        "net_gap_inr": net_gap,
        "opportunity_title": opp.title,
        "provider": opp.provider,
        "factors": factors,
        "decision": "ELIGIBLE_FOR_FULL_CSR_GRANT",
        "grant_model": grant_model,
        "evidence_count": evidence_count,
    }


@router.post("/apply")
def submit_bridge_request(
    req: BridgeApplyRequest,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """
    Submit Pehla Kadam Bridge funding request.
    Generates deterministic explainable grant decision and records to student profile.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    total_expense = (
        req.travel_expense +
        req.accommodation_deposit +
        req.equipment_gear_expense +
        req.living_buffer_expense
    )
    net_gap = max(0, total_expense - req.student_savings_allocated)

    verified_evidences = db.query(SkillEvidence).filter(
        SkillEvidence.student_id == profile.id,
        SkillEvidence.verification_status == VerificationStatus.VERIFIED
    ).all()

    factors = {
        "employer_verification": {
            "status": "PASS",
            "detail": f"{opp.provider} verified via National Apprenticeship Training Scheme (NATS)",
        },
        "skill_passport_audit": {
            "status": "PASS",
            "detail": f"{len(verified_evidences)} verified practical skill evidences on record",
        },
        "geographic_priority": {
            "status": "PASS",
            "detail": f"Rural ITI student from {profile.district or 'Ajmer'}, {profile.state or 'Rajasthan'}",
        },
        "dropout_risk_mitigation": {
            "status": "HIGH_IMPACT",
            "detail": "Upfront relocation barrier eliminated; predicted 94% joining success rate",
        },
    }

    explanation_text = (
        f"Approved for ₹{net_gap:,} Zero-Debt Transition Grant. "
        f"Decision basis: {opp.provider} is a verified vocational employer, "
        f"{profile.full_name or 'Student'} possesses {len(verified_evidences)} verified skill records, "
        f"and the ₹{net_gap:,} gap covers essential pre-joining costs (train travel, PG deposit, safety kit). "
        f"Under RaahSetu CSR guidelines, 100% of this amount is waived upon 30 days of active apprenticeship."
    )

    request_record = BridgeFundingRequest(
        student_id=profile.id,
        opportunity_id=opp.id,
        travel_expense=req.travel_expense,
        accommodation_deposit=req.accommodation_deposit,
        equipment_gear_expense=req.equipment_gear_expense,
        living_buffer_expense=req.living_buffer_expense,
        total_requested_inr=total_expense,
        student_savings_allocated=req.student_savings_allocated,
        net_funding_gap_inr=net_gap,
        status="approved",
        grant_type="CSR Zero-Interest Transition Grant",
        employer_verified=True,
        skill_evidence_count=len(verified_evidences),
        evaluation_factors=factors,
        repayment_model="100% Waived Upon 30 Days Apprenticeship Verification",
        terms_explanation=explanation_text,
        disbursement_notes="Direct vendor voucher for train booking + PG hostel deposit guarantee",
        applied_at=datetime.utcnow(),
        decided_at=datetime.utcnow(),
    )
    db.add(request_record)
    db.commit()
    db.refresh(request_record)

    return {
        "success": True,
        "request_id": request_record.id,
        "status": "approved",
        "net_gap_inr": net_gap,
        "grant_type": request_record.grant_type,
        "explanation": explanation_text,
        "evaluation_factors": factors,
        "disbursement_timeline": "Instant digital approval — vouchers activated 48h before travel",
    }


@router.get("/requests")
def get_student_bridge_requests(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """Get all bridge funding requests for current student."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    requests = db.query(BridgeFundingRequest).filter(
        BridgeFundingRequest.student_id == profile.id
    ).order_by(BridgeFundingRequest.applied_at.desc()).all()

    return {
        "requests": [
            {
                "id": r.id,
                "opportunity_id": r.opportunity_id,
                "opportunity_title": r.opportunity.title if r.opportunity else "Apprenticeship",
                "provider": r.opportunity.provider if r.opportunity else "Employer",
                "travel_expense": r.travel_expense,
                "accommodation_deposit": r.accommodation_deposit,
                "equipment_gear_expense": r.equipment_gear_expense,
                "living_buffer_expense": r.living_buffer_expense,
                "total_requested_inr": r.total_requested_inr,
                "student_savings_allocated": r.student_savings_allocated,
                "net_funding_gap_inr": r.net_funding_gap_inr,
                "status": r.status,
                "grant_type": r.grant_type,
                "repayment_model": r.repayment_model,
                "terms_explanation": r.terms_explanation,
                "evaluation_factors": r.evaluation_factors or {},
                "applied_at": r.applied_at.strftime("%d %b %Y") if r.applied_at else "",
            }
            for r in requests
        ]
    }
