import React, { useState } from 'react';
import { Target, Award, Wrench, Heart, Clock, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import './Onboarding.css';

export default function Onboarding({ profile: initialProfile, onComplete }) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Form State
  const [goal, setGoal] = useState(initialProfile?.goal || 'Become a Full Stack Developer');
  const [customGoal, setCustomGoal] = useState('');
  const [experience, setExperience] = useState(initialProfile?.experience || 'Intermediate');
  const [selectedSkills, setSelectedSkills] = useState(initialProfile?.existing_skills || {});
  const [selectedInterests, setSelectedInterests] = useState(initialProfile?.interests || []);
  const [weeklyHours, setWeeklyHours] = useState(initialProfile?.weekly_hours || 10);
  const [preferredResourceType, setPreferredResourceType] = useState(initialProfile?.preferred_resource_type || 'Hands-on Lab');
  const [targetDuration, setTargetDuration] = useState(initialProfile?.target_duration || '6 Months');

  const goalOptions = [
    'Learn Coding & Game Development (Ages 10-16)',
    'Become a Cybersecurity Analyst',
    'Become a Data Scientist',
    'Become a Full Stack Developer',
    'Learn AI/ML & Prompt Engineering',
    'Prepare for Technical Placements',
    'Build an AI Startup',
    'Cloud & DevOps Engineering (Ages 25-50)',
    'Project Management & Technical Leadership (Ages 25-50)'
  ];

  // Technical & Non-Technical Skills (Ages 10 to 50)
  const technicalSkillsList = [
    'Python', 'JavaScript', 'Java', 'C++', 'HTML/CSS', 'SQL', 'React', 'Node.js',
    'Machine Learning', 'Deep Learning', 'LLMs & RAG', 'Prompt Engineering',
    'Networking', 'Linux', 'SIEM', 'Incident Response', 'Wireshark',
    'Data Structures & Algorithms', 'System Design', 'DevOps & Docker', 'Cloud (AWS/Azure)',
    'Game Dev (Scratch/Unity)', 'Block Coding & Logic'
  ];

  const nonTechnicalSkillsList = [
    'Problem Solving & Critical Thinking',
    'Technical Communication',
    'Leadership & Team Management',
    'Project & Agile Management (Scrum)',
    'Product Strategy & Business Analysis',
    'Time Management & Productivity',
    'Creative Thinking & Innovation',
    'Public Speaking & Presentation'
  ];

  const availableSkillList = [...technicalSkillsList, ...nonTechnicalSkillsList];

  const interestOptions = [
    'AI & Robotics', 'Game Dev & Animation', 'Web & Mobile Apps', 'Cyber Safety & Security', 
    'Data Analytics', 'Cloud & DevOps', 'Automation & Scripting', 'Business & Startup Strategy', 
    'Digital Design & UX', 'Agile & Team Leadership', 'Financial Literacy', 'Creative Coding'
  ];

  const toggleSkill = (skillName) => {
    if (selectedSkills[skillName] !== undefined) {
      const next = { ...selectedSkills };
      delete next[skillName];
      setSelectedSkills(next);
    } else {
      setSelectedSkills({ ...selectedSkills, [skillName]: 50 });
    }
  };

  const updateSkillLevel = (skillName, val) => {
    setSelectedSkills({ ...selectedSkills, [skillName]: parseInt(val) });
  };

  const toggleInterest = (item) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter(i => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else if (step === 5) {
      // Trigger Step 6 (Analyzing)
      setStep(6);
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setIsDone(true);
      }, 2000);
    }
  };

  const handleFinish = () => {
    const finalGoal = customGoal.trim() || goal.replace('Become a ', '');
    const updatedProfile = {
      ...initialProfile,
      user_id: initialProfile?.user_id || 'demo_learner_01',
      name: initialProfile?.name || 'Learner',
      email: initialProfile?.email || 'learner@example.com',
      password: initialProfile?.password || 'password123',
      goal: finalGoal,
      experience,
      existing_skills: selectedSkills,
      interests: selectedInterests,
      weekly_hours: weeklyHours,
      preferred_resource_type: preferredResourceType,
      target_duration: targetDuration
    };
    onComplete(updatedProfile);
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Step Progress Header */}
        <div className="onboarding-header">
          <div className="step-indicator">
            Step {Math.min(step, 5)} of 5
          </div>
          <div className="step-progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${(Math.min(step, 5) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-badge"><Target size={16} /> Goal Definition</div>
            <h2 className="step-title">What do you want to achieve?</h2>
            <p className="step-subtitle">Select your target role or enter your custom career objective.</p>

            <div className="options-grid">
              {goalOptions.map((g, idx) => (
                <button
                  key={idx}
                  className={`option-card ${goal === g && !customGoal ? 'selected' : ''}`}
                  onClick={() => { setGoal(g); setCustomGoal(''); }}
                >
                  <span className="option-title">{g}</span>
                </button>
              ))}
            </div>

            <div className="custom-input-group">
              <label>Or enter custom career goal:</label>
              <input
                type="text"
                placeholder="e.g. Become a Cloud Security Architect"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="step-content">
            <div className="step-badge"><Award size={16} /> Experience Level</div>
            <h2 className="step-title">What is your current experience level?</h2>
            <p className="step-subtitle">This helps us match course difficulty to your comfort zone.</p>

            <div className="options-column">
              {[
                { id: 'Beginner', title: 'Beginner', desc: 'New to the field. Looking for foundational step-by-step guidance.' },
                { id: 'Intermediate', title: 'Intermediate', desc: 'Some background knowledge or experience. Ready for applied labs & tools.' },
                { id: 'Advanced', title: 'Advanced', desc: 'Strong domain fundamentals. Looking for complex projects & specialized topics.' }
              ].map((exp) => (
                <button
                  key={exp.id}
                  className={`option-row ${experience === exp.id ? 'selected' : ''}`}
                  onClick={() => setExperience(exp.id)}
                >
                  <div className="row-radio">{experience === exp.id && <div className="dot" />}</div>
                  <div className="row-text">
                    <span className="row-title">{exp.title}</span>
                    <span className="row-desc">{exp.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Existing Skills */}
        {step === 3 && (
          <div className="step-content">
            <div className="step-badge"><Wrench size={16} /> Current Skills (Technical & Soft Skills)</div>
            <h2 className="step-title">Select your existing skills & level</h2>
            <p className="step-subtitle">Includes Technical and Soft Skills for ages 10 to 50.</p>

            <div className="skills-category-wrapper">
              <h4 className="skill-cat-title">💻 Technical Skills</h4>
              <div className="skills-selection-grid">
                {technicalSkillsList.map((skill) => {
                  const isSelected = selectedSkills[skill] !== undefined;
                  return (
                    <div key={skill} className={`skill-selector-card ${isSelected ? 'active' : ''}`}>
                      <div className="selector-top" onClick={() => toggleSkill(skill)}>
                        <span className="skill-name">{skill}</span>
                        <span className="checkbox">{isSelected ? '✓' : '+'}</span>
                      </div>

                      {isSelected && (
                        <div className="slider-wrapper">
                          <div className="slider-header">
                            <span>Level:</span>
                            <span className="level-pct">{selectedSkills[skill]}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={selectedSkills[skill]}
                            onChange={(e) => updateSkillLevel(skill, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <h4 className="skill-cat-title mt-3">🧠 Non-Technical & Soft Skills</h4>
              <div className="skills-selection-grid">
                {nonTechnicalSkillsList.map((skill) => {
                  const isSelected = selectedSkills[skill] !== undefined;
                  return (
                    <div key={skill} className={`skill-selector-card ${isSelected ? 'active' : ''}`}>
                      <div className="selector-top" onClick={() => toggleSkill(skill)}>
                        <span className="skill-name">{skill}</span>
                        <span className="checkbox">{isSelected ? '✓' : '+'}</span>
                      </div>

                      {isSelected && (
                        <div className="slider-wrapper">
                          <div className="slider-header">
                            <span>Level:</span>
                            <span className="level-pct">{selectedSkills[skill]}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={selectedSkills[skill]}
                            onChange={(e) => updateSkillLevel(skill, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <div className="step-content">
            <div className="step-badge"><Heart size={16} /> Technical Interests</div>
            <h2 className="step-title">Select your key domain interests</h2>
            <p className="step-subtitle">Choose topics you enjoy practicing hands-on.</p>

            <div className="chips-grid">
              {interestOptions.map((item) => {
                const isSelected = selectedInterests.includes(item);
                return (
                  <button
                    key={item}
                    className={`chip-button ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleInterest(item)}
                  >
                    {isSelected ? '✓ ' : '+ '} {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Learning Preferences */}
        {step === 5 && (
          <div className="step-content">
            <div className="step-badge"><Clock size={16} /> Learning Preferences</div>
            <h2 className="step-title">How do you prefer to learn?</h2>

            <div className="form-group">
              <label>Weekly Learning Hours:</label>
              <div className="hours-selector">
                {[5, 10, 15, 20].map((h) => (
                  <button
                    key={h}
                    className={`btn ${weeklyHours === h ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => setWeeklyHours(h)}
                  >
                    {h} hrs/week
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Preferred Resource Type:</label>
              <select 
                value={preferredResourceType}
                onChange={(e) => setPreferredResourceType(e.target.value)}
              >
                <option value="All">All Formats (Recommended)</option>
                <option value="Hands-on Lab">Hands-on Labs & Sandboxes</option>
                <option value="Course">Structured Video Courses</option>
                <option value="Project">Real-world Capstone Projects</option>
                <option value="Article">Interactive Documentation & Articles</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Completion Time:</label>
              <select 
                value={targetDuration}
                onChange={(e) => setTargetDuration(e.target.value)}
              >
                <option value="3 Months">3 Months (Intensive)</option>
                <option value="6 Months">6 Months (Balanced)</option>
                <option value="12 Months">12 Months (Part-time)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 6: Generating / Path Ready */}
        {step === 6 && (
          <div className="step-content generating-step">
            {isGenerating ? (
              <div className="analyzing-state">
                <div className="spinner-sparkle">
                  <Sparkles size={40} className="spinning-icon" />
                </div>
                <h2>Analyzing your profile...</h2>
                <p>Calculating skill gaps, evaluating prerequisites, and ranking 15+ resources.</p>
              </div>
            ) : (
              <div className="ready-state">
                <div className="success-icon">
                  <CheckCircle2 size={52} color="var(--success)" />
                </div>
                <h2>Your personalized learning path is ready.</h2>
                <p>We've generated a 5-phase customized roadmap tailored to your experience and weekly goal.</p>
                <button className="btn btn-primary btn-lg" onClick={handleFinish}>
                  View My Learning Path <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        {step <= 5 && (
          <div className="onboarding-actions">
            {step > 1 && (
              <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button className="btn btn-primary next-btn" onClick={handleNext}>
              {step === 5 ? 'Generate My Path' : 'Continue'} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
