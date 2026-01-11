
import React, { useState, useRef, useEffect } from 'react';
import { generateStudyMaterial, regenerateSearchSummary, getSearchSuggestions } from './services/gemini';
import { AppState, StudyGuide, TeacherContent, GrammarAnalysis, SearchResult } from './types';
import { FlashcardDeck } from './components/FlashcardDeck';
import { Quiz } from './components/Quiz';
import { GenerativeSite } from './components/GenerativeSite';
import { TeacherWorksheet } from './components/TeacherWorksheet';
import { GrammarPilot } from './components/GrammarPilot';
import { NotebookView } from './components/NotebookView';
import { SlideDeckView } from './components/SlideDeckView';
import { LandingPage } from './components/LandingPage';
import { DashboardHome } from './components/DashboardHome';
import { SettingsView } from './components/SettingsView';
import { Search as SearchIcon, Sparkles, BookOpen, BrainCircuit, GraduationCap, Layout, ArrowRight, Plus, Mic, ChevronDown, Layers, School, User, PieChart, Activity, Zap, FileText, LayoutDashboard, Clock, Star, Settings, LogOut, Menu, PenTool, ChevronLeft, ChevronRight, Volume2, Copy, RefreshCw, Download, FileUp, Globe, Video, ArrowUpRight, ExternalLink, Share, MoreHorizontal, Presentation, Home as HomeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  // Top Level View State: 'marketing' | 'dashboard'
  const [currentView, setCurrentView] = useState<'marketing' | 'dashboard'>('marketing');

  const [prompt, setPrompt] = useState('');
  const [appState, setAppState] = useState<AppState>({
    status: 'idle',
    data: null,
    mode: 'search', // Default to Search
    error: null,
  });
  
  // Navigation State
  const [sidebarTab, setSidebarTab] = useState<'home' | 'search' | 'study' | 'settings'>('home');
  const [activeTab, setActiveTab] = useState<'studyGuide' | 'flashcards' | 'quiz' | 'site' | 'notebook' | 'slides'>('studyGuide');
  const [searchSubTab, setSearchSubTab] = useState<'ai' | 'sources' | 'videos' | 'gen'>('ai');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Search Specific State
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  // Powered by Gemini 3 Flash for fast suggestions
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (prompt.trim().length > 2) {
         try {
           const results = await getSearchSuggestions(prompt);
           // Simple check to ensure we don't show suggestions if user cleared input
           if (results && results.length > 0 && prompt.trim().length > 2) {
               setSuggestions(results);
               setShowSuggestions(true);
           } else {
               setShowSuggestions(false);
           }
         } catch (e) {
            // silent fail
         }
      } else {
         setShowSuggestions(false);
      }
    }, 300); // 300ms debounce to prevent API spam but feel responsive

    return () => clearTimeout(timeoutId);
  }, [prompt]);

  // Handle URL Params for "Open in New Tab" functionality
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPrompt = params.get('prompt');
    const urlMode = params.get('mode');
    const urlTab = params.get('tab');

    if (urlPrompt) {
        // If url params exist, auto-switch to dashboard
        setCurrentView('dashboard');
        setPrompt(urlPrompt);
        // Auto-trigger generation
        const targetMode = (urlMode as any) || 'student';
        const targetTab = (urlTab as any) || 'studyGuide';
        
        setSidebarTab(targetMode === 'search' ? 'search' : 'study');
        // Small timeout to allow state to settle
        setTimeout(() => {
            performGeneration(urlPrompt, targetMode, targetTab);
        }, 100);
    }
  }, []);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) && !textareaRef.current?.contains(event.target as Node)) {
          setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performGeneration = async (searchPrompt: string, mode: 'student' | 'teacher' | 'grammar' | 'search', targetTab?: string) => {
      setAppState(prev => ({ ...prev, status: 'loading', data: null, error: null, mode: mode }));
      setShowSuggestions(false);
      
      try {
        const data = await generateStudyMaterial(searchPrompt, mode);
        setAppState(prev => ({ ...prev, status: 'success', data, error: null, mode: mode }));
        
        if (targetTab) {
            setActiveTab(targetTab as any);
        } else if (mode === 'student') {
            setActiveTab('studyGuide');
        }
      } catch (err: any) {
        setAppState(prev => ({
            ...prev,
            status: 'error',
            data: null,
            error: err.message || "Something went wrong. Please check your API Key in Settings.",
        }));
      }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    performGeneration(prompt, appState.mode);
  };

  const handleSuggestionClick = (suggestion: string) => {
      setPrompt(suggestion);
      performGeneration(suggestion, appState.mode);
  };

  const handleOpenNewTab = () => {
      const url = new URL(window.location.href);
      url.searchParams.set('prompt', prompt);
      url.searchParams.set('mode', 'student');
      url.searchParams.set('tab', 'site');
      window.open(url.toString(), '_blank');
  };

  const handleRegenerateSummary = async () => {
      if (appState.mode === 'search' && appState.data) {
          setIsRegeneratingSummary(true);
          try {
              const newSummary = await regenerateSearchSummary(prompt);
              setAppState(prev => ({
                  ...prev,
                  data: { ...prev.data as SearchResult, summary: newSummary }
              }));
          } catch (e) {
              console.error(e);
          } finally {
              setIsRegeneratingSummary(false);
          }
      }
  };

  const handleDownloadSummary = () => {
      if (!appState.data || appState.mode !== 'search') return;
      const summary = (appState.data as SearchResult).summary;
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `summary.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleSpeak = (text: string) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(utterance);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (appState.mode === 'grammar') return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleMode = (mode: 'student' | 'teacher' | 'grammar' | 'search') => {
    setAppState(prev => ({ ...prev, mode, data: null, status: 'idle' }));
    setIsModeDropdownOpen(false);
  };

  const getPlaceholder = () => {
      switch(appState.mode) {
          case 'search': return "Ask anything...";
          case 'teacher': return "Describe the worksheet you need...";
          case 'grammar': return "Paste your essay here or start typing to analyze...";
          default: return "What do you want to learn today?";
      }
  }

  const SidebarItem = ({ id, icon: Icon, label, active = false }: { id: string, icon: any, label: string, active?: boolean }) => (
    <button 
        onClick={() => {
            if (id === 'home') {
                setSidebarTab('home');
            } else if (id === 'search') {
                setSidebarTab('search');
                toggleMode('search');
            } else if (id === 'study') {
                setSidebarTab('study');
                toggleMode('student'); 
            } else if (id === 'settings') {
                setSidebarTab('settings');
                setAppState(prev => ({...prev, status: 'idle', data: null, error: null}));
            }
        }}
        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-6'} py-3 rounded-full transition-colors duration-200 group relative ${
        active 
            ? 'bg-white text-gray-900 font-semibold' 
            : 'text-gray-500'
        }`}
        title={isSidebarCollapsed ? label : undefined}
    >
      <Icon size={20} className={`${active ? 'text-lime-600' : 'text-gray-400 group-hover:text-gray-600'} shrink-0`} />
      {!isSidebarCollapsed && (
          <span className="text-sm tracking-wide ml-3 truncate">{label}</span>
      )}
      {!isSidebarCollapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-lime-500 shrink-0" />}
    </button>
  );

  // Helper to determine if we should remove padding/scroll for full-screen tools like Notebook or Slides
  const isFullHeightView = appState.status === 'success' && (activeTab === 'notebook' || activeTab === 'slides') && appState.mode === 'student';

  // --- RENDER MARKETING PAGE IF NOT IN DASHBOARD ---
  if (currentView === 'marketing') {
      return <LandingPage onStart={() => setCurrentView('dashboard')} />;
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="flex h-screen w-full bg-[#F2F4F7] p-2 md:p-3 gap-3 overflow-hidden font-sans text-gray-900 selection:bg-lime-200">
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        className="hidden md:flex flex-col py-2 pl-2 relative"
      >
        <div 
          className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} mb-8 cursor-pointer group`} 
          onClick={() => { setSidebarTab('home'); setAppState(prev => ({...prev, status: 'idle', data: null, error: null})); setPrompt(''); }}
        >
          <div className="relative shrink-0">
              <div className="relative w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-95 shadow-lg shadow-black/5">
                  <Sparkles size={20} fill="currentColor" />
              </div>
          </div>
          {!isSidebarCollapsed && (
             <span className="font-bold text-xl tracking-tight text-gray-900 truncate">MindFlow</span>
          )}
        </div>

        <nav className="flex flex-col gap-2 flex-1 w-full">
           <SidebarItem id="home" icon={HomeIcon} label="Home" active={sidebarTab === 'home'} />
           <SidebarItem id="search" icon={SearchIcon} label="Search" active={sidebarTab === 'search'} />
           <SidebarItem id="study" icon={LayoutDashboard} label="Study" active={sidebarTab === 'study'} />
           <SidebarItem id="history" icon={Clock} label="History" />
           <SidebarItem id="favs" icon={Star} label="Favorites" />
           <SidebarItem id="settings" icon={Settings} label="Settings" active={sidebarTab === 'settings'} />
        </nav>

        <div className="mt-auto px-2 pb-2 w-full">
           {/* Collapse Toggle */}
           <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all mb-2"
           >
             {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
           </button>

           <button className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} p-2 bg-white rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0">JD</div>
              {!isSidebarCollapsed && (
                  <>
                    <div className="flex-1 text-left overflow-hidden">
                        <p className="text-xs font-bold text-gray-900 leading-none truncate">John Doe</p>
                        <p className="text-[10px] text-gray-400 leading-none mt-1 truncate group-hover:text-indigo-500 transition-colors">Free Plan</p>
                    </div>
                    <MoreHorizontal size={16} className="text-gray-300 mr-2 shrink-0" />
                  </>
              )}
           </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={`flex-1 bg-white rounded-[24px] md:rounded-[32px] shadow-sm relative flex flex-col overflow-hidden ${isFullHeightView || sidebarTab === 'home' ? '' : ''}`}>
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white">
                 <Sparkles size={16} fill="currentColor" />
              </div>
              <span className="font-bold text-lg">MindFlow</span>
            </div>
            <button className="p-2 bg-gray-50 rounded-full">
              <Menu size={20} />
            </button>
        </div>

        {/* Scrollable Container */}
        <div className={`flex-1 w-full flex flex-col ${isFullHeightView || sidebarTab === 'home' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            <AnimatePresence mode="wait">
            
            {/* HOME TAB (Internal Dashboard Home) */}
            {sidebarTab === 'home' && (
                <motion.div
                    key="home"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                >
                    <DashboardHome onNewProject={() => {
                        setSidebarTab('search');
                        toggleMode('search');
                    }} />
                </motion.div>
            )}

            {/* SETTINGS TAB */}
            {sidebarTab === 'settings' && (
                <motion.div
                    key="settings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                >
                    <SettingsView />
                </motion.div>
            )}

            {/* IDLE STATE (Search/Study Landing within Dashboard) */}
            {sidebarTab !== 'home' && sidebarTab !== 'settings' && appState.status === 'idle' && (
                <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full h-full flex flex-col items-center justify-center min-h-[500px] px-4 md:px-8"
                >
                    {/* Landing Content ... */}
                    <div className="relative z-10 w-full max-w-3xl text-center">
                         <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 font-serif">
                                {appState.mode === 'search' ? 'What do you want to know?' : 'What do you want to learn?'}
                            </h1>
                            
                            <div className="w-full relative group text-left mb-6">
                                <div className={`relative bg-white rounded-[28px] transition-all duration-200 ${showSuggestions ? 'rounded-b-none shadow-sm' : 'rounded-full'} p-1.5 pl-5 border border-gray-200 flex items-center gap-2 z-20`}>
                                    <textarea
                                        ref={textareaRef}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={getPlaceholder()}
                                        className="flex-1 bg-transparent border-none outline-none text-lg text-gray-800 placeholder-gray-400 resize-none min-h-[44px] max-h-[200px] py-2"
                                        rows={1}
                                    />
                                    <div className="flex items-center gap-2 pr-2">
                                         <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors" title="Upload File">
                                            <FileUp size={20} />
                                         </button>
                                         <button
                                            onClick={() => handleSubmit()}
                                            disabled={!prompt.trim()}
                                            className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                                                prompt.trim() 
                                                ? 'bg-black text-white hover:scale-105' 
                                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            }`}
                                        >
                                            <ArrowRight size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                                {/* Auto-Suggestions Dropdown */}
                                <AnimatePresence>
                                {showSuggestions && (
                                    <motion.div 
                                        ref={suggestionsRef}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-200 rounded-b-[28px] overflow-hidden z-10 shadow-sm"
                                    >
                                        <div className="py-2">
                                            {suggestions.map((suggestion, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="w-full text-left px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <SearchIcon size={14} className="text-gray-400" />
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>

                            {/* Mode Toggle for when in Study Tab, hidden in Search Tab for simplicity unless needed */}
                            {sidebarTab === 'study' && (
                                <div className="flex justify-center gap-4 mb-8">
                                     <button onClick={() => toggleMode('student')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${appState.mode === 'student' ? 'bg-lime-100 text-lime-800' : 'text-gray-500 hover:bg-gray-100'}`}>Student</button>
                                     <button onClick={() => toggleMode('teacher')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${appState.mode === 'teacher' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-500 hover:bg-gray-100'}`}>Teacher</button>
                                     <button onClick={() => toggleMode('grammar')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${appState.mode === 'grammar' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'}`}>Grammar</button>
                                </div>
                            )}

                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* ERROR STATE */}
             {appState.status === 'error' && (
                 <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-6 text-center"
                 >
                     <div className="bg-red-50 p-6 rounded-2xl max-w-md">
                        <h3 className="text-red-600 font-bold mb-2">Error Generating Content</h3>
                        <p className="text-red-500 text-sm mb-4">{appState.error}</p>
                        <button 
                            onClick={() => {
                                setSidebarTab('settings');
                                setAppState(prev => ({...prev, status: 'idle', error: null}));
                            }}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded-full transition-colors"
                        >
                            Go to Settings to check API Key
                        </button>
                     </div>
                 </motion.div>
             )}


            {/* LOADING STATE */}
            {appState.status === 'loading' && (
                <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-6 min-h-[60vh]"
                >
                <div className={`relative w-20 h-20 mb-8`}>
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin border-black`}></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Thinking...
                </h2>
                </motion.div>
            )}

            {/* SEARCH RESULTS STATE */}
            {appState.status === 'success' && appState.mode === 'search' && appState.data && (
                <motion.div
                    key="searchResults"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col h-full"
                >
                    {/* Floating Top Nav */}
                    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-3 flex items-center gap-6">
                        <button 
                             onClick={() => setSearchSubTab('ai')}
                             className={`flex items-center gap-2 text-sm font-bold transition-colors ${searchSubTab === 'ai' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Sparkles size={16} /> AI Summary
                        </button>
                        <button 
                             onClick={() => setSearchSubTab('sources')}
                             className={`flex items-center gap-2 text-sm font-bold transition-colors ${searchSubTab === 'sources' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Globe size={16} /> Sources
                        </button>
                         <button 
                             className={`flex items-center gap-2 text-sm font-bold transition-colors text-gray-300 cursor-not-allowed`}
                             title="Coming Soon"
                        >
                            <Video size={16} /> Videos
                        </button>
                        
                        <div className="h-6 w-px bg-gray-200 mx-2" />
                        
                        <button 
                             onClick={() => setSearchSubTab('gen')}
                             className={`flex items-center gap-2 text-sm font-bold transition-colors ${searchSubTab === 'gen' ? 'text-lime-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Layout size={16} className={searchSubTab === 'gen' ? 'text-lime-600' : 'text-gray-400'} /> Gen Tab
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 md:px-12 py-8 max-w-5xl mx-auto w-full">
                         {searchSubTab === 'ai' && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                 <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">{prompt}</h2>
                                 
                                 {isRegeneratingSummary ? (
                                    <div className="space-y-3 animate-pulse">
                                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                    </div>
                                 ) : (
                                     <div className="prose prose-lg max-w-none text-gray-700 leading-loose">
                                         <p dangerouslySetInnerHTML={{ 
                                             __html: (appState.data as SearchResult).summary.replace(
                                                 /(important|significant|key|major|critical)/gi, 
                                                 '<span class="bg-yellow-100 px-1 rounded-sm text-gray-900 font-medium">$1</span>'
                                             )
                                         }} />
                                     </div>
                                 )}

                                 <div className="flex items-center gap-2 mt-8">
                                     <SearchResultAction icon={Copy} label="Copy" onClick={() => { navigator.clipboard.writeText((appState.data as SearchResult).summary); }} />
                                     <SearchResultAction icon={Volume2} label="Listen" onClick={() => handleSpeak((appState.data as SearchResult).summary)} />
                                     <SearchResultAction icon={RefreshCw} label="Regenerate" onClick={handleRegenerateSummary} />
                                     <SearchResultAction icon={Download} label="Download" onClick={handleDownloadSummary} />
                                 </div>

                                 <div className="mt-12">
                                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Related Questions</h3>
                                     <div className="flex flex-wrap gap-3">
                                         {(appState.data as SearchResult).relatedQuestions.map((q, idx) => (
                                             <button key={idx} onClick={() => { setPrompt(q); handleSubmit(); }} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-black hover:text-black transition-colors">
                                                 {q}
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                             </motion.div>
                         )}

                         {searchSubTab === 'sources' && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                 {(appState.data as SearchResult).sources.map((source, idx) => (
                                     <div key={idx} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                         <div className="flex items-center gap-2 mb-2">
                                             <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                 {source.title.charAt(0)}
                                             </div>
                                             <span className="text-xs text-gray-500 truncate max-w-[300px]">{source.url}</span>
                                         </div>
                                         <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{source.title}</h3>
                                         <p className="text-sm text-gray-600 line-clamp-2">{source.snippet}</p>
                                     </div>
                                 ))}
                             </motion.div>
                         )}

                         {searchSubTab === 'gen' && (appState.data as SearchResult).websiteContent && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                 <GenerativeSite content={(appState.data as SearchResult).websiteContent!} />
                             </motion.div>
                         )}
                    </div>
                </motion.div>
            )}

            {/* OTHER MODES SUCCESS STATE (Study, Teacher, Grammar) */}
            {appState.status === 'success' && appState.mode !== 'search' && appState.data && (
                <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full mx-auto ${isFullHeightView ? 'h-full flex flex-col max-w-full' : 'pb-20'}`}
                >
                
                {/* MODE SPECIFIC CONTENT */}
                
                {appState.mode === 'grammar' ? (
                     <div className="px-4 md:px-8 max-w-7xl mx-auto pt-2">
                        {/* Back Button for Grammar */}
                        <div className="mb-8 flex justify-between items-start">
                            <button 
                                onClick={() => setAppState(prev => ({ ...prev, status: 'idle', data: null }))}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors"
                            >
                                <ChevronLeft size={14} /> Back to Search
                            </button>
                        </div>
                        <GrammarPilot data={appState.data as GrammarAnalysis} />
                     </div>
                ) : appState.mode === 'teacher' ? (
                    <div className="px-4 md:px-8 max-w-7xl mx-auto pt-2">
                        {/* Back Button for Teacher */}
                        <div className="mb-8 flex justify-between items-start">
                            <button 
                                onClick={() => setAppState(prev => ({ ...prev, status: 'idle', data: null }))}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors"
                            >
                                <ChevronLeft size={14} /> Back to Search
                            </button>
                        </div>
                        <TeacherWorksheet content={appState.data as TeacherContent} />
                    </div>
                ) : (
                    /* Student Mode Content */
                    <>
                        {/* Floating Sticky Header for Study Mode */}
                        <div className={`sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4 ${isFullHeightView ? '' : 'shadow-sm'}`}>
                            
                            {/* Left: Back & Title */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button 
                                    onClick={() => setAppState(prev => ({ ...prev, status: 'idle', data: null }))}
                                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
                                    title="Back to Search"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="flex-1 md:flex-none truncate">
                                    <h2 className="text-lg font-bold text-gray-900 font-serif truncate max-w-[200px] md:max-w-xs">{(appState.data as StudyGuide).topic}</h2>
                                </div>
                            </div>
                            
                            {/* Center: Tabs Navigation (Minimalist Text Buttons) */}
                            <div className="flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar">
                                {[
                                { id: 'studyGuide', label: 'Study Guide' },
                                { id: 'site', label: 'Gen Tab' },
                                { id: 'slides', label: 'Slide Deck' },
                                { id: 'flashcards', label: 'Flashcards' },
                                { id: 'quiz', label: 'Quiz' },
                                { id: 'notebook', label: 'Notebook' },
                                ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                    relative flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap
                                    ${activeTab === tab.id 
                                        ? 'bg-black text-white' 
                                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}
                                    `}
                                >
                                    {tab.label}
                                    {tab.id === 'slides' && (
                                        <span className={`text-[10px] px-1.5 rounded-sm font-bold tracking-tight ${activeTab === 'slides' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>BETA</span>
                                    )}
                                </button>
                                ))}
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 hidden md:flex">
                                <button className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-50">
                                    <Share size={18} />
                                </button>
                                {activeTab === 'site' && (
                                    <button 
                                        onClick={handleOpenNewTab}
                                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                                    >
                                        <ExternalLink size={14} /> Open in New Tab
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tab Content Area */}
                        <div className={isFullHeightView ? 'flex-1 min-h-0 relative' : 'min-h-[400px] px-4 md:px-8 py-8 max-w-7xl mx-auto w-full'}>
                            <AnimatePresence mode="wait">
                            
                            {activeTab === 'studyGuide' && (
                                <motion.div
                                key="studyGuide"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                                >
                                <div className="prose prose-lg text-gray-700 max-w-none leading-relaxed">
                                    <p className="text-xl text-gray-600 font-light leading-9">{(appState.data as StudyGuide).summary}</p>
                                </div>

                                <div className="pt-8">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Key Concepts</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(appState.data as StudyGuide).keyConcepts.map((concept, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-[20px] border border-gray-100 hover:border-black/10 transition-all group shadow-sm">
                                        <h4 className="font-bold text-gray-900 mb-2 text-lg">{concept.title}</h4>
                                        <p className="text-gray-500 leading-relaxed text-sm">{concept.description}</p>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                                </motion.div>
                            )}
                            
                            {activeTab === 'site' && (
                                <motion.div
                                key="site"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                >
                                <GenerativeSite content={(appState.data as StudyGuide).websiteContent} />
                                </motion.div>
                            )}

                            {activeTab === 'slides' && (
                                <motion.div
                                key="slides"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="h-full"
                                >
                                <SlideDeckView slides={(appState.data as StudyGuide).slides || []} />
                                </motion.div>
                            )}

                            {activeTab === 'flashcards' && (
                                <motion.div
                                key="flashcards"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                >
                                <FlashcardDeck cards={(appState.data as StudyGuide).flashcards} />
                                </motion.div>
                            )}

                            {activeTab === 'quiz' && (
                                <motion.div
                                key="quiz"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                >
                                <Quiz questions={(appState.data as StudyGuide).quiz} />
                                </motion.div>
                            )}

                             {activeTab === 'notebook' && (
                                <motion.div
                                key="notebook"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="h-full"
                                >
                                <NotebookView data={appState.data as StudyGuide} />
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    </>
                )}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

const SearchResultAction = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-white group-hover:shadow-md transition-all">
            <Icon size={16} />
        </div>
        <span className="text-[10px] font-medium text-gray-400 group-hover:text-black transition-colors">{label}</span>
    </button>
);

export default App;
