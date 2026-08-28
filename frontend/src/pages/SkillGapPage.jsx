import React from 'react';
import { Target, TrendingUp, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import './SkillGapPage.css';

export default function SkillGapPage({ profile, skillGapData, onImproveSkill }) {
  const goalName = profile?.goal || 'Cybersecurity Analyst';

  const GOAL_REQ_MAP = {
    'Cybersecurity Analyst': { 'Networking': 95, 'Linux': 80, 'SIEM': 85, 'Incident Response': 85, 'Python': 75, 'SQL': 70 },
    'Data Scientist': { 'Python': 95, 'SQL': 90, 'Machine Learning': 90, 'Statistics': 85, 'Data Visualization': 80, 'Deep Learning': 75 },
    'Full Stack Developer': { 'JavaScript': 90, 'React': 90, 'Node.js': 85, 'Python': 80, 'SQL': 80, 'HTML/CSS': 90 },
    'Learn AI/ML & Prompt Engineering': { 'Python': 95, 'PyTorch/TensorFlow': 90, 'Machine Learning': 90, 'LLMs & RAG': 90, 'Prompt Engineering': 85 },
    'Prepare for Technical Placements': { 'Data Structures & Algorithms': 95, 'System Design': 85, 'Java': 85, 'C++': 85, 'SQL': 80 },
    'Build an AI Startup': { 'Python': 90, 'LLMs & RAG': 90, 'Full Stack Architecture': 85, 'System Design': 85, 'DevOps & Cloud': 80 }
  };

  const getDynamicSkills = () => {
    if (skillGapData && skillGapData.skills && skillGapData.skills.length > 0) {
      return skillGapData.skills;
    }
    const reqs = GOAL_REQ_MAP[goalName] || GOAL_REQ_MAP['Full Stack Developer'];
    return Object.entries(reqs).map(([sName, reqVal]) => {
      const currVal = profile?.existing_skills?.[sName] || 25;
      const gap = max(0, reqVal - currVal);
      return {
        skill_name: sName,
        current_level: currVal,
        required_level: reqVal,
        gap: gap,
        category: 'Technical'
      };
    });
  };

  const max = (a, b) => (a > b ? a : b);
  const skills = getDynamicSkills();

  const gapSkills = skills.filter(s => s.gap > 0);
  const masteredSkills = skills.filter(s => s.gap === 0);

  return (
    <div className="page-wrapper skill-gap-page">
      {/* Header */}
      <div className="page-header card gap-header-card">
        <div>
          <div className="badge badge-primary mb-2">
            <Target size={14} /> Domain Benchmark Analysis
          </div>
          <h1 className="page-title">Skill Gap & Proficiency Report</h1>
          <p className="page-subtitle">
            Comparing your profile against standard requirements for <strong>{goalName}</strong>.
          </p>
        </div>

        <div className="gap-summary-stats">
          <div className="stat-box">
            <span className="stat-num">{gapSkills.length}</span>
            <span className="stat-desc">Skill Gaps Identified</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{masteredSkills.length}</span>
            <span className="stat-desc">Target Benchmark Met</span>
          </div>
        </div>
      </div>

      {/* Primary Skill Gaps List */}
      <div className="section-block">
        <h2 className="block-title">
          <AlertCircle size={20} className="warning-icon" /> Target Skill Gaps to Improve
        </h2>

        <div className="gap-cards-list">
          {gapSkills.map((sk) => (
            <div key={sk.skill_name} className="gap-card card">
              <div className="gap-card-top">
                <div>
                  <h3 className="skill-title">{sk.skill_name}</h3>
                  <span className="gap-subtext">Skill Gap: <strong>{sk.gap}%</strong></span>
                </div>
                <button 
                  className="btn btn-primary btn-sm improve-btn"
                  onClick={() => onImproveSkill && onImproveSkill(sk.skill_name)}
                >
                  Improve Skill <ArrowRight size={14} />
                </button>
              </div>

              {/* Comparative Progress Bar */}
              <div className="comp-bar-wrapper">
                <div className="comp-bar-labels">
                  <span>Current: <strong>{sk.current_level}%</strong></span>
                  <span>Required: <strong>{sk.required_level}%</strong></span>
                </div>

                <div className="dual-progress-bar">
                  <div 
                    className="bar-fill current" 
                    style={{ width: `${sk.current_level}%` }}
                    title={`Current Level: ${sk.current_level}%`}
                  />
                  <div 
                    className="bar-fill required-target" 
                    style={{ width: `${sk.required_level}%` }}
                    title={`Target Requirement: ${sk.required_level}%`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mastered Skills List */}
      <div className="section-block mt-4">
        <h2 className="block-title">
          <CheckCircle2 size={20} className="success-icon" /> Benchmarks Met & Strengths
        </h2>

        <div className="mastered-grid">
          {masteredSkills.map((sk) => (
            <div key={sk.skill_name} className="mastered-card card">
              <div className="mastered-top">
                <span className="m-title">{sk.skill_name}</span>
                <span className="badge badge-success">✓ Benchmark Met</span>
              </div>
              <div className="progress-bar-container mt-2">
                <div className="progress-bar-fill" style={{ width: `${sk.current_level}%`, backgroundColor: 'var(--success)' }}></div>
              </div>
              <span className="m-val">{sk.current_level}% Proficiency</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
