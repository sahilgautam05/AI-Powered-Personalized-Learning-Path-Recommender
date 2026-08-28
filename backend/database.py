import sqlite3
import json
import os
from backend.config import DATABASE_PATH

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False, timeout=30.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT DEFAULT 'password123',
        goal TEXT NOT NULL,
        experience TEXT NOT NULL,
        weekly_hours INTEGER DEFAULT 10,
        target_duration TEXT DEFAULT '6 Months',
        onboarded INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Migration checks for existing sqlite files
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN password TEXT DEFAULT 'password123'")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN onboarded INTEGER DEFAULT 0")
    except Exception:
        pass

    # User Skills Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_skills (
        user_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        level INTEGER NOT NULL,
        PRIMARY KEY (user_id, skill_name)
    )
    """)

    # User Completed Resources Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_completed_resources (
        user_id TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, resource_id)
    )
    """)

    # Adaptive User Weekly Tasks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_weekly_tasks (
        user_id TEXT PRIMARY KEY,
        current_week INTEGER DEFAULT 1,
        difficulty_level TEXT DEFAULT 'Beginner', -- Beginner, Intermediate, Advanced
        performance_score INTEGER DEFAULT 45, -- 0 to 100
        completed_task_ids TEXT DEFAULT '[]',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Resources Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        duration_hours REAL NOT NULL,
        skills TEXT NOT NULL, -- JSON list
        prerequisites TEXT NOT NULL, -- JSON list
        url TEXT DEFAULT '#'
    )
    """)

    # Learning Paths Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learning_paths (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        goal TEXT NOT NULL,
        overall_progress INTEGER DEFAULT 0,
        current_milestone TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Path Modules Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS path_modules (
        id TEXT PRIMARY KEY,
        path_id TEXT NOT NULL,
        phase_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL, -- completed, in_progress, upcoming
        estimated_weeks INTEGER NOT NULL,
        resources_json TEXT NOT NULL, -- JSON list of resource IDs
        project_json TEXT, -- JSON object
        assessment_id TEXT
    )
    """)

    # Assessments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        module_id TEXT NOT NULL,
        skill_tag TEXT NOT NULL,
        questions_json TEXT NOT NULL -- JSON list
    )
    """)

    # User Progress & Quizzes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        status TEXT NOT NULL, -- not_started, in_progress, completed
        completion_percentage INTEGER DEFAULT 0,
        score INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, resource_id)
    )
    """)

    # Chat Log Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()

    # Seed Demo Data if not present
    seed_demo_data(cursor, conn)

    conn.close()

