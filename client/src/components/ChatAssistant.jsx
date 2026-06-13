import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X, Send, Loader2, Trash2 } from 'lucide-react';

// Pure/Impure helper functions extracted outside the component to satisfy purity rules
const generateTimestamp = () => new Date();
const generateMessageId = (offset = 0) => (Date.now() + offset).toString();

const formatMessageText = (text) => {
  if (!text) return null;

  // Split text by lines first to preserve line breaks
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Regex matches either **bold** or [text](url)
    const tokenRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
    const parts = line.split(tokenRegex);

    const renderedLine = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={partIdx} className="font-extrabold text-brass">{boldText}</strong>;
      } else if (part.startsWith('[') && part.includes('](')) {
        const closeBracketIdx = part.indexOf(']');
        const linkText = part.slice(1, closeBracketIdx);
        const linkUrl = part.slice(closeBracketIdx + 2, -1);
        return (
          <a
            key={partIdx}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brass underline hover:text-[#2F5C8F] inline-flex items-center gap-0.5 font-bold"
          >
            {linkText}
          </a>
        );
      }
      return part;
    });

    return (
      <React.Fragment key={lineIdx}>
        {renderedLine}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const getInitialMessages = (activeProcessId, activeProcessName) => {
  const key = `civicpilot_chat_${activeProcessId || 'general'}`;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(m => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
        }));
      }
    }
  } catch (err) {
    console.warn("Failed to load chat history from localStorage:", err);
  }

  if (activeProcessName) {
    return [
      {
        id: 'welcome',
        sender: 'bot',
        text: `AI Sahayak: Loaded guide for "${activeProcessName}".\n\nAsk me about required documents, processing fees, expected timelines, or rules. How can I help you today?`,
        timestamp: generateTimestamp()
      }
    ];
  } else {
    return [
      {
        id: 'welcome',
        sender: 'bot',
        text: "AI Sahayak: Search for a service above or select one of our popular services below to begin.",
        timestamp: generateTimestamp()
      }
    ];
  }
};

