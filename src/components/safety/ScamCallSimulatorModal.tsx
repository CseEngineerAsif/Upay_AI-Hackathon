import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface Scene {
  id: string;
  callerName: string;
  callerNumber: string;
  scenarioTitleBn: string;
  scriptBn: string;
  dangerKeywords: string[];
  warningBn: string;
}

const SCENES: Scene[] = [
  {
    id: 'fake_agent',
    callerName: 'উপায় হেড অফিস (অজ্ঞাত)',
    callerNumber: '01700000000',
    scenarioTitleBn: 'ভুয়া উপায় এজেন্ট — পিন ও ওটিপি চাওয়া',
    scriptBn: 'হ্যালো স্যার, উপায় প্রধান কার্যালয় থেকে বলছি। আপনার অ্যাকাউন্টে একটি জরুরি সিকিউরিটি আপডেট এসেছে। এখনই আপনার ৪ ডিজিটের পিন বলুন, নয়তো এখনই আপনার অ্যাকাউন্ট বন্ধ হয়ে যাবে।',
    dangerKeywords: ['উপায় প্রধান কার্যালয়', 'জরুরি সিকিউরিটি আপডেট', 'পিন বলুন', 'অ্যাকাউন্ট বন্ধ'],
    warningBn: 'প্রতারক কর্মকর্তা সেজে জরুরি ভয় দেখিয়ে আপনার পিন চুরি করার চেষ্টা করছে। উপায় কখনোই গ্রাহকের পিন বা ওটিপি জানতে চায় না।'
  },
  {
    id: 'lottery_tax',
    callerName: 'বাংলাদেশ লটারি পরিষদ',
    callerNumber: '01999999999',
    scenarioTitleBn: 'লটারির ২৫ লাখ টাকার ভুয়া ট্যাক্স ফি',
    scriptBn: 'অভিনন্দন ভাই! আপনি গ্র্যান্ড লটারিতে ২৫ লাখ টাকা ক্যাশ পুরস্কার জিতেছেন। টাকা আপনার উপায় নম্বরে পেতে হলে এখনই ৫ হাজার টাকা সরকারি ট্যাক্স ফি অগ্রিম পাঠান।',
    dangerKeywords: ['২৫ লাখ টাকা', 'ক্যাশ পুরস্কার', 'ট্যাক্স ফি', 'অগ্রিম পাঠান'],
    warningBn: 'লটারি বা পুরস্কারের কথা বলে অগ্রিম যেকোনো ধরনের ফি দাবি করাই স্পষ্ট প্রতারণা। কাউকে অগ্রিম টাকা পাঠাবেন না।'
  },
  {
    id: 'hospital_emergency',
    callerName: 'জরুরি হাসপাতাল হেল্পলাইন',
    callerNumber: '01812345678',
    scenarioTitleBn: 'হাসপাতালে জরুরি রক্তের জন্য টাকা দাবি',
    scriptBn: 'জরুরি বার্তা! আপনার এক নিকটাত্মীয় সড়ক দুর্ঘটনায় গুরুতর আহত হয়েছেন। দ্রুত অপারেশনের ওষুধ কিনতে এখনই এই নম্বরে ১৫ হাজার টাকা সেন্ড মানি করুন।',
    dangerKeywords: ['নিকটাত্মীয় সড়ক দুর্ঘটনা', 'দ্রুত অপারেশনের', '১৫ হাজার টাকা সেন্ড মানি'],
    warningBn: 'মানসিকভাবে আতঙ্কিত করে টাকা আদায়ের কৌশল। আগে নিজে সরাসরি আত্মীয় বা পরিবারকে ফোন করে সত্যতা নিশ্চিত হোন।'
  }
];

