import React from 'react';
import { Clock, BarChart, Sparkles, ExternalLink, CheckCircle } from 'lucide-react';
import './RecommendationCard.css';

export default function RecommendationCard({ resource, onSelect, isCompleted = false }) {
  const { title, type, difficulty, duration_hours, skills, match_score, why_recommended, description } = resource;

  const getBadgeClass = (resType) => {
    switch (resType.toLowerCase()) {
      case 'project': return 'badge-primary';
      case 'hands-on lab': return 'badge-success';
      case 'course': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className={`recommendation-card ${isCompleted ? 'completed' : ''}`}>
      <div className="card-top-bar">
        <span className={`badge ${getBadgeClass(type)}`}>{type}</span>
        <div className="match-score-pill">
          <Sparkles size={14} className="sparkle-icon" />
          <span>{match_score || 92}% Match</span>
        </div>
      </div>

      <h3 className="resource-title">{title}</h3>

      <div className="resource-meta">
        <span className="meta-item">
          <Clock size={14} /> {duration_hours} hrs
        </span>
        <span className="meta-bullet">•</span>
        <span className="meta-item">
          <BarChart size={14} /> {difficulty}
        </span>
      </div>

      <p className="resource-description">{description}</p>

      <div className="skills-tags">
        {skills && skills.map((s, idx) => (
          <span key={idx} className="skill-tag">{s}</span>
        ))}
      </div>

      {why_recommended && (
        <div className="why-recommended-box">
          <span className="why-label">Why recommended?</span>
          <p className="why-text">"{why_recommended}"</p>
        </div>
      )}

      <div className="card-footer-action">
        <button 
          className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} btn-sm card-btn`}
          onClick={() => onSelect && onSelect(resource)}
        >
          {isCompleted ? (
            <>
              <CheckCircle size={15} /> Completed
            </>
          ) : (
            <>
              Explore Details
            </>
          )}
        </button>
        
        <button 
          className="btn btn-secondary btn-sm card-btn"
          onClick={(e) => {
            e.stopPropagation();
            const targetUrl = (resource.url && resource.url !== '#') ? resource.url : `https://www.google.com/search?q=${encodeURIComponent(title + ' free course tutorial')}`;
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
          }}
          title="Open authentic learning platform in new tab"
        >
          Start Learning <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}
