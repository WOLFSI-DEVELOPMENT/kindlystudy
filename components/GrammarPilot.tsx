
import React, { useState } from 'react';
import { GrammarAnalysis, GrammarSegment } from '../types';
import { 
  Check, X, Sparkles, AlertCircle, Wand2, Copy, Undo, 
  SpellCheck, MessageCircle, Eye, Bot, RefreshCw, User, 
  FileText, List, ShieldAlert, Scan, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GrammarPilotProps {
  data: GrammarAnalysis;
}

type ToolId = 
  | 'grammar' | 'tone' | 'clarity' 
  | 'assistant' | 'rewrite' | 'humanize' | 'summarize' | 'outline'
  | 'plagiarism' | 'ai-detect' | 'citation';

export const GrammarPilot: React.FC<GrammarPilotProps> = ({ data }) => {
  const [segments, setSegments] = useState<GrammarSegment[]>(data.segments);
  const [history, setHistory] = useState<GrammarSegment[][]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolId>('grammar');

  // History Management
  const pushToHistory = () => {
    setHistory(prev => [...prev, segments]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setSegments(previous);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleAccept = (id: string) => {
    pushToHistory();
    setSegments(prev => prev.map(seg => {
      if (seg.id === id && seg.replacement) {
        return {
          ...seg,
          text: seg.replacement,
          type: 'text' as const,
          replacement: undefined,
          explanation: undefined
        };
      }
      return seg;
    }));
    setHoveredId(null);
  };

  const handleIgnore = (id: string) => {
    pushToHistory();
    setSegments(prev => prev.map(seg => {
      if (seg.id === id) {
        return { ...seg, type: 'text' as const };
      }
      return seg;
    }));
    setHoveredId(null);
  };

  const handleAcceptAll = () => {
    pushToHistory();
    setSegments(prev => prev.map(seg => {
      if ((seg.type === 'error' || seg.type === 'suggestion') && seg.replacement) {
        return {
          ...seg,
          text: seg.replacement,
          type: 'text' as const,
          replacement: undefined,
          explanation: undefined
        };
      }
      return seg;
    }));
  };

  const copyToClipboard = () => {
    const fullText = segments.map(s => s.text).join('');
    navigator.clipboard.writeText(fullText);
    alert("Copied to clipboard!");
  };

  const issueCount = segments.filter(s => s.type !== 'text').length;

  const SidebarSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="mb-6">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">{title}</h4>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  const ToolButton = ({ id, icon: Icon, label }: { id: ToolId, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTool(id)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
        activeTool === id
          ? 'bg-black text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={16} className={activeTool === id ? 'text-white' : 'text-gray-400'} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 items-start">
      
      {/* LEFT COLUMN: Main Editor */}
      <div className="flex-1 w-full min-w-0">
        {/* Header / Summary */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">Grammar Pilot</span>
                      {issueCount === 0 && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                              <Check size={12} /> All Clear
                          </span>
                      )}
                  </div>
                  <h2 className="text-3xl font-serif text-gray-900 mb-4">Editorial Feedback</h2>
                  <p className="text-gray-600 leading-relaxed max-w-2xl">{data.summary}</p>
              </div>
              
              <div className="flex flex-wrap gap-3 min-w-[160px] md:justify-end">
                  {history.length > 0 && (
                    <button
                        onClick={handleUndo}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
                        title="Undo last action"
                    >
                        <Undo size={16} />
                        <span className="hidden sm:inline">Undo</span>
                    </button>
                  )}
                  <button
                      onClick={handleAcceptAll}
                      disabled={issueCount === 0}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                          issueCount > 0 
                          ? 'bg-black text-white hover:scale-105 shadow-md' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                      <Wand2 size={16} />
                      <span>Fix All ({issueCount})</span>
                  </button>
                   <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                      <Copy size={16} />
                      <span>Copy</span>
                  </button>
              </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="bg-white p-8 md:p-16 rounded-[32px] shadow-sm border border-gray-100 min-h-[600px] leading-8 text-lg text-gray-800 font-light">
           {segments.map((segment) => {
               if (segment.type === 'text') {
                   return <span key={segment.id}>{segment.text}</span>;
               }
  
               const isError = segment.type === 'error';
               
               return (
                   <span 
                      key={segment.id}
                      className="relative inline-block group"
                      onMouseEnter={() => setHoveredId(segment.id)}
                      onMouseLeave={() => setHoveredId(null)}
                   >
                       <span 
                          className={`cursor-pointer border-b-2 transition-colors duration-200 pb-0.5 ${
                              isError 
                              ? 'border-red-400 bg-red-50/50 hover:bg-red-100' 
                              : 'border-yellow-400 bg-yellow-50/50 hover:bg-yellow-100'
                          }`}
                       >
                          {segment.text}
                       </span>
  
                       {/* Floating Tooltip */}
                       <AnimatePresence>
                          {hoveredId === segment.id && (
                              <motion.div 
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50 min-w-[280px]"
                              >
                                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 overflow-hidden relative">
                                      <div className="flex items-start gap-3 mb-3">
                                          <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isError ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                              {isError ? <AlertCircle size={14} /> : <Sparkles size={14} />}
                                          </div>
                                          <div>
                                              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                                  {isError ? 'Correction' : 'Suggestion'}
                                              </p>
                                              <p className="text-gray-900 font-medium leading-snug">
                                                  {segment.explanation}
                                              </p>
                                          </div>
                                      </div>
                                      
                                      <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                                              <span className="line-through decoration-red-400/50">{segment.text}</span>
                                              <span>→</span>
                                          </div>
                                          <div className="text-base font-semibold text-gray-900">
                                              {segment.replacement}
                                          </div>
                                      </div>
  
                                      <div className="flex gap-2">
                                          <button 
                                              onClick={() => handleAccept(segment.id)}
                                              className="flex-1 bg-black text-white py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                                          >
                                              Accept
                                          </button>
                                          <button 
                                              onClick={() => handleIgnore(segment.id)}
                                              className="flex-1 bg-white border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
                                          >
                                              Ignore
                                          </button>
                                      </div>
                                      
                                      {/* Little triangle pointer */}
                                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
                                  </div>
                              </motion.div>
                          )}
                       </AnimatePresence>
                   </span>
               );
           })}
        </div>
      </div>

      {/* RIGHT COLUMN: Floating Tools Sidebar */}
      <aside className="w-full lg:w-80 sticky top-8 flex-shrink-0">
         <div className="bg-white rounded-[32px] shadow-lg shadow-gray-200/50 border border-gray-100 p-6 min-h-[calc(100vh-6rem)] overflow-y-auto max-h-[calc(100vh-6rem)]">
             <div className="flex items-center gap-3 mb-8 px-2">
                 <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white">
                     <Wand2 size={20} />
                 </div>
                 <div>
                     <h3 className="font-bold text-gray-900 leading-tight">Tools</h3>
                     <p className="text-xs text-gray-500">AI Power-ups</p>
                 </div>
             </div>

             <SidebarSection title="Core Assistance">
                 <ToolButton id="grammar" icon={SpellCheck} label="Grammar & Spell" />
                 <ToolButton id="tone" icon={MessageCircle} label="Tone Detector" />
                 <ToolButton id="clarity" icon={Eye} label="Clarity & Concise" />
             </SidebarSection>

             <SidebarSection title="Generative & Editing">
                 <ToolButton id="assistant" icon={Bot} label="AI Assistant" />
                 <ToolButton id="rewrite" icon={RefreshCw} label="Rewriter" />
                 <ToolButton id="humanize" icon={User} label="Humanizer" />
                 <ToolButton id="summarize" icon={FileText} label="Summarizer" />
                 <ToolButton id="outline" icon={List} label="Outliner" />
             </SidebarSection>

             <SidebarSection title="Authenticity">
                 <ToolButton id="plagiarism" icon={ShieldAlert} label="Plagiarism Check" />
                 <ToolButton id="ai-detect" icon={Scan} label="AI Detector" />
                 <ToolButton id="citation" icon={Quote} label="Citation Finder" />
             </SidebarSection>

             {/* Pro Banner in sidebar */}
             <div className="mt-8 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white text-center">
                 <Sparkles size={20} className="mx-auto mb-2 text-yellow-400" />
                 <p className="text-sm font-bold mb-1">Upgrade to Pro</p>
                 <p className="text-xs text-gray-400 mb-3">Unlock unlimited AI checks</p>
                 <button className="w-full py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-gray-100">
                     View Plans
                 </button>
             </div>
         </div>
      </aside>

    </div>
  );
};
