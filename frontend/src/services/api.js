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
  getAssessment: async (assessmentId) => {
    try {
      return await fetchApi(`/assessment/${assessmentId}`);
    } catch (err) {
      console.warn(`Backend quiz unavailable, generating goal-specific quiz for ${assessmentId}:`, err);
      return generateGoalSpecificQuiz(assessmentId);
    }
  },
  submitAssessment: async (userId, assessmentId, answers) => {
    try {
      return await fetchApi(`/assessment`, { method: 'POST', body: JSON.stringify({ user_id: userId, assessment_id: assessmentId, answers }) });
    } catch (err) {
      console.warn('Backend quiz submit unavailable, calculating local quiz evaluation:', err);
      return evaluateLocalQuiz(assessmentId, answers);
    }
  },
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

export function generateGoalSpecificQuiz(assessmentId = 'quiz_03', userGoal = 'Full Stack Developer') {
  const gLower = (userGoal || '').toLowerCase();
  const isCyber = gLower.includes('cyber') || gLower.includes('sec');
  
  const QUIZ_MAP = {
    quiz_01: {
      id: "quiz_01",
      title: isCyber ? "Module 01 — Computer Networking & Protocol Security Quiz" : "Module 01 — Modern HTML5, CSS3 & Responsive Design Quiz",
      description: isCyber ? "Verify your knowledge of TCP/IP layers, port numbers, DNS resolution, and packet headers." : "Verify your knowledge of semantic HTML5 tags, CSS Flexbox, Grid layout math, and responsive design.",
      skill_tag: isCyber ? "Networking" : "HTML/CSS",
      questions: isCyber ? [
        { id: 1, question: "Which OSI layer is responsible for end-to-end packet delivery using IP addresses?", options: ["Layer 2 - Data Link", "Layer 3 - Network", "Layer 4 - Transport", "Layer 7 - Application"], correct_option: 1, explanation: "Layer 3 (Network Layer) uses IP addresses to route packets across logical networks.", skill_tag: "Networking" },
        { id: 2, question: "What is the standard port number for HTTPS secure web traffic?", options: ["80", "22", "443", "53"], correct_option: 2, explanation: "Port 443 is used for TLS/SSL encrypted HTTPS communication.", skill_tag: "Networking" },
        { id: 3, question: "During a TCP 3-way handshake, what flag combination is sent back by the server?", options: ["SYN", "SYN-ACK", "ACK-FIN", "RST"], correct_option: 1, explanation: "The server responds to SYN with SYN-ACK before client sends final ACK.", skill_tag: "Networking" }
      ] : [
        { id: 1, question: "Which CSS layout property is best suited for 1-dimensional flex layouts?", options: ["display: grid", "display: flex", "position: absolute", "float: left"], correct_option: 1, explanation: "Flexbox (display: flex) is optimized for 1D row or column layouts.", skill_tag: "HTML/CSS" },
        { id: 2, question: "Which HTML5 element should be used for independent self-contained content like blog posts?", options: ["<section>", "<div>", "<article>", "<aside>"], correct_option: 2, explanation: "<article> represents standalone reusable content.", skill_tag: "HTML/CSS" },
        { id: 3, question: "What does rem unit in CSS stand for?", options: ["Relative Element Margin", "Root EM (font size of <html>)", "Responsive Element Measurement", "Real EM"], correct_option: 1, explanation: "rem is relative to the font-size of the root <html> element.", skill_tag: "HTML/CSS" }
      ]
    },
    quiz_02: {
      id: "quiz_02",
      title: isCyber ? "Module 02 — Linux CLI & Permissions Verification Quiz" : "Module 02 — Modern JavaScript ES6+ & Async Quiz",
      description: isCyber ? "Test your command line fluency, file permission modes, systemctl, and bash scripting." : "Test your knowledge of JS Promises, Async/Await, ES6 modules, and Closure scope.",
      skill_tag: isCyber ? "Linux" : "JavaScript",
      questions: isCyber ? [
        { id: 1, question: "Which numeric permission value corresponds to rwxr-xr--?", options: ["755", "754", "644", "777"], correct_option: 1, explanation: "rwx=7, r-x=5, r--=4, giving 754 permission mode.", skill_tag: "Linux" },
        { id: 2, question: "Which command lists all listening TCP and UDP sockets with process names?", options: ["ls -la", "netstat -tulnp", "chmod +x", "ps aux"], correct_option: 1, explanation: "netstat -tulnp or ss -tulnp lists open listening ports and process PIDs.", skill_tag: "Linux" }
      ] : [
        { id: 1, question: "What will console.log(typeof null) output in JavaScript?", options: ["null", "undefined", "object", "number"], correct_option: 2, explanation: "In JS, typeof null is a legacy bug returning 'object'.", skill_tag: "JavaScript" },
        { id: 2, question: "Which method is used to execute code after a Promise resolves successfully?", options: [".catch()", ".then()", ".finally()", ".async()"], correct_option: 1, explanation: "Promise.then() handles successful fulfillment values.", skill_tag: "JavaScript" }
      ]
    },
    quiz_03: {
      id: "quiz_03",
      title: isCyber ? "Module 03 — Wireshark & SIEM Log Analysis Verification Quiz" : "Module 03 — React 18 Components & State Quiz",
      description: isCyber ? "Verify your skill in packet dissection, Wireshark filters, and Splunk log ingestion queries." : "Verify your skill in React JSX, useState, useEffect lifecycle, and component prop passing.",
      skill_tag: isCyber ? "SIEM" : "React",
      questions: isCyber ? [
        { id: 1, question: "In Wireshark, which display filter isolates HTTP POST request methods?", options: ["http.request.method == 'POST'", "tcp.port == 80", "ip.addr == 192.168.1.1", "dns.flags"], correct_option: 0, explanation: "http.request.method == 'POST' filters HTTP POST requests.", skill_tag: "SIEM" },
        { id: 2, question: "What is the primary function of a SIEM system in a Security Operations Center (SOC)?", options: ["Encrypt hard drives", "Aggregate, correlate, and alert on log data", "Compile C++ code", "Format hard disks"], correct_option: 1, explanation: "SIEM aggregates logs from endpoints, firewalls, and servers to generate security alerts.", skill_tag: "SIEM" }
      ] : [
        { id: 1, question: "In React, which hook is used to perform side effects like data fetching?", options: ["useState", "useEffect", "useContext", "useReducer"], correct_option: 1, explanation: "useEffect runs side-effects after component render cycles.", skill_tag: "React" },
        { id: 2, question: "Why must React keys be unique when rendering lists?", options: ["For CSS styling", "To help React reconcile DOM nodes efficiently", "To prevent memory leaks", "Keys are optional"], correct_option: 1, explanation: "Keys give elements a stable identity so React can track additions and deletions.", skill_tag: "React" }
      ]
    }
  };

  return QUIZ_MAP[assessmentId] || QUIZ_MAP["quiz_03"];
}

export function evaluateLocalQuiz(assessmentId, answers) {
  const quiz = generateGoalSpecificQuiz(assessmentId);
  let correct = 0;
  quiz.questions.forEach(q => {
    if (answers[q.id] === q.correct_option) correct++;
  });
  const score = Math.round((correct / Math.max(1, quiz.questions.length)) * 100);
  const passed = score >= 70;
  return {
    assessment_id: assessmentId,
    score: score,
    passed: passed,
    strong_areas: passed ? [quiz.skill_tag] : [],
    weak_areas: passed ? [] : [quiz.skill_tag],
    recommended_action: passed ? `Congratulations! You scored ${score}% and demonstrated strong proficiency in ${quiz.skill_tag}.` : `Your score of ${score}% is below target 70%. We recommend reviewing key concepts in ${quiz.skill_tag} before re-evaluating.`
  };
}
