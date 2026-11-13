import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  User,
  Lightbulb,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { DemoBanner } from '../components/DemoBanner';

const PROMPT_SUGGESTIONS = [
  "How is my spending looking for Dining Out this month?",
  "What is my predicted expense for next month?",
  "How can I increase my monthly savings rate?",
  "Which category has the highest spending?"
];

export const AIAssistant = () => {
  const { user, chatMessages, sendAIMessage, clearChat } = useFinance();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendAIMessage(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (prompt) => {
    sendAIMessage(prompt);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', minHeight: '600px' }}>
      <DemoBanner
        message="Demo AI Financial Advisor: Real-time contextual replies based on your loaded ledger, cashflow ratios, and budget limits."
      />

      {/* Chat Container Card */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          minHeight: '480px'
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-forest)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--brand-forest)' }}>
                  Finance Advisor AI
                </h3>
                <span className="stat-badge positive" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                  Demo Mode
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Powered by rule-based heuristic & ML contextual engine
              </div>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.78rem' }}
            title="Reset conversation"
          >
            <Trash2 size={14} />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: '#fafcfb'
          }}
        >
          {chatMessages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  maxWidth: '82%'
                }}
              >
                {isBot && (
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'var(--brand-forest)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Sparkles size={16} />
                  </div>
                )}

                <div>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: isBot ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                      background: isBot ? '#ffffff' : 'var(--brand-forest)',
                      color: isBot ? 'var(--text-body)' : '#ffffff',
                      boxShadow: 'var(--shadow-sm)',
                      border: isBot ? '1px solid var(--border-green)' : 'none',
                      fontSize: '0.92rem',
                      lineHeight: 1.55
                    }}
                  >
                    {msg.message}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                      textAlign: isBot ? 'left' : 'right',
                      padding: '0 4px'
                    }}
                  >
                    {msg.time || (msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now')}
                  </div>
                </div>

                {!isBot && (
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'var(--brand-emerald)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontWeight: 700,
                      fontSize: '0.82rem'
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '10px 20px',
            background: 'white',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-emerald)', alignSelf: 'center' }}>
            Suggestions:
          </span>
          {PROMPT_SUGGESTIONS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(prompt)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
            >
              <Lightbulb size={12} color="var(--brand-forest)" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-green)',
            display: 'flex',
            gap: '12px',
            background: 'white'
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Ask anything about your income, spending, or financial goals..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim()}
          >
            <Send size={16} />
            <span style={{ display: 'none' }}>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
