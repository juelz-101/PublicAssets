import React, { useState } from 'react';
import type { AIPrompt } from '../types';

interface PromptBoxProps {
  prompt: AIPrompt;
}

const PromptBox: React.FC<PromptBoxProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-base-200/40 border border-neon-pink/20 rounded-lg overflow-hidden mb-6 group">
      <div className="flex items-center justify-between px-4 py-2 bg-neon-pink/5 border-b border-neon-pink/10">
        <div>
          <h4 className="text-sm font-bold text-neon-pink">{prompt.title}</h4>
          <p className="text-[10px] text-text-secondary">{prompt.description}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`px-3 py-1 rounded text-xs font-bold transition-all duration-200 ${
            copied 
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' 
              : 'bg-neon-pink/10 text-neon-pink border border-neon-pink/30 hover:bg-neon-pink/20'
          }`}
        >
          {copied ? 'Copied!' : 'Copy Prompt'}
        </button>
      </div>
      <div className="p-4 relative">
        <pre className="text-xs font-mono text-text-primary whitespace-pre-wrap break-words leading-relaxed">
          {prompt.content}
        </pre>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-[10px] text-neon-pink/50 font-mono uppercase tracking-widest">Instructional Prompt</span>
        </div>
      </div>
    </div>
  );
};

export default PromptBox;
