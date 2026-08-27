import os
import sys
import json
import sqlite3
import streamlit as st
import streamlit.components.v1 as components

# Ensure backend directory is in Python path for Streamlit Cloud
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database import init_db, get_db_connection
from backend.models import LearnerProfile
from backend.routes import get_user_profile, generate_goal_tailored_phases, fetch_user_notifications
from backend.recommender import rank_resources, get_goal_requirements
from backend.ai_service import generate_ai_chat_response

# Page Configuration
st.set_page_config(
    page_title="LearnPath AI — Personalized Learning Path Recommender",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Relational Database
init_db()

# Custom CSS for Streamlit UI
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 800;
        color: #4f46e5;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #6b7280;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 1rem;
        text-align: center;
    }
    .stButton>button {
        border-radius: 8px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# Sidebar Options
st.sidebar.image("https://img.icons8.com/isometric-folders/100/sparkles.png", width=50)
st.sidebar.title("LearnPath AI Navigation")

# View Selector
view_mode = st.sidebar.radio(
    "Select Platform Interface:",
    ["💻 Interactive React SPA (Full Production UI)", "📊 Streamlit Native Analytics Dashboard"]
)

# User Session State
if "user_id" not in st.session_state:
    st.session_state["user_id"] = "demo_learner_01"

user_profile = get_user_profile(st.session_state["user_id"])

# User Identity Card in Sidebar
st.sidebar.markdown("---")
st.sidebar.subheader("Learner Identity")
st.sidebar.markdown(f"**Name:** {user_profile.name}")
st.sidebar.markdown(f"**Email:** {user_profile.email}")
st.sidebar.markdown(f"**Target Goal:** {user_profile.goal}")
st.sidebar.markdown(f"**Experience:** {user_profile.experience}")

if view_mode == "💻 Interactive React SPA (Full Production UI)":
    st.markdown('<div class="main-header">LearnPath AI — Full Production Interface</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">React 18 Single-Page Web Application powered by FastAPI & SQLite.</div>', unsafe_allow_html=True)

    dist_index_path = os.path.join(os.path.dirname(__file__), "frontend", "dist", "index.html")
    
    if os.path.exists(dist_index_path):
        with open(dist_index_path, "r", encoding="utf-8") as f:
            html_content = f.read()
        
        # Inject base tag for relative assets
        assets_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")
        components.html(f"""
        <div style="width: 100%; height: 850px; overflow: hidden; border-radius: 12px; border: 1px solid #e5e7eb;">
            <iframe srcdoc="{html_content.replace('"', '&quot;')}" style="width: 100%; height: 100%; border: none;"></iframe>
        </div>
        """, height=870, scrolling=True)
    else:
        st.info("React bundle built. Displaying native Streamlit dashboard below.")
        view_mode = "📊 Streamlit Native Analytics Dashboard"

if view_mode == "📊 Streamlit Native Analytics Dashboard":
    st.markdown('<div class="main-header">✨ AI-Powered Personalized Learning Path</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Adaptive EdTech SaaS Platform • Goal-Driven Curriculum & Skill Gap Analytics</div>', unsafe_allow_html=True)

    # Top Tabs
    tab_overview, tab_roadmap, tab_recommendations, tab_skillgap, tab_assistant, tab_notifs = st.tabs([
        "🏠 Dashboard", "🗺️ Learning Roadmap", "✨ AI Recommendations", "⚡ Skill Gap Matrix", "🤖 AI Assistant", "🔔 Notifications"
    ])

    with tab_overview:
        st.subheader("Learner Progress Overview")
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(label="Target Goal", value=user_profile.goal.split(" ")[0] if user_profile.goal else "Full Stack")
        with col2:
            st.metric(label="Weekly Study Pace", value=f"{user_profile.weekly_hours} hrs/wk")
        with col3:
            st.metric(label="Target Duration", value=user_profile.target_duration)
        with col4:
            st.metric(label="Overall Readiness", value="68%", delta="+12% this month")

        st.markdown("### Active Target Goal & Skills")
        st.write(f"Currently pursuing **{user_profile.goal}** at **{user_profile.experience}** level.")
        
        if user_profile.existing_skills:
            st.write("**Current Skill Inventory:**")
            skills_df = [{"Skill": k, "Proficiency Level (%)": v} for k, v in user_profile.existing_skills.items()]
            st.dataframe(skills_df, use_container_width=True)

    with tab_roadmap:
        st.subheader(f"Custom Learning Roadmap for {user_profile.goal}")
        phases = generate_goal_tailored_phases(user_profile.goal, user_profile)
        
        for p in phases:
            with st.expander(f"📌 {p.title} ({p.estimated_weeks} Weeks) — Status: {p.status.upper()}", expanded=(p.status == "in_progress")):
                st.write(p.description)
                st.markdown("**Phase Resources & Modules:**")
                for r in p.resources:
                    st.markdown(f"- **[{r.type}] [{r.title}]({r.url})** — *{r.difficulty}* ({r.duration_hours} hrs)")
                    st.caption(f"Why: {r.why_recommended}")
                if p.project:
                    st.success(f"🏆 Milestone Project: {p.project.get('title')}")

    with tab_recommendations:
        st.subheader("AI-Ranked Course & Project Recommendations")
        req_skills = get_goal_requirements(user_profile.goal)
        st.write("Below are top resources weighted by Goal Relevance (30%), Skill Gap (25%), and Prerequisite Match (15%):")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resources")
        db_rows = cursor.fetchall()
        conn.close()

        res_items = []
        for r in db_rows:
            from backend.models import ResourceItem
            res_items.append(ResourceItem(
                id=r["id"], title=r["title"], type=r["type"], description=r["description"],
                difficulty=r["difficulty"], duration_hours=r["duration_hours"],
                skills=json.loads(r["skills"]), prerequisites=json.loads(r["prerequisites"]),
                url=r["url"]
            ))

        ranked_res = rank_resources(res_items, user_profile)
        for r in ranked_res[:6]:
            col_a, col_b = st.columns([3, 1])
            with col_a:
                st.markdown(f"#### [{r.title}]({r.url})")
                st.write(r.description)
                st.caption(f"Type: {r.type} | Level: {r.difficulty} | Skills: {', '.join(r.skills)}")
            with col_b:
                st.metric(label="AI Match Score", value=f"{r.match_score}%")
                st.link_button("Start Learning ↗", r.url if r.url != "#" else "https://google.com")
            st.markdown("---")

    with tab_skillgap:
        st.subheader("Target Skill Gap Analysis")
        goal_reqs = get_goal_requirements(user_profile.goal)
        
        gap_rows = []
        for skill_name, required_lvl in goal_reqs.items():
            curr_lvl = user_profile.existing_skills.get(skill_name, 0)
            gap = max(0, required_lvl - curr_lvl)
            gap_rows.append({
                "Skill Name": skill_name,
                "Current Level": f"{curr_lvl}%",
                "Required Level": f"{required_lvl}%",
                "Target Gap": f"{gap}%",
                "Status": "✅ Target Met" if gap == 0 else "⚡ Focus Area"
            })
        st.table(gap_rows)

    with tab_assistant:
        st.subheader("🤖 AI Learning Mentor & Career Coach")
        user_msg = st.text_input("Ask your AI Mentor a question about your learning path:", placeholder="e.g. How do I prepare for System Design interviews?")
        if st.button("Send to AI Assistant") and user_msg:
            with st.spinner("AI is analyzing your profile context..."):
                reply = generate_ai_chat_response(st.session_state["user_id"], user_msg)
                st.markdown(f"**AI Mentor:** {reply}")

    with tab_notifs:
        st.subheader("🔔 System & Milestone Notifications")
        notifs = fetch_user_notifications(st.session_state["user_id"])
        for n in notifs:
            st.info(f"**{n.title}** ({n.time})\n\n{n.message}")

st.markdown("---")
st.caption("🚀 Deployed permanently on Streamlit Community Cloud • Powered by FastAPI & SQLite • Designed by Sahil Gautam")
