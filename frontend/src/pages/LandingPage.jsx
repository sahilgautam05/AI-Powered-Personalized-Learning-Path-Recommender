import React from 'react';
import { Sparkles, ArrowRight, Target, Cpu, CheckCircle2, Zap, Layers, BarChart3, ShieldCheck, Sun, Moon } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage({ onStartOnboarding, onDemoLogin, onOpenLogin, theme, toggleTheme }) {
  return (
    <div className="landing-container">
      {/* Header */}
      <nav className="landing-nav">
        <div className="logo-brand">
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <span className="logo-text">LearnPath <span className="accent">AI</span></span>
        </div>
        <div className="nav-actions">
          <button 
            className="nav-icon-btn theme-toggle-btn" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Day (Light)' : 'Night (Dark)'} Mode`}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? <Sun size={19} className="theme-icon sun" /> : <Moon size={19} className="theme-icon moon" />}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onOpenLogin}>
            Log In
          </button>
          <button className="btn btn-outline btn-sm" onClick={onDemoLogin}>
            Demo Login
          </button>
          <button className="btn btn-primary btn-sm" onClick={onOpenLogin}>
            Build My Path
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} /> AI-Powered Career Learning Platform
        </div>
        <h1 className="hero-headline">
          Your Goals. Your Skills.<br />
          <span className="gradient-text">Your Personalized Learning Path.</span>
        </h1>
        <p className="hero-subtext">
          AI-powered learning roadmaps designed around your goals, experience, interests, and progress.
        </p>

        <div className="hero-cta-group">
          <button className="btn btn-primary btn-lg" onClick={onOpenLogin}>
            Build My Learning Path <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={onDemoLogin}>
            View Live Demo Dashboard
          </button>
        </div>

        {/* Live Hero Preview Card */}
        <div className="hero-preview-wrapper">
          <div className="hero-preview-card">
            <div className="preview-header">
              <div className="preview-goal">
                <Target className="icon" size={18} />
                <span>Goal: <strong>Cybersecurity Analyst</strong></span>
              </div>
              <span className="badge badge-success">68% Completed</span>
            </div>
            
            <div className="preview-milestone">
              <div className="milestone-text">
                <span className="label">Current Milestone</span>
                <span className="title">Phase 3 — Security Tools & SIEM Analysis</span>
              </div>
              <span className="badge badge-primary">3 of 5 Done</span>
            </div>

            <div className="preview-progress-bar">
              <div className="progress-bar-fill" style={{ width: '68%' }}></div>
            </div>

            <div className="preview-tags">
              <span className="skill-tag">✓ Networking (90%)</span>
              <span className="skill-tag">✓ Linux (60%)</span>
              <span className="skill-tag highlight">⚡ SIEM Gap (40%)</span>
              <span className="skill-tag">Wireshark</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <span className="section-badge">How It Works</span>
          <h2 className="section-title">From Goal Definition to Career Mastery</h2>
          <p className="section-subtext">A simple, intelligent system that continuously adapts to your progress.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon"><Target size={24} /></div>
            <h3>Define Your Goal</h3>
            <p>Select your career destination or enter custom aspirations with target completion timeline.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon"><Cpu size={24} /></div>
            <h3>Skill Gap Analysis</h3>
            <p>Our scoring engine compares your existing proficiency against industry benchmark requirements.</p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon"><Layers size={24} /></div>
            <h3>Personalized Roadmap</h3>
            <p>Receive a structured multi-phase timeline with curated courses, labs, projects, and assessments.</p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <div className="step-icon"><Zap size={24} /></div>
            <h3>Adaptive Progress</h3>
            <p>Take interactive quizzes and receive real-time path updates based on your quiz performance.</p>
          </div>
        </div>
      </section>

      {/* Interactive Sample Roadmap Preview */}
      <section className="sample-roadmap-section">
        <div className="section-header">
          <span className="section-badge">Roadmap Architecture</span>
          <h2 className="section-title">Structured Vertical Timeline</h2>
          <p className="section-subtext">Clear milestone progression with transparent match scores and prerequisites.</p>
        </div>

        <div className="roadmap-preview-container">
          <div className="roadmap-phase-item completed">
            <div className="phase-marker"><CheckCircle2 size={18} /></div>
            <div className="phase-content">
              <div className="phase-header">
                <h4>01 — Networking Fundamentals</h4>
                <span className="status-pill status-completed">Completed</span>
              </div>
              <p>TCP/IP, OSI model, IP routing, subnetting, and packet structures.</p>
            </div>
          </div>

          <div className="roadmap-phase-item completed">
            <div className="phase-marker"><CheckCircle2 size={18} /></div>
            <div className="phase-content">
              <div className="phase-header">
                <h4>02 — Linux & System Security</h4>
                <span className="status-pill status-completed">Completed</span>
              </div>
              <p>Shell scripting, permissions, SSH hardening, and system monitoring.</p>
            </div>
          </div>

          <div className="roadmap-phase-item active">
            <div className="phase-marker active-pulse">●</div>
            <div className="phase-content">
              <div className="phase-header">
                <h4>03 — Security Tools & Wireshark</h4>
                <span className="status-pill status-active">In Progress</span>
              </div>
              <p>Wireshark PCAP inspection, Nmap vulnerability scanning, and Snort IDS.</p>
              <div className="active-resource-preview">
                <span className="res-name">Recommended Next: Wireshark Packet Analysis Lab</span>
                <span className="badge badge-primary">92% Match</span>
              </div>
            </div>
          </div>

          <div className="roadmap-phase-item upcoming">
            <div className="phase-marker">○</div>
            <div className="phase-content">
              <div className="phase-header">
                <h4>04 — Threat Detection & SIEM Analysis</h4>
                <span className="status-pill status-upcoming">Upcoming</span>
              </div>
              <p>Splunk enterprise log parsing, MITRE ATT&CK correlation, and SIEM dashboards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-badge">Platform Highlights</span>
          <h2 className="section-title">Built for SaaS Production Excellence</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Sparkles size={22} /></div>
            <h3>AI Learning Mentor</h3>
            <p>ChatGPT-style conversational assistant available 24/7 with your complete profile context.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><BarChart3 size={22} /></div>
            <h3>Weighted Recommendation Engine</h3>
            <p>Ranks resources based on Goal Relevance (30%), Skill Gap (25%), Prerequisite Match (15%), and more.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={22} /></div>
            <h3>Adaptive Quiz Feedback</h3>
            <p>Evaluates quiz responses, identifies weak areas, and dynamically adjusts future study recommendations.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <h2>Ready to Accelerate Your Career Goal?</h2>
        <p>Join thousands of learners building structured, goal-driven skills with LearnPath AI.</p>
        <button className="btn btn-primary btn-lg" onClick={onOpenLogin}>
          Build My Learning Path <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <Sparkles size={18} color="var(--primary)" /> LearnPath AI — SaaS EdTech Platform
        </div>
        <p>© 2026 LearnPath AI. Designed with precision, responsive design, and modular FastAPI backend.</p>
      </footer>
    </div>
  );
}
