import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const VoiceConversationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // PCM Conversion Helpers
  const pcmToBase64 = (float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const bytes = new Uint8Array(int16Array.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playPcmChunk = (base64Data: string) => {
    try {
      if (!playbackContextRef.current) {
        playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const ctx = playbackContextRef.current;
      const binary = atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      setIsTalking(true);
      source.onended = () => setIsTalking(false);
    } catch (e) {
      console.error('Error playing audio chunk', e);
    }
  };

  const startVoiceSession = async () => {
    try {
      setErrorMsg('');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsConnected(true);
        // Start Mic
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const inputCtx = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = inputCtx;

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const b64 = pcmToBase64(inputData);
            ws.send(JSON.stringify({ audio: b64 }));
          }
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.audio) {
            playPcmChunk(data.audio);
          }
          if (data.text) {
            setTranscriptText((prev) => prev + ' ' + data.text);
          }
          if (data.error) {
            setErrorMsg(data.error);
          }
        } catch (e) {
          console.error('Live message parse error', e);
        }
      };

      ws.onerror = (e) => {
        console.error('Live WS error', e);
        setErrorMsg('লাইভ সেশন সংযোগে সমস্যা হয়েছে।');
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch (err: any) {
      console.error('Microphone or connection failed:', err);
      setErrorMsg(err.message || 'মাইক্রোফোন অনুমতি প্রদান করুন');
    }
  };

  const stopVoiceSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    setIsTalking(false);
  };

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2">
      <div className="w-full max-w-[420px] bg-slate-900 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <div>
              <h2 className="text-sm font-bold">
                {language === 'bn' ? 'রিয়েলটাইম ভয়েস কনভারসেশন' : 'Gemini 3.8 Live Voice'}
              </h2>
              <span className="text-[10px] text-yellow-400">Gemini-3.8-Live API (বাংলা কথোপকথন)</span>
            </div>
          </div>
          <button
            onClick={() => {
              stopVoiceSession();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Voice Visualizer Area */}
        <div className="p-8 flex flex-col items-center justify-center space-y-6">
          <div className="relative flex items-center justify-center">
            {/* Animated Pulses */}
            {isConnected && (
              <>
                <div className={`absolute w-44 h-44 rounded-full border border-yellow-400/40 animate-ping [animation-duration:3s] ${isTalking ? 'opacity-100' : 'opacity-40'}`} />
                <div className={`absolute w-36 h-36 rounded-full bg-[#0B4DA2]/30 animate-pulse`} />
              </>
            )}

            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl shadow-xl transition-all ${
                isConnected
                  ? isTalking
                    ? 'bg-[#FFD600] text-slate-950 scale-105'
                    : 'bg-[#0B4DA2] text-white'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isConnected ? (isTalking ? '🗣️' : '🎧') : '🎙️'}
            </div>
          </div>

          <div className="text-center space-y-1.5">
            <h3 className="text-base font-bold text-white">
              {isConnected
                ? isTalking
                  ? (language === 'bn' ? 'উপায় সেফ কথা বলছে...' : 'Gemini is speaking...')
                  : (language === 'bn' ? 'শুনছি... আপনার প্রশ্ন বলুন' : 'Listening... Speak in Bengali')
                : (language === 'bn' ? 'ভয়েস কথোপকথন শুরু করুন' : 'Start Live Voice Session')}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs">
              {language === 'bn'
                ? 'বাংলায় সরাসরি লেনদেন যাচাই বা যেকোনো আর্থিক নিরাপত্তা পরামর্শ চান'
                : 'Direct two-way voice stream powered by model gemini-3.8-live'}
            </p>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800 px-3 py-1.5 rounded-xl text-center">
              {errorMsg}
            </p>
          )}

          {transcriptText && (
            <div className="w-full p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 max-h-24 overflow-y-auto">
              <span className="text-[10px] text-yellow-400 font-bold block mb-1">লাইভ রেসপন্স:</span>
              <p>{transcriptText}</p>
            </div>
          )}

          {/* Action Button */}
          <div>
            {!isConnected ? (
              <button
                onClick={startVoiceSession}
                className="px-6 py-3 rounded-full bg-[#FFD600] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 hover:brightness-105 transition-all"
              >
                <span>🎙️</span>
                <span>{language === 'bn' ? 'লাইভ কথোপকথন সংযুক্ত করুন' : 'Connect Gemini Live'}</span>
              </button>
            ) : (
              <button
                onClick={stopVoiceSession}
                className="px-6 py-3 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 hover:bg-rose-700 transition-all"
              >
                <span>⏹️</span>
                <span>{language === 'bn' ? 'সংযোগ বিচ্ছিন্ন করুন' : 'Disconnect'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
