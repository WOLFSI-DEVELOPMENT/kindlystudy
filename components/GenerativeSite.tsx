
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WebsiteContent, SiteSection, ChartData } from '../types';
import { BarChart3, Image as ImageIcon } from 'lucide-react';

interface GenerativeSiteProps {
  content: WebsiteContent;
}

const PEXELS_API_KEY = '8Mh8jDK5VAgGnnmNYO2k0LqdaLL8lbIR4ou5Vnd8Zod0cETWahEx1MKf';

export const SimpleBarChart = ({ data }: { data: ChartData }) => {
  const maxValue = Math.max(...data.values);
  
  return (
    <div className="w-full my-8">
      <div className="flex items-center gap-2 mb-8">
         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{data.label}</span>
      </div>
      
      <div className="flex items-end justify-between gap-4 h-56 w-full px-2">
        {data.values.map((value, idx) => {
          const heightPercentage = (value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
               <div className="relative w-full flex items-end justify-center h-full bg-gray-50 rounded-2xl overflow-hidden">
                   <motion.div 
                     initial={{ height: 0 }}
                     whileInView={{ height: `${heightPercentage}%` }}
                     transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: idx * 0.1 }}
                     className="w-full bg-gray-900 rounded-t-lg opacity-90 group-hover:opacity-100 transition-opacity relative bottom-0"
                   >
                     {/* Tooltip */}
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold py-1.5 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-xl z-10">
                        {value}
                     </div>
                   </motion.div>
               </div>
               <span className="text-xs text-gray-400 font-medium truncate max-w-full">{data.labels[idx]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PlaceholderImage = ({ description }: { description?: string }) => (
  <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-8 text-center overflow-hidden relative group">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 z-10">
      <ImageIcon className="text-gray-300" size={24} />
    </div>
    <p className="text-sm text-gray-400 max-w-[80%] font-medium z-10">{description || "Visual representation"}</p>
  </div>
);

export const PexelsImage = ({ query, alt, className = "h-64 md:h-[400px] rounded-2xl" }: { query: string, alt: string, className?: string }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [photographer, setPhotographer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) return;
    
    let isMounted = true;
    const fetchImage = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
          headers: {
            Authorization: PEXELS_API_KEY
          }
        });
        const data = await response.json();
        if (isMounted && data.photos && data.photos.length > 0) {
          setSrc(data.photos[0].src.large2x);
          setPhotographer(data.photos[0].photographer);
        } else if (isMounted) {
           setError(true);
        }
      } catch (e) {
        if (isMounted) setError(true);
        console.error("Failed to fetch image", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchImage();
    return () => { isMounted = false; };
  }, [query]);

  if (loading) {
     return <div className={`w-full bg-gray-50 animate-pulse ${className}`} />;
  }
  
  if (error || !src) {
    return (
      <div className={`border border-gray-100 ${className}`}>
        <PlaceholderImage description={alt} />
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs font-medium">Photo by {photographer} on Pexels</p>
      </div>
    </div>
  );
};

export const GenerativeSite: React.FC<GenerativeSiteProps> = ({ content }) => {
  return (
    <div className="relative w-full bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 min-h-[800px]">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[80px]" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[100px]" />
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 text-center max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-serif text-gray-900 mb-6 leading-tight tracking-tight"
        >
          {content.heroTitle}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed"
        >
          {content.heroSubtitle}
        </motion.p>
        <div className="w-16 h-1 bg-black mx-auto mt-10 rounded-full opacity-10" />
      </div>

      {/* Article Body */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-24 space-y-24">
        {content.sections.map((section, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col md:flex-row gap-12 items-center ${
              section.layout === 'right' ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Text Content */}
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              <p className="text-lg text-gray-600 leading-8 font-light">
                {section.content}
              </p>
            </div>

            {/* Visual Content */}
            <div className="flex-1 w-full">
              {section.mediaType === 'chart' && section.chartData ? (
                 <SimpleBarChart data={section.chartData} />
              ) : section.mediaType === 'image' ? (
                 <PexelsImage 
                    query={section.imageSearchQuery || section.title} 
                    alt={section.mediaDescription || section.title}
                    className="h-64 md:h-[400px] rounded-2xl" 
                 />
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer / End Mark */}
      <div className="relative z-10 flex items-center justify-center gap-2 pb-12 opacity-30">
         <SparkleIcon />
         <span className="font-semibold text-sm tracking-wider uppercase">Generative UI</span>
      </div>
    </div>
  );
};

const SparkleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
    </svg>
);
