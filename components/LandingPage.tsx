
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Brain, Layout, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-gray-900 selection:bg-pink-100 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="text-3xl font-bold tracking-tight font-serif flex items-center gap-2">
                    MindFlow<span className="text-pink-500 text-4xl leading-none">*</span>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
                    <button className="hover:text-black transition-colors">Features</button>
                    <button className="hover:text-black transition-colors">Testimonials</button>
                    <button className="hover:text-black transition-colors">Pricing</button>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onStart} className="hidden md:block text-sm font-bold hover:opacity-70">Log in</button>
                    <button 
                        onClick={onStart} 
                        className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all font-bold text-sm hover:scale-105"
                    >
                        Get Started — It's Free
                    </button>
                </div>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
         {/* Decorative Doodles */}
         <div className="absolute top-40 left-10 md:left-20 opacity-20 md:opacity-100 animate-pulse hidden xl:block">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-gray-400" strokeWidth="2">
                <path d="M10,50 Q25,25 50,50 T90,50" />
                <path d="M10,30 Q25,5 50,30 T90,30" />
            </svg>
         </div>
         <div className="absolute top-48 right-10 md:right-20 rotate-12 opacity-20 md:opacity-100 hidden xl:block">
            <span className="font-handwriting text-4xl text-gray-400 rotate-12 block" style={{ fontFamily: '"Changa One", cursive' }}>Magic?</span>
            <svg width="60" height="40" className="text-gray-300 ml-4 mt-2">
                <path d="M10,10 Q30,30 50,10" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
         </div>

         <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] font-serif mb-8 text-gray-900">
                    The simplest way to <br />
                    <span className="relative inline-block">
                        master anything.
                        <svg className="absolute w-[105%] -bottom-2 md:-bottom-4 -left-[2.5%] text-pink-300 -z-10" viewBox="0 0 300 15" fill="none">
                            <path d="M5,10 Q150,5 295,10" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
                        </svg>
                    </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                    Turn any topic into study guides, flashcards, and quizzes in seconds. 
                    Say goodbye to boring textbooks.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={onStart}
                        className="h-14 px-8 rounded-full bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:-translate-y-1 flex items-center gap-2"
                    >
                        Start Learning Now <ArrowRight size={20} />
                    </button>
                    <span className="text-sm text-gray-400 font-medium px-4">No credit card required</span>
                </div>
            </motion.div>
         </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FeatureCard 
                    icon={Brain}
                    title="Smart Summaries"
                    description="Our AI breaks down complex topics into digestible, clear summaries so you learn faster."
                    delay={0.1}
                  />
                  <FeatureCard 
                    icon={Layout}
                    title="Instant Slides"
                    description="Need to present? Generate beautiful, ready-to-use slide decks with a single click."
                    delay={0.2}
                  />
                  <FeatureCard 
                    icon={Zap}
                    title="Active Recall"
                    description="Automatically generated flashcards and quizzes test your knowledge and reinforce retention."
                    delay={0.3}
                  />
              </div>
          </div>
      </section>

      {/* Demo Section */}
      <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="flex-1 space-y-8">
                      <h2 className="text-5xl font-bold font-serif leading-tight">
                          More than just <br/> a note-taking app.
                      </h2>
                      <p className="text-xl text-gray-500 leading-relaxed">
                          MindFlow adapts to your learning style. Whether you're a student preparing for exams, a teacher creating lesson plans, or a professional upskilling.
                      </p>
                      <ul className="space-y-4">
                          {[
                              "Customizable learning paths",
                              "Export to Markdown, PDF, & more",
                              "Teacher & Student modes",
                              "Grammar & Style analysis"
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-lg font-medium text-gray-700">
                                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                      <CheckCircle size={14} />
                                  </div>
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </div>
                  <div className="flex-1 relative">
                      <div className="absolute -inset-4 bg-gradient-to-tr from-pink-100 to-blue-100 rounded-[40px] opacity-60 blur-2xl" />
                      <div className="relative bg-white border border-gray-100 rounded-[32px] shadow-2xl overflow-hidden p-2">
                           {/* Abstract App UI representation */}
                           <div className="bg-gray-50 rounded-[24px] aspect-[4/3] relative overflow-hidden flex flex-col">
                                <div className="h-12 border-b border-gray-200 flex items-center px-6 gap-2 bg-white">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="p-8 flex-1 flex flex-col gap-4">
                                    <div className="w-3/4 h-8 bg-gray-200 rounded-lg animate-pulse" />
                                    <div className="w-full h-4 bg-gray-100 rounded-md" />
                                    <div className="w-full h-4 bg-gray-100 rounded-md" />
                                    <div className="w-2/3 h-4 bg-gray-100 rounded-md" />
                                    
                                    <div className="flex gap-4 mt-auto">
                                        <div className="flex-1 h-32 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 mb-2" />
                                            <div className="w-full h-3 bg-gray-100 rounded" />
                                        </div>
                                        <div className="flex-1 h-32 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 mb-2" />
                                            <div className="w-full h-3 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                </div>
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Social Proof / Footer CTA */}
      <section className="py-32 bg-black text-white text-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative z-10 max-w-4xl mx-auto">
              <Sparkles size={48} className="mx-auto mb-8 text-yellow-400" />
              <h2 className="text-5xl md:text-7xl font-bold font-serif mb-8">Ready to flow?</h2>
              <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto">
                  Join thousands of learners who have transformed the way they study.
              </p>
              <button 
                onClick={onStart}
                className="h-16 px-10 rounded-full bg-white text-black text-xl font-bold hover:scale-105 transition-transform"
              >
                  Create your first project
              </button>
          </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-gray-100 text-center text-gray-400 text-sm">
          <p>© 2024 MindFlow AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-900">
            <Icon size={24} />
        </div>
        <h3 className="text-2xl font-bold font-serif mb-4 text-gray-900">{title}</h3>
        <p className="text-gray-500 leading-relaxed">
            {description}
        </p>
    </motion.div>
);
