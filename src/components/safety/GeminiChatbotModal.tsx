import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const GeminiChatbotModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language } = useAppStore();
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.8-flash');
  const [selectedRole, setSelectedRole] = useState<'security' | 'financial' | 'general'>('security');

  const getSystemInstruction = () => {
    switch (selectedRole) {
      case 'security':
        return 'You are an elite Cyber Threat & MFS Fraud Analyst for Recursion Pay Safe. You specialize in analyzing complex fraud rings, mule accounts, phishing schemes, and social engineering in Bangladesh. Provide deep forensic security analysis in Bengali.';
      case 'financial':
        return 'You are a certified Financial Planner for Bangladeshi MFS users. You give practical advice on budgeting, micro-savings, inflation management, and emergency funds in warm, respectful Bengali.';
      default:
        return 'You are Recursion Pay Safe Assistant, a friendly and accurate guide for all Recursion Pay MFS features and services in Bengali.';
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text:
        language === 'bn'
          ? 'আসসালামু আলাইকুম! আমি রিকার্শন পে সেফ মাল্টি-টার্ন এআই চ্যাটবট। আপনার যেকোনো জটিল আর্থিক বা নিরাপত্তা প্রশ্ন বিস্তারিতভাবে করতে পারেন।'
          : 'Hello! I am your Recursion Pay Safe multi-turn assistant. Ask me anything about complex MFS transactions, security, or financial plans.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputVal;
    if (!q.trim()) return;

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
      const res = await fetch('/api/ai/multi-turn-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          systemInstruction: getSystemInstruction(),
          messages: newThread.map((m) => ({ role: m.role, text: m.text }))
        })
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setMessages([
          ...newThread,
          {
            id: `ai_${Date.now()}`,
            role: 'model',
            text: data.reply || 'আপনার তথ্য প্রক্রিয়া করা হয়েছে।'
          }
        ]);
      } else {
        setMessages([
          ...newThread,
          {
            id: `ai_${Date.now()}`,
            role: 'model',
            text: 'নেটওয়ার্ক সংযোগ সাময়িক সমস্যায় পড়েছে। দয়া করে পুনরায় চেষ্টা করুন।'
          }
        ]);
      }
    } catch {
      setMessages([
        ...newThread,
        {
          id: `ai_${Date.now()}`,
          role: 'model',
          text: 'সার্ভারের সাথে সংযোগ বিঘ্নিত হয়েছে।'
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
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
          {/* Model Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold text-[11px]">মডেল নির্বাচন:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-[#0B4DA2] text-white'
                    : 'bg-white border text-slate-600'
                }`}
              >
                Flash-Lite (Fast)
              </button>
              <button
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-[#0B4DA2] text-white'
                    : 'bg-white border text-slate-600'
                }`}
              >
                3.8-Flash (General)
              </button>
              <button
                onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-[#0B4DA2] text-white'
                    : 'bg-white border text-slate-600'
                }`}
              >
                3.1-Pro (Complex)
              </button>
            </div>
          </div>

          {/* Role / System Instruction Switcher */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
            <span className="text-slate-500 font-bold text-[11px]">এআই রোল:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedRole('security')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  selectedRole === 'security' ? 'bg-rose-100 text-rose-800' : 'bg-white text-slate-600'
                }`}
              >
                🛡️ সাইবার সিকিউরিটি
              </button>
              <button
                onClick={() => setSelectedRole('financial')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  selectedRole === 'financial' ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600'
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
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
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
