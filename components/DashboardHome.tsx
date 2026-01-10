
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Presentation, Brain, ArrowRight } from 'lucide-react';

interface DashboardHomeProps {
  onNewProject: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNewProject }) => {
  return (
    <div className="w-full h-full bg-[#Fcfcfc] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="mb-12">
           <h1 className="text-4xl font-bold text-gray-900 font-serif mb-2">Welcome back, John</h1>
           <p className="text-gray-500 text-lg">Here's what you've been working on.</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Start Something New</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                <button 
                  onClick={onNewProject}
                  className="flex items-center gap-3 pl-4 pr-6 py-4 bg-white border border-gray-200 rounded-2xl hover:border-black hover:shadow-md transition-all group min-w-[200px]"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={20} />
                    </div>
                    <div className="text-left">
                        <span className="block font-bold text-gray-900">New Project</span>
                        <span className="text-xs text-gray-500">From any topic</span>
                    </div>
                </button>

                <button 
                  className="flex items-center gap-3 pl-4 pr-6 py-4 bg-white border border-gray-200 rounded-2xl hover:border-black hover:shadow-md transition-all group min-w-[200px]"
                >
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Brain size={20} />
                    </div>
                    <div className="text-left">
                        <span className="block font-bold text-gray-900">Quiz Me</span>
                        <span className="text-xs text-gray-500">Test your skills</span>
                    </div>
                </button>
            </div>
        </div>

        {/* Recent Projects Grid */}
        <div>
            <div className="flex items-end justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 font-serif">Recent Projects</h2>
                <button className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
                    View all <ArrowRight size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProjectCard 
                    title="Introduction to Biology" 
                    type="Study Guide" 
                    date="2 hours ago" 
                    icon={FileText}
                    color="bg-green-100 text-green-700"
                />
                <ProjectCard 
                    title="Marketing Strategies 101" 
                    type="Slide Deck" 
                    date="Yesterday" 
                    icon={Presentation}
                    color="bg-blue-100 text-blue-700"
                />
                <ProjectCard 
                    title="French Revolution Quiz" 
                    type="Quiz" 
                    date="3 days ago" 
                    icon={Brain}
                    color="bg-purple-100 text-purple-700"
                />
                <ProjectCard 
                    title="Linear Algebra Notes" 
                    type="Notebook" 
                    date="Last week" 
                    icon={FileText}
                    color="bg-yellow-100 text-yellow-700"
                />
            </div>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ title, type, date, icon: Icon, color }: any) => (
    <motion.div 
        whileHover={{ y: -4 }}
        className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all cursor-pointer group flex flex-col min-h-[180px]"
    >
        <div className="flex items-start justify-between mb-auto">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
                <Icon size={22} />
            </div>
            <button className="text-gray-300 group-hover:text-gray-600 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">•••</div>
            </button>
        </div>
        
        <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                {title}
            </h3>
            <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span className="flex items-center gap-1">{type}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="flex items-center gap-1">{date}</span>
            </div>
        </div>
    </motion.div>
);
