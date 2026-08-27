import React, { useEffect, useState } from 'react';
import { BarChart2, Flame, Award, BookOpen, CheckCircle, Clock, Zap } from 'lucide-react';
import { api } from '../services/api';
import './ProgressPage.css';

export default function ProgressPage({ profile }) {
  const [progressData, setProgressData] = useState({
    overall_completion: 68,
    weekly_hours_target: 10,
    hours_logged_this_week: 8.5,
    courses_completed: 4,
    projects_completed: 2,
    assessments_completed: 3,
    average_assessment_score: 88,
    current_streak_days: 12,
    weekly_activity: [
      { day: 'Mon', hours: 1.5 },
      { day: 'Tue', hours: 2.0 },
      { day: 'Wed', hours: 1.0 },
      { day: 'Thu', hours: 2.5 },
      { day: 'Fri', hours: 1.5 },
      { day: 'Sat', hours: 0.0 },
      { day: 'Sun', hours: 0.0 }
    ],
    skills_gained: [
      { name: 'Networking', level: 90 },
      { name: 'Python', level: 85 },
      { name: 'SQL', level: 70 },
      { name: 'Linux', level: 60 },
      { name: 'SIEM', level: 40 }
    ]
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getProgress(profile?.user_id || 'sahil_01');
        if (res) setProgressData(res);
      } catch (err) {}
    }
    loadData();
  }, [profile]);

  const maxHours = Math.max(...progressData.weekly_activity.map(d => d.hours), 3.0);

  return (
    <div className="page-wrapper progress-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Progress & Analytics Dashboard</h1>
        <p className="page-subtitle">Detailed telemetry on your learning hours, streak, and assessment performance.</p>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid-4">
        <div className="metric-card card">
          <div className="metric-icon streak"><Flame size={22} /></div>
          <div className="metric-text">
            <span className="m-val">{progressData.current_streak_days} Days</span>
            <span className="m-label">Current Streak</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon hours"><Clock size={22} /></div>
          <div className="metric-text">
            <span className="m-val">{progressData.hours_logged_this_week} / {progressData.weekly_hours_target} hrs</span>
            <span className="m-label">This Week's Pace</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon score"><Award size={22} /></div>
          <div className="metric-text">
            <span className="m-val">{progressData.average_assessment_score}%</span>
            <span className="m-label">Avg Quiz Score</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon projects"><BookOpen size={22} /></div>
          <div className="metric-text">
            <span className="m-val">{progressData.projects_completed} Completed</span>
            <span className="m-label">Capstone Projects</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid-2">
        {/* Weekly Hours Bar Chart (Native SVG) */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3>Weekly Learning Hours</h3>
            <span className="badge badge-primary">{progressData.hours_logged_this_week} Total Hours</span>
          </div>

          <div className="svg-chart-container">
            <svg viewBox="0 0 350 180" className="bar-chart-svg">
              {progressData.weekly_activity.map((item, idx) => {
                const barHeight = (item.hours / maxHours) * 120;
                const x = 25 + idx * 46;
                const y = 140 - barHeight;

                return (
                  <g key={item.day}>
                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width="24"
                      height={barHeight}
                      rx="4"
                      className={`bar-rect ${item.hours > 0 ? 'active' : 'empty'}`}
                    />
                    {/* Label */}
                    <text x={x + 12} y="160" textAnchor="middle" className="chart-axis-label">
                      {item.day}
                    </text>
                    {/* Value */}
                    {item.hours > 0 && (
                      <text x={x + 12} y={y - 6} textAnchor="middle" className="chart-val-label">
                        {item.hours}h
                      </text>
                    )}
                  </g>
                );
              })}
              <line x1="15" y1="140" x2="335" y2="140" stroke="var(--border)" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Skills Gained Breakdown */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3>Skills Level Growth</h3>
            <span className="badge badge-success">5 Verified Skills</span>
          </div>

          <div className="skills-growth-list">
            {progressData.skills_gained.map((sk) => (
              <div key={sk.name} className="growth-row">
                <div className="growth-row-top">
                  <span className="g-name">{sk.name}</span>
                  <span className="g-val">{sk.level}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${sk.level}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
