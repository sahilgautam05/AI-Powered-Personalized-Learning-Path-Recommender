import React from 'react';
import { Target, Award, ArrowRight, Play, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import './Dashboard.css';

export default function Dashboard({ profile, learningPath, recommendations, onNavigate, onOpenResource }) {
  const userGoal = profile?.goal || 'Cybersecurity Analyst';
  const userName = profile?.name || 'Sahil';
  const overallProgress = learningPath?.overall_progress || 68;
  const currentMilestone = learningPath?.current_milestone || 'Security Monitoring & SIEM';

  const nextRecommendation = recommendations && recommendations.length > 0 ? recommendations[0] : {
    id: "res_05",
    title: "Splunk & SIEM Log Analysis Mastery",
    type: "Hands-on Lab",
    description: "Ingest Syslog, Windows Event Logs, and firewall data into Splunk to construct security dashboards.",
    difficulty: "Intermediate",
    duration_hours: 7.0,
    skills: ["SIEM", "Log Analysis"],
    prerequisites: ["Linux", "Networking"],
    match_score: 95,
    why_recommended: "Recommended because it addresses your current SIEM skill gap (40% vs target 85%) and follows your completed security fundamentals module."
  };

  const GOAL_REQUIREMENTS_MAP = {
    'Cybersecurity Analyst': { 'Networking': 95, 'Linux': 80, 'SIEM': 85, 'Incident Response': 85, 'Python': 75, 'SQL': 70 },
    'Data Scientist': { 'Python': 95, 'SQL': 90, 'Machine Learning': 90, 'Statistics': 85, 'Data Visualization': 80, 'Deep Learning': 75 },
    'Full Stack Developer': { 'JavaScript': 90, 'React': 90, 'Node.js': 85, 'Python': 80, 'SQL': 80, 'HTML/CSS': 90 },
    'Learn AI/ML & Prompt Engineering': { 'Python': 95, 'PyTorch/TensorFlow': 90, 'Machine Learning': 90, 'LLMs & RAG': 90, 'Prompt Engineering': 85 },
    'Prepare for Technical Placements': { 'Data Structures & Algorithms': 95, 'System Design': 85, 'Java': 85, 'C++': 85, 'SQL': 80 },
    'Build an AI Startup': { 'Python': 90, 'LLMs & RAG': 90, 'Full Stack Architecture': 85, 'System Design': 85, 'DevOps & Cloud': 80 },
    'Learn Coding & Game Development (Ages 10-16)': { 'Block Coding & Logic': 90, 'Python': 80, 'Game Dev (Scratch/Unity)': 85, 'Problem Solving & Critical Thinking': 85 },
    'Cloud & DevOps Engineering (Ages 25-50)': { 'DevOps & Docker': 95, 'Cloud (AWS/Azure)': 90, 'Linux': 85, 'System Design': 85, 'Python': 80 },
    'Project Management & Technical Leadership (Ages 25-50)': { 'Leadership & Team Management': 95, 'Project & Agile Management (Scrum)': 95, 'Product Strategy & Business Analysis': 90, 'Technical Communication': 90 }
  };

  const getGoalSkillBars = () => {
    let reqs = GOAL_REQUIREMENTS_MAP[userGoal];
    if (!reqs) {
      const gLower = (userGoal || '').toLowerCase();
      if (gLower.includes('data')) reqs = GOAL_REQUIREMENTS_MAP['Data Scientist'];
      else if (gLower.includes('web') || gLower.includes('full') || gLower.includes('dev')) reqs = GOAL_REQUIREMENTS_MAP['Full Stack Developer'];
      else if (gLower.includes('ai') || gLower.includes('ml')) reqs = GOAL_REQUIREMENTS_MAP['Learn AI/ML & Prompt Engineering'];
      else if (gLower.includes('placement') || gLower.includes('dsa')) reqs = GOAL_REQUIREMENTS_MAP['Prepare for Technical Placements'];
      else if (gLower.includes('startup')) reqs = GOAL_REQUIREMENTS_MAP['Build an AI Startup'];
      else if (gLower.includes('game') || gLower.includes('10')) reqs = GOAL_REQUIREMENTS_MAP['Learn Coding & Game Development (Ages 10-16)'];
      else if (gLower.includes('cloud') || gLower.includes('devops')) reqs = GOAL_REQUIREMENTS_MAP['Cloud & DevOps Engineering (Ages 25-50)'];
      else if (gLower.includes('leader') || gLower.includes('manage')) reqs = GOAL_REQUIREMENTS_MAP['Project Management & Technical Leadership (Ages 25-50)'];
      else reqs = GOAL_REQUIREMENTS_MAP['Cybersecurity Analyst'];
    }

    const colors = ['#4f46e5', '#10b981', '#0284c7', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    return Object.entries(reqs).map(([sName, targetVal], idx) => {
      const userLevel = profile?.existing_skills?.[sName] || 0;
      const isGap = userLevel < targetVal - 10;
      return {
        name: sName,
        level: userLevel,
        target: targetVal,
        color: colors[idx % colors.length],
        gap: isGap
      };
    });
  };

  const skillBars = getGoalSkillBars();

  return (
    <div className="page-wrapper dashboard-page">
      {/* Welcome Banner */}
      <div className="welcome-banner card">
        <div className="welcome-text">
          <h1 className="page-title">Good evening, {userName} 👋</h1>
          <p className="page-subtitle">
            Let's continue your journey toward becoming a <strong>{userGoal}</strong>.
          </p>
        </div>
        <div className="banner-cta">
          <button className="btn btn-primary" onClick={() => onNavigate('learning-path')}>
            Continue Learning Path <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="dashboard-grid-3">
        {/* Progress Card */}
        <div className="card progress-summary-card">
          <div className="card-header">
            <span className="card-label">OVERALL PROGRESS</span>
            <span className="badge badge-primary">{overallProgress}%</span>
          </div>
          <div className="ring-progress-container">
            <div className="progress-ring-text">
              <span className="pct-num">{overallProgress}%</span>
              <span className="pct-label">Completed</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>

        {/* Current Goal Card */}
        <div className="card goal-info-card">
          <div className="card-header">
            <span className="card-label">CURRENT GOAL</span>
            <Target size={18} className="icon-primary" />
          </div>
          <h3 className="goal-title">{userGoal}</h3>
          <div className="goal-details">
            <div className="detail-item">
              <span className="detail-label">Target Timeline</span>
              <span className="detail-val">{profile?.target_duration || '6 Months'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Pace</span>
              <span className="detail-val">{profile?.weekly_hours || 10} hrs/week</span>
            </div>
          </div>
        </div>

        {/* Current Milestone Card */}
        <div className="card milestone-card">
          <div className="card-header">
            <span className="card-label">CURRENT MILESTONE</span>
            <span className="badge badge-warning">Phase 3</span>
          </div>
          <h3 className="milestone-title">{currentMilestone}</h3>
          <p className="milestone-sub">3 of 5 activities completed in this phase.</p>
          <button className="btn btn-secondary btn-sm milestone-btn" onClick={() => onNavigate('learning-path')}>
            <Play size={14} /> Continue Milestone
          </button>
        </div>
      </div>

      {/* Recommended Next Highlight Card */}
      <div className="recommended-next-section card">
        <div className="next-badge">
          <Sparkles size={16} /> RECOMMENDED NEXT ACTION
        </div>
        <div className="next-content-grid">
          <div className="next-info">
            <span className="badge badge-primary mb-2">{nextRecommendation.type}</span>
            <h2 className="next-title">{nextRecommendation.title}</h2>
            <p className="next-desc">{nextRecommendation.description}</p>

            <div className="next-why-box">
              <span className="why-label">Why Recommended?</span>
              <p className="why-text">"{nextRecommendation.why_recommended}"</p>
            </div>
          </div>

          <div className="next-action-side">
            <div className="match-big-pill">
              <span className="match-num">{nextRecommendation.match_score || 95}%</span>
              <span className="match-text">Match Score</span>
            </div>
            <button className="btn btn-primary btn-lg next-start-btn" onClick={() => onOpenResource ? onOpenResource(nextRecommendation) : onNavigate('learning-path')}>
              Start Learning Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Skill Progress Breakdown Cards */}
      <div className="section-title-row">
        <h2>Skill Proficiency & Target Gaps</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('skill-gap')}>
          View Full Skill Gap Analysis <ArrowRight size={14} />
        </button>
      </div>

      <div className="skills-grid">
        {skillBars.map((sk) => (
          <div key={sk.name} className={`skill-card card ${sk.gap ? 'has-gap' : ''}`}>
            <div className="skill-card-top">
              <span className="skill-name">{sk.name}</span>
              {sk.gap && <span className="badge badge-warning">⚡ Gap Area</span>}
              <span className="skill-level">{sk.level}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${sk.level}%`, backgroundColor: sk.color }}
              ></div>
            </div>
            <div className="skill-card-bottom">
              <span className="target-text">Goal Requirement: {sk.target}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
