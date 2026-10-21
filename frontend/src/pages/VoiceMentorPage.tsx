import { useState, useRef, useEffect } from 'react';
import api from '../lib/api';
import { Mic, MicOff, Volume2, RotateCcw, Send, Globe, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'ta', label: 'தமிழ்' },
];

const EXAMPLE_QUERIES = [
  { text: 'Mujhe samajh nahi aa raha ki mere liye kaunsa career sahi hai', lang: 'hi' },
  { text: 'Mere paas laptop nahi hai. Main kya seekh sakta hoon?', lang: 'hi' },
  { text: 'Scholarship ke liye kaunse documents chahiye?', lang: 'hi' },
  { text: 'What career suits someone good at math?', lang: 'en' },
  { text: 'Electrician training kaise karein?', lang: 'hi' },
];

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  note?: string;
}

export default function VoiceMentorPage() {
  const [language, setLanguage] = useState('en');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Namaste! I am your RaahSetu career guide. Ask me about careers, scholarships, learning resources, or required documents. You can type or use voice input.',
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendQuery = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai/voice-query', { text, language });
      const data = res.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.response,
        sources: data.sources_used,
        note: data.note,
      }]);
      // Optional TTS
      if ('speechSynthesis' in window && language === 'en') {
        const utt = new SpeechSynthesisUtterance(data.response);
        utt.lang = 'en-IN';
        utt.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'I could not process your question right now. Please try again or check your connection.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input not supported in this browser. Try Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    const langMap: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', mr: 'mr-IN', ta: 'ta-IN', or: 'or-IN' };
    recognition.lang = langMap[language] || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e: any) => {
      setListening(false);
      if (e.error === 'no-speech') toast.error('No speech detected. Try again.');
      else if (e.error === 'not-allowed') toast.error('Microphone permission denied.');
      else toast.error(`Voice error: ${e.error}`);
    };
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      sendQuery(transcript);
    };
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const speakLast = () => {
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistant && 'speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(lastAssistant.text);
      utt.lang = 'en-IN';
      utt.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-teal-400 text-sm font-medium mb-1">
          <Mic className="w-4 h-4" /> Voice Mentor
        </div>
        <h1 className="font-display font-bold text-2xl">Ask your career guide</h1>
        <p className="text-slate-400 text-xs mt-1">Type or speak in your preferred language. Answers come from RaahSetu's knowledge base.</p>
      </div>

      {/* Language selector */}
      <div className="flex gap-2 flex-wrap mb-3">
        {LANGUAGES.map(l => (
          <button key={l.code}
            onClick={() => setLanguage(l.code)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium border transition-all',
              language === l.code
                ? 'bg-teal-500/20 border-teal-500/40 text-teal-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            )}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Voice capability notice */}
      {!speechSupported && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-300">Voice input requires Chrome or Edge browser. Text input always works.</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={clsx(
              'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-sky-500/20 border border-sky-500/30 text-sky-100'
                : 'glass-card border-white/10 text-slate-300'
            )}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-500 to-sky-500 flex items-center justify-center">
                    <span className="text-xs text-white">R</span>
                  </div>
                  <span className="text-xs text-teal-400 font-medium">RaahSetu</span>
                </div>
              )}
              <p>{msg.text}</p>
              {msg.note && (
                <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-white/5 italic">{msg.note}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-xs text-slate-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Example queries */}
      <div className="mb-3">
        <div className="text-xs text-slate-600 mb-2">Try asking:</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {EXAMPLE_QUERIES.map((q, i) => (
            <button key={i}
              onClick={() => sendQuery(q.text)}
              className="flex-shrink-0 text-xs px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 rounded-xl transition-colors max-w-[200px] text-left truncate">
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendQuery(input)}
            placeholder="Type your question or use voice..."
            className="input-field pr-10 text-sm"
            disabled={loading}
          />
        </div>

        {/* Repeat last answer */}
        <button onClick={speakLast} title="Repeat last answer"
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-teal-400 rounded-xl transition-colors">
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Voice button */}
        {speechSupported && (
          <button
            onClick={listening ? stopListening : startListening}
            className={clsx(
              'p-3 rounded-xl border transition-all',
              listening
                ? 'bg-red-500/20 border-red-500/40 text-red-400 pulse-gentle'
                : 'bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/30 text-teal-400'
            )}
            title={listening ? 'Stop listening' : 'Start voice input'}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        {/* Send button */}
        <button
          onClick={() => sendQuery(input)}
          disabled={loading || !input.trim()}
          className="p-3 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-400 rounded-xl transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {listening && (
        <div className="mt-2 text-center text-xs text-red-400 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          Listening... speak now
        </div>
      )}
    </div>
  );
}
