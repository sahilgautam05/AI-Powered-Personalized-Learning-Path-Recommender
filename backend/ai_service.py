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

    # 3. Robust Contextual Multi-Domain AI Mentor Engine
    p_lower = prompt.lower()
    
    # Domain 1: React / Hooks / Frontend Architecture
    if any(k in p_lower for k in ["react", "usestate", "useeffect", "jsx", "virtual dom", "component", "props", "hook"]):
        reply = (
            f"### Mastering React 18 & Frontend Architecture ⚛️\n\n"
            f"Great question, {user_name}! In modern React development:\n\n"
            f"1. **`useState` Hook:** Manages local component state. Calling `setState(newValue)` triggers a clean re-render with updated state values.\n"
            f"2. **`useEffect` Hook:** Handles side-effects (API data fetching, subscriptions, timers). Pass an empty dependency array `[]` to run once on component mount.\n"
            f"3. **Virtual DOM:** React keeps an in-memory representation of the UI and calculates exact diffs (reconciliation) before updating the real browser DOM, ensuring high performance.\n\n"
            f"```jsx\n"
            f"// Example: Data Fetching Component in React 18\n"
            f"import React, {{ useState, useEffect }} from 'react';\n\n"
            f"export default function UserProfile({{ userId }}) {{\n"
            f"  const [userData, setUserData] = useState(null);\n"
            f"  useEffect(() => {{\n"
            f"    fetch(`/api/user/${{userId}}`)\n"
            f"      .then(res => res.json())\n"
            f"      .then(data => setUserData(data));\n"
            f"  }}, [userId]);\n"
            f"  return <div>{{userData ? userData.name : 'Loading...'}}</div>;\n"
            f"}}\n"
            f"```\n\n"
            f"**Next Step for {user_goal}:** Practice building reusable components and connecting them to REST APIs!"
        )
        followups = ["Explain React useEffect dependencies", "How to manage global state with Context API?", "Recommend a React course"]

    # Domain 2: JavaScript ES6+ & Async Programming
    elif any(k in p_lower for k in ["javascript", "js", "promise", "async", "await", "closure", "event loop", "arrow function"]):
        reply = (
            f"### Modern JavaScript ES6+ & Async Deep Dive 🟨\n\n"
            f"Here is how modern JavaScript handles execution and asynchronous tasks:\n\n"
            f"1. **Event Loop & Call Stack:** Synchronous code executes first on the single-threaded Call Stack. Asynchronous callbacks (Promises, `fetch`) are queued in the Microtask Queue and executed when the stack clears.\n"
            f"2. **Promises & `async/await`:** Promises represent future values (Pending, Fulfilled, Rejected). `async/await` is syntactic sugar that allows writing asynchronous code sequentially without callback nesting.\n"
            f"3. **Closures:** A function retains access to variables from its outer lexical scope even after the outer function has executed.\n\n"
            f"```javascript\n"
            f"// Example: Modern Async/Await with Error Handling\n"
            f"async function fetchLearnerProgress(learnerId) {{\n"
            f"  try {{\n"
            f"    const response = await fetch(`/api/progress/${{learnerId}}`);\n"
            f"    if (!response.ok) throw new Error(`HTTP Error ${{response.status}}`);\n"
            f"    const data = await response.json();\n"
            f"    return data;\n"
            f"  }} catch (error) {{\n"
            f"    console.error('Fetch error:', error);\n"
            f"  }}\n"
            f"}}\n"
            f"```"
        )
        followups = ["Explain Event Loop microtask queue", "What is the difference between let, const, and var?", "Recommend JS async course"]

    # Domain 3: Node.js, Express & REST APIs
    elif any(k in p_lower for k in ["node", "express", "api", "rest", "backend", "middleware", "route", "jwt"]):
        reply = (
            f"### Node.js & Express REST API Architecture 🟢\n\n"
            f"For building scalable backend web services:\n\n"
            f"1. **RESTful Architecture:** Express routes use HTTP methods cleanly:\n"
            f"   • `GET /api/resources` — Retrieve items\n"
            f"   • `POST /api/resources` — Create new item\n"
            f"   • `PUT /api/resources/:id` — Update item\n"
            f"   • `DELETE /api/resources/:id` — Delete item\n"
            f"2. **Express Middleware:** Functions that execute sequentially during request/response cycles (`(req, res, next)`), ideal for authentication and logging.\n"
            f"3. **JWT Authentication:** Server signs a JSON Web Token upon login; client passes `Authorization: Bearer <token>` in HTTP headers."
        )
        followups = ["Explain Express middleware order", "How to implement JWT authentication?", "Recommend Express backend course"]

    # Domain 4: Python & Data Structures
    elif any(k in p_lower for k in ["python", "pip", "list comprehension", "dictionary", "tuple", "class", "def"]):
        reply = (
            f"### Python Programming & Best Practices 🐍\n\n"
            f"Python is clean, highly readable, and versatile:\n\n"
            f"1. **List Comprehensions:** Concise syntax for creating lists:\n"
            f"   `squared_numbers = [x**2 for x in range(10) if x % 2 == 0]`\n"
            f"2. **Dictionaries:** Hash-map key-value lookups with `O(1)` average time complexity.\n"
            f"3. **Classes & OOP:** Define data blueprints with `class` and `__init__(self)` constructors.\n\n"
            f"```python\n"
            f"# Example: Python Class Definition\n"
            f"class LearnerProfile:\n"
            f"    def __init__(self, name: str, goal: str):\n"
            f"        self.name = name\n"
            f"        self.goal = goal\n"
            f"        self.skills = {{}}\n"
            f"\n"
            f"    def add_skill(self, skill_name: str, level: int):\n"
            f"        self.skills[skill_name] = level\n"
            f"```"
        )
        followups = ["Explain Python Decorators", "What is the difference between list, tuple, and set?", "Recommend Python course"]

    # Domain 5: Data Science, Pandas & NumPy
    elif any(k in p_lower for k in ["pandas", "numpy", "dataframe", "data science", "matplotlib", "seaborn", "csv"]):
        reply = (
            f"### Data Science & Data Wrangling with Pandas 📊\n\n"
            f"Essential tools for data analysis:\n\n"
            f"1. **NumPy Arrays:** Vectorized N-dimensional math operations running in C speeds.\n"
            f"2. **Pandas DataFrames:** 2D tabular data structure with powerful indexing:\n"
            f"   • `df = pd.read_csv('data.csv')` — Load data\n"
            f"   • `df.groupby('category').mean()` — Aggregate data\n"
            f"   • `df.fillna(0)` — Clean missing null values\n"
            f"3. **Visualization:** Use Seaborn & Matplotlib to plot histograms, scatter plots, and correlation heatmaps."
        )
        followups = ["Explain Pandas groupby and aggregate", "How to handle missing values in Pandas?", "Recommend Data Science course"]

    # Domain 6: Machine Learning & Scikit-Learn
    elif any(k in p_lower for k in ["machine learning", "ml", "regression", "classification", "scikit", "overfitting", "training"]):
        reply = (
            f"### Machine Learning Engineering & Algorithms 🤖\n\n"
            f"Core workflow for building predictive models:\n\n"
            f"1. **Supervised vs Unsupervised:** Supervised uses labeled data (Regression, Classification); Unsupervised finds hidden patterns (K-Means Clustering).\n"
            f"2. **Train/Test Split:** Split data (80% train, 20% test) to evaluate generalization performance.\n"
            f"3. **Overfitting:** Occurs when a model memorizes training noise instead of learning general patterns; mitigate with regularization (L1/L2) and cross-validation.\n\n"
            f"```python\n"
            f"# Example: Scikit-Learn ML Pipeline\n"
            f"from sklearn.model_selection import train_test_split\n"
            f"from sklearn.ensemble import RandomForestClassifier\n"
            f"\n"
            f"X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n"
            f"model = RandomForestClassifier(n_estimators=100)\n"
            f"model.fit(X_train, y_train)\n"
            f"accuracy = model.score(X_test, y_test)\n"
            f"```"
        )
        followups = ["Explain Random Forest vs Decision Trees", "How to prevent overfitting?", "Recommend Machine Learning course"]

    # Domain 7: Deep Learning, PyTorch & LLMs / RAG
    elif any(k in p_lower for k in ["deep learning", "pytorch", "tensorflow", "neural", "llm", "rag", "embedding", "transformer"]):
        reply = (
            f"### Deep Learning, Transformers & LLM Systems 🧠\n\n"
            f"Modern AI architecture breakdown:\n\n"
            f"1. **Neural Networks:** Layers of artificial neurons connected by weights & biases, trained using Backpropagation & Gradient Descent.\n"
            f"2. **Transformers & Self-Attention:** Architecture underlying LLMs (GPT-4, Gemini) that calculates context weights between tokens regardless of distance.\n"
            f"3. **RAG (Retrieval-Augmented Generation):** Enhances LLM responses by retrieving relevant document snippets from a Vector Database (Chroma, FAISS) before generating the answer."
        )
        followups = ["Explain RAG architecture step-by-step", "How does PyTorch autograd work?", "Recommend LLM/RAG course"]

    # Domain 8: Cybersecurity, Networking & Wireshark
    elif any(k in p_lower for k in ["cyber", "security", "wireshark", "packet", "port", "subnet", "tcp/ip", "handshake"]):
        reply = (
            f"### Computer Networking & Wireshark Packet Analysis 🛡️\n\n"
            f"Network fundamentals for SOC Analysts and Security Engineers:\n\n"
            f"1. **TCP 3-Way Handshake:** Connection establishment via `SYN` ➔ `SYN-ACK` ➔ `ACK` flags.\n"
            f"2. **Common Standard Ports:** `22` (SSH), `53` (DNS), `80` (HTTP), `443` (HTTPS), `3306` (MySQL).\n"
            f"3. **Wireshark Display Filters:**\n"
            f"   • `ip.addr == 192.168.1.1` — Filter by IP address\n"
            f"   • `http.request.method == 'POST'` — Inspect form submissions\n"
            f"   • `tcp.flags.syn == 1 and tcp.flags.ack == 0` — Spot SYN flood attacks"
        )
        followups = ["Explain TCP SYN flood attack", "How to carve files in Wireshark?", "Recommend Wireshark lab"]

    # Domain 9: SIEM & Log Analysis (Splunk)
    elif any(k in p_lower for k in ["siem", "splunk", "log", "syslog", "soc", "incident", "event id"]):
        reply = (
            f"### SIEM Operations & Splunk Log Analysis 🔍\n\n"
            f"How Security Operations Centers detect & investigate threats:\n\n"
            f"1. **Log Aggregation:** SIEM ingests Windows Event Logs, Syslog, firewall logs, and cloud audit trails into a centralized index.\n"
            f"2. **Key Windows Event IDs:**\n"
            f"   • `4624` — Successful Logon\n"
            f"   • `4625` — Failed Logon (multiple 4625s indicate brute-force attempts!)\n"
            f"   • `4688` — New Process Created\n"
            f"3. **Splunk SPL Query:** `index=security EventCode=4625 | stats count by TargetUserName | where count > 5`"
        )
        followups = ["Recommend Splunk hands-on lab", "Explain NIST Incident Response framework", "Show Cybersecurity path"]

    # Domain 10: Technical Placements & DSA
    elif any(k in p_lower for k in ["dsa", "placement", "algorithm", "binary tree", "hash table", "complexity", "big o"]):
        reply = (
            f"### Technical Placement & DSA Master Strategy 🎯\n\n"
            f"High-frequency topics for technical coding interviews:\n\n"
            f"1. **Time Complexity (Big-O):** `O(1)` constant, `O(log N)` binary search, `O(N)` linear, `O(N log N)` quicksort, `O(N²)` nested loops.\n"
            f"2. **Must-Master Data Structures:** Two Pointers, Sliding Window, Fast & Slow Pointers, Hash Maps (`O(1)` lookup), Binary Search Trees, Graphs (BFS/DFS).\n"
            f"3. **Preparation Plan:** Solve 2 LeetCode problems daily, focusing on understanding pattern recognition over memorization!"
        )
        followups = ["Explain Sliding Window pattern", "How to calculate Big-O time complexity?", "Recommend DSA placement roadmap"]

    # Domain 11: SQL & Databases
    elif any(k in p_lower for k in ["sql", "database", "join", "select", "group by", "postgres", "sqlite", "foreign key"]):
        reply = (
            f"### Relational Databases & SQL Mastery 🛢️\n\n"
            f"Core database concepts for full stack & data roles:\n\n"
            f"1. **SQL JOINs:**\n"
            f"   • `INNER JOIN`: Returns records with matching keys in both tables.\n"
            f"   • `LEFT JOIN`: Returns all records from left table, and matched records from right.\n"
            f"2. **ACID Properties:** Atomicity, Consistency, Isolation, Durability guarantee transaction safety.\n"
            f"3. **Query Optimization:** Add Indexes (`CREATE INDEX idx_email ON users(email)`) on columns frequently queried in `WHERE` and `JOIN` clauses to avoid full table scans."
        )
        followups = ["Explain SQL INNER vs LEFT JOIN with example", "What are ACID properties in database?", "Recommend SQL course"]

    # Domain 12: Why Recommended / Match Score Rationale
    elif "why" in p_lower and "recommended" in p_lower:
        reply = (
            f"Great question, {user_name}! Your recommendations are specifically weighted for **{user_goal}**:\n\n"
            f"• **Goal Relevance (30%):** Modules focus on essential skills for {user_goal}.\n"
            f"• **Skill Gap (25%):** Recommendations prioritize areas where your current proficiency is below target benchmarks.\n"
            f"• **Prerequisites (15%):** Foundational topics are scheduled before advanced projects."
        )
        followups = ["Show my skill gap analysis", "What should I learn next?", "Create a 7-day study plan"]

    # Domain 13: Study Schedule & Hours
    elif any(k in p_lower for k in ["hours", "schedule", "time", "plan", "pace"]):
        reply = (
            f"### Weekly Focus Schedule for {user_name} ⏱️\n\n"
            f"Here is an optimized weekly schedule for your **{user_goal}** goal:\n\n"
            f"• **Phase 1 (2.0 hrs):** Watch core video tutorials & take key notes.\n"
            f"• **Phase 2 (2.0 hrs):** Complete hands-on practice labs.\n"
            f"• **Phase 3 (1.0 hr):** Take the milestone quiz assessment to verify your skill score!"
        )
        followups = ["Adjust my path pace", "Remind me of next milestone", "What should I learn next?"]

    # Default Intelligent Blueprint Generator
    else:
        reply = (
            f"### Learning Guidance for **'{prompt}'** 💡\n\n"
            f"Hello {user_name}! Here is a structured 3-part blueprint to master **'{prompt}'** for your **{user_goal}** goal:\n\n"
            f"1. **Core Concepts:** Understand foundational principles, key terminology, and syntax.\n"
            f"2. **Hands-on Practice:** Build a small real-world application or lab exercise applying this skill.\n"
            f"3. **Assessment & Verification:** Take the module verification quiz to lock in your score and update your overall readiness percentage!\n\n"
            f"What specific topic regarding **'{prompt}'** would you like me to explain deeper?"
        )
        followups = [
            f"Explain '{prompt}' simply with code",
            f"Recommend a course for {prompt}",
            f"Show my learning roadmap",
            f"Help me plan my study schedule"
        ]

    return {
        "reply": reply,
        "suggested_followups": followups
    }
