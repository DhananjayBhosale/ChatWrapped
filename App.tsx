import { useState, useMemo } from 'react';
import JSZip from 'jszip';
import FileUpload from './components/FileUpload';
import StoryView from './components/StoryView';
import ComparisonView from './components/ComparisonView';
import FAQ from './components/FAQ';
import { parseChatFile, analyzeMessages } from './utils/parser';
import { Message, AnalysisResult } from './types';
import { ShieldCheck, Github, FileText, Download, FolderOpen, Check } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing...");
  const [viewState, setViewState] = useState<'upload' | 'story' | 'compare'>('upload');

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setLoadingText("Processing file...");
    
    // Give UI a moment to update
    setTimeout(async () => {
      try {
        let fileToParse = file;

        // Handle ZIP files locally
        if (file.name.toLowerCase().endsWith('.zip')) {
           setLoadingText("Unzipping locally...");
           try {
             const zip = await JSZip.loadAsync(file);
             let txtFile: JSZip.JSZipObject | null = null;
             
             // Fix: Explicitly cast the values to JSZipObject array to avoid 'unknown' type errors
             const zipFiles = Object.values(zip.files) as JSZip.JSZipObject[];
             
             // 1. Look for "_chat.txt" specifically (WhatsApp standard)
             const chatTxt = zipFiles.find(f => f.name.toLowerCase().includes('_chat.txt') && !f.dir);
             
             if (chatTxt) {
               txtFile = chatTxt;
             } else {
               // 2. Fallback: Find any .txt file that isn't a MacOS artifact
               const validTxtFiles = zipFiles.filter(f => 
                 f.name.toLowerCase().endsWith('.txt') && 
                 !f.dir && 
                 !f.name.includes('__MACOSX')
               );

               if (validTxtFiles.length > 0) {
                 // Prefer the largest file (most likely the chat log)
                 // Note: _data is internal, we can't reliably get size without processing, 
                 // so we just take the first one containing 'chat' or just the first one.
                 txtFile = validTxtFiles.find(f => f.name.toLowerCase().includes('chat')) || validTxtFiles[0];
               }
             }

             if (!txtFile) {
               alert("No valid .txt chat file found inside the ZIP archive.");
               setIsLoading(false);
               return;
             }

             setLoadingText("Extracting chat...");
             const content = await txtFile.async('string');
             
             // Create a new File object in memory to pass to our existing parser
             fileToParse = new File([content], txtFile.name, { type: 'text/plain' });

           } catch (zipError) {
             console.error(zipError);
             alert("Failed to unzip file. It might be corrupted or password protected.");
             setIsLoading(false);
             return;
           }
        }

        setLoadingText("Analyzing conversations...");
        const result = await parseChatFile(fileToParse);
        
        if (result.status === 'success') {
          setMessages(result.messages);
          if (result.messages.length > 0) {
            const lastYear = result.messages[result.messages.length - 1].date.getFullYear();
            setSelectedYear(lastYear);
          }
          setViewState('story');
        } else {
          alert('Error parsing file: ' + result.error);
        }
      } catch (e) {
        console.error(e);
        alert('An unexpected error occurred parsing the file.');
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  const handleReset = () => {
    setMessages([]);
    setSelectedYear(null);
    setViewState('upload');
  };

  const analyticsData: AnalysisResult = useMemo(() => {
    return analyzeMessages(messages, selectedYear || undefined);
  }, [messages, selectedYear]);

  // Check if comparison is possible (are there > 1 unique years?)
  const canCompare = useMemo(() => {
    const years = new Set(messages.map(m => m.date.getFullYear()));
    return years.size > 1 && selectedYear !== null;
  }, [messages, selectedYear]);

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white overflow-hidden selection:bg-purple-500/30 font-sans">
      
      {viewState === 'upload' && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Animated Background - Abstract Flow Lines */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            
            {/* Vertical Flow Lines */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute left-[15%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white to-transparent animate-flow-vertical" style={{ animationDuration: '15s', animationDelay: '0s' }}></div>
              <div className="absolute left-[35%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white to-transparent animate-flow-vertical" style={{ animationDuration: '25s', animationDelay: '5s' }}></div>
              <div className="absolute left-[65%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white to-transparent animate-flow-vertical" style={{ animationDuration: '20s', animationDelay: '2s' }}></div>
              <div className="absolute left-[85%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white to-transparent animate-flow-vertical" style={{ animationDuration: '30s', animationDelay: '8s' }}></div>
            </div>
          </div>

          <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full relative z-20">
            <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              ChatWrapped
            </div>
            <a 
              href="https://github.com/DhananjayBhosale/ChatWrapped" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <Github size={24} />
            </a>
          </nav>

          <main className="flex-1 flex flex-col items-center relative z-20 pt-2 pb-20">
            
            {/* 1. Privacy Banner (Top Priority) */}
            <div className="w-full max-w-2xl px-6 mb-10 animate-fadeInDown">
               <div className="bg-zinc-900/80 border border-green-500/20 rounded-2xl p-4 shadow-lg shadow-green-900/5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-green-500/10 rounded-full">
                       <ShieldCheck size={20} className="text-green-400" />
                     </div>
                     <div>
                       <h3 className="text-sm font-bold text-white">Privacy First</h3>
                       <p className="text-xs text-zinc-400">Your chats never leave your device.</p>
                     </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-full"><Check size={10} className="text-green-500"/> No uploads</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-full"><Check size={10} className="text-green-500"/> No accounts</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-full"><Check size={10} className="text-green-500"/> Offline only</div>
                  </div>
               </div>
            </div>
            
            {/* 2. Headline */}
            <div className="text-center mb-8 max-w-2xl px-6 animate-fadeIn delay-100">
              <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-4 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                  So… you talked a lot
                </span>
                <span className="ml-2">👀</span>
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl">
                This is your "WhatsApp Wrapped 😎"
              </p>
            </div>
            
            {/* 3. Upload Zone (High Priority) */}
            <div className="w-full max-w-xl px-6 mb-16 animate-fadeInUp delay-200">
               <FileUpload 
                 onFileUpload={handleFileUpload} 
                 isLoading={isLoading} 
                 statusText={loadingText}
               />
            </div>

            {/* 4. How to Export */}
            <div className="max-w-4xl px-6 w-full animate-fadeIn delay-300 opacity-0 fill-mode-forwards mb-24">
               <h3 className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] text-center mb-8">
                 Three simple steps
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="bg-zinc-900/30 border border-zinc-800/60 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-zinc-900/60 transition-colors group">
                    <div className="w-10 h-10 bg-zinc-800/80 rounded-full flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                      <Download size={18} />
                    </div>
                    <div className="text-white font-bold text-sm mb-1">1. Export Chat</div>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                      WhatsApp Settings &gt; Export Chat &gt; <span className="text-zinc-300">"Without Media"</span>.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-zinc-900/30 border border-zinc-800/60 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-zinc-900/60 transition-colors group">
                    <div className="w-10 h-10 bg-zinc-800/80 rounded-full flex items-center justify-center mb-4 text-pink-400 group-hover:scale-110 transition-transform">
                      <FolderOpen size={18} />
                    </div>
                    <div className="text-white font-bold text-sm mb-1">2. Unzip File</div>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                      If you get a <strong>.zip</strong>, extract it to find the <span className="text-zinc-300">_chat.txt</span> file.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-zinc-900/30 border border-zinc-800/60 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-zinc-900/60 transition-colors group">
                    <div className="w-10 h-10 bg-zinc-800/80 rounded-full flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
                      <FileText size={18} />
                    </div>
                    <div className="text-white font-bold text-sm mb-1">3. Drop & View</div>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                      Upload the text file above to generate your story instantly.
                    </p>
                  </div>
               </div>
            </div>

            {/* FAQ is a permanent trust section – do not remove */}
            <FAQ />

          </main>
        </div>
      )}

      {viewState === 'story' && (
        <StoryView 
          data={analyticsData} 
          selectedYear={selectedYear} 
          onReset={handleReset}
          onCompare={() => setViewState('compare')}
          canCompare={canCompare}
        />
      )}

      {viewState === 'compare' && selectedYear && (
        <ComparisonView
          messages={messages}
          baseYear={selectedYear}
          onClose={() => setViewState('story')}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;