
import React, { useState, useEffect, useRef } from 'react';
import { StudyGuide } from '../types';
import { Sparkles, PenLine, Download, Share, Highlighter, Bold, Italic, Underline, Strikethrough, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimpleBarChart, PexelsImage } from './GenerativeSite';

interface NotebookViewProps {
  data: StudyGuide;
}

// Helper to wrap keywords in highlighting spans
const processInitialHtml = (text: string, keywords: string[] = []) => {
  if (!keywords.length) return text;
  // Escape text to prevent XSS if it wasn't trusted (Gemini output is generally safe-ish text, but good practice)
  // For this demo, we assume text is safe.
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  return text.replace(regex, '<span class="bg-yellow-100 px-1 rounded-sm text-gray-900 font-medium">$1</span>');
};

// Editable Rich Text Block
const EditableBlock = ({ 
  initialHtml, 
  tag, 
  className,
  placeholder
}: { 
  initialHtml: string, 
  tag: React.ElementType, 
  className?: string,
  placeholder?: string
}) => {
  const contentEditableRef = useRef<HTMLElement>(null);
  const Tag = tag;

  return (
    <Tag 
      ref={contentEditableRef}
      className={`outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 focus:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors duration-200 ${className}`}
      contentEditable
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: initialHtml }}
      data-placeholder={placeholder}
      onKeyDown={(e: React.KeyboardEvent) => {
         // Prevent default enter behavior for headers to avoid creating divs
         if (e.key === 'Enter' && tag !== 'p') {
             e.preventDefault();
             // Logic to jump to next block could go here
         }
      }}
    />
  );
};

const FormattingToolbar = () => {
    const [position, setPosition] = useState<{top: number, left: number} | null>(null);

    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed) {
                setPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Ensure we are inside the notebook (optional check, but good for multiple views)
            if (rect.width > 0) {
                setPosition({
                    top: rect.top - 60, // Position above text
                    left: rect.left + rect.width / 2
                });
            }
        };

        document.addEventListener('selectionchange', handleSelection);
        return () => document.removeEventListener('selectionchange', handleSelection);
    }, []);

    const executeCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
    };

    if (!position) return null;

    return (
        <div 
            className="fixed z-50 flex items-center gap-1 p-1 bg-black text-white rounded-full shadow-xl transform -translate-x-1/2 animate-in fade-in zoom-in duration-200"
            style={{ top: position.top, left: position.left }}
        >
            <button onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }} className="p-2 hover:bg-gray-700 rounded-full transition-colors"><Bold size={14} /></button>
            <button onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }} className="p-2 hover:bg-gray-700 rounded-full transition-colors"><Italic size={14} /></button>
            <button onMouseDown={(e) => { e.preventDefault(); executeCommand('underline'); }} className="p-2 hover:bg-gray-700 rounded-full transition-colors"><Underline size={14} /></button>
            <button onMouseDown={(e) => { e.preventDefault(); executeCommand('strikeThrough'); }} className="p-2 hover:bg-gray-700 rounded-full transition-colors"><Strikethrough size={14} /></button>
            <div className="w-px h-4 bg-gray-700 mx-1" />
            <button onMouseDown={(e) => { e.preventDefault(); executeCommand('hiliteColor', '#fef08a'); }} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-yellow-300"><Highlighter size={14} /></button>
            <button onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', 'h3'); }} className="p-2 hover:bg-gray-700 rounded-full transition-colors"><Type size={14} /></button>
        </div>
    );
};

