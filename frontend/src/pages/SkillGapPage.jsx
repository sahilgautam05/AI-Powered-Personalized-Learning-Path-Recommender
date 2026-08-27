import React from 'react';
import { Target, TrendingUp, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import './SkillGapPage.css';

export default function SkillGapPage({ profile, skillGapData, onImproveSkill }) {
  const goalName = profile?.goal || 'Cybersecurity Analyst';
  const skills = skillGapData?.skills || [
    { skill_name: 'SIEM', current_level: 40, required_level: 85, gap: 45, category: 'Technical' },
    { skill_name: 'Incident Response', current_level: 20, required_level: 85, gap: 65, category: 'Technical' },
    { skill_name: 'Threat Detection', current_level: 15, required_level: 80, gap: 65, category: 'Technical' },
    { skill_name: 'Linux', current_level: 60, required_level: 80, gap: 20, category: 'Technical' },
    { skill_name: 'Python', current_level: 85, required_level: 80, gap: 0, category: 'Technical' },
    { skill_name: 'Networking', current_level: 90, required_level: 95, gap: 5, category: 'Technical' }
  ];

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
