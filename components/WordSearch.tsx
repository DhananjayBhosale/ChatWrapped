import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { AnalysisResult } from '../types';

interface WordSearchProps {
  data: AnalysisResult;
  onClose: () => void;
}

const WordSearch: React.FC<WordSearchProps> = ({ data, onClose }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ [user: string]: number } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const searchText = query.toLowerCase().trim();
    
    // Optimization: If single word and exists in dictionary, use pre-computed index
    if (!searchText.includes(' ') && data.wordOccurrences[searchText]) {
       setResult(data.wordOccurrences[searchText]);
       return;
    }

    // Fallback: Scan raw messages for phrases or words not in index (e.g. stop words, special chars)
    const counts: Record<string, number> = {};
    const messages = data.messages || []; // Fallback if interface not updated yet, though it should be

    messages.forEach(msg => {
       if (msg.content.toLowerCase().includes(searchText)) {
         counts[msg.sender] = (counts[msg.sender] || 0) + 1;
       }
    });

    setResult(counts);
  };

  const totalOccurrences = result ? (Object.values(result) as number[]).reduce((a, b) => a + b, 0) : 0;
  const sortedUsers = result 
    ? (Object.entries(result) as [string, number][]).sort(([,a], [,b]) => b - a)
    : [];

  return (
    <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-6 animate-fadeIn">
      <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-white">
        <X size={28} />
      </button>

      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8 mt-12 text-center">
        Word Hunter
      </h2>

      <form onSubmit={handleSearch} className="w-full max-w-md mx-auto mb-10">
        <div className="relative">
           <input 
             type="text" 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Search any word or phrase..."
             className="w-full bg-zinc-800/50 border border-zinc-700 rounded-full py-4 pl-6 pr-14 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
             autoFocus
           />
           <button type="submit" className="absolute right-2 top-2 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-500">
             <Search size={20} />
           </button>
        </div>
      </form>

      {result && (
        <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto animate-fadeInUp">
           {totalOccurrences === 0 ? (
             <div className="text-center text-zinc-500 text-lg">
               Nobody said "{query}". <br/>Awkward silence?
             </div>
           ) : (
             <>
               <div className="text-center mb-8">
                 <div className="text-6xl font-black text-white mb-2">{totalOccurrences}</div>
                 <div className="text-zinc-400 uppercase tracking-widest text-xs">Total Mentions</div>
               </div>

               <div className="space-y-4">
                 {sortedUsers.map(([user, count], _) => {
                   // Find user color
                   const userObj = data.users.find(u => u.name === user);
                   const color = userObj?.color || '#a1a1aa';
                   const percent = (count / totalOccurrences) * 100;

                   return (
                     <div key={user} className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
                       <div className="flex justify-between items-end mb-2">
                         <span className="font-bold text-lg truncate max-w-[70%]">{user}</span>
                         <span className="font-mono text-purple-300">{count}</span>
                       </div>
                       <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                         <div 
                           className="h-full rounded-full transition-all duration-1000 ease-out" 
                           style={{ width: `${percent}%`, backgroundColor: color }}
                         />
                       </div>
                     </div>
                   );
                 })}
               </div>
             </>
           )}
        </div>
      )}
    </div>
  );
};

export default WordSearch;