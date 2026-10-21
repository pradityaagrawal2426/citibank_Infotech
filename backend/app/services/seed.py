"""
Seed database with demo data for RaahSetu.
All records clearly labelled as demo/illustrative data.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import (
    User, StudentProfile, Career, Skill, CareerSkill,
    LearningMilestone, LearningResource, Opportunity,
    DataSource, OpportunityEligibilityRule, FacilitatorCohort,
    UserRole, OpportunityType, VerificationStatus, SkillLevel, EvidenceType,
    VillageDemandCategory, VillageDemandResponse, MicroGig, MicroGigSubmission,
    StudentWallet, WalletTransaction, BridgeFundingRequest, PravasKavachRecord,
    FraudDojoScenario, StudentFraudDojoRecord, MockInterviewSession,
    SavedOpportunity, StudentCareerSelection, SkillEvidence
)
import bcrypt


def _hash(password: str) -> str:
    """Hash password using direct bcrypt."""
    pwd_bytes = password.encode("utf-8")[:71]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")


def seed_database():
    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(User).first():
            return
        _seed_all(db)
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()


def _seed_all(db: Session):
    # ── Data Sources ────────────────────────────────────────────────────────
    sources = {
        "nsdc": DataSource(
            name="NSDC - National Skill Development Corporation",
            url="https://nsdcindia.org",
            reliability_score=0.95,
            is_official=True,
            last_checked=datetime.utcnow() - timedelta(days=10),
        ),
        "ugc": DataSource(
            name="UGC - University Grants Commission",
            url="https://ugc.ac.in",
            reliability_score=0.95,
            is_official=True,
            last_checked=datetime.utcnow() - timedelta(days=5),
        ),
        "demo": DataSource(
            name="[DEMO] Illustrative Data Source",
            url=None,
            reliability_score=0.0,
            is_official=False,
            last_checked=datetime.utcnow(),
        ),
    }
    for s in sources.values():
        db.add(s)
    db.flush()

    # ── Skills ─────────────────────────────────────────────────────────────
    skills_data = [
        # Tech
        ("Python Programming", "tech", True),
        ("Data Analysis", "tech", True),
        ("Excel/Spreadsheets", "tech", True),
        ("Basic Computer Usage", "tech", True),
        ("Web Browsing & Research", "tech", False),
        ("Mobile App Usage", "tech", False),
        # Vocational
        ("Electrical Wiring", "vocational", True),
        ("Circuit Reading", "vocational", True),
        ("Safety Protocols", "vocational", True),
        ("Tool Handling", "vocational", True),
        ("Solar Inverter Maintenance", "vocational", True),
        ("Earthing & DC Safety", "vocational", True),
        ("Merchant Digitization", "tech", True),
        ("Digital Safety & Scam Prevention", "soft", False),
        ("Technical Interview & Workplace Readiness", "soft", False),
        # Healthcare
        ("Patient Care Basics", "healthcare", False),
        ("Medical Terminology", "healthcare", True),
        ("Record Keeping", "healthcare", False),
        # Agriculture
        ("Crop Planning", "agriculture", False),
        ("Soil Testing", "agriculture", True),
        ("Market Linkages", "agriculture", False),
        ("Farm Finance Basics", "agriculture", False),
        # Office & Admin
        ("Typing Speed", "admin", True),
        ("Document Formatting", "admin", True),
        ("Data Entry", "admin", True),
        ("Communication Skills", "soft", False),
        # Entrepreneurship
        ("Business Planning", "entrepreneurship", False),
        ("Customer Service", "entrepreneurship", False),
        ("Basic Accounting", "entrepreneurship", True),
        # Soft skills
        ("Problem Solving", "soft", False),
        ("Teamwork", "soft", False),
        ("Time Management", "soft", False),
    ]
    skills = {}
    for name, cat, is_tech in skills_data:
        s = Skill(name=name, category=cat, is_technical=is_tech,
                  description=f"Foundational skill: {name}")
        db.add(s)
        skills[name] = s
    db.flush()

    # ── Careers ─────────────────────────────────────────────────────────────
    careers_data = [
        {
            "title": "Software Developer",
            "slug": "software-developer",
            "category": "Technology",
            "description": "Build software applications and websites. Software developers write, test, and maintain code that powers digital products.",
            "short_description": "Build apps, websites, and digital tools using programming languages.",
            "typical_education": "Class 12 (Science/Math) or equivalent",
            "estimated_duration_months": 18,
            "salary_range_min": 20000,
            "salary_range_max": 80000,
            "salary_label": "Indicative starting range (INR/month) — varies by region and employer",
            "work_environment": "Office/Remote",
            "growth_potential": "high",
            "icon_name": "Code",
            "is_vocational": False,
            "tags": ["technology", "programming", "digital", "remote-friendly"],
            "skills_required": [
                ("Python Programming", "required", "beginner", "beginner"),
                ("Basic Computer Usage", "required", "beginner", "beginner"),
                ("Problem Solving", "required", "beginner", "beginner"),
                ("Data Analysis", "recommended", "intermediate", "intermediate"),
            ],
        },
        {
            "title": "Data Analyst",
            "slug": "data-analyst",
            "category": "Technology",
            "description": "Collect, clean, and interpret data to help organisations make informed decisions.",
            "short_description": "Turn raw data into meaningful insights using tools like Excel and Python.",
            "typical_education": "Class 12 (Science/Math/Commerce)",
            "estimated_duration_months": 12,
            "salary_range_min": 18000,
            "salary_range_max": 60000,
            "salary_label": "Indicative starting range (INR/month) — varies by employer",
            "work_environment": "Office/Remote",
            "growth_potential": "high",
            "icon_name": "BarChart2",
            "is_vocational": False,
            "tags": ["technology", "data", "analytics", "excel", "remote-friendly"],
            "skills_required": [
                ("Excel/Spreadsheets", "required", "beginner", "beginner"),
                ("Data Analysis", "required", "intermediate", "intermediate"),
                ("Python Programming", "recommended", "beginner", "beginner"),
                ("Basic Computer Usage", "required", "beginner", "beginner"),
                ("Problem Solving", "recommended", "beginner", "beginner"),
            ],
        },
        {
            "title": "Electrician",
            "slug": "electrician",
            "category": "Vocational",
            "description": "Install, maintain, and repair electrical systems in homes, factories, and buildings.",
            "short_description": "Install and maintain electrical systems — a high-demand skilled trade.",
            "typical_education": "Class 8–10",
            "estimated_duration_months": 6,
            "salary_range_min": 12000,
            "salary_range_max": 35000,
            "salary_label": "Indicative range (INR/month) — may vary by location and specialisation",
            "work_environment": "On-site",
            "growth_potential": "medium",
            "icon_name": "Zap",
            "is_vocational": True,
            "tags": ["vocational", "skilled-trade", "iti", "hands-on"],
            "skills_required": [
                ("Electrical Wiring", "required", "beginner", "beginner"),
                ("Circuit Reading", "required", "beginner", "beginner"),
                ("Safety Protocols", "required", "beginner", "beginner"),
                ("Tool Handling", "required", "beginner", "beginner"),
                ("Basic Computer Usage", "recommended", "beginner", "intermediate"),
            ],
        },
        {
            "title": "Solar Microgrid Maintenance Technician",
            "slug": "solar-microgrid-technician",
            "category": "Vocational",
            "description": "Install, test, and maintain village mini-grids, solar water pumps, and hybrid inverter systems. Directly addresses acute rural clean energy uptime needs.",
            "short_description": "Maintain village solar pumps, mini-grids, and clean power infrastructure.",
            "typical_education": "Class 10 + ITI Electrical / Wireman",
            "estimated_duration_months": 6,
            "salary_range_min": 14000,
            "salary_range_max": 38000,
            "salary_label": "Indicative starting range (INR/month) + rural maintenance incentives",
            "work_environment": "Field/Village",
            "growth_potential": "high",
            "icon_name": "Sun",
            "is_vocational": True,
            "tags": ["solar", "clean-energy", "iti", "vocational", "high-local-demand", "green-jobs"],
            "skills_required": [
                ("Electrical Wiring", "required", "beginner", "beginner"),
                ("Circuit Reading", "required", "beginner", "beginner"),
                ("Safety Protocols", "required", "beginner", "beginner"),
                ("Tool Handling", "required", "beginner", "beginner"),
                ("Solar Inverter Maintenance", "required", "intermediate", "intermediate"),
                ("Earthing & DC Safety", "recommended", "intermediate", "intermediate"),
            ],
        },
        {
            "title": "Healthcare Support Worker",
            "slug": "healthcare-support",
            "category": "Healthcare",
            "description": "Assist nurses and doctors in patient care, record management, and clinical support tasks.",
            "short_description": "Support healthcare teams with patient care, records, and administrative tasks.",
            "typical_education": "Class 10–12",
            "estimated_duration_months": 9,
            "salary_range_min": 10000,
            "salary_range_max": 25000,
            "salary_label": "Indicative range (INR/month)",
            "work_environment": "Hospital/Clinic",
            "growth_potential": "medium",
            "icon_name": "Heart",
            "is_vocational": True,
            "tags": ["healthcare", "hospital", "care", "community"],
            "skills_required": [
                ("Patient Care Basics", "required", "beginner", "beginner"),
                ("Medical Terminology", "required", "beginner", "beginner"),
                ("Record Keeping", "required", "beginner", "beginner"),
                ("Communication Skills", "required", "beginner", "beginner"),
            ],
        },
        {
            "title": "Agri-Entrepreneur",
            "slug": "agri-entrepreneur",
            "category": "Agriculture",
            "description": "Apply modern agricultural practices, business planning, and market linkages to build a sustainable agribusiness.",
            "short_description": "Modernise farming with business skills, technology, and market access.",
            "typical_education": "Class 8 or above",
            "estimated_duration_months": 12,
            "salary_range_min": 8000,
            "salary_range_max": 40000,
            "salary_label": "Indicative income range (INR/month) — highly variable",
            "work_environment": "Farm/Field",
            "growth_potential": "high",
            "icon_name": "Sprout",
            "is_vocational": True,
            "tags": ["agriculture", "entrepreneurship", "rural", "self-employment"],
            "skills_required": [
                ("Crop Planning", "required", "beginner", "beginner"),
                ("Soil Testing", "recommended", "beginner", "intermediate"),
                ("Market Linkages", "required", "intermediate", "intermediate"),
                ("Farm Finance Basics", "required", "beginner", "beginner"),
                ("Business Planning", "recommended", "intermediate", "advanced"),
            ],
        },
        {
            "title": "Office Administrator",
            "slug": "office-administrator",
            "category": "Administration",
            "description": "Manage office operations, data entry, correspondence, and records for organisations.",
            "short_description": "Keep offices running smoothly through data entry, filing, and communication.",
            "typical_education": "Class 10–12",
            "estimated_duration_months": 6,
            "salary_range_min": 9000,
            "salary_range_max": 22000,
            "salary_label": "Indicative range (INR/month)",
            "work_environment": "Office",
            "growth_potential": "medium",
            "icon_name": "FileText",
            "is_vocational": False,
            "tags": ["office", "administration", "data-entry", "beginner-friendly"],
            "skills_required": [
                ("Typing Speed", "required", "beginner", "beginner"),
                ("Document Formatting", "required", "beginner", "beginner"),
                ("Data Entry", "required", "beginner", "beginner"),
                ("Excel/Spreadsheets", "recommended", "beginner", "intermediate"),
                ("Communication Skills", "required", "beginner", "beginner"),
            ],
        },
        {
            "title": "Retail & Small Business Owner",
            "slug": "retail-entrepreneur",
            "category": "Entrepreneurship",
            "description": "Start and manage a retail shop or small business, applying customer service, accounting, and entrepreneurship skills.",
            "short_description": "Start your own shop or service business in your community.",
            "typical_education": "Class 8 or above",
            "estimated_duration_months": 8,
            "salary_range_min": 10000,
            "salary_range_max": 50000,
            "salary_label": "Indicative income range (INR/month) — highly variable",
            "work_environment": "Local Business",
            "growth_potential": "high",
            "icon_name": "ShoppingBag",
            "is_vocational": True,
            "tags": ["entrepreneurship", "self-employment", "retail", "community"],
            "skills_required": [
                ("Business Planning", "required", "beginner", "beginner"),
                ("Customer Service", "required", "beginner", "beginner"),
                ("Basic Accounting", "required", "beginner", "beginner"),
                ("Communication Skills", "required", "beginner", "beginner"),
                ("Time Management", "recommended", "beginner", "intermediate"),
            ],
        },
    ]

    career_objs = {}
    for cd in careers_data:
        skills_required = cd.pop("skills_required")
        c = Career(**cd)
        db.add(c)
        db.flush()
        career_objs[c.slug] = c

        for skill_name, importance, level_req, phase in skills_required:
            skill = skills.get(skill_name)
            if skill:
                cs = CareerSkill(
                    career_id=c.id,
                    skill_id=skill.id,
                    importance=importance,
                    level_required=SkillLevel(level_req),
                    milestone_phase=phase,
                )
                db.add(cs)

    db.flush()

    # ── Learning Milestones ─────────────────────────────────────────────────
    milestones_data = {
        "software-developer": [
            (SkillLevel.BEGINNER, "Getting Started with Computers & Python", 4,
             "Set up your environment, learn Python syntax basics, and write your first program.",
             "Write a Python script that asks for your name and prints a greeting 5 times.",
             ["Python Programming", "Basic Computer Usage"]),
            (SkillLevel.BEGINNER, "Problem Solving with Python", 4,
             "Learn loops, conditionals, and functions. Solve simple real-world problems.",
             "Build a simple calculator that can add, subtract, multiply, and divide.",
             ["Python Programming", "Problem Solving"]),
            (SkillLevel.INTERMEDIATE, "Working with Data", 6,
             "Read and write files, work with CSV data, and use pandas basics.",
             "Load a CSV file of student marks and calculate the class average.",
             ["Data Analysis", "Python Programming"]),
            (SkillLevel.INTERMEDIATE, "Building a Simple Web Application", 6,
             "Create a basic web app using Flask or a simple frontend.",
             "Build a webpage that displays a student profile using HTML and Python.",
             ["Python Programming", "Problem Solving"]),
            (SkillLevel.ADVANCED, "Internship-Ready Portfolio", 8,
             "Complete a personal project, set up GitHub, and prepare for interviews.",
             "Host a project on GitHub and write a README explaining what it does.",
             ["Python Programming", "Data Analysis", "Problem Solving"]),
        ],
        "data-analyst": [
            (SkillLevel.BEGINNER, "Excel & Spreadsheet Basics", 3,
             "Learn spreadsheet fundamentals: formatting, formulas, charts.",
             "Create a monthly budget spreadsheet with SUM, AVERAGE, and a bar chart.",
             ["Excel/Spreadsheets", "Basic Computer Usage"]),
            (SkillLevel.BEGINNER, "Understanding Data", 3,
             "Learn what data types are, how to clean data, and basic statistics.",
             "Take a messy dataset, remove duplicates, and summarise it with pivot tables.",
             ["Data Analysis", "Excel/Spreadsheets"]),
            (SkillLevel.INTERMEDIATE, "Introduction to Python for Data", 5,
             "Learn Python pandas and matplotlib for data analysis.",
             "Analyse a public dataset (e.g., crop prices) and create 3 charts.",
             ["Python Programming", "Data Analysis"]),
            (SkillLevel.ADVANCED, "Data Dashboard & Presentation", 4,
             "Build a data dashboard and present findings clearly.",
             "Create an interactive dashboard for a simple business dataset.",
             ["Data Analysis", "Excel/Spreadsheets", "Problem Solving"]),
        ],
        "electrician": [
            (SkillLevel.BEGINNER, "Electrical Safety Fundamentals", 2,
             "Learn about electricity basics, safety protocols, and protective equipment.",
             "Identify 10 common electrical hazards in a diagram and explain how to avoid each.",
             ["Safety Protocols", "Tool Handling"]),
            (SkillLevel.BEGINNER, "Reading Electrical Circuits", 3,
             "Read and interpret basic wiring diagrams and circuit schematics.",
             "Draw a simple home circuit diagram showing switches, lights, and a power source.",
             ["Circuit Reading", "Electrical Wiring"]),
            (SkillLevel.INTERMEDIATE, "Practical Wiring Skills", 6,
             "Wire a simple circuit under supervision at an ITI or training centre.",
             "Complete a supervised wiring task: install a switch-and-bulb circuit.",
             ["Electrical Wiring", "Safety Protocols", "Tool Handling"]),
            (SkillLevel.ADVANCED, "Apprenticeship & Certification", 6,
             "Complete an ITI apprenticeship and prepare for trade certification.",
             "Document 5 completed electrical jobs with photos and mentor sign-off.",
             ["Electrical Wiring", "Circuit Reading", "Safety Protocols"]),
        ],
        "solar-microgrid-technician": [
            (SkillLevel.BEGINNER, "Solar Array & DC Safety Protocols", 3,
             "Learn solar PV panel fundamentals, string voltage calculation, and DC isolator safety.",
             "Perform zero-energy verification on a 600V DC junction box using an insulated multimeter.",
             ["Safety Protocols", "Tool Handling", "Earthing & DC Safety"]),
            (SkillLevel.BEGINNER, "Circuit Reading & PV Schematics", 3,
             "Read single-line diagrams (SLD) for village mini-grids and hybrid solar inverter systems.",
             "Trace power path from solar string through charge controller, battery bank, and AC inverter.",
             ["Circuit Reading", "Electrical Wiring"]),
            (SkillLevel.INTERMEDIATE, "Inverter Servicing & Battery Bank Health", 5,
             "Diagnose common inverter fault codes, test cell-level battery voltages, and clean heat sinks.",
             "Test 4 deep-cycle solar batteries with a hydrometer and digital load tester; log cell readings.",
             ["Solar Inverter Maintenance", "Tool Handling"]),
            (SkillLevel.ADVANCED, "Grid Synchronization & Apprenticeship Ready", 5,
             "Master safety earthing resistance tests (<5 Ohms), lightning arrestors, and apprentice interview prep.",
             "Complete mock trade interview & verify safety compliance checklist for industrial apprenticeship.",
             ["Earthing & DC Safety", "Solar Inverter Maintenance", "Technical Interview & Workplace Readiness"]),
        ],
        "healthcare-support": [
            (SkillLevel.BEGINNER, "Introduction to Healthcare", 3,
             "Understand healthcare settings, patient rights, and basic medical terms.",
             "Write a short explanation of 10 common medical terms used in a clinic.",
             ["Medical Terminology", "Communication Skills"]),
            (SkillLevel.BEGINNER, "Patient Care Basics", 3,
             "Learn how to assist patients: mobility, hygiene, and communication.",
             "Role-play three patient interaction scenarios focusing on empathy and clarity.",
             ["Patient Care Basics", "Communication Skills"]),
            (SkillLevel.INTERMEDIATE, "Record Keeping & Administration", 4,
             "Maintain patient records, appointment logs, and basic administrative tasks.",
             "Create a mock patient record system using a spreadsheet.",
             ["Record Keeping", "Excel/Spreadsheets"]),
            (SkillLevel.ADVANCED, "Clinical Placement Preparation", 3,
             "Prepare for a supported clinical placement or community health role.",
             "Complete a simulated clinic day: reception, records, and basic patient support.",
             ["Patient Care Basics", "Medical Terminology", "Record Keeping"]),
        ],
        "agri-entrepreneur": [
            (SkillLevel.BEGINNER, "Understanding Your Farm", 3,
             "Assess your land, soil, and water resources. Learn basic crop cycles.",
             "Map your farm plot and list its resources, challenges, and opportunities.",
             ["Crop Planning", "Soil Testing"]),
            (SkillLevel.INTERMEDIATE, "Market Linkages & Pricing", 4,
             "Understand local markets, pricing strategies, and how to sell your produce.",
             "Visit a local mandi and record prices for 5 crops over 2 weeks.",
             ["Market Linkages", "Farm Finance Basics"]),
            (SkillLevel.INTERMEDIATE, "Agribusiness Planning", 5,
             "Create a simple agribusiness plan with costs, revenue, and seasonal planning.",
             "Write a one-page business plan for a specific crop or product.",
             ["Business Planning", "Farm Finance Basics", "Market Linkages"]),
            (SkillLevel.ADVANCED, "Scaling & Technology Adoption", 4,
             "Learn about government schemes, cooperative models, and agritech tools.",
             "Identify 3 government schemes your farm qualifies for and apply for one.",
             ["Market Linkages", "Business Planning", "Crop Planning"]),
        ],
        "office-administrator": [
            (SkillLevel.BEGINNER, "Computer & Typing Basics", 3,
             "Learn touch typing, file management, and basic computer operations.",
             "Complete a 5-minute typing test and achieve at least 25 words per minute.",
             ["Typing Speed", "Basic Computer Usage"]),
            (SkillLevel.BEGINNER, "Document Creation", 3,
             "Create professional letters, forms, and reports using word processors.",
             "Create a formal business letter using a word processor with correct formatting.",
             ["Document Formatting", "Communication Skills"]),
            (SkillLevel.INTERMEDIATE, "Data Entry & Spreadsheets", 4,
             "Perform accurate data entry and use spreadsheets for record management.",
             "Enter 200 records accurately into a spreadsheet and check for errors.",
             ["Data Entry", "Excel/Spreadsheets"]),
            (SkillLevel.ADVANCED, "Office Systems & Administration", 3,
             "Manage filing systems, schedules, and correspondence independently.",
             "Set up a complete filing system for a mock company with 50 documents.",
             ["Document Formatting", "Data Entry", "Communication Skills"]),
        ],
        "retail-entrepreneur": [
            (SkillLevel.BEGINNER, "Business Basics", 3,
             "Understand profit, loss, pricing, and what makes a business sustainable.",
             "Calculate the break-even point for a simple shop selling 3 products.",
             ["Business Planning", "Basic Accounting"]),
            (SkillLevel.BEGINNER, "Customer Service Excellence", 3,
             "Learn how to attract, serve, and retain customers effectively.",
             "Role-play 5 customer service scenarios including complaints and refunds.",
             ["Customer Service", "Communication Skills"]),
            (SkillLevel.INTERMEDIATE, "Stock Management & Accounts", 4,
             "Keep a simple stock register and daily accounts book.",
             "Maintain a mock shop's stock register and daily accounts for one week.",
             ["Basic Accounting", "Data Entry", "Time Management"]),
            (SkillLevel.ADVANCED, "Growing the Business", 4,
             "Use digital tools for inventory, marketing, and expanding your customer base.",
             "Create a simple WhatsApp Business profile for your shop and attract 5 customers.",
             ["Business Planning", "Customer Service", "Basic Accounting"]),
        ],
    }

    for slug, ms in milestones_data.items():
        career = career_objs.get(slug)
        if not career:
            continue
        for idx, (phase, title, weeks, desc, task, skill_names) in enumerate(ms):
            skill_ids = [skills[sn].id for sn in skill_names if sn in skills]
            m = LearningMilestone(
                career_id=career.id,
                phase=phase,
                title=title,
                description=desc,
                order_index=idx,
                estimated_weeks=weeks,
                practical_task=task,
                skills_covered=skill_ids,
            )
            db.add(m)

    db.flush()

    # ── Opportunities ───────────────────────────────────────────────────────
    now = datetime.utcnow()
    opportunities_data = [
        {
            "title": "[DEMO] NSDC Skill India – Electrician Trade Certificate",
            "provider": "National Skill Development Corporation",
            "opportunity_type": OpportunityType.VOCATIONAL_TRAINING,
            "career_slug": "electrician",
            "source_key": "nsdc",
            "description": "[DEMO RECORD — Illustrative example. Verify at nsdc.gov.in.] Government-supported electrician trade certification under Skill India Mission. Covers wiring, safety, and practical assessment.",
            "location": "Multiple ITI centres across India",
            "is_remote": False,
            "min_education": "Class 8",
            "max_age": 35,
            "min_age": 14,
            "required_skills": ["Basic Computer Usage"],
            "stipend_amount": None,
            "is_free": True,
            "application_deadline": now + timedelta(days=60),
            "application_url": "https://nsdcindia.org",
            "verification_status": VerificationStatus.UNVERIFIED,
            "is_demo_record": True,
            "trust_score": 0.55,
            "trust_signals": {
                "official_source_linked": True,
                "recently_checked": False,
                "deadline_known": True,
                "eligibility_complete": True,
                "link_available": True
            },
            "tags": ["vocational", "iti", "government", "skill-india"],
            "duration_months": 6,
        },
        {
            "title": "[DEMO] PM Vishwakarma – Skilled Artisan Support Scheme",
            "provider": "Ministry of Micro, Small and Medium Enterprises (MSME)",
            "opportunity_type": OpportunityType.GOVERNMENT_SCHEME,
            "career_slug": "retail-entrepreneur",
            "source_key": "demo",
            "description": "[DEMO RECORD — Illustrative example only. Not verified.] A scheme supporting traditional artisans and craftspeople with training, tools, credit, and market access.",
            "location": "All India",
            "is_remote": False,
            "min_education": "None",
            "max_age": 60,
            "min_age": 18,
            "required_skills": [],
            "stipend_amount": None,
            "award_amount": 15000,
            "is_free": True,
            "application_url": None,
            "verification_status": VerificationStatus.UNVERIFIED,
            "is_demo_record": True,
            "trust_score": 0.4,
            "trust_signals": {
                "official_source_linked": False,
                "recently_checked": False,
                "deadline_known": False,
                "eligibility_complete": False,
                "link_available": False
            },
            "tags": ["government", "artisan", "msme", "support"],
            "duration_months": None,
        },
        {
            "title": "[DEMO] National Scholarship Portal – Post-Matric SC/ST",
            "provider": "Ministry of Social Justice and Empowerment",
            "opportunity_type": OpportunityType.SCHOLARSHIP,
            "career_slug": None,
            "source_key": "demo",
            "description": "[DEMO RECORD — Illustrative example. Verify at scholarships.gov.in.] Post-matric scholarship for SC/ST students pursuing higher education, covering tuition and maintenance.",
            "location": "All India",
            "is_remote": False,
            "min_education": "Class 10",
            "max_age": None,
            "min_age": None,
            "required_skills": [],
            "income_limit_lpa": 2.5,
            "award_amount": 40000,
            "is_free": True,
            "application_deadline": now + timedelta(days=90),
            "application_url": "https://scholarships.gov.in",
            "verification_status": VerificationStatus.UNVERIFIED,
            "is_demo_record": True,
            "trust_score": 0.6,
            "trust_signals": {
                "official_source_linked": True,
                "recently_checked": False,
                "deadline_known": True,
                "eligibility_complete": True,
                "link_available": True
            },
            "tags": ["scholarship", "government", "sc", "st", "education"],
            "duration_months": None,
        },
        {
            "title": "[DEMO] Python for Data Analytics – Free Online Course",
            "provider": "SWAYAM / NPTEL (Illustrative)",
            "opportunity_type": OpportunityType.COURSE,
            "career_slug": "data-analyst",
            "source_key": "demo",
            "description": "[DEMO RECORD — Illustrative example.] Free 12-week online course covering Python, pandas, and data visualisation. Accessible via mobile.",
            "location": "Online",
            "is_remote": True,
            "min_education": "Class 12",
            "max_age": None,
            "min_age": None,
            "required_skills": ["Basic Computer Usage"],
            "is_free": True,
            "application_url": "https://swayam.gov.in",
            "verification_status": VerificationStatus.UNVERIFIED,
            "is_demo_record": True,
            "trust_score": 0.5,
            "trust_signals": {
                "official_source_linked": True,
                "recently_checked": False,
                "deadline_known": False,
                "eligibility_complete": True,
                "link_available": True
            },
            "tags": ["online", "python", "data", "free", "mobile-friendly"],
            "duration_months": 3,
        },
        {
            "title": "[DEMO] Community Health Worker Apprenticeship",
            "provider": "State Health Department (Illustrative)",
            "opportunity_type": OpportunityType.APPRENTICESHIP,
            "career_slug": "healthcare-support",
            "source_key": "demo",
            "description": "[DEMO RECORD — Illustrative example.] 6-month paid apprenticeship supporting ASHA workers in rural health centres. Includes basic patient care training.",
            "location": "Rural districts — varies by state",
            "is_remote": False,
            "min_education": "Class 10",
            "max_age": 35,
            "min_age": 18,
            "required_skills": ["Communication Skills"],
            "stipend_amount": 6000,
            "is_free": True,
            "application_url": None,
            "verification_status": VerificationStatus.UNVERIFIED,
            "is_demo_record": True,
            "trust_score": 0.35,
            "trust_signals": {
                "official_source_linked": False,
                "recently_checked": False,
                "deadline_known": False,
                "eligibility_complete": False,
                "link_available": False
            },
            "tags": ["healthcare", "apprenticeship", "rural", "paid"],
            "duration_months": 6,
        },
        {
            "title": "[DEMO] Agri-Startup Incubation Programme",
            "provider": "NABARD / State Agriculture Dept (Illustrative)",
            "opportunity_type": OpportunityType.INTERNSHIP,
            "career_slug": "agri-entrepreneur",
            "source_key": "demo",
            "description": "[DEMO RECORD — Illustrative example.] 3-month incubation programme for rural youth with agribusiness ideas. Includes mentorship, seed funding guidance, and market access.",
            "location": "State agriculture universities — varies",
            "is_remote": False,
            "min_education": "Class 10",
            "max_age": 35,
            "min_age": 18,
            "required_skills": ["Business Planning"],
            "stipend_amount": 5000,
            "is_free": True,
            "application_url": None,
            "verification_status": VerificationStatus.UNVERIFIED,
            "is_demo_record": True,
            "trust_score": 0.4,
            "trust_signals": {
                "official_source_linked": False,
                "recently_checked": False,
                "deadline_known": False,
                "eligibility_complete": False,
                "link_available": False
            },
            "tags": ["agriculture", "startup", "incubation", "rural"],
            "duration_months": 3,
        },
        {
            "title": "[DEMO] Data Entry Operator – Entry Level",
            "provider": "Regional SSC / State PSC (Illustrative)",
            "opportunity_type": OpportunityType.JOB,
            "career_slug": "office-administrator",
            "source_key": "demo",
            "description": "[DEMO RECORD — Illustrative example.] Entry-level government data entry positions requiring basic computer and typing skills.",
            "location": "State capitals and district offices",
            "is_remote": False,
            "min_education": "Class 12",
            "max_age": 28,
            "min_age": 18,
            "required_skills": ["Typing Speed", "Data Entry", "Basic Computer Usage"],
            "stipend_amount": None,
            "is_free": True,
            "application_url": None,
            "verification_status": VerificationStatus.UNVERIFIED,
            "is_demo_record": True,
            "trust_score": 0.45,
            "trust_signals": {
                "official_source_linked": False,
                "recently_checked": False,
                "deadline_known": False,
                "eligibility_complete": True,
                "link_available": False
            },
            "tags": ["government", "job", "data-entry", "office"],
            "duration_months": None,
        },
        {
            "title": "Tata Power Solar Microgrid Maintenance Apprentice",
            "provider": "Tata Power Renewable Energy / NSDC Partner",
            "opportunity_type": OpportunityType.APPRENTICESHIP,
            "career_slug": "solar-microgrid-technician",
            "source_key": "nsdc",
            "description": "12-month certified industrial apprenticeship with Tata Power Renewable Energy at the Pune Regional Cluster. Includes on-site microgrid maintenance, inverter servicing, safety protocols, and a guaranteed path to permanent field technician roles.",
            "location": "Pune, Maharashtra",
            "is_remote": False,
            "min_education": "Class 10 / ITI",
            "max_age": 24,
            "min_age": 18,
            "required_skills": ["Electrical Wiring", "Circuit Reading", "Safety Protocols"],
            "eligible_states": [],
            "stipend_amount": 12000,
            "is_free": True,
            "application_url": "https://apprenticeshipindia.gov.in",
            "verification_status": VerificationStatus.VERIFIED,
            "is_demo_record": True,
            "trust_score": 0.98,
            "trust_signals": {
                "official_source_linked": True,
                "recently_checked": True,
                "deadline_known": True,
                "eligibility_complete": True,
                "link_available": True,
                "workplace_safety_audited": True,
                "hostel_assistance_available": True,
            },
            "tags": ["apprenticeship", "solar", "clean-energy", "stipend", "verified-employer", "relocation-required"],
            "duration_months": 12,
        },
    ]

    for od in opportunities_data:
        career_slug = od.pop("career_slug")
        source_key = od.pop("source_key")
        career = career_objs.get(career_slug) if career_slug else None
        source = sources.get(source_key)
        opp = Opportunity(
            career_id=career.id if career else None,
            source_id=source.id if source else None,
            **od,
        )
        db.add(opp)

    db.flush()

    # ── Demo Users ──────────────────────────────────────────────────────────
    demo_users = [
        {
            "username": "demo_student_priya",
            "role": UserRole.STUDENT,
            "is_demo": True,
            "profile": {
                "full_name": "Priya Sharma",
                "age": 20,
                "gender": "Female",
                "education_level": "ITI Electrical",
                "education_stream": "Electrician & Solar Trades",
                "state": "Rajasthan",
                "district": "Ajmer",
                "interests": ["solar power", "electrical systems", "repairing equipment", "green energy"],
                "existing_skills": [
                    "Electrical Wiring", "Circuit Reading", "Tool Handling",
                    "Safety Protocols", "Merchant Digitization", "Earthing & DC Safety"
                ],
                "aspirations": "Complete my solar microgrid apprenticeship, gain field experience, and set up a clean energy repair enterprise in Bilaspur.",
                "has_smartphone": True,
                "has_internet": True,
                "has_laptop": False,
                "daily_study_minutes": 60,
                "financial_constraints": True,
                "preferred_language": "hi",
                "onboarding_complete": True,
            }
        },
        {
            "username": "demo_student_raju",
            "role": UserRole.STUDENT,
            "is_demo": True,
            "profile": {
                "full_name": "Raju Nayak",
                "age": 19,
                "gender": "Male",
                "education_level": "Class 10",
                "education_stream": None,
                "state": "Odisha",
                "district": "Koraput",
                "interests": ["hands-on work", "electrical", "fixing things"],
                "existing_skills": ["Tool Handling", "Safety Protocols"],
                "aspirations": "I want to become a skilled electrician and start my own business.",
                "has_smartphone": True,
                "has_internet": False,
                "has_laptop": False,
                "daily_study_minutes": 45,
                "financial_constraints": True,
                "preferred_language": "or",
                "onboarding_complete": True,
            }
        },
        {
            "username": "demo_student_kavya",
            "role": UserRole.STUDENT,
            "is_demo": True,
            "profile": {
                "full_name": "Kavya Reddy",
                "age": 21,
                "gender": "Female",
                "education_level": "Graduate",
                "education_stream": "Commerce",
                "state": "Andhra Pradesh",
                "district": "Kurnool",
                "interests": ["data", "numbers", "business", "technology"],
                "existing_skills": ["Excel/Spreadsheets", "Data Entry", "Basic Computer Usage"],
                "aspirations": "I want to work in data analysis and eventually lead a team.",
                "has_smartphone": True,
                "has_internet": True,
                "has_laptop": True,
                "daily_study_minutes": 120,
                "financial_constraints": False,
                "preferred_language": "te",
                "onboarding_complete": True,
            }
        },
        {
            "username": "demo_facilitator",
            "role": UserRole.FACILITATOR,
            "is_demo": True,
            "profile": None,
        },
        {
            "username": "admin",
            "role": UserRole.ADMIN,
            "is_demo": False,
            "profile": None,
        },
    ]

    created_users = {}
    for ud in demo_users:
        profile_data = ud.pop("profile")
        u = User(
            username=ud["username"],
            email=f"{ud['username']}@demo.raahsetu.in",
            hashed_password=_hash("demo1234"),
            role=ud["role"],
            is_demo=ud["is_demo"],
        )
        db.add(u)
        db.flush()
        created_users[ud["username"]] = u

        if profile_data and ud["role"] == UserRole.STUDENT:
            p = StudentProfile(user_id=u.id, **profile_data)
            db.add(p)

    db.flush()

    # Assign students to facilitator cohort
    facilitator_user = created_users.get("demo_facilitator")
    student_profiles = db.query(StudentProfile).all()
    for sp in student_profiles:
        fc = FacilitatorCohort(
            facilitator_id=facilitator_user.id,
            student_id=sp.id,
            notes="Demo cohort assignment",
        )
        db.add(fc)

    # Seed RaahSetu high-value extension data (Gaon Demand, MicroGigs, Wallet, Pehla Kadam Bridge, Pravas Kavach, Fraud Dojo)
    _seed_extension_data(db, created_users, career_objs, skills)

    db.commit()
    print("[OK] RaahSetu seed data loaded successfully.")


def _seed_extension_data(db: Session, created_users: dict, career_objs: dict, skills: dict):
    """Seed Gaon Demand Ledger, Micro-Gigs, Wallet, Pehla Kadam Bridge, Pravas Kavach & Fraud Dojo."""
    priya_user = created_users.get("demo_student_priya")
    if not priya_user:
        return
    priya_profile = db.query(StudentProfile).filter(StudentProfile.user_id == priya_user.id).first()
    if not priya_profile:
        return

    solar_career = career_objs.get("solar-microgrid-technician")

    # 1. Career selection for Priya
    if solar_career:
        sel = StudentCareerSelection(
            student_id=priya_profile.id,
            career_id=solar_career.id,
            match_score=94.5,
            is_primary=True,
            match_reasons=[
                "High local demand in Bilaspur (84 households need solar pump & inverter maintenance)",
                "Matches your ITI Electrical wiring, tool handling & safety protocols",
                "Tata Power NSDC-certified apprenticeship available with ₹8,000 relocation grant",
            ]
        )
        db.add(sel)

    # 2. Gaon Demand Ledger Categories
    demand_cats = [
        VillageDemandCategory(
            village="Bilaspur",
            district="Ajmer",
            state="Rajasthan",
            title="Solar Pump & Microgrid Inverter Maintenance",
            category_slug="solar-microgrid-maintenance",
            description="Village farmers report frequent DC inverter tripping and burnt junction boxes on PM-KUSUM solar tubewells. Nearest technician is 35km away in Ajmer city.",
            household_count=84,
            confidence_score=0.96,
            urgency_level="Critical",
            sample_quotes=[
                "Our solar pump inverter stops working at noon peak sunlight. We lost half of our mustard crop waiting 2 weeks for a repairman.",
                "15 households installed rooftop panels under PM Surya Ghar, but the wiring earthing wasn't tested properly.",
            ],
            mapped_career_slugs=["solar-microgrid-technician", "electrician"],
            potential_monthly_market_inr=42000,
        ),
        VillageDemandCategory(
            village="Bilaspur",
            district="Ajmer",
            state="Rajasthan",
            title="Local Shop Digitization & UPI Soundbox Setup",
            category_slug="local-shop-digitization",
            description="Village grocery shops, seed stores, and fertilizer kiosks need help with digital inventory cataloging, QR code standees, and Google Maps location listings.",
            household_count=62,
            confidence_score=0.91,
            urgency_level="High",
            sample_quotes=[
                "Customers want to pay by Google Pay / PhonePe, but our QR code paper is torn and we don't know how to order a soundbox.",
                "Ramesh Kirana wants to list his store on WhatsApp Business so villagers can order flour and oil in advance.",
            ],
            mapped_career_slugs=["office-administrator", "data-analyst"],
            potential_monthly_market_inr=28000,
        ),
        VillageDemandCategory(
            village="Bilaspur",
            district="Ajmer",
            state="Rajasthan",
            title="Electric 2-Wheeler Battery & Motor Diagnostics",
            category_slug="ev-two-wheeler-diagnostics",
            description="18 electric scooters purchased in the panchayat in 2023. Local mechanics refuse to touch lithium battery packs or BLDC hub motors.",
            household_count=48,
            confidence_score=0.88,
            urgency_level="High",
            sample_quotes=[
                "My electric scooter battery range dropped from 80km to 25km. The roadside mechanic told me to buy a petrol bike instead.",
            ],
            mapped_career_slugs=["electrician", "solar-microgrid-technician"],
            potential_monthly_market_inr=22000,
        ),
        VillageDemandCategory(
            village="Bilaspur",
            district="Ajmer",
            state="Rajasthan",
            title="Dairy Milk Chilling & Cold Chain Electricals",
            category_slug="dairy-chilling-electricals",
            description="Saras Dairy cooperative chilling collection center suffers compressor relay burnout from three-phase rural voltage fluctuations.",
            household_count=39,
            confidence_score=0.86,
            urgency_level="Moderate",
            sample_quotes=[
                "When three-phase supply drops to 340V, the milk cooler trips. If a local electrician can rewire an auto-cut stabilizer, milk won't sour.",
            ],
            mapped_career_slugs=["electrician", "solar-microgrid-technician"],
            potential_monthly_market_inr=31000,
        ),
        VillageDemandCategory(
            village="Bilaspur",
            district="Ajmer",
            state="Rajasthan",
            title="Soil Health Card Testing & Bio-Fertilizer Guidance",
            category_slug="soil-health-testing",
            description="Farmers need rapid digital NPK soil testing and assistance interpreting official government Soil Health Cards before the Rabi sowing window.",
            household_count=31,
            confidence_score=0.82,
            urgency_level="Moderate",
            sample_quotes=[
                "We over-apply DAP fertilizer because we don't know the exact nitrogen balance in our field.",
            ],
            mapped_career_slugs=["agri-entrepreneur"],
            potential_monthly_market_inr=18000,
        ),
    ]
    for dc in demand_cats:
        db.add(dc)
    db.flush()

    # 3. Gaon Demand Responses
    responses = [
        VillageDemandResponse(
            category_id=demand_cats[0].id,
            village="Bilaspur",
            respondent_name="Mukesh Gurjar",
            respondent_type="Farmer (5 Acres)",
            input_channel="voice",
            transcript_en="Our solar pump inverter trips every afternoon during peak irrigation. We have to wait 3 weeks for an engineer from Jaipur.",
            transcript_hi="दोपहर में सिंचाई के समय सोलर पंप का इन्वर्टर ट्रिप हो जाता है। जयपुर से मैकेनिक आने में तीन हफ्ते लग जाते हैं।",
            confidence=0.98,
            sentiment="urgent",
        ),
        VillageDemandResponse(
            category_id=demand_cats[0].id,
            village="Bilaspur",
            respondent_name="Kailash Choudhary",
            respondent_type="Sarpanch, Gram Panchayat",
            input_channel="survey",
            transcript_en="Under PM-KUSUM, our village got 22 solar pumps. 6 are currently stopped due to loose earthing wires and damaged MC4 connectors.",
            transcript_hi="पीएम-कुसुम के तहत 22 सोलर पंप लगे हैं, जिनमें से 6 अर्थिंग ढीली होने और कनेक्टर खराब होने से बंद पड़े हैं।",
            confidence=0.95,
            sentiment="critical",
        ),
        VillageDemandResponse(
            category_id=demand_cats[1].id,
            village="Bilaspur",
            respondent_name="Ramesh Chand",
            respondent_type="Shopkeeper (Ramesh Kirana)",
            input_channel="voice",
            transcript_en="I want to display QR payments clearly on an acrylic stand and put my monthly ration inventory on WhatsApp.",
            transcript_hi="दुकान पर पक्का क्यूआर कोड स्टैंड लगाना है और हर महीने के राशन का भाव व्हाट्सएप पर भेजना सीखना है।",
            confidence=0.92,
            sentiment="moderate",
        ),
    ]
    for r in responses:
        db.add(r)
    db.flush()

    # 4. MicroGigs (Kamao-Seekho)
    gigs_data = [
        MicroGig(
            title="Digital Saathi: Digitize Ramesh Kirana Store",
            category="digital_saathi",
            business_name="Ramesh Kirana Store, Bilaspur",
            location="Bilaspur Main Chowk",
            description="Assist merchant Ramesh Chand in cataloging 25 fast-moving grocery items, printing an official UPI payment QR standee, and setting up a WhatsApp Business catalog.",
            instructions=[
                "Verify merchant name and UPI VPA ID match",
                "Record 10 common staples (Atta, Dal, Oil, Salt, Sugar) with current prices",
                "Ensure QR code scan test completes with ₹1 confirmation",
                "Take a photo of the completed shop counter display",
            ],
            reward_inr=150,
            duration_minutes=25,
            difficulty="Beginner",
            skill_awarded="Merchant Digitization",
            skill_level="intermediate",
            gold_answer={"min_items": 10, "qr_verified": True},
        ),
        MicroGig(
            title="Technical Audit: Inverter Earthing & Wiring Diagram Check",
            category="job_verification",
            business_name="PM-KUSUM TubeWell #4, Bilaspur",
            location="Bilaspur Field Cluster",
            description="Inspect a newly installed 5HP solar pump junction box. Verify color-coded DC wiring (Red=Positive, Black=Negative, Green/Yellow=Earth) and measure grounding resistance.",
            instructions=[
                "Confirm DC isolator switch is off before opening enclosure",
                "Check grounding wire gauge (minimum 6 sq mm copper or 10 sq mm GI)",
                "Verify earth pit resistance reading is below 5 Ohms on the earth tester",
                "Record findings in the digital inspection checklist",
            ],
            reward_inr=200,
            duration_minutes=35,
            difficulty="Intermediate",
            skill_awarded="Earthing & DC Safety",
            skill_level="intermediate",
            gold_answer={"earth_resistance_ohms_max": 5.0, "dc_isolated": True},
        ),
        MicroGig(
            title="Apprenticeship Audit: Verify NATS Solar Listing Standards",
            category="scholarship_verification",
            business_name="National Apprenticeship Training Scheme",
            location="Remote / Mobile",
            description="Review a technical apprenticeship circular to ensure it provides mandated stipend (min ₹10,500), female apprentice hostel assistance, and accredited safety equipment.",
            instructions=[
                "Check if stipend meets national minimum trade apprentice rates",
                "Verify whether employer provides subsidized accommodation/PG tie-up",
                "Flag any upfront registration fee demands as potential fraud",
            ],
            reward_inr=100,
            duration_minutes=15,
            difficulty="Beginner",
            skill_awarded="Electrical Wiring",
            skill_level="beginner",
            gold_answer={"legitimate": True, "fee_demanded": False},
        ),
        MicroGig(
            title="Language Data: Record 10 Solar Pump Audio Prompts in Marwari/Hindi",
            category="language_data",
            business_name="RaahSetu Voice AI Mission",
            location="Remote / Smartphone Audio",
            description="Record 10 common spoken queries about solar inverters and water pressure in your local regional dialect to train voice models for rural farmers.",
            instructions=[
                "Speak clearly into your smartphone microphone",
                "Read the 10 displayed troubleshooting sentences naturally",
                "Confirm no loud background traffic noise during recording",
            ],
            reward_inr=80,
            duration_minutes=12,
            difficulty="Beginner",
            skill_awarded="Technical Interview & Workplace Readiness",
            skill_level="beginner",
        ),
        MicroGig(
            title="Digital Saathi: Geotag Kisan Seva Kendra on OpenStreetMap",
            category="digital_saathi",
            business_name="Kisan Seva Kendra, Bilaspur",
            location="Bilaspur Bus Stand",
            description="Add the fertilizer and seed distribution center to Google Maps and OpenStreetMap with exact GPS coordinates and operating hours.",
            instructions=[
                "Capture accurate GPS coordinates outside the shop door",
                "Enter opening hours: 8:00 AM – 6:30 PM",
                "Photograph storefront signage showing license number",
            ],
            reward_inr=150,
            duration_minutes=20,
            difficulty="Beginner",
            skill_awarded="Merchant Digitization",
            skill_level="beginner",
        ),
        MicroGig(
            title="Verify PM-KUSUM Subsidy Claim Checklist",
            category="scholarship_verification",
            business_name="Rajasthan Renewable Energy Corp (RRECL)",
            location="Remote / Mobile",
            description="Verify required supporting documents (Land revenue jamabandi, Aadhaar link, electricity discom NOC) for a farmer's solar pump subsidy application.",
            instructions=[
                "Verify applicant name matches land ownership record",
                "Confirm discom NOC specifies agricultural category tariff",
                "Ensure water table depth report is attached",
            ],
            reward_inr=120,
            duration_minutes=20,
            difficulty="Beginner",
            skill_awarded="Solar Inverter Maintenance",
            skill_level="intermediate",
        ),
    ]
    for g in gigs_data:
        db.add(g)
    db.flush()

    # 5. Priya's Wallet & Transactions (Earned ₹1,200)
    wallet = StudentWallet(
        student_id=priya_profile.id,
        balance_inr=1200,
        lifetime_earned_inr=1200,
        pending_inr=0,
        is_simulated=True,
    )
    db.add(wallet)
    db.flush()

    tx1 = WalletTransaction(
        wallet_id=wallet.id,
        transaction_type="micro_gig_reward",
        amount_inr=150,
        title="Digital Saathi: Ramesh Kirana Digitization",
        description="Earned simulated reward & verified badge: Merchant Digitization",
        reference_id=f"GIG-{gigs_data[0].id}-SEED1",
        status="completed",
        created_at=datetime.utcnow() - timedelta(days=5),
    )
    tx2 = WalletTransaction(
        wallet_id=wallet.id,
        transaction_type="micro_gig_reward",
        amount_inr=200,
        title="Technical Audit: Inverter Earthing & Wiring Diagram",
        description="Earned simulated reward & verified badge: Earthing & DC Safety",
        reference_id=f"GIG-{gigs_data[1].id}-SEED2",
        status="completed",
        created_at=datetime.utcnow() - timedelta(days=3),
    )
    tx3 = WalletTransaction(
        wallet_id=wallet.id,
        transaction_type="micro_gig_reward",
        amount_inr=100,
        title="Apprenticeship Audit: NATS Solar Listing Standards",
        description="Earned simulated reward & verified badge: Electrical Wiring",
        reference_id=f"GIG-{gigs_data[2].id}-SEED3",
        status="completed",
        created_at=datetime.utcnow() - timedelta(days=1),
    )
    db.add_all([tx1, tx2, tx3])

    # 6. Priya's Submissions for the first 3 gigs
    sub1 = MicroGigSubmission(
        gig_id=gigs_data[0].id,
        student_id=priya_profile.id,
        submission_data={"shop": "Ramesh Kirana", "items_cataloged": 25, "qr_stand_placed": True},
        status="approved",
        verification_method="Merchant QR Confirmation + Gold Standard Audit",
        reviewer_notes="Merchant Ramesh Chand verified counter standee active. 25 grocery items listed.",
        reward_earned=150,
        submitted_at=datetime.utcnow() - timedelta(days=5),
    )
    sub2 = MicroGigSubmission(
        gig_id=gigs_data[1].id,
        student_id=priya_profile.id,
        submission_data={"earth_resistance": 3.8, "dc_isolated": True, "junction_box": "pass"},
        status="approved",
        verification_method="Automated Heuristic + ITI Instructor Verification",
        reviewer_notes="Measured 3.8 Ohms earth resistance (<5.0 Ohm limit). Safety protocol 100% compliant.",
        reward_earned=200,
        submitted_at=datetime.utcnow() - timedelta(days=3),
    )
    sub3 = MicroGigSubmission(
        gig_id=gigs_data[2].id,
        student_id=priya_profile.id,
        submission_data={"stipend_valid": True, "hostel_provided": True, "fee_demanded": False},
        status="approved",
        verification_method="Cross-referenced with NATS Official Registry",
        reviewer_notes="All 3 compliance checks passed. Validated as an authorized NSDC apprentice listing.",
        reward_earned=100,
        submitted_at=datetime.utcnow() - timedelta(days=1),
    )
    db.add_all([sub1, sub2, sub3])

    # 7. Priya's Skill Passport Evidences
    m_dig_skill = skills.get("Merchant Digitization")
    earth_skill = skills.get("Earthing & DC Safety")
    wire_skill = skills.get("Electrical Wiring")
    scam_skill = skills.get("Digital Safety & Scam Prevention")

    evidences = []
    if m_dig_skill:
        evidences.append(SkillEvidence(
            student_id=priya_profile.id,
            skill_id=m_dig_skill.id,
            evidence_type=EvidenceType.PROJECT,
            task_description="Digital Saathi: Cataloged 25 grocery items & set up UPI QR payment standee for Ramesh Kirana Store, Bilaspur",
            submission_notes="Merchant confirmed catalog active; successfully received ₹1 test payment.",
            reviewer_feedback="Merchant Verified: Shop owner Ramesh Chand verified active payment station.",
            verification_status=VerificationStatus.VERIFIED,
            completed_at=datetime.utcnow() - timedelta(days=5),
        ))
    if earth_skill:
        evidences.append(SkillEvidence(
            student_id=priya_profile.id,
            skill_id=earth_skill.id,
            evidence_type=EvidenceType.ASSESSMENT,
            task_description="Technical Audit: Measured earth pit resistance (3.8 Ohms) & verified DC surge arrestor at Tubewell #4",
            submission_notes="Used digital earth tester under supervision of ITI Ajmer trade instructor.",
            reviewer_feedback="Instructor Certified: High precision measurement meeting IS 3043 earthing safety standard.",
            verification_status=VerificationStatus.VERIFIED,
            completed_at=datetime.utcnow() - timedelta(days=3),
        ))
    if wire_skill:
        evidences.append(SkillEvidence(
            student_id=priya_profile.id,
            skill_id=wire_skill.id,
            evidence_type=EvidenceType.MENTOR_VERIFIED,
            task_description="Wired 4-panel solar string combiner box with MC4 connectors & verified open-circuit voltage Voc=182V",
            submission_notes="Completed trade certification practical component with zero polarity errors.",
            reviewer_feedback="Facilitator Verified: 100% compliance with IEC 62548 installation guidelines.",
            verification_status=VerificationStatus.VERIFIED,
            completed_at=datetime.utcnow() - timedelta(days=1),
        ))
    if scam_skill:
        evidences.append(SkillEvidence(
            student_id=priya_profile.id,
            skill_id=scam_skill.id,
            evidence_type=EvidenceType.ASSESSMENT,
            task_description="Fraud Dojo: Identified 4 red flags in simulated railway apprentice WhatsApp scam",
            submission_notes="Scored 100% on advance-fee recruitment fraud detection challenge.",
            reviewer_feedback="Awarded Anti-Fraud Vigilance Badge: Accurately identified WhatsApp fee extortion.",
            verification_status=VerificationStatus.VERIFIED,
            completed_at=datetime.utcnow() - timedelta(days=2),
        ))
    for ev in evidences:
        db.add(ev)
    db.flush()

    # 8. Tata Power Solar Apprenticeship Opportunity & Saved Opportunity
    tata_opp = db.query(Opportunity).filter(
        Opportunity.title.ilike("%Tata Power Solar Microgrid%")
    ).first()
    if tata_opp:
        saved_opp = SavedOpportunity(
            student_id=priya_profile.id,
            opportunity_id=tata_opp.id,
            status="offered",
            notes="Formal apprentice offer letter received from Tata Power Renewable Energy Pune cluster. Stipend: ₹12,000/month.",
            saved_at=datetime.utcnow() - timedelta(days=4),
        )
        db.add(saved_opp)

        # 9. Pehla Kadam Bridge Funding Request for Priya (₹8,000)
        bridge_req = BridgeFundingRequest(
            student_id=priya_profile.id,
            opportunity_id=tata_opp.id,
            travel_expense=1800,
            accommodation_deposit=3500,
            equipment_gear_expense=1500,
            living_buffer_expense=1200,
            total_requested_inr=8000,
            student_savings_allocated=0,
            net_funding_gap_inr=8000,
            status="approved",
            grant_type="CSR Zero-Interest Transition Grant",
            employer_verified=True,
            skill_evidence_count=3,
            evaluation_factors={
                "employer_verification": {"status": "PASS", "detail": "Tata Power Apprenticeship physically audited by NSDC"},
                "skill_passport_audit": {"status": "PASS", "detail": "3 verified Kamao-Seekho badges in Skill Passport"},
                "geographic_priority": {"status": "PASS", "detail": "Rural district (Ajmer/Bilaspur), ITI first-generation technician"},
                "dropout_risk_mitigation": {"status": "HIGH_IMPACT", "detail": "Upfront relocation barrier eliminated; predicted 94% joining success rate"}
            },
            repayment_model="100% Waived Upon 30 Days Apprenticeship Verification",
            terms_explanation="Approved for ₹8,000 Zero-Debt Transition Grant backed by Citi/NSDC CSR fund. 100% converted to non-repayable award upon 30 days active apprenticeship attendance. Zero interest, zero collateral, zero debt liability.",
            disbursement_notes="Direct vendor voucher for train booking + PG hostel deposit guarantee",
            applied_at=datetime.utcnow() - timedelta(days=2),
            decided_at=datetime.utcnow() - timedelta(days=2),
        )
        db.add(bridge_req)

        # 10. Pravas Kavach Migration Safety Dossier for Priya
        pravas = PravasKavachRecord(
            student_id=priya_profile.id,
            opportunity_id=tata_opp.id,
            destination_city="Pune, Maharashtra",
            employer_name="Tata Power Renewable Energy",
            workplace_audit_status="Verified (Grade A Safety)",
            workplace_audit_notes="Physical inspection verified by District Skill Mission. 42 female technicians on shift, biometric gate, transport van provided.",
            accommodation_name="Suman Mahila Working Women & Apprentice PG Hostel",
            accommodation_address="Plot 14, Near Kharadi EON IT Park Bypass, Pune 411014",
            accommodation_verified=True,
            warden_contact="Mrs. Rekha Patil",
            warden_phone="+91 98221 44501",
            emergency_contacts=[
                {"name": "National Women Helpline (24x7)", "phone": "181", "type": "National Emergency"},
                {"name": "National Police Emergency", "phone": "112", "type": "Emergency"},
                {"name": "RaahSetu Student Pravas Desk", "phone": "+91 800-722-4738", "type": "Platform Desk"},
                {"name": "Mrs. Anjali Deshmukh (Pune District Facilitator)", "phone": "+91 98450 12345", "type": "Local Mentor"},
            ],
            checklist_status={
                "train_ticket": True,
                "identity_docs": True,
                "safety_gear": True,
                "emergency_cash": True,
                "hostel_booking": True,
                "family_consent": True,
            },
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
        db.add(pravas)

    # 11. Fraud Dojo Scenarios
    scenarios = [
        FraudDojoScenario(
            title="Fake Railway Apprentice Appointment Letter via WhatsApp",
            scenario_type="job_scam",
            channel="WhatsApp / SMS",
            message_text="URGENT: Ministry of Railways has approved direct appointment for ITI diploma holders as Junior Assistant. No exam needed. Pay ₹1,850 processing fee via Google Pay to 9876543210 to receive joining letter by tomorrow 10 AM.",
            sender_info="+91 98765 43210 (Displays Indian Railways Logo)",
            red_flags=[
                "Payment demanded via personal UPI / Google Pay",
                "Direct appointment claim with no recruitment exam or official notification",
                "Official communications never occur via unverified WhatsApp numbers",
                "Artificial urgency ('pay by tomorrow 10 AM')",
            ],
            correct_action="Do not pay. Report number to National Cyber Crime Portal (cybercrime.gov.in) and check official RRC website.",
            explanation="Indian Railways and government undertakings NEVER ask for fees via personal UPI, never issue appointment letters on WhatsApp, and recruit exclusively via official exams on rrbbnc.gov.in.",
            badge_name="Anti-Fraud Vigilance Badge",
            order_index=1,
        ),
        FraudDojoScenario(
            title="Fake PM-Kisan Beti Yojna ₹25,000 Direct Benefit Transfer",
            scenario_type="scholarship_fraud",
            channel="SMS with Web Link",
            message_text="Congratulations! You have been selected for PM Beti Vikas Sahayata of ₹25,000. Click https://pm-yojana-grant.xyz to verify your bank and enter your UPI PIN to claim money instantly.",
            sender_info="SMS from 'VK-GOVTIN'",
            red_flags=[
                "Entering UPI PIN is ONLY for paying money, NEVER for receiving money",
                "Unofficial fake domain (.xyz instead of .gov.in)",
                "Scheme does not exist under official government portal",
            ],
            correct_action="Never enter your UPI PIN to receive money. Delete message and inform village panchayat.",
            explanation="In Indian banking and UPI architecture, entering your UPI PIN always DEBITS money from your account. You NEVER need to enter a PIN to receive a government grant or DBT transfer.",
            badge_name="UPI Security Guardian",
            order_index=2,
        ),
        FraudDojoScenario(
            title="Unregistered Overseas Solar Technician Placement Agency",
            scenario_type="recruitment_fraud",
            channel="Flyer / Telegram Group",
            message_text="Immediate recruitment: 100 Solar Technicians needed in Dubai & Kuwait. Free visa and ticket provided. No passport required at interview. Only pay ₹5,000 document attestation fee to our agent.",
            sender_info="Global Overseas Placements (Telegram)",
            red_flags=[
                "Agency lacks mandatory Ministry of External Affairs (MEA) Registration Number",
                "Claiming 'no passport required' for international placement",
                "Upfront document fee charged to candidate (illegal under Emigration Act)",
            ],
            correct_action="Verify agency on official e-Migrate portal (emigrate.gov.in). Registered recruiting agents cannot charge upfront unvouched fees.",
            explanation="Under the Emigration Act 1983, only MEA-licensed recruiting agents can process overseas employment. Unregistered agents frequently trap rural workers with forged visas and confiscated documents.",
            badge_name="Migration Safety Shield",
            order_index=3,
        ),
    ]
    for sc in scenarios:
        db.add(sc)
    db.flush()

    # Priya's completed Fraud Dojo record
    rec = StudentFraudDojoRecord(
        student_id=priya_profile.id,
        scenario_id=scenarios[0].id,
        flagged_items=scenarios[0].red_flags,
        score=100,
        passed=True,
        completed_at=datetime.utcnow() - timedelta(days=2),
    )
    db.add(rec)

    # 12. Mock Interview Session for Priya
    interview = MockInterviewSession(
        student_id=priya_profile.id,
        opportunity_id=tata_opp.id if tata_opp else None,
        career_slug="solar-microgrid-technician",
        overall_score=88,
        rubric_scores={
            "technical_accuracy": 88,
            "safety_compliance": 92,
            "practical_clarity": 84,
            "problem_solving": 86,
        },
        transcript_qa=[
            {
                "question": "When approaching a malfunctioning solar pump inverter in the field, what is the very first safety step?",
                "answer": "First, switch off the DC isolator switch and AC breaker. Wait 5 minutes for internal capacitors to discharge. Then use an insulated multimeter to verify zero voltage before touching any terminal.",
            },
            {
                "question": "A village mini-grid shows 0V output at the AC bus midday. How do you diagnose it?",
                "answer": "I trace the system systematically: first check string DC voltage into the charge controller, then test battery bank terminal voltage, and check the inverter error display code.",
            },
        ],
        actionable_feedback=[
            "Excellent emphasis on the 5-minute capacitor discharge wait time.",
            "Strong procedural explanation of multimeter zero-energy verification.",
        ],
        strengths=[
            "Flawless DC safety sequence compliant with IS 62548 standards.",
            "Calm, structured diagnostic thinking suitable for field apprentice roles.",
        ],
        completed_at=datetime.utcnow() - timedelta(days=1),
    )
    db.add(interview)
    db.flush()