const ChatAssistant = ({ activeProcessId, activeProcessName, selectedStep, isOpen, setIsOpen, csrfToken }) => {
  const [messages, setMessages] = useState(() => getInitialMessages(activeProcessId, activeProcessName));
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync messages to localStorage
  useEffect(() => {
    const key = `civicpilot_chat_${activeProcessId || 'general'}`;
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (err) {
      console.error("Failed to save chat history to localStorage:", err);
    }
  }, [messages, activeProcessId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || inputValue;
    if (!queryText.trim()) return;

    if (!textToSend) {
      setInputValue('');
    }

    const userMsg = {
      id: generateMessageId(),
      sender: 'user',
      text: queryText,
      timestamp: generateTimestamp()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          processId: activeProcessId || 'general',
          question: queryText,
          history: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error('Could not retrieve assistant response');
      }

      const data = await response.json();
      
      const botMsg = {
        id: generateMessageId(1),
        sender: 'bot',
        text: data.answer,
        timestamp: generateTimestamp()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: generateMessageId(1),
        sender: 'bot',
        text: "AI Sahayak Error: Could not get response. Please check your internet connection and try again.",
        timestamp: generateTimestamp()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const baseChips = [
    { label: "Checklist Fees", text: "What are the registration fees?" },
    { label: "Service Timeline", text: "What is the timeline of each step?" },
    { label: "Docs Checklist", text: "Give me the list of required documents." },
    { label: "Rented Property", text: "Can I register this on a rented property address?" }
  ];

  const chips = selectedStep 
    ? [
        { 
          label: `How to do: ${selectedStep.title}`, 
          text: `How do I complete the step "${selectedStep.title}"? (${selectedStep.desc})` 
        },
        ...baseChips
      ]
    : baseChips;

  return (
    <>
      {/* Floating Compass button in bottom right: Styled as a vintage brass medallion */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1, rotate: isOpen ? 90 : 180 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-[#EAD295] to-[#9C7A39] text-[#261F1C] border border-[#C19D53] flex items-center justify-center shadow-lg hover:shadow-brass/20 transition-all font-bold z-50"
        >
          {isOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Compass className="w-5 h-5 stroke-[2.5]" />}
        </motion.button>
      </div>

      {/* Slide-out Navigator Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#1A1412]/70 pointer-events-auto"
            />

            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 left-auto w-[85vw] sm:w-[420px] bg-[#1E1917] border-l-2 border-brass/45 shadow-2xl flex flex-col pointer-events-auto z-10 overflow-hidden rounded-l-2xl"
            >
              {/* Header block with Mascot */}
              <div className="p-4 bg-black/25 border-b border-brass/25 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <motion.div 
                    className="w-9 h-9 rounded-full bg-parchment/95 flex items-center justify-center text-brass shadow-inner border border-brass/35"
                    whileHover={{ rotate: 360 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  >
                    <Compass className="w-4 h-4" />
                  </motion.div>
                  <div>
                    <h4 className="font-garamond font-bold text-xl text-parchment tracking-wide brass-glow-text">AI Sahayak</h4>
                    <p className="font-mono text-[8px] text-brass uppercase tracking-widest mt-0.5">
                      {activeProcessName ? `${activeProcessName} guide` : 'Government service helper'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm("Do you want to clear your chat history for this service?")) {
                        const key = `civicpilot_chat_${activeProcessId || 'general'}`;
                        localStorage.removeItem(key);
                        setMessages(getInitialMessages(activeProcessId, activeProcessName));
                      }
                    }}
                    className="p-1.5 border border-brass/20 hover:border-inkRed/60 hover:text-inkRed rounded-lg text-parchment/50 hover:scale-105 active:scale-95 transition-all bg-black/20 shadow-xs flex items-center justify-center"
                    title="Clear Chat History"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 border border-brass/20 hover:border-brass rounded-lg text-parchment/70 transition-all bg-black/20"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-black/15 relative">
                {/* Vintage left binder holes look */}
                <div className="absolute top-0 bottom-0 left-2 w-2 flex flex-col justify-around py-6 pointer-events-none opacity-10">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-brass border border-brass/50" />
                  ))}
                </div>

                <div className="pl-4 space-y-5">
                  {messages.map((msg) => {
                    const isBot = msg.sender === 'bot';
                    return (
                      <div key={msg.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'} gap-2`}>
                        {isBot && (
                          <div className="w-6 h-6 rounded-full bg-parchment/90 border border-brass/35 text-brass flex items-center justify-center shrink-0 mt-1 shadow-xs select-none">
                            <Compass className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className={`p-3.5 rounded-2xl text-xs shadow-md leading-relaxed ${
                          isBot 
                            ? 'bg-[#FAF6EE] border border-brass/35 text-ink font-typewriter max-w-[85%] rounded-tl-none text-left' 
                            : 'bg-[#EADFCA] border border-brass/45 text-ink font-mono max-w-[85%] ml-auto rounded-tr-none text-left'
                        }`}>
                          {formatMessageText(msg.text)}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Thinking Loader */}
                  {isLoading && (
                    <div className="flex justify-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-parchment/90 border border-brass/35 text-brass flex items-center justify-center shrink-0 mt-1 shadow-xs select-none">
                        <Compass className="w-3.5 h-3.5 animate-spin" />
                      </div>
                      <div className="bg-[#FAF6EE] border border-brass/30 p-3 rounded-xl text-ink/75 flex items-center gap-2 shadow-md font-typewriter">
                        <Loader2 className="w-3 h-3 animate-spin text-brass" />
                        <span>Finding answers...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Suggestions chips (Always Visible) */}
              <div className="px-5 py-2.5 border-t border-brass/15 bg-black/10 flex gap-2 overflow-x-auto shrink-0 scrollbar-none pl-8">
                {chips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.text)}
                    className="whitespace-nowrap px-2.5 py-1.5 rounded-lg border border-brass/35 bg-[#FAF6EE] font-mono text-[9px] text-ink hover:bg-brass hover:text-black transition-all font-bold shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Footer */}
              <div className="p-3 bg-black/25 border-t border-brass/25 flex gap-2 shrink-0 pl-8">
                <input
                  type="text"
                  placeholder="Ask about rules, timelines, fees..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-3 py-2 rounded-lg bg-black/35 border border-brass/25 text-xs text-parchment placeholder:text-parchment/35 focus:outline-none focus:border-brass transition-colors font-medium"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim()}
                  className="p-2.5 rounded-lg bg-[#C19D53] hover:bg-[#D7C191] text-black border border-brass/25 disabled:opacity-40 transition-all shadow-xs flex items-center justify-center hover:scale-[1.04] active:scale-[0.96]"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistant;