import React, { useState } from 'react';
import { User, Mail, Shield, Target, Clock, Calendar, Wrench, Heart, Edit3, CheckCircle2, LogOut, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import './ProfilePage.css';

export default function ProfilePage({ profile, onUpdateProfile, onReOnboard, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Edit Form State
  const [name, setName] = useState(profile?.name || 'Learner');
  const [email, setEmail] = useState(profile?.email || 'learner@example.com');
  const [goal, setGoal] = useState(profile?.goal || 'Become a Full Stack Developer');
  const [experience, setExperience] = useState(profile?.experience || 'Intermediate');
  const [weeklyHours, setWeeklyHours] = useState(profile?.weekly_hours || 10);
  const [targetDuration, setTargetDuration] = useState(profile?.target_duration || '6 Months');
  const [isSaving, setIsSaving] = useState(false);

  const goalOptions = [
    'Become a Full Stack Developer',
    'Become a Data Scientist',
    'Learn AI/ML & Prompt Engineering',
    'Prepare for Technical Placements',
    'Build an AI Startup',
    'Become a Cybersecurity Analyst',
    'Learn Coding & Game Development (Ages 10-16)',
    'Cloud & DevOps Engineering (Ages 25-50)',
    'Project Management & Technical Leadership (Ages 25-50)'
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = {
      ...profile,
      name,
      email,
      goal,
      experience,
      weekly_hours: Number(weeklyHours),
      target_duration: targetDuration
    };

    try {
      await api.saveProfile(updated);
      setIsSaving(false);
      setIsEditing(false);
      onUpdateProfile(updated);
    } catch (err) {
      setIsSaving(false);
      alert("Failed to save profile changes. Please try again.");
    }
  };

  const skillsList = profile?.existing_skills ? Object.entries(profile.existing_skills) : [];
  const interestsList = profile?.interests || [];

  return (
    <div className="page-wrapper profile-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Learner Profile & Settings</h1>
        <p className="page-subtitle">Manage your personal details, career target, study schedule, and account security.</p>
      </div>

      {/* User Identity Header Card */}
      <div className="card profile-header-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-large">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="online-badge" title="Active Account"></span>
        </div>

        <div className="profile-identity-info">
          <div className="name-row">
            <h2 className="user-display-name">{name}</h2>
            <span className="user-id-chip">ID: {profile?.user_id || 'demo_learner_01'}</span>
          </div>
          <p className="user-email-text"><Mail size={15} /> {email}</p>
          <div className="identity-tags">
            <span className="badge badge-primary"><Target size={13} /> {goal}</span>
            <span className="badge badge-secondary">{experience} Level</span>
          </div>
        </div>

        <div className="profile-header-actions">
          {!isEditing ? (
            <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
              <Edit3 size={16} /> Edit Profile Details
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
              Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* EDIT FORM MODE */}
      {isEditing ? (
        <div className="card edit-profile-card">
          <h3 className="section-title"><Edit3 size={18} /> Edit Your Profile Information</h3>
          <form onSubmit={handleSaveProfile} className="edit-form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Target Career Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                {goalOptions.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option value="Beginner">Beginner (Starting fresh)</option>
                <option value="Intermediate">Intermediate (Some foundation)</option>
                <option value="Advanced">Advanced (Upskilling / Leadership)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Weekly Study Target (Hours/Week)</label>
              <input 
                type="number" 
                min="2" 
                max="40" 
                value={weeklyHours} 
                onChange={(e) => setWeeklyHours(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Target Completion Timeline</label>
              <select value={targetDuration} onChange={(e) => setTargetDuration(e.target.value)}>
                <option value="3 Months">3 Months (Fast Track)</option>
                <option value="6 Months">6 Months (Recommended)</option>
                <option value="9 Months">9 Months (Comprehensive)</option>
                <option value="12 Months">12 Months (Paced)</option>
              </select>
            </div>

            <div className="form-actions-bar">
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* READ-ONLY DISPLAY MODE */
        <div className="profile-sections-grid">
          {/* Section 1: Account Information */}
          <div className="card profile-detail-card">
            <h3 className="section-title"><User size={18} /> Account Information</h3>
            <div className="detail-rows-list">
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value bold">{profile?.name || 'Learner'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email Address:</span>
                <span className="detail-value">{profile?.email || 'learner@example.com'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">User Account ID:</span>
                <span className="detail-value code">{profile?.user_id || 'demo_learner_01'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Account Password:</span>
                <div className="password-display">
                  <span className="detail-value">
                    {showPassword ? (profile?.password || 'password123') : '••••••••••••'}
                  </span>
                  <button 
                    type="button"
                    className="btn-icon-subtle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Learning Goal & Pace */}
          <div className="card profile-detail-card">
            <h3 className="section-title"><Target size={18} /> Target Goal & Schedule</h3>
            <div className="detail-rows-list">
              <div className="detail-row">
                <span className="detail-label">Primary Career Goal:</span>
                <span className="detail-value highlight">{profile?.goal || 'Become a Full Stack Developer'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Experience Level:</span>
                <span className="detail-value">{profile?.experience || 'Intermediate'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Weekly Study Pace:</span>
                <span className="detail-value"><Clock size={14} /> {profile?.weekly_hours || 10} Hours / Week</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Target Duration:</span>
                <span className="detail-value"><Calendar size={14} /> {profile?.target_duration || '6 Months'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Skills & Domain Interests */}
          <div className="card profile-detail-card full-width">
            <h3 className="section-title"><Wrench size={18} /> Selected Skills & Interests</h3>
            
            <div className="skills-inventory-block">
              <h4 className="sub-label">Current Technical & Soft Skills</h4>
              {skillsList.length > 0 ? (
                <div className="skills-badge-grid">
                  {skillsList.map(([sName, sLvl]) => (
                    <div key={sName} className="skill-pill-item">
                      <span className="s-pill-name">{sName}</span>
                      <span className="s-pill-level">{sLvl}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-hint">No skills pre-selected. Click "Re-run Onboarding" to add your skills.</p>
              )}
            </div>

            {interestsList.length > 0 && (
              <div className="interests-inventory-block">
                <h4 className="sub-label">Domain Interests</h4>
                <div className="interests-chips">
                  {interestsList.map(int => (
                    <span key={int} className="interest-chip"><Sparkles size={13} /> {int}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Quick Account Actions */}
          <div className="card profile-actions-card full-width">
            <h3 className="section-title"><Shield size={18} /> Account Operations</h3>
            <div className="actions-button-row">
              <button className="btn btn-secondary" onClick={onReOnboard}>
                <Sparkles size={16} /> Re-run Onboarding Setup Wizard
              </button>
              <button className="btn btn-danger" onClick={onLogout}>
                <LogOut size={16} /> Log Out of Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
