import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-zinc-800 last:border-none">
      <button 
        onClick={onClick}
        className="w-full flex justify-between items-center py-4 text-left focus:outline-none group"
      >
        <span className={`font-medium text-sm md:text-base transition-colors ${isOpen ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
          {question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[200px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-zinc-400 text-sm leading-relaxed pr-4">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is my WhatsApp chat uploaded anywhere?",
      a: "No. Your chat is never uploaded. All processing happens entirely inside your browser on your own device."
    },
    {
      q: "Does this app send data to any server?",
      a: "No. There is no backend processing at all. Once the page loads, you can even turn off your internet and it will still work."
    },
    {
      q: "How does it work offline?",
      a: "The chat file is read and analyzed locally using JavaScript. Nothing leaves your device — the app simply reads the file you provide and generates stats in your browser."
    },
    {
      q: "Can I really disconnect the internet and try?",
      a: "Yes. Load the page, turn off Wi-Fi or mobile data, then upload your chat file. You’ll see that everything still works."
    },
    {
      q: "Is my chat stored anywhere?",
      a: "No. Your chat is not stored, saved, or cached. Once you refresh or close the page, the data is gone."
    },
    {
      q: "Do I need to sign up or log in?",
      a: "No accounts, no sign-ups, no logins. Just upload your chat file and view your wrapped."
    },
    {
      q: "Is this open source?",
      a: "Yes. The code is open source, so anyone can verify how it works."
    },
    {
      q: "Is this an official WhatsApp product?",
      a: "No. This is an independent tool and is not affiliated with WhatsApp or Meta."
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-24 px-6 mb-12 animate-fadeIn delay-1000 opacity-0 fill-mode-forwards">
      <div className="text-center mb-8">
        <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">
          Still curious? Here’s how everything stays private.
        </h3>
        <p className="text-zinc-600 text-xs">
          Transparency matters. That’s why everything runs locally.
        </p>
      </div>
      
      <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl px-6 py-2">
        {faqs.map((faq, index) => (
          <FAQItem 
            key={index}
            question={faq.q}
            answer={faq.a}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;