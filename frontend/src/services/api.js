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

  if (any(k => pLower.includes(k), ["react", "usestate", "useeffect", "jsx", "virtual dom", "component", "props", "hook"])) {
    return {
      reply: `### Mastering React 18 & Frontend Architecture ⚛️\n\nGreat question, ${userName}! In modern React development:\n\n1. **\`useState\` Hook:** Manages local component state. Calling \`setState(newValue)\` triggers a clean re-render with updated state values.\n2. **\`useEffect\` Hook:** Handles side-effects (API data fetching, subscriptions, timers). Pass an empty dependency array \`[]\` to run once on component mount.\n3. **Virtual DOM:** React keeps an in-memory representation of the UI and calculates exact diffs (reconciliation) before updating the real browser DOM, ensuring high performance.\n\n\`\`\`jsx\n// Example: Data Fetching Component in React 18\nimport React, { useState, useEffect } from 'react';\n\nexport default function UserProfile({ userId }) {\n  const [userData, setUserData] = useState(null);\n  useEffect(() => {\n    fetch(\`/api/user/\${userId}\`)\n      .then(res => res.json())\n      .then(data => setUserData(data));\n  }, [userId]);\n  return <div>{userData ? userData.name : 'Loading...'}</div>;\n}\n\`\`\`\n\n**Next Step for ${userGoal}:** Practice building reusable components and connecting them to REST APIs!`,
      suggested_followups: ["Explain React useEffect dependencies", "How to manage global state with Context API?", "Recommend a React course"]
    };
  }

  if (any(k => pLower.includes(k), ["javascript", "js", "promise", "async", "await", "closure", "event loop", "arrow function"])) {
    return {
      reply: `### Modern JavaScript ES6+ & Async Deep Dive 🟨\n\nHere is how modern JavaScript handles execution and asynchronous tasks:\n\n1. **Event Loop & Call Stack:** Synchronous code executes first on the single-threaded Call Stack. Asynchronous callbacks (Promises, \`fetch\`) are queued in the Microtask Queue and executed when the stack clears.\n2. **Promises & \`async/await\`:** Promises represent future values (Pending, Fulfilled, Rejected). \`async/await\` is syntactic sugar that allows writing asynchronous code sequentially without callback nesting.\n3. **Closures:** A function retains access to variables from its outer lexical scope even after the outer function has executed.\n\n\`\`\`javascript\n// Example: Modern Async/Await with Error Handling\nasync function fetchLearnerProgress(learnerId) {\n  try {\n    const response = await fetch(\`/api/progress/\${learnerId}\`);\n    if (!response.ok) throw new Error(\`HTTP Error \${response.status}\`);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Fetch error:', error);\n  }\n}\n\`\`\``,
      suggested_followups: ["Explain Event Loop microtask queue", "What is the difference between let, const, and var?", "Recommend JS async course"]
    };
  }

  if (any(k => pLower.includes(k), ["node", "express", "api", "rest", "backend", "middleware", "route", "jwt"])) {
    return {
      reply: `### Node.js & Express REST API Architecture 🟢\n\nFor building scalable backend web services:\n\n1. **RESTful Architecture:** Express routes use HTTP methods cleanly:\n   • \`GET /api/resources\` — Retrieve items\n   • \`POST /api/resources\` — Create new item\n   • \`PUT /api/resources/:id\` — Update item\n   • \`DELETE /api/resources/:id\` — Delete item\n2. **Express Middleware:** Functions that execute sequentially during request/response cycles (\`(req, res, next)\`), ideal for authentication and logging.\n3. **JWT Authentication:** Server signs a JSON Web Token upon login; client passes \`Authorization: Bearer <token>\` in HTTP headers.`,
      suggested_followups: ["Explain Express middleware order", "How to implement JWT authentication?", "Recommend Express backend course"]
    };
  }

  if (any(k => pLower.includes(k), ["python", "pip", "list comprehension", "dictionary", "tuple", "class", "def"])) {
    return {
      reply: `### Python Programming & Best Practices 🐍\n\nPython is clean, highly readable, and versatile:\n\n1. **List Comprehensions:** Concise syntax for creating lists:\n   \`squared_numbers = [x**2 for x in range(10) if x % 2 == 0]\`\n2. **Dictionaries:** Hash-map key-value lookups with \`O(1)\` average time complexity.\n3. **Classes & OOP:** Define data blueprints with \`class\` and \`__init__(self)\` constructors.`,
      suggested_followups: ["Explain Python Decorators", "What is the difference between list, tuple, and set?", "Recommend Python course"]
    };
  }

  if (any(k => pLower.includes(k), ["pandas", "numpy", "dataframe", "data science", "matplotlib", "seaborn", "csv"])) {
    return {
      reply: `### Data Science & Data Wrangling with Pandas 📊\n\nEssential tools for data analysis:\n\n1. **NumPy Arrays:** Vectorized N-dimensional math operations running in C speeds.\n2. **Pandas DataFrames:** 2D tabular data structure with powerful indexing:\n   • \`df = pd.read_csv('data.csv')\` — Load data\n   • \`df.groupby('category').mean()\` — Aggregate data\n   • \`df.fillna(0)\` — Clean missing null values\n3. **Visualization:** Use Seaborn & Matplotlib to plot histograms, scatter plots, and correlation heatmaps.`,
      suggested_followups: ["Explain Pandas groupby and aggregate", "How to handle missing values in Pandas?", "Recommend Data Science course"]
    };
  }

  if (any(k => pLower.includes(k), ["machine learning", "ml", "regression", "classification", "scikit", "overfitting", "training"])) {
    return {
      reply: `### Machine Learning Engineering & Algorithms 🤖\n\nCore workflow for building predictive models:\n\n1. **Supervised vs Unsupervised:** Supervised uses labeled data (Regression, Classification); Unsupervised finds hidden patterns (K-Means Clustering).\n2. **Train/Test Split:** Split data (80% train, 20% test) to evaluate generalization performance.\n3. **Overfitting:** Occurs when a model memorizes training noise instead of learning general patterns; mitigate with regularization (L1/L2) and cross-validation.`,
      suggested_followups: ["Explain Random Forest vs Decision Trees", "How to prevent overfitting?", "Recommend Machine Learning course"]
    };
  }

  if (any(k => pLower.includes(k), ["cyber", "security", "wireshark", "packet", "port", "subnet", "tcp/ip", "handshake"])) {
    return {
      reply: `### Computer Networking & Wireshark Packet Analysis 🛡️\n\nNetwork fundamentals for SOC Analysts and Security Engineers:\n\n1. **TCP 3-Way Handshake:** Connection establishment via \`SYN\` ➔ \`SYN-ACK\` ➔ \`ACK\` flags.\n2. **Common Standard Ports:** \`22\` (SSH), \`53\` (DNS), \`80\` (HTTP), \`443\` (HTTPS), \`3306\` (MySQL).\n3. **Wireshark Display Filters:**\n   • \`ip.addr == 192.168.1.1\` — Filter by IP address\n   • \`http.request.method == 'POST'\` — Inspect form submissions\n   • \`tcp.flags.syn == 1 and tcp.flags.ack == 0\` — Spot SYN flood attacks`,
      suggested_followups: ["Explain TCP SYN flood attack", "How to carve files in Wireshark?", "Recommend Wireshark lab"]
    };
  }

  if (any(k => pLower.includes(k), ["siem", "splunk", "log", "syslog", "soc", "incident", "event id"])) {
    return {
      reply: `### SIEM Operations & Splunk Log Analysis 🔍\n\nHow Security Operations Centers detect & investigate threats:\n\n1. **Log Aggregation:** SIEM ingests Windows Event Logs, Syslog, firewall logs, and cloud audit trails into a centralized index.\n2. **Key Windows Event IDs:**\n   • \`4624\` — Successful Logon\n   • \`4625\` — Failed Logon (multiple 4625s indicate brute-force attempts!)\n   • \`4688\` — New Process Created\n3. **Splunk SPL Query:** \`index=security EventCode=4625 | stats count by TargetUserName | where count > 5\``,
      suggested_followups: ["Recommend Splunk hands-on lab", "Explain NIST Incident Response framework", "Show Cybersecurity path"]
    };
  }

  if (any(k => pLower.includes(k), ["dsa", "placement", "algorithm", "binary tree", "hash table", "complexity", "big o"])) {
    return {
      reply: `### Technical Placement & DSA Master Strategy 🎯\n\nHigh-frequency topics for technical coding interviews:\n\n1. **Time Complexity (Big-O):** \`O(1)\` constant, \`O(log N)\` binary search, \`O(N)\` linear, \`O(N log N)\` quicksort, \`O(N²)\` nested loops.\n2. **Must-Master Data Structures:** Two Pointers, Sliding Window, Fast & Slow Pointers, Hash Maps (\`O(1)\` lookup), Binary Search Trees, Graphs (BFS/DFS).\n3. **Preparation Plan:** Solve 2 LeetCode problems daily, focusing on understanding pattern recognition over memorization!`,
      suggested_followups: ["Explain Sliding Window pattern", "How to calculate Big-O time complexity?", "Recommend DSA placement roadmap"]
    };
  }

  if (any(k => pLower.includes(k), ["sql", "database", "join", "select", "group by", "postgres", "sqlite", "foreign key"])) {
    return {
      reply: `### Relational Databases & SQL Mastery 🛢️\n\nCore database concepts for full stack & data roles:\n\n1. **SQL JOINs:**\n   • \`INNER JOIN\`: Returns records with matching keys in both tables.\n   • \`LEFT JOIN\`: Returns all records from left table, and matched records from right.\n2. **ACID Properties:** Atomicity, Consistency, Isolation, Durability guarantee transaction safety.\n3. **Query Optimization:** Add Indexes (\`CREATE INDEX idx_email ON users(email)\`) on columns frequently queried in \`WHERE\` and \`JOIN\` clauses to avoid full table scans.`,
      suggested_followups: ["Explain SQL INNER vs LEFT JOIN with example", "What are ACID properties in database?", "Recommend SQL course"]
    };
  }

  return {
    reply: `### Learning Guidance for **"${prompt}"** 💡\n\nHello ${userName}! Here is a structured 3-part blueprint to master **"${prompt}"** for your **${userGoal}** goal:\n\n1. **Core Concepts:** Understand foundational principles, key terminology, and syntax.\n2. **Hands-on Practice:** Build a small real-world application or lab exercise applying this skill.\n3. **Assessment & Verification:** Take the module verification quiz to lock in your score and update your overall readiness percentage!\n\nWhat specific topic regarding **"${prompt}"** would you like me to explain deeper?`,
    suggested_followups: [
      `Explain "${prompt}" simply with code`,
      `Recommend a course for ${prompt}`,
      `Show my learning roadmap`,
      `Help me plan my study schedule`
    ]
  };
}

function any(predicate, items) {
  return items.some(predicate);
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
