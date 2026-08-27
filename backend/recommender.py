import json
from typing import List, Dict, Any
from backend.models import ResourceItem, LearnerProfile

# Target skill profiles for common goals / achievements
GOAL_SKILL_REQUIREMENTS = {
    "Cybersecurity Analyst": {
        "Networking": 95,
        "Linux": 80,
        "SIEM": 85,
        "Incident Response": 85,
        "Wireshark": 80,
        "Threat Detection": 80,
        "Threat Intelligence": 75,
        "Python": 75,
        "SQL": 70
    },
    "Data Scientist": {
        "Python": 95,
        "SQL": 90,
        "Machine Learning": 90,
        "Statistics": 85,
        "Data Visualization": 80,
        "Deep Learning": 75,
        "Pandas/NumPy": 85
    },
    "Full Stack Developer": {
        "JavaScript": 90,
        "React": 90,
        "Node.js": 85,
        "Python": 80,
        "SQL": 80,
        "HTML/CSS": 90,
        "Git": 85,
        "Java": 75
    },
    "Learn AI/ML & Prompt Engineering": {
        "Python": 95,
        "PyTorch/TensorFlow": 90,
        "Machine Learning": 90,
        "LLMs & RAG": 90,
        "Prompt Engineering": 85,
        "Math & Linear Algebra": 80
    },
    "AI/ML Engineer": {
        "Python": 95,
        "PyTorch/TensorFlow": 90,
        "Machine Learning": 90,
        "LLMs & RAG": 90,
        "Prompt Engineering": 85,
        "Math & Linear Algebra": 80
    },
    "Prepare for Technical Placements": {
        "Data Structures & Algorithms": 95,
        "System Design": 85,
        "Java": 85,
        "C++": 85,
        "Python": 80,
        "SQL": 80,
        "Computer Networks": 80,
        "Operating Systems": 80
    },
    "Learn Coding & Game Development (Ages 10-16)": {
        "Block Coding & Logic": 90,
        "Python": 80,
        "Game Dev (Scratch/Unity)": 85,
        "Problem Solving & Critical Thinking": 85,
        "HTML/CSS": 75,
        "Creative Thinking & Innovation": 80
    },
    "Cloud & DevOps Engineering (Ages 25-50)": {
        "DevOps & Docker": 95,
        "Cloud (AWS/Azure)": 90,
        "Linux": 85,
        "System Design": 85,
        "Python": 80,
        "Project & Agile Management (Scrum)": 80
    },
    "Project Management & Technical Leadership (Ages 25-50)": {
        "Leadership & Team Management": 95,
        "Project & Agile Management (Scrum)": 95,
        "Product Strategy & Business Analysis": 90,
        "Technical Communication": 90,
        "System Design": 80,
        "Time Management & Productivity": 85
    }
}

def get_goal_requirements(goal: str) -> Dict[str, int]:
    if goal in GOAL_SKILL_REQUIREMENTS:
        return GOAL_SKILL_REQUIREMENTS[goal]
    
    g_lower = goal.lower() if goal else ""
    if "game" in g_lower or "junior" in g_lower or "10" in g_lower or "scratch" in g_lower:
        return GOAL_SKILL_REQUIREMENTS["Learn Coding & Game Development (Ages 10-16)"]
    elif "leader" in g_lower or "project" in g_lower or "manage" in g_lower or "agile" in g_lower:
        return GOAL_SKILL_REQUIREMENTS["Project Management & Technical Leadership (Ages 25-50)"]
    elif "cloud" in g_lower or "devops" in g_lower:
        return GOAL_SKILL_REQUIREMENTS["Cloud & DevOps Engineering (Ages 25-50)"]
    elif "cyber" in g_lower or "sec" in g_lower or "threat" in g_lower:
        return GOAL_SKILL_REQUIREMENTS["Cybersecurity Analyst"]
    elif "data" in g_lower or "stat" in g_lower or "analyst" in g_lower:
        return GOAL_SKILL_REQUIREMENTS["Data Scientist"]
    elif "web" in g_lower or "full" in g_lower or "dev" in g_lower or "front" in g_lower or "back" in g_lower:
        return GOAL_SKILL_REQUIREMENTS["Full Stack Developer"]
    elif "ai" in g_lower or "ml" in g_lower or "machine" in g_lower or "deep" in g_lower:
        return GOAL_SKILL_REQUIREMENTS["AI/ML Engineer"]
    else:
        return {
            "Python": 85,
            "Problem Solving & Critical Thinking": 85,
            "Technical Communication": 80,
            "System Design": 80,
            "SQL": 75
        }

