import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import LearningPath from './pages/LearningPath';
import AiAssistant from './pages/AiAssistant';
import SkillGapPage from './pages/SkillGapPage';
import ProgressPage from './pages/ProgressPage';
import ExplorePage from './pages/ExplorePage';
import AssessmentModal from './pages/AssessmentModal';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ResourceModal from './components/ResourceModal';

import { api } from './services/api';
import './styles/theme.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const [selectedResourceForModal, setSelectedResourceForModal] = useState(null);

  // Day & Night Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('learnpath_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('learnpath_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // App Data State
  const [profile, setProfile] = useState({
    user_id: 'demo_learner_01',
    name: 'Demo Learner',
    email: 'learner@example.com',
    goal: 'Become a Full Stack Developer',
    experience: 'Intermediate',
    existing_skills: {},
    interests: []
  });

  const [learningPath, setLearningPath] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [skillGapData, setSkillGapData] = useState(null);

  // Load Data on Startup
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [profData, pathData, recData, gapData] = await Promise.all([
          api.getProfile('demo_learner_01').catch(() => null),
          api.getLearningPath('demo_learner_01').catch(() => null),
          api.getRecommendations('demo_learner_01', 10).catch(() => []),
          api.getSkillGap(profile).catch(() => null)
        ]);

        if (profData) setProfile(profData);
        if (pathData) setLearningPath(pathData);
        if (recData && recData.length > 0) setRecommendations(recData);
        if (gapData) setSkillGapData(gapData);
      } catch (err) {
        console.warn("API offline, using mock seed data:", err);
      }
    }
    loadInitialData();
  }, []);

  const handleLogout = () => {
    setProfile({
      user_id: 'demo_learner_01',
      name: 'Demo Learner',
      email: 'learner@example.com',
      goal: 'Become a Full Stack Developer',
      experience: 'Intermediate',
      existing_skills: {},
      interests: []
    });
    setLearningPath(null);
    setRecommendations([]);
    setSkillGapData(null);
    setActiveTab('login');
  };

  const handleDemoLogin = async () => {
    try {
      const demoProf = await api.getProfile('demo_learner_01');
      if (demoProf) setProfile(demoProf);
      const [pathData, recData, gapData] = await Promise.all([
        api.getLearningPath('demo_learner_01').catch(() => null),
        api.getRecommendations('demo_learner_01', 10).catch(() => []),
        api.getSkillGap(demoProf || profile).catch(() => null)
      ]);
      if (pathData) setLearningPath(pathData);
      if (recData && recData.length > 0) setRecommendations(recData);
      if (gapData) setSkillGapData(gapData);
    } catch (err) {}
    setActiveTab('dashboard');
  };

  const handleNewUserSignUp = (userProf) => {
    setProfile(userProf);
    setActiveTab('onboarding');
  };

  const handleStandardLoginSuccess = async (userProf) => {
    setProfile(userProf);
    try {
      const [pathData, recData, gapData] = await Promise.all([
        api.getLearningPath(userProf.user_id).catch(() => null),
        api.getRecommendations(userProf.user_id, 10).catch(() => []),
        api.getSkillGap(userProf).catch(() => null)
      ]);
      if (pathData) setLearningPath(pathData);
      if (recData && recData.length > 0) setRecommendations(recData);
      if (gapData) setSkillGapData(gapData);
    } catch (err) {}
    setActiveTab('dashboard');
  };

  const handleOnboardingComplete = async (newProfile) => {
    setProfile(newProfile);
    try {
      await api.saveProfile(newProfile);
      const [pathData, recData, gapData] = await Promise.all([
        api.getLearningPath(newProfile.user_id).catch(() => null),
        api.getRecommendations(newProfile.user_id, 10).catch(() => []),
        api.getSkillGap(newProfile).catch(() => null)
      ]);
      if (pathData) setLearningPath(pathData);
      if (recData && recData.length > 0) setRecommendations(recData);
      if (gapData) setSkillGapData(gapData);
    } catch (err) {
      console.warn("Save profile failed, using local state:", err);
    }
    setActiveTab('dashboard');
  };

  const handleAssessmentComplete = async (result) => {
    // Fetch latest profile from backend to get updated skill levels
    try {
      const [pathData, recData, gapData] = await Promise.all([
        api.getLearningPath(profile.user_id).catch(() => null),
        api.getRecommendations(profile.user_id, 10).catch(() => []),
        api.getSkillGap(profile).catch(() => null)
      ]);
      if (pathData) setLearningPath(pathData);
      if (recData && recData.length > 0) setRecommendations(recData);
      if (gapData) setSkillGapData(gapData);
    } catch (err) {}
  };

  return (
    <div className="app-root">
      {activeTab === 'landing' ? (
        <LandingPage 
          onStartOnboarding={() => setActiveTab('login')}
          onDemoLogin={handleDemoLogin}
          onOpenLogin={() => setActiveTab('login')}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : activeTab === 'login' ? (
        <LoginPage
          onLoginSuccess={handleStandardLoginSuccess}
          onNewUserSignUp={handleNewUserSignUp}
          onDemoLogin={handleDemoLogin}
          onStartOnboarding={() => setActiveTab('onboarding')}
        />
      ) : activeTab === 'onboarding' ? (
        <Onboarding profile={profile} onComplete={handleOnboardingComplete} />
      ) : (
        <div className="app-container">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            isMobileOpen={isMobileSidebarOpen}
            closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          />

          <div className="main-content">
            <Navbar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              user={profile}
              theme={theme}
              toggleTheme={toggleTheme}
              onLogout={handleLogout}
            />

            <main className="content-body">
              {activeTab === 'dashboard' && (
                <Dashboard 
                  profile={profile}
                  learningPath={learningPath}
                  recommendations={recommendations}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenResource={(res) => setSelectedResourceForModal(res)}
                />
              )}

              {activeTab === 'learning-path' && (
                <LearningPath 
                  learningPath={learningPath}
                  onOpenAssessment={(quizId) => setActiveAssessmentId(quizId)}
                  onOpenResource={(res) => setSelectedResourceForModal(res)}
                />
              )}

              {activeTab === 'explore' && (
                <ExplorePage 
                  recommendations={recommendations}
                  onSelectResource={(res) => setSelectedResourceForModal(res)}
                />
              )}

              {activeTab === 'ai-assistant' && (
                <AiAssistant profile={profile} />
              )}

              {activeTab === 'skill-gap' && (
                <SkillGapPage 
                  profile={profile}
                  skillGapData={skillGapData}
                  onImproveSkill={() => setActiveTab('learning-path')}
                />
              )}

              {activeTab === 'progress' && (
                <ProgressPage profile={profile} />
              )}

              {activeTab === 'profile' && (
                <ProfilePage 
                  profile={profile}
                  onUpdateProfile={handleOnboardingComplete}
                  onReOnboard={() => setActiveTab('onboarding')}
                  onLogout={handleLogout}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Interactive Assessment Modal */}
      {activeAssessmentId && (
        <AssessmentModal
          assessmentId={activeAssessmentId}
          onClose={() => setActiveAssessmentId(null)}
          onComplete={handleAssessmentComplete}
        />
      )}

      {/* Resource Detail & Viewer Modal */}
      {selectedResourceForModal && (
        <ResourceModal
          resource={selectedResourceForModal}
          isOpen={!!selectedResourceForModal}
          onClose={() => setSelectedResourceForModal(null)}
        />
      )}
    </div>
  );
}