def seed_demo_data(cursor, conn):
    # Remove old sahil_01 user if present
    cursor.execute("DELETE FROM users WHERE id = 'sahil_01'")
    cursor.execute("DELETE FROM user_skills WHERE user_id = 'sahil_01'")

    cursor.execute("SELECT COUNT(*) FROM users WHERE id = 'demo_learner_01'")
    if cursor.fetchone()[0] == 0:
        # 1. Seed Generic Demo Learner
        cursor.execute("""
            INSERT INTO users (id, name, email, password, goal, experience, weekly_hours, target_duration, onboarded)
            VALUES ('demo_learner_01', 'Demo Learner', 'learner@example.com', 'password123', 'Become a Full Stack Developer', 'Intermediate', 10, '6 Months', 1)
        """)

        # 3. Seed 15 Realistic Resources with Authentic URLs
        resources = [
            ("res_01", "Computer Networking Fundamentals & Architecture", "Course", "Master TCP/IP, OSI model, IP routing, subnetting, and packet structures.", "Beginner", 6.0, json.dumps(["Networking"]), json.dumps([]), "https://www.netacad.com/"),
            ("res_02", "Linux Command Line & System Security Administration", "Course", "Learn Linux shell scripting, file permissions, SSH hardening, and process control.", "Intermediate", 8.0, json.dumps(["Linux"]), json.dumps(["Networking"]), "https://ubuntu.com/tutorials/command-line-for-beginners"),
            ("res_03", "Network Traffic Analysis with Wireshark", "Project", "Analyze real PCAP captures to identify malware beacons, rogue ARP broadcasts, and exfiltration.", "Intermediate", 4.0, json.dumps(["Networking", "Threat Detection", "Wireshark"]), json.dumps(["Networking"]), "https://www.wireshark.org/docs/"),
            ("res_04", "Nmap Network Scanning & Vulnerability Mapping", "Hands-on Lab", "Execute targeted port scans, OS fingerprinting, and script engine vulnerability discovery.", "Intermediate", 5.0, json.dumps(["Networking", "Linux"]), json.dumps(["Networking"]), "https://nmap.org/book/man.html"),
            ("res_05", "Splunk & SIEM Log Analysis Mastery", "Hands-on Lab", "Ingest Syslog, Windows Event Logs, and firewall data into Splunk to construct security dashboards.", "Intermediate", 7.0, json.dumps(["SIEM", "Log Analysis"]), json.dumps(["Linux", "Networking"]), "https://tryhackme.com/module/splunk"),
            ("res_06", "Incident Response Playbooks & Threat Containment", "Course", "Implement NIST and SANS incident handling frameworks for ransomware and data breaches.", "Advanced", 10.0, json.dumps(["Incident Response"]), json.dumps(["SIEM", "Linux"]), "https://www.sans.org/white-papers/"),
            ("res_07", "SOC Analyst Malware Triage Sandbox", "Project", "Set up an isolated sandbox to perform basic dynamic malware analysis and extract IOCs.", "Advanced", 12.0, json.dumps(["Incident Response", "Threat Intelligence"]), json.dumps(["SIEM", "Linux"]), "https://tryhackme.com/"),
            ("res_08", "SQL Injection & Web Application Defense", "Article", "Detailed breakdown of SQLi attack vectors, prepared statements, and WAF rules.", "Intermediate", 2.0, json.dumps(["SQL", "Web Security"]), json.dumps(["SQL"]), "https://owasp.org/www-community/attacks/SQL_Injection"),
            ("res_09", "Applied Threat Intelligence & MITRE ATT&CK Mapping", "Video", "Map enterprise telemetry to MITRE ATT&CK tactics, techniques, and procedures (TTPs).", "Intermediate", 3.0, json.dumps(["Threat Intelligence"]), json.dumps(["SIEM"]), "https://attack.mitre.org/"),
            ("res_10", "Python Automation for Security Analysts", "Course", "Build automated Python scripts for IP reputation lookups, automated WHOIS, and log parsers.", "Intermediate", 6.0, json.dumps(["Python", "Automation"]), json.dumps(["Python"]), "https://docs.python.org/3/library/"),
            ("res_11", "Wireshark Deep Dive: Packet Inspection Lab", "Hands-on Lab", "Filter TCP flags, dissect DNS tunneling attempts, and reconstruct HTTP sessions.", "Intermediate", 3.5, json.dumps(["Networking", "Wireshark"]), json.dumps(["Networking"]), "https://www.wireshark.org/sample_captures/"),
            ("res_12", "Snort IDS/IPS Rule Authoring", "Course", "Create custom intrusion detection rules to flag malicious payloads and unauthorized protocol usage.", "Intermediate", 5.0, json.dumps(["SIEM", "Networking"]), json.dumps(["Networking"]), "https://www.snort.org/documents"),
            ("res_13", "Memory Forensics with Volatility Framework", "Hands-on Lab", "Analyze Windows RAM dumps to detect injected DLLs, hidden processes, and credential dumping.", "Advanced", 8.0, json.dumps(["Incident Response"]), json.dumps(["Linux"]), "https://volatilityfoundation.org/"),
            ("res_14", "Cloud Security Foundations (AWS & Azure Sentinel)", "Course", "Configure CloudTrail, IAM policies, and Azure Sentinel for multi-cloud security visibility.", "Intermediate", 9.0, json.dumps(["SIEM", "Cloud Security"]), json.dumps(["Linux", "SIEM"]), "https://aws.amazon.com/security/"),
            ("res_15", "Cybersecurity Analyst Capstone Project", "Project", "Simulated enterprise SOC shift: Detect intrusion, perform triage, isolate host, write Incident Report.", "Advanced", 20.0, json.dumps(["Incident Response", "SIEM", "Networking", "Python"]), json.dumps(["SIEM", "Incident Response"]), "https://tryhackme.com/path/outline/soclevel1")
        ]
        cursor.executemany("""
            INSERT OR REPLACE INTO resources (id, title, type, description, difficulty, duration_hours, skills, prerequisites, url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, resources)

        # 4. Seed Learning Path for Demo Learner
        cursor.execute("DELETE FROM learning_paths WHERE user_id = 'sahil_01'")
        cursor.execute("DELETE FROM path_modules WHERE path_id = 'path_sahil_01'")
        
        cursor.execute("""
            INSERT OR IGNORE INTO learning_paths (id, user_id, goal, overall_progress, current_milestone)
            VALUES ('path_demo_01', 'demo_learner_01', 'Become a Full Stack Developer', 45, 'React & State Management')
        """)

        # 5. Seed Path Modules (5 Phases)
        modules = [
            ("mod_01", "path_demo_01", 1, "01 — Web & Programming Fundamentals", "Build robust core knowledge of HTML5, CSS3, JavaScript ES6+, and foundational programming logic.", "completed", 2, json.dumps(["res_01", "res_08"]), json.dumps({"title": "Responsive Web Portfolio Project", "type": "Project", "status": "completed"}), "quiz_01"),
            ("mod_02", "path_demo_01", 2, "02 — Frontend Mastery (React & State)", "Modern Component Architecture, Hooks, State Management, and API Integration.", "completed", 3, json.dumps(["res_02", "res_10"]), json.dumps({"title": "React E-Commerce Dashboard", "type": "Project", "status": "completed"}), "quiz_02"),
            ("mod_03", "path_demo_01", 3, "03 — Backend Architecture (FastAPI & Node)", "RESTful API Design, Middleware, Authentication, and Database Schemas.", "in_progress", 3, json.dumps(["res_03", "res_04", "res_11", "res_12"]), json.dumps({"title": "Full Stack Task Manager API", "type": "Project", "status": "in_progress"}), "quiz_03"),
            ("mod_04", "path_demo_01", 4, "04 — Databases & Data Pipelines", "Relational SQL (PostgreSQL/SQLite), Data Normalization, and ORM integration.", "upcoming", 4, json.dumps(["res_05", "res_09", "res_14"]), json.dumps({"title": "Database Schema & Query Optimizer", "type": "Project", "status": "upcoming"}), "quiz_04"),
            ("mod_05", "path_demo_01", 5, "05 — Cloud Deployment & DevOps", "Containerization with Docker, CI/CD Pipelines, and AWS/Vercel Cloud Hosting.", "upcoming", 4, json.dumps(["res_06", "res_07", "res_13", "res_15"]), json.dumps({"title": "Full Stack Capstone SaaS Application", "type": "Project", "status": "upcoming"}), "quiz_05")
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO path_modules (id, path_id, phase_number, title, description, status, estimated_weeks, resources_json, project_json, assessment_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, modules)

        # 6. Seed Assessments (Quizzes)
        assessments = [
            ("quiz_01", "Networking Fundamentals Assessment", "Evaluate your understanding of TCP/IP, OSI model, ports, and IP subnetting.", "mod_01", "Networking", json.dumps([
                {"id": 1, "question": "Which OSI layer is responsible for logical IP addressing and routing packets across subnets?", "options": ["Layer 2 - Data Link", "Layer 3 - Network", "Layer 4 - Transport", "Layer 7 - Application"], "correct_option": 1, "explanation": "The Network Layer (Layer 3) handles logical IP addressing and packet routing.", "skill_tag": "Networking"},
                {"id": 2, "question": "What is the primary function of the Address Resolution Protocol (ARP)?", "options": ["Translate domain names to IP addresses", "Map IP addresses to MAC physical addresses", "Encrypt web traffic", "Establish TCP 3-way handshake"], "correct_option": 1, "explanation": "ARP maps a known IP address to an Ethernet MAC address on a local area network.", "skill_tag": "Networking"},
                {"id": 3, "question": "Which port does HTTPS default to for secure TLS encrypted communication?", "options": ["Port 80", "Port 22", "Port 443", "Port 8080"], "correct_option": 2, "explanation": "HTTPS runs over TCP port 443.", "skill_tag": "Networking"}
            ])),
            ("quiz_02", "Linux Security & System Administration Quiz", "Assess file permissions, SSH hardening, process management, and shell security.", "mod_02", "Linux", json.dumps([
                {"id": 1, "question": "Which command changes file permissions in Linux so only the owner has read, write, and execute rights (700)?", "options": ["chmod 700 filename", "chown 700 filename", "chgrp 700 filename", "umask 700 filename"], "correct_option": 0, "explanation": "chmod sets access permissions. Octal 700 grants rwx to owner only.", "skill_tag": "Linux"},
                {"id": 2, "question": "Where are user account details and encrypted password hashes stored in standard Linux distributions?", "options": ["/etc/passwd", "/etc/shadow", "/var/log/auth.log", "/usr/bin/shadow"], "correct_option": 1, "explanation": "/etc/shadow contains secure hashed passwords accessible only by root.", "skill_tag": "Linux"}
            ])),
            ("quiz_03", "Security Tools & Wireshark Assessment", "Test packet dissection, display filters, and Nmap scan flags.", "mod_03", "Wireshark", json.dumps([
                {"id": 1, "question": "In Wireshark, which display filter selects all HTTP GET requests containing parameters?", "options": ["http.request.method == \"GET\"", "ip.addr == 192.168.1.1", "tcp.port == 80", "dns.flags.response == 0"], "correct_option": 0, "explanation": "http.request.method == \"GET\" filters HTTP traffic specifically for GET methods.", "skill_tag": "Wireshark"},
                {"id": 2, "question": "Which Nmap scan flag performs a TCP SYN (stealth / half-open) scan?", "options": ["-sT", "-sS", "-sU", "-sA"], "correct_option": 1, "explanation": "-sS initiates a TCP SYN scan, which sends a SYN packet and waits for SYN-ACK without completing the handshake.", "skill_tag": "Wireshark"}
            ])),
            ("quiz_04", "SIEM Log Analysis & Threat Detection Quiz", "Evaluate log parsing, Splunk SPL queries, and correlation logic.", "mod_04", "SIEM", json.dumps([
                {"id": 1, "question": "What is the primary role of a SIEM (Security Information and Event Management) platform in a SOC?", "options": ["Block incoming spam emails automatically", "Aggregate, index, analyze, and correlate security logs from enterprise sources", "Encrypt database storage drives", "Compile C++ code into executable binaries"], "correct_option": 1, "explanation": "SIEM aggregates log telemetry across servers, firewalls, and endpoints to correlate suspicious events.", "skill_tag": "SIEM"},
                {"id": 2, "question": "In Windows Event Logs, which Event ID corresponds to a failed user login attempt?", "options": ["Event ID 4624", "Event ID 4625", "Event ID 4672", "Event ID 1102"], "correct_option": 1, "explanation": "Event ID 4625 signifies an unsuccessful account logon attempt.", "skill_tag": "SIEM"}
            ])),
            ("quiz_05", "Incident Response & Forensics Capstone Quiz", "Verify NIST incident handler stages and threat mitigation techniques.", "mod_05", "Incident Response", json.dumps([
                {"id": 1, "question": "What is the immediate first step after confirming an active host compromise in a network?", "options": ["Delete the root directory", "Containment (isolate host from network to prevent lateral movement)", "Reinstall operating system immediately", "Issue a public press release"], "correct_option": 1, "explanation": "Containment limits the blast radius of an incident before detailed eradication and recovery.", "skill_tag": "Incident Response"}
            ]))
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO assessments (id, title, description, module_id, skill_tag, questions_json)
            VALUES (?, ?, ?, ?, ?, ?)
        """, assessments)

        # 7. Seed User Progress Data
        cursor.execute("DELETE FROM user_progress WHERE user_id = 'sahil_01'")
        
        progress = [
            ("demo_learner_01", "res_01", "completed", 100, 92),
            ("demo_learner_01", "res_02", "completed", 100, 88),
            ("demo_learner_01", "res_03", "in_progress", 75, None),
            ("demo_learner_01", "res_04", "in_progress", 50, None),
            ("demo_learner_01", "res_05", "in_progress", 40, None),
            ("demo_learner_01", "res_08", "completed", 100, 90),
            ("demo_learner_01", "res_10", "completed", 100, 95)
        ]
        cursor.executemany("""
            INSERT OR IGNORE INTO user_progress (user_id, resource_id, status, completion_percentage, score)
            VALUES (?, ?, ?, ?, ?)
        """, progress)

        conn.commit()
