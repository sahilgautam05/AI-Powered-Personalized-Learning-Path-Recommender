import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  BarChart, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Video, 
  Wrench, 
  Code, 
  Award, 
  ExternalLink,
  Sparkles,
  Play
} from 'lucide-react';
import './LearningPath.css';

export default function LearningPath({ learningPath, onOpenAssessment, onOpenResource }) {
  const [expandedPhases, setExpandedPhases] = useState({ mod_03: true });
  const [completedItems, setCompletedItems] = useState({
    'res_01': true,
    'res_02': true,
    'res_08': true,
    'res_10': true
  });

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const toggleResourceCompleted = (resId) => {
    setCompletedItems(prev => ({ ...prev, [resId]: !prev[resId] }));
  };

  const phases = learningPath?.phases || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="status-pill status-completed">✓ Completed</span>;
      case 'in_progress': return <span className="status-pill status-active">● In Progress</span>;
      default: return <span className="status-pill status-upcoming">○ Upcoming</span>;
    }
  };

  const getResourceIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video': return <Video size={16} className="type-icon video" />;
      case 'project': return <Code size={16} className="type-icon project" />;
      case 'hands-on lab': return <Wrench size={16} className="type-icon lab" />;
      default: return <FileText size={16} className="type-icon course" />;
    }
  };

  return (
    <div className="page-wrapper learning-path-page">
      {/* Header Banner */}
      <div className="page-header">
        <div className="header-top-row">
          <div>
            <h1 className="page-title">My Personalized Learning Path</h1>
            <p className="page-subtitle">
              Goal: <strong>{learningPath?.goal || 'Cybersecurity Analyst'}</strong> · Target Duration: <strong>{learningPath?.target_duration || '6 Months'}</strong>
            </p>
          </div>
          <div className="header-stats-pill">
            <span className="stat-label">Overall Path Completion</span>
            <span className="stat-val">{learningPath?.overall_progress || 68}%</span>
          </div>
        </div>
      </div>

      {/* Vertical Roadmap Timeline Container */}
      <div className="vertical-timeline-container">
        <div className="timeline-spine"></div>

        {phases.map((phase) => {
          const isExpanded = !!expandedPhases[phase.id];
          const isCompleted = phase.status === 'completed';
          const isActive = phase.status === 'in_progress';

          return (
            <div key={phase.id} className={`timeline-phase-card card ${phase.status}`}>
              {/* Phase Node Marker */}
              <div className={`node-marker ${phase.status}`}>
                {isCompleted ? <CheckCircle2 size={20} /> : isActive ? '●' : '○'}
              </div>

              {/* Phase Header Row */}
              <div className="phase-header-row" onClick={() => togglePhase(phase.id)}>
                <div className="phase-title-group">
                  <span className="phase-weeks">
                    <Clock size={14} /> {phase.estimated_weeks} Weeks
                  </span>
                  <h2 className="phase-main-title">{phase.title}</h2>
                  <p className="phase-main-desc">{phase.description}</p>
                </div>

                <div className="phase-action-right">
                  {getStatusBadge(phase.status)}
                  <button className="expand-toggle-btn">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expandable Phase Content */}
              {isExpanded && (
                <div className="phase-body">
                  <div className="body-divider"></div>

                  {/* Recommended Resources List */}
                  <div className="resources-section">
                    <h3 className="section-subtitle">
                      <Sparkles size={16} className="sparkle-icon" /> Learning Modules & Resources ({phase.resources.length})
                    </h3>

                    <div className="resources-list">
                      {phase.resources.map((res) => {
                        const isDone = !!completedItems[res.id];
                        return (
                          <div key={res.id} className={`resource-row-item ${isDone ? 'done' : ''}`}>
                            <input
                              type="checkbox"
                              className="custom-checkbox"
                              checked={isDone}
                              onChange={() => toggleResourceCompleted(res.id)}
                            />
                            {getResourceIcon(res.type)}

                            <div className="resource-row-details">
                              <span className="row-title">{res.title}</span>
                              <div className="row-meta">
                                <span className="type-tag">{res.type}</span>
                                <span>· {res.duration_hours} hrs</span>
                                <span>· {res.difficulty}</span>
                                {res.match_score && (
                                  <span className="match-tag">{res.match_score}% Match</span>
                                )}
                              </div>
                              {res.why_recommended && (
                                <p className="row-why">"{res.why_recommended}"</p>
                              )}
                            </div>

                            <button 
                              className="btn btn-secondary btn-sm open-res-btn"
                              onClick={() => onOpenResource && onOpenResource(res)}
                            >
                              Open Resource <ExternalLink size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Phase Project */}
                  {phase.project && (
                    <div className="phase-project-box">
                      <div className="project-header">
                        <Code size={18} className="project-icon" />
                        <div>
                          <span className="project-badge">PRACTICE PROJECT</span>
                          <h4 className="project-title">{phase.project.title}</h4>
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => onOpenResource && onOpenResource({
                          id: `proj_${phase.id}`,
                          title: phase.project.title,
                          type: 'Project',
                          difficulty: 'Intermediate',
                          duration_hours: 10,
                          skills: [learningPath?.goal || 'Domain Practice'],
                          why_recommended: 'Hands-on practice project to consolidate your learning phase skills.',
                          description: `Build and publish ${phase.project.title}. Follow software engineering best practices, repository documentation, and unit tests.`
                        })}
                      >
                        View Project Brief <ExternalLink size={13} />
                      </button>
                    </div>
                  )}

                  {/* Phase Assessment */}
                  {phase.assessment_id && (
                    <div className="phase-assessment-box">
                      <div className="assessment-header">
                        <Award size={20} className="award-icon" />
                        <div>
                          <h4 className="quiz-title">Module Verification Assessment</h4>
                          <p className="quiz-sub">Multiple-choice quiz to verify skills & adapt future recommendations.</p>
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary btn-sm quiz-btn"
                        onClick={() => onOpenAssessment && onOpenAssessment(phase.assessment_id)}
                      >
                        <Play size={14} /> Start Quiz Assessment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
