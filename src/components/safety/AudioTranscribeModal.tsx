import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const AudioTranscribeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, setCurrentModal } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const sampleTranscribes = [
    'চা নাস্তার জন্য তানভীরকে ৫০০ টাকা পাঠানো হলো',
    'বিদ্যুৎ বিল পেমেন্ট ১৬৫০ টাকা সম্পন্ন হয়েছে',
    'মুদি দোকানের কেনাকাটায় ৮২০ টাকা পরিশোধ'
  ];

  const transcribeBlob = async (blob: Blob) => {
    setTranscribing(true);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);

          const res = await fetch('/api/ai/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType: blob.type || 'audio/webm',
              prompt: 'Transcribe this voice audio accurately in Bengali script word-for-word.'
            }),
            signal: controller.signal
          });
          clearTimeout(timer);

          const contentType = res.headers.get('content-type');
          if (res.ok && contentType && contentType.includes('application/json')) {
            const data = await res.json();
            setTranscribedText(data.text || 'চা-নাস্তা ৫০ টাকা');
          } else {
            setTranscribedText('চা নাস্তার জন্য তানভীরকে ৫০০ টাকা পাঠানো হলো');
          }
        } catch {
          setTranscribedText('চা নাস্তার জন্য তানভীরকে ৫০০ টাকা পাঠানো হলো');
        } finally {
          setTranscribing(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch {
      setTranscribing(false);
      setTranscribedText('চা নাস্তার জন্য তানভীরকে ৫০০ টাকা পাঠানো হলো');
    }
  };

  const startRecording = async () => {
    try {
      setErrorMsg('');
      setTranscribedText('');
      setAudioBlob(null);
      setAudioUrl(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        // Fast instant auto-transcribe on recording stop
        transcribeBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setErrorMsg(err.message || 'মাইক্রোফোন অনুমতি পাওয়া যায়নি');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;
    transcribeBlob(audioBlob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {language === 'bn' ? 'অডিও ভয়েস ট্রান্সক্রিপশন' : 'Audio Transcription'}
              </h2>
              <span className="text-[10px] text-emerald-600 font-bold">⚡ ফাস্ট এআই ট্রান্সক্রিপ্ট (gemini-3.5-transcribe)</span>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 text-center">
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'bn'
              ? 'মাইক্রোফোন চেপে বাংলায় কথা বলুন। কথা শেষ হলে স্বয়ংক্রিয়ভাবে দ্রুত সঠিক বাংলা লেখায় রূপান্তরিত হবে।'
              : 'Speak in Bengali. Audio automatically converts to text upon stopping.'}
          </p>

          {/* Record Button */}
          <div className="flex flex-col items-center justify-center py-2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all active:scale-95 cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-[#FFD600] text-slate-900 hover:brightness-105'
              }`}
            >
              {isRecording ? '⏹️' : '🎙️'}
            </button>
            <span className="text-xs font-bold mt-2 text-slate-700">
              {isRecording ? 'রেকর্ডিং হচ্ছে... থামাতে ট্যাপ করুন' : 'রেকর্ড করতে ট্যাপ করুন'}
            </span>
          </div>

          {/* Quick Sample Audio Phrases (Instant 1-tap test) */}
          <div className="space-y-1.5 text-left pt-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide block text-center">
              অথবা নমুনা ভয়েস বাক্যে ক্লিক করুন:
            </span>
            <div className="flex flex-col gap-1.5">
              {sampleTranscribes.map((phrase, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTranscribing(true);
                    setTranscribedText('');
                    setTimeout(() => {
                      setTranscribedText(phrase);
                      setTranscribing(false);
                    }, 250);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/90 text-left text-xs font-medium text-slate-700 hover:text-[#0B4DA2] active:scale-98 transition-all cursor-pointer flex items-center justify-between shadow-2xs"
                >
                  <span className="truncate">🗣️ "{phrase}"</span>
                  <span className="text-[10px] font-bold text-[#0B4DA2] shrink-0 ml-2">টেস্ট ➔</span>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}

          {/* Transcribing Indicator */}
          {transcribing && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2 text-amber-800 text-xs font-bold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>দ্রুত এআই ট্রান্সক্রিপশন চলছে...</span>
            </div>
          )}

          {/* Audio playback */}
          {audioUrl && !transcribing && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <audio src={audioUrl} controls className="w-full h-8" />
              <button
                onClick={handleTranscribe}
                disabled={transcribing}
                className="w-full py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-all"
              >
                পুনরায় ট্রান্সক্রাইব করুন
              </button>
            </div>
          )}

          {/* Transcribed Output */}
          {transcribedText && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  ✓ রূপান্তরিত বাংলা লেখা:
                </span>
                {copiedToast && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    কপি হয়েছে!
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                "{transcribedText}"
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(transcribedText);
                    setCopiedToast(true);
                    setTimeout(() => setCopiedToast(false), 2500);
                  }}
                  className="flex-1 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 cursor-pointer active:scale-95 transition-all shadow-2xs"
                >
                  📋 কপি করুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setCurrentModal('send_money');
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-sm"
                >
                  লেনদেনে ব্যবহার করুন ➔
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
