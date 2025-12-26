import React, { useState, useEffect, useMemo } from 'react';
import { AnalysisResult, UserStat } from '../types';
import WordSearch from './WordSearch';
import HourlyHeatmap from './charts/HourlyHeatmap';
import { 
  MessageCircle, Search, Zap, Moon, Sun, Image,
  Flame, BarChart3,
  Quote, Mic, X
} from 'lucide-react';

interface StoryViewProps {
  data: AnalysisResult;
  selectedYear: number | null;
  onReset: () => void;
  onCompare: () => void;
  canCompare: boolean;
  onFileSelect: (file: File) => void;
  onSelectYear: (year: number) => void;
}

type SlideType = 
  | 'INTRO' | 'TOTAL' | 'TOP_TALKERS' | 'GROUP_LEADERBOARD' | 'MOST_SILENT' | 'STREAKS' | 'SILENCE_DURATION' | 'SILENCE_LEADERBOARD' | 'ACTIVE_GRAPH'
  | 'PEAK_HOUR' | 'WEEKLY' | 'MEDIA' | 'RAPID_FIRE' | 'VOLUME'
  | 'ONE_SIDED' | 'ESSAYIST' | 'BALANCE' | 'VOCAB' | 'REPEAT'
  | 'SILENCE_BREAKER' | 'SPEED' | 'STYLES' | 'FINAL' | 'ACTION_CHOICE';

// --- MICRO-MOTION COMPONENTS ---

const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  return prefersReducedMotion;
};

const MessageRain: React.FC = () => {
  const reduced = useReducedMotion();
  
  // Use a fixed set of drops based on component mount to avoid rapid re-renders
  const drops = useMemo(() => {
    if (reduced) return [];
    return Array.from({ length: 12 }).map(() => ({
      left: `${Math.floor(Math.random() * 90) + 5}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 5}s`, // Slow speed (8-15s)
      opacity: 0.04 + Math.random() * 0.04 // 4% to 8% opacity
    }));
  }, [reduced]);

  if (reduced) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {drops.map((d, i) => (
        <div 
          key={i}
          className="absolute top-0 text-white animate-rain"
          style={{
            left: d.left,
            animationDelay: d.delay,
            animationDuration: d.duration,
            opacity: d.opacity
          }}
        >
          {/* Small message bubble shape */}
          <div className="w-2 h-2 bg-current rounded-full rounded-bl-none" />
        </div>
      ))}
    </div>
  );
};

const HeatBurst: React.FC = () => {
  const reduced = useReducedMotion();
  
  const particles = useMemo(() => {
    if (reduced) return [];
    return Array.from({ length: 8 }).map(() => ({
      left: `${20 + Math.random() * 60}%`,
      delay: `${0.5 + Math.random() * 1.5}s`, // Starts after 500ms
      duration: `${2 + Math.random()}s`,
      size: `${Math.random() * 40 + 20}px`
    }));
  }, [reduced]);

  if (reduced) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none overflow-hidden z-0">
      {particles.map((p, i) => (
        <div 
          key={i}
          className="absolute bottom-0 bg-orange-500 blur-[20px] rounded-full animate-heat"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}
    </div>
  );
};

const PulseWave: React.FC = () => {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent skew-x-12 animate-wave" />
    </div>
  );
};

