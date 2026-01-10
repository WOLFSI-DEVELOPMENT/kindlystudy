import React from 'react';
import { TeacherContent } from '../types';
import { Download, CheckCircle, Square, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeacherWorksheetProps {
  content: TeacherContent;
}

export const TeacherWorksheet: React.FC<TeacherWorksheetProps> = ({ content }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Action Bar */}
      <div className="w-full max-w-[210mm] flex justify-between items-center mb-8 px-4 print:hidden">
        <div>
           <h2 className="text-2xl font-semibold text-gray-900">Teacher Workspace</h2>
           <p className="text-gray-500 text-sm">Generated resources ready for class.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-sm font-medium"
        >
          <Download size={18} />
          <span>Download / Print</span>
        </button>
      </div>

      {/* A4 Paper Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl rounded-sm p-[15mm] md:p-[20mm] text-gray-900 border border-gray-100 print:shadow-none print:border-none print:w-full print:max-w-none print:p-0"
      >
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-6 mb-8">
            <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-serif font-bold leading-tight">{content.title}</h1>
                <div className="text-right">
                    <span className="block text-sm font-semibold text-gray-500 uppercase tracking-widest">{content.gradeLevel}</span>
                    <span className="block text-xs text-gray-400 mt-1">{new Date().toLocaleDateString()}</span>
                </div>
            </div>
            <div className="flex justify-between items-end text-sm text-gray-600 font-medium">
                <div className="w-1/3 border-b border-gray-300 pb-1">Name:</div>
                <div className="w-1/3 border-b border-gray-300 pb-1 ml-4">Date:</div>
                <div className="w-1/3 border-b border-gray-300 pb-1 ml-4">Period:</div>
            </div>
        </div>

        {/* Instructions */}
        <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100 print:bg-transparent print:border-none print:p-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Instructions</h3>
            <p className="text-base leading-relaxed">{content.description}</p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
            {content.sections.map((section, idx) => (
                <div key={idx} className="break-inside-avoid">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded text-xs">
                            {String.fromCharCode(65 + idx)}
                        </span>
                        {section.title}
                    </h3>
                    <div className="space-y-4 pl-2">
                        {section.content.map((item, qIdx) => (
                            <div key={qIdx} className="flex gap-4">
                                <span className="font-semibold text-gray-500 w-6 flex-shrink-0 text-right mt-0.5">{qIdx + 1}.</span>
                                <div className="flex-1">
                                    <p className="text-gray-900 mb-2 leading-relaxed">{item}</p>
                                    
                                    {/* Render Answer Spaces based on Type */}
                                    
                                    {/* SHORT ANSWER */}
                                    {section.type === 'short-answer' && (
                                        <div className="w-full h-8 border-b border-gray-300 border-dashed mt-2"></div>
                                    )}

                                    {/* ESSAY */}
                                    {section.type === 'essay' && (
                                        <div className="w-full space-y-4 mt-2">
                                            <div className="w-full h-px bg-gray-200"></div>
                                            <div className="w-full h-px bg-gray-200"></div>
                                            <div className="w-full h-px bg-gray-200"></div>
                                            <div className="w-full h-px bg-gray-200"></div>
                                        </div>
                                    )}

                                    {/* MULTIPLE CHOICE */}
                                    {section.type === 'multiple-choice' && (
                                        <div className="flex flex-col gap-1 mt-1 ml-2 text-sm text-gray-600">
                                            {['A', 'B', 'C', 'D'].map((opt) => (
                                                <div key={opt} className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full border border-gray-300"></div> 
                                                    <div className="h-px bg-gray-200 w-48"></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* FILL IN THE BLANK */}
                                    {section.type === 'fill-in-the-blank' && (
                                        <div className="w-full h-8 border-b border-gray-300 mt-1 max-w-xs"></div>
                                    )}

                                    {/* TRUE / FALSE */}
                                    {section.type === 'true-false' && (
                                        <div className="flex items-center gap-6 mt-2 text-sm font-medium text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border border-gray-300 rounded-sm"></div> True
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border border-gray-300 rounded-sm"></div> False
                                            </div>
                                        </div>
                                    )}

                                    {/* SEQUENCING */}
                                    {section.type === 'sequencing' && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center text-gray-300 font-bold">#</div>
                                            <div className="w-full border-b border-gray-300"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {/* Rubric */}
        <div className="mt-12 pt-8 border-t-2 border-gray-200 break-inside-avoid">
             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Grading Rubric
            </h3>
            <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-100 print:bg-gray-100">
                        <th className="border border-gray-300 p-3 text-left w-1/4">Criteria</th>
                        <th className="border border-gray-300 p-3 text-left">Description</th>
                        <th className="border border-gray-300 p-3 text-center w-16">Points</th>
                        <th className="border border-gray-300 p-3 text-center w-16">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {content.rubric.map((item, idx) => (
                        <tr key={idx}>
                            <td className="border border-gray-300 p-3 font-medium">{item.criteria}</td>
                            <td className="border border-gray-300 p-3 text-gray-600">{item.description}</td>
                            <td className="border border-gray-300 p-3 text-center font-bold">{item.points}</td>
                            <td className="border border-gray-300 p-3"></td>
                        </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold print:bg-gray-50">
                        <td className="border border-gray-300 p-3 text-right" colSpan={3}>Total Score</td>
                        <td className="border border-gray-300 p-3"></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-400 print:text-gray-400">
            Generated by MindFlow AI
        </div>

      </motion.div>
      
      {/* Global Print Styles Injection */}
      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { background: white; }
          header, main > div:first-child, .print\\:hidden { display: none !important; }
          .print\\:shadow-none { shadow: none !important; box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
        }
      `}</style>
    </div>
  );
};
