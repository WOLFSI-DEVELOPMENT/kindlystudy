import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Check, X, RefreshCw, Trophy } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
}

export const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing answer

    setSelectedOption(index);
    setShowExplanation(true);

    if (index === questions[currentQuestionIdx].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setIsCompleted(false);
  };

  if (!questions || questions.length === 0) return null;

  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm max-w-xl mx-auto">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="text-black" size={28} />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Quiz Complete</h3>
        <p className="text-gray-500 mb-8">You answered {score} out of {questions.length} correctly.</p>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <RefreshCw size={16} />
          Restart Quiz
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
        <span>Question {currentQuestionIdx + 1} / {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-xl font-medium text-gray-900 mb-8 leading-snug">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswer;
            const isWrong = isSelected && !isCorrect;
            const showCorrect = showExplanation && isCorrect;

            let buttonClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ";

            if (showExplanation) {
               if (showCorrect) {
                   buttonClass += "bg-green-50/50 border-green-200 text-green-900";
               } else if (isWrong) {
                   buttonClass += "bg-red-50/50 border-red-200 text-red-900";
               } else {
                   buttonClass += "bg-white border-gray-100 text-gray-400";
               }
            } else {
               buttonClass += "bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-700";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={selectedOption !== null}
                className={buttonClass}
              >
                <span className="text-base">{option}</span>
                {showExplanation && isCorrect && <Check size={18} className="text-green-600" />}
                {showExplanation && isWrong && <X size={18} className="text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {showExplanation && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6 text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-900 block mb-1">Explanation</span>
            {currentQ.explanation}
          </div>
          <div className="flex justify-end">
             <button
              onClick={handleNext}
              className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium text-sm"
            >
              {currentQuestionIdx === questions.length - 1 ? 'Finish' : 'Next Question'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