const FloatingParticles: React.FC = () => {
  const reduced = useReducedMotion();
  
  const particles = useMemo(() => {
    if (reduced) return [];
    return Array.from({ length: 6 }).map(() => ({
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 60 + 20}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${6 + Math.random() * 4}s`,
    }));
  }, [reduced]);

  if (reduced) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p, i) => (
        <div 
          key={i}
          className="absolute text-indigo-300 font-bold text-xs animate-float opacity-0"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        >
          {i % 2 === 0 ? 'z' : '•'}
        </div>
      ))}
    </div>
  );
};

const BackgroundEmojis: React.FC<{ emojis: string[] }> = ({ emojis }) => {
  const reduced = useReducedMotion();
  
  // Create a stable key based on the content of emojis so we don't re-render on reference change
  const emojiKey = useMemo(() => emojis ? emojis.join(',') : '', [emojis]);
  const safeEmojis = emojis || [];

  // Static set of drops
  const drops = useMemo(() => {
    if (reduced || safeEmojis.length === 0) return [];
    return Array.from({ length: 18 }).map((_, i) => ({
      left: `${Math.floor(Math.random() * 95) + 2}%`,
      // Large negative delay ensures they are distributed vertically across the screen immediately
      // Range: -20s to 0s
      delay: `${(Math.random() * 20) - 20}s`, 
      // Slower duration: 12s to 24s (previously 6-12s)
      duration: `${12 + Math.random() * 12}s`,
      emoji: safeEmojis[i % safeEmojis.length],
      fontSize: `${2 + Math.random() * 3}rem`, 
      blur: Math.random() > 0.4 ? '2px' : '0px'
    }));
  }, [emojiKey, reduced, safeEmojis.length]);

  if (reduced || safeEmojis.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute -top-32 animate-emoji-drop opacity-0"
          style={{
            left: d.left,
            animationDelay: d.delay,
            animationDuration: d.duration,
            fontSize: d.fontSize,
            filter: `blur(${d.blur}) grayscale(0.2)`, 
          }}
        >
          {d.emoji}
        </div>
      ))}
    </div>
  );
};

// --- INTERNAL COMPONENTS ---

const CountUp: React.FC<{ end: number; duration?: number; suffix?: string; className?: string; delay?: number }> = ({ end, duration = 1500, suffix = '', className = '', delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(end * ease));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, started]);

  return <span className={className}>{count.toLocaleString()}{suffix}</span>;
};

const RevealText: React.FC<{ children: React.ReactNode; className?: string; delay?: string }> = ({ children, className = '', delay = '0ms' }) => (
  <div className={`overflow-visible ${className}`}>
    <div className="animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: delay }}>
      {children}
    </div>
  </div>
);

const GlowNumber: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = "bg-white", className = "" }) => (
  <div className={`relative inline-block ${className}`}>
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] ${color} opacity-[0.12] blur-3xl rounded-full pointer-events-none -z-10`} />
    {children}
  </div>
);

const MicroExplanation: React.FC<{ text: string; delay?: string; className?: string }> = ({ text, delay = '600ms', className = '' }) => (
  <div className={`mt-4 w-full text-center animate-fadeSlideUp opacity-0 fill-mode-forwards pointer-events-none ${className}`} style={{ animationDelay: delay }}>
    <p className="text-xs text-zinc-500/80 font-medium tracking-wide">
      {text}
    </p>
  </div>
);

const ActionCard: React.FC<{ title: string; icon: string; onClick: () => void; disabled?: boolean; hint?: string }> = ({ title, icon, onClick, disabled, hint }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer pointer-events-auto
      ${disabled 
        ? 'bg-zinc-900/50 border-zinc-800 opacity-50 cursor-not-allowed' 
        : 'bg-zinc-900/80 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500 hover:scale-[1.02] active:scale-95 shadow-lg'
      }
    `}
  >
    <div className="text-left">
      <div className={`text-lg font-bold ${disabled ? 'text-zinc-500' : 'text-white'}`}>{title}</div>
      {hint && <div className="text-xs text-zinc-500 mt-1 font-medium">{hint}</div>}
    </div>
    <div className={`text-3xl ${disabled ? 'grayscale opacity-50' : 'group-hover:scale-110 transition-transform'}`}>
      {icon}
    </div>
  </button>
);

const LivingBackground: React.FC<{ 
  theme: string; 
  mode?: 'rain' | 'heat' | 'pulse' | 'float' | 'none';
  emojis?: string[];
}> = ({ theme, mode = 'none', emojis }) => {
  // Using brighter, richer colors that fade into the dark background
  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'green': 
        return {
          bg: 'from-emerald-950 to-black',
          blob1: 'bg-emerald-500',
          blob2: 'bg-teal-600',
          blob3: 'bg-green-400'
        };
      case 'purple': 
        return {
          bg: 'from-purple-950 to-black',
          blob1: 'bg-purple-600',
          blob2: 'bg-fuchsia-600',
          blob3: 'bg-violet-500'
        };
      case 'orange': 
        return {
          bg: 'from-orange-950 to-black',
          blob1: 'bg-orange-600',
          blob2: 'bg-red-500',
          blob3: 'bg-amber-500'
        };
      case 'blue': 
        return {
          bg: 'from-blue-950 to-black',
          blob1: 'bg-blue-600',
          blob2: 'bg-indigo-500',
          blob3: 'bg-cyan-500'
        };
      case 'pink': 
        return {
          bg: 'from-pink-950 to-black',
          blob1: 'bg-pink-600',
          blob2: 'bg-rose-500',
          blob3: 'bg-fuchsia-500'
        };
      case 'dark': 
        return {
          bg: 'from-zinc-900 to-black',
          blob1: 'bg-zinc-600',
          blob2: 'bg-zinc-500',
          blob3: 'bg-white' // Low opacity white acts as fog
        };
      default: 
        return {
          bg: 'from-zinc-900 to-black',
          blob1: 'bg-purple-600',
          blob2: 'bg-blue-600',
          blob3: 'bg-pink-600'
        };
    }
  }, [theme]);

  return (
    <div className={`absolute inset-0 overflow-hidden z-0 pointer-events-none transition-colors duration-1000 bg-gradient-to-b ${themeStyles.bg}`}>
       <div className="bg-noise" />
       
       {/* Layer 2: Abstract Shapes (Blobs) */}
       <div className={`absolute top-[-10%] left-[-20%] w-[90vw] h-[90vw] rounded-full mix-blend-screen opacity-20 blur-[100px] animate-blob-slow ${themeStyles.blob1}`} />
       <div 
         className={`absolute top-[40%] right-[-20%] w-[80vw] h-[80vw] rounded-full mix-blend-screen opacity-20 blur-[120px] animate-blob-slower ${themeStyles.blob2}`} 
         style={{ animationDelay: '-5s' }} 
       />
       <div 
         className={`absolute bottom-[-20%] left-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen opacity-15 blur-[90px] animate-breathe ${themeStyles.blob3}`} 
         style={{ animationDelay: '-10s' }} 
       />

       {/* Ambient Layer - Strictly Background */}
       {mode === 'rain' && <MessageRain />}
       {mode === 'heat' && <HeatBurst />}
       {mode === 'pulse' && <PulseWave />}
       {mode === 'float' && <FloatingParticles />}
       
       {/* Emoji Layer - Deepest background element overlay */}
       {emojis && emojis.length > 0 && <BackgroundEmojis emojis={emojis} />}

       {/* Layer 3: Vignette for focus */}
       <div className="absolute inset-0 bg-radial-vignette opacity-60" style={{ background: 'radial-gradient(circle at center, transparent 0%, #000 120%)' }} />
    </div>
  );
};

const SlideWrapper: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex flex-col justify-center h-full px-8 relative z-10 ${className}`}>
    {children}
  </div>
);

// --- MAIN COMPONENT ---

const StoryView: React.FC<StoryViewProps> = ({ data, selectedYear, onReset, onCompare, canCompare, onFileSelect, onSelectYear }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [animateSlide, setAnimateSlide] = useState(false);
  
  // Year Selection State
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showNoYearsToast, setShowNoYearsToast] = useState(false);

  useEffect(() => {
    setAnimateSlide(false);
    const t = setTimeout(() => setAnimateSlide(true), 50);
    return () => clearTimeout(t);
  }, [currentSlideIndex]);

  // Reset slide index when selected year changes
  useEffect(() => {
    setCurrentSlideIndex(0);
    setAnimKey(prev => prev + 1);
  }, [selectedYear]);

  // Auto-hide toast
  useEffect(() => {
    if (showNoYearsToast) {
      const t = setTimeout(() => setShowNoYearsToast(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showNoYearsToast]);

  // Derive Chat Title
  const chatTitle = useMemo(() => {
    if (!data.users || data.users.length === 0) return 'ChatWrapped';
    if (data.users.length > 2) return 'Group Chat';
    // 1-on-1: Sort alphabetically for consistency
    const names = data.users.map(u => u.name).sort((a, b) => a.localeCompare(b));
    return names.join(' & ');
  }, [data.users]);

  const slides: SlideType[] = useMemo(() => {
    const list: SlideType[] = ['INTRO', 'TOTAL'];
    if (data.users.length > 2) {
      list.push('GROUP_LEADERBOARD'); // First: Contributors
      list.push('TOP_TALKERS');       // Second: Talkers
      
      // MOST SILENT AWARD Logic
      const activeUsers = data.users.filter(u => u.messageCount > 0);
      if (activeUsers.length > 1) {
          const counts = activeUsers.map(u => u.messageCount);
          const minCount = Math.min(...counts);
          const maxCount = Math.max(...counts);
          // Only show if there is some variation (not everyone tied)
          if (minCount !== maxCount) {
             list.push('MOST_SILENT');
          }
      }
    }

    if (data.longestStreak >= 2) list.push('STREAKS');
    if (data.silenceBreaker.maxSilenceHours > 1) {
      list.push('SILENCE_DURATION');
      if (Object.keys(data.silenceBreakCounts).length > 0) list.push('SILENCE_LEADERBOARD');
    }
    list.push('ACTIVE_GRAPH', 'PEAK_HOUR', 'WEEKLY');
    if (data.users.some(u => u.mediaMessageCount > 0)) list.push('MEDIA');
    if (data.burstStats.count > 0) list.push('RAPID_FIRE');
    if (data.users.length <= 2) list.push('VOLUME');
    if (data.users.some(u => u.oneSidedConversationsCount > 0)) list.push('ONE_SIDED');
    else list.push('BALANCE');
    if (data.longestMessage.wordCount > 20) list.push('ESSAYIST');
    const hasVocab = data.users.some(u => u.topWords.length >= 3);
    if (hasVocab) list.push('VOCAB');
    if (data.mostRepeatedPhrase && data.mostRepeatedPhrase.count > 3) list.push('REPEAT');
    list.push('SILENCE_BREAKER');
    if (data.users.length > 0 && Math.abs(data.users[0].avgReplyTimeMinutes - (data.users[1]?.avgReplyTimeMinutes || 0)) > 1) list.push('SPEED');
    list.push('STYLES', 'FINAL', 'ACTION_CHOICE');
    return list;
  }, [data]);

  const TOTAL_SLIDES = slides.length;
  const currentSlideType = slides[currentSlideIndex];
  const isGroup = data.users.length > 2;

  // Fix: Providing a complete fallback object to avoid missing property errors
  const defaultUser: UserStat = {
    name: '?',
    messageCount: 0,
    wordCount: 0,
    avgLength: 0,
    emojis: [],
    color: '#ccc',
    topWords: [],
    avgReplyTimeMinutes: 0,
    morningCount: 0,
    nightCount: 0,
    byeCount: 0,
    textMessageCount: 0,
    emojiMessageCount: 0,
    mediaMessageCount: 0,
    shortMessageCount: 0,
    longMessageCount: 0,
    oneSidedConversationsCount: 0
  };

  const u1 = data.users[0] || defaultUser;
  const u2 = data.users[1] || defaultUser;

  const handleSlideChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentSlideIndex < TOTAL_SLIDES - 1) {
      setCurrentSlideIndex(c => c + 1);
      setAnimKey(k => k + 1);
    } else if (direction === 'prev' && currentSlideIndex > 0) {
      setCurrentSlideIndex(c => c - 1);
      setAnimKey(k => k + 1);
    }
  };

  const handleCheckAnotherYear = () => {
    // Check if there are years other than the selected one
    const otherYears = data.yearOptions.filter(y => y !== selectedYear);
    
    if (otherYears.length > 0) {
      setShowYearSelector(true);
    } else {
      setShowNoYearsToast(true);
    }
  };

  const getTheme = (type: SlideType): string => {
    switch (type) {
      case 'INTRO': return 'purple';
      case 'TOTAL': return 'purple';
      case 'TOP_TALKERS': return 'blue';
      case 'GROUP_LEADERBOARD': return 'purple';
      case 'MOST_SILENT': return 'dark';
      case 'STREAKS': return 'orange';
      case 'SILENCE_DURATION': return 'dark';
      case 'SILENCE_LEADERBOARD': return 'blue';
      case 'ACTIVE_GRAPH': return 'blue';
      case 'PEAK_HOUR': return 'orange';
      case 'WEEKLY': return 'purple';
      case 'MEDIA': return 'blue';
      case 'RAPID_FIRE': return 'orange';
      case 'VOLUME': return 'pink';
      case 'ONE_SIDED': return 'pink';
      case 'ESSAYIST': return 'dark';
      case 'BALANCE': return 'green';
      case 'VOCAB': return 'blue';
      case 'REPEAT': return 'purple';
      case 'SILENCE_BREAKER': return 'pink';
      case 'SPEED': return 'orange';
      case 'STYLES': return 'green';
      case 'FINAL': return 'dark';
      case 'ACTION_CHOICE': return 'dark';
      default: return 'purple';
    }
  };
  
  const getAmbientMode = (type: SlideType): 'rain' | 'heat' | 'pulse' | 'float' | 'none' => {
    switch (type) {
      case 'STREAKS': return 'heat';
      case 'RAPID_FIRE': return 'pulse';
      case 'ACTION_CHOICE': return 'float';
      default: return 'none';
    }
  };

  const getBackgroundEmojis = (type: SlideType): string[] => {
    switch (type) {
      case 'INTRO': return ['👋'];
      case 'TOTAL': return ['💬'];
      case 'TOP_TALKERS': return ['🗣️'];
      case 'GROUP_LEADERBOARD': return ['👥', '🏆'];
      case 'MOST_SILENT': return ['🤫'];
      case 'STREAKS': return ['🔥'];
      case 'SILENCE_DURATION': return ['😴', '💤'];
      case 'SILENCE_LEADERBOARD': return ['📢'];
      case 'ACTIVE_GRAPH': return ['📊'];
      case 'PEAK_HOUR': return ['⏰', '🕰️'];
      case 'WEEKLY': return ['📅'];
      case 'MEDIA': return ['📸', '🎥'];
      case 'RAPID_FIRE': return ['⚡'];
      case 'VOLUME': return ['🔊'];
      case 'ONE_SIDED': return ['🎒'];
      case 'ESSAYIST': return ['📝', '📜'];
      case 'BALANCE': return ['⚖️'];
      case 'VOCAB': return ['🔤', '🗣️'];
      case 'REPEAT': return ['🔁'];
      case 'SILENCE_BREAKER': return ['🎤'];
      case 'SPEED': return ['🏎️', '💨'];
      case 'STYLES': return ['✍️'];
      case 'FINAL': return ['🧾', '👋'];
      case 'ACTION_CHOICE': return [];
      default: return [];
    }
  };

  const formatNum = (n: number) => n.toLocaleString();
  const formatTime = (hour: number) => `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

  const renderSlide = () => {
    switch (currentSlideType) {
      case 'INTRO':
        return (
          <SlideWrapper className="text-center">
            {/* BRANDING: Replaced Green (WhatsApp) with Violet/Fuchsia (ChatWrapped) */}
            <div className="w-24 h-24 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-[0_0_60px_rgba(139,92,246,0.4)] animate-fadeSlideUp">
              <MessageCircle size={48} className="text-white drop-shadow-md" />
            </div>
            <RevealText className="mb-6" delay="100ms">
              <h1 className="text-5xl font-black tracking-tighter text-white">
                ChatWrapped<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-200">
                  {selectedYear || "All Time"}
                </span>
              </h1>
            </RevealText>
            <div className="glass-panel px-6 py-3 rounded-full animate-fadeSlideUp opacity-0 fill-mode-forwards inline-block mx-auto" style={{ animationDelay: '300ms' }}>
              <p className="text-zinc-200 font-medium">Honest stats. Zero fluff.</p>
            </div>
            <MicroExplanation text="Your conversation history, visualized." delay="800ms" />
            <p className="absolute bottom-12 left-0 right-0 text-xs text-zinc-500 uppercase tracking-widest animate-subtlePulse">Tap to start</p>
          </SlideWrapper>
        );

      case 'TOTAL':
        return (
          <SlideWrapper>
            <div className="mb-4 animate-fadeSlideUp opacity-0 fill-mode-forwards relative z-10">
               <h3 className="text-2xl text-purple-200 font-bold opacity-80">You sent a total of</h3>
            </div>
            <RevealText className="mb-6" delay="100ms">
              <GlowNumber color="bg-purple-500">
                <div className="text-[12vh] leading-none font-black text-white drop-shadow-2xl">
                  <CountUp end={data.totalMessages} duration={2000} />
                </div>
              </GlowNumber>
            </RevealText>
            <div className="flex gap-2 items-center text-zinc-400 animate-fadeSlideUp opacity-0 fill-mode-forwards relative z-10" style={{ animationDelay: '300ms' }}>
               <div className="h-[1px] w-12 bg-zinc-600"></div>
               <span className="text-sm font-mono tracking-wider uppercase">Messages</span>
            </div>
            <MicroExplanation text="Total messages exchanged in this chat." delay="600ms" />
            <div className="mt-8 glass-panel p-6 rounded-2xl animate-fadeSlideUp opacity-0 fill-mode-forwards max-w-xs relative z-10" style={{ animationDelay: '500ms' }}>
              <p className="text-lg italic text-zinc-200">"That's a whole lot of typing."</p>
            </div>
          </SlideWrapper>
        );

      case 'TOP_TALKERS':
        const activeTalkers = data.users.filter(u => u.messageCount > 0)
                                        .sort((a, b) => b.messageCount - a.messageCount);
        const topTalkersList = activeTalkers.slice(0, 15);
        const talkersHiddenCount = activeTalkers.length - topTalkersList.length;
        
        return (
            <SlideWrapper>
                <div className="mb-6 text-center animate-fadeSlideUp">
                    <h2 className="text-2xl font-black text-white mb-1">Top Talkers 🗣️</h2>
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">The most active people</p>
                </div>
                
                <div className="flex flex-col gap-1.5 w-full">
                    {topTalkersList.map((u, i) => (
                        <div 
                            key={u.name} 
                            className="flex items-center justify-between animate-fadeSlideRight opacity-0 fill-mode-forwards"
                            style={{ animationDelay: `${i * 40}ms` }}
                        >
                             <div className="flex items-center gap-3 min-w-0">
                                 <span className={`text-xs font-mono w-5 text-right ${i < 3 ? 'text-yellow-400 font-bold' : 'text-zinc-600'}`}>
                                     {i + 1}
                                 </span>
                                 <span className={`text-sm truncate max-w-[180px] sm:max-w-[240px] ${i < 3 ? 'text-white font-bold' : 'text-zinc-300'}`}>
                                     {u.name}
                                 </span>
                             </div>
                             <span className="text-xs font-mono text-zinc-500 shrink-0">
                                 {formatNum(u.messageCount)}
                             </span>
                        </div>
                    ))}
                </div>
    
                {talkersHiddenCount > 0 && (
                    <div className="mt-8 text-center animate-fadeIn opacity-0 fill-mode-forwards" style={{ animationDelay: '800ms' }}>
                        <p className="text-[10px] text-zinc-600 font-medium">
                           Others were active too, but these 15 led the chat.
                        </p>
                    </div>
                )}
            </SlideWrapper>
        );

      case 'GROUP_LEADERBOARD':
        // Sort users descending by message count
        const sortedUsers = [...data.users].sort((a, b) => b.messageCount - a.messageCount);
        
        // Split Top 5 and Others
        const topMembers = sortedUsers.slice(0, 5);
        const remainingMembers = sortedUsers.slice(5);
        
        // Calculate Others Stats
        const othersMsgCount = remainingMembers.reduce((acc, u) => acc + u.messageCount, 0);
        const othersPeopleCount = remainingMembers.length;
        const totalMsgs = data.totalMessages;

        return (
          <SlideWrapper>
             <div className="mb-6 animate-fadeSlideUp">
                <h2 className="text-3xl font-black text-white mb-2">Top Contributors 👥</h2>
                <MicroExplanation text="The most active members in this group." delay="200ms" className="!mt-0 !text-left" />
             </div>

             <div className="space-y-3 w-full">
                {topMembers.map((u, i) => {
                  const isTop = i === 0;
                  const percent = ((u.messageCount / totalMsgs) * 100).toFixed(1);
                  return (
                    <div 
                      key={u.name} 
                      className={`
                        flex items-center justify-between p-3 rounded-xl animate-fadeSlideRight opacity-0 fill-mode-forwards
                        ${isTop ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'bg-white/5 border border-white/5'}
                      `}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                       <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className={`font-mono text-xs w-5 ${isTop ? 'text-purple-300 font-bold' : 'text-zinc-500'}`}>
                            #{i+1}
                          </span>
                          <span className={`font-bold text-base truncate ${isTop ? 'text-white' : 'text-zinc-200'}`}>
                            {u.name}
                          </span>
                       </div>
                       <div className="flex flex-col items-end ml-3">
                          <span className={`font-mono font-bold text-sm ${isTop ? 'text-purple-300' : 'text-zinc-400'}`}>
                            {formatNum(u.messageCount)}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {percent}%
                          </span>
                       </div>
                    </div>
                  );
                })}
                
                {othersPeopleCount > 0 && (
                  <div 
                    className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/30 animate-fadeSlideRight opacity-0 fill-mode-forwards"
                    style={{ animationDelay: `${topMembers.length * 100}ms` }}
                  >
                     <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-zinc-600 w-5">
                          ...
                        </span>
                        <span className="font-bold text-zinc-400 text-base">
                          Others ({othersPeopleCount})
                        </span>
                     </div>
                     <div className="flex flex-col items-end ml-3">
                        <span className="font-mono text-zinc-500 font-bold text-sm">
                          {formatNum(othersMsgCount)}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          {((othersMsgCount / totalMsgs) * 100).toFixed(1)}%
                        </span>
                     </div>
                  </div>
                )}
             </div>
          </SlideWrapper>
        );

      case 'MOST_SILENT':
        const activeUsersSilent = data.users.filter(u => u.messageCount > 0);
        const sortedBySilence = [...activeUsersSilent].sort((a, b) => a.messageCount - b.messageCount);
        const silentUser = sortedBySilence[0];

        return (
          <SlideWrapper className="text-center">
             <div className="flex justify-center mb-8 animate-fadeSlideUp relative z-10">
                  <div className="p-6 bg-zinc-800/50 rounded-full border border-zinc-700 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                     <span className="text-6xl">🤫</span>
                  </div>
             </div>
             <div className="inline-block border border-zinc-700 bg-zinc-800/50 rounded-full px-4 py-1 text-zinc-400 uppercase text-[10px] font-bold tracking-widest mb-6 animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '100ms' }}>
                Most Silent Person Award
             </div>
             <RevealText className="mb-2" delay="200ms">
                 <h2 className="text-4xl font-black text-white">
                    {silentUser.name}
                 </h2>
             </RevealText>
             <p className="text-zinc-400 text-lg mb-8 animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '300ms' }}>
                 Sent <span className="font-bold text-white">{silentUser.messageCount}</span> messages
             </p>

             <div className="glass-panel p-4 rounded-xl animate-fadeSlideUp opacity-0 fill-mode-forwards mx-auto max-w-xs" style={{ animationDelay: '400ms' }}>
                 <p className="text-zinc-300 italic">"Quiet, but present."</p>
             </div>

             <MicroExplanation text="Among members who participated at least once." delay="600ms" />
          </SlideWrapper>
        );

      case 'STREAKS':
        return (
          <SlideWrapper className="text-center">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
               <div className="w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-[80px] animate-subtlePulse" />
             </div>
             <div className="flex justify-center mb-8 relative animate-fadeSlideUp z-10">
               <Flame size={100} className="text-orange-500 relative z-10 filter drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]" />
             </div>
             <div className="inline-block text-orange-200 uppercase text-xs font-bold tracking-widest mb-6 mx-auto animate-fadeSlideUp opacity-0 fill-mode-forwards relative z-10" style={{ animationDelay: '100ms' }}>
               Longest Streak
             </div>
             <RevealText className="mb-2" delay="200ms">
               <GlowNumber color="bg-orange-500">
                 <div className="text-[12vh] font-black text-white leading-none">
                   <CountUp end={data.longestStreak} />
                 </div>
               </GlowNumber>
             </RevealText>
             <div className="text-2xl font-bold text-zinc-400 mb-6 animate-fadeSlideUp opacity-0 fill-mode-forwards relative z-10" style={{ animationDelay: '300ms' }}>days in a row</div>
             <MicroExplanation text="Consecutive days where at least one message was sent." delay="500ms" />
          </SlideWrapper>
        );

      case 'SILENCE_DURATION':
        return (
          <SlideWrapper className="text-center">
             <div className="flex justify-center mb-8 animate-fadeSlideUp relative z-10">
                <div className="p-6 bg-indigo-500/10 rounded-full border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
                  <Moon size={50} className="text-indigo-300" />
                </div>
             </div>
             <h2 className="text-xl font-bold uppercase tracking-widest text-indigo-200 mb-2 animate-fadeSlideUp opacity-0 fill-mode-forwards relative z-10" style={{ animationDelay: '100ms' }}>Longest Silence 💤</h2>
             <RevealText className="mb-8" delay="200ms">
                <GlowNumber color="bg-indigo-500">
                  <div className="text-5xl font-black text-white leading-tight">
                     {Math.floor(data.silenceBreaker.maxSilenceHours / 24)}d {Math.floor(data.silenceBreaker.maxSilenceHours % 24)}h
                  </div>
                </GlowNumber>
             </RevealText>
             <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-6 rounded-2xl border border-indigo-500/20 animate-fadeSlideUp opacity-0 fill-mode-forwards backdrop-blur-md relative z-10" style={{ animationDelay: '400ms' }}>
                <p className="text-indigo-100 text-lg font-medium italic">"It felt like an eternity."</p>
             </div>
             <MicroExplanation text="The longest gap between two messages." delay="600ms" />
          </SlideWrapper>
        );

      case 'SILENCE_LEADERBOARD':
        const silenceSorted = Object.entries(data.silenceBreakCounts)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5); 
        return (
          <SlideWrapper>
             <div className="mb-8 animate-fadeSlideUp">
                <h2 className="text-3xl font-black text-white mb-2">Breaking the Silence 👋</h2>
                <MicroExplanation text="Who restarted the conversation after it went quiet." delay="100ms" className="!mt-0 !text-left" />
             </div>
             <div className="space-y-4">
                {silenceSorted.map(([name, count], i) => (
                  <div 
                    key={name} 
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 animate-fadeSlideRight opacity-0 fill-mode-forwards backdrop-blur-sm"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                     <div className="flex items-center gap-3">
                        <span className="text-zinc-500 font-mono text-sm">#{i+1}</span>
                        <span className="font-bold text-white text-lg">{name}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="font-mono text-blue-300 font-bold">{count}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Times</span>
                     </div>
                  </div>
                ))}
             </div>
          </SlideWrapper>
        );

      case 'ACTIVE_GRAPH':
        return (
          <SlideWrapper>
             <div className="flex items-center justify-center gap-3 mb-4 text-cyan-300 animate-fadeSlideUp">
                <BarChart3 size={28} />
                <h2 className="text-2xl font-bold uppercase tracking-widest text-glow">Rhythm</h2>
             </div>
             <div className="h-64 w-full bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '200ms' }}>
                <HourlyHeatmap data={data.hourlyHeatmap} />
             </div>
             <MicroExplanation text="A heatmap of activity by hour of the day." delay="400ms" />
          </SlideWrapper>
        );

      case 'PEAK_HOUR':
        const isNight = data.busiestHour >= 18 || data.busiestHour < 6;
        return (
          <SlideWrapper className="text-center">
            <div className="mb-8 animate-fadeSlideUp">
               {isNight 
                 ? <Moon className="w-24 h-24 text-indigo-300 mx-auto drop-shadow-[0_0_30px_rgba(165,180,252,0.6)]" /> 
                 : <Sun className="w-24 h-24 text-yellow-300 mx-auto drop-shadow-[0_0_30px_rgba(253,224,71,0.6)]" />
               }
            </div>
            <RevealText className="mb-4" delay="100ms">
              <GlowNumber color={isNight ? "bg-indigo-500" : "bg-yellow-500"}>
                <div className="text-[5rem] font-black leading-none text-white">
                  {formatTime(data.busiestHour)}
                </div>
              </GlowNumber>
            </RevealText>
            <div className="mb-8 animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '300ms' }}>
               <span className="text-sm font-bold uppercase tracking-widest text-white/80">Most Active Hour</span>
            </div>
            <MicroExplanation text="The specific hour when you talked the most." delay="500ms" />
          </SlideWrapper>
        );

      case 'WEEKLY':
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const maxDay = Math.max(...data.dayOfWeekStats) || 1;
        const busiestDayIndex = data.dayOfWeekStats.indexOf(maxDay);
        return (
          <SlideWrapper>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-400 mb-12 text-center animate-fadeSlideUp">Weekly Flow</h2>
            <div className="flex items-end justify-between h-56 gap-3 mb-8 w-full">
              {data.dayOfWeekStats.map((count, i) => {
                const heightPct = maxDay > 0 ? (count / maxDay) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                    <div className="w-full bg-zinc-800/50 rounded-t-lg relative overflow-hidden flex-1 flex items-end">
                       <div 
                         className={`w-full transition-all duration-1000 ease-out ${i === busiestDayIndex ? 'bg-gradient-to-t from-green-500 to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-zinc-600'}`}
                         style={{ height: animateSlide ? `${heightPct}%` : '0%' }}
                       />
                    </div>
                    <span className={`text-xs font-bold uppercase ${i === busiestDayIndex ? 'text-green-400' : 'text-zinc-600'}`}>{days[i]}</span>
                  </div>
                );
              })}
            </div>
            <div className="glass-panel p-4 rounded-xl text-center animate-fadeSlideUp opacity-0 fill-mode-forwards mx-auto w-full max-w-xs" style={{ animationDelay: '600ms' }}>
               <p className="text-zinc-300">
                 <span className="text-green-400 font-bold text-xl">{(['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'])[busiestDayIndex]}</span> are chaos.
               </p>
            </div>
            <MicroExplanation text="Message volume breakdown by day of the week." delay="800ms" />
          </SlideWrapper>
        );

      case 'MEDIA':
        const totalMedia = data.users.reduce((acc, u) => acc + u.mediaMessageCount, 0);
        // Sort by media count descending
        const sortedMedia = [...data.users].sort((a, b) => b.mediaMessageCount - a.mediaMessageCount);
        
        // Determine limit (5 for groups, 2 for 1:1)
        const mediaLimit = isGroup ? 5 : 2;
        const topMediaUsers = sortedMedia.slice(0, mediaLimit).filter(u => u.mediaMessageCount > 0);
        
        // Calculate "Others"
        const remainingMediaUsers = sortedMedia.slice(mediaLimit);
        const othersMediaCount = remainingMediaUsers.reduce((acc, u) => acc + u.mediaMessageCount, 0);

        return (
          <SlideWrapper className="text-center">
             <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/30 animate-fadeSlideUp">
               <Image size={40} className="text-blue-300" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2 animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '100ms' }}>Media Moments</h2>
             <RevealText className="mb-8" delay="200ms">
               <GlowNumber color="bg-blue-500">
                 <div className="text-7xl font-black text-white">
                   <CountUp end={totalMedia} />
                 </div>
               </GlowNumber>
             </RevealText>
             
             <div className="w-full max-w-sm mx-auto space-y-2">
                {topMediaUsers.map((u, i) => (
                   <div key={u.name} className="flex justify-between items-center bg-white/5 p-3 rounded-xl animate-fadeSlideRight opacity-0 fill-mode-forwards" style={{ animationDelay: `${400 + (i * 150)}ms` }}>
                      <div className="flex items-center gap-3 overflow-hidden">
                         {isGroup && <span className="text-xs text-zinc-500 font-mono w-4">#{i + 1}</span>}
                         <span className="font-bold text-zinc-300 truncate">{u.name}</span>
                      </div>
                      <span className="font-mono text-blue-400 font-bold shrink-0"><CountUp end={u.mediaMessageCount} delay={800} /></span>
                   </div>
                ))}

                {othersMediaCount > 0 && (
                   <div className="flex justify-between items-center bg-zinc-800/40 p-3 rounded-xl animate-fadeSlideRight opacity-0 fill-mode-forwards border border-zinc-700/30" style={{ animationDelay: `${400 + (topMediaUsers.length * 150)}ms` }}>
                      <div className="flex items-center gap-3">
                         {isGroup && <span className="text-xs text-zinc-600 font-mono w-4">...</span>}
                         <span className="font-bold text-zinc-400">Others ({remainingMediaUsers.length})</span>
                      </div>
                      <span className="font-mono text-zinc-500 font-bold"><CountUp end={othersMediaCount} delay={800} /></span>
                   </div>
                )}
             </div>
             <MicroExplanation text="Photos, videos, and stickers shared." delay="800ms" />
          </SlideWrapper>
        );

      case 'RAPID_FIRE':
        return (
          <SlideWrapper>
            <div className="flex items-center justify-center gap-3 mb-6 text-orange-400 animate-fadeSlideUp relative z-10">
              <Zap size={36} className="animate-subtlePulse" />
            </div>
            <h2 className="text-3xl font-black uppercase text-center mb-12 animate-fadeSlideUp opacity-0 fill-mode-forwards relative z-10" style={{ animationDelay: '100ms' }}>Rapid Fire 🔥</h2>
            <div className="flex flex-col gap-12 items-center w-full relative z-10">
               <div className="text-center animate-fadeSlideRight opacity-0 fill-mode-forwards w-full" style={{ animationDelay: '200ms' }}>
                  <GlowNumber color="bg-orange-500">
                     <div className="text-8xl font-black text-white mb-2 leading-none"><CountUp end={data.burstStats.count} /></div>
                  </GlowNumber>
                  <div className="text-orange-200/60 text-sm font-bold uppercase tracking-widest mt-2">Total Bursts</div>
               </div>
               
               <div className="text-center animate-fadeSlideRight opacity-0 fill-mode-forwards w-full" style={{ animationDelay: '400ms' }}>
                   <GlowNumber color="bg-red-500">
                      <div className="text-6xl font-black text-white mb-2 leading-none"><CountUp end={data.burstStats.maxBurst} /></div>
                   </GlowNumber>
                   <div className="text-red-200/60 text-sm font-bold uppercase tracking-widest mt-2">Max Burst</div>
               </div>
            </div>
            <MicroExplanation text="Moments where messages were sent rapidly without pause." delay="600ms" />
          </SlideWrapper>
        );

      case 'VOLUME':
        const p1 = Math.round((u1.messageCount / data.totalMessages) * 100);
        const p2 = 100 - p1;
        return (
          <div className="flex flex-col h-full relative z-10">
            <div className="absolute top-8 left-0 w-full text-center z-20 animate-fadeSlideUp">
              <h2 className="text-xl font-bold uppercase tracking-widest text-white/90 drop-shadow-md">Message Volume</h2>
              <MicroExplanation text="Percentage of total messages sent by each person." delay="200ms" className="!mt-1" />
            </div>
            <div className="flex-1 flex w-full h-full relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/10 z-30 dashed-line"></div>
              <div className="relative flex flex-col justify-end p-6 transition-all duration-[1500ms] ease-out" style={{ width: animateSlide ? `${p1}%` : '50%', backgroundColor: u1.color }}>
                 <div className="mb-24 animate-fadeSlideUp opacity-0 fill-mode-forwards text-left" style={{ animationDelay: '200ms' }}>
                   <div className="text-6xl font-black text-white/90 leading-none mb-2 text-glow">{p1}%</div>
                   <div className="font-bold text-xl text-white/80 truncate">{u1.name}</div>
                 </div>
              </div>
              <div className="relative flex flex-col justify-end p-6 transition-all duration-[1500ms] ease-out" style={{ width: animateSlide ? `${p2}%` : '50%', backgroundColor: u2.color }}>
                 <div className="mb-24 animate-fadeSlideUp opacity-0 fill-mode-forwards text-right" style={{ animationDelay: '400ms' }}>
                   <div className="text-6xl font-black text-white/90 leading-none mb-2 text-glow">{p2}%</div>
                   <div className="font-bold text-xl text-white/80 truncate">{u2.name}</div>
                 </div>
              </div>
            </div>
          </div>
        );

      case 'ONE_SIDED':
        const carrier = data.users.reduce((prev, curr) => (prev.oneSidedConversationsCount > curr.oneSidedConversationsCount) ? prev : curr);
        return (
           <SlideWrapper className="text-center">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-pink-300 mb-8 animate-fadeSlideUp">Main Character Energy ✨</h2>
              <div className="animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '100ms' }}>
                 <div className="text-6xl mb-6 animate-subtlePulse">🎒</div>
                 
                 {/* Primary Line */}
                 <div className="text-3xl font-black text-white mb-2">{carrier.name}</div>
                 
                 {/* Secondary Line - Message Count */}
                 <div className="text-lg text-pink-200/90 font-medium mb-8">
                    Sent <span className="font-bold text-white">{formatNum(carrier.messageCount)}</span> messages
                 </div>

                 <p className="text-pink-200/50 text-xs uppercase tracking-widest mb-4">Dominated the chat for</p>
                 <GlowNumber color="bg-pink-500">
                    <div className="text-8xl font-black text-white mb-4 leading-none">{carrier.oneSidedConversationsCount}</div>
                 </GlowNumber>
                 <div className="text-xs font-bold uppercase tracking-widest text-pink-400 mt-2">Days</div>
              </div>
              <MicroExplanation text="Days where one person dominated the conversation." delay="300ms" />
           </SlideWrapper>
        );

      case 'ESSAYIST':
        return (
           <SlideWrapper>
              <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-400 mb-8 text-center animate-fadeSlideUp">The Essayist</h2>
              <div className="glass-panel rounded-tl-3xl rounded-br-3xl p-6 relative animate-fadeSlideRight opacity-0 fill-mode-forwards" style={{ animationDelay: '100ms' }}>
                 <Quote size={24} className="text-purple-400 mb-4 opacity-50" />
                 <div className="text-white/90 text-sm italic leading-relaxed max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                    "{data.longestMessage.content.substring(0, 300)}..."
                 </div>
                 <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold text-purple-300">{data.longestMessage.sender}</span>
                    <span className="text-xs bg-purple-500/20 px-2 py-1 rounded text-purple-200">{data.longestMessage.wordCount} words</span>
                 </div>
              </div>
              <MicroExplanation text="The longest single message sent." delay="300ms" />
           </SlideWrapper>
        );

      case 'BALANCE':
        return (
           <SlideWrapper>
              <h2 className="text-2xl font-bold uppercase tracking-widest text-green-300 mb-12 text-center animate-fadeSlideUp">Text vs Emoji</h2>
              <div className="space-y-8">
                 {[u1, u2].map((u, i) => {
                    const total = u.textMessageCount + u.emojiMessageCount;
                    const emojiPct = total > 0 ? (u.emojiMessageCount / total) * 100 : 0;
                    return (
                       <div key={i} className="animate-fadeSlideRight opacity-0 fill-mode-forwards group" style={{ animationDelay: `${i * 200}ms` }}>
                          <div className="flex justify-between mb-2 text-white font-bold group-hover:scale-[1.02] transition-transform duration-300 origin-left">
                             <span>{u.name}</span>
                             <span className="text-xs text-green-400">{emojiPct.toFixed(1)}% Emoji</span>
                          </div>
                          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex">
                             <div style={{ width: `${emojiPct}%` }} className="bg-yellow-400 h-full" />
                             <div style={{ width: `${100 - emojiPct}%` }} className="bg-zinc-600 h-full" />
                          </div>
                       </div>
                    );
                 })}
              </div>
              <div className="mt-12 flex justify-center gap-8 text-xs font-bold uppercase tracking-widest animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '400ms' }}>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full"/> Emoji</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-zinc-600 rounded-full"/> Text</div>
              </div>
              <MicroExplanation text="Ratio of text-only messages vs. messages with emojis." delay="600ms" />
           </SlideWrapper>
        );

      case 'VOCAB':
        return (
           <SlideWrapper>
              <h2 className="text-3xl font-black text-center mb-2 animate-fadeSlideUp bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">Signature Words</h2>
              <div className="space-y-6 mt-8">
                 {data.users.slice(0, 2).map((u, i) => (
                    <div key={i} className="glass-panel p-5 rounded-2xl animate-fadeSlideRight opacity-0 fill-mode-forwards hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: `${i * 200}ms` }}>
                       <div className="font-bold text-zinc-400 mb-3 text-sm uppercase flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u.color }}/> {u.name}
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {u.topWords.map((w, j) => (
                             <span key={j} className="px-3 py-1 bg-white/10 rounded-full text-base font-bold text-white">
                                {w.word}
                             </span>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
              <MicroExplanation text="Unique words used frequently by each person." delay="600ms" />
           </SlideWrapper>
        );

      case 'REPEAT':
        const phrase = data.mostRepeatedPhrase!;
        return (
           <SlideWrapper className="text-center">
              <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500 mb-12 animate-fadeSlideUp">On Repeat</h2>
              <div className="animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '100ms' }}>
                 <div className="text-6xl mb-4 opacity-50">❝</div>
                 <div className="text-4xl font-black text-white leading-tight mb-8 text-glow">
                   {phrase.phrase}
                 </div>
                 <div className="mt-12">
                    <GlowNumber color="bg-green-500">
                      <span className="font-mono text-5xl font-black text-green-400 mr-2">{phrase.count}</span>
                    </GlowNumber>
                    <div className="text-xs uppercase text-zinc-400 font-bold mt-2">Times</div>
                 </div>
                 <div className="mt-8 text-sm text-zinc-500">
                    Said mostly by <span className="text-white font-bold">{phrase.topUser}</span>
                 </div>
              </div>
              <MicroExplanation text="The phrase that kept coming up." delay="600ms" />
           </SlideWrapper>
        );

      case 'SILENCE_BREAKER':
         return (
            <SlideWrapper className="text-center">
               <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-fadeSlideUp">
                  <Mic size={40} className="text-pink-400" />
               </div>
               <div className="inline-block border border-pink-500/30 bg-pink-500/10 rounded-full px-4 py-1 text-pink-300 uppercase text-[10px] font-bold tracking-widest mb-6 animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '100ms' }}>
                  Silence Breaker
               </div>
               <RevealText className="mb-2" delay="200ms">
                 <h2 className="text-4xl font-black text-white">
                    {data.silenceBreaker.name}
                 </h2>
               </RevealText>
               <p className="text-zinc-400 text-sm mb-8 animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '300ms' }}>Revived the chat most often</p>
               
               <div className="animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '400ms' }}>
                  <div className="text-[10px] text-zinc-500 uppercase mb-2">Max Silence Broken</div>
                  <div className="text-3xl font-black text-white">{Math.floor(data.silenceBreaker.maxSilenceHours / 24)}d {data.silenceBreaker.maxSilenceHours % 24}h</div>
               </div>
               <MicroExplanation text="The person who ends the awkward silences." delay="600ms" />
            </SlideWrapper>
         );

      case 'SPEED':
         return (
            <SlideWrapper>
               <h2 className="text-3xl font-black text-center mb-2 animate-fadeSlideUp">Need for Speed ⏱️</h2>
               <div className="space-y-8 mt-12">
                  {data.users.slice(0, 2).map((u, i) => (
                     <div key={i} className="animate-fadeSlideRight opacity-0 fill-mode-forwards" style={{ animationDelay: `${i*150}ms` }}>
                        <div className="flex justify-between items-end mb-2">
                           <span className="font-bold text-lg">{u.name}</span>
                           <span className="text-3xl font-black text-white">{u.avgReplyTimeMinutes}<span className="text-sm font-normal text-zinc-500 ml-1">min</span></span>
                        </div>
                        <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500" style={{ width: `${Math.min((u.avgReplyTimeMinutes/60)*100, 100)}%` }} />
                        </div>
                     </div>
                  ))}
               </div>
               <MicroExplanation text="Average time taken to reply to a message." delay="600ms" />
            </SlideWrapper>
         );

      case 'STYLES':
         return (
            <SlideWrapper>
               <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-500 mb-12 text-center animate-fadeSlideUp">Typing Vibe</h2>
               <div className="space-y-6">
                  {data.users.slice(0, 2).map((u, i) => {
                     const isShort = u.avgLength < 6;
                     return (
                        <div key={i} className="glass-panel p-6 rounded-2xl animate-fadeSlideRight opacity-0 fill-mode-forwards" style={{ animationDelay: `${i*150}ms` }}>
                           <div className="flex justify-between items-center mb-2">
                              <div className="font-bold text-xl">{u.name}</div>
                              <div className={`text-xs font-bold px-3 py-1 rounded-full bg-white/5 ${isShort ? 'text-blue-400' : 'text-purple-400'}`}>
                                 {isShort ? "Short & Sweet" : "Storyteller"}
                              </div>
                           </div>
                           <div className="text-zinc-500 text-sm">Avg {u.avgLength} words per message</div>
                        </div>
                     );
                  })}
               </div>
               <MicroExplanation text="Analysis based on average message length." delay="600ms" />
            </SlideWrapper>
         );

      case 'FINAL':
        return (
          <div 
            className="flex flex-col h-full pt-6 pb-16 px-6 overflow-y-auto scrollbar-hide pointer-events-auto relative z-10"
            onClick={() => handleSlideChange('next')}
          >
            <h2 className="text-center text-lg font-bold mb-6 animate-fadeSlideUp text-zinc-400">The Receipt 🧾</h2>
            <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-fadeSlideUp opacity-0 fill-mode-forwards mx-auto w-full max-w-sm" style={{ animationDelay: '100ms' }}>
               <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/20 rounded-full blur-[80px]" />
               <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-600/20 rounded-full blur-[80px]" />
               
               <div className="flex items-center justify-between mb-8">
                 <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">ChatWrapped {selectedYear}</div>
                 <div className="text-2xl animate-subtlePulse">🔥</div>
               </div>

               <h3 className="text-3xl font-black text-white leading-tight mb-10">
                 {data.users.slice(0,2).map(u => u.name).join(isGroup ? ', ' : ' & ')}
               </h3>

               <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-8">
                  <div className="animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '300ms' }}>
                    <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Total Msgs</div>
                    <div className="text-2xl font-black text-white">{formatNum(data.totalMessages)}</div>
                  </div>
                  <div className="animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '400ms' }}>
                    <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Streak</div>
                    <div className="text-2xl font-black text-orange-400">{data.longestStreak} days</div>
                  </div>
                  <div className="animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '500ms' }}>
                    <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Busiest Hour</div>
                    <div className="text-xl font-bold text-cyan-400">{formatTime(data.busiestHour)}</div>
                  </div>
                  <div className="animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '600ms' }}>
                    <div className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Top Chatter</div>
                    <div className="text-xl font-bold text-purple-400 truncate">{u1.name}</div>
                  </div>
               </div>

               <div className="border-t border-zinc-800/50 pt-6 mt-2 text-center">
                  <p className="text-[10px] text-zinc-600 font-mono">GENERATED LOCALLY BY CHATWRAPPED</p>
               </div>
            </div>
            
            <MicroExplanation text="Your complete chat summary." delay="600ms" />

            <div className="mt-8 flex flex-col gap-3 max-w-sm mx-auto w-full animate-fadeSlideUp opacity-0 fill-mode-forwards relative z-50 cursor-pointer" style={{ animationDelay: '700ms' }}>
               <button 
                 onClick={(e) => { e.stopPropagation(); setShowSearch(true); }} 
                 className="bg-zinc-800 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
               >
                 <Search size={20} /> Text Search
               </button>
               <p className="text-center text-xs text-zinc-500 mt-4 animate-pulse">Tap for next ➜</p>
            </div>
          </div>
        );

      case 'ACTION_CHOICE':
        return (
          <SlideWrapper className="justify-center">
            <h2 className="text-3xl font-black text-center mb-12 animate-fadeSlideUp">What do you want to do next?</h2>
            
            <div className="space-y-4 w-full max-w-sm mx-auto animate-fadeSlideUp opacity-0 fill-mode-forwards pointer-events-auto" style={{ animationDelay: '200ms' }}>
               
               {/* Option 1: Check another year */}
               <ActionCard 
                 title="Check another year" 
                 icon="📅" 
                 onClick={handleCheckAnotherYear}
                 hint="View stats for a different year"
               />
               
               {/* Hidden file input not needed for this action anymore, but kept if we want to restore upload */}
               <input 
                 type="file" 
                 id="new-file-upload" 
                 className="hidden" 
                 accept=".txt,.zip"
                 onChange={(e) => {
                   if (e.target.files && e.target.files.length > 0) {
                     onFileSelect(e.target.files[0]);
                   }
                 }}
               />
        
               {/* Option 2: Compare years */}
               <ActionCard 
                 title="Compare years" 
                 icon="🔁" 
                 onClick={onCompare}
                 disabled={!canCompare}
                 hint={!canCompare ? "Upload two years to compare" : "See how your chat evolved"}
               />
        
               {/* Option 3: Start over */}
               <ActionCard 
                 title="Start over" 
                 icon="♻️" 
                 onClick={onReset}
                 hint="Clear data and exit"
               />

               {/* Footer Links */}
               <div className="pt-12 text-center space-y-4 animate-fadeSlideUp opacity-0 fill-mode-forwards" style={{ animationDelay: '400ms' }}>
                 <a 
                   href="https://dhananjaytech.app" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-block text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border-b border-zinc-800 pb-1"
                 >
                   Check more websites by Dhananjay_Tech
                 </a>
                 <div className="text-[10px] text-zinc-600 font-medium">
                   Made by <a href="https://dhananjaytech.app" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Dhananjay_Tech</a>
                 </div>
               </div>
        
            </div>
          </SlideWrapper>
        );

      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#09090b] text-white overflow-hidden flex flex-col font-sans select-none">
      <LivingBackground theme={getTheme(currentSlideType)} mode={getAmbientMode(currentSlideType)} emojis={getBackgroundEmojis(currentSlideType)} />
      
      {showSearch && <WordSearch data={data} onClose={() => setShowSearch(false)} />}
      
      {showYearSelector && (
         <div className="absolute inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fadeIn">
            <button onClick={() => setShowYearSelector(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white">
               <X size={28} />
            </button>
            <h2 className="text-3xl font-black mb-8 text-center text-white">Select a Year</h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-md w-full">
               {data.yearOptions.filter(y => y !== selectedYear).map(year => (
                  <button
                    key={year}
                    onClick={() => { onSelectYear(year); setShowYearSelector(false); }}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-800 border border-zinc-700 hover:bg-white hover:text-black hover:scale-105 transition-all font-bold text-xl"
                  >
                    {year}
                  </button>
               ))}
               {data.yearOptions.filter(y => y !== selectedYear).length === 0 && (
                  <p className="text-zinc-500">No other years available.</p>
               )}
            </div>
         </div>
      )}

      {showNoYearsToast && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 text-white px-6 py-3 rounded-full shadow-xl animate-fadeIn z-[70] pointer-events-none border border-zinc-700">
           No other years found in this file
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 z-50 flex flex-col px-2 pt-2 safe-top">
        <div className="flex gap-1 h-1 mb-3">
          {slides.map((_, i) => (
            <div key={i} className="flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div className={`h-full bg-white transition-all duration-300 ease-linear ${i < currentSlideIndex ? 'w-full' : i === currentSlideIndex ? 'w-full animate-growWidth' : 'w-0'}`} />
            </div>
          ))}
        </div>
        
        {/* Chat Identity */}
        <div className="px-1 flex justify-between items-start">
             <div className="text-white/80 font-medium text-[13px] truncate drop-shadow-md opacity-80 max-w-[80%]">
                 {chatTitle}
             </div>
        </div>
      </div>

      {/* Creator Credit - Bottom Center */}
      <div className="absolute bottom-3 left-0 right-0 z-[60] flex justify-center pointer-events-none">
        <a 
          href="https://www.instagram.com/dhananjay_tech/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="pointer-events-auto text-[11px] text-white/50 hover:text-white/80 transition-colors cursor-pointer drop-shadow-md font-medium"
        >
          ChatWrapped by @Dhananjay_Tech
        </a>
      </div>

      <div className="absolute inset-0 z-20 flex">
        <div className="w-[30%] h-full" onClick={() => handleSlideChange('prev')} />
        <div className="w-[70%] h-full" onClick={() => handleSlideChange('next')} />
      </div>

      <div key={animKey} className="flex-1 relative z-30 max-w-md mx-auto w-full h-full pointer-events-none">
        {renderSlide()}
      </div>
    </div>
  );
};

export default StoryView;
