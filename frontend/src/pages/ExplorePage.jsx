import React, { useState } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import './ExplorePage.css';

export default function ExplorePage({ recommendations, onSelectResource }) {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = recommendations.filter(r => {
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
          />
        ))}
      </div>
    </div>
  );
}
