import React, { useState, useEffect, useRef } from 'react';
import ApiClient from '../services/api';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I'm **Carbonix AI** — your personal sustainability assistant. Ask me about carbon footprint, energy, travel, food habits, or emission reduction strategies!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const res = await ApiClient.sendMessage(text);
      if (res.success && res.data?.reply) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', text: res.data.reply, isGuarded: res.data.isGuarded }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "I couldn't reach the server right now. Please ensure the backend is connected."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderFormattedText = (txt) => {
    // Basic Markdown bold replacement
    const parts = txt.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const quickChips = [
    'How do I reduce electricity?',
    'Travel reduction tips',
    'What is my goal status?',
    'Predict next month footprint'
  ];

  return (
    <div className="chatbot-widget">
      <button
        id="chatbot-toggle"
        className="btn btn-primary chatbot-fab shadow-glow text-white"
        onClick={() => setIsOpen(!isOpen)}
        title="Open Carbonix AI Assistant"
      >
        <i className="fas fa-robot"></i>
      </button>

      {isOpen && (
        <div className="chatbot-window drop-in" id="chatbot-window">
          <div className="chatbot-header">
            <div>
              <h3>Carbonix AI Assistant</h3>
              <span className="online-indicator">Online</span>
            </div>
            <button className="btn-icon" onClick={() => setIsOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="chatbot-messages" id="chatbot-messages">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`msg ${m.role === 'user' ? 'user-msg' : 'bot-msg'} fade-in`}
              >
                <div className={`msg-bubble ${m.isGuarded ? 'border-warning' : ''}`}>
                  {renderFormattedText(m.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg bot-msg fade-in" id="typing-indicator">
                <div className="msg-bubble typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          <div style={{ display: 'flex', gap: '0.4rem', padding: '0.4rem 0.8rem', overflowX: 'auto', background: 'var(--bg-secondary)' }}>
            {quickChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(chip)}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              id="chatbot-input-field"
              placeholder="Ask about sustainability..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              id="chatbot-send"
              className="btn-icon text-primary"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
