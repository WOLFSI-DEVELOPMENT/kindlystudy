
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StudyGuide, TeacherContent, GrammarAnalysis, SearchResult } from "../types";

const LOCAL_STORAGE_KEY_API = 'gemini_api_key';

export const getApiKey = (): string | undefined => {
  return localStorage.getItem(LOCAL_STORAGE_KEY_API) || process.env.API_KEY;
};

export const setStoredApiKey = (key: string) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_API, key);
};

// Shared Website Content Schema
const websiteContentSchemaProperty = {
  type: Type.OBJECT,
  properties: {
    heroTitle: { type: Type.STRING },
    heroSubtitle: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          layout: { type: Type.STRING, enum: ["left", "right"] },
          mediaType: { type: Type.STRING, enum: ["image", "chart", "none"] },
          mediaDescription: { type: Type.STRING },
          imageSearchQuery: { type: Type.STRING },
          chartData: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              labels: { type: Type.ARRAY, items: { type: Type.STRING } },
              values: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            },
            nullable: true,
          }
        },
        required: ["title", "content", "layout", "mediaType"],
      },
    },
  },
  required: ["heroTitle", "heroSubtitle", "sections"],
};

// Student Schema
const studyGuideSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    summary: { type: Type.STRING },
    keyConcepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["title", "description"],
      },
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          front: { type: Type.STRING },
          back: { type: Type.STRING },
        },
        required: ["front", "back"],
      },
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
        },
        required: ["question", "options", "correctAnswer", "explanation"],
      },
    },
    websiteContent: websiteContentSchemaProperty,
    slides: {
      type: Type.ARRAY,
      description: "A deck of 5-8 presentation slides.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          visualQuery: { type: Type.STRING, description: "Search query for Pexels background image" },
          layout: { type: Type.STRING, enum: ['image-right', 'image-left', 'center'] }
        },
        required: ["title", "bullets", "visualQuery", "layout"]
      }
    }
  },
  required: ["topic", "summary", "keyConcepts", "flashcards", "quiz", "websiteContent", "slides"],
};

// Teacher Schema
const teacherSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    gradeLevel: { type: Type.STRING, description: "Target grade level (e.g., '10th Grade', 'University')" },
    title: { type: Type.STRING, description: "Title of the worksheet" },
    description: { type: Type.STRING, description: "Introductory text or instructions" },
    sections: {
      type: Type.ARRAY,
      description: "Different sections of the worksheet/test",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { 
            type: Type.STRING, 
            enum: ['multiple-choice', 'short-answer', 'essay', 'matching', 'activity', 'fill-in-the-blank', 'true-false', 'sequencing'] 
          },
          content: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of questions or items for this section."
          }
        },
        required: ["title", "type", "content"],
      }
    },
    rubric: {
      type: Type.ARRAY,
      description: "Grading rubric",
      items: {
        type: Type.OBJECT,
        properties: {
          criteria: { type: Type.STRING },
          points: { type: Type.INTEGER },
          description: { type: Type.STRING }
        },
        required: ["criteria", "points", "description"],
      }
    }
  },
  required: ["topic", "gradeLevel", "title", "description", "sections", "rubric"],
};

// Grammar Pilot Schema
const grammarSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief, encouraging overview of the writing style and main issues found." },
    segments: {
      type: Type.ARRAY,
      description: "The complete input text broken down into segments.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique ID" },
          text: { type: Type.STRING, description: "The original text for this segment." },
          type: { type: Type.STRING, enum: ['text', 'error', 'suggestion'] },
          replacement: { type: Type.STRING, description: "The corrected text (required if error/suggestion)" },
          explanation: { type: Type.STRING, description: "Why this change is needed." }
        },
        required: ["id", "text", "type"],
      }
    }
  },
  required: ["summary", "segments"]
};

// Search Result Schema
const searchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A clean, 1-4 sentence paragraph summary of the topic." },
    sources: {
      type: Type.ARRAY,
      description: "List of credible sources for the information.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING },
          snippet: { type: Type.STRING }
        },
        required: ["title", "url", "snippet"]
      }
    },
    relatedQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    websiteContent: websiteContentSchemaProperty, // Reuse the website content schema
  },
  required: ["summary", "sources", "relatedQuestions", "websiteContent"]
};

export const generateStudyMaterial = async (prompt: string, mode: 'student' | 'teacher' | 'grammar' | 'search'): Promise<StudyGuide | TeacherContent | GrammarAnalysis | SearchResult> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    let systemPrompt = "";
    let schema: Schema;

    if (mode === 'teacher') {
      systemPrompt = `Generate a high-quality educational worksheet/test for teachers on the topic: "${prompt}".
      The content should be professional, printable, and suitable for a classroom setting.
      Include 3-5 distinct sections using a variety of formats (Multiple Choice, Fill in the Blank, True/False, Sequencing, etc.).
      Include a clear grading rubric at the end.`;
      schema = teacherSchema;
    } else if (mode === 'grammar') {
      systemPrompt = `Act as an expert editor and grammar coach called "Grammar Pilot".
      Analyze the following text provided by the user.
      Break the ENTIRE text down into an array of segments.
      Most segments will be type 'text' (no issues).
      If you find a grammar mistake, spelling error, or punctuation issue, create a segment with type 'error', provide the 'replacement', and an 'explanation'.
      If you find a stylistic improvement (word choice, clarity, flow), create a segment with type 'suggestion', provide the 'replacement', and an 'explanation'.
      Ensure the concatenated 'text' fields of all segments exactly match the input text (or are a very close reconstruction).
      
      Input Text to Analyze:
      "${prompt}"`;
      schema = grammarSchema;
    } else if (mode === 'search') {
      systemPrompt = `Perform a deep search on the topic: "${prompt}".
      1. Provide a concise, high-quality summary (1-4 sentences) that is easy to read.
      2. Identify 3-5 credible sources (simulated for this task) that would be relevant.
      3. Suggest 3 related follow-up questions.
      4. Generate a 'websiteContent' object that represents a deep-dive, Generative UI article about the topic. This corresponds to the 'Gen Tab'. Make it rich, with 3-4 sections and visual suggestions (image/chart).`;
      schema = searchSchema;
    } else {
      systemPrompt = `Generate a comprehensive study guide for: "${prompt}".
      Include summary, key concepts, flashcards, quiz, deep-dive website article, AND a presentation slide deck.
      For slides:
      1. Generate 5-8 slides.
      2. Create concise bullet points.
      3. Provide a visual query for Pexels.`;
      schema = studyGuideSchema;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-09-2025",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: mode === 'grammar' ? 0.3 : 0.7, 
        googleSearch: mode === 'search' ? {} : undefined, // Enable search tool only for search mode
      },
    });

    const text = response.text;
    if (!text) throw new Error("No content generated.");

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please check your API Key in Settings.");
  }
};

export const regenerateSearchSummary = async (prompt: string): Promise<string> => {
    // Helper specifically for the regenerate button in search
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-09-2025",
        contents: `Regenerate a clean, concise 1-4 sentence summary about: "${prompt}". Make it sound professional yet accessible. Do not include introductory phrases.`,
    });
    return response.text || "Failed to regenerate summary.";
}

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  const apiKey = getApiKey();
  if (!apiKey) return [];
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Fast model for suggestions
        contents: `Provide 3-5 short, relevant search suggestions that complete or relate to this query: "${query}". Return ONLY a JSON array of strings.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            maxOutputTokens: 100, // Keep it very brief/fast
        }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
      // Fail silently for auto-complete to avoid disrupting UX
      return [];
  }
}
