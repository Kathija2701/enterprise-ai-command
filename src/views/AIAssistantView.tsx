import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  CornerDownLeft,
  Briefcase,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import { AIChatMessage } from '../types';

interface AIAssistantViewProps {
  onSendMessage: (msg: string) => Promise<string>;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am your **Autonomous Enterprise AI Copilot**. I have live read-access to organizational databases covering **employees, active projects, tasks, departments, deadlines, and financial metrics**.\n\nAsk me anything or select a prompt below to get instant executive intelligence.`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    'Show pending tasks and high-priority bottlenecks',
    'Which project has the highest progress?',
    "Give me a summary of today's activities.",
    'Identify at-risk deliverables and upcoming deadlines',
    'Evaluate employee workload balance across departments',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const responseText = await onSendMessage(text);
      const aiMsg: AIChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: AIChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue analyzing the database. Please try again or query a different module.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-850 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-fuchsia-600 via-indigo-600 to-cyan-500 shadow-md">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Enterprise AI Copilot</h2>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Live Data Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Powered by Gemini 3.8 Flash • Real-time database synthesis & business intelligence
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: `reset-${Date.now()}`,
                sender: 'assistant',
                text: 'Conversation refreshed. How may I assist you with enterprise metrics or task triage?',
                timestamp: 'Just now',
              },
            ])
          }
          className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-400 hover:text-white"
          title="Reset Conversation"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-fuchsia-600 to-indigo-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>

            <div
              className={`group relative max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
              }`}
            >
              {/* Formatted Text */}
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              <div
                className={`mt-2 flex items-center justify-between text-[10px] ${
                  msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 hover:text-white transition ml-3"
                    title="Copy Answer"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing animation indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 text-white">
              <Sparkles className="h-4 w-4 animate-spin-slow" />
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/90 px-4 py-3 rounded-tl-none">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"></span>
                <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-slate-400 ml-2 font-medium">
                  Analyzing live database context...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="border-t border-slate-800 bg-slate-850/60 px-4 py-2.5 overflow-x-auto flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
        <span className="text-[11px] text-slate-400 font-semibold shrink-0">Suggestions:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="shrink-0 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-indigo-500 hover:text-white"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="border-t border-slate-800 bg-slate-900 p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask about tasks, projects, employees, deadlines, revenue, or risk factors..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-3 pl-4 pr-24 text-xs sm:text-sm text-white placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 shadow"
          >
            <span>Ask</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