export const ScamCallSimulatorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language } = useAppStore();
  const [selectedScene, setSelectedScene] = useState<Scene>(SCENES[0]);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'active'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [detectedTrigger, setDetectedTrigger] = useState<string | null>(null);

  // Audio speech synthesis helper
  const speakBengali = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Attempt to pick Bengali voice if installed, otherwise system default
      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(v => v.lang.includes('bn') || v.lang.includes('Bengali'));
      if (bnVoice) utterance.voice = bnVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === 'active') {
      timer = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startSimulation = (scene: Scene) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSelectedScene(scene);
    setCallState('ringing');
    setSeconds(0);
    setDetectedTrigger(null);
  };

  const handleAnswer = () => {
    setCallState('active');
    // Start audio speech
    speakBengali(selectedScene.scriptBn);

    // Simulate real-time keyword detection triggers
    setTimeout(() => {
      setDetectedTrigger(selectedScene.dangerKeywords[2] || selectedScene.dangerKeywords[0]);
    }, 2500);
  };

  const handleHangUp = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('idle');
    setSeconds(0);
    setIsSpeaking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-slate-900 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <div>
              <h2 className="text-sm font-bold text-white">
                {language === 'bn' ? 'স্ক্যাম কল সিমুলেটর' : 'Scam Call Audio Simulator'}
              </h2>
              <span className="text-[10px] text-slate-400">বাস্তবমুখী অডিও ও কি-ওয়ার্ড সতর্কতা</span>
            </div>
          </div>
          <button
            onClick={() => {
              handleHangUp();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          {callState === 'idle' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'বাংলাদেশে সবচেয়ে বেশি ঘটা ৩টি প্রতারণামূলক কলের অডিও শুনুন এবং কীভাবে প্রতারকরা পিন হাতিয়ে নেয় তা জানুন:'
                  : 'Experience realistic Bangla audio scam calls to train your awareness:'}
              </p>

              <div className="space-y-2">
                {SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => startSimulation(scene)}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-all group flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-yellow-400 block">
                        {scene.scenarioTitleBn}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        {scene.callerName} ({scene.callerNumber})
                      </span>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-[#0B4DA2] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                      📞
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INCOMING RINGING CALL */}
          {callState === 'ringing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-yellow-400/50 flex items-center justify-center text-4xl animate-bounce">
                👤
              </div>

              <div>
                <h3 className="text-lg font-black text-white">
                  {selectedScene.callerName}
                </h3>
                <p className="text-xs text-yellow-400 font-mono mt-1">
                  {selectedScene.callerNumber} • ইনকামিং কল...
                </p>
              </div>

              <div className="flex items-center gap-12 pt-6">
                {/* Decline Button */}
                <button
                  onClick={handleHangUp}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center text-2xl shadow-lg active:scale-95">
                    📵
                  </div>
                  <span className="text-xs text-slate-400">কেটে দিন</span>
                </button>

                {/* Answer Button */}
                <button
                  onClick={handleAnswer}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-2xl shadow-lg active:scale-95 animate-pulse">
                    📞
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">রিসিভ করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE CALL WITH SPEECH SYNTHESIS & KEYWORD DETECTION */}
          {callState === 'active' && (
            <div className="py-4 space-y-4 animate-fade-in">
              {/* Call Status Header */}
              <div className="text-center space-y-1">
                <span className="text-xs text-slate-400 font-mono">
                  চলতি কল: 00:{seconds.toString().padStart(2, '0')}
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedScene.callerName}
                </h3>
                {isSpeaking && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-yellow-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                    প্রতারক কথা বলছে (ভয়েস অডিও চালু)...
                  </span>
                )}
              </div>

              {/* Spoken Script with Keyword Highlights */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200 leading-relaxed">
                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  অডিও সংলাপ (Bengali Script):
                </span>
                <p className="italic">"{selectedScene.scriptBn}"</p>
              </div>

              {/* REAL-TIME KEYWORD DETECTION WARNING BANNER */}
              {detectedTrigger && (
                <div className="p-3.5 rounded-2xl bg-rose-600/90 border-2 border-rose-400 text-white space-y-1.5 animate-shield-pulse">
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    <span>🚨</span>
                    <span>সতর্কতা: বিপজ্জনক কি-ওয়ার্ড শনাক্ত হয়েছে!</span>
                  </div>
                  <p className="text-[11px] font-bold bg-black/25 px-2 py-1 rounded-lg">
                    শনাক্তকৃত শব্দ: "{detectedTrigger}"
                  </p>
                  <p className="text-[11px] text-rose-100 leading-tight">
                    {selectedScene.warningBn}
                  </p>
                </div>
              )}

              {/* End Call Button */}
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleHangUp}
                  className="px-6 py-3 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 hover:bg-rose-700 transition-all"
                >
                  <span>📵</span>
                  <span>কলটি কেটে দিন (Hang Up)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
