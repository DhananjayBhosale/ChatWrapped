import React, { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Message } from '../types';
import { analyzeMessages } from '../utils/parser';
import { 
  ArrowDownRight, 
  Sun, 
  Moon, 
  Flame, 
  Camera, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';

interface ComparisonViewProps {
  messages: Message[];
  baseYear: number;
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ messages, baseYear, onClose }) => {
  // 1. Selection State vs Story State
  const [targetYear, setTargetYear] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const finalRef = useRef<HTMLDivElement>(null);

  // Available years (excluding base year)
  const availableYears = useMemo(() => {
    const years = new Set(messages.map(m => m.date.getFullYear()));
    years.delete(baseYear);
    return Array.from(years).sort().reverse();
  }, [messages, baseYear]);

  // Analyze Data
  const baseData = useMemo(() => analyzeMessages(messages, baseYear), [messages, baseYear]);
  const targetData = useMemo(() => targetYear ? analyzeMessages(messages, targetYear) : null, [messages, targetYear]);

  const nextSlide = () => {
    if (currentSlide < 5) { // 5 slides total
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

  const downloadCard = async () => {
    if (!finalRef.current) return;
    try {
      const canvas = await html2canvas(finalRef.current, { backgroundColor: '#09090b', scale: 2 });
      const link = document.createElement('a');
      link.download = `chat-compare-${baseYear}-vs-${targetYear}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (e) { console.error(e); }
  };

  // Helper to determine day/night vibe
  const getHourIcon = (hour: number) => {
    return (hour >= 6 && hour < 18) ? <Sun className="w-8 h-8 text-yellow-400" /> : <Moon className="w-8 h-8 text-indigo-400" />;
  };

  const formatNum = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n;

  // Render Logic
  if (!targetYear || !targetData) {
    // YEAR SELECTION SCREEN
    return (
      <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center p-6 animate-fadeIn">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-black mb-8 text-center">
          Compare {baseYear} with...
        </h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-md">
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => { setTargetYear(year); setCurrentSlide(0); }}
              className="px-6 py-3 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-white hover:text-black hover:scale-105 transition-all font-bold text-lg"
            >
              {year}
            </button>
          ))}
          {availableYears.length === 0 && (
            <p className="text-zinc-500">No other years available in this chat file.</p>
          )}
        </div>
      </div>
    );
  }

  // COMPARISON SLIDES
  const renderComparisonSlide = () => {
    const growth = ((baseData.totalMessages - targetData.totalMessages) / targetData.totalMessages) * 100;
    
    switch (currentSlide) {
      // 1. MESSAGES GROWTH
      case 0:
        return (
          <div className="flex flex-col justify-center h-full px-8 text-center">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-500 mb-12">Message Growth</h2>
            
            <div className="flex justify-center items-end gap-8 mb-12">
               <div className="flex flex-col items-center opacity-60 scale-90">
                 <div className="text-3xl font-bold text-zinc-400">{targetYear}</div>
                 <div className="h-32 w-16 bg-zinc-800 rounded-t-lg relative mt-4">
                    <div className="absolute bottom-2 w-full text-center font-mono text-sm">{formatNum(targetData.totalMessages)}</div>
                 </div>
               </div>
               <div className="flex flex-col items-center animate-fadeInUp">
                 <div className="text-4xl font-black text-white">{baseYear}</div>
                 <div className="h-48 w-20 bg-purple-500 rounded-t-lg relative mt-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                    <div className="absolute bottom-4 w-full text-center font-bold">{formatNum(baseData.totalMessages)}</div>
                 </div>
               </div>
            </div>

            <div className="text-5xl font-black mb-4 flex items-center justify-center gap-2 animate-scaleIn">
              {growth > 0 ? <TrendingUp className="text-green-400" /> : <ArrowDownRight className="text-red-400" />}
              {Math.abs(growth).toFixed(0)}%
              <span className="text-2xl font-normal text-zinc-400">{growth > 0 ? 'Louder' : 'Quieter'}</span>
            </div>
            
            <p className="text-zinc-400 italic">
               "{growth > 0 ? 'This chat definitely escalated.' : 'A quieter year, but still legendary.'}"
            </p>
          </div>
        );

      // 2. PEAK HOUR SHIFT
      case 1:
        return (
          <div className="flex flex-col justify-center h-full px-8">
             <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-500 mb-12 text-center">Peak Hour Shift</h2>

             <div className="space-y-8">
               {/* Old Year */}
               <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 flex items-center justify-between opacity-60">
                  <div>
                    <div className="text-sm text-zinc-500 font-bold mb-1">{targetYear}</div>
                    <div className="text-4xl font-black">{targetData.busiestHour}:00</div>
                  </div>
                  {getHourIcon(targetData.busiestHour)}
               </div>

               {/* Arrow */}
               <div className="flex justify-center text-zinc-600">
                 <ArrowDownRight size={32} />
               </div>

               {/* New Year */}
               <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-6 rounded-2xl border border-white/10 flex items-center justify-between animate-fadeInUp">
                  <div>
                    <div className="text-sm text-purple-400 font-bold mb-1">{baseYear}</div>
                    <div className="text-5xl font-black text-white">{baseData.busiestHour}:00</div>
                  </div>
                  <div className="animate-pulse">
                    {getHourIcon(baseData.busiestHour)}
                  </div>
               </div>
             </div>

             <p className="text-center mt-12 text-zinc-400 italic animate-fadeIn delay-500 opacity-0 fill-mode-forwards">
               "From {targetData.busiestHour >= 18 || targetData.busiestHour < 6 ? 'Night Owls' : 'Early Birds'} to {baseData.busiestHour >= 18 || baseData.busiestHour < 6 ? 'Night Owls' : 'Daytime Chaos'}."
             </p>
          </div>
        );

      // 3. STREAK EVOLUTION
      case 2:
        return (
          <div className="flex flex-col justify-center h-full px-8 text-center">
             <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-500 mb-12">Streak Evolution</h2>
             
             <div className="flex justify-between items-center px-4 mb-8">
                <div className="text-center opacity-60">
                   <div className="text-2xl font-bold text-zinc-500">{targetYear}</div>
                   <div className="text-4xl font-black mt-2">{targetData.longestStreak}d</div>
                </div>
                <div className="h-12 w-[1px] bg-zinc-700"></div>
                <div className="text-center animate-scaleIn">
                   <div className="text-3xl font-bold text-white">{baseYear}</div>
                   <div className="text-6xl font-black text-orange-500 mt-2">{baseData.longestStreak}d</div>
                </div>
             </div>

             <div className="flex justify-center gap-2 text-orange-500 mb-8">
               <Flame size={48} className="animate-bounce-slow" />
             </div>

             <p className="text-xl text-white font-medium animate-fadeInUp delay-300 opacity-0 fill-mode-forwards">
                "Consistency level: {baseData.longestStreak > targetData.longestStreak ? 'Upgraded' : 'Relaxed'}."
             </p>
          </div>
        );

      // 4. PARTICIPATION CHANGE
      case 3:
        const topUserBase = baseData.users[0];
        const topUserTarget = targetData.users.find(u => u.name === topUserBase.name) || { messageCount: 0 };
        const totalBase = baseData.totalMessages;
        const totalTarget = targetData.totalMessages;
        
        const pctBase = (topUserBase.messageCount / totalBase) * 100;
        const pctTarget = totalTarget > 0 ? (topUserTarget.messageCount / totalTarget) * 100 : 0;
        const delta = pctBase - pctTarget;

        return (
          <div className="flex flex-col justify-center h-full px-8">
             <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-500 mb-12 text-center">Main Character Energy</h2>

             <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center animate-fadeInUp">
               <div className="text-xl font-bold text-white mb-2">{topUserBase.name}</div>
               <div className="text-zinc-500 text-sm mb-6">Chat Dominance</div>

               <div className="flex justify-center items-end gap-6 mb-4">
                 <div className="text-zinc-500 text-2xl font-bold">{pctTarget.toFixed(0)}%</div>
                 <div className="text-zinc-700 pb-2">➜</div>
                 <div className="text-white text-6xl font-black">{pctBase.toFixed(0)}%</div>
               </div>

               <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${delta > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                 {delta > 0 ? '+' : ''}{delta.toFixed(1)}% Change
               </div>
             </div>

             <p className="text-center mt-12 text-zinc-400 italic">
               "{delta > 5 ? 'Someone definitely started typing more.' : 'Still holding the crown.'}"
             </p>
          </div>
        );

      // 5. SUMMARY
      case 4:
        return (
          <div className="flex flex-col h-full pt-8 pb-12 px-6">
            <h2 className="text-center text-xl font-bold mb-6 text-zinc-400">Comparison Wrapped</h2>
            
            {/* Capture Target */}
            <div ref={finalRef} className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] shadow-2xl overflow-hidden aspect-[9/16] mx-auto w-full max-w-sm flex flex-col justify-center gap-6 animate-scaleIn">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
              
              <div className="text-center">
                 <div className="text-3xl font-black text-white">{targetYear} vs {baseYear}</div>
                 <div className="text-zinc-500 text-sm font-bold tracking-widest uppercase mt-1">Same chat, different energy</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center mt-4">
                 <div className="bg-zinc-800/50 p-4 rounded-2xl">
                    <div className="text-xs text-zinc-500 uppercase">Growth</div>
                    <div className={`text-2xl font-black ${growth > 0 ? 'text-green-400' : 'text-zinc-300'}`}>
                       {growth > 0 ? '+' : ''}{growth.toFixed(0)}%
                    </div>
                 </div>
                 <div className="bg-zinc-800/50 p-4 rounded-2xl">
                    <div className="text-xs text-zinc-500 uppercase">Streak</div>
                    <div className="text-2xl font-black text-orange-400">{baseData.longestStreak}d</div>
                 </div>
                 <div className="bg-zinc-800/50 p-4 rounded-2xl">
                    <div className="text-xs text-zinc-500 uppercase">Peak</div>
                    <div className="text-xl font-black text-cyan-400">{baseData.busiestHour}:00</div>
                 </div>
                 <div className="bg-zinc-800/50 p-4 rounded-2xl">
                    <div className="text-xs text-zinc-500 uppercase">Msgs</div>
                    <div className="text-xl font-black text-purple-400">{formatNum(baseData.totalMessages)}</div>
                 </div>
              </div>

              <div className="mt-8 text-center">
                <div className="text-sm text-zinc-600">Generated by ChatWrapped</div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={downloadCard}
                className="bg-white text-black py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <Camera size={20}/> Save Comparison
              </button>
              <button onClick={onClose} className="text-zinc-500 py-2 hover:text-white">
                Back to Story
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#09090b] text-white flex flex-col z-40">
       {/* Progress Bar */}
       <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full bg-blue-500 transition-all duration-300 ${i < currentSlide ? 'w-full' : i === currentSlide ? 'w-full animate-progress' : 'w-0'}`} />
          </div>
        ))}
      </div>

      <div key={animKey} className="flex-1 relative z-10 max-w-md mx-auto w-full h-full">
         {renderComparisonSlide()}
      </div>

      <div className="absolute inset-0 z-40 flex">
        <div className="w-1/3 h-full" onClick={prevSlide}></div>
        <div className="w-2/3 h-full" onClick={nextSlide}></div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 pointer-events-none opacity-20 z-50">
        <ChevronLeft />
        <ChevronRight />
      </div>
    </div>
  );
};

export default ComparisonView;