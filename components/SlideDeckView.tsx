
import React, { useState, useRef, useEffect } from 'react';
import { Slide } from '../types';
import { PexelsImage } from './GenerativeSite';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2, Loader2, ExternalLink } from 'lucide-react';
import { exportPresentation, initializeGoogleApi } from '../services/googleSlides';

interface SlideDeckViewProps {
  slides: Slide[];
}

export const SlideDeckView: React.FC<SlideDeckViewProps> = ({ slides }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
      { role: 'ai', text: "I've created a slide deck for you based on your topic. You can ask me to add slides, change images, or rewrite bullet points!" }
  ]);
  const [input, setInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Initialize Google Client on mount
      initializeGoogleApi();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const userInput = input;
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: `I'm processing your request to "${userInput}". (This is a demo, edits won't persist yet!)` }]);
    }, 1000);
  };

  const nextSlide = () => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
      setCurrentSlideIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen();
          setIsFullscreen(true);
      } else {
          document.exitFullscreen();
          setIsFullscreen(false);
      }
  };

  const handleGoogleExport = async () => {
      setIsExporting(true);
      try {
          const presentationUrl = await exportPresentation(slides[0]?.title || "MindFlow Presentation", slides);
          window.open(presentationUrl, '_blank');
          setMessages(prev => [...prev, { role: 'ai', text: "Successfully exported to Google Slides! A new tab has been opened." }]);
      } catch (error) {
          console.error(error);
          setMessages(prev => [...prev, { role: 'ai', text: "Failed to export. Please check if your browser blocked the popup or try again." }]);
      } finally {
          setIsExporting(false);
      }
  };

  const handleDownload = () => {
      if (!slides.length) return;
      
      let content = `# ${slides[0].title || 'Presentation'}\n\n`;
      slides.forEach((slide, i) => {
          content += `## Slide ${i + 1}: ${slide.title}\n`;
          content += `**Layout**: ${slide.layout}\n`;
          content += `**Image Query**: ${slide.visualQuery}\n\n`;
          if (slide.bullets && slide.bullets.length > 0) {
            content += `**Key Points**:\n`;
            slide.bullets.forEach(b => {
                content += `- ${b}\n`;
            });
          }
          content += `\n---\n\n`;
      });
      
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation_slides.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const currentSlide = slides[currentSlideIndex];
  const nextSlideData = slides[(currentSlideIndex + 1) % slides.length];

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-[#F2F4F7] overflow-hidden p-4 gap-4 rounded-[32px]">
      
      {/* Left Sidebar: Chat */}
      <div className="w-full lg:w-1/3 bg-white rounded-[24px] flex flex-col shadow-sm border border-gray-200/50">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Sparkles size={18} />
              </div>
              <div>
                  <h3 className="font-bold text-gray-900">Slide Designer</h3>
                  <p className="text-xs text-gray-500">Powered by Gemini 3.0</p>
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user' 
                          ? 'bg-black text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}>
                          {msg.text}
                      </div>
                  </div>
              ))}
          </div>

          <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:border-black transition-colors">
                  <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask to change layout, image..." 
                      className="flex-1 bg-transparent border-none outline-none text-sm px-3"
                  />
                  <button onClick={handleSend} className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                      <Send size={14} />
                  </button>
              </div>
          </div>
      </div>

      {/* Right Area: Preview */}
      <div ref={containerRef} className="flex-1 bg-[#E8E8E8] rounded-[24px] relative flex flex-col items-center justify-center p-8 overflow-hidden group">
          
          {/* Toolbar */}
          <div className="absolute top-6 right-6 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleGoogleExport}
                disabled={isExporting}
                className="p-3 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-700 shadow-sm transition-all disabled:opacity-50" 
                title="Export to Google Slides"
              >
                  {isExporting ? <Loader2 size={18} className="animate-spin" /> : (
                      <svg viewBox="0 0 242424 333334" width="18" height="18" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd"><defs><linearGradient id="c" gradientUnits="userSpaceOnUse" x1="200291" y1="94137" x2="200291" y2="173145"><stop offset="0" stopColor="#bf360c"/><stop offset="1" stopColor="#bf360c"/></linearGradient><mask id="b"><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="200291" y1="91174.4" x2="200291" y2="176107"><stop offset="0" stopOpacity=".02" stopColor="#fff"/><stop offset="1" stopOpacity=".2" stopColor="#fff"/></linearGradient><path fill="url(#a)" d="M158007 84111h84568v99059h-84568z"/></mask></defs><g fillRule="nonzero"><path d="M151516 0H22726C10228 0 0 10228 0 22726v287880c0 12494 10228 22728 22726 22728h196971c12494 0 22728-10234 22728-22728V90909l-53037-37880L151516 1z" fill="#f4b300"/><path d="M170452 151515H71970c-6252 0-11363 5113-11363 11363v98483c0 6251 5112 11363 11363 11363h98482c6252 0 11363-5112 11363-11363v-98483c0-6250-5111-11363-11363-11363zm-3792 87118H75756v-53027h90904v53027z" fill="#f0f0f0"/><path mask="url(#b)" fill="url(#c)" d="M158158 84261l84266 84242V90909z"/><path d="M151516 0v68181c0 12557 10167 22728 22726 22728h68182L151515 0z" fill="#f9da80"/><path fill="#fff" fillOpacity=".102" d="M151516 0v1893l89008 89016h1900z"/><path d="M22726 0C10228 0 0 10228 0 22726v1893C0 12121 10228 1893 22726 1893h128790V0H22726z" fill="#fff" fillOpacity=".2"/><path d="M219697 331433H22726C10228 331433 0 321209 0 308705v1900c0 12494 10228 22728 22726 22728h196971c12494 0 22728-10234 22728-22728v-1900c0 12504-10233 22728-22728 22728z" fill="#bf360c" fillOpacity=".2"/><path d="M174243 90909c-12559 0-22726-10171-22726-22728v1893c0 12557 10167 22728 22726 22728h68182v-1893h-68182z" fill="#bf360c" fillOpacity=".102"/></g></svg>
                  )}
              </button>
              <button 
                onClick={toggleFullscreen}
                className="p-3 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-700 shadow-sm transition-all" 
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button 
                onClick={handleDownload}
                className="p-3 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-700 shadow-sm transition-all" 
                title="Download as Markdown"
              >
                  <Download size={18} />
              </button>
          </div>

          {/* Card Stack */}
          <div className="relative w-full max-w-4xl aspect-[16/9] flex items-center justify-center">
             <AnimatePresence mode="popLayout">
                 {/* Next Slide (Background) */}
                 <motion.div 
                     key={`bg-${(currentSlideIndex + 1) % slides.length}`}
                     className="absolute w-[95%] h-[95%] opacity-60 scale-95 translate-y-4 z-0"
                 >
                     <SlideCard slide={nextSlideData} />
                 </motion.div>

                 {/* Current Slide (Foreground) */}
                 <motion.div
                     key={currentSlideIndex}
                     initial={{ x: 100, opacity: 0, rotate: 2 }}
                     animate={{ x: 0, opacity: 1, rotate: 0 }}
                     exit={{ x: -100, opacity: 0, rotate: -2 }}
                     transition={{ type: "spring", stiffness: 260, damping: 20 }}
                     className="absolute w-full h-full z-10 shadow-2xl rounded-2xl"
                 >
                     <SlideCard slide={currentSlide} />
                 </motion.div>
             </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-8 flex items-center gap-6 z-20 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/50">
              <button onClick={prevSlide} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronLeft size={24} />
              </button>
              <span className="font-mono text-sm font-bold text-gray-500">
                  {currentSlideIndex + 1} / {slides.length}
              </span>
              <button onClick={nextSlide} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronRight size={24} />
              </button>
          </div>
      </div>
    </div>
  );
};

