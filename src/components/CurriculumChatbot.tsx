import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Sparkles, 
  RotateCcw, 
  User, 
  Bot, 
  ChevronDown, 
  HelpCircle, 
  Maximize2, 
  Minimize2,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Course, PLO } from '../types';
import ucwLogo from '../assets/images/ucw_logo_1782386132664.jpg';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface CurriculumChatbotProps {
  courses: Course[];
  plos: PLO[];
  mappings: { [key: string]: string[] };
}

export default function CurriculumChatbot({
  courses,
  plos,
  mappings
}: CurriculumChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I am your **MBA Curriculum Specialist Assistant** powered by **Gemini AI**.\n\nI can assist you with:\n- Identifying **curriculum gaps** (undercovered or unmapped PLOs)\n- Generating **mapping suggestions** for any course (e.g., BUSI 601)\n- Aligning Course Learning Outcomes (CLOs) to Program Learning Outcomes (PLOs)\n- Checking Bloom's taxonomic levels for learning verbs.\n\nWhat curriculum question can I help you resolve today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const quickPrompts = [
    { label: '🔍 Undercovered PLOs', text: 'Which PLOs have weak or zero coverage in our curriculum?' },
    { label: '💡 Suggest BUSI 601 mappings', text: 'Can you recommend specific CLO-to-PLO mappings for BUSI 601?' },
    { label: '📈 Analyze Term 1 alignment', text: 'Provide a quick diagnostic analysis of the course alignment in Term 1.' },
    { label: '🎯 Bloom\'s level advice', text: 'What are some tips for aligning the verb choices in CLOs to the correct Bloom\'s taxonomic level?' }
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setStatusMessage('Analyzing curriculum data...');

    // Dynamic state messages during loading
    const statusIntervals = [
      setTimeout(() => setStatusMessage('Querying Gemini AI models...'), 1500),
      setTimeout(() => setStatusMessage('Checking fallback endpoints...'), 4000),
      setTimeout(() => setStatusMessage('Synthesizing professional response...'), 7000)
    ];

    try {
      // Map current history to API format
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyPayload,
          context: {
            courses,
            plos,
            mappings
          }
        })
      });

      statusIntervals.forEach(clearTimeout);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch response from Gemini assistant');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      statusIntervals.forEach(clearTimeout);
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Sorry, I encountered an issue while generating a response:\n\n**Error Details:** ${error.message || 'Could not communicate with server'}\n\nPlease try again. The server will automatically try fallback servers to answer you.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleResetChat = () => {
    if (confirm('Clear assistant conversation history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: "Hello! I am your **MBA Curriculum Specialist Assistant** powered by **Gemini AI**.\n\nI can assist you with:\n- Identifying **curriculum gaps** (undercovered or unmapped PLOs)\n- Generating **mapping suggestions** for any course (e.g., BUSI 601)\n- Aligning Course Learning Outcomes (CLOs) to Program Learning Outcomes (PLOs)\n- Checking Bloom's taxonomic levels for learning verbs.\n\nWhat curriculum question can I help you resolve today?",
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  // Basic Markdown-like renderer for chat bubbles
  const renderMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Simple bold replacements (**text**)
      let formatted = line;
      const boldRegex = /\*\*(.*?)\*\"/g; // fixed simple match
      const parts = [];
      let lastIndex = 0;
      let match;

      // Better robust regex for bold matching
      const betterBoldRegex = /\*\*(.*?)\*\*/g;
      while ((match = betterBoldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-blue-950 dark:text-blue-200">{match[1]}</strong>);
        lastIndex = betterBoldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ');
      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc pl-1 mb-1.5 leading-relaxed text-[12px]">
            {parts.length > 0 ? parts : line.replace(/^[-*•]\s+/, '')}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="mb-2 leading-relaxed break-words text-[12px]">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div id="curriculum-chatbot-widget" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chat-panel"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '56px' : '560px',
              width: '400px'
            }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 ring-1 ring-black/5"
          >
            {/* Header */}
            <div className="bg-slate-900 text-slate-100 p-4 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded bg-white overflow-hidden shadow-inner flex items-center justify-center shrink-0 border border-slate-200 p-1">
                  <img
                    src={ucwLogo}
                    alt="UCW Logo"
                    className="max-w-full max-h-full object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-[12.5px] font-extrabold font-sans tracking-wide flex items-center gap-1.5">
                    Curriculum Specialist
                  </h4>
                  <p className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                    Powered by Gemini AI (Autonomous Fallback)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                  title={isMinimized ? "Expand Assistant" : "Minimize Assistant"}
                >
                  {isMinimized ? <Maximize2 size={13.5} /> : <Minimize2 size={13.5} />}
                </button>
                <button
                  onClick={handleResetChat}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                  title="Reset Conversation"
                >
                  <RotateCcw size={13.5} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                  title="Close Assistant"
                >
                  <X size={13.5} />
                </button>
              </div>
            </div>

            {/* Chat Body & Footer (Hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Active Mappings Summary Banner */}
                <div className="bg-blue-50/70 px-4 py-2 border-b border-blue-100 flex items-center justify-between text-[10px] font-bold text-blue-800 select-none">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={12} className="text-blue-600" />
                    Curriculum Context Active
                  </span>
                  <span className="bg-blue-100/70 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200/50">
                    {courses.length} Courses • {plos.length} PLOs
                  </span>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[88%] ${
                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-200 p-0.5'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <User size={13} />
                        ) : (
                          <img
                            src={ucwLogo}
                            alt="UCW Bot"
                            className="w-full h-full object-contain rounded"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>

                      {/* Bubble */}
                      <div className="space-y-1">
                        <div
                          className={`rounded-2xl p-3.5 shadow-sm border ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white border-blue-700 rounded-tr-none'
                              : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.role === 'model' ? renderMessageText(msg.text) : <p className="leading-relaxed break-words text-[12px] whitespace-pre-wrap">{msg.text}</p>}
                        </div>
                        <span className={`text-[9px] font-mono font-bold text-slate-400 block ${msg.role === 'user' ? 'text-right' : ''}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-0.5">
                        <img
                          src={ucwLogo}
                          alt="UCW Loading Bot"
                          className="w-full h-full object-contain rounded animate-pulse"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-1.5 w-full">
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-sm space-y-2">
                          <div className="h-2.5 bg-slate-200 rounded-full w-2/3 animate-pulse"></div>
                          <div className="h-2.5 bg-slate-200 rounded-full w-4/5 animate-pulse"></div>
                          <div className="h-2.5 bg-slate-200 rounded-full w-1/2 animate-pulse"></div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-bold animate-pulse pt-1">
                            <Sparkles size={10} className="text-blue-500 animate-spin" />
                            {statusMessage}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Chips */}
                {messages.length <= 1 && !isLoading && (
                  <div className="px-4 py-3 border-t border-slate-100 bg-white flex flex-col gap-1.5 shrink-0">
                    <span className="text-[9px] font-mono font-extrabold uppercase text-slate-400 tracking-wider">Suggested Queries</span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(p.text)}
                          className="text-[10px] font-semibold bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-200 transition text-left cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Input Bar */}
                <div className="p-3.5 border-t border-slate-200 bg-white flex flex-col gap-1.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading}
                      className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 resize-none max-h-[120px] min-h-[38px] leading-relaxed"
                    />
                    <button
                      onClick={() => handleSendMessage(inputValue)}
                      disabled={!inputValue.trim() || isLoading}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-150 text-white rounded-xl transition cursor-pointer shadow-md self-end shrink-0"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-1 text-[9px] text-slate-400 font-mono font-bold select-none">
                    <span>Academic Copilot AI</span>
                    <span>Press Shift+Enter for next line</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb Button */}
      <motion.button
        id="chat-toggle-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden ring-4 ring-[#334659] ${
          isOpen ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
        }`}
        title="Open UCW MBA Curriculum Chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <img
                src={ucwLogo}
                alt="UCW Logo Orb"
                className="w-full h-full object-contain p-1"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border border-white animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border border-white flex items-center justify-center">
                <Sparkles size={7} className="text-white animate-pulse" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
