import { useState, useMemo } from 'react';
import FileUpload from './components/FileUpload';
import StoryView from './components/StoryView';
import ComparisonView from './components/ComparisonView';
import { parseChatFile, analyzeMessages } from './utils/parser';
import { Message, AnalysisResult } from './types';
import { ShieldCheck, Github, FileText, Download, FolderOpen } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewState, setViewState] = useState<'upload' | 'story' | 'compare'>('upload');

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const result = await parseChatFile(file);
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
        alert('An unexpected error occurred parsing the file.');
      } finally {
        setIsLoading(false);
      }
    }, 500);
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
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
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

          <main className="flex-1 flex flex-col items-center justify-center relative z-20 pb-20 pt-10">
            <div className="text-center mb-10 max-w-2xl px-6 animate-fadeIn">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                Your chat story,<br/> visualized.
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl mb-8">
                The "Spotify Wrapped" for your WhatsApp chats.
              </p>

              <div className="bg-zinc-900/80 border border-green-900/30 rounded-2xl p-6 max-w-lg mx-auto backdrop-blur-sm shadow-xl shadow-green-900/5">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-green-400 font-bold tracking-wide">
                    <ShieldCheck size={20} />
                    <span>PRIVACY FIRST!</span>
                  </div>
                  <p className="text-zinc-300 text-sm font-medium leading-relaxed">
                    Your data is <span className="text-white font-bold">not uploaded</span> or stored anywhere.<br/>
                    It is processed locally on <span className="text-white font-bold">YOUR device</span> itself.
                  </p>
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-1" />
                  <p className="text-zinc-500 text-xs flex items-center gap-1">
                    Code is 
                    <a 
                      href="https://github.com/DhananjayBhosale/ChatWrapped" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-zinc-400 hover:text-white underline decoration-zinc-600 underline-offset-2 transition-colors flex items-center gap-1"
                    >
                      open source <Github size={10} />
                    </a>
                  </p>
                </div>
              </div>
            </div>
            
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />

            {/* How to Export Section */}
            <div className="mt-16 max-w-4xl px-6 w-full animate-fadeIn delay-700 opacity-0 fill-mode-forwards">
               <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs text-center mb-8">
                 How to export your chat
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-zinc-900/60 transition-colors">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-purple-400">
                      <Download size={20} />
                    </div>
                    <div className="text-white font-bold mb-2">1. Export Chat</div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Open WhatsApp Chat &gt; Tap Name/Menu &gt; Export Chat &gt; Select <strong className="text-zinc-300">"Without Media"</strong>.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-zinc-900/60 transition-colors">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-pink-400">
                      <FolderOpen size={20} />
                    </div>
                    <div className="text-white font-bold mb-2">2. Unzip File</div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      WhatsApp exports a <strong>.zip</strong> file. You must extract/unzip it to get the text file.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-zinc-900/60 transition-colors">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-cyan-400">
                      <FileText size={20} />
                    </div>
                    <div className="text-white font-bold mb-2">3. Upload Text</div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Drop the extracted <strong className="text-zinc-300">_chat.txt</strong> file in the box above.
                    </p>
                  </div>
               </div>
            </div>
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
        />
      )}
    </div>
  );
}

export default App;