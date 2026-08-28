import React, { useState } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import './ExplorePage.css';

export default function ExplorePage({ recommendations = [], onSelectResource, completedResourceIds = new Set(), onMarkComplete }) {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const DEFAULT_CATALOG = [
    {
      id: "res_01",
      title: "CompTIA Security+ (SY0-701) Full Certification Masterclass",
      type: "Course",
      description: "Master cybersecurity fundamentals, network security principles, threat analysis, and risk mitigation strategies.",
      difficulty: "Beginner",
      duration_hours: 14.5,
      skills: ["Networking", "Linux", "Threat Detection"],
      prerequisites: ["Computer Fundamentals"],
      match_score: 98,
      why_recommended: "Essential core foundation for your Cybersecurity goal.",
      url: "https://www.youtube.com/watch?v=9neVwZuh0E8"
    },
    {
      id: "res_05",
      title: "Splunk & SIEM Log Analysis Mastery",
      type: "Hands-on Lab",
      description: "Ingest Syslog, Windows Event Logs, and firewall data into Splunk to construct security dashboards.",
      difficulty: "Intermediate",
      duration_hours: 7.0,
      skills: ["SIEM", "Log Analysis"],
      prerequisites: ["Linux", "Networking"],
      match_score: 95,
      why_recommended: "Recommended because it addresses your SIEM gap.",
      url: "https://tryhackme.com/module/splunk"
    },
    {
      id: "res_08",
      title: "Python for Security Automation & Scripting",
      type: "Course",
      description: "Build custom port scanners, automated log parsers, and threat intelligence scrapers in Python.",
      difficulty: "Intermediate",
      duration_hours: 9.0,
      skills: ["Python", "Automation"],
      prerequisites: ["Python Basics"],
      match_score: 92,
      why_recommended: "Boosts Python automation skills.",
      url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE"
    },
    {
      id: "fs_res_01",
      title: "Full Stack Web Development Bootcamp 2024",
      type: "Course",
      description: "Complete modern web development course covering HTML5, CSS3, JavaScript ES6+, React, Node.js, and Express.",
      difficulty: "Beginner",
      duration_hours: 22.0,
      skills: ["JavaScript", "React", "Node.js", "HTML/CSS"],
      prerequisites: [],
      match_score: 99,
      why_recommended: "Highest match for Full Stack Developer goal.",
      url: "https://www.youtube.com/watch?v=nu_pCVPKzTk"
    },
    {
      id: "ds_res_01",
      title: "Data Science & Machine Learning Bootcamp in Python",
      type: "Course",
      description: "Master NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, and Machine Learning algorithms.",
      difficulty: "Beginner",
      duration_hours: 18.0,
      skills: ["Python", "SQL", "Machine Learning", "Data Analysis"],
      prerequisites: [],
      match_score: 98,
      why_recommended: "Core foundation for Data Science goal.",
      url: "https://www.youtube.com/watch?v=r-uOLxNrNk8"
    },
    {
      id: "ai_res_01",
      title: "Deep Learning Specialization with PyTorch & LLMs",
      type: "Course",
      description: "Build Neural Networks, Convolutional Nets, Transformers, and Retrieval-Augmented Generation (RAG) apps.",
      difficulty: "Intermediate",
      duration_hours: 25.0,
      skills: ["Python", "PyTorch", "LLMs & RAG", "Machine Learning"],
      prerequisites: ["Python"],
      match_score: 97,
      why_recommended: "Highest match for AI/ML Engineer goal.",
      url: "https://www.youtube.com/watch?v=V_xro1bcAuA"
    }
  ];

  const sourceCatalog = (recommendations && recommendations.length > 0) ? recommendations : DEFAULT_CATALOG;

  const filtered = sourceCatalog.filter(r => {
    const matchesType = filterType === 'All' || r.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="page-wrapper explore-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Explore Learning Resources</h1>
        <p className="page-subtitle">Personalized recommendations ranked by our weighted scoring engine.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-controls-row card">
        <div className="explore-search">
          <Search size={18} className="icon" />
          <input 
            type="text" 
            placeholder="Search by topic, skill (e.g. Wireshark, SIEM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="type-filter-buttons">
          {['All', 'Course', 'Hands-on Lab', 'Project', 'Article'].map((t) => (
            <button
              key={t}
              className={`filter-btn ${filterType === t ? 'active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Recommendation Cards */}
      <div className="recommendations-catalog-grid">
        {filtered.map((res) => (
          <RecommendationCard
            key={res.id}
            resource={res}
            onSelect={onSelectResource}
            isCompleted={completedResourceIds.has(res.id)}
            onMarkComplete={onMarkComplete}
          />
        ))}
      </div>
    </div>
  );
}