def calculate_recommendation_score(resource: ResourceItem, profile: LearnerProfile) -> Dict[str, Any]:
    goal_requirements = get_goal_requirements(profile.goal)
    
    # 1. Goal Relevance (30%)
    goal_matches = [s for s in resource.skills if s in goal_requirements]
    goal_relevance_score = (len(goal_matches) / max(1, len(resource.skills))) * 100

    # 2. Skill Gap (25%)
    # Highest score if resource addresses skills where user has a big gap
    gap_scores = []
    gap_reasons = []
    for skill in resource.skills:
        req_level = goal_requirements.get(skill, 70)
        curr_level = profile.existing_skills.get(skill, 0)
        gap = max(0, req_level - curr_level)
        gap_scores.append(gap)
        if gap > 20:
            gap_reasons.append(f"addresses your {skill} skill gap ({curr_level}% vs target {req_level}%)")
    
    skill_gap_score = min(100, (sum(gap_scores) / max(1, len(gap_scores))) * 1.5)

    # 3. Prerequisite Match (15%)
    prereq_met = 0
    if not resource.prerequisites:
        prereq_score = 100
    else:
        for prereq in resource.prerequisites:
            if profile.existing_skills.get(prereq, 0) >= 50:
                prereq_met += 1
        prereq_score = (prereq_met / len(resource.prerequisites)) * 100

    # 4. Difficulty Match (10%)
    exp_level_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
    res_diff_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
    user_exp = exp_level_map.get(profile.experience, 2)
    res_diff = res_diff_map.get(resource.difficulty, 2)
    
    diff_delta = abs(user_exp - res_diff)
    if diff_delta == 0:
        difficulty_score = 100
    elif diff_delta == 1:
        difficulty_score = 70
    else:
        difficulty_score = 40

    # 5. Interest Match (10%)
    interest_hits = 0
    if profile.interests:
        for s in resource.skills:
            if any(i.lower() in s.lower() or s.lower() in i.lower() for i in profile.interests):
                interest_hits += 1
        interest_score = min(100, (interest_hits / max(1, len(profile.interests))) * 100)
    else:
        interest_score = 80

    # 6. Learning Preference Match (10%)
    if profile.preferred_resource_type == "All" or profile.preferred_resource_type.lower() in resource.type.lower():
        preference_score = 100
    else:
        preference_score = 50

    # Total Weighted Score
    final_score = int(
        (0.30 * goal_relevance_score) +
        (0.25 * skill_gap_score) +
        (0.15 * prereq_score) +
        (0.10 * difficulty_score) +
        (0.10 * interest_score) +
        (0.10 * preference_score)
    )

    final_score = min(99, max(60, final_score)) # Clamp nicely between 60% and 99%

    # Build human-readable rationale
    reasons = []
    if gap_reasons:
        reasons.append(f"Recommended because it {gap_reasons[0]}")
    elif goal_matches:
        reasons.append(f"Directly supports your {profile.goal} target with key focus on {', '.join(goal_matches[:2])}")
    else:
        reasons.append(f"Matches your {profile.experience} level and learning preference for {resource.type} content")
    
    if prereq_score == 100 and resource.prerequisites:
        reasons.append(f"You meet all prerequisites ({', '.join(resource.prerequisites)})")

    why_recommended = ". ".join(reasons) + "."

    return {
        "score": final_score,
        "why_recommended": why_recommended
    }

def rank_resources(resources: List[ResourceItem], profile: LearnerProfile) -> List[ResourceItem]:
    ranked = []
    for r in resources:
        eval_res = calculate_recommendation_score(r, profile)
        r.match_score = eval_res["score"]
        r.why_recommended = eval_res["why_recommended"]
        ranked.append(r)

    # Sort descending by match score
    ranked.sort(key=lambda x: x.match_score, reverse=True)
    return ranked
