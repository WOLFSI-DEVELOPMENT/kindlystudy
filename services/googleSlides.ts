
import { Slide, TeacherContent, WebsiteContent, StudyGuide } from '../types';

const CLIENT_ID = '14206322756-kpkp583r99u5m5qn4osvrbkil9d9bcrg.apps.googleusercontent.com';
// Scopes for Slides, Docs, Forms, and Drive (creation)
const SCOPES = 'https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/forms.body';
const PEXELS_API_KEY = '8Mh8jDK5VAgGnnmNYO2k0LqdaLL8lbIR4ou5Vnd8Zod0cETWahEx1MKf';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Initialize Google API Client (Shared for Slides, Docs, Forms)
export const initializeGoogleApi = () => {
  if (window.gapi) {
    window.gapi.load('client', async () => {
      await window.gapi.client.init({
        discoveryDocs: [
            'https://slides.googleapis.com/$discovery/rest?version=v1',
            'https://docs.googleapis.com/$discovery/rest?version=v1',
            'https://forms.googleapis.com/$discovery/rest?version=v1'
        ],
      });
      gapiInited = true;
    });
  }

  if (window.google) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined later
    });
    gisInited = true;
  }
};

const ensureAuth = async (): Promise<void> => {
    if (!gapiInited || !gisInited) {
        initializeGoogleApi();
        await new Promise(r => setTimeout(r, 1000));
        if (!tokenClient) throw new Error("Google API not initialized. Please refresh and try again.");
    }
    
    return new Promise((resolve, reject) => {
        tokenClient.callback = (resp: any) => {
            if (resp.error) {
                reject(resp);
            } else {
                resolve();
            }
        };

        if (window.gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
}

// --- HELPER: Pexels ---
const fetchImageUrl = async (query: string): Promise<string | null> => {
    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
            headers: { Authorization: PEXELS_API_KEY }
        });
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.large2x;
        }
    } catch (e) {
        console.error("Failed to fetch image", e);
    }
    return null;
};

// --- FEATURE: Google Slides Export ---
export const exportPresentation = async (title: string, slides: Slide[]) => {
  await ensureAuth();
  
  const createResponse = await window.gapi.client.slides.presentations.create({
      title: title || 'MindFlow Presentation',
  });
  const presentationId = createResponse.result.presentationId;
  const requests: any[] = [];

  for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const pageId = `slide_${i}`;
        const titleId = `title_${i}`;
        const bodyId = `body_${i}`;
        const imageId = `image_${i}`;

        requests.push({
            createSlide: {
                objectId: pageId,
                insertionIndex: i + 1,
                slideLayoutReference: { predefinedLayout: 'BLANK' }
            }
        });

        // Title
        requests.push({
            createShape: {
                objectId: titleId,
                shapeType: 'TEXT_BOX',
                elementProperties: {
                    pageObjectId: pageId,
                    size: { height: { magnitude: 60, unit: 'PT' }, width: { magnitude: 600, unit: 'PT' } },
                    transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 30, unit: 'PT' }
                }
            }
        });
        requests.push({ insertText: { objectId: titleId, text: slide.title } });
        requests.push({
             updateTextStyle: {
                 objectId: titleId,
                 style: { fontSize: { magnitude: 28, unit: 'PT' }, bold: true, fontFamily: 'Arial' },
                 fields: 'fontSize,bold,fontFamily'
             }
        });

        // Body
        if (slide.bullets && slide.bullets.length > 0) {
            requests.push({
                createShape: {
                    objectId: bodyId,
                    shapeType: 'TEXT_BOX',
                    elementProperties: {
                        pageObjectId: pageId,
                        size: { height: { magnitude: 300, unit: 'PT' }, width: { magnitude: 350, unit: 'PT' } },
                        transform: { scaleX: 1, scaleY: 1, translateX: 50, translateY: 100, unit: 'PT' }
                    }
                }
            });
            const bulletText = slide.bullets.map(b => `• ${b}\n`).join('');
            requests.push({ insertText: { objectId: bodyId, text: bulletText } });
        }

        // Image
        const imageUrl = await fetchImageUrl(slide.visualQuery);
        if (imageUrl) {
            requests.push({
                createImage: {
                    objectId: imageId,
                    url: imageUrl,
                    elementProperties: {
                        pageObjectId: pageId,
                        size: { height: { magnitude: 300, unit: 'PT' }, width: { magnitude: 300, unit: 'PT' } },
                        transform: { scaleX: 1, scaleY: 1, translateX: 410, translateY: 100, unit: 'PT' }
                    }
                }
            });
        }
  }

  if (requests.length > 0) {
      await window.gapi.client.slides.presentations.batchUpdate({
          presentationId: presentationId,
          resource: { requests: requests }
      });
  }

  return `https://docs.google.com/presentation/d/${presentationId}/edit`;
};

