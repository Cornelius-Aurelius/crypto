import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { SearchSource } from '../types';

interface SourceCardProps {
  source: SearchSource;
  index: number;
}

const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => {
  // Extract domain for display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'web';
    }
  };

  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col justify-between p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 rounded-lg transition-all duration-200 h-full no-underline"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
          <Globe className="w-3 h-3 mr-1.5" />
          <span className="truncate max-w-[120px]">{getDomain(source.uri)}</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
          {index + 1}
        </div>
      </div>
      
      <h4 className="text-sm font-medium text-slate-200 group-hover:text-white line-clamp-2 leading-snug mb-2">
        {source.title}
      </h4>
      
      <div className="flex items-center text-xs text-slate-500 group-hover:text-slate-400 mt-auto">
        <span>Read source</span>
        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </a>
  );
};

export default SourceCard;
