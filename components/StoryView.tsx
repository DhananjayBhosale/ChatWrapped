import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { AnalysisResult } from '../types';
import WordSearch from './WordSearch';
import { 
  Flame, Clock, MessageSquarePlus, Camera, ChevronRight, ChevronLeft, 
  ArrowRight, Search, Zap, Moon, Sun, MessageCircle, BarChart3, Users
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
  const [showSearch, setShowSearch] = useState(false);
  const finalCardRef = useRef<HTMLDivElement>(null);

  const TOTAL_SLIDES = 15;
  const isGroup = data.users.length > 2;

  // Data helpers
  const u1 = data.users[0] || { name: '?', color: '#ccc', messageCount: 0 };
  const u2 = data.users[1] || { name: '?', color: '#ccc', messageCount: 0 };

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
  
  const downloadFinalCard = async () => {
    if (!finalCardRef.current) return;
    try {
      const canvas = await html2canvas(finalCardRef.current, { backgroundColor: '#09090b', scale: 2 });
      const link = document.createElement('a');
      link.download = `chat-wrapped-${selectedYear || 'all-time'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) { console.error(err); }
  };

  // Reusable Background Elements
  const FloatingBubbles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <div className="absolute top-[10%] left-[10%] w-24 h-24 bg-purple-500 rounded-full blur-[60px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[10%] w-32 h-32 bg-blue-500 rounded-full blur-[60px] animate-pulse delay-1000" />
      <div className="absolute top-[40%] left-[50%] w-16 h-16 bg-pink-500 rounded-full blur-[40px] animate-bounce-slow" />
    </div>
  );

  const getPersonality = (avgWords: number) => {
    if (avgWords < 4) return { label: "One-word Texter", color: "text-blue-400" };
    if (avgWords < 8) return { label: "Quick Replier", color: "text-green-400" };
    if (avgWords < 15) return { label: "Balanced Texter", color: "text-purple-400" };
    return { label: "Paragraph Texter", color: "text-orange-400" };
  };

  const renderSlide = () => {
    switch (currentSlide) {
      /* 1. INTRO */
      case 0:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 relative">
            <FloatingBubbles />
            <div className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-green-500/20 animate-scaleIn">
              <MessageCircle size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 animate-fadeInUp">
              WhatsApp Wrapped<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                {selectedYear || "2025"}
              </span>
            </h1>
            <p className="text-zinc-400 text-lg animate-fadeIn delay-300 opacity-0 fill-mode-forwards">
              One chat. Too many messages.
            </p>
            <div className="absolute bottom-12 animate-bounce">
              <p className="text-xs text-zinc-600 uppercase tracking-widest">Tap to start</p>
            </div>
          </div>
        );

      /* 2. TOTAL MESSAGES */
      case 1:
        return (
          <div className="flex flex-col justify-center h-full px-8 relative overflow-hidden">
            <div className="absolute -right-20 top-20 opacity-10 rotate-12">
               <MessageCircle size={300} />
            </div>
            <h2 className="text-7xl font-black mb-2 animate-countUp leading-none text-white">
              {formatNum(data.totalMessages)}
            </h2>
            <h3 className="text-3xl font-bold text-zinc-400 mb-8 animate-slideInRight delay-100 opacity-0 fill-mode-forwards">
              messages sent
            </h3>
            <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/5 animate-fadeInUp delay-300 opacity-0 fill-mode-forwards">
               <p className="text-lg text-purple-200">
                 "That's a lot of typing."
               </p>
            </div>
          </div>
        );

      /* 3. WHO TALKED MORE */
      case 2:
        const p1 = (u1.messageCount / data.totalMessages) * 100;
        const p2 = (u2.messageCount / data.totalMessages) * 100;
        return (
          <div className="flex flex-col h-full relative">
            <div className="absolute top-8 left-0 w-full text-center z-20">
              <h2 className="text-xl font-bold uppercase tracking-widest text-white/80">Who Talked More?</h2>
            </div>
            <div className="flex-1 flex w-full h-full">
              <div style={{ width: `${p1}%`, backgroundColor: u1.color }} className="relative flex flex-col justify-end p-4 border-r border-black/10 transition-all duration-1000 ease-out animate-growWidth">
                 <div className="mb-20 animate-fadeIn delay-500 opacity-0 fill-mode-forwards">
                   <div className="text-4xl font-black">{p1.toFixed(0)}%</div>
                   <div className="font-bold truncate opacity-90">{u1.name}</div>
                   {p1 > p2 && <div className="mt-2 inline-block bg-black/20 px-2 py-1 rounded text-xs font-bold">TOP YAPPER</div>}
                 </div>
              </div>
              <div style={{ width: `${p2}%`, backgroundColor: u2.color }} className="relative flex flex-col justify-end p-4 transition-all duration-1000 ease-out animate-growWidth">
                 <div className="mb-20 animate-fadeIn delay-500 opacity-0 fill-mode-forwards text-right">
                   <div className="text-4xl font-black">{p2.toFixed(0)}%</div>
                   <div className="font-bold truncate opacity-90">{u2.name}</div>
                   {p2 > p1 && <div className="mt-2 inline-block bg-black/20 px-2 py-1 rounded text-xs font-bold">TOP YAPPER</div>}
                 </div>
              </div>
            </div>
          </div>
        );

      /* 4. WORD COUNT WAR */
      case 3:
        return (
          <div className="flex flex-col justify-center h-full px-6">
             <h2 className="text-3xl font-black mb-12 text-center">Verbose vs Concise</h2>
             {data.users.slice(0, 3).map((u, i) => (
               <div key={i} className="mb-8 animate-slideInUp" style={{ animationDelay: `${i*100}ms` }}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-zinc-300">{u.name}</span>
                    <span className="text-zinc-500">{formatNum(u.wordCount)} words</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${(u.wordCount / Math.max(...data.users.map(u=>u.wordCount))) * 100}%`, backgroundColor: u.color }}
                    />
                  </div>
                  <div className="text-xs text-zinc-600 mt-1">Avg msg length: {u.avgLength} words</div>
               </div>
             ))}
             <p className="text-center text-zinc-400 mt-4 italic animate-fadeIn delay-500 opacity-0 fill-mode-forwards">
               "{data.users.sort((a,b) => b.avgLength - a.avgLength)[0].name} writes novels."
             </p>
          </div>
        );

      /* 5. TYPING PERSONALITY SPECTRUM (New Design) */
      case 4:
        const user1 = data.users[0];
        const user2 = data.users[1] || data.users[0]; // Fallback for safety
        
        const personality1 = getPersonality(user1.avgLength);
        const personality2 = getPersonality(user2.avgLength);

        // If personalities are identical, we force a slight differentiation in the text/vibe
        const sameCategory = personality1.label === personality2.label;
        const caption = sameCategory 
          ? `Both of you are ${personality1.label}s, but ${user1.avgLength > user2.avgLength ? user1.name : user2.name} is slightly more verbose.`
          : `${user1.name} keeps it ${user1.avgLength < user2.avgLength ? 'brief' : 'detailed'}, while ${user2.name} ${user2.avgLength > user1.avgLength ? 'writes essays' : 'gets to the point'}.`;

        return (
          <div className="flex flex-col h-full px-6 py-8">
            <div className="text-center mb-8">
               <h2 className="text-xl uppercase tracking-widest text-zinc-500 font-bold">Typing Styles</h2>
               <div className="text-3xl font-black text-white mt-2">The Spectrum</div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6">
              {[user1, user2].map((u, i) => {
                const pers = getPersonality(u.avgLength);
                const pctShort = Math.round((u.shortMessageCount / u.messageCount) * 100);
                const pctLong = Math.round((u.longMessageCount / u.messageCount) * 100);
                
                return (
                  <div key={i} className="bg-zinc-900/80 rounded-3xl p-6 border border-white/5 animate-slideInRight" style={{ animationDelay: `${i*150}ms` }}>
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <div className="font-bold text-2xl text-white">{u.name}</div>
                          <div className={`text-sm font-bold uppercase tracking-wide mt-1 ${pers.color}`}>{pers.label}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-4xl font-black text-zinc-700 opacity-30">{u.avgLength}</div>
                          <div className="text-[10px] text-zinc-500 uppercase">Avg Words</div>
                       </div>
                    </div>

                    {/* Mini Meter */}
                    <div className="flex items-center gap-2 mt-4 text-xs font-mono text-zinc-400">
                       <span className={pctShort > 40 ? 'text-white font-bold' : ''}>{pctShort}% Short</span>
                       <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                          <div className="h-full bg-blue-500" style={{ width: `${pctShort}%` }} />
                          <div className="h-full bg-zinc-700" style={{ width: `${100 - pctShort - pctLong}%` }} />
                          <div className="h-full bg-orange-500" style={{ width: `${pctLong}%` }} />
                       </div>
                       <span className={pctLong > 10 ? 'text-white font-bold' : ''}>{pctLong}% Long</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 text-center px-4">
               <p className="text-zinc-300 italic text-lg animate-fadeIn delay-500 opacity-0 fill-mode-forwards leading-relaxed">
                 "{caption}"
               </p>
            </div>
            
            {/* Background Decor */}
            <div className="absolute top-1/4 left-0 -translate-x-1/2 text-8xl opacity-5 pointer-events-none select-none">💬</div>
            <div className="absolute bottom-1/4 right-0 translate-x-1/2 text-8xl opacity-5 pointer-events-none select-none">📝</div>
          </div>
        );

      /* 6. MOST USED WORDS */
      case 5:
        return (
          <div className="flex flex-col justify-center h-full px-6">
            <h2 className="text-3xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Signature Vocabulary</h2>
            <div className="space-y-6">
              {data.users.slice(0, 2).map((u, i) => (
                <div key={i} className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 animate-slideInRight" style={{ animationDelay: `${i*200}ms` }}>
                  <div className="font-bold text-zinc-400 mb-3 text-sm uppercase">{u.name}'s Favorites</div>
                  <div className="flex flex-wrap gap-2">
                    {u.topWords.map((w, j) => (
                      <span key={j} className="px-3 py-1 bg-white/10 rounded-full text-lg font-bold text-white">
                        {w.word}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      /* 7. TOP EMOJIS */
      case 6:
        return (
          <div className="flex flex-col justify-center h-full px-6 text-center">
             <h2 className="text-2xl uppercase tracking-widest text-zinc-500 mb-12">Emoji Language</h2>
             <div className="grid grid-cols-2 gap-8">
               {data.users.slice(0, 2).map((u, i) => (
                 <div key={i} className="flex flex-col items-center animate-fadeInUp" style={{ animationDelay: `${i*200}ms` }}>
                    <div className="text-6xl mb-4 animate-bounce-slow">{u.emojis[0]?.char || 'aaa'}</div>
                    <div className="flex gap-2 text-2xl opacity-60">
                      <span>{u.emojis[1]?.char}</span>
                      <span>{u.emojis[2]?.char}</span>
                    </div>
                    <div className="mt-4 font-bold text-zinc-400 text-sm">{u.name}</div>
                 </div>
               ))}
             </div>
             <p className="mt-12 text-zinc-300">"A picture is worth 1000 texts."</p>
          </div>
        );

      /* 8. INITIATOR */
      case 7:
        return (
          <div className="flex flex-col justify-center h-full px-8 text-center">
             <MessageSquarePlus className="w-20 h-20 text-pink-500 mx-auto mb-8 animate-bounce" />
             <div className="inline-block border border-pink-500/30 bg-pink-500/10 rounded-full px-6 py-2 text-pink-300 uppercase text-xs font-bold tracking-widest mb-8">
               Breaks the Silence Award
             </div>
             <h2 className="text-4xl font-black text-white mb-4 animate-scaleIn delay-200">
               {data.topStarter}
             </h2>
             <p className="text-lg text-zinc-400 mt-4">
               "Most likely to revive the dead chat."
             </p>
          </div>
        );

      /* 9. LATE REPLIES */
      case 8:
        return (
          <div className="flex flex-col justify-center h-full px-6">
            <h2 className="text-3xl font-black text-center mb-12">Speed Check ⏱️</h2>
            <div className="space-y-8">
               {data.users.slice(0, 2).map((u, i) => (
                 <div key={i} className="animate-slideInUp" style={{ animationDelay: `${i*150}ms` }}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-lg">{u.name}</span>
                      <span className="text-4xl font-black text-white">{u.avgReplyTimeMinutes}<span className="text-sm font-normal text-zinc-500 ml-1">min</span></span>
                    </div>
                    <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: `${Math.min((u.avgReplyTimeMinutes/120)*100, 100)}%` }} />
                    </div>
                 </div>
               ))}
            </div>
            <p className="text-center text-zinc-400 mt-12 italic">
               (Average response time when active)
            </p>
          </div>
        );

      /* 10. PEAK HOUR */
      case 9:
        const isNight = data.busiestHour >= 18 || data.busiestHour < 6;
        return (
          <div className="flex flex-col justify-center h-full px-8 text-center">
            {isNight ? <Moon className="w-20 h-20 text-indigo-400 mx-auto mb-8" /> : <Sun className="w-20 h-20 text-yellow-400 mx-auto mb-8" />}
            <h2 className="text-7xl font-black mb-4 animate-scaleIn">
              {data.busiestHour}:00
            </h2>
            <p className="text-2xl text-zinc-300 font-bold animate-fadeIn delay-300 opacity-0 fill-mode-forwards">
              "When things escalate."
            </p>
          </div>
        );

      /* 11. DAY VS NIGHT */
      case 10:
        const total = data.dayNightSplit.day + data.dayNightSplit.night;
        const dayPct = (data.dayNightSplit.day / total) * 100;
        return (
          <div className="flex flex-col h-full relative">
             <div className="flex-1 bg-yellow-100/10 flex flex-col items-center justify-center text-yellow-400 border-b border-white/5">
                <Sun size={48} className="mb-4 animate-spin-slow" />
                <div className="text-5xl font-black">{dayPct.toFixed(0)}%</div>
                <div className="text-xs uppercase tracking-widest mt-2">Daytime</div>
             </div>
             <div className="flex-1 bg-indigo-900/20 flex flex-col items-center justify-center text-indigo-400">
                <Moon size={48} className="mb-4" />
                <div className="text-5xl font-black">{(100 - dayPct).toFixed(0)}%</div>
                <div className="text-xs uppercase tracking-widest mt-2">Nighttime</div>
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4 py-2 rounded-full border border-white/10 text-xs font-bold uppercase">
               VS
             </div>
          </div>
        );

      /* 12. GREETINGS */
      case 11:
        const winnerGM = data.users.reduce((prev, curr) => (prev.morningCount > curr.morningCount) ? prev : curr);
        return (
          <div className="flex flex-col justify-center h-full px-6 text-center">
            <h2 className="text-2xl uppercase tracking-widest text-zinc-500 mb-8">Politeness Check</h2>
            <div className="bg-gradient-to-br from-orange-400 to-yellow-400 p-8 rounded-[2rem] text-black shadow-lg shadow-orange-500/20 animate-scaleIn">
               <div className="text-6xl mb-4">☀️</div>
               <div className="text-4xl font-black mb-2">{winnerGM.name}</div>
               <div className="text-sm font-bold opacity-80 uppercase">Morning Person</div>
               <div className="mt-4 text-xs font-mono opacity-70">{winnerGM.morningCount} "Good Morning"s sent</div>
            </div>
          </div>
        );

      /* 13. BYE */
      case 12:
        const winnerBye = data.users.reduce((prev, curr) => (prev.byeCount > curr.byeCount) ? prev : curr);
        return (
          <div className="flex flex-col justify-center h-full px-6 text-center">
             <h2 className="text-2xl uppercase tracking-widest text-zinc-500 mb-8">The Leaver</h2>
             <div className="border border-white/10 bg-zinc-900 p-8 rounded-[2rem] animate-fadeInUp">
               <div className="text-6xl mb-4">👋</div>
               <div className="text-4xl font-black text-white mb-2">{winnerBye.name}</div>
               <div className="text-zinc-400 text-sm">Most likely to say "Bye"</div>
               <div className="mt-4 text-xs text-zinc-600 font-mono">{winnerBye.byeCount} formal goodbyes</div>
             </div>
          </div>
        );

      /* 14. RAPID FIRE */
      case 13:
        return (
          <div className="flex flex-col justify-center h-full px-6">
            <div className="flex items-center gap-3 mb-8 text-orange-500 animate-pulse">
              <Zap size={32} />
              <h2 className="text-2xl font-bold uppercase tracking-wider">Rapid Fire</h2>
            </div>
            <div className="space-y-6">
               <div className="bg-zinc-900/80 p-6 rounded-2xl border-l-4 border-orange-500 animate-slideInRight delay-100">
                  <div className="text-5xl font-black text-white">{data.rapidFire.maxInMinute}</div>
                  <div className="text-zinc-500 text-xs uppercase font-bold mt-1">Messages in 1 Minute</div>
               </div>
               <div className="bg-zinc-900/80 p-6 rounded-2xl border-l-4 border-red-500 animate-slideInRight delay-300">
                  <div className="text-5xl font-black text-white">{data.rapidFire.maxInHour}</div>
                  <div className="text-zinc-500 text-xs uppercase font-bold mt-1">Messages in 1 Hour</div>
               </div>
            </div>
            <p className="mt-8 text-zinc-400 italic">"Chill? Never heard of her."</p>
          </div>
        );

      /* 15. FINAL CARD */
      case 14:
        return (
          <div className="flex flex-col h-full pt-6 pb-12 px-6 overflow-y-auto scrollbar-hide">
            <h2 className="text-center text-lg font-bold mb-4 animate-fadeIn text-zinc-400">
              The Receipt 🧾
            </h2>

            <div ref={finalCardRef} className="bg-zinc-950 border border-zinc-800 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden animate-scaleIn mx-auto w-full max-w-sm">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />
               
               <div className="flex items-center justify-between mb-6">
                 <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">ChatWrapped {selectedYear}</div>
                 <div className="text-xl">🔥</div>
               </div>

               <h3 className="text-2xl font-black text-white leading-tight mb-8">
                 {data.users.slice(0,2).map(u => u.name).join(isGroup ? ', ' : ' & ')}
               </h3>

               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <div className="text-zinc-500 text-xs uppercase mb-1">Total Msgs</div>
                    <div className="text-2xl font-black text-white">{formatNum(data.totalMessages)}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs uppercase mb-1">Streak</div>
                    <div className="text-2xl font-black text-orange-400">{data.longestStreak} days</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs uppercase mb-1">Peak Hour</div>
                    <div className="text-xl font-bold text-cyan-400">{data.busiestHour}:00</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs uppercase mb-1">Top Vibe</div>
                    <div className="text-xl">{data.users[0]?.emojis[0]?.char}</div>
                  </div>
               </div>

               <div className="border-t border-zinc-800 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-600">Top Chatter</span>
                    <span className="font-bold text-sm text-zinc-300">{u1.name}</span>
                  </div>
               </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 max-w-sm mx-auto w-full animate-fadeInUp delay-500 opacity-0 fill-mode-forwards relative z-50">
               <button onClick={() => setShowSearch(true)} className="bg-zinc-800 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                 <Search size={20} /> Search any word in the chat
               </button>
               <button onClick={downloadFinalCard} className="bg-white text-black py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                 <Camera size={20} /> Save Image
               </button>
               {canCompare && (
                 <button onClick={onCompare} className="text-zinc-400 text-sm py-2 hover:text-white">Compare Years</button>
               )}
               <button onClick={onReset} className="text-zinc-500 text-sm py-2 hover:text-white">Start Over</button>
            </div>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#09090b] text-white overflow-hidden flex flex-col font-sans">
      {/* Search Modal */}
      {showSearch && <WordSearch data={data} onClose={() => setShowSearch(false)} />}

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex gap-1 p-2 pt-4 safe-top">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-zinc-800/50 rounded-full overflow-hidden">
            <div className={`h-full bg-white transition-all duration-300 ${i < currentSlide ? 'w-full' : i === currentSlide ? 'w-full animate-progress' : 'w-0'}`} />
          </div>
        ))}
      </div>

      <div key={animKey} className="flex-1 relative z-10 max-w-md mx-auto w-full h-full">
        {renderSlide()}
      </div>

      <div className="absolute inset-0 z-30 flex">
        <div className="w-1/3 h-full" onClick={prevSlide} />
        <div className="w-2/3 h-full" onClick={nextSlide} />
      </div>
      
      {currentSlide > 0 && currentSlide < TOTAL_SLIDES - 1 && (
         <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 pointer-events-none opacity-20 z-40">
            <ChevronLeft />
            <ChevronRight />
         </div>
      )}
    </div>
  );
};

export default StoryView;