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
  sendChatMessage: async (userId, message) => {
    try {
      return await fetchApi(`/chat`, { method: 'POST', body: JSON.stringify({ user_id: userId, message }) });
    } catch (err) {
      console.warn('Backend AI chat unavailable, using intelligent local AI mentor engine:', err);
      return generateLocalAiReply(message);
    }
  },
  getProgress: (userId = 'sahil_01') => fetchApi(`/progress?user_id=${userId}`),
  getResources: () => fetchApi(`/resources`),
  getNotifications: (userId = 'sahil_01') => fetchApi(`/notifications?user_id=${userId}`),
  completeResource: (userId, resourceId, skillsGained = []) => fetchApi(`/complete-resource`, { method: 'POST', body: JSON.stringify({ user_id: userId, resource_id: resourceId, skills_gained: skillsGained }) }),
  getCompletedResources: (userId) => fetchApi(`/user-completed-resources/${userId}`),
  submitFeedback: (userId, resourceId, rating, comment) => fetchApi(`/feedback`, { method: 'POST', body: JSON.stringify({ user_id: userId, resource_id: resourceId, rating, comment }) })
};

export function generateLocalAiReply(prompt, profile) {
  const pLower = (prompt || '').toLowerCase();
  const userName = profile?.name || 'Learner';
  const userGoal = profile?.goal || 'Full Stack Developer';

  if (pLower.includes('why') && pLower.includes('recommended')) {
    return {
      reply: `Great question, ${userName}! Your recommendations are specifically weighted for **${userGoal}**.\n\n• **Goal Relevance (30%):** Modules focus on essential skills for ${userGoal}.\n• **Skill Gap (25%):** Recommendations prioritize areas where your current proficiency is below target benchmarks.\n• **Prerequisites (15%):** Foundational topics are scheduled before advanced projects.`,
      suggested_followups: ["Show my skill gap analysis", "What should I learn next?", "Create a 7-day study plan"]
    };
  }

  if (pLower.includes('react') || pLower.includes('javascript') || pLower.includes('web') || pLower.includes('full stack')) {
    return {
      reply: `### Mastering Web Development & React ⚛️\n\nFor **${userGoal}**, here is the recommended learning order:\n\n1. **Modern JavaScript (ES6+):** Arrow functions, Promises, \`async/await\`, and Array methods (\`map\`, \`filter\`).\n2. **React Core:** Components, Props, State (\`useState\`), Effects (\`useEffect\`), and Event handling.\n3. **API Integration:** Connect React frontend components to REST APIs using \`fetch\` or \`axios\`.\n4. **Database & Backend:** Express.js, Node.js, and SQL / MongoDB database persistence.`,
      suggested_followups: ["Recommend a React course", "Explain React Hooks simply", "Show Full Stack roadmap"]
    };
  }

  if (pLower.includes('python') || pLower.includes('data') || pLower.includes('ai') || pLower.includes('ml') || pLower.includes('machine learning')) {
    return {
      reply: `### Python & AI / Machine Learning Roadmap 🐍🤖\n\nTo excel as a **${userGoal}**:\n\n1. **Data Manipulation:** Master \`NumPy\` for numerical math and \`Pandas\` for dataframes.\n2. **Machine Learning:** Train decision trees, regression, and classification models with \`Scikit-Learn\`.\n3. **Deep Learning & LLMs:** Build neural networks with \`PyTorch\` and construct RAG applications with LangChain.`,
      suggested_followups: ["Recommend Python course", "Explain Machine Learning simply", "Show AI/ML roadmap"]
    };
  }

  if (pLower.includes('cyber') || pLower.includes('security') || pLower.includes('siem') || pLower.includes('linux') || pLower.includes('network') || pLower.includes('tcp')) {
    return {
      reply: `### Cybersecurity & SIEM Mastery 🛡️\n\nKey pillars for **${userGoal}**:\n\n1. **Linux Command Line:** Master file permissions, processes (\`ps\`, \`top\`), and system logs (\`/var/log\`).\n2. **Network Protocol Analysis:** Use Wireshark to inspect TCP 3-way handshakes and packet headers.\n3. **SIEM Log Ingestion:** Use Splunk or Elastic Stack to ingest Syslog and construct alert dashboards.`,
      suggested_followups: ["Recommend Splunk lab", "Explain TCP/IP simply", "Show Cybersecurity path"]
    };
  }

  if (pLower.includes('5 hours') || pLower.includes('time') || pLower.includes('schedule') || pLower.includes('hours')) {
    return {
      reply: `### Weekly Focus Schedule for ${userName} ⏱️\n\nHere is an optimized weekly schedule for your **${userGoal}** goal:\n\n• **Phase 1 (2.0 hrs):** Watch core video tutorials & take key notes.\n• **Phase 2 (2.0 hrs):** Complete hands-on practice labs.\n• **Phase 3 (1.0 hr):** Take the milestone quiz assessment to verify your skill score!`,
      suggested_followups: ["Adjust my path pace", "Remind me of next milestone", "What should I learn next?"]
    };
  }

  return {
    reply: `Great question regarding **"${prompt}"**!\n\nAs your **LearnPath AI Mentor** for **${userGoal}**:\n\n• **Key Strategy:** Start with core fundamentals, complete hands-on practice labs, and test your knowledge with module quiz assessments.\n• I am fully synchronized with your **${userGoal}** roadmap and can guide you step-by-step through any concept or skill gap!\n\nWhat specific part of "${prompt}" would you like to explore further?`,
    suggested_followups: [
      `Explain "${prompt}" simply`,
      `Recommend a course for ${prompt}`,
      `Show my learning roadmap`,
      `Help me plan my study schedule`
    ]
  };
}
