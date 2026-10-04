import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const GeminiChatbotModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language } = useAppStore();
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-flash-latest'>('gemini-3.8-flash');
  const [selectedRole, setSelectedRole] = useState<'security' | 'financial' | 'general'>('security');

  const getSystemInstruction = () => {
    switch (selectedRole) {
      case 'security':
        return 'You are an elite Cyber Threat & MFS Fraud Analyst for Recursion Pay Safe in Bangladesh. Provide snappy, clear, practical advice in concise Bengali (2-3 sentences max). Never ask for PIN.';
      case 'financial':
        return 'You are a certified Financial Planner for Bangladeshi MFS users. Give fast, practical tips on budgeting and savings in warm, concise Bengali.';
      default:
        return 'You are Recursion Pay Safe Assistant, a fast, friendly Bengali guide. Keep replies under 3 sentences.';
    }
  };

  const quickPrompts = [
    { label: '🔒 পিন সুরক্ষা', q: 'আমার একাউন্টের পিন ও ওটিপি কীভাবে সম্পূর্ণ নিরাপদ রাখবো?' },
    { label: '⚠️ স্ক্যাম SMS', q: 'উপহার বা লটারির ভুয়া এসএমএস ও কল চিনবো কীভাবে?' },
    { label: '💰 ক্যাশ আউট খরচ', q: 'উপায় বা এমএফএসে ক্যাশ আউট চার্জ কমানোর সেরা উপায় কী?' },
    { label: '📈 ডিপিএস সঞ্চয়', q: 'প্রতিমাসে ক্ষুদ্র সঞ্চয় বা ডিজিটাল সমিতি কীভাবে করব?' }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text:
        language === 'bn'
          ? 'আসসালামু আলাইকুম! আমি রিকার্শন পে সেফ এআই সহকারী। আর্থিক নিরাপত্তা বা লেনদেন বিষয়ে প্রশ্ন করুন, পলকের মধ্যে উত্তর পাবেন।'
          : 'Hello! I am your Recursion Pay Safe AI assistant. Ask me anything for fast, secure financial guidance.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputVal).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: q
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInputVal('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5500);

      const res = await fetch('/api/ai/multi-turn-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          systemInstruction: getSystemInstruction(),
          messages: newThread.map((m) => ({ role: m.role, text: m.text }))
        }),
        signal: controller.signal
      });
      clearTimeout(timer);

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setMessages([
          ...newThread,
          {
            id: `ai_${Date.now()}`,
            role: 'model',
            text: data.reply || 'আপনার তথ্য সুরক্ষিত রয়েছে। নিরাপদ লেনদেন বজায় রাখুন।'
          }
        ]);
      } else {
        setMessages([
          ...newThread,
          {
            id: `ai_${Date.now()}`,
            role: 'model',
            text: 'আপনার প্রশ্নের প্রেক্ষিতে: লেনদেনের নিরাপত্তা নিশ্চিত করতে আপনার পিন নম্বর কখনোই কাউকে জানাবেন না।'
          }
        ]);
      }
    } catch {
      setMessages([
        ...newThread,
        {
          id: `ai_${Date.now()}`,
          role: 'model',
          text: 'যেকোনো অপরিচিত কল বা এসএমএসে পিন/ওটিপি শেয়ার করবেন না। রিকার্শন পে হেল্পলাইন ১৬২১৬ সর্বদা সক্রিয়।'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0B4DA2] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h2 className="text-sm font-bold">
                {language === 'bn' ? 'মাল্টি-টার্ন জেমিনাই চ্যাটবট' : 'Multi-Turn Gemini Chatbot'}
              </h2>
              <span className="text-[10px] text-sky-200">
                কনভারসেশন হিস্টরি ও সিস্টেম রোল
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            ✕
          </button>
        </div>

        {/* Model & Role Controls Bar */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
          {/* Model Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold text-[11px]">মডেল:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-[#0B4DA2] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ⚡ 3.8-Flash (আল্ট্রা ফাস্ট)
              </button>
              <button
                onClick={() => setSelectedModel('gemini-flash-latest')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  selectedModel === 'gemini-flash-latest'
                    ? 'bg-[#0B4DA2] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🚀 Flash-Latest
              </button>
            </div>
          </div>

          {/* Role / System Instruction Switcher */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/80">
            <span className="text-slate-500 font-bold text-[11px]">এআই রোল:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedRole('security')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                  selectedRole === 'security' ? 'bg-rose-100 text-rose-800' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                🛡️ সাইবার সিকিউরিটি
              </button>
              <button
                onClick={() => setSelectedRole('financial')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                  selectedRole === 'financial' ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                📈 আর্থিক প্ল্যানার
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Thread */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-[#F8F9FA]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#0B4DA2] text-white rounded-br-none shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-white text-slate-500 border border-slate-200 text-xs flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#0B4DA2] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#0B4DA2] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#0B4DA2] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px] text-slate-400 font-semibold ml-1">দ্রুত উত্তর তৈরি হচ্ছে...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(p.q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-[10.5px] font-bold text-slate-700 hover:text-[#0B4DA2] active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="আপনার প্রশ্ন লিখুন (যেমন: অচেনা নম্বর থেকে ওটিপি চাইলে কী করব?)..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#0B4DA2]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-[#0B4DA2] text-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
