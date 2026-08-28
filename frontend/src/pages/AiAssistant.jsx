import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Trash2, Sparkles, User, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import './AiAssistant.css';

export default function AiAssistant({ profile }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${profile?.name || 'Sahil'}! 👋 I'm your **LearnPath AI Mentor**.\n\nI'm fully synchronized with your **${profile?.goal || 'Cybersecurity Analyst'}** goal and your current **68% completion progress**.\n\nHow can I help you master your skills today?`,
      followups: [
        "Why was this course recommended?",
        "Explain TCP/IP simply.",
        "What should I learn next?",
        "I only have 5 hours this week."
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "Why was this course recommended?",
    "Explain TCP/IP simply.",
    "What should I learn next?",
    "I only have 5 hours this week.",
    "Create a revision plan.",
    "Help me understand my skill gaps."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || isLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(profile?.user_id || 'sahil_01', query);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.response || res.reply || "Here is guidance tailored for your goal!",
        followups: res.suggested_followups || []
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I experienced a temporary connection hiccup. Please try asking again!",
        followups: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `Chat cleared! How else can I assist your ${profile?.goal || 'learning'} journey?`,
        followups: ["What should I learn next?", "Explain my current skill gaps"]
      }
    ]);
  };

  const renderFormattedText = (text) => {
    // Simple markdown-style renderer for bold and code
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      let content = line;
      // Bold **
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const formatted = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <React.Fragment key={lIdx}>
          {formatted}
          {lIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="page-wrapper ai-assistant-page">
      {/* Header */}
      <div className="chat-header card">
        <div className="chat-header-info">
          <div className="bot-avatar-badge">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="chat-title">LearnPath AI Assistant</h1>
            <p className="chat-subtitle">Your personal learning mentor · Context-aware for {profile?.goal || 'Cybersecurity'}</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleClearChat} title="Clear Conversation">
          <Trash2 size={16} /> Clear Chat
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="chat-box card">
        <div className="messages-list">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>

              <div className="message-content">
                <div className="message-bubble">
                  {renderFormattedText(msg.text)}
                </div>

                {/* Follow-up suggestions */}
                {msg.sender === 'ai' && msg.followups && msg.followups.length > 0 && (
                  <div className="followup-chips">
                    <span className="followup-label">Suggested follow-ups:</span>
                    {msg.followups.map((chip, cIdx) => (
                      <button 
                        key={cIdx} 
                        className="chip-btn"
                        onClick={() => handleSend(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-message ai loading">
              <div className="message-avatar">
                <Bot size={18} />
              </div>
              <div className="message-bubble loading-bubble">
                <Sparkles size={16} className="spinning-icon" /> Thinking and generating answer...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Banner */}
        <div className="suggested-prompts-bar">
          <span className="bar-label">Quick Prompts:</span>
          <div className="prompts-scroll">
            {suggestedPrompts.map((p, idx) => (
              <button 
                key={idx} 
                className="prompt-chip"
                onClick={() => handleSend(p)}
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="chat-input-row">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask your learning mentor anything (e.g. Explain TCP/IP simply, or why this course was recommended)..."
            rows={2}
          />
          <button 
            className="btn btn-primary send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
