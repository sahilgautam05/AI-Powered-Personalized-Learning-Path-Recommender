import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Compass, 
  Bot, 
  TrendingUp, 
  Award, 
  BarChart2, 
  User, 
  X,
  Sparkles,
  Flame
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen, closeMobileSidebar }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'learning-path', label: 'My Learning Path', icon: MapPin },
    { id: 'weekly_tasks', label: 'Weekly Challenges', icon: Flame, badge: 'Adaptive' },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'AI' },
    { id: 'skill-gap', label: 'Skill Gap', icon: TrendingUp },
    { id: 'progress', label: 'Progress Analytics', icon: BarChart2 },
    { id: 'profile', label: 'Learner Profile', icon: User },
  ];

  return (
    <>
      {isMobileOpen && <div className="sidebar-backdrop" onClick={closeMobileSidebar} />}
      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header-mobile">
          <div className="brand-title">
            <Sparkles size={18} className="icon" /> LearnPath AI
          </div>
          <button className="close-btn" onClick={closeMobileSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  closeMobileSidebar();
                }}
              >
                <Icon size={19} className="nav-item-icon" />
                <span className="nav-item-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="upgrade-card">
            <div className="upgrade-title">
              <Sparkles size={16} color="var(--primary)" /> LearnPath Pro
            </div>
            <p className="upgrade-desc">Unlock AI interactive practice labs & resume optimizer.</p>
            <button className="btn btn-primary btn-sm upgrade-btn">Upgrade Plan</button>
          </div>
        </div>
      </aside>
    </>
  );
}
