const API_BASE = '/api';

export async function fetchApi(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}. Please check backend connection.`);
      }
      throw new Error(`Server response format error (non-JSON response).`);
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || `HTTP Error ${res.status}`);
    }

    return data;
  } catch (err) {
    console.warn(`API call ${endpoint} failed:`, err);
    throw err;
  }
}

export const api = {
  login: (email, password) => fetchApi(`/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (profileData) => fetchApi(`/auth/register`, { method: 'POST', body: JSON.stringify(profileData) }),
  getProfile: (userId = 'sahil_01') => fetchApi(`/profile/${userId}`).catch(() => fetchApi(`/learning-path`, { method: 'POST', body: JSON.stringify({ user_id: userId }) })),
  saveProfile: (profile) => fetchApi(`/profile`, { method: 'POST', body: JSON.stringify(profile) }),
  analyzeGoal: (goal, experience) => fetchApi(`/analyze-goal`, { method: 'POST', body: JSON.stringify({ goal, experience }) }),
  getSkillGap: (profile) => fetchApi(`/skill-gap`, { method: 'POST', body: JSON.stringify(profile || {}) }),
  getRecommendations: (userId = 'sahil_01', limit = 6) => fetchApi(`/recommendations`, { method: 'POST', body: JSON.stringify({ user_id: userId, limit }) }),
  getLearningPath: (userId = 'sahil_01') => fetchApi(`/learning-path`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
  getAssessment: (assessmentId) => fetchApi(`/assessment/${assessmentId}`),
  submitAssessment: (userId, assessmentId, answers) => fetchApi(`/assessment`, { method: 'POST', body: JSON.stringify({ user_id: userId, assessment_id: assessmentId, answers }) }),
  sendChatMessage: (userId, message) => fetchApi(`/chat`, { method: 'POST', body: JSON.stringify({ user_id: userId, message }) }),
  getProgress: (userId = 'sahil_01') => fetchApi(`/progress?user_id=${userId}`),
  getResources: () => fetchApi(`/resources`),
  getNotifications: (userId = 'sahil_01') => fetchApi(`/notifications?user_id=${userId}`),
  completeResource: (userId, resourceId, skillsGained = []) => fetchApi(`/complete-resource`, { method: 'POST', body: JSON.stringify({ user_id: userId, resource_id: resourceId, skills_gained: skillsGained }) }),
  getCompletedResources: (userId) => fetchApi(`/user-completed-resources/${userId}`),
  submitFeedback: (userId, resourceId, rating, comment) => fetchApi(`/feedback`, { method: 'POST', body: JSON.stringify({ user_id: userId, resource_id: resourceId, rating, comment }) })
};