export const NotebookView: React.FC<NotebookViewProps> = ({ data }) => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract important terms for highlighting
  const highlightTerms = data.keyConcepts.map(c => c.title);

  const handleSend = () => {
    if(!input.trim()) return;
    setIsProcessing(true);
    
    // Simulate AI interaction
    setTimeout(() => {
        setIsProcessing(false);
        setInput("");
    }, 1500);
  };

  const handleExport = () => {
    const { topic, summary, keyConcepts, websiteContent } = data;
    let content = `# ${topic}\n\n`;
    content += `## Executive Summary\n${summary}\n\n`;
    content += `## Core Concepts\n`;
    keyConcepts.forEach(c => {
        content += `### ${c.title}\n${c.description}\n\n`;
    });
    content += `## Detailed Insights\n`;
    websiteContent.sections.forEach(s => {
        content += `### ${s.title}\n${s.content}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '_')}_notebook.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-full bg-[#Fcfcfc] flex flex-col font-sans overflow-hidden group">
      
      {/* Floating Toolbar (Notion Style) */}
      <FormattingToolbar />

      {/* Floating Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-30">
          
          {/* Badge */}
          <div className="pointer-events-auto bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 pl-3 pr-4 py-1.5 rounded-full flex items-center gap-2 transition-transform hover:scale-105 cursor-default">
               <div className="w-6 h-6 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                  <PenLine size={12} />
               </div>
               <span className="text-xs font-bold text-gray-700">Notebook</span>
          </div>

          {/* Action Buttons */}
          <div className="pointer-events-auto flex gap-2">
               <button className="w-10 h-10 bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:scale-105 transition-all" title="Highlight Mode">
                   <Highlighter size={16} />
               </button>
               <button 
                onClick={handleExport}
                className="w-10 h-10 bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:scale-105 transition-all" 
                title="Export to Markdown"
               >
                   <Download size={16} />
               </button>
               <button className="w-10 h-10 bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:scale-105 transition-all" title="Share">
                   <Share size={16} />
               </button>
          </div>
      </div>

      {/* Document Surface */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-8 md:px-8 bg-[#Fcfcfc] scroll-smooth pb-48"
      >
        <div className="max-w-3xl mx-auto bg-white min-h-[1000px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-xl border border-gray-100 p-8 md:p-16 space-y-10 mt-12">
            
            {/* Title Section */}
            <div className="space-y-4 border-b border-gray-50 pb-8">
                <EditableBlock 
                    tag="h1" 
                    initialHtml={data.topic} 
                    className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight font-serif" 
                />
            </div>

            {/* Executive Summary */}
            <section className="space-y-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block select-none">Executive Summary</h2>
                <EditableBlock 
                    tag="p" 
                    initialHtml={processInitialHtml(data.summary, highlightTerms)} 
                    className="text-lg text-gray-800 leading-8" 
                />
            </section>

            {/* Key Concepts - Grid Layout */}
            <section className="space-y-6">
                 <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 block select-none">Core Concepts</h2>
                
                <div className="grid grid-cols-1 gap-8">
                    {data.keyConcepts.map((concept, idx) => (
                        <div key={idx} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                            <EditableBlock 
                                tag="h3" 
                                initialHtml={concept.title} 
                                className="text-xl font-bold text-gray-900 mb-2 block font-serif" 
                            />
                            <EditableBlock 
                                tag="p" 
                                initialHtml={processInitialHtml(concept.description, highlightTerms)}
                                className="text-gray-600 leading-7" 
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Visual Insights Section (Web Content) */}
            <section className="space-y-8">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 block select-none">Detailed Insights</h2>

                {data.websiteContent.sections.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                         <div className="flex items-baseline gap-3">
                             <span className="text-xs font-bold text-gray-300 select-none">0{idx + 1}</span>
                             <EditableBlock 
                                tag="h3" 
                                initialHtml={section.title} 
                                className="text-2xl font-bold text-gray-900 block font-serif" 
                             />
                         </div>
                         
                         {/* Dynamic Media Rendering */}
                         {section.mediaType === 'chart' && section.chartData && (
                             <SimpleBarChart data={section.chartData} />
                         )}
                         
                         {section.mediaType === 'image' && (
                             <PexelsImage 
                                query={section.imageSearchQuery || section.title} 
                                alt={section.mediaDescription || section.title} 
                             />
                         )}

                         <EditableBlock 
                            tag="p" 
                            initialHtml={processInitialHtml(section.content, highlightTerms)}
                            className="text-gray-700 leading-8 text-lg" 
                        />
                    </div>
                ))}
            </section>

            <div className="h-32 text-center pt-10 opacity-30">
                <Sparkles size={16} className="mx-auto text-gray-400" />
            </div>

        </div>
      </div>

      {/* Floating Input Dock */}
      <div className="absolute bottom-10 left-0 right-0 px-4 flex justify-center z-40 pointer-events-none">
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-2xl pointer-events-auto"
        >
             <div className="relative group">
                {/* Glossy Backdrop */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-full border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all group-hover:bg-white/90" />
                
                <div className="relative flex items-center p-2 pl-5">
                    <Sparkles size={18} className="text-lime-600 mr-3 shrink-0 animate-pulse" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask AI to rewrite, summarize, or add more details..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm h-10 min-w-0"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isProcessing}
                        className="ml-2 h-10 px-6 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="text-xs font-bold tracking-wide">Send</span>
                        )}
                    </button>
                </div>
             </div>
        </motion.div>
      </div>
    </div>
  );
};
