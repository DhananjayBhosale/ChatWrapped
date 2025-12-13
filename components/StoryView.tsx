import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { AnalysisResult } from '../types';
import { 
  Flame, 
  Clock, 
  MessageSquarePlus, 
  Camera, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight
} from 'lucide-react';

interface StoryViewProps {
  data: AnalysisResult;
  selectedYear: number | null;
  onReset: () => void;
  onCompare: () => void;
  canCompare: boolean;
}

const StoryView: React.FC<StoryViewProps> = ({ data, selectedYear, onReset, onCompare, canCompare }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const finalCardRef = useRef<HTMLDivElement>(null);

  // Constants
  const TOTAL_SLIDES = 9;
  const topUser = data.users[0];
  const isGroup = data.users.length > 2;

  // Handlers
  const nextSlide = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide(c => c + 1);
      setAnimKey(k => k + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(c => c - 1);
      setAnimKey(k => k + 1);
    }
  };

  const formatNum = (n: number) => n.toLocaleString();
  const getAmPm = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  };

  const downloadFinalCard = async () => {
    if (!finalCardRef.current) return;
    try {
      const canvas = await html2canvas(finalCardRef.current, {
        backgroundColor: '#09090b',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `chat-wrapped-${selectedYear || 'all-time'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Failed to capture", err);
    }
  };

  const renderSlide = () => {
    switch (currentSlide) {
      /* --- INTRO --- */
      case 0:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 animate-scaleIn">
              Your Chat<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Wrapped
              </span>
              <br/>
              {selectedYear || "All Time"}
            </h1>
            <p className="text-zinc-400 text-lg mb-12 animate-fadeIn delay-300 opacity-0 fill-mode-forwards">
              One chat. Too many messages.
            </p>
            <button 
              onClick={nextSlide}
              className="bg-white text-black px-8 py-4 rounded-full font-bold text-xl hover:scale-105 transition-transform animate-bounce-slow"
            >
              Start Recap 👉
            </button>
          </div>
        );

      /* --- TOTAL MESSAGES --- */
      case 1:
        return (
          <div className="flex flex-col justify-center h-full px-8">
            <h2 className="text-6xl md:text-8xl font-black mb-2 animate-countUp">
              {formatNum(data.totalMessages)}
            </h2>
            <h3 className="text-2xl md:text-4xl font-bold text-zinc-300 mb-8">
              messages 😱
            </h3>
            <p className="text-xl md:text-2xl text-purple-200/80 font-medium animate-fadeIn delay-500 opacity-0 fill-mode-forwards leading-relaxed">
              "From just one chat."
            </p>
          </div>
        );

      /* --- WHO TALKED MORE (Vertical Split) --- */
      case 2:
        const u1 = data.users[0];
        const u2 = data.users[1];
        if (!u1 || !u2) return null; // Fallback for empty chat
        
        const p1 = (u1.messageCount / data.totalMessages) * 100;
        const p2 = (u2.messageCount / data.totalMessages) * 100;

        return (
          <div className="flex flex-col h-full relative">
            <div className="absolute top-8 left-0 w-full text-center z-20">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-white drop-shadow-md">
                Who Talked More?
              </h2>
            </div>
            
            <div className="flex-1 flex w-full h-full animate-fadeIn">
              {/* Left Bar */}
              <div 
                className="relative flex flex-col justify-end p-6 border-r border-black/20"
                style={{ width: `${p1}%`, backgroundColor: u1.color }}
              >
                <div className="mb-20 animate-slideInUp delay-100 opacity-0 fill-mode-forwards">
                  <div className="text-4xl md:text-5xl font-black text-white">{p1.toFixed(0)}%</div>
                  <div className="text-xl font-bold text-white/90 truncate">{u1.name}</div>
                </div>
              </div>

              {/* Right Bar */}
              <div 
                className="relative flex flex-col justify-end p-6"
                style={{ width: `${p2}%`, backgroundColor: u2.color }}
              >
                <div className="mb-20 animate-slideInUp delay-300 opacity-0 fill-mode-forwards">
                  <div className="text-4xl md:text-5xl font-black text-white">{p2.toFixed(0)}%</div>
                  <div className="text-xl font-bold text-white/90 truncate">{u2.name}</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 w-full text-center z-20">
              <p className="text-xl font-bold text-white drop-shadow-md italic animate-fadeIn delay-700 opacity-0 fill-mode-forwards px-4">
                 {Math.abs(p1 - p2) < 10 ? "Balanced. But not really." : "Someone definitely types more."}
              </p>
            </div>
          </div>
        );

      /* --- RAPID FIRE MODE --- */
      case 3:
        return (
          <div className="flex flex-col justify-center h-full px-6">
            <div className="flex items-center gap-3 mb-8 animate-fadeIn">
              <Flame className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-bold uppercase tracking-wider text-orange-500">
                Rapid Fire Mode
              </h2>
            </div>

            <div className="space-y-8">
              <div className="animate-fadeInUp delay-100 opacity-0 fill-mode-forwards">
                <div className="text-6xl font-black">{data.rapidFire.maxInMinute}</div>
                <div className="text-zinc-500 uppercase text-sm font-bold mt-1">Msgs in 1 minute</div>
              </div>

              <div className="animate-fadeInUp delay-300 opacity-0 fill-mode-forwards">
                <div className="text-6xl font-black">{data.rapidFire.maxInHour}</div>
                <div className="text-zinc-500 uppercase text-sm font-bold mt-1">Msgs in 1 hour</div>
              </div>
              
              <div className="animate-fadeInUp delay-500 opacity-0 fill-mode-forwards">
                <div className="text-6xl font-black">{data.rapidFire.maxInDay}</div>
                <div className="text-zinc-500 uppercase text-sm font-bold mt-1">Msgs in 1 day</div>
              </div>
            </div>

            <p className="mt-12 text-xl text-orange-200/60 animate-fadeIn delay-700 opacity-0 fill-mode-forwards">
              "When the conversation just wouldn’t stop."
            </p>
          </div>
        );

      /* --- PEAK HOUR --- */
      case 4:
        return (
          <div className="flex flex-col justify-center h-full px-8 text-center">
            <Clock className="w-20 h-20 text-cyan-400 mx-auto mb-8 animate-pulse" />
            <h2 className="text-7xl font-black mb-4 animate-scaleIn">
              {getAmPm(data.busiestHour)}
            </h2>
            <div className="h-1 w-24 bg-cyan-500/50 mx-auto rounded-full mb-8"></div>
            <p className="text-3xl text-cyan-200 font-bold animate-fadeIn delay-300 opacity-0 fill-mode-forwards">
              "This is when chaos begins."
            </p>
          </div>
        );

      /* --- LONGEST STREAK --- */
      case 5:
        return (
          <div className="flex flex-col justify-center h-full px-8 bg-gradient-to-b from-transparent to-red-900/10">
            <h2 className="text-9xl font-black text-red-500 mb-2 animate-slideInUp">
              {data.longestStreak}
            </h2>
            <h3 className="text-4xl font-bold text-white mb-8 animate-slideInUp delay-100 opacity-0 fill-mode-forwards">
              Days Straight <span className="text-red-500">🔥</span>
            </h3>
            
            <p className="text-2xl text-red-200 font-bold italic animate-fadeIn delay-500 opacity-0 fill-mode-forwards">
              "No breaks. No excuses."
            </p>
          </div>
        );

      /* --- VIBE CHECK --- */
      case 6:
        return (
          <div className="flex flex-col justify-center h-full px-8 text-center">
            <h2 className="text-2xl uppercase tracking-widest text-zinc-500 mb-12">
              This Chat's Vibe
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4 text-6xl md:text-7xl mb-12 animate-scaleIn">
              {topUser.emojis.slice(0, 4).map((e, i) => (
                <span key={i} className="animate-bounce-slow" style={{ animationDelay: `${i * 200}ms` }}>
                  {e.char}
                </span>
              ))}
            </div>

            <p className="text-xl text-zinc-300 animate-fadeIn delay-500 opacity-0 fill-mode-forwards">
              "Mostly laughs. Some silence."
            </p>
          </div>
        );

      /* --- INITIATOR --- */
      case 7:
        return (
          <div className="flex flex-col justify-center h-full px-8 text-center">
             <MessageSquarePlus className="w-20 h-20 text-pink-500 mx-auto mb-8 animate-bounce" />
             
             <div className="inline-block border border-pink-500/30 bg-pink-500/10 rounded-full px-6 py-2 text-pink-300 uppercase text-xs font-bold tracking-widest mb-8 animate-fadeIn">
               Breaks the Silence Award
             </div>

             <h2 className="text-4xl md:text-5xl font-black text-white mb-4 animate-scaleIn delay-200 break-words leading-tight">
               {data.topStarter} 👋
             </h2>

             <p className="text-lg text-zinc-400 mt-4 animate-fadeIn delay-500 opacity-0 fill-mode-forwards">
               "Most likely to text first."
             </p>
          </div>
        );

      /* --- FINAL CARD --- */
      case 8:
        return (
          <div className="flex flex-col h-full pt-8 pb-12 px-6">
            <h2 className="text-center text-xl font-bold mb-4 animate-fadeIn">
              This chat carried {selectedYear || "history"} 🫂
            </h2>

            {/* The Sharable Card */}
            <div 
              ref={finalCardRef}
              className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl overflow-hidden aspect-[9/16] mx-auto w-full max-w-sm flex flex-col justify-between animate-scaleIn"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  ChatWrapped {selectedYear}
                </div>
                <h3 className="text-3xl font-black text-white leading-tight mb-6">
                  {data.users.slice(0,2).map(u => u.name).join(isGroup ? ', ' : ' & ')}
                </h3>

                <div className="space-y-6">
                  <div>
                    <div className="text-5xl font-black text-white">{formatNum(data.totalMessages)}</div>
                    <div className="text-sm text-zinc-400 font-medium">Messages</div>
                  </div>
                  <div className="flex gap-4">
                     <div>
                       <div className="text-3xl font-black text-purple-400">{data.longestStreak}d</div>
                       <div className="text-xs text-zinc-400 font-medium">Streak</div>
                     </div>
                     <div>
                       <div className="text-3xl font-black text-pink-400">{data.users[0].emojis[0]?.char}</div>
                       <div className="text-xs text-zinc-400 font-medium">Vibe</div>
                     </div>
                  </div>
                  <div>
                     <div className="text-3xl font-black text-cyan-400">{getAmPm(data.busiestHour)}</div>
                     <div className="text-sm text-zinc-400 font-medium">Peak Chaos</div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                <div>
                   <div className="text-[10px] text-zinc-600 uppercase">Top Chatter</div>
                   <div className="font-bold text-xl">{topUser.name}</div>
                </div>
                <div className="text-right text-xs text-zinc-600">
                  chatwrapped.app
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 max-w-sm mx-auto w-full animate-fadeInUp delay-500 opacity-0 fill-mode-forwards">
               {canCompare && (
                 <button 
                   onClick={onCompare}
                   className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-full font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-purple-900/20"
                 >
                   Compare with another year <ArrowRight size={20} />
                 </button>
               )}
               <button 
                 onClick={downloadFinalCard}
                 className="flex items-center justify-center gap-2 bg-white text-black py-4 rounded-full font-bold text-lg hover:scale-[1.02] transition-transform"
               >
                 <Camera size={20} /> Save Image
               </button>
               <button 
                 onClick={onReset}
                 className="flex items-center justify-center gap-2 bg-zinc-800 text-white py-4 rounded-full font-bold text-lg"
               >
                 Start Over
               </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#09090b] text-white overflow-hidden flex flex-col">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-300 ${
                i < currentSlide ? 'w-full' : i === currentSlide ? 'w-full animate-progress' : 'w-0'
              }`} 
            />
          </div>
        ))}
      </div>

      <div key={animKey} className="flex-1 relative z-10 max-w-md mx-auto w-full h-full">
        {renderSlide()}
      </div>

      <div className="absolute inset-0 z-40 flex">
        <div className="w-1/3 h-full" onClick={prevSlide}></div>
        <div className="w-2/3 h-full" onClick={nextSlide}></div>
      </div>
      
      {currentSlide > 0 && currentSlide < 8 && (
         <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 pointer-events-none opacity-20 z-50">
            <ChevronLeft />
            <ChevronRight />
         </div>
      )}
    </div>
  );
};

export default StoryView;