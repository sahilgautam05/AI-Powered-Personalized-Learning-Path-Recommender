import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, Target, ArrowRight, UserCheck, ShieldCheck, UserPlus } from 'lucide-react';
import { api } from '../services/api';
import './LoginPage.css';

export default function LoginPage({ onLoginSuccess, onNewUserSignUp, onStartOnboarding, onDemoLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGoal, setRegGoal] = useState('Become a Full Stack Developer');
  const [regExp, setRegExp] = useState('Intermediate');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email address and password');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const userProfile = await api.login(email, password);
      setIsLoading(false);
      onLoginSuccess(userProfile);
    } catch (err) {
      setIsLoading(false);
      if (err.message && err.message.includes('Incorrect password')) {
        setErrorMsg('Incorrect password. Please try again or use Demo Login.');
      } else {
        // Fallback user profile login if backend is running in offline mode
        const cleanName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
        const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        const fallbackProfile = {
          user_id: `user_${email.split('@')[0]}`,
          name: formattedName,
          email: email,
          password: password,
          goal: 'Become a Full Stack Developer',
          experience: 'Intermediate',
          weekly_hours: 10,
          target_duration: '6 Months',
          existing_skills: {},
          onboarded: 1
        };
        onLoginSuccess(fallbackProfile);
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Please complete all required fields (Name, Email, Password)');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const newUserProfile = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        goal: regGoal,
        experience: regExp,
        weekly_hours: 10,
        target_duration: '6 Months',
        existing_skills: {}
      });
      setIsLoading(false);
      if (onNewUserSignUp) {
        onNewUserSignUp(newUserProfile);
      } else {
        onLoginSuccess(newUserProfile);
      }
    } catch (err) {
      setIsLoading(false);
      if (err.message && err.message.includes('already registered')) {
        setErrorMsg('Email is already registered. Please log in instead.');
      } else {
        const cleanPrefix = regEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
        const fallbackProfile = {
          user_id: `user_${cleanPrefix}`,
          name: regName,
          email: regEmail,
          password: regPassword,
          goal: regGoal,
          experience: regExp,
          weekly_hours: 10,
          target_duration: '6 Months',
          existing_skills: {},
          onboarded: 0
        };
        if (onNewUserSignUp) {
          onNewUserSignUp(fallbackProfile);
        } else {
          onLoginSuccess(fallbackProfile);
        }
      }
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card card">
        {/* Header */}
        <div className="login-header">
          <div className="logo-brand">
            <Sparkles className="sparkle-icon" size={28} />
            <span className="brand-name">LearnPath AI</span>
          </div>
          <h1 className="login-title">{mode === 'login' ? 'Welcome Back' : 'Create New Account'}</h1>
          <p className="login-subtitle">
            {mode === 'login' 
              ? 'Sign in to access your personalized roadmap & AI assistant'
              : 'Register your account to generate a tailored career learning path'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="auth-tab-group">
          <button 
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setErrorMsg(''); }}
          >
            Log In
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
          >
            <UserPlus size={16} /> Sign Up (New User)
          </button>
        </div>

        {errorMsg && <div className="login-error-alert">{errorMsg}</div>}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleStandardLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : <>Log In to Dashboard <ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Create password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Primary Career Goal</label>
              <div className="input-with-icon">
                <Target size={18} className="input-icon" />
                <select 
                  className="select-custom"
                  value={regGoal} 
                  onChange={(e) => setRegGoal(e.target.value)}
                >
                  {goalOptions.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select 
                className="select-custom"
                value={regExp} 
                onChange={(e) => setRegExp(e.target.value)}
              >
                <option value="Beginner">Beginner (Starting fresh)</option>
                <option value="Intermediate">Intermediate (Some foundation)</option>
                <option value="Advanced">Advanced (Upskilling / Leadership)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
              {isLoading ? 'Registering...' : <>Create Account & Start Learning <ArrowRight size={18} /></>}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="login-divider">
          <span>OR QUICK ACCESS</span>
        </div>

        {/* Demo Login Button */}
        <div className="demo-login-box">
          <button className="btn btn-demo-login w-full" onClick={onDemoLogin}>
            <UserCheck size={20} />
            <span>Try Instant Demo Account</span>
          </button>
          <p className="demo-hint"><ShieldCheck size={14} /> Instant access with pre-configured roadmap</p>
        </div>

        {/* Footer Link */}
        <div className="login-footer">
          <p>Want step-by-step guidance?</p>
          <button className="btn-link-onboard" onClick={onStartOnboarding}>
            Launch Onboarding Setup Wizard →
          </button>
        </div>
      </div>
    </div>
  );
}
