import { useState, useMemo } from 'react';
import FileUpload from './components/FileUpload';
import StoryView from './components/StoryView';
import ComparisonView from './components/ComparisonView';
import { parseChatFile, analyzeMessages } from './utils/parser';
import { Message, AnalysisResult } from './types';

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
          </nav>

          <main className="flex-1 flex flex-col items-center justify-center relative z-20 pb-20">
            <div className="text-center mb-12 max-w-2xl px-6 animate-fadeIn">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                Your chat story,<br/> visualized.
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl">
                The "Spotify Wrapped" for your WhatsApp chats. <br/>
                <span className="text-zinc-500 text-sm mt-2 block">100% private. Processing happens on your device.</span>
              </p>
            </div>
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
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