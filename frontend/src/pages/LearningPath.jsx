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

export default function LearningPath({ learningPath, onOpenAssessment, onOpenResource, completedResourceIds = new Set(), onMarkComplete }) {
  const DEFAULT_CYBER_PHASES = [
    {
      id: "mod_01",
      title: "01 — Computer Networking & Protocol Security",
      description: "Master TCP/IP, OSI 7-Layer model, DNS resolution, DHCP, Subnetting, IPv4/IPv6, and port protocols.",
      status: "completed",
      estimated_weeks: 3,
      resources: [
        { id: "res_01", title: "CompTIA Security+ (SY0-701) Full Certification Masterclass", type: "Course", description: "Master cybersecurity fundamentals, network security principles, threat analysis, and risk mitigation strategies.", difficulty: "Beginner", duration_hours: 14.5, skills: ["Networking", "Linux", "Threat Detection"], match_score: 98, why_recommended: "Essential core foundation for your Cybersecurity goal.", url: "https://www.youtube.com/watch?v=9neVwZuh0E8" },
        { id: "res_02", title: "Network Protocol Analysis & TCP 3-Way Handshake", type: "Article", description: "In-depth guide on packet headers, TCP flags, sequence numbers, and packet capture fundamentals.", difficulty: "Beginner", duration_hours: 2.0, skills: ["Networking"], match_score: 95, why_recommended: "Build foundational protocol analysis knowledge.", url: "https://developer.mozilla.org/en-US/docs/Glossary/TCP" }
      ],
      project: { title: "Enterprise Subnetting & Network Topology Diagram" },
      assessment_id: "quiz_01"
    },
    {
      id: "mod_02",
      title: "02 — Linux Administration & System Security",
      description: "Deep dive into Linux bash shell navigation, file permissions (chmod/chown), process management, and log files.",
      status: "completed",
      estimated_weeks: 4,
      resources: [
        { id: "res_08", title: "Linux Command Line & System Security Fundamentals", type: "Course", description: "Master Linux CLI, file permissions, user groups, systemctl services, and iptables firewall rules.", difficulty: "Intermediate", duration_hours: 8.5, skills: ["Linux", "System Security"], match_score: 96, why_recommended: "Core OS prerequisite for SIEM and SOC operations.", url: "https://www.youtube.com/watch?v=sWbEDqQfmNY" }
      ],
      project: { title: "Hardened Linux Server Configuration & Firewall Script" },
      assessment_id: "quiz_02"
    },
    {
      id: "mod_03",
      title: "03 — Security Monitoring, Wireshark & SIEM Log Analysis",
      description: "Ingest Syslog, Windows Event Logs, and firewall data into Splunk to construct security dashboards and detect attacks.",
      status: "in_progress",
      estimated_weeks: 5,
      resources: [
        { id: "res_03", title: "Network Traffic Analysis with Wireshark", type: "Hands-on Lab", description: "Capture and analyze live PCAP files. Detect SYN floods, ARP spoofing, and unencrypted credentials.", difficulty: "Intermediate", duration_hours: 5.5, skills: ["Wireshark", "Networking"], match_score: 97, why_recommended: "Directly addresses your Wireshark skill gap.", url: "https://www.youtube.com/watch?v=lb1Dw0elw0Q" },
        { id: "res_05", title: "Splunk & SIEM Log Analysis Mastery", type: "Hands-on Lab", description: "Ingest Syslog, Windows Event Logs, and firewall data into Splunk to construct security dashboards.", difficulty: "Intermediate", duration_hours: 7.0, skills: ["SIEM", "Log Analysis"], match_score: 95, why_recommended: "Addresses your current SIEM skill gap.", url: "https://tryhackme.com/module/splunk" }
      ],
      project: { title: "SOC Dashboard Construction & Log Ingestion Pipeline" },
      assessment_id: "quiz_03"
    },
    {
      id: "mod_04",
      title: "04 — Threat Detection & Vulnerability Assessment",
      description: "Perform active/passive network scanning with Nmap, audit open ports, and evaluate CVE vulnerabilities.",
      status: "upcoming",
      estimated_weeks: 4,
      resources: [
        { id: "res_04", title: "Nmap Network Scanning & Reconnaissance", type: "Hands-on Lab", description: "Master Nmap CLI flags: SYN scans, OS detection, service versioning, and NSE scripts.", difficulty: "Intermediate", duration_hours: 4.0, skills: ["Threat Detection", "Nmap"], match_score: 94, why_recommended: "Essential hands-on reconnaissance tool.", url: "https://nmap.org/book/man.html" }
      ],
      project: { title: "Network Vulnerability Audit & Executive Remediation Report" },
      assessment_id: "quiz_04"
    },
    {
      id: "mod_05",
      title: "05 — Incident Response & Forensics",
      description: "Triage security incidents, perform memory forensics, and isolate compromised enterprise hosts.",
      status: "upcoming",
      estimated_weeks: 4,
      resources: [
        { id: "res_06", title: "Incident Response Playbooks & NIST Framework", type: "Course", description: "Implement NIST SP 800-61 and SANS incident handling frameworks for containment and eradication.", difficulty: "Advanced", duration_hours: 10.0, skills: ["Incident Response"], match_score: 98, why_recommended: "Addresses Incident Response gap.", url: "https://www.sans.org/white-papers/" }
      ],
      project: { title: "Simulated SOC Shift Incident Triage & Forensic Report" },
      assessment_id: "quiz_05"
    }
  ];

  const DEFAULT_FULLSTACK_PHASES = [
    {
      id: "mod_fs_01",
      title: "01 — Modern HTML5, CSS3 & Responsive UI Systems",
      description: "Master semantic HTML5, Flexbox, CSS Grid layout math, CSS Variables, and responsive mobile-first UI patterns.",
      status: "completed",
      estimated_weeks: 3,
      resources: [
        { id: "fs_res_01", title: "Full Stack Web Development Bootcamp 2024", type: "Course", description: "Complete modern web development course covering HTML5, CSS3, JavaScript ES6+, React, Node.js, and Express.", difficulty: "Beginner", duration_hours: 22.0, skills: ["HTML/CSS", "JavaScript"], match_score: 99, why_recommended: "Essential foundation for Full Stack Web Development.", url: "https://www.youtube.com/watch?v=nu_pCVPKzTk" }
      ],
      project: { title: "Portfolio Website & Flexbox/Grid Layout Systems" },
      assessment_id: "quiz_01"
    },
    {
      id: "mod_fs_02",
      title: "02 — Modern JavaScript ES6+ & Async Programming",
      description: "Deep dive into JS ES6+, Closures, Event Loop, Promises, Async/Await, Fetch API, and DOM manipulation.",
      status: "in_progress",
      estimated_weeks: 4,
      resources: [
        { id: "fs_res_02", title: "JavaScript ES6+ & Async Masterclass", type: "Course", description: "Master modern JS features: Arrow functions, Promises, Async/Await, Array methods, and ES Modules.", difficulty: "Intermediate", duration_hours: 12.0, skills: ["JavaScript", "Promises"], match_score: 97, why_recommended: "Core language mastery required for React & Node.js.", url: "https://www.youtube.com/watch?v=R9I85RhI7Cg" }
      ],
      project: { title: "Interactive Task Tracker with LocalStorage Persistence" },
      assessment_id: "quiz_02"
    },
    {
      id: "mod_fs_03",
      title: "03 — React 18, JSX & Component Architecture",
      description: "Build Single-Page Applications (SPAs) with React components, Props, State Hooks (useState, useEffect), and custom Hooks.",
      status: "upcoming",
      estimated_weeks: 4,
      resources: [
        { id: "fs_res_03", title: "React 18 Full Course & Hooks Deep Dive", type: "Course", description: "Learn Component lifecycle, State management, Context API, and Custom Hooks in React 18.", difficulty: "Intermediate", duration_hours: 16.0, skills: ["React", "JavaScript"], match_score: 98, why_recommended: "Industry standard frontend framework for modern full stack apps.", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" }
      ],
      project: { title: "E-Commerce Frontend SPA with React & Cart Management" },
      assessment_id: "quiz_03"
    },
    {
      id: "mod_fs_04",
      title: "04 — Node.js, Express & RESTful API Microservices",
      description: "Build scalable backend APIs using Node.js, Express middleware, authentication JWTs, and CORS security.",
      status: "upcoming",
      estimated_weeks: 4,
      resources: [
        { id: "fs_res_04", title: "Node.js & Express REST API Backend Development", type: "Course", description: "Design REST APIs, middleware error handlers, JWT authentication, and file upload systems.", difficulty: "Intermediate", duration_hours: 14.0, skills: ["Node.js", "Express"], match_score: 96, why_recommended: "Build the server-side API layer of full stack applications.", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" }
      ],
      project: { title: "RESTful User Auth & Product Catalog Microservice API" },
      assessment_id: "quiz_04"
    },
    {
      id: "mod_fs_05",
      title: "05 — Database Persistence, SQL & Deployment (DevOps)",
      description: "Design relational database schemas, write SQL queries, integrate ORMs, and deploy full stack apps to production cloud.",
      status: "upcoming",
      estimated_weeks: 5,
      resources: [
        { id: "fs_res_05", title: "SQL & PostgreSQL Database Engineering", type: "Course", description: "Master relational table design, JOIN queries, indexing, transactions, and SQLite/PostgreSQL integration.", difficulty: "Advanced", duration_hours: 15.0, skills: ["SQL", "PostgreSQL"], match_score: 95, why_recommended: "Permanent database storage and production deployment.", url: "https://www.youtube.com/watch?v=qw--VYLpxG4" }
      ],
      project: { title: "Full Stack SaaS Platform Production Deployment" },
      assessment_id: "quiz_05"
    }
  ];

  const userGoal = learningPath?.goal || 'Full Stack Developer';
  const rawPhases = (learningPath && learningPath.phases && learningPath.phases.length > 0) ? learningPath.phases : (userGoal.toLowerCase().includes('cyber') ? DEFAULT_CYBER_PHASES : DEFAULT_FULLSTACK_PHASES);

  const phases = rawPhases;

  const [expandedPhases, setExpandedPhases] = useState(() => {
    const init = {};
    if (phases && phases.length > 0) {
      phases.forEach(p => {
        init[p.id] = (p.status === 'in_progress' || p.status === 'completed');
      });
      if (phases[0]) init[phases[0].id] = true;
    }
    return init;
  });

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const toggleResourceCompleted = (resId, skills = []) => {
    if (onMarkComplete) {
      onMarkComplete(resId, skills);
    }
  };

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
                        const isDone = completedResourceIds.has(res.id);
                        return (
                          <div key={res.id} className={`resource-row-item ${isDone ? 'done' : ''}`}>
                            <input
                              type="checkbox"
                              className="custom-checkbox"
                              checked={isDone}
                              onChange={() => toggleResourceCompleted(res.id, res.skills || [])}
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
