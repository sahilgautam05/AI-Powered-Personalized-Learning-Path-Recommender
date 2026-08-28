import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Code, 
  Shield, 
  Flame, 
  Play, 
  Sparkles, 
  Check, 
  Clock, 
  ChevronRight,
  RefreshCw,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import './WeeklyTasksPage.css';

export default function WeeklyTasksPage({ profile, onOpenResource }) {
  const [taskData, setTaskData] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const fetchWeeklyChallenge = async () => {
    try {
      setLoading(true);
      const res = await api.getWeeklyTask(profile?.id || 'sahil_01');
      setTaskData(res);
      if (res?.task?.starter_code) {
        setUserCode(res.task.starter_code);
      }
    } catch (err) {
      console.error("Error fetching weekly challenge:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyChallenge();
  }, [profile]);

  const handleSubmitChallenge = async () => {
    if (!taskData?.task) return;
    try {
      setSubmitting(true);
      const res = await api.submitWeeklyTask(
        profile?.id || 'sahil_01',
        taskData.task.task_id,
        userCode
      );
      setEvaluationResult(res);
      // Refresh weekly task state after submission
      setTimeout(() => {
        fetchWeeklyChallenge();
      }, 1500);
    } catch (err) {
      console.error("Error submitting task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex-center">
        <div className="loading-spinner-box">
          <Sparkles className="spinning-icon" size={40} color="var(--primary)" />
          <p>Loading your adaptive weekly performance challenge...</p>
        </div>
      </div>
    );
  }

  const task = taskData?.task;
  const perfScore = taskData?.performance_score || 55;
  const difficulty = taskData?.difficulty_level || 'Beginner';

  const getDifficultyBadge = (diff) => {
    switch (diff.toLowerCase()) {
      case 'advanced':
        return <span className="diff-pill diff-advanced">🔴 Advanced Tier (Level 3)</span>;
      case 'intermediate':
        return <span className="diff-pill diff-intermediate">🟡 Intermediate Tier (Level 2)</span>;
      default:
        return <span className="diff-pill diff-beginner">🟢 Beginner Tier (Level 1)</span>;
    }
  };

  return (
    <div className="page-container weekly-tasks-page">
      {/* Header Banner */}
      <div className="weekly-header-banner">
        <div className="header-left">
          <span className="badge badge-accent">
            <Flame size={14} style={{ marginRight: 6 }} /> Adaptive Performance Tracking
          </span>
          <h1 className="page-title">Weekly Skill Challenges</h1>
          <p className="page-subtitle">
            Complete your goal-tailored weekly challenge to track your real-time performance. As your score increases, the system automatically elevates task difficulty!
          </p>
        </div>

        {/* Adaptive Performance Telemetry */}
        <div className="performance-telemetry-card">
          <div className="telemetry-item">
            <span className="telemetry-label">Performance Score</span>
            <div className="telemetry-val-group">
              <TrendingUp size={22} color="var(--primary)" />
              <span className="telemetry-score">{perfScore}%</span>
            </div>
            <div className="score-progress-bar">
              <div className="score-fill" style={{ width: `${perfScore}%` }}></div>
            </div>
          </div>

          <div className="telemetry-divider"></div>

          <div className="telemetry-item">
            <span className="telemetry-label">Current Difficulty Tier</span>
            <div className="telemetry-badge-wrapper">
              {getDifficultyBadge(difficulty)}
            </div>
            <p className="tier-unlock-hint">
              {perfScore < 60 ? "Score 60%+ to unlock Intermediate Tier" : perfScore < 80 ? "Score 80%+ to unlock Advanced Tier" : "🏆 Master Tier Unlocked!"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Challenge Grid */}
      <div className="challenge-grid">
        {/* Left Column: Challenge Brief & Objectives */}
        <div className="challenge-brief-col card">
          <div className="challenge-meta-row">
            <span className="week-tag">Week #{task?.week_number || 1}</span>
            <span className="category-tag">{task?.category || 'Domain Practice'}</span>
            <span className="xp-tag">+{task?.xp_reward || 150} XP</span>
          </div>

          <h2 className="challenge-title">{task?.title}</h2>
          <p className="challenge-desc">{task?.description}</p>

          <div className="objectives-box">
            <h3><CheckCircle2 size={18} color="var(--success)" /> Task Objectives</h3>
            <ul className="objectives-list">
              {task?.objectives?.map((obj, idx) => (
                <li key={idx}>
                  <span className="obj-check">✓</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {task?.verification_hint && (
            <div className="verification-hint-box">
              <Sparkles size={16} color="var(--warning)" />
              <span><strong>Verification Hint:</strong> {task.verification_hint}</span>
            </div>
          )}
        </div>

        {/* Right Column: Code/Text Solution Workspace */}
        <div className="challenge-workspace-col card">
          <div className="workspace-header">
            <h3><Code size={20} color="var(--primary)" /> Verification Workspace</h3>
            <span className="status-indicator">
              {task?.is_completed ? "✓ Completed" : "● Active Challenge"}
            </span>
          </div>

          <p className="workspace-instruction">
            Write or paste your solution script/answer below to trigger automated performance evaluation:
          </p>

          <textarea
            className="solution-textarea"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            placeholder="Type your solution code or answer here..."
            rows={10}
            disabled={task?.is_completed}
          />

          <div className="workspace-footer">
            <button
              className="btn btn-primary submit-challenge-btn"
              onClick={handleSubmitChallenge}
              disabled={submitting || task?.is_completed}
            >
              {submitting ? (
                <>
                  <RefreshCw className="spinning-icon" size={18} />
                  Evaluating Performance...
                </>
              ) : task?.is_completed ? (
                <>
                  <CheckCircle2 size={18} />
                  Challenge Verified & Completed!
                </>
              ) : (
                <>
                  <Play size={18} />
                  Submit Challenge & Level Up Difficulty
                </>
              )}
            </button>
          </div>

          {/* Evaluation Result Alert */}
          {evaluationResult && (
            <div className={`evaluation-alert ${evaluationResult.leveled_up ? 'level-up' : 'success'}`}>
              <div className="alert-header">
                <Sparkles size={24} />
                <h4>{evaluationResult.leveled_up ? "🎉 LEVEL UP! Difficulty Increased!" : "Challenge Completed!"}</h4>
              </div>
              <p>{evaluationResult.message}</p>
              <div className="result-stats-row">
                <span className="stat-badge">New Performance Score: <strong>{evaluationResult.new_performance_score}%</strong></span>
                <span className="stat-badge">Difficulty Tier: <strong>{evaluationResult.new_difficulty_level}</strong></span>
                <span className="stat-badge">XP Earned: <strong>+{evaluationResult.xp_earned} XP</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progression Roadmap Matrix */}
      <div className="difficulty-progression-section card">
        <h3><TrendingUp size={20} color="var(--primary)" /> Adaptive Difficulty Progression Matrix</h3>
        <div className="progression-tiers-grid">
          <div className={`tier-card ${difficulty === 'Beginner' ? 'active-tier' : 'unlocked-tier'}`}>
            <div className="tier-header">
              <span className="tier-num">Level 1</span>
              <h4>Beginner Tier</h4>
            </div>
            <p className="tier-desc">Foundational syntax, core setup, basic CLI commands, and essential theory.</p>
            <span className="score-range">Performance &lt; 60%</span>
          </div>

          <div className={`tier-card ${difficulty === 'Intermediate' ? 'active-tier' : perfScore >= 60 ? 'unlocked-tier' : 'locked-tier'}`}>
            <div className="tier-header">
              <span className="tier-num">Level 2</span>
              <h4>Intermediate Tier</h4>
            </div>
            <p className="tier-desc">Practical packet filtering, React hooks, API integration, and log parsing.</p>
            <span className="score-range">Performance 60% - 80%</span>
          </div>

          <div className={`tier-card ${difficulty === 'Advanced' ? 'active-tier' : perfScore >= 80 ? 'unlocked-tier' : 'locked-tier'}`}>
            <div className="tier-header">
              <span className="tier-num">Level 3</span>
              <h4>Advanced Tier</h4>
            </div>
            <p className="tier-desc">Automated incident triage scripts, JWT rate limiting microservices, and capstones.</p>
            <span className="score-range">Performance &gt; 80%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
