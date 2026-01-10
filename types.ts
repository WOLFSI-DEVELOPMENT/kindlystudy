
export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation: string;
}

export interface ChartData {
  labels: string[];
  values: number[];
  label: string; // The metric being measured (e.g. "Population", "Years")
}

export interface SiteSection {
  title: string;
  content: string;
  layout: 'left' | 'right' | 'center';
  mediaType: 'image' | 'chart' | 'none';
  mediaDescription?: string; // For images
  imageSearchQuery?: string; // For Pexels search
  chartData?: ChartData;    // For charts
}

export interface WebsiteContent {
  heroTitle: string;
  heroSubtitle: string;
  sections: SiteSection[];
}

export interface Slide {
  title: string;
  bullets: string[];
  visualQuery: string; // For Pexels
  layout: 'image-right' | 'image-left' | 'center';
}

export interface StudyGuide {
  topic: string;
  summary: string;
  keyConcepts: Array<{
    title: string;
    description: string;
  }>;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  websiteContent: WebsiteContent;
  slides: Slide[];
}

// Teacher Mode Types
export interface RubricItem {
  criteria: string;
  points: number;
  description: string;
}

export interface WorksheetSection {
  title: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'matching' | 'activity' | 'fill-in-the-blank' | 'true-false' | 'sequencing';
  content: string[]; // List of questions/items
}

export interface TeacherContent {
  topic: string;
  gradeLevel: string;
  title: string; // Worksheet title
  description: string; // Brief instructions/intro
  sections: WorksheetSection[];
  rubric: RubricItem[];
}

// Grammar Pilot Types
export interface GrammarSegment {
  id: string; // Unique ID for keying
  text: string;
  type: 'text' | 'error' | 'suggestion';
  replacement?: string;
  explanation?: string;
}

export interface GrammarAnalysis {
  segments: GrammarSegment[];
  summary: string; // Brief feedback on the overall writing style
}

// Search Types
export interface SearchSource {
    title: string;
    url: string;
    snippet: string;
}

export interface SearchResult {
    summary: string;
    sources: SearchSource[];
    relatedQuestions: string[];
    websiteContent: WebsiteContent; // Included for Gen Tab in search
}

export interface AppState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: StudyGuide | TeacherContent | GrammarAnalysis | SearchResult | null;
  mode: 'student' | 'teacher' | 'grammar' | 'search';
  error: string | null;
}
