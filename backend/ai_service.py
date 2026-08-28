import os
import json
import httpx
from typing import Dict, Any, List
from backend.config import OPENAI_API_KEY, GEMINI_API_KEY

async def generate_ai_chat_response(prompt: str, user_profile: Dict[str, Any], chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Abstraction layer for AI mentor responses.
    Checks for Gemini/OpenAI API keys, or falls back to intelligent profile-aware rule mentor.
    """
    user_name = user_profile.get("name", "Sahil")
    user_goal = user_profile.get("goal", "Cybersecurity Analyst")
    user_skills = user_profile.get("existing_skills", {})
    
    # 1. Try Gemini API if key is present
    if GEMINI_API_KEY:
        try:
            async with httpx.AsyncClient() as client:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
                system_context = f"You are LearnPath AI, an expert career and learning mentor for {user_name}. User's target goal is '{user_goal}'. User's current skills: {json.dumps(user_skills)}. Provide concise, actionable, friendly advice."
                payload = {
                    "contents": [{"parts": [{"text": f"{system_context}\n\nUser Question: {prompt}"}]}]
                }
                res = await client.post(url, json=payload, timeout=10.0)
                if res.status_code == 200:
                    data = res.json()
                    reply = data['candidates'][0]['content']['parts'][0]['text']
                    return {
                        "reply": reply,
                        "suggested_followups": [
                            "What should I focus on next?",
                            "Explain my current skill gaps",
                            "Create a 7-day study plan"
                        ]
                    }
        except Exception:
            pass # Fallback if API call fails

    # 2. Try OpenAI API if key is present
    if OPENAI_API_KEY:
        try:
            async with httpx.AsyncClient() as client:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
                payload = {
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": f"You are LearnPath AI learning mentor for {user_name} (Goal: {user_goal}). Current skills: {json.dumps(user_skills)}."},
                        {"role": "user", "content": prompt}
                    ]
                }
                res = await client.post(url, headers=headers, json=payload, timeout=10.0)
                if res.status_code == 200:
                    data = res.json()
                    reply = data['choices'][0]['message']['content']
                    return {
                        "reply": reply,
                        "suggested_followups": [
                            "How can I practice this skill hands-on?",
                            "What project should I build next?",
                            "Review my weekly milestone"
                        ]
                    }
        except Exception:
            pass # Fallback if API call fails

    # 3. Robust Contextual Rule-Based Mentor Fallback
    p_lower = prompt.lower()
    
    if "why" in p_lower and "recommended" in p_lower:
        reply = (
            f"Great question, {user_name}! Your top recommendations are tailored specifically for your target goal: **{user_goal}**.\n\n"
            f"• **Target Skill Matching:** Courses are selected based on your current skill proficiency vs the target benchmark required for **{user_goal}**.\n"
            f"• **Prerequisite Checking:** Modules are ordered so you meet required foundational skills before advancing to complex topics."
        )
        followups = ["How do I improve my skills faster?", "Show my full skill gap breakdown", "What project should I do next?"]

    elif "tcp/ip" in p_lower or "networking" in p_lower or "ip address" in p_lower:
        reply = (
            f"### Networking & TCP/IP Explained 🌐\n\n"
            f"Think of TCP/IP like sending a registered letter through the post office:\n\n"
            f"1. **IP (Internet Protocol):** Like the address on the envelope. It routes data packets to the correct IP address.\n"
            f"2. **TCP (Transmission Control Protocol):** Ensures reliability. It numbers data packets, verifies none are dropped, and reassembles them in exact order.\n\n"
            f"**Relevance to {user_goal}:** Understanding packet flow (SYN, ACK, FIN) is critical for network debugging and analysis!"
        )
        followups = ["What is the TCP 3-way handshake?", "How does UDP differ from TCP?", "Recommend a networking course"]

    elif "5 hours" in p_lower or "time" in p_lower or "schedule" in p_lower or "hours" in p_lower:
        reply = (
            f"### Weekly Study Plan for {user_name} ⏱️\n\n"
            f"Here is an optimized study plan for your **{user_goal}** goal:\n\n"
            f"• **Phase 1 (2.0 hrs):** Complete core video module & take notes.\n"
            f"• **Phase 2 (2.0 hrs):** Work through hands-on practice labs.\n"
            f"• **Phase 3 (1.0 hr):** Take the milestone quiz assessment to verify your score!\n\n"
            f"This pace keeps your roadmap momentum going strong without burnout!"
        )
        followups = ["Adjust my path pace", "Remind me of next milestone", "What should I learn next?"]

    elif "react" in p_lower or "javascript" in p_lower or "web" in p_lower or "full stack" in p_lower or "frontend" in p_lower:
        reply = (
            f"### Mastering Web Development & React ⚛️\n\n"
            f"To build modern full stack applications as a **{user_goal}**, follow this progression:\n\n"
            f"1. **Modern JavaScript (ES6+):** Master Arrow functions, Promises, `async/await`, Destructuring, and Array methods (`map`, `filter`).\n"
            f"2. **React Fundamentals:** Learn Components, Props, State (`useState`), Effects (`useEffect`), and Component Lifecycle.\n"
            f"3. **State & Routing:** Build multi-page single-page apps using React Router and global state management.\n"
            f"4. **Backend Integration:** Connect React frontend components to REST APIs using `fetch` or `axios`."
        )
        followups = ["Recommend a React course", "Explain React HooksSimply", "Show Full Stack roadmap"]

    elif "python" in p_lower or "data science" in p_lower or "machine learning" in p_lower or "ai" in p_lower or "ml" in p_lower:
        reply = (
            f"### Python & Machine Learning Roadmap 🐍🤖\n\n"
            f"For your **{user_goal}** journey, Python is the foundational language:\n\n"
            f"1. **Core Data Libraries:** Master `NumPy` for matrix operations, `Pandas` for dataframes, and `Matplotlib/Seaborn` for data visualization.\n"
            f"2. **Machine Learning:** Build regression, classification, and clustering models with `Scikit-Learn`.\n"
            f"3. **Deep Learning & LLMs:** Train neural networks using `PyTorch` or `TensorFlow`, and build RAG applications with LangChain."
        )
        followups = ["Recommend Python course", "Explain Machine Learning simply", "Show AI/ML roadmap"]

    elif "cyber" in p_lower or "security" in p_lower or "siem" in p_lower or "linux" in p_lower:
        reply = (
            f"### Cybersecurity & SIEM Mastery 🛡️\n\n"
            f"Key domains to master for **{user_goal}**:\n\n"
            f"1. **Linux Command Line:** Master file permissions, processes (`ps`, `top`), bash scripting, and log analysis (`/var/log`).\n"
            f"2. **SIEM & Log Ingestion:** Learn Splunk or Elastic Stack to ingest Syslog and detect attack signatures.\n"
            f"3. **Incident Response:** Follow NIST framework to triage, contain, and remediate security events."
        )
        followups = ["Recommend Splunk lab", "How to practice Incident Response?", "Show Cybersecurity path"]

    elif "skill gap" in p_lower or "gap" in p_lower:
        reply = (
            f"### Your Skill Gap Analysis for {user_goal} 📊\n\n"
            f"The system continuously evaluates your proficiency against target benchmarks for **{user_goal}**.\n\n"
            f"• Completing recommended courses & labs increases your skill levels by **+15%** per course.\n"
            f"• Passing module quiz assessments verifies your score and unlocks upcoming advanced phases!"
        )
        followups = ["Show my full skill gap breakdown", "Start recommended module", "Take practice assessment"]

    elif "next" in p_lower or "what should i learn" in p_lower:
        reply = (
            f"Your next recommended step is to open your **My Personalized Learning Path** tab and complete the active phase module for **{user_goal}**.\n\n"
            f"Completing this module will boost your career readiness score and unlock the phase milestone quiz!"
        )
        followups = ["Go to My Learning Path", "Show top recommendation", "Ask about study schedule"]

    else:
        reply = (
            f"Great question about **'{prompt}'**! As your **LearnPath AI Mentor** for **{user_goal}**:\n\n"
            f"• To master this topic effectively, start with foundational concepts, practice with hands-on projects, and test your knowledge with module quizzes.\n"
            f"• I am fully synchronized with your **{user_goal}** roadmap and can guide you step-by-step through any concept or skill gap!\n\n"
            f"What specific area of '{prompt}' would you like to explore deeper?"
        )
        followups = [
            f"Explain '{prompt}' simply",
            "Recommend a course for this",
            "Show my learning roadmap",
            "Help me plan my study schedule"
        ]

    return {
        "reply": reply,
        "suggested_followups": followups
    }
