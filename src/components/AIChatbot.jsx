import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Trash2 } from 'lucide-react';
import aiChatbotService from '../services/aiChatbotService';

/**
 * AIChatbot — floating chatbot button + chat window.
 * Drop this into Layout.jsx and it appears on every dashboard page.
 * 
 * Props:
 *  - role: 'student' | 'teacher' | 'admin'
 */
export default function AIChatbot({ role = 'student' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: `Hi! I'm your CampusAI assistant 👋\nI can help you navigate the platform. Ask me anything about your ${role} dashboard!`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Build history for multi-turn context (exclude the greeting message)
    const history = messages
      .filter((m) => m.id !== 1)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));

    try {
      const reply = await aiChatbotService.askChatbot(trimmed, role, history);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: '⚠️ Sorry, I couldn't reach the AI service right now. Please try again in a moment.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 1,
        role: 'bot',
        text: `Hi! I'm your CampusAI assistant 👋\nI can help you navigate the platform. Ask me anything about your ${role} dashboard!`,
      },
    ]);
  };

  const roleColor = {
    student: 'bg-indigo-600',
    teacher: 'bg-emerald-600',
    admin: 'bg-violet-600',
  }[role] || 'bg-indigo-600';

  const roleColorHover = {
    student: 'hover:bg-indigo-700',
    teacher: 'hover:bg-emerald-700',
    admin: 'hover:bg-violet-700',
  }[role] || 'hover:bg-indigo-700';

  const roleColorLight = {
    student: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    teacher: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    admin: 'bg-violet-50 text-violet-700 border-violet-100',
  }[role] || 'bg-indigo-50 text-indigo-700 border-indigo-100';

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="CampusAI Assistant"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${roleColor} ${roleColorHover} text-white focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-400`}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: '520px' }}
        >
          {/* Header */}
          <div className={`${roleColor} px-4 py-3 flex items-center justify-between text-white`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">CampusAI Assistant</p>
                <p className="text-xs opacity-80 capitalize mt-0.5">{role} Help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                title="Clear chat"
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: '280px', maxHeight: '360px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                    msg.role === 'user' ? roleColor : 'bg-slate-400'
                  }`}
                >
                  {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === 'user'
                      ? `${roleColor} text-white rounded-br-sm`
                      : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-sm'
                      : 'bg-white text-slate-700 border border-gray-200 shadow-sm rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center text-white">
                  <Bot size={12} />
                </div>
                <div className="bg-white border border-gray-200 shadow-sm px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about CampusAI..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none px-3 py-2 text-sm text-slate-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 disabled:opacity-50 leading-5"
              style={{ maxHeight: '80px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${roleColor} ${roleColorHover}`}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>

          {/* Footer hint */}
          <p className="text-center text-[10px] text-gray-400 pb-2 bg-white">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}
    </>
  );
}
