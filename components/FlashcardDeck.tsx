import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard } from '../types';
import { ChevronLeft, ChevronRight, RotateCw, Sparkles, Keyboard } from 'lucide-react';

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const handleNext = useCallback(() => {
    setDirection(1);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focused on an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); // Prevent scrolling on Space
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleFlip]);

  if (!cards || cards.length === 0) return null;

  // Animation variants for sliding cards
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.95,
      zIndex: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 40 : -40,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto py-8 select-none">
      {/* Top Meta Info */}
      <div className="w-full flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Card {currentIndex + 1}</span>
          <span>of {cards.length}</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-300">
             <Keyboard size={12} />
             <span>Space to flip, Arrows to navigate</span>
        </div>
      </div>

      {/* Card Container */}
      <div 
        className="w-full relative h-[420px]" 
        style={{ perspective: '1200px' }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            className="w-full h-full absolute inset-0 cursor-pointer"
            onClick={handleFlip}
          >
             {/* Rotating Card Inner */}
             <motion.div
                className="w-full h-full relative transition-all duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
             >
                {/* FRONT FACE */}
                <div 
                    className="absolute inset-0 w-full h-full bg-white rounded-[32px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col justify-between p-8 md:p-14 hover:border-gray-300 hover:shadow-[0_24px_70px_-12px_rgba(0,0,0,0.12)] transition-all"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    <div className="w-full flex justify-between items-start opacity-50">
                        <Sparkles size={20} className="text-gray-400" />
                        <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">Question</span>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center text-center">
                        <h3 className="text-2xl md:text-4xl font-medium text-gray-900 leading-snug tracking-tight">
                            {cards[currentIndex].front}
                        </h3>
                    </div>

                    <div className="w-full flex justify-center">
                         <span className="text-xs font-medium text-gray-400 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 group-hover:bg-white group-hover:border-gray-200 transition-colors">
                            <RotateCw size={12} /> Click to flip
                         </span>
                    </div>
                </div>

                {/* BACK FACE */}
                <div 
                    className="absolute inset-0 w-full h-full bg-[#171717] rounded-[32px] shadow-2xl flex flex-col justify-between p-8 md:p-14 text-center"
                    style={{ 
                        transform: 'rotateY(180deg)', 
                        backfaceVisibility: 'hidden', 
                        WebkitBackfaceVisibility: 'hidden' 
                    }}
                >
                    <div className="w-full flex justify-end items-start opacity-50">
                        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Answer</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xl md:text-3xl text-gray-100 font-light leading-relaxed">
                            {cards[currentIndex].back}
                        </p>
                    </div>

                    <div className="w-full flex justify-center opacity-0">
                         {/* Placeholder to balance layout */}
                         <span className="text-xs px-4 py-2">Placeholder</span>
                    </div>
                </div>
             </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between w-full max-w-sm mt-10 px-4">
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="group flex flex-col items-center gap-2 text-sm font-medium text-gray-400 hover:text-black transition-colors focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm group-hover:border-black group-hover:bg-black group-hover:text-white group-hover:scale-105 transition-all">
            <ChevronLeft size={22} />
          </div>
        </button>

        {/* Dynamic Progress Indicator */}
        <div className="flex gap-2 h-1.5">
            {cards.map((_, idx) => (
                <div 
                    key={idx}
                    className={`h-full rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-black' : 'w-1.5 bg-gray-200'}`}
                />
            ))}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="group flex flex-col items-center gap-2 text-sm font-medium text-gray-400 hover:text-black transition-colors focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm group-hover:border-black group-hover:bg-black group-hover:text-white group-hover:scale-105 transition-all">
            <ChevronRight size={22} />
          </div>
        </button>
      </div>
    </div>
  );
};
