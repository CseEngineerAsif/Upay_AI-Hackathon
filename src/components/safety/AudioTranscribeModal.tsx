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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
    setTranscribing(true);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const res = await fetch('/api/ai/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: audioBlob.type || 'audio/webm',
            prompt: 'Transcribe this voice audio accurately in Bengali or English word-for-word.'
          })
        });

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setTranscribedText(data.text || '');
        } else {
          setErrorMsg('ট্রান্সক্রিপশন প্রক্রিয়া সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
        }
        setTranscribing(false);
      };
      reader.readAsDataURL(audioBlob);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMsg(err.message || 'অডিও প্রক্রিয়া করতে সমস্যা হয়েছে');
      setTranscribing(false);
    }
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
              <span className="text-[10px] text-slate-500">model: gemini-3.5-transcribe</span>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 text-center">
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'bn'
              ? 'মাইক্রোফোন চেপে বাংলায় কথা বলুন (যেমন: "চা নাস্তার জন্য তানভীরকে ৫০০ টাকা পাঠানো হলো")। এআই মডেল সঠিক বাংলা লেখায় রূপান্তর করবে।'
              : 'Record audio via mic. Gemini-3.5-transcribe will convert spoken words to text.'}
          </p>

          {/* Record Button */}
          <div className="flex flex-col items-center justify-center py-2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all active:scale-95 ${
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

          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}

          {/* Audio playback & Transcribe trigger */}
          {audioUrl && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <audio src={audioUrl} controls className="w-full h-9" />
              <button
                onClick={handleTranscribe}
                disabled={transcribing}
                className="w-full py-2.5 rounded-xl bg-[#0B4DA2] text-white font-bold text-xs shadow-md active:scale-98 disabled:opacity-50"
              >
                {transcribing ? 'ট্রান্সক্রাইব করা হচ্ছে...' : 'gemini-3.5-transcribe চালান'}
              </button>
            </div>
          )}

          {/* Transcribed Output */}
          {transcribedText && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2 animate-fade-in">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                রূপান্তরিত বাংলা লেখা:
              </span>
              <p className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-xl border border-emerald-100">
                "{transcribedText}"
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transcribedText);
                    alert('কপি করা হয়েছে!');
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  কপি করুন
                </button>
                <button
                  onClick={() => {
                    onClose();
                    setCurrentModal('send_money');
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-[#0B4DA2] text-white font-bold text-xs"
                >
                  লেনদেনে ব্যবহার করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
