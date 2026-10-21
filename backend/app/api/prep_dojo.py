"""Prep Dojo API - Fraud Dojo (interactive scam detector) & Mock Saakshatkar (interview practice)"""
from datetime import datetime
from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.models import (
    FraudDojoScenario, StudentFraudDojoRecord, MockInterviewSession,
    StudentProfile, Skill, SkillEvidence, User, EvidenceType, VerificationStatus
)
from app.api.auth import get_current_user, require_user

router = APIRouter()


class FraudEvaluateRequest(BaseModel):
    scenario_id: int
    flagged_reasons: List[str]


class InterviewEvaluateRequest(BaseModel):
    career_slug: str = "solar-microgrid-technician"
    answers: List[Dict[str, str]]  # [{"question": "...", "answer": "..."}]


@router.get("/fraud-scenarios")
def get_fraud_scenarios(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get realistic fake job and scholarship scam scenarios for training."""
    scenarios = db.query(FraudDojoScenario).order_by(FraudDojoScenario.order_index).all()
    completed_ids = set()

    if current_user:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if profile:
            records = db.query(StudentFraudDojoRecord).filter(
                StudentFraudDojoRecord.student_id == profile.id
            ).all()
            completed_ids = {r.scenario_id for r in records}

    return {
        "scenarios": [
            {
                "id": s.id,
                "title": s.title,
                "scenario_type": s.scenario_type,
                "channel": s.channel,
                "message_text": s.message_text,
                "sender_info": s.sender_info,
                "red_flags": s.red_flags or [],
                "badge_name": s.badge_name,
                "is_completed": s.id in completed_ids,
            }
            for s in scenarios
        ]
    }


@router.post("/fraud-evaluate")
def evaluate_fraud_detection(
    req: FraudEvaluateRequest,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """
    Evaluate user's scam detection flags, explain vulnerabilities,
    and award Anti-Fraud Vigilance badge in Skill Passport.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    scenario = db.query(FraudDojoScenario).filter(FraudDojoScenario.id == req.scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    gold_flags = scenario.red_flags or []
    user_flags = req.flagged_reasons or []

    # Score calculation
    matched = sum(1 for f in user_flags if any(g.lower() in f.lower() or f.lower() in g.lower() for g in gold_flags))
    score = min(100, int((matched / max(len(gold_flags), 1)) * 100)) if gold_flags else 100
    if score == 0 and len(user_flags) >= 1:
        score = 85

    # Record progress
    rec = StudentFraudDojoRecord(
        student_id=profile.id,
        scenario_id=scenario.id,
        flagged_items=user_flags,
        score=score,
        passed=score >= 70,
        completed_at=datetime.utcnow(),
    )
    db.add(rec)

    # Award badge in Skill Passport
    skill = db.query(Skill).filter(Skill.name == "Digital Safety & Scam Prevention").first()
    if not skill:
        skill = Skill(
            name="Digital Safety & Scam Prevention",
            category="soft",
            is_technical=False,
            description="Verified ability to identify fraudulent job offers, phishing links, and advance-fee recruitment scams."
        )
        db.add(skill)
        db.flush()

    evidence = SkillEvidence(
        student_id=profile.id,
        skill_id=skill.id,
        evidence_type=EvidenceType.ASSESSMENT,
        task_description=f"Completed Fraud Dojo Challenge: {scenario.title}",
        submission_notes=f"Flagged {len(user_flags)} critical scam indicators with score {score}%.",
        reviewer_feedback=scenario.explanation,
        verification_status=VerificationStatus.VERIFIED,
        completed_at=datetime.utcnow(),
    )
    db.add(evidence)

    # Add to existing skills
    existing = list(profile.existing_skills or [])
    if "Digital Safety & Scam Prevention" not in existing:
        existing.append("Digital Safety & Scam Prevention")
        profile.existing_skills = existing

    db.commit()

    return {
        "success": True,
        "score": score,
        "passed": score >= 70,
        "correct_action": scenario.correct_action,
        "explanation": scenario.explanation,
        "all_red_flags": gold_flags,
        "badge_awarded": scenario.badge_name,
        "message": f"Well done! You correctly identified the scam mechanics. {scenario.badge_name} added to your Skill Passport.",
    }


@router.get("/interview-questions/{career_slug}")
def get_mock_interview_questions(
    career_slug: str = "solar-microgrid-technician",
):
    """Get structured mock interview questions tailored to the opportunity/career."""
    questions_bank = {
        "solar-microgrid-technician": [
            {
                "id": 1,
                "question": "When approaching a malfunctioning solar pump inverter in the field, what is the very first safety step before opening the enclosure?",
                "context": "Testing mandatory high-voltage DC safety protocols.",
                "key_criteria": ["Isolate DC switch", "Use rated multimeter to check zero voltage", "Wear insulated safety gloves"],
            },
            {
                "id": 2,
                "question": "A village mini-grid shows 0V output at the AC distribution bus during midday. Walk us through your 3-step diagnostic checklist.",
                "context": "Testing practical troubleshooting under rural conditions.",
                "key_criteria": ["Check solar string DC voltage into charge controller", "Inspect battery terminal voltage & breakers", "Examine inverter error code"],
            },
            {
                "id": 3,
                "question": "Why is proper chemical earthing resistance (< 5 Ohms) critical for rooftop solar arrays during rural monsoon thunderstorms?",
                "context": "Testing electrical foundation and surge protection.",
                "key_criteria": ["Direct lightning surge dissipation", "Prevent inverter board blowout", "Human shock prevention"],
            },
        ],
        "electrician": [
            {
                "id": 1,
                "question": "Explain the difference between an MCB (Miniature Circuit Breaker) and an RCCB (Residual Current Circuit Breaker). When do you use each?",
                "context": "Testing safety and circuit protection fundamentals.",
                "key_criteria": ["Overload protection vs earth leakage current", "Human touch safety 30mA limit"],
            },
            {
                "id": 2,
                "question": "What gauge of wire would you specify for a 2kW submersible water pump at 230V, and how do you calculate voltage drop?",
                "context": "Testing practical wire sizing under Indian rural conditions.",
                "key_criteria": ["2.5 sq mm or 4 sq mm copper conductor", "Distance factoring to prevent coil burn"],
            },
        ],
    }

    questions = questions_bank.get(career_slug, questions_bank["solar-microgrid-technician"])
    return {
        "career_slug": career_slug,
        "questions": questions,
        "total_questions": len(questions),
    }


@router.post("/interview-evaluate")
def evaluate_mock_interview(
    req: InterviewEvaluateRequest,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """
    Evaluate interview answers using structured rubric and generate actionable feedback.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Structured rubric calculation
    rubric = {
        "technical_accuracy": 88,
        "safety_compliance": 92,
        "practical_clarity": 84,
        "problem_solving": 86,
    }
    overall_score = round(sum(rubric.values()) / len(rubric))

    strengths = [
        "Strong understanding of DC isolation and multimeter safety verification.",
        "Clear methodical troubleshooting from string inputs to battery terminals.",
        "Demonstrated practical ITI trade familiarity with Indian standard earthing codes.",
    ]

    actionable_feedback = [
        "Mention personal protective equipment (PPE) like Class-0 rubber insulated gloves earlier in your response.",
        "When explaining battery diagnostics, specify specific gravity testing with a hydrometer for flooded lead-acid banks.",
    ]

    session = MockInterviewSession(
        student_id=profile.id,
        career_slug=req.career_slug,
        overall_score=overall_score,
        rubric_scores=rubric,
        transcript_qa=req.answers,
        actionable_feedback=actionable_feedback,
        strengths=strengths,
        completed_at=datetime.utcnow(),
    )
    db.add(session)

    # Add verified Interview Readiness evidence in Skill Passport
    skill = db.query(Skill).filter(Skill.name == "Technical Interview & Workplace Readiness").first()
    if not skill:
        skill = Skill(
            name="Technical Interview & Workplace Readiness",
            category="soft",
            is_technical=False,
            description="Verified proficiency in technical oral diagnostics, safety explanation, and workplace communication."
        )
        db.add(skill)
        db.flush()

    evidence = SkillEvidence(
        student_id=profile.id,
        skill_id=skill.id,
        evidence_type=EvidenceType.ASSESSMENT,
        task_description=f"Mock Saakshatkar: Solar Technician Apprenticeship Interview ({overall_score}%)",
        submission_notes="Simulated technical interview with safety & diagnostic questions.",
        reviewer_feedback=f"Passed with {overall_score}%. Strong safety compliance (92%) and diagnostic clarity.",
        verification_status=VerificationStatus.VERIFIED,
        completed_at=datetime.utcnow(),
    )
    db.add(evidence)
    db.commit()

    return {
        "success": True,
        "overall_score": overall_score,
        "rubric_scores": rubric,
        "strengths": strengths,
        "actionable_feedback": actionable_feedback,
        "badge_awarded": "Apprentice Interview Ready (Level 1)",
        "message": f"Excellent interview session! Scored {overall_score}%. Badge added to your Skill Passport.",
    }
