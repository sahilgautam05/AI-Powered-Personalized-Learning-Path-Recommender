import os
import sys
import re
import json
import time
import threading
import uvicorn
import streamlit as st
import streamlit.components.v1 as components

# Ensure repository root is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 1. Start FastAPI Backend in Background Thread for Streamlit Cloud
def start_fastapi_server():
    try:
        from backend.main import app
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")
    except Exception as e:
        pass

if "fastapi_active" not in st.session_state:
    st.session_state["fastapi_active"] = True
    server_thread = threading.Thread(target=start_fastapi_server, daemon=True)
    server_thread.start()
    time.sleep(1.2)

# Page Setup
st.set_page_config(
    page_title="LearnPath AI — Personalized Learning Path Recommender",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for Streamlit Shell Container
st.markdown("""
<style>
    /* Remove padding around Streamlit main block */
    .block-container {
        padding-top: 0.5rem !important;
        padding-bottom: 0.5rem !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
        max-width: 100% !important;
    }
    header[data-testid="stHeader"] {
        display: none;
    }
    footer {
        display: none !important;
    }
</style>
""", unsafe_allow_html=True)

def get_inlined_react_app():
    dist_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")
    index_path = os.path.join(dist_dir, "index.html")
    assets_dir = os.path.join(dist_dir, "assets")

    if not os.path.exists(index_path):
        return None

    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Inline CSS files using safe string replacement
    if os.path.exists(assets_dir):
        for file in os.listdir(assets_dir):
            if file.endswith(".css"):
                css_path = os.path.join(assets_dir, file)
                with open(css_path, "r", encoding="utf-8") as f:
                    css_content = f.read()
                for line in html.splitlines():
                    if 'rel="stylesheet"' in line and file in line:
                        html = html.replace(line, f'<style>{css_content}</style>')

        # Inline JS files using safe string replacement
        for file in os.listdir(assets_dir):
            if file.endswith(".js"):
                js_path = os.path.join(assets_dir, file)
                with open(js_path, "r", encoding="utf-8") as f:
                    js_content = f.read()
                for line in html.splitlines():
                    if 'src=' in line and file in line:
                        html = html.replace(line, f'<script type="module">{js_content}</script>')

    return html

# Sidebar Control
st.sidebar.markdown("### ⚙️ View Settings")
app_mode = st.sidebar.radio(
    "Interface View Mode:",
    ["🚀 Production React 18 Application (100% Identical)", "📊 Streamlit Native Analytics View"]
)

if app_mode == "🚀 Production React 18 Application (100% Identical)":
    inlined_html = get_inlined_react_app()
    if inlined_html:
        components.html(inlined_html, height=960, scrolling=True)
    else:
        st.warning("Production bundle missing. Please build frontend with `npm run build`.")
else:
    # Native Streamlit View Fallback
    from backend.database import init_db, get_db_connection
    from backend.routes import get_user_profile, generate_goal_tailored_phases, fetch_user_notifications
    from backend.recommender import rank_resources, get_goal_requirements
    from backend.ai_service import generate_ai_chat_response

    init_db()
    user_profile = get_user_profile("demo_learner_01")
    
    st.title("✨ LearnPath AI — Native Analytics Dashboard")
    st.write(f"Logged in as **{user_profile.name}** ({user_profile.email}) • Target Goal: **{user_profile.goal}**")

    t1, t2, t3, t4, t5 = st.tabs(["🏠 Overview", "🗺️ Roadmap", "✨ AI Recommendations", "⚡ Skill Gap", "🤖 AI Assistant"])

    with t1:
        c1, c2, c3 = st.columns(3)
        c1.metric("Target Goal", user_profile.goal.split(" ")[0])
        c2.metric("Weekly Hours", f"{user_profile.weekly_hours} hrs")
        c3.metric("Goal Readiness", "68%")
        if user_profile.existing_skills:
            st.json(user_profile.existing_skills)

    with t2:
        phases = generate_goal_tailored_phases(user_profile.goal, user_profile)
        for p in phases:
            st.subheader(f"Phase: {p.title}")
            for r in p.resources:
                st.markdown(f"- [{r.title}]({r.url}) ({r.type}) — {r.difficulty}")

    with t3:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM resources")
        from backend.models import ResourceItem
        items = [ResourceItem(id=r["id"], title=r["title"], type=r["type"], description=r["description"], difficulty=r["difficulty"], duration_hours=r["duration_hours"], skills=json.loads(r["skills"]), prerequisites=json.loads(r["prerequisites"]), url=r["url"]) for r in c.fetchall()]
        conn.close()
        for r in rank_resources(items, user_profile)[:5]:
            st.markdown(f"**[{r.title}]({r.url})** — Match: {r.match_score}%")

    with t4:
        reqs = get_goal_requirements(user_profile.goal)
        st.write("Target Skill Requirements vs Current Proficiency:")
        st.json(reqs)

    with t5:
        msg = st.text_input("Ask AI Assistant:")
        if msg:
            st.write("AI Mentor:", generate_ai_chat_response("demo_learner_01", msg))
