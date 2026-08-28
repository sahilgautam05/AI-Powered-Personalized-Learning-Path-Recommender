import json
import sqlite3
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional

from backend.database import get_db_connection
from backend.models import (
    LearnerProfile, GoalAnalysisRequest, SkillGapResponse, SkillGapItem,
    RecommendationRequest, ResourceItem, LearningPathResponse, PhaseModule,
    AssessmentDetail, AssessmentQuestion, AssessmentSubmit, AssessmentResult,
    FeedbackSubmit, ChatRequest, ChatResponse, LoginRequest, RegisterRequest, NotificationItem
)
from backend.recommender import rank_resources, calculate_recommendation_score, GOAL_SKILL_REQUIREMENTS, get_goal_requirements
from backend.ai_service import generate_ai_chat_response

router = APIRouter(prefix="/api")

# Auth Login Endpoint
@router.post("/auth/login", response_model=LearnerProfile)
def login_user(credentials: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (credentials.email.strip(),))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=401, detail="User account not found. Please register a new account.")

    db_pass = row["password"] if "password" in row.keys() else "password123"
    if db_pass and db_pass != credentials.password:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid password. Please check your credentials.")

    conn.close()
    return get_user_profile(row["id"])

# Auth Register Endpoint
@router.post("/auth/register", response_model=LearnerProfile)
def register_user(req: RegisterRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user email already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    existing_row = cursor.fetchone()
    
    if existing_row:
        user_id = existing_row["id"]
        cursor.execute("""
            UPDATE users SET name = ?, password = ?, goal = ?, experience = ?
            WHERE id = ?
        """, (req.name, req.password, req.goal or "Become a Full Stack Developer", req.experience or "Intermediate", user_id))
    else:
        import re, uuid
        clean_prefix = re.sub(r'[^a-zA-Z0-9]', '_', req.email.split("@")[0])
        user_id = f"user_{clean_prefix}_{uuid.uuid4().hex[:6]}"
        cursor.execute("""
            INSERT INTO users (id, name, email, password, goal, experience, weekly_hours, target_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, req.name, req.email, req.password, req.goal or "Become a Full Stack Developer", req.experience or "Intermediate", req.weekly_hours or 10, req.target_duration or "6 Months"))

    if req.existing_skills:
        for s_name, s_lvl in req.existing_skills.items():
            cursor.execute("""
                INSERT INTO user_skills (user_id, skill_name, level)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id, skill_name) DO UPDATE SET level = excluded.level
            """, (user_id, s_name, s_lvl))
            
    conn.commit()
    conn.close()
    return get_user_profile(user_id)

@router.get("/profile/{user_id}", response_model=LearnerProfile)
def fetch_profile_by_id(user_id: str):
    return get_user_profile(user_id)

# Helper to fetch user profile
def get_user_profile(user_id: str = "demo_learner_01") -> LearnerProfile:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return LearnerProfile()

    # Fetch user skills
    cursor.execute("SELECT skill_name, level FROM user_skills WHERE user_id = ?", (user_id,))
    skills_rows = cursor.fetchall()
    skills_dict = {r["skill_name"]: r["level"] for r in skills_rows}
    conn.close()

    return LearnerProfile(
        user_id=row["id"],
        name=row["name"],
        email=row["email"],
        password=row["password"] if "password" in row.keys() else "password123",
        goal=row["goal"],
        experience=row["experience"],
        weekly_hours=row["weekly_hours"],
        target_duration=row["target_duration"],
        existing_skills=skills_dict,
        onboarded=bool(row["onboarded"]) if ("onboarded" in row.keys() and row["onboarded"]) else False
    )

# 1. Profile Endpoint
@router.post("/profile", response_model=LearnerProfile)
def save_profile(profile: LearnerProfile):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Upsert User
    cursor.execute("""
        INSERT INTO users (id, name, email, password, goal, experience, weekly_hours, target_duration, onboarded)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            email=excluded.email,
            password=COALESCE(excluded.password, users.password),
            goal=excluded.goal,
            experience=excluded.experience,
            weekly_hours=excluded.weekly_hours,
            target_duration=excluded.target_duration,
            onboarded=1
    """, (profile.user_id, profile.name, profile.email, profile.password or "password123", profile.goal, profile.experience, profile.weekly_hours, profile.target_duration))

    # Clear & Insert Skills
    cursor.execute("DELETE FROM user_skills WHERE user_id = ?", (profile.user_id,))
    for skill_name, level in profile.existing_skills.items():
        cursor.execute("INSERT INTO user_skills (user_id, skill_name, level) VALUES (?, ?, ?)",
                       (profile.user_id, skill_name, level))

    # Upsert Learning Path for User
    cursor.execute("SELECT id FROM learning_paths WHERE user_id = ?", (profile.user_id,))
    path_exists = cursor.fetchone()
    if path_exists:
        cursor.execute("UPDATE learning_paths SET goal = ? WHERE user_id = ?", (profile.goal, profile.user_id))
    else:
        cursor.execute("""
            INSERT INTO learning_paths (id, user_id, goal, overall_progress, current_milestone)
            VALUES (?, ?, ?, 68, 'Security Tools & SIEM Analysis')
        """, (f"path_{profile.user_id}", profile.user_id, profile.goal))

    conn.commit()
    conn.close()
    return profile

# 2. Analyze Goal Endpoint
@router.post("/analyze-goal")
def analyze_goal(req: GoalAnalysisRequest):
    goal = req.goal
    reqs = get_goal_requirements(goal)
    
    suggested_skills = list(reqs.keys())
    return {
        "goal": goal,
        "analyzed": True,
        "required_skills": reqs,
        "suggested_skills": suggested_skills,
        "estimated_duration": "6 Months",
        "recommended_pace": "8 - 12 hours/week"
    }

# 3. Skill Gap Endpoint
@router.post("/skill-gap", response_model=SkillGapResponse)
def compute_skill_gap(profile: Optional[LearnerProfile] = None):
    if not profile or not profile.goal:
        profile = get_user_profile("sahil_01")
    
    goal_reqs = get_goal_requirements(profile.goal)
    items = []
    
    for skill_name, req_level in goal_reqs.items():
        curr_level = profile.existing_skills.get(skill_name, 0)
        gap = max(0, req_level - curr_level)
        items.append(SkillGapItem(
            skill_name=skill_name,
            current_level=curr_level,
            required_level=req_level,
            gap=gap,
            category="Technical",
            recommended_resource_ids=["res_03", "res_05"] if gap > 30 else []
        ))
    
    # Sort by gap descending
    items.sort(key=lambda x: x.gap, reverse=True)

    return SkillGapResponse(goal=profile.goal, skills=items)

# 4. Recommendations Endpoint
@router.post("/recommendations", response_model=List[ResourceItem])
def get_recommendations(req: RecommendationRequest):
    profile = get_user_profile(req.user_id)
    
    # 1. Fetch domain-tailored resources from user's active goal roadmap
    goal_phases = generate_goal_tailored_phases(profile.goal, profile)
    tailored_resources = []
    for ph in goal_phases:
        tailored_resources.extend(ph.resources)

    # 2. Fetch database resources
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resources")
    rows = cursor.fetchall()
    conn.close()

    db_resources = []
    for r in rows:
        db_resources.append(ResourceItem(
            id=r["id"],
            title=r["title"],
            type=r["type"],
            description=r["description"],
            difficulty=r["difficulty"],
            duration_hours=r["duration_hours"],
            skills=json.loads(r["skills"]),
            prerequisites=json.loads(r["prerequisites"]),
            url=r["url"]
        ))

    # Combine unique resources
    seen_ids = set()
    combined_resources = []
    for res in (tailored_resources + db_resources):
        if res.id not in seen_ids:
            seen_ids.add(res.id)
            combined_resources.append(res)

    ranked = rank_resources(combined_resources, profile)
    return ranked[:req.limit]

def make_phase(mod_id: str, title: str, desc: str, status: str, weeks: int, res_tuples: List[tuple], proj_title: str = None, quiz_id: str = None) -> PhaseModule:
    resources = [
        ResourceItem(
            id=r[0], title=r[1], type=r[2], description=r[3],
            difficulty=r[4], duration_hours=float(r[5]), skills=r[6],
            prerequisites=r[7] if len(r)>7 else [],
            match_score=r[8] if len(r)>8 else 95,
            why_recommended=r[9] if len(r)>9 else "Recommended for target goal requirement.",
            url=r[10] if len(r)>10 else f"https://www.google.com/search?q={r[1].replace(' ', '+')}+free+course"
        ) for r in res_tuples
    ]
    return PhaseModule(
        id=mod_id, title=title, description=desc, status=status,
        estimated_weeks=weeks, resources=resources,
        project={"title": proj_title, "type": "Project", "status": status} if proj_title else None,
        assessment_id=quiz_id
    )

def generate_goal_tailored_phases(goal: str, profile: LearnerProfile) -> List[PhaseModule]:
    g_lower = goal.lower() if goal else ""

    if "game" in g_lower or "10" in g_lower or "junior" in g_lower or "scratch" in g_lower:
        return [
            make_phase("mod_jr_01", "01 — Computational Thinking & Block Coding", "Learn logic building, loops, and sequences through visual block programming.", "completed", 2, [("jr_res_01", "Scratch Game Programming Foundations", "Hands-on Lab", "Create interactive animations and mini-games.", "Beginner", 4.0, ["Block Coding & Logic"], [], 98, "Visual intro for ages 10-16.", "https://scratch.mit.edu/")], "Interactive Arcade Game in Scratch", "quiz_01"),
            make_phase("mod_jr_02", "02 — Intro to Real Code with Python", "Transition to real Python syntax: variables, input, and functions.", "completed", 3, [("jr_res_02", "Python for Young Coders", "Course", "Step-by-step introduction to text-based Python.", "Beginner", 6.0, ["Python"], ["Block Coding"], 95, "Transition to Python.", "https://docs.python.org/3/tutorial/index.html")], "Text Adventure Game in Python", "quiz_02"),
            make_phase("mod_jr_03", "03 — Web Graphics & Pygame Studio", "Build 2D arcade games with graphics, collision detection, and scoreboards.", "in_progress", 3, [("jr_res_03", "2D Game Dev with Pygame", "Project", "Code a Space Invaders clone with animated sprites.", "Intermediate", 8.0, ["Game Dev", "Python"], ["Python"], 96, "Game engineering practice.", "https://www.pygame.org/wiki/GettingStarted")], "Space Shooter 2D Game Project", "quiz_03"),
            make_phase("mod_jr_04", "04 — Web Basics (HTML & CSS Styling)", "Create custom webpages with HTML5 elements and CSS layouts.", "upcoming", 3, [("jr_res_04", "Web Design for Beginners", "Course", "Design personal fan pages and interactive blogs.", "Beginner", 5.0, ["HTML/CSS"], [], 92, "Web publishing skills.", "https://developer.mozilla.org/en-US/docs/Learn")], "Personal Hobbies Webpage", "quiz_04"),
            make_phase("mod_jr_05", "05 — Junior Innovator Capstone Project", "Design and publish a multi-level game or web application.", "upcoming", 4, [("jr_res_05", "Junior Game & Web Capstone", "Project", "Combine Python game logic and web presentation.", "Intermediate", 12.0, ["Game Dev", "Python"], ["Python"], 99, "Final junior portfolio milestone.", "https://code.org/")], "Junior Innovator Capstone Project", "quiz_05")
        ]
    elif "leader" in g_lower or "manage" in g_lower or "agile" in g_lower:
        return [
            make_phase("mod_ld_01", "01 — Agile & Scrum Frameworks", "Master Scrum events, sprint planning, and JIRA workflows.", "completed", 2, [("ld_res_01", "Agile Scrum Master Guide", "Course", "Lead high-performing engineering teams with Scrum.", "Intermediate", 6.0, ["Project & Agile Management (Scrum)"], [], 96, "Core management requirement.", "https://www.scrum.org/resources/what-is-scrum")], "Sprint Planning & Backlog Roadmap", "quiz_01"),
            make_phase("mod_ld_02", "02 — Technical Communication & Stakeholders", "Bridge technical engineering architectures with executive business metrics.", "completed", 3, [("ld_res_02", "Executive Communication", "Article", "Presenting system design tradeoffs to business stakeholders.", "Intermediate", 4.0, ["Technical Communication"], [], 94, "Enhances leadership influence.", "https://ocw.mit.edu/")], "Executive Architecture Pitch", "quiz_02"),
            make_phase("mod_ld_03", "03 — System Architecture & High-Level Design", "Evaluate microservices vs monoliths, cloud cost optimization, and SLA guarantees.", "in_progress", 3, [("ld_res_03", "Enterprise System Architecture", "Hands-on Lab", "Designing fault-tolerant, scalable cloud infrastructure.", "Advanced", 8.0, ["System Design"], [], 97, "Strategic technical decision making.", "https://aws.amazon.com/architecture/")], "Enterprise Cloud Architecture Spec", "quiz_03"),
            make_phase("mod_ld_04", "04 — Product Strategy & Business Analytics", "Define product OKRs, KPI metrics, unit economics, and AI integration.", "upcoming", 3, [("ld_res_04", "Data-Driven Product Management", "Course", "Leveraging data analytics to drive strategic product roadmaps.", "Advanced", 7.0, ["Product Strategy & Business Analysis"], [], 93, "Product strategy alignment.", "https://www.coursera.org/courses?query=product%20management")], "Data-Driven Product Roadmap", "quiz_04"),
            make_phase("mod_ld_05", "05 — Engineering Leadership Capstone", "Lead an end-to-end digital transformation initiative and team scaling.", "upcoming", 4, [("ld_res_05", "Digital Transformation Capstone", "Project", "Develop a 3-year enterprise technology modernization playbook.", "Advanced", 15.0, ["Leadership & Team Management"], [], 99, "Senior leadership capstone.", "https://hbr.org/topic/digital-transformation")], "Engineering Leadership Capstone Project", "quiz_05")
        ]
    elif "data" in g_lower:
        return [
            make_phase("mod_ds_01", "01 — Python & Data Wrangling", "Master Python data structures, Pandas DataFrames, and SQL extractions.", "completed", 2, [("ds_res_01", "Python for Data Science", "Course", "Guide to Python, Pandas DataFrames, and data manipulation.", "Beginner", 6.0, ["Python", "Pandas"], [], 95, "Matches Data Scientist target.", "https://www.kaggle.com/learn/python"), ("ds_res_02", "SQL Queries for Analysts", "Article", "Join queries, aggregations, and window functions.", "Intermediate", 3.0, ["SQL"], [], 90, "Addresses SQL data extraction.", "https://www.kaggle.com/learn/advanced-sql")], "E-Commerce Customer Data Cleaning", "quiz_01"),
            make_phase("mod_ds_02", "02 — Exploratory Data Analysis & Visualization", "Perform EDA using Matplotlib, Seaborn, and feature scaling.", "completed", 3, [("ds_res_03", "Data Visualization with Seaborn", "Video", "Plotting distribution curves and correlation heatmaps.", "Intermediate", 4.0, ["Data Visualization", "Python"], ["Python"], 92, "Essential for visual insight.", "https://seaborn.pydata.org/tutorial.html")], "Exploratory Data Analysis Dashboard", "quiz_02"),
            make_phase("mod_ds_03", "03 — Machine Learning & Scikit-Learn", "Supervised learning, regression models, decision trees, and XGBoost.", "in_progress", 3, [("ds_res_04", "Scikit-Learn ML Pipelines", "Hands-on Lab", "Build ML pipelines with cross-validation and hyperparameter tuning.", "Intermediate", 7.0, ["Machine Learning", "Python"], ["Python"], 96, "Targets core ML gap.", "https://scikit-learn.org/stable/tutorial/index.html")], "Churn Prediction ML Pipeline", "quiz_03"),
            make_phase("mod_ds_04", "04 — Deep Learning & Neural Networks", "Build PyTorch artificial neural networks and CNN image classifiers.", "upcoming", 4, [("ds_res_06", "PyTorch Neural Network Architecture", "Course", "Implement custom loss functions and PyTorch dataloaders.", "Advanced", 8.0, ["Deep Learning", "PyTorch"], ["Python"], 91, "Prepares for deep learning.", "https://pytorch.org/tutorials/beginner/basics/intro.html")], "Computer Vision Image Classifier", "quiz_04"),
            make_phase("mod_ds_05", "05 — Applied Data Science Capstone", "Deploy machine learning models via FastAPI REST APIs with Docker.", "upcoming", 4, [("ds_res_07", "Production ML Model Deployment", "Project", "Package PyTorch and Scikit-Learn models into microservice APIs.", "Advanced", 15.0, ["Machine Learning", "Python", "SQL"], ["Machine Learning"], 98, "Capstone portfolio requirement.", "https://fastapi.tiangolo.com/tutorial/")], "Data Scientist End-to-End Capstone", "quiz_05")
        ]
    elif "web" in g_lower or "full" in g_lower or "dev" in g_lower:
        return [
            make_phase("mod_fs_01", "01 — Web & Frontend Fundamentals", "Modern HTML5, CSS Flexbox/Grid, JavaScript ES6+, and Git.", "completed", 2, [("fs_res_01", "Modern JavaScript ES6+ Deep Dive", "Course", "DOM manipulation, promises, fetch API, and async/await.", "Beginner", 8.0, ["JavaScript"], [], 95, "Foundational Full Stack requirement.", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide")], "Responsive Portfolio Website", "quiz_01"),
            make_phase("mod_fs_02", "02 — React Component Architecture & State", "React.js hooks, component lifecycle, router navigation, and state.", "completed", 3, [("fs_res_02", "React 18 & Hook Patterns", "Course", "Build dynamic single-page web applications with reusable components.", "Intermediate", 10.0, ["React", "JavaScript"], ["JavaScript"], 98, "Directly addresses React goal.", "https://react.dev/learn")], "Interactive Task Manager App", "quiz_02"),
            make_phase("mod_fs_03", "03 — Backend APIs & Node.js / Python", "Construct RESTful API microservices with express middleware and JWT.", "in_progress", 3, [("fs_res_03", "Node.js & Express REST API Mastery", "Hands-on Lab", "Build secure API endpoints, input validation, and JWT auth.", "Intermediate", 8.0, ["Node.js", "JavaScript"], ["JavaScript"], 94, "Core backend skill focus area.", "https://expressjs.com/en/starter/installing.html")], "REST API Microservice Project", "quiz_03"),
            make_phase("mod_fs_04", "04 — Database & Full Stack Integration", "Relational SQL database design, PostgreSQL indexing, and Redis caching.", "upcoming", 4, [("fs_res_04", "PostgreSQL & SQL Schema Design", "Course", "Relational tables, foreign keys, transactions, and query optimization.", "Intermediate", 7.0, ["SQL", "Node.js"], ["SQL"], 92, "Essential data layer integration.", "https://www.postgresql.org/docs/current/tutorial.html")], "Full Stack Database Integration Lab", "quiz_04"),
            make_phase("mod_fs_05", "05 — Production SaaS Capstone Project", "Deploy full stack application to Vercel/Render with CI/CD GitHub Actions.", "upcoming", 4, [("fs_res_05", "Full Stack Deployment Capstone", "Project", "Containerize app with Docker, configure SSL, and deploy to cloud.", "Advanced", 18.0, ["React", "Node.js", "SQL", "Git"], ["React", "Node.js"], 99, "Final portfolio capstone project.", "https://vercel.com/docs")], "Full Stack SaaS Capstone Project", "quiz_05")
        ]
    elif "ai" in g_lower or "ml" in g_lower or "prompt" in g_lower:
        return [
            make_phase("mod_ai_01", "01 — Python & Math Foundations for AI", "Linear algebra, matrix operations, calculus for gradients, and NumPy.", "completed", 2, [("ai_res_01", "Python & Matrix Math for ML", "Course", "Vectorized operations with NumPy, matrix multiplication, and derivatives.", "Beginner", 6.0, ["Python", "Math & Linear Algebra"], [], 95, "Foundational math for AI.", "https://numpy.org/doc/stable/user/absolute_beginners.html")], "NumPy Vectorized Neural Operations", "quiz_01"),
            make_phase("mod_ai_02", "02 — Core Machine Learning Algorithms", "Supervised learning, gradient descent optimization, and Scikit-Learn.", "completed", 3, [("ai_res_02", "Applied ML with Scikit-Learn", "Course", "Regression, decision trees, clustering, and model validation.", "Intermediate", 8.0, ["Machine Learning", "Python"], ["Python"], 94, "Core ML concept requirement.", "https://scikit-learn.org/stable/getting_started.html")], "Predictive ML Model Pipeline", "quiz_02"),
            make_phase("mod_ai_03", "03 — Deep Learning & PyTorch Architectures", "Artificial Neural Networks, backpropagation algorithms, and PyTorch.", "in_progress", 3, [("ai_res_03", "PyTorch Deep Learning Architecture", "Hands-on Lab", "Build custom neural networks, loss functions, and training loops.", "Intermediate", 9.0, ["PyTorch/TensorFlow", "Deep Learning"], ["Python"], 97, "Primary Deep Learning focus area.", "https://pytorch.org/tutorials/")], "PyTorch Neural Classifier Lab", "quiz_03"),
            make_phase("mod_ai_04", "04 — LLMs, RAG & Vector Databases", "Transformer attention mechanisms, LangChain, vector embeddings, and RAG.", "upcoming", 4, [("ai_res_04", "Building RAG Pipelines with LangChain", "Course", "Ingest PDF documents, generate vector embeddings, and build Q&A RAG bots.", "Intermediate", 10.0, ["LLMs & RAG", "Prompt Engineering"], ["Python"], 99, "High-demand LLM RAG architecture.", "https://python.langchain.com/v0.2/docs/introduction/")], "Enterprise Knowledge RAG Chatbot", "quiz_04"),
            make_phase("mod_ai_05", "05 — Autonomous AI Agent Capstone", "Build multi-agent workflows, tool calling, model quantization, and fine-tuning.", "upcoming", 4, [("ai_res_05", "Production Autonomous AI Agents", "Project", "Develop autonomous LLM agents with memory and code tools.", "Advanced", 20.0, ["LLMs & RAG", "Python"], ["LLMs & RAG"], 98, "State-of-the-art AI Engineer capstone.", "https://huggingface.co/docs")], "Autonomous AI Agent System Capstone", "quiz_05")
        ]
    elif "placement" in g_lower or "interview" in g_lower or "dsa" in g_lower:
        return [
            make_phase("mod_pl_01", "01 — Data Structures & Algorithms Core", "Time & space complexity (Big-O), arrays, strings, stacks & queues.", "completed", 3, [("pl_res_01", "DSA Core Fundamentals & Patterns", "Course", "Master two-pointer technique, sliding window, and stack patterns.", "Beginner", 10.0, ["Data Structures & Algorithms"], [], 98, "Essential foundation for screens.", "https://www.geeksforgeeks.org/data-structures/")], "LeetCode Patterns Problem Set 1", "quiz_01"),
            make_phase("mod_pl_02", "02 — Advanced Algorithms & Dynamic Programming", "Trees, Graphs (BFS/DFS), Binary Search, and Dynamic Programming.", "completed", 4, [("pl_res_02", "Dynamic Programming & Graph Patterns", "Course", "Top-down memoization, bottom-up DP tables, and Dijkstra.", "Intermediate", 12.0, ["Data Structures & Algorithms"], ["Data Structures & Algorithms"], 96, "High-frequency interview topic.", "https://leetcode.com/explore/")], "Graph & DP Problem Solving Set", "quiz_02"),
            make_phase("mod_pl_03", "03 — CS Fundamentals (OS, DBMS, Networks)", "Operating System scheduling/deadlocks, DBMS indexing/ACID, and TCP/IP.", "in_progress", 3, [("pl_res_03", "Core CS Interview Revision", "Hands-on Lab", "OS thread synchronization, SQL query tuning, and OSI layer flow.", "Intermediate", 8.0, ["System Design", "SQL"], [], 94, "Mandatory for core rounds.", "https://www.geeksforgeeks.org/operating-systems/")], "DBMS Indexing & Concurrency Lab", "quiz_03"),
            make_phase("mod_pl_04", "04 — Low-Level & High-Level System Design", "OOP design patterns, SOLID principles, load balancing, and rate limiters.", "upcoming", 3, [("pl_res_04", "System Design for Placements (LLD & HLD)", "Course", "Design URL Shortener, Messenger App, and Rate Limiter.", "Intermediate", 10.0, ["System Design"], ["System Design"], 95, "Crucial for senior rounds.", "https://github.com/donnemartin/system-design-primer")], "Scalable Messenger System Design", "quiz_04"),
            make_phase("mod_pl_05", "05 — Placement Mock Interview & Capstone", "Simulated FAANG technical interviews and timed coding screens.", "upcoming", 3, [("pl_res_05", "FAANG Mock Interview Screen", "Project", "Solve 3 hard algorithm problems under 45-minute timed constraints.", "Advanced", 15.0, ["Data Structures & Algorithms"], ["Data Structures & Algorithms"], 99, "Final placement readiness assessment.", "https://leetcode.com/problemset/all/")], "Technical Placement Capstone", "quiz_05")
        ]
    elif "startup" in g_lower:
        return [
            make_phase("mod_st_01", "01 — Product Ideation & AI Stack Selection", "Define MVP scope, architectural design, selecting tech stack.", "completed", 2, [("st_res_01", "AI SaaS Product Architecture", "Course", "Architect scalable multi-tenant AI SaaS apps.", "Beginner", 6.0, ["Product Management"], [], 95, "Foundational startup blueprint.", "https://www.ycombinator.com/library")], "AI Startup Technical PRD", "quiz_01"),
            make_phase("mod_st_02", "02 — AI RAG Pipeline & Vector DB Engine", "Build fast retrieval-augmented generation engine and vector indexing.", "completed", 3, [("st_res_02", "Vector DB & RAG Core Engine", "Hands-on Lab", "Ingest user data into Chroma/Pinecone vector databases.", "Intermediate", 8.0, ["LLMs & RAG", "Python"], ["Python"], 98, "Core AI value feature.", "https://docs.pinecone.io/docs/overview")], "RAG AI Engine Backend", "quiz_02"),
            make_phase("mod_st_03", "03 — SaaS Frontend UI & Stripe Payments", "Responsive React UI dashboard, authentication flows, and Stripe billing.", "in_progress", 3, [("st_res_03", "Stripe Subscription Payments", "Hands-on Lab", "Implement recurring SaaS tiers, webhooks, and user sessions.", "Intermediate", 7.0, ["Full Stack Architecture"], ["Python"], 96, "Essential monetization engine.", "https://stripe.com/docs/billing/subscriptions/build-subscriptions")], "SaaS Monetization & User Dashboard", "quiz_03"),
            make_phase("mod_st_04", "04 — DevOps, Docker & Cloud Infrastructure", "Containerize microservices with Docker and deploy on AWS/GCP.", "upcoming", 3, [("st_res_04", "AWS Cloud Infrastructure & Docker", "Course", "Set up automated deployment pipelines, HTTPS, and logging.", "Intermediate", 8.0, ["DevOps & Cloud"], ["Python"], 93, "Ensures 99.9% uptime.", "https://docs.docker.com/get-started/")], "Automated Cloud Deployment Pipeline", "quiz_04"),
            make_phase("mod_st_05", "05 — Launch, Growth Engineering & Analytics", "Integrate telemetry, user feedback loops, and launch on Product Hunt.", "upcoming", 3, [("st_res_05", "AI SaaS Launch Capstone", "Project", "Public launch checklist, telemetry analytics, and customer system.", "Advanced", 15.0, ["Product Management"], ["Full Stack Architecture"], 99, "Final startup launch capstone.", "https://www.producthunt.com/")], "AI Startup Production Launch", "quiz_05")
        ]
    else:
        # Default Cybersecurity Analyst Path
        return [
            make_phase("mod_01", "01 — Networking Fundamentals", "Build robust core knowledge of protocol suites, routing, and subnets.", "completed", 2, [("res_01", "Computer Networking Fundamentals", "Course", "Master TCP/IP, OSI model, IP routing, and subnetting.", "Beginner", 6.0, ["Networking"], [], 95, "Foundational prerequisite.", "https://www.netacad.com/"), ("res_08", "SQL Injection & Web Defense", "Article", "Breakdown of SQLi attack vectors and WAF rules.", "Intermediate", 2.0, ["SQL"], ["SQL"], 90, "Web security defense practice.", "https://owasp.org/www-community/attacks/SQL_Injection")], "Subnet & Routing Simulation", "quiz_01"),
            make_phase("mod_02", "02 — Linux & System Security Basics", "Command line proficiency, administrative hardening, and shell scripts.", "completed", 3, [("res_02", "Linux Command Line Security", "Course", "Learn Linux shell scripting, permissions, and SSH hardening.", "Intermediate", 8.0, ["Linux"], ["Networking"], 92, "System admin requirement.", "https://ubuntu.com/tutorials/command-line-for-beginners"), ("res_10", "Python Automation for Security", "Course", "Build automated Python scripts for IP lookups and log parsers.", "Intermediate", 6.0, ["Python"], ["Python"], 88, "Automation scripting skill.", "https://docs.python.org/3/library/")], "Linux Hardening Scripting", "quiz_02"),
            make_phase("mod_03", "03 — Security Tools & Monitoring", "Master packet capture, Wireshark traffic inspection, and Nmap scanning.", "in_progress", 3, [("res_03", "Network Traffic Analysis with Wireshark", "Project", "Analyze real PCAP captures to identify malware beacons.", "Intermediate", 4.0, ["Networking", "Wireshark"], ["Networking"], 96, "Addresses Wireshark gap.", "https://www.wireshark.org/docs/"), ("res_04", "Nmap Network Scanning Lab", "Hands-on Lab", "Execute targeted port scans and OS fingerprinting.", "Intermediate", 5.0, ["Networking", "Linux"], ["Networking"], 93, "Network scanning tool practice.", "https://nmap.org/book/man.html")], "Network Traffic Analysis Project", "quiz_03"),
            make_phase("mod_04", "04 — Threat Detection & SIEM Analysis", "Enterprise log aggregation, Splunk query language, and MITRE ATT&CK.", "upcoming", 4, [("res_05", "Splunk & SIEM Log Analysis", "Hands-on Lab", "Ingest Syslog and Windows Event Logs into Splunk.", "Intermediate", 7.0, ["SIEM"], ["Linux", "Networking"], 97, "Addresses SIEM skill gap.", "https://tryhackme.com/module/splunk"), ("res_09", "Applied Threat Intelligence", "Video", "Map enterprise telemetry to MITRE ATT&CK TTPs.", "Intermediate", 3.0, ["Threat Intelligence"], ["SIEM"], 91, "Threat intelligence mapping.", "https://attack.mitre.org/")], "Enterprise Splunk SOC Lab", "quiz_04"),
            make_phase("mod_05", "05 — Incident Response & Forensics", "Triage security incidents, perform memory forensics, and isolate hosts.", "upcoming", 4, [("res_06", "Incident Response Playbooks", "Course", "Implement NIST and SANS incident handling frameworks.", "Advanced", 10.0, ["Incident Response"], ["SIEM", "Linux"], 98, "Addresses Incident Response gap.", "https://www.sans.org/white-papers/"), ("res_15", "Cybersecurity Analyst Capstone", "Project", "Simulated enterprise SOC shift and incident report.", "Advanced", 20.0, ["Incident Response", "SIEM"], ["SIEM"], 99, "Final SOC Analyst capstone.", "https://tryhackme.com/path/outline/soclevel1")], "Cybersecurity Analyst Capstone", "quiz_05")
        ]

def compute_user_overall_progress(profile: LearnerProfile) -> int:
    goal_reqs = get_goal_requirements(profile.goal)
    if not goal_reqs:
        return 68
    
    total_req = sum(goal_reqs.values())
    total_acquired = 0
    for skill_name, req_level in goal_reqs.items():
        curr_lvl = profile.existing_skills.get(skill_name, 0)
        total_acquired += min(curr_lvl, req_level)

    calc_pct = int((total_acquired / max(1, total_req)) * 100)
    return max(15, min(98, calc_pct))

# 5. Learning Path Endpoint
@router.post("/learning-path", response_model=LearningPathResponse)
def get_learning_path(req: Dict[str, Any] = {"user_id": "sahil_01"}):
    user_id = req.get("user_id", "sahil_01")
    profile = get_user_profile(user_id)

    # If goal is passed directly in request body, override profile goal
    req_goal = req.get("goal")
    if req_goal:
        profile.goal = req_goal

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM learning_paths WHERE user_id = ?", (user_id,))
    path_row = cursor.fetchone()
    conn.close()

    goal_title = profile.goal if profile and profile.goal else (path_row["goal"] if path_row else "Cybersecurity Analyst")
    target_dur = profile.target_duration if profile else "6 Months"
    
    phases = generate_goal_tailored_phases(goal_title, profile)
    dynamic_progress = compute_user_overall_progress(profile)

    return LearningPathResponse(
        id=path_row["id"] if path_row else f"path_{user_id}",
        user_id=user_id,
        goal=goal_title,
        overall_progress=dynamic_progress,
        target_duration=target_dur,
        current_milestone=f"Phase 3 — {phases[2].title if len(phases) > 2 else 'Security Tools'}",
        phases=phases
    )

# 6. Assessment Detail & Submission
@router.get("/assessment/{assessment_id}", response_model=AssessmentDetail)
def get_assessment(assessment_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Assessment not found")

    raw_q = json.loads(row["questions_json"])
    questions = [AssessmentQuestion(**q) for q in raw_q]

    return AssessmentDetail(
        id=row["id"],
        title=row["title"],
        description=row["description"],
        module_id=row["module_id"],
        skill_tag=row["skill_tag"],
        questions=questions
    )

@router.post("/assessment", response_model=AssessmentResult)
def submit_assessment(sub: AssessmentSubmit):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments WHERE id = ?", (sub.assessment_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions = json.loads(row["questions_json"])
    total = len(questions)
    correct_count = 0
    strong_areas = []
    weak_areas = []

    for q in questions:
        q_id = q["id"]
        correct_opt = q["correct_option"]
        user_opt = sub.answers.get(q_id, -1)
        
        if user_opt == correct_opt:
            correct_count += 1
            if q["skill_tag"] not in strong_areas:
                strong_areas.append(q["skill_tag"])
        else:
            if q["skill_tag"] not in weak_areas:
                weak_areas.append(q["skill_tag"])

    score_pct = int((correct_count / max(1, total)) * 100)
    passed = score_pct >= 70

    # Adaptive feedback logic
    if passed:
        action = f"Great work! You demonstrated solid mastery of {row['skill_tag']} ({score_pct}% score)."
        next_mod = "Proceeding to the next milestone module."
        # Update user skill level in DB
        cursor.execute("SELECT level FROM user_skills WHERE user_id = ? AND skill_name = ?", (sub.user_id, row["skill_tag"]))
        sk_row = cursor.fetchone()
        curr_lvl = sk_row["level"] if sk_row else 50
        new_lvl = min(100, curr_lvl + 15)
        cursor.execute("""
            INSERT INTO user_skills (user_id, skill_name, level) VALUES (?, ?, ?)
            ON CONFLICT(user_id, skill_name) DO UPDATE SET level = excluded.level
        """, (sub.user_id, row["skill_tag"], new_lvl))
    else:
        action = f"Your score of {score_pct}% is below the target 70%. We recommend reviewing key concepts in {', '.join(weak_areas) if weak_areas else row['skill_tag']} before continuing."
        next_mod = f"Recommended practice: Wireshark Traffic Analysis Lab"

    conn.commit()
    conn.close()

    return AssessmentResult(
        assessment_id=sub.assessment_id,
        score=score_pct,
        passed=passed,
        strong_areas=strong_areas if strong_areas else [row["skill_tag"]],
        weak_areas=weak_areas,
        recommended_action=action,
        next_recommended_module=next_mod
    )

# 7. Feedback Endpoint
@router.post("/feedback")
def submit_feedback(fb: FeedbackSubmit):
    return {"status": "success", "message": "Thank you for your feedback! Recommendations will adapt."}

# 8. AI Chat Endpoint
@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(req: ChatRequest):
    profile = get_user_profile(req.user_id)
    profile_dict = profile.model_dump()
    
    res = await generate_ai_chat_response(req.message, profile_dict)
    return ChatResponse(reply=res["reply"], suggested_followups=res["suggested_followups"])

# 9. Progress Analytics Endpoint
@router.get("/progress")
def get_progress(user_id: str = "demo_learner_01"):
    profile = get_user_profile(user_id)
    
    skills_list = []
    for s_name, s_lvl in profile.existing_skills.items():
        skills_list.append({"name": s_name, "level": s_lvl})
        
    if not skills_list:
        reqs = get_goal_requirements(profile.goal)
        for s_name, req_lvl in reqs.items():
            skills_list.append({"name": s_name, "level": max(20, req_lvl - 25)})

    # Calculate dynamic overall progress from profile skills vs goal benchmark
    overall_comp = compute_user_overall_progress(profile)

    return {
        "overall_completion": overall_comp,
        "weekly_hours_target": profile.weekly_hours,
        "hours_logged_this_week": min(float(profile.weekly_hours), 8.5),
        "courses_completed": 4,
        "projects_completed": 2,
        "assessments_completed": 3,
        "average_assessment_score": 88,
        "current_streak_days": 12,
        "weekly_activity": [
            {"day": "Mon", "hours": 1.5},
            {"day": "Tue", "hours": 2.0},
            {"day": "Wed", "hours": 1.0},
            {"day": "Thu", "hours": 2.5},
            {"day": "Fri", "hours": 1.5},
            {"day": "Sat", "hours": 0.0},
            {"day": "Sun", "hours": 0.0}
        ],
        "skills_gained": skills_list
    }

# 10. Skills Dictionary
@router.get("/skills")
def get_skills():
    return {
        "skills": [
            "Networking", "Python", "Linux", "SQL", "SIEM",
            "Incident Response", "Threat Detection", "Threat Intelligence",
            "Wireshark", "Nmap", "JavaScript", "React", "Machine Learning"
        ]
    }

# 11. Resource Catalog Endpoint
@router.get("/resources", response_model=List[ResourceItem])
def get_resources():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resources")
    rows = cursor.fetchall()
    conn.close()

    res = []
    for r in rows:
        res.append(ResourceItem(
            id=r["id"],
            title=r["title"],
            type=r["type"],
            description=r["description"],
            difficulty=r["difficulty"],
            duration_hours=r["duration_hours"],
            skills=json.loads(r["skills"]),
            prerequisites=json.loads(r["prerequisites"]),
            url=r["url"]
        ))
    return res

# 12. Notifications Endpoint
@router.get("/notifications", response_model=List[NotificationItem])
def fetch_user_notifications(user_id: str = "demo_learner_01"):
    prof = get_user_profile(user_id)
    user_goal = prof.goal if prof else "Full Stack Developer"
    
    return [
        NotificationItem(
            id="notif_01",
            title="🎯 Goal Roadmap Activated",
            message=f"Your personalized learning path for '{user_goal}' is now live.",
            time="10m ago",
            type="roadmap",
            read=False,
            target_tab="path"
        ),
        NotificationItem(
            id="notif_02",
            title="✨ AI Recommended Modules",
            message="3 high-match learning resources have been added to your Explore tab.",
            time="45m ago",
            type="recommendation",
            read=False,
            target_tab="explore"
        ),
        NotificationItem(
            id="notif_03",
            title="📝 Milestone Knowledge Check",
            message="Phase 01 Assessment is unlocked and ready for evaluation.",
            time="2h ago",
            type="assessment",
            read=False,
            target_tab="dashboard"
        ),
        NotificationItem(
            id="notif_04",
            title="⚡ Skill Gap Opportunity",
            message="Target skill gaps identified to boost your career readiness score by +15%.",
            time="1d ago",
            type="skillgap",
            read=True,
            target_tab="skillgap"
        )
    ]

# 13. Resource Completion Endpoint
class CompleteResourceRequest(BaseModel):
    user_id: str = "demo_learner_01"
    resource_id: str
    skills_gained: List[str] = []

@router.post("/complete-resource")
def complete_resource(req: CompleteResourceRequest):
    user_id = req.user_id
    profile = get_user_profile(user_id)
    
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Persist completed resource in SQLite user_completed_resources table
    cursor.execute("""
        INSERT INTO user_completed_resources (user_id, resource_id)
        VALUES (?, ?)
        ON CONFLICT(user_id, resource_id) DO NOTHING
    """, (user_id, req.resource_id))

    # 2. Boost user skills associated with this resource by +15%
    skills_to_boost = req.skills_gained
    if not skills_to_boost:
        skills_to_boost = list(get_goal_requirements(profile.goal).keys())[:2]

    for s_name in skills_to_boost:
        curr_lvl = profile.existing_skills.get(s_name, 40)
        new_lvl = min(100, curr_lvl + 15)
        cursor.execute("""
            INSERT INTO user_skills (user_id, skill_name, level)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, skill_name) DO UPDATE SET level = excluded.level
        """, (user_id, s_name, new_lvl))
        
    conn.commit()
    conn.close()

    # Get updated profile & recalculate overall progress
    updated_profile = get_user_profile(user_id)
    overall_progress = compute_user_overall_progress(updated_profile)
    
    return {
        "status": "success",
        "message": f"Resource {req.resource_id} marked as completed!",
        "profile": updated_profile,
        "overall_progress": overall_progress
    }

@router.get("/user-completed-resources/{user_id}")
def get_user_completed_resources(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT resource_id FROM user_completed_resources WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return {"completed_resource_ids": [r["resource_id"] for r in rows]}


