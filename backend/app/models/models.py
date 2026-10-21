"""SQLAlchemy ORM models for RaahSetu"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean,
    DateTime, ForeignKey, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACILITATOR = "facilitator"
    ADMIN = "admin"


class VerificationStatus(str, enum.Enum):
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    PENDING = "pending"
    FLAGGED = "flagged"


class OpportunityType(str, enum.Enum):
    SCHOLARSHIP = "scholarship"
    GOVERNMENT_SCHEME = "government_scheme"
    VOCATIONAL_TRAINING = "vocational_training"
    COURSE = "course"
    CERTIFICATION = "certification"
    APPRENTICESHIP = "apprenticeship"
    INTERNSHIP = "internship"
    JOB = "job"


class SkillLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class EvidenceType(str, enum.Enum):
    SELF_REPORTED = "self_reported"
    PROJECT = "project"
    ASSESSMENT = "assessment"
    MENTOR_VERIFIED = "mentor_verified"
    CERTIFICATE = "certificate"


# ─── User & Auth ──────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, nullable=True)
    username = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(SAEnum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    preferred_language = Column(String(20), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    facilitator_cohorts = relationship("FacilitatorCohort", back_populates="facilitator")


# ─── Student Profile ──────────────────────────────────────────────────────────

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String(200))
    age = Column(Integer, nullable=True)
    gender = Column(String(30), nullable=True)
    education_level = Column(String(100))
    education_stream = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)

    # Interests, skills, aspirations (JSON arrays)
    interests = Column(JSON, default=list)
    existing_skills = Column(JSON, default=list)
    aspirations = Column(String(500), nullable=True)

    # Constraints
    has_smartphone = Column(Boolean, default=True)
    has_internet = Column(Boolean, default=True)
    has_laptop = Column(Boolean, default=False)
    daily_study_minutes = Column(Integer, default=60)
    financial_constraints = Column(Boolean, default=False)

    # Preferred language
    preferred_language = Column(String(20), default="en")

    # Onboarding status
    onboarding_complete = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    progress_records = relationship("StudentProgress", back_populates="student")
    skill_evidences = relationship("SkillEvidence", back_populates="student")
    help_requests = relationship("StudentHelpRequest", back_populates="student")
    selected_careers = relationship("StudentCareerSelection", back_populates="student")
    wallet = relationship("StudentWallet", back_populates="student", uselist=False)
    gig_submissions = relationship("MicroGigSubmission", back_populates="student")
    bridge_requests = relationship("BridgeFundingRequest", back_populates="student")
    pravas_plans = relationship("PravasKavachRecord", back_populates="student")
    fraud_records = relationship("StudentFraudDojoRecord", back_populates="student")
    interview_sessions = relationship("MockInterviewSession", back_populates="student")
    saved_opportunities = relationship("SavedOpportunity", back_populates="student")


# ─── Career ───────────────────────────────────────────────────────────────────

class Career(Base):
    __tablename__ = "careers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True)
    slug = Column(String(200), unique=True, index=True)
    category = Column(String(100))  # STEM, Vocational, Healthcare, etc.
    description = Column(Text)
    short_description = Column(String(300))
    typical_education = Column(String(200))
    estimated_duration_months = Column(Integer)
    salary_range_min = Column(Integer, nullable=True)   # INR/month, indicative only
    salary_range_max = Column(Integer, nullable=True)
    salary_label = Column(String(100), nullable=True)
    work_environment = Column(String(100))
    growth_potential = Column(String(50))   # low/medium/high
    icon_name = Column(String(50), default="Briefcase")
    is_vocational = Column(Boolean, default=False)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    skills = relationship("CareerSkill", back_populates="career")
    milestones = relationship("LearningMilestone", back_populates="career")
    opportunities = relationship("Opportunity", back_populates="career")
    student_selections = relationship("StudentCareerSelection", back_populates="career")


class StudentCareerSelection(Base):
    __tablename__ = "student_career_selections"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    career_id = Column(Integer, ForeignKey("careers.id"))
    match_score = Column(Float, default=0.0)
    match_reasons = Column(JSON, default=list)
    is_primary = Column(Boolean, default=False)
    selected_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="selected_careers")
    career = relationship("Career", back_populates="student_selections")


# ─── Skills ───────────────────────────────────────────────────────────────────

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100))
    is_technical = Column(Boolean, default=True)

    career_skills = relationship("CareerSkill", back_populates="skill")
    evidences = relationship("SkillEvidence", back_populates="skill")


class CareerSkill(Base):
    __tablename__ = "career_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("careers.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    importance = Column(String(20), default="required")  # required / recommended
    level_required = Column(SAEnum(SkillLevel), default=SkillLevel.BEGINNER)
    milestone_phase = Column(String(20), default="beginner")

    career = relationship("Career", back_populates="skills")
    skill = relationship("Skill", back_populates="career_skills")


# ─── Learning Resources & Milestones ─────────────────────────────────────────

class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300))
    description = Column(Text, nullable=True)
    resource_type = Column(String(50))   # video, article, course, practice, book
    url = Column(String(500), nullable=True)
    provider = Column(String(200), nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    is_free = Column(Boolean, default=True)
    works_offline = Column(Boolean, default=False)
    works_on_mobile = Column(Boolean, default=True)
    language = Column(String(20), default="en")
    is_demo_resource = Column(Boolean, default=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class LearningMilestone(Base):
    __tablename__ = "learning_milestones"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("careers.id"))
    phase = Column(SAEnum(SkillLevel))
    title = Column(String(300))
    description = Column(Text)
    order_index = Column(Integer, default=0)
    estimated_weeks = Column(Integer, default=4)
    practical_task = Column(Text, nullable=True)
    resources = Column(JSON, default=list)   # list of resource IDs
    skills_covered = Column(JSON, default=list)  # list of skill IDs

    career = relationship("Career", back_populates="milestones")
    progress_records = relationship("StudentProgress", back_populates="milestone")


# ─── Student Progress ─────────────────────────────────────────────────────────

class StudentProgress(Base):
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    milestone_id = Column(Integer, ForeignKey("learning_milestones.id"))
    career_id = Column(Integer, ForeignKey("careers.id"))
    is_complete = Column(Boolean, default=False)
    completion_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="progress_records")
    milestone = relationship("LearningMilestone", back_populates="progress_records")


# ─── Opportunities ────────────────────────────────────────────────────────────

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200))
    url = Column(String(500), nullable=True)
    reliability_score = Column(Float, default=0.5)  # 0-1
    is_official = Column(Boolean, default=False)
    last_checked = Column(DateTime, nullable=True)

    opportunities = relationship("Opportunity", back_populates="source")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), index=True)
    provider = Column(String(200))
    opportunity_type = Column(SAEnum(OpportunityType))
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=True)
    source_id = Column(Integer, ForeignKey("data_sources.id"), nullable=True)

    description = Column(Text)
    location = Column(String(200), nullable=True)
    is_remote = Column(Boolean, default=False)

    # Eligibility
    min_education = Column(String(100), nullable=True)
    max_age = Column(Integer, nullable=True)
    min_age = Column(Integer, nullable=True)
    required_skills = Column(JSON, default=list)
    eligible_states = Column(JSON, default=list)  # empty = all India
    eligible_genders = Column(JSON, default=list)  # empty = all
    income_limit_lpa = Column(Float, nullable=True)

    # Financial
    stipend_amount = Column(Integer, nullable=True)
    award_amount = Column(Integer, nullable=True)
    is_free = Column(Boolean, default=True)
    cost_inr = Column(Integer, nullable=True)

    # Dates and status
    application_deadline = Column(DateTime, nullable=True)
    start_date = Column(DateTime, nullable=True)
    application_url = Column(String(500), nullable=True)
    contact_info = Column(String(300), nullable=True)

    # Trust & Verification
    verification_status = Column(SAEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED)
    last_verified_at = Column(DateTime, nullable=True)
    is_demo_record = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    trust_score = Column(Float, default=0.5)  # computed, 0-1
    trust_signals = Column(JSON, default=dict)

    duration_months = Column(Integer, nullable=True)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    career = relationship("Career", back_populates="opportunities")
    source = relationship("DataSource", back_populates="opportunities")
    eligibility_rules = relationship("OpportunityEligibilityRule", back_populates="opportunity")


class OpportunityEligibilityRule(Base):
    __tablename__ = "opportunity_eligibility_rules"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    rule_type = Column(String(100))  # education, age, gender, income, skill, state
    rule_value = Column(String(300))
    operator = Column(String(20), default="eq")  # eq, gte, lte, in, contains
    is_mandatory = Column(Boolean, default=True)

    opportunity = relationship("Opportunity", back_populates="eligibility_rules")


# ─── Skill Evidence (Proof-of-Skill Passport) ────────────────────────────────

class SkillEvidence(Base):
    __tablename__ = "skill_evidences"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    evidence_type = Column(SAEnum(EvidenceType), default=EvidenceType.SELF_REPORTED)
    task_description = Column(Text, nullable=True)
    submission_url = Column(String(500), nullable=True)
    submission_notes = Column(Text, nullable=True)
    reviewer_feedback = Column(Text, nullable=True)
    verification_status = Column(SAEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED)
    completed_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="skill_evidences")
    skill = relationship("Skill", back_populates="evidences")


# ─── Facilitator ─────────────────────────────────────────────────────────────

class FacilitatorCohort(Base):
    __tablename__ = "facilitator_cohorts"

    id = Column(Integer, primary_key=True, index=True)
    facilitator_id = Column(Integer, ForeignKey("users.id"))
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    facilitator = relationship("User", back_populates="facilitator_cohorts")


class StudentHelpRequest(Base):
    __tablename__ = "student_help_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    topic = Column(String(200))
    message = Column(Text)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="help_requests")


# ─── Gaon Demand Ledger ────────────────────────────────────────────────────────

class VillageDemandCategory(Base):
    __tablename__ = "village_demand_categories"

    id = Column(Integer, primary_key=True, index=True)
    village = Column(String(100), default="Bilaspur")
    district = Column(String(100), default="Ajmer")
    state = Column(String(100), default="Rajasthan")
    title = Column(String(200), index=True)
    category_slug = Column(String(100), index=True)
    description = Column(Text)
    household_count = Column(Integer, default=45)
    confidence_score = Column(Float, default=0.92)  # 0 to 1
    urgency_level = Column(String(50), default="High")  # Critical, High, Moderate
    sample_quotes = Column(JSON, default=list)
    mapped_career_slugs = Column(JSON, default=list)
    potential_monthly_market_inr = Column(Integer, default=25000)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    responses = relationship("VillageDemandResponse", back_populates="category")


class VillageDemandResponse(Base):
    __tablename__ = "village_demand_responses"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("village_demand_categories.id"))
    village = Column(String(100), default="Bilaspur")
    respondent_name = Column(String(100))
    respondent_type = Column(String(100))  # Farmer, Shopkeeper, Household, Sarpanch
    input_channel = Column(String(50), default="voice")  # voice, text, survey
    transcript_en = Column(Text)
    transcript_hi = Column(Text, nullable=True)
    confidence = Column(Float, default=0.95)
    sentiment = Column(String(50), default="urgent")
    timestamp = Column(DateTime, default=datetime.utcnow)

    category = relationship("VillageDemandCategory", back_populates="responses")


# ─── Kamao-Seekho Micro-Gigs & Digital Saathi ───────────────────────────────

class MicroGig(Base):
    __tablename__ = "micro_gigs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(250), index=True)
    category = Column(String(100))  # digital_saathi, scholarship_verification, job_verification, language_data
    business_name = Column(String(200), nullable=True)  # For Digital Saathi tasks
    location = Column(String(200), default="Bilaspur Rural / Remote")
    description = Column(Text)
    instructions = Column(JSON, default=list)
    reward_inr = Column(Integer, default=150)  # Simulated demo INR
    duration_minutes = Column(Integer, default=20)
    difficulty = Column(String(50), default="Beginner")
    skill_awarded = Column(String(100))
    skill_level = Column(String(50), default="intermediate")
    gold_answer = Column(JSON, default=dict)
    validation_type = Column(String(50), default="rule_based")  # rule_based, gold_answer, consensus
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("MicroGigSubmission", back_populates="gig")


class MicroGigSubmission(Base):
    __tablename__ = "micro_gig_submissions"

    id = Column(Integer, primary_key=True, index=True)
    gig_id = Column(Integer, ForeignKey("micro_gigs.id"))
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    submission_data = Column(JSON, default=dict)
    status = Column(String(50), default="approved")  # pending, approved, rejected
    verification_method = Column(String(100), default="Automated Gold Standard Match")
    reviewer_notes = Column(Text, nullable=True)
    reward_earned = Column(Integer, default=0)
    evidence_id = Column(Integer, ForeignKey("skill_evidences.id"), nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    gig = relationship("MicroGig", back_populates="submissions")
    student = relationship("StudentProfile", back_populates="gig_submissions")


# ─── Simulated Student Wallet ────────────────────────────────────────────────

class StudentWallet(Base):
    __tablename__ = "student_wallets"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), unique=True)
    balance_inr = Column(Integer, default=0)
    lifetime_earned_inr = Column(Integer, default=0)
    pending_inr = Column(Integer, default=0)
    is_simulated = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet")


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("student_wallets.id"))
    transaction_type = Column(String(50))  # micro_gig_reward, transition_grant, mock_stipend
    amount_inr = Column(Integer)
    title = Column(String(200))
    description = Column(String(300), nullable=True)
    reference_id = Column(String(100), nullable=True)
    status = Column(String(50), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("StudentWallet", back_populates="transactions")


# ─── Pehla Kadam Bridge Funding ──────────────────────────────────────────────

class BridgeFundingRequest(Base):
    __tablename__ = "bridge_funding_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    travel_expense = Column(Integer, default=1800)
    accommodation_deposit = Column(Integer, default=3500)
    equipment_gear_expense = Column(Integer, default=1500)
    living_buffer_expense = Column(Integer, default=1200)
    total_requested_inr = Column(Integer, default=8000)
    student_savings_allocated = Column(Integer, default=0)
    net_funding_gap_inr = Column(Integer, default=8000)

    # Explainable decision metrics
    status = Column(String(50), default="approved")  # pending, approved, disbursed, waived
    grant_type = Column(String(100), default="CSR Zero-Interest Transition Grant")
    employer_verified = Column(Boolean, default=True)
    skill_evidence_count = Column(Integer, default=3)
    evaluation_factors = Column(JSON, default=dict)
    repayment_model = Column(String(100), default="Zero-Debt CSR Grant with 30-Day Joining Waiver")
    terms_explanation = Column(Text)
    disbursement_notes = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    decided_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="bridge_requests")
    opportunity = relationship("Opportunity")


# ─── Pravas Kavach (Migration Safety) ────────────────────────────────────────

class PravasKavachRecord(Base):
    __tablename__ = "pravas_kavach_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    destination_city = Column(String(100), default="Pune, Maharashtra")
    employer_name = Column(String(200))
    workplace_audit_status = Column(String(50), default="Verified")  # Verified, Pending, Red-Flag
    workplace_audit_notes = Column(Text)
    accommodation_name = Column(String(200))
    accommodation_address = Column(String(300))
    accommodation_verified = Column(Boolean, default=True)
    warden_contact = Column(String(100))
    warden_phone = Column(String(20))
    emergency_contacts = Column(JSON, default=list)
    checklist_status = Column(JSON, default=dict)  # { "tickets": True, "documents": True, "gear": True, ... }
    buddy_assigned_name = Column(String(100), default="Sunita D. (Senior ITI Apprentice, Batch 2023)")
    buddy_phone = Column(String(20), default="+91 98234 11029")
    buddy_checkins = Column(JSON, default=list)
    has_joined = Column(Boolean, default=False)
    joined_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="pravas_plans")
    opportunity = relationship("Opportunity")


# ─── Fraud Dojo ─────────────────────────────────────────────────────────────

class FraudDojoScenario(Base):
    __tablename__ = "fraud_dojo_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    scenario_type = Column(String(50))  # job_scam, scholarship_fraud, otp_phishing
    channel = Column(String(50), default="WhatsApp / SMS")
    message_text = Column(Text)
    sender_info = Column(String(200))
    red_flags = Column(JSON, default=list)  # List of identifiable red flags
    correct_action = Column(String(200))
    explanation = Column(Text)
    badge_name = Column(String(100), default="Vigilance Shield")
    order_index = Column(Integer, default=0)


class StudentFraudDojoRecord(Base):
    __tablename__ = "student_fraud_dojo_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    scenario_id = Column(Integer, ForeignKey("fraud_dojo_scenarios.id"))
    flagged_items = Column(JSON, default=list)
    score = Column(Integer, default=100)
    passed = Column(Boolean, default=True)
    completed_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="fraud_records")
    scenario = relationship("FraudDojoScenario")


# ─── Mock Saakshatkar (Interview Prep) ──────────────────────────────────────

class MockInterviewSession(Base):
    __tablename__ = "mock_interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=True)
    career_slug = Column(String(100), default="solar-microgrid-technician")
    overall_score = Column(Integer, default=85)
    rubric_scores = Column(JSON, default=dict)  # technical, safety, practical, communication
    transcript_qa = Column(JSON, default=list)
    actionable_feedback = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    completed_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="interview_sessions")


# ─── Saved Opportunity ──────────────────────────────────────────────────────

class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    status = Column(String(50), default="saved")  # saved, applied, offered, bridge_requested, joined
    notes = Column(Text, nullable=True)
    saved_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("StudentProfile", back_populates="saved_opportunities")
    opportunity = relationship("Opportunity")
