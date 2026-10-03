import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export const AiChatAssistantModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, transactions, language } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: language === 'bn'
        ? 'আসসালামু আলাইকুম! আমি রিকার্শন পে সেফ এআই সহকারী। আপনার মাসিক খরচ, নিরাপত্তা ও সঞ্চয় সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।'
        : 'Hello! I am your Recursion Pay Safe AI Assistant. Ask me anything about your spending, savings, or safety.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    'গত মাসে খাবারে কত খরচ হয়েছে?',
    'আমার বর্তমান ব্যালেন্স কত?',
    'আমার মোট সঞ্চয় কত?',
    'পিন কীভাবে নিরাপদ রাখব?'
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputVal;
    if (!q.trim()) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: q }];
    setMessages(newMsgs);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          userContext: {
            balance: user?.balance,
            userName: user?.name,
            transactions: transactions.slice(0, 15)
          }
        })
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setMessages([...newMsgs, { sender: 'assistant', text: data.reply || 'আপনার তথ্যাদি সুরক্ষিত রয়েছে।' }]);
      } else {
        setMessages([
          ...newMsgs,
          {
            sender: 'assistant',
            text: 'আপনার লেনদেন তথ্যাদি সংরক্ষিত রয়েছে। আপনার পিন বা ওটিপি কখনোই কাউকে শেয়ার করবেন না।'
          }
        ]);
      }
    } catch {
      setMessages([
        ...newMsgs,
        {
          sender: 'assistant',
          text: 'নেটওয়ার্ক সংযোগ বিঘ্নিত হয়েছে। তবে আপনার ব্যালেন্স ও তথ্য সুরক্ষিত।'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0B4DA2] to-[#1866CD] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-yellow-300">
              🤖
            </div>
            <div>
              <h2 className="text-sm font-bold">
                {language === 'bn' ? 'রিকার্শন পে সেফ এআই সহকারী' : 'Recursion Pay Safe AI Assistant'}
              </h2>
              <span className="text-[10px] text-sky-200">বাংলা ফিন্যান্সিয়াল চ্যাটবট</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
          >
            ✕
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-[#F8F9FA]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#0B4DA2] text-white rounded-br-none shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                }`}
              >
                {m.text}
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
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto no-scrollbar flex gap-1.5">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
            >
              {q}
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
            placeholder={language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Ask a question...'}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#0B4DA2]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-[#0B4DA2] text-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
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
