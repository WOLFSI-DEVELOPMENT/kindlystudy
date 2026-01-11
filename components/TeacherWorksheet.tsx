
import React, { useState } from 'react';
import { TeacherContent } from '../types';
import { Download, CheckCircle, Square, Circle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { exportToGoogleForm } from '../services/googleSlides';

interface TeacherWorksheetProps {
  content: TeacherContent;
}

export const TeacherWorksheet: React.FC<TeacherWorksheetProps> = ({ content }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportForms = async () => {
      setIsExporting(true);
      try {
          const formUrl = await exportToGoogleForm(content);
          window.open(formUrl, '_blank');
      } catch (e) {
          console.error("Failed to export form", e);
          alert("Failed to export to Google Forms. Please enable popups and try again.");
      } finally {
          setIsExporting(false);
      }
  };

  const GoogleFormsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 242424 333334" width="18" height="18" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd"><defs><mask id="c"><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="200291" y1="91174.4" x2="200291" y2="176107"><stop offset="0" stopOpacity=".02" stopColor="#fff"/><stop offset="1" stopOpacity=".2" stopColor="#fff"/></linearGradient><path fill="url(#a)" d="M158007 84111h84568v99059h-84568z"/></mask><mask id="e"><radialGradient id="b" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="0" fx="0" fy="0"><stop offset="0" stopOpacity="0" stopColor="#fff"/><stop offset="1" stopOpacity=".098" stopColor="#fff"/></radialGradient><path fill="url(#b)" d="M-150-150h242724v333634H-150z"/></mask><radialGradient id="f" gradientUnits="userSpaceOnUse" cx="9696.85" cy="10000" r="166667" fx="9696.85" fy="10000"><stop offset="0" stopColor="#fff"/><stop offset="1" stopColor="#fff"/></radialGradient><linearGradient id="d" gradientUnits="userSpaceOnUse" x1="200291" y1="94137" x2="200291" y2="173145"><stop offset="0" stopColor="#311a91"/><stop offset="1" stopColor="#311a91"/></linearGradient></defs><g fillRule="nonzero"><path d="M151516 0H22726C10228 0 0 10228 0 22727v287879c0 12494 10228 22728 22726 22728h196971c12494 0 22728-10233 22728-22728V90909l-53037-37880L151516 1z" fill="#673ab6"/><path d="M98482 257569h83333v-15144H98482v15144zm0-90904v15151h83333v-15151H98482zm-18937 7578c0 6268-5094 11363-11365 11363-6269 0-11363-5096-11363-11363 0-6270 5094-11365 11363-11365 6270 0 11365 5094 11365 11365zm0 37872c0 6272-5094 11365-11365 11365-6269 0-11363-5093-11363-11365 0-6266 5094-11363 11363-11363 6270 0 11365 5097 11365 11363zm0 37881c0 6273-5094 11365-11365 11365-6269 0-11363-5092-11363-11365 0-6272 5094-11363 11363-11363 6270 0 11365 5091 11365 11363zm18937-30299h83333v-15155H98482v15155z" fill="#f0f0f0"/><path mask="url(#c)" fill="url(#d)" d="M158158 84261l84266 84242V90909z"/><path d="M151516 0v68181c0 12557 10167 22728 22726 22728h68182L151516 0z" fill="#b39cdb"/><path d="M22726 0C10228 0 0 10228 0 22727v1893C0 12122 10228 1894 22726 1894h128790V1H22726z" fill="#fff" fillOpacity=".2"/><path d="M219697 331433H22726C10228 331433 0 321209 0 308705v1900c0 12494 10228 22728 22726 22728h196971c12494 0 22728-10233 22728-22728v-1900c0 12504-10233 22728-22728 22728z" fill="#311a91" fillOpacity=".2"/><path d="M174243 90909c-12559 0-22726-10171-22726-22728v1893c0 12556 10167 22728 22726 22728h68182v-1893h-68182z" fill="#311a91" fillOpacity=".102"/><path d="M151516 0H22726C10228 0 0 10228 0 22727v287879c0 12494 10228 22728 22726 22728h196971c12494 0 22728-10233 22728-22728V90909L151517 0z" mask="url(#e)" fill="url(#f)"/></g></svg>
  );

  return (
    <div className="flex flex-col items-center w-full">
      {/* Action Bar */}
      <div className="w-full max-w-[210mm] flex justify-between items-center mb-8 px-4 print:hidden">
        <div>
           <h2 className="text-2xl font-semibold text-gray-900">Teacher Workspace</h2>
           <p className="text-gray-500 text-sm">Generated resources ready for class.</p>
        </div>
        <div className="flex gap-2">
            <button
            onClick={handleExportForms}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors shadow-sm font-medium disabled:opacity-50"
            >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <GoogleFormsIcon />}
            <span>Export to Forms</span>
            </button>
            <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-sm font-medium"
            >
            <Download size={18} />
            <span>Download / Print</span>
            </button>
        </div>
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
