import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { AnalysisResult, UserStat } from '../types';
import WordSearch from './WordSearch';
import { 
  MessageSquarePlus, Camera, ChevronRight, ChevronLeft, 
  Search, Zap, Moon, Sun, MessageCircle, AlignLeft
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
  const [animateReveal, setAnimateReveal] = useState(false);
  const lastNavTime = useRef(0);
  const finalCardRef = useRef<HTMLDivElement>(null);

  const TOTAL_SLIDES = 15;
  const isGroup = data.users.length > 2;

  useEffect(() => {
    setAnimateReveal(false);
    const t = setTimeout(() => setAnimateReveal(true), 100);
    return () => clearTimeout(t);
  }, [currentSlide]);

  const defaultUser: UserStat = {
    name: '?', color: '#ccc', messageCount: 0, wordCount: 0, avgLength: 0, emojis: [], topWords: [], 
    avgReplyTimeMinutes: 0, morningCount: 0, nightCount: 0, byeCount: 0, textMessageCount: 0, 
    emojiMessageCount: 0, shortMessageCount: 0, longMessageCount: 0, oneSidedConversationsCount: 0
  };

  const u1 = data.users[0] || defaultUser;
  const u2 = data.users[1] || defaultUser;

  const handleSlideChange = (direction: 'next' | 'prev') => {
    const now = Date.now();
    const isRapid = now - lastNavTime.current < 300;
    lastNavTime.current = now;

    if (direction === 'next' && currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide(c => c + 1);
      if (!isRapid) setAnimKey(k => k + 1);
    } else if (direction === 'prev' && currentSlide > 0) {
      setCurrentSlide(c => c - 1);
      if (!isRapid) setAnimKey(k => k + 1);
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

  const getPersonality = (avgWords: number) => {
    if (avgWords < 4) return { label: "Short & Sweet", color: "text-blue-400" };
    if (avgWords < 8) return { label: "Quick Replier", color: "text-green-400" };
    if (avgWords < 15) return { label: "Balanced Texter", color: "text-purple-400" };
    return { label: "Storyteller", color: "text-orange-400" };
  };

  const renderSlide = () => {
    switch (currentSlide) {
      /* 1. INTRO */
      case 0:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 relative">
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
              Honest stats. Zero fluff.
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

      /* 3. WEEKLY RHYTHM (NEW) */
      case 2:
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const maxDay = Math.max(...data.dayOfWeekStats);
        const busiestDayIndex = data.dayOfWeekStats.indexOf(maxDay);
        
        return (
          <div className="flex flex-col justify-center h-full px-6">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-500 mb-8 text-center">Weekly Flow</h2>
            
            <div className="flex items-end justify-between h-48 gap-2 mb-8">
              {data.dayOfWeekStats.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full bg-zinc-800 rounded-t-lg transition-all duration-1000 ease-out flex items-end justify-center overflow-hidden" 
                       style={{ height: animateReveal ? `${(count / maxDay) * 100}%` : '0%' }}>
                     <div className={`w-full absolute bottom-0 top-0 opacity-20 ${i === busiestDayIndex ? 'bg-green-500' : 'bg-zinc-500'}`} />
                  </div>
                  <span className={`text-xs font-bold ${i === busiestDayIndex ? 'text-green-400' : 'text-zinc-600'}`}>{days[i]}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center animate-fadeInUp delay-300 opacity-0 fill-mode-forwards">
               <div className="text-4xl font-black text-white mb-2">{days[busiestDayIndex]}s</div>
               <p className="text-zinc-400">are your busiest days.</p>
            </div>
          </div>
        );

      /* 4. PEAK HOUR */
      case 3:
        const isNight = data.busiestHour >= 18 || data.busiestHour < 6;
        return (
          <div className="flex flex-col justify-center h-full px-8 text-center">
            {isNight ? <Moon className="w-20 h-20 text-indigo-400 mx-auto mb-8" /> : <Sun className="w-20 h-20 text-yellow-400 mx-auto mb-8" />}
            <h2 className="text-7xl font-black mb-4 animate-scaleIn">
              {data.busiestHour}:00
            </h2>
            <div className="inline-block bg-white/10 px-4 py-2 rounded-lg mb-6">
               <span className="text-sm font-bold uppercase tracking-widest text-white">Most Active Hour</span>
            </div>
            <p className="text-xl text-zinc-400 animate-fadeIn delay-300 opacity-0 fill-mode-forwards">
              "This is when conversations usually happen."
            </p>
          </div>
        );

      /* 5. BURSTS (NEW) */
      case 4:
        return (
          <div className="flex flex-col justify-center h-full px-6">
            <div className="flex items-center gap-3 mb-8 text-orange-500 animate-pulse justify-center">
              <Zap size={32} />
              <h2 className="text-2xl font-bold uppercase tracking-wider">Conversation Bursts</h2>
            </div>
            
            <div className="space-y-6">
               <div className="bg-zinc-900/80 p-6 rounded-3xl border-l-4 border-orange-500 animate-slideInRight delay-100">
                  <div className="text-6xl font-black text-white">{formatNum(data.burstStats.count)}</div>
                  <div className="text-zinc-500 text-sm font-medium mt-2">High-speed moments</div>
                  <div className="text-[10px] text-zinc-600 uppercase mt-1">(&gt;5 msgs in 1 min)</div>
               </div>
               
               <div className="bg-zinc-900/80 p-6 rounded-3xl border-l-4 border-red-500 animate-slideInRight delay-300">
                  <div className="text-5xl font-black text-white">{data.burstStats.maxBurst}</div>
                  <div className="text-zinc-500 text-sm font-medium mt-2">Messages in single burst</div>
               </div>
            </div>

            <p className="mt-12 text-center text-zinc-400 italic text-lg animate-fadeIn delay-500">
              "When replies came faster than thoughts."
            </p>
          </div>
        );

      /* 6. WHO TALKED MORE */
      case 5:
        const p1 = (u1.messageCount / data.totalMessages) * 100;
        const p2 = (u2.messageCount / data.totalMessages) * 100;
        const w1 = animateReveal ? p1 : 50;
        const w2 = animateReveal ? p2 : 50;

        return (
          <div className="flex flex-col h-full relative">
            <div className="absolute top-8 left-0 w-full text-center z-20">
              <h2 className="text-xl font-bold uppercase tracking-widest text-white/80">Message Volume</h2>
            </div>
            <div className="flex-1 flex w-full h-full">
              <div style={{ width: `${w1}%`, backgroundColor: u1.color, transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }} className="relative flex flex-col justify-end p-4 border-r border-black/10">
                 <div className="mb-20 animate-fadeIn delay-500 opacity-0 fill-mode-forwards">
                   <div className="text-4xl font-black">{p1.toFixed(0)}%</div>
                   <div className="font-bold truncate opacity-90">{u1.name}</div>
                 </div>
              </div>
              <div style={{ width: `${w2}%`, backgroundColor: u2.color, transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }} className="relative flex flex-col justify-end p-4">
                 <div className="mb-20 animate-fadeIn delay-500 opacity-0 fill-mode-forwards text-right">
                   <div className="text-4xl font-black">{p2.toFixed(0)}%</div>
                   <div className="font-bold truncate opacity-90">{u2.name}</div>
                 </div>
              </div>
            </div>
          </div>
        );

      /* 7. ONE SIDED DAYS (NEW) */
      case 6:
        const oneSidedUser = data.users.reduce((prev, curr) => (prev.oneSidedConversationsCount > curr.oneSidedConversationsCount) ? prev : curr);
        const hasOneSided = oneSidedUser.oneSidedConversationsCount > 0;

        return (
          <div className="flex flex-col justify-center h-full px-6 text-center">
             <h2 className="text-2xl uppercase tracking-widest text-zinc-500 mb-12">Solo Carry</h2>
             
             {hasOneSided ? (
               <>
                 <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800 animate-fadeInUp">
                   <div className="text-6xl mb-4">🎒</div>
                   <div className="text-4xl font-black text-white mb-2">{oneSidedUser.name}</div>
                   <div className="text-zinc-400 text-sm">Carried the chat on</div>
                   <div className="mt-2 text-5xl font-black text-orange-500">{oneSidedUser.oneSidedConversationsCount}</div>
                   <div className="text-xs text-zinc-600 uppercase tracking-widest mt-1">Days</div>
                 </div>
                 <p className="mt-8 text-zinc-500 text-sm px-8">
                   (Days where they sent &gt;75% of messages)
                 </p>
               </>
             ) : (
               <div className="animate-fadeIn">
                 <div className="text-6xl mb-6">⚖️</div>
                 <h3 className="text-3xl font-bold text-white mb-4">Perfectly Balanced</h3>
                 <p className="text-zinc-400">No one dominated the chat significantly on any specific day.</p>
               </div>
             )}
          </div>
        );

      /* 8. LONGEST MESSAGE (NEW) */
      case 7:
        return (
          <div className="flex flex-col justify-center h-full px-6">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-500 mb-8 text-center">The Essayist</h2>
            
            <div className="bg-zinc-800/80 rounded-t-3xl rounded-br-3xl p-6 animate-slideInUp shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-purple-500" />
               <div className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wide flex justify-between">
                 <span>{data.longestMessage.sender}</span>
                 <span>{new Date(data.longestMessage.date).toLocaleDateString()}</span>
               </div>
               
               <div className="text-white opacity-80 text-sm leading-relaxed max-h-48 overflow-hidden relative font-serif italic">
                 "{data.longestMessage.content.substring(0, 300)}..."
                 <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-zinc-800 to-transparent" />
               </div>

               <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <div className="text-4xl font-black text-white">{data.longestMessage.wordCount}</div>
                    <div className="text-[10px] text-zinc-500 uppercase">Words</div>
                  </div>
                  <AlignLeft className="text-zinc-600" />
               </div>
            </div>

            <p className="text-center mt-8 text-zinc-400 italic animate-fadeIn delay-300">
               "This deserved paragraphs."
            </p>
          </div>
        );

      /* 9. TEXT VS EMOJI BALANCE (ENHANCED) */
      case 8:
        const totalU1 = u1.textMessageCount + u1.emojiMessageCount;
        const u1EmojiPct = totalU1 > 0 ? (u1.emojiMessageCount / totalU1) * 100 : 0;
        
        const totalU2 = u2.textMessageCount + u2.emojiMessageCount;
        const u2EmojiPct = totalU2 > 0 ? (u2.emojiMessageCount / totalU2) * 100 : 0;

        return (
           <div className="flex flex-col justify-center h-full px-6">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-500 mb-12 text-center">Expressive Balance</h2>
              
              <div className="space-y-10">
                {[u1, u2].map((u, i) => {
                  const pct = i === 0 ? u1EmojiPct : u2EmojiPct;
                  return (
                    <div key={i} className="animate-slideInRight" style={{ animationDelay: `${i*150}ms` }}>
                       <div className="flex justify-between mb-2 font-bold text-white">
                         <span>{u.name}</span>
                         <span className="text-xs font-normal text-zinc-400 opacity-70">
                           {pct.toFixed(1)}% Emoji Usage
                         </span>
                       </div>
                       <div className="h-4 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                          <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
                          <div className="h-full bg-zinc-600" style={{ width: `${100-pct}%` }} />
                       </div>
                       <div className="flex justify-between mt-1 text-[10px] text-zinc-500 font-bold uppercase">
                          <span className="text-yellow-500">Emoji</span>
                          <span>Text</span>
                       </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-center mt-12 text-zinc-400 italic">
                "Different ways of expressing."
              </p>
           </div>
        );

      /* 10. MOST USED WORDS */
      case 9:
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

      /* 11. MOST REPEATED PHRASE (NEW) */
      case 10:
        const phrase = data.mostRepeatedPhrase;
        return (
          <div className="flex flex-col justify-center h-full px-6 text-center">
             <h2 className="text-2xl uppercase tracking-widest text-zinc-500 mb-8">On Repeat</h2>
             
             {phrase ? (
               <div className="animate-scaleIn">
                  <div className="text-6xl mb-6 opacity-30">❝</div>
                  <div className="text-4xl font-black text-white leading-tight mb-8">
                    {phrase.phrase}
                  </div>
                  <div className="inline-block bg-zinc-800 px-6 py-3 rounded-full mb-2">
                    <span className="text-2xl font-bold text-green-400">{phrase.count}</span>
                    <span className="text-sm text-zinc-400 ml-2 uppercase font-bold">Times</span>
                  </div>
                  <div className="text-zinc-500 text-sm mt-4">
                     Mostly said by <span className="text-white font-bold">{phrase.topUser}</span>
                  </div>
                  <div className="text-6xl mt-6 opacity-30">❞</div>
               </div>
             ) : (
               <p className="text-zinc-500">No specific repeated phrases found.</p>
             )}
          </div>
        );

      /* 12. SILENCE BREAKER (ENHANCED) */
      case 11:
        return (
          <div className="flex flex-col justify-center h-full px-8 text-center">
             <MessageSquarePlus className="w-20 h-20 text-pink-500 mx-auto mb-8 animate-bounce" />
             <div className="inline-block border border-pink-500/30 bg-pink-500/10 rounded-full px-6 py-2 text-pink-300 uppercase text-xs font-bold tracking-widest mb-8">
               Silence Breaker
             </div>
             <h2 className="text-4xl font-black text-white mb-2 animate-scaleIn delay-200">
               {data.silenceBreaker.name}
             </h2>
             <p className="text-zinc-400 text-sm mb-8">Most likely to revive the chat.</p>

             <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 inline-block">
                <div className="text-xs text-zinc-500 uppercase mb-1">Longest Silence Broken</div>
                <div className="text-2xl font-bold text-white">{data.silenceBreaker.maxSilenceHours} hours</div>
             </div>
          </div>
        );

      /* 13. LATE REPLIES */
      case 12:
        const diffReply = u1.avgReplyTimeMinutes - u2.avgReplyTimeMinutes;
        const replyCaption = Math.abs(diffReply) < 2 
          ? "You both reply at the same speed!" 
          : diffReply > 0 
             ? `${u1.name} takes longer to reply.` 
             : `${u2.name} takes longer to reply.`;

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
            <p className="text-center text-zinc-300 mt-12 italic font-medium px-4">
               "{replyCaption}"
            </p>
          </div>
        );

      /* 14. PERSONALITY SPECTRUM */
      case 13:
        const user1 = data.users[0];
        const user2 = data.users[1] || data.users[0]; 

        return (
          <div className="flex flex-col justify-center h-full px-6">
             <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-500 mb-12 text-center">Typing Styles</h2>
             <div className="space-y-6">
               {[user1, user2].map((u, i) => {
                 const p = getPersonality(u.avgLength);
                 return (
                   <div key={i} className="bg-zinc-900/80 p-6 rounded-2xl border border-white/5 animate-slideInRight" style={{ animationDelay: `${i*150}ms` }}>
                      <div className="flex justify-between items-center mb-2">
                         <div className="font-bold text-xl">{u.name}</div>
                         <div className={`text-xs font-bold px-3 py-1 rounded-full bg-white/5 ${p.color}`}>{p.label}</div>
                      </div>
                      <div className="text-zinc-500 text-sm">Avg {u.avgLength} words/msg</div>
                   </div>
                 )
               })}
             </div>
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
                    <div className="text-zinc-500 text-xs uppercase mb-1">Busiest Hour</div>
                    <div className="text-xl font-bold text-cyan-400">{data.busiestHour}:00</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs uppercase mb-1">Big Bursts</div>
                    <div className="text-xl font-bold text-pink-400">{data.burstStats.count}</div>
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
                 <Search size={20} /> Text Search (No AI)
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
        <div className="w-[40%] h-full" onClick={() => handleSlideChange('prev')} />
        <div className="w-[60%] h-full" onClick={() => handleSlideChange('next')} />
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