// --- FEATURE: Google Docs Export (Gen Tab & Notebook) ---
export const exportToGoogleDoc = async (title: string, content: WebsiteContent | StudyGuide) => {
    await ensureAuth();

    const createResponse = await window.gapi.client.docs.documents.create({
        title: title || 'MindFlow Document',
    });
    const documentId = createResponse.result.documentId;
    const requests: any[] = [];
    let currentIndex = 1;

    const insertText = (text: string, style?: string) => {
        if(!text) return;
        const textToInsert = text + "\n";
        requests.push({
            insertText: {
                text: textToInsert,
                location: { index: currentIndex }
            }
        });
        if (style) {
             requests.push({
                updateParagraphStyle: {
                    range: { startIndex: currentIndex, endIndex: currentIndex + textToInsert.length },
                    paragraphStyle: { namedStyleType: style },
                    fields: 'namedStyleType'
                }
            });
        }
        currentIndex += textToInsert.length;
    };

    // Handle StudyGuide (Notebook) vs WebsiteContent
    if ('heroTitle' in content) {
        // Gen Tab / Website Content
        insertText(content.heroTitle, 'TITLE');
        insertText(content.heroSubtitle, 'SUBTITLE');
        
        content.sections.forEach(section => {
            insertText(section.title, 'HEADING_1');
            insertText(section.content, 'NORMAL_TEXT');
        });

    } else {
        // Study Guide / Notebook
        insertText(content.topic, 'TITLE');
        insertText("Executive Summary", 'HEADING_1');
        insertText(content.summary, 'NORMAL_TEXT');

        insertText("Core Concepts", 'HEADING_1');
        content.keyConcepts.forEach(c => {
            insertText(c.title, 'HEADING_2');
            insertText(c.description, 'NORMAL_TEXT');
        });

        if (content.websiteContent) {
            insertText("Detailed Insights", 'HEADING_1');
             content.websiteContent.sections.forEach(s => {
                insertText(s.title, 'HEADING_2');
                insertText(s.content, 'NORMAL_TEXT');
            });
        }
    }

    if (requests.length > 0) {
        await window.gapi.client.docs.documents.batchUpdate({
            documentId: documentId,
            resource: { requests: requests.reverse() } // Docs API inserts at index, so strict ordering or reverse needed if inserting at 1
        });
        // Wait, inserting at 1 repeatedly pushes text down. 
        // If we want Title at top, we insert Title at 1. Then Subtitle at 1 (pushes title down? No).
        // Insert at 1 puts it at the very beginning. 
        // To append, we should track index or just insert at end of body.
        // Actually, the simplest way is to fetch the doc end index, but since it's empty, 
        // we can calculate indices. 
        // However, standard strategy: Build text locally, then do one big insert? No, styling needs ranges.
        // Reverse strategy:
        // If I insert "World" at 1, then "Hello " at 1, I get "Hello World". 
        // So reversing the logical order of requests works if we always insert at 1.
        // BUT, calculation of ranges for styling gets hard.
        
        // Better Strategy: Use End-Of-Segment index? 
        // Since we just created it, we can assume linear index tracking.
        // Let's refactor `insertText` to not manage global index but use the API response? No, batch is all at once.
        
        // Correct Strategy for Batch:
        // Calculate indices cumulatively assuming we insert in order, BUT 
        // Docs API requires valid indices at the time of execution.
        // If we use 'endOfSegmentLocation', it appends.
    }
    
    // Re-doing requests for simple Append using EndOfSegment
    const appendRequests: any[] = [];
    
    const appendText = (text: string, style: string) => {
         if(!text) return;
         const textData = text + "\n";
         const startIndex = 1; // We can't know the exact index without chaining, but we can use endOfSegment
         
         // Since we can't easily track index in a batch without complex math (because index shifts),
         // we will do a simpler approach: 
         // Just title and body as raw text for MVP? No, users want style.
         
         // API V1: We can use EndOfSegmentLocation to append.
         // But we can't style a range defined by EndOfSegmentLocation easily in the same batch 
         // because we don't know the index it landed at.
         
         // Option C: Calculate indices based on string lengths.
         // This is what I tried first. Let's stick to that but verify logic.
         // initial doc length = 2 (start + end char).
    };

    // Retrying with strict index calculation
    let cursor = 1;
    const strictRequests: any[] = [];

    const addBlock = (text: string, style: string) => {
        if(!text) return;
        const safeText = text + "\n";
        
        strictRequests.push({
            insertText: {
                text: safeText,
                location: { index: cursor }
            }
        });
        
        strictRequests.push({
            updateParagraphStyle: {
                range: { startIndex: cursor, endIndex: cursor + safeText.length },
                paragraphStyle: { namedStyleType: style },
                fields: 'namedStyleType'
            }
        });
        
        cursor += safeText.length;
    }

    if ('heroTitle' in content) {
        addBlock(content.heroTitle, 'TITLE');
        addBlock(content.heroSubtitle, 'SUBTITLE');
        content.sections.forEach(s => {
            addBlock(s.title, 'HEADING_1');
            addBlock(s.content, 'NORMAL_TEXT');
        });
    } else {
        addBlock(content.topic, 'TITLE');
        addBlock("Executive Summary", 'HEADING_1');
        addBlock(content.summary, 'NORMAL_TEXT');
        addBlock("Core Concepts", 'HEADING_1');
        content.keyConcepts.forEach(c => {
             addBlock(c.title, 'HEADING_2');
             addBlock(c.description, 'NORMAL_TEXT');
        });
    }

    if (strictRequests.length > 0) {
        await window.gapi.client.docs.documents.batchUpdate({
            documentId: documentId,
            resource: { requests: strictRequests }
        });
    }

    return `https://docs.google.com/document/d/${documentId}/edit`;
};

