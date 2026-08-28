import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlertTriangle, X, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { api, generateGoalSpecificQuiz } from '../services/api';
import './AssessmentModal.css';

export default function AssessmentModal({ assessmentId, onClose, onComplete, profile }) {
  const [assessment, setAssessment] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const data = await api.getAssessment(assessmentId || 'quiz_03');
        if (data && data.questions && data.questions.length > 0) {
          setAssessment(data);
        } else {
          setAssessment(generateGoalSpecificQuiz(assessmentId || 'quiz_03', profile?.goal));
        }
      } catch (err) {
        console.warn("Using goal-specific fallback quiz:", err);
        setAssessment(generateGoalSpecificQuiz(assessmentId || 'quiz_03', profile?.goal));
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [assessmentId, profile]);

  const selectOption = (qId, optionIdx) => {
    if (result) return; // Locked after submitting
    setUserAnswers({ ...userAnswers, [qId]: optionIdx });
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    setSubmitting(true);
    try {
      const res = await api.submitAssessment('sahil_01', assessment.id, userAnswers);
      setResult(res);
      if (onComplete) onComplete(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="modal-card skeleton-modal card">
          <Sparkles size={32} className="spinning-icon" />
          <p>Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  if (!assessment) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="badge badge-primary">Skill Assessment</span>
            <h2 className="modal-title">{assessment.title}</h2>
          </div>
          <button className="close-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {!result ? (
            /* Quiz Form */
            <div className="quiz-questions-list">
              <p className="quiz-desc">{assessment.description}</p>

              {assessment.questions.map((q, idx) => (
                <div key={q.id} className="question-item-box">
                  <h4 className="question-title">
                    <span className="q-num">Q{idx + 1}.</span> {q.question}
                  </h4>

                  <div className="options-list">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => selectOption(q.id, oIdx)}
                        >
                          <span className="opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                          <span className="opt-text">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Adaptive Result Report */
            <div className="assessment-result-report">
              <div className={`score-banner ${result.passed ? 'passed' : 'failed'}`}>
                <div className="score-badge">
                  {result.passed ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
                  <span className="score-num">{result.score}%</span>
                </div>
                <h3>{result.passed ? 'Assessment Passed!' : 'Review Recommended'}</h3>
                <p>{result.recommended_action}</p>
              </div>

              <div className="report-sections-grid">
                <div className="report-box strong">
                  <h4><CheckCircle2 size={16} color="var(--success)" /> Strong Areas</h4>
                  <ul>
                    {result.strong_areas.map((sa, i) => <li key={i}>{sa}</li>)}
                  </ul>
                </div>

                {result.weak_areas.length > 0 && (
                  <div className="report-box weak">
                    <h4><AlertTriangle size={16} color="var(--warning)" /> Areas to Review</h4>
                    <ul>
                      {result.weak_areas.map((wa, i) => <li key={i}>{wa}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {result.next_recommended_module && (
                <div className="adaptive-next-box">
                  <span className="adaptive-label">⚡ ADAPTIVE PATH RECOMMENDATION</span>
                  <p className="adaptive-text">{result.next_recommended_module}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {!result ? (
            <button 
              className="btn btn-primary btn-lg submit-quiz-btn"
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length < assessment.questions.length || submitting}
            >
              {submitting ? 'Submitting & Evaluating...' : 'Submit Assessment Answers'}
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={onClose}>
              Continue Learning Path <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
