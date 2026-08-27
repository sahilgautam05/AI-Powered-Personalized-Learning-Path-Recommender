import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sparkles, Menu, User, Sun, Moon, LogOut, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import './Navbar.css';

export default function Navbar({ activeTab, setActiveTab, toggleMobileSidebar, user, theme, toggleTheme, onLogout }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    async function loadNotifs() {
      try {
        const notifData = await api.getNotifications(user?.user_id || 'demo_learner_01');
        if (notifData && notifData.length > 0) {
          setNotifications(notifData);
        } else {
          setNotifications([
            { id: 'n1', title: '🎯 Goal Roadmap Activated', message: `Roadmap active for ${user?.goal || 'Full Stack Developer'}.`, time: '10m ago', read: false, target_tab: 'path' },
            { id: 'n2', title: '✨ AI Recommended Modules', message: '3 new personalized modules added to Explore.', time: '45m ago', read: false, target_tab: 'explore' },
            { id: 'n3', title: '📝 Milestone Knowledge Check', message: 'Phase 01 Assessment ready for evaluation.', time: '2h ago', read: false, target_tab: 'dashboard' },
            { id: 'n4', title: '⚡ Skill Gap Opportunity', message: 'Bridge target gaps to boost readiness score by +15%.', time: '1d ago', read: true, target_tab: 'skillgap' }
          ]);
        }
      } catch (err) {
        setNotifications([
          { id: 'n1', title: '🎯 Goal Roadmap Activated', message: `Roadmap active for ${user?.goal || 'Full Stack Developer'}.`, time: '10m ago', read: false, target_tab: 'path' },
          { id: 'n2', title: '✨ AI Recommended Modules', message: '3 new personalized modules added to Explore.', time: '45m ago', read: false, target_tab: 'explore' },
          { id: 'n3', title: '📝 Milestone Knowledge Check', message: 'Phase 01 Assessment ready for evaluation.', time: '2h ago', read: false, target_tab: 'dashboard' },
          { id: 'n4', title: '⚡ Skill Gap Opportunity', message: 'Bridge target gaps to boost readiness score by +15%.', time: '1d ago', read: true, target_tab: 'skillgap' }
        ]);
      }
    }
    loadNotifs();
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setShowNotifications(false);
    if (notif.target_tab && setActiveTab) {
      setActiveTab(notif.target_tab);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={toggleMobileSidebar} aria-label="Toggle navigation">
          <Menu size={22} />
        </button>

        <div className="logo-brand" onClick={() => setActiveTab('dashboard')}>
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <span className="logo-text">LearnPath <span className="accent">AI</span></span>
        </div>
      </div>

      <div className="navbar-center">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search courses, skills, roadmaps..." />
        </div>
      </div>

      <div className="navbar-right">
        <button 
          className="nav-icon-btn theme-toggle-btn" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Day (Light)' : 'Night (Dark)'} Mode`}
          aria-label="Toggle theme mode"
        >
          {theme === 'dark' ? <Sun size={19} className="theme-icon sun" /> : <Moon size={19} className="theme-icon moon" />}
        </button>

        {/* Notifications Button & Popover Container */}
        <div className="notification-wrapper" ref={notifRef}>
          <button 
            className={`nav-icon-btn ${unreadCount > 0 ? 'has-unread' : ''}`} 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="notification-popover">
              <div className="notif-header">
                <div className="notif-header-title">
                  <span>Notifications</span>
                  {unreadCount > 0 && <span className="unread-badge">{unreadCount} New</span>}
                </div>
                <div className="notif-actions">
                  {unreadCount > 0 && (
                    <button className="notif-action-btn" onClick={markAllRead} title="Mark all as read">
                      <CheckCheck size={14} /> Read All
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button className="notif-action-btn delete" onClick={clearAllNotifications} title="Clear all">
                      <Trash2 size={14} /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={24} className="empty-bell" />
                    <p>No new notifications right now.</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`notif-item ${n.read ? 'read' : 'unread'}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="notif-item-header">
                        <span className="notif-item-title">{n.title}</span>
                        <span className="notif-item-time">{n.time}</span>
                      </div>
                      <p className="notif-item-msg">{n.message}</p>
                      <div className="notif-item-footer">
                        <span className="notif-link">View in App <ArrowRight size={12} /></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile-badge" onClick={() => setActiveTab('profile')}>
          <div className="avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info-text">
            <span className="user-name">{user?.name || 'Learner'}</span>
            <span className="user-role">{user?.goal || 'Full Stack Developer'}</span>
          </div>
        </div>

        {onLogout && (
          <button className="nav-logout-btn" onClick={onLogout} title="Log Out of Account">
            <LogOut size={17} />
            <span className="logout-text">Log Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