const SlideCard = ({ slide }: { slide: Slide }) => {
    // Simple logic to vary layouts
    const isImageRight = slide.layout === 'image-right';
    const isCenter = slide.layout === 'center';

    return (
        <div className="w-full h-full bg-white rounded-2xl overflow-hidden flex shadow-sm border border-gray-900/5">
            {isCenter ? (
                <div className="w-full h-full p-12 flex flex-col items-center justify-center text-center relative">
                    <div className="absolute inset-0 opacity-10">
                        <PexelsImage query={slide.visualQuery} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight font-serif">{slide.title}</h1>
                        <ul className="space-y-4 text-left inline-block">
                             {slide.bullets.map((b, i) => (
                                 <li key={i} className="text-xl text-gray-700 flex items-start gap-3">
                                     <div className="w-2 h-2 mt-2.5 rounded-full bg-blue-500 shrink-0" />
                                     {b}
                                 </li>
                             ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <>
                   {/* Content Side */}
                   <div className={`w-1/2 p-12 flex flex-col justify-center ${isImageRight ? 'order-1' : 'order-2 bg-gray-50'}`}>
                       <h2 className="text-4xl font-bold text-gray-900 mb-8 font-serif leading-tight">{slide.title}</h2>
                       <ul className="space-y-5">
                            {slide.bullets.map((b, i) => (
                                <li key={i} className="text-lg text-gray-600 flex items-start gap-3 leading-relaxed">
                                    <div className="w-1.5 h-1.5 mt-2.5 rounded-full bg-gray-900 shrink-0" />
                                    {b}
                                </li>
                            ))}
                       </ul>
                   </div>
                   
                   {/* Image Side */}
                   <div className={`w-1/2 h-full ${isImageRight ? 'order-2' : 'order-1'}`}>
                       <PexelsImage 
                           query={slide.visualQuery} 
                           alt="Slide visual" 
                           className="w-full h-full object-cover" 
                       />
                   </div>
                </>
            )}
        </div>
    );
}
