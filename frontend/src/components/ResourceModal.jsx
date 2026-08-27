import React from 'react';
import { X, ExternalLink, Clock, BarChart, Sparkles, CheckCircle2, BookOpen, ShieldCheck } from 'lucide-react';
import './ResourceModal.css';

export default function ResourceModal({ resource, isOpen, onClose, onMarkComplete, isCompleted = false }) {
  if (!isOpen || !resource) return null;

  const { title, type, difficulty, duration_hours, skills, prerequisites, match_score, why_recommended, description, url } = resource;

  const handleLaunchExternal = () => {
    const targetUrl = url || `https://www.google.com/search?q=${encodeURIComponent(title + ' tutorial course')}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleComplete = () => {
    if (onMarkComplete) {
      onMarkComplete(resource.id);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="resource-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="resource-modal-header">
          <div className="modal-title-group">
            <span className="type-badge-pill">{type || 'Resource'}</span>
            <div className="match-score-tag">
              <Sparkles size={14} />
              <span>{match_score || 95}% Match</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <h2 className="resource-modal-title">{title}</h2>

        {/* Meta Stats */}
        <div className="resource-modal-meta">
          <div className="meta-stat">
            <Clock size={16} />
            <span>Estimated: {duration_hours || 5} Hours</span>
          </div>
          <div className="meta-stat">
            <BarChart size={16} />
            <span>Level: {difficulty || 'Intermediate'}</span>
          </div>
        </div>

        {/* AI Recommendation Explanation */}
        {why_recommended && (
          <div className="ai-rationale-card">
            <div className="rationale-header">
              <Sparkles size={16} className="sparkle-icon" />
              <span>AI Recommender Rationale</span>
            </div>
            <p className="rationale-body">"{why_recommended}"</p>
          </div>
        )}

        {/* Description */}
        <div className="modal-section">
          <h4 className="modal-section-heading">Overview & Objectives</h4>
          <p className="modal-description-text">{description || 'Master essential concepts through interactive lessons and practical labs.'}</p>
        </div>

        {/* Skills Covered */}
        {skills && skills.length > 0 && (
          <div className="modal-section">
            <h4 className="modal-section-heading">Target Skills Gained</h4>
            <div className="skills-badge-wrap">
              {skills.map((s, idx) => (
                <span key={idx} className="skill-pill-badge">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Prerequisites */}
        {prerequisites && prerequisites.length > 0 && (
          <div className="modal-section">
            <h4 className="modal-section-heading">Prerequisites</h4>
            <div className="prereq-badge-wrap">
              {prerequisites.map((p, idx) => (
                <span key={idx} className="prereq-pill-badge"><ShieldCheck size={12} /> {p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="resource-modal-footer">
          <button className="btn btn-secondary flex-1" onClick={handleLaunchExternal}>
            Open Resource Platform <ExternalLink size={16} />
          </button>

          <button 
            className={`btn ${isCompleted ? 'btn-success' : 'btn-primary'} flex-1`} 
            onClick={handleComplete}
          >
            <CheckCircle2 size={16} />
            {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
          </button>
        </div>
      </div>
    </div>
  );
}