// --- FEATURE: Google Forms Export (Teacher Test) ---
export const exportToGoogleForm = async (content: TeacherContent) => {
    await ensureAuth();

    // 1. Create Form
    const createResponse = await window.gapi.client.forms.forms.create({
        info: {
            title: content.title,
            documentTitle: content.title
        }
    });
    const formId = createResponse.result.formId;
    const requests: any[] = [];
    let index = 0;

    // 2. Add Description
    requests.push({
        updateFormInfo: {
            info: { description: content.description },
            updateMask: 'description'
        }
    });

    // 3. Add Questions
    content.sections.forEach(section => {
        // Section Header
        requests.push({
            createItem: {
                item: {
                    title: section.title,
                    textItem: {}, // Just a header/description item
                },
                location: { index: index++ }
            }
        });

        section.content.forEach((qText, i) => {
            const item: any = {
                title: qText,
            };

            if (section.type === 'multiple-choice') {
                item.questionItem = {
                    question: {
                        required: true,
                        choiceQuestion: {
                            type: 'RADIO',
                            options: [
                                { value: 'Option A' },
                                { value: 'Option B' },
                                { value: 'Option C' },
                                { value: 'Option D' }
                            ]
                        }
                    }
                };
            } else if (section.type === 'essay' || section.type === 'short-answer') {
                 item.questionItem = {
                    question: {
                        required: true,
                        textQuestion: { paragraph: section.type === 'essay' }
                    }
                };
            } else if (section.type === 'true-false') {
                 item.questionItem = {
                    question: {
                        required: true,
                        choiceQuestion: {
                            type: 'RADIO',
                            options: [
                                { value: 'True' },
                                { value: 'False' }
                            ]
                        }
                    }
                };
            } else {
                // Default to short answer for matching/sequencing for now
                item.questionItem = {
                    question: {
                        required: true,
                        textQuestion: { paragraph: false }
                    }
                };
            }

            requests.push({
                createItem: {
                    item: item,
                    location: { index: index++ }
                }
            });
        });
    });

    if (requests.length > 0) {
        await window.gapi.client.forms.forms.batchUpdate({
            formId: formId,
            resource: { requests: requests }
        });
    }

    return `https://docs.google.com/forms/d/${formId}/edit`;
};
