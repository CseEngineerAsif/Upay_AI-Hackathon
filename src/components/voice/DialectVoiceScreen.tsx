import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DialectVoiceIntent, DialectSamplePhrase } from '../../types/dialectVoice';
import {
  DIALECT_SAMPLES,
  normalizeDialectWithAi,
  speakConfirmationAloud
} from '../../utils/dialectVoiceManager';

export const DialectVoiceScreen: React.FC = () => {
  const { language } = useAppStore();

  // Voice Recognition States
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [manualText, setManualText] = useState('');
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Intent State
  const [intent, setIntent] = useState<DialectVoiceIntent | null>(null);

  // Confirmation & PIN Security Flow
  // Step: 'input' -> 'confirm_amount' -> 'pin_security' -> 'completed'
  const [flowStep, setFlowStep] = useState<'input' | 'confirm_amount' | 'pin_security' | 'completed'>('input');
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition support in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenText(transcript);
        handleProcessSpeech(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setToastMsg('মাইক্রোফোন সংযোগে সমস্যা। আপনি নিচে লিখে বা নমুনা বাটনে ক্লিক করে চেষ্টা করতে পারেন।');
        setTimeout(() => setToastMsg(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const handleStartListening = () => {
    if (recognitionRef.current) {
      try {
        setSpokenText('');
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    } else {
      setToastMsg('আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট নেই। নিচের টেক্সট ইনপুট ব্যবহার করুন।');
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleProcessSpeech = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    setIsProcessingAi(true);
    try {
      const parsed = await normalizeDialectWithAi(textToProcess);
      setIntent(parsed);
      setFlowStep('confirm_amount');

      // AMOUNT CONFIRMATION: Read amount aloud using Speech Synthesis (Core Requirement)
      const speechPrompt = `${parsed.recipientName}-কে ${parsed.amount} টাকা পাঠানোর জন্য নিশ্চিত করুন।`;
      speakConfirmationAloud(speechPrompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleSelectSample = (sample: DialectSamplePhrase) => {
    setSpokenText(sample.phrase);
    handleProcessSpeech(sample.phrase);
  };

  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + digit;
      setEnteredPin(next);
      if (next.length === 4) {
        // Verify PIN simulation
        setTimeout(() => {
          setFlowStep('completed');
          setToastMsg('✓ লেনদেন সফল হয়েছে!');
        }, 500);
      }
    }
  };

  const handleReset = () => {
    setSpokenText('');
    setManualText('');
    setIntent(null);
    setFlowStep('input');
    setEnteredPin('');
    setPinError(false);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Banner (Min-height 96-110px, unclipped, normal flow) */}
      <div className="w-full min-h-[96px] sm:min-h-[104px] h-auto shrink-0 bg-gradient-to-r from-[#0B4DA2] via-[#09356E] to-[#0B4DA2] text-white px-4 py-5 shadow-md relative">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
                🎙️
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <h1 className="text-[19px] font-black tracking-tight text-white leading-tight">
                    {language === 'bn' ? 'আঞ্চলিক ভাষা ভয়েস পে' : 'Dialect Voice Pay'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFD600] text-slate-950 text-[10px] font-black uppercase tracking-wide shrink-0">
                    AI Speech
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium leading-snug mt-1">
                  {language === 'bn'
                    ? 'চাটগাঁইয়া, সিলেটি, নোয়াখাইল্লা ও রংপুরিয়া উপভাষায় নিরাপদ পেমেন্ট'
                    : 'Bangla Dialects Recognition with Voice Confirmation & PIN Security'}
                </p>
              </div>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 shrink-0">
              bn-BD
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs">
          {toastMsg}
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4 text-xs">
        {/* ================= STEP 1: VOICE INPUT ================= */}
        {flowStep === 'input' && (
          <div className="space-y-4">
            {/* Mic Circle Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center justify-center space-y-4 text-center">
              <span className="text-xs font-bold text-slate-500">
                মাইক্রোফোনে চাপ দিয়ে যেকোনো আঞ্চলিক ভাষায় বলুন
              </span>

              {/* Pulsing Mic Button */}
              <div className="relative">
                {isListening && (
                  <div className="w-24 h-24 rounded-full bg-rose-500/30 animate-ping absolute inset-0 -m-2" />
                )}
                <button
                  type="button"
                  onClick={isListening ? handleStopListening : handleStartListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform active:scale-90 cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white border-4 border-rose-300'
                      : 'bg-[#0B4DA2] text-white hover:bg-blue-800'
                  }`}
                >
                  {isListening ? '⏹️' : '🎙️'}
                </button>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-xs text-slate-900 block">
                  {isListening ? 'বলুন, শুনছি...' : 'ট্যাপ করে কথা বলুন'}
                </span>
                <span className="text-[10px] text-slate-400">
                  যেমন: "রহিমরে পাঁচশ টিয়া পাঠাই দেও" বা "করিমর গেসে এক হাজার টেকা পাঠাউক্কা"
                </span>
              </div>

              {isProcessingAi && (
                <div className="flex items-center gap-2 text-[#0B4DA2] font-bold text-xs pt-1">
                  <span className="w-3.5 h-3.5 border-2 border-[#0B4DA2] border-t-transparent rounded-full animate-spin" />
                  <span>আঞ্চলিক ভাষা বিশ্লেষণ ও ডিকোড হচ্ছে...</span>
                </div>
              )}
            </div>

            {/* Quick Sample Dialect Chips (For instant testing) */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  বাটন চেপে আঞ্চলিক উপভাষা পরীক্ষা করুন:
                </span>
                <span className="text-[10px] text-slate-400">১-ক্লিক ট্রায়াল</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {DIALECT_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-[#0B4DA2] font-black text-[9px]">
                          {sample.regionBn}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          "{sample.phrase}"
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        অর্থ: {sample.meaningBn} (৳{sample.expectedAmount})
                      </span>
                    </div>
                    <span className="text-slate-400 font-bold text-xs">➔</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FALLBACK TEXT INPUT (Core Requirement) */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="font-bold text-slate-900 text-xs block">
                ⌨️ মাইক্রোফোন কাজ না করলে লিখে দিন (Text Fallback):
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="যেমন: রহিমরে পাঁচশ টেকা হাডাই দেন"
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0B4DA2]"
                />
                <button
                  type="button"
                  onClick={() => handleProcessSpeech(manualText)}
                  className="px-4 py-2 rounded-xl bg-[#0B4DA2] text-white font-black text-xs cursor-pointer active:scale-95"
                >
                  যাচাই
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: AMOUNT CONFIRMATION (Core Requirement) ================= */}
        {flowStep === 'confirm_amount' && intent && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  শনাক্তকৃত উপভাষা ও নির্দেশ
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0B4DA2] font-black text-xs">
                    {intent.detectedDialectBn}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">({intent.actionBn})</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => speakConfirmationAloud(`${intent.recipientName}-কে ${intent.amount} টাকা পাঠানোর জন্য নিশ্চিত করুন।`)}
                className="w-8 h-8 rounded-full bg-blue-50 text-[#0B4DA2] border border-blue-200 flex items-center justify-center text-sm cursor-pointer"
                title="উচ্চস্বরে শুনুন"
              >
                🔊
              </button>
            </div>

            {/* Spoken Quote */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 italic text-[11px]">
              কথিত বাক্য: "{intent.rawSpokenText}"
            </div>

            {/* LARGE TEXT AMOUNT CONFIRMATION (Core Requirement) */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase block tracking-wider">
                নির্ধারিত টাকার পরিমাণ (Amount)
              </span>
              <h2 className="font-mono font-black text-4xl text-amber-950 tracking-tight">
                ৳{intent.amount.toLocaleString()}
              </h2>
              <span className="text-xs font-bold text-slate-700 block mt-1">
                প্রাপক: <strong>{intent.recipientName}</strong>
              </span>
            </div>

            {/* Safety Notice */}
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[10px] text-indigo-950 flex items-center gap-2">
              <span className="text-base">🔒</span>
              <span>
                <strong>নিরাপত্তা নীতি:</strong> ভয়েস দিয়ে সরাসরি টাকা কাটা হয় না। নিশ্চিত করার পর গোপন পিন দেওয়া আবশ্যক।
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer active:scale-95"
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                onClick={() => setFlowStep('pin_security')}
                className="py-3 rounded-2xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>সঠিক, পিন দিন</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PIN SECURITY STEP (Core Requirement) ================= */}
        {flowStep === 'pin_security' && intent && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-4 animate-scale-up">
            <div className="text-center space-y-1">
              <span className="text-2xl">🔐</span>
              <h3 className="font-black text-slate-900 text-sm">
                গোপন পিন দিয়ে লেনদেন নিশ্চিত করুন
              </h3>
              <p className="text-[11px] text-slate-500">
                {intent.recipientName}-কে <strong>৳{intent.amount}</strong> পাঠানো হচ্ছে
              </p>
            </div>

            {/* 4-Digit PIN Dots */}
            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    enteredPin.length > idx
                      ? 'bg-[#0B4DA2] border-[#0B4DA2] scale-110'
                      : 'bg-white border-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Simulated Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-[260px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinDigit(digit)}
                  className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono font-bold text-base shadow-2xs active:scale-90 transition-all cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setEnteredPin('')}
                className="h-12 rounded-2xl bg-rose-50 text-rose-700 font-bold text-xs cursor-pointer active:scale-90"
              >
                মুছুন
              </button>
              <button
                type="button"
                onClick={() => handlePinDigit('0')}
                className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono font-bold text-base shadow-2xs active:scale-90 transition-all cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  // Simulate biometric touch
                  setEnteredPin('1234');
                  setTimeout(() => setFlowStep('completed'), 400);
                }}
                className="h-12 rounded-2xl bg-emerald-50 text-emerald-800 font-bold text-xs cursor-pointer active:scale-90 flex items-center justify-center"
                title="বায়োমেট্রিক ফিঙ্গারপ্রিন্ট"
              >
                👆 বায়ো
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: COMPLETED RECEIPT ================= */}
        {flowStep === 'completed' && intent && (
          <div className="p-6 rounded-3xl bg-white border border-emerald-300 shadow-xl text-center space-y-4 animate-scale-up">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 text-2xl flex items-center justify-center mx-auto border-2 border-emerald-300">
              ✓
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                ভয়েস কমান্ডে লেনদেন সফল!
              </span>
              <h3 className="font-mono font-black text-3xl text-slate-900">
                ৳{intent.amount.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                প্রাপক: <strong>{intent.recipientName}</strong>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-left space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>ব্যবহৃত উপভাষা:</span>
                <span className="font-bold text-[#0B4DA2]">{intent.detectedDialectBn}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>ট্রানজেকশন আইডি:</span>
                <span className="font-mono font-bold text-slate-900">UPAY-V{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>নিরাপত্তা স্তর:</span>
                <span className="font-bold text-emerald-700">ভয়েস + পিন ভেরিফাইড ✓</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 rounded-2xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              নতুন ভয়েস লেনদেন করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
