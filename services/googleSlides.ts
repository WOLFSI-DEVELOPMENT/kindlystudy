
import { Slide } from '../types';

const CLIENT_ID = '14206322756-kpkp583r99u5m5qn4osvrbkil9d9bcrg.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/presentations';
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

// Initialize Google API Client
export const initializeGoogleApi = () => {
  if (window.gapi) {
    window.gapi.load('client', async () => {
      await window.gapi.client.init({
        // apiKey: API_KEY, // Optional if using OAuth only for user data, but good for quota
        discoveryDocs: ['https://slides.googleapis.com/$discovery/rest?version=v1'],
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

// Helper to fetch Pexels Image URL
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
        console.error("Failed to fetch image for slide export", e);
    }
    return null;
};

export const exportPresentation = async (title: string, slides: Slide[]) => {
  if (!gapiInited || !gisInited) {
    initializeGoogleApi();
    // Give it a second to retry if called immediately
    await new Promise(r => setTimeout(r, 1000));
    if (!tokenClient) throw new Error("Google API not initialized. Please refresh and try again.");
  }

  return new Promise<string>((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        reject(resp);
        return;
      }
      await createSlides(title, slides, resolve, reject);
    };

    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

const createSlides = async (title: string, slides: Slide[], resolve: (url: string) => void, reject: (err: any) => void) => {
  try {
    // 1. Create Presentation
    const createResponse = await window.gapi.client.slides.presentations.create({
      title: title || 'MindFlow Presentation',
    });
    const presentationId = createResponse.result.presentationId;
    const requests: any[] = [];

    // 2. Iterate slides and build requests
    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const pageId = `slide_${i}`;
        const titleId = `title_${i}`;
        const bodyId = `body_${i}`;
        const imageId = `image_${i}`;

        // Create Slide
        requests.push({
            createSlide: {
                objectId: pageId,
                insertionIndex: i + 1,
                slideLayoutReference: {
                    predefinedLayout: 'TITLE_AND_BODY' // Simplified for demo, can vary based on slide.layout
                }
            }
        });

        // Add Title
        // Note: TITLE_AND_BODY usually creates placeholders. We map to them or create new text boxes.
        // For robustness in this demo, we create a slide and then update its placeholders.
        // We need to fetch the slide to get placeholder IDs, OR we can just use BLANK layout and add elements manually.
        // Let's use PREDEFINED layouts for cleaner look, but we need to know placeholder IDs.
        // Simpler approach for API: Use predefined layout, then use 'replaceAllText' scoped to that slide or just append elements.
        
        // Actually, the most reliable way without fetching is adding explicit text boxes on a blank slide, 
        // BUT using standard layouts looks better. 
        // Strategy: Create slide. Retrieve it? No, too slow.
        // Strategy: Create Slide -> Add TextBox for Title -> Add TextBox for Bullets.
        
        // Let's replace the CreateSlide request above with a BLANK one and manual positioning.
        requests.pop();
        requests.push({
            createSlide: {
                objectId: pageId,
                insertionIndex: i + 1,
                slideLayoutReference: { predefinedLayout: 'BLANK' }
            }
        });

        // 3. Add Title Box
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
        requests.push({
            insertText: {
                objectId: titleId,
                text: slide.title
            }
        });
        // Style Title
        requests.push({
             updateTextStyle: {
                 objectId: titleId,
                 style: { fontSize: { magnitude: 28, unit: 'PT' }, bold: true, fontFamily: 'Arial' },
                 fields: 'fontSize,bold,fontFamily'
             }
        });

        // 4. Add Body Text (Bullets)
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
            requests.push({
                insertText: {
                    objectId: bodyId,
                    text: bulletText
                }
            });
        }

        // 5. Add Image
        // We need the actual URL.
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

    // Execute Batch Update
    if (requests.length > 0) {
        await window.gapi.client.slides.presentations.batchUpdate({
            presentationId: presentationId,
            resource: { requests: requests }
        });
    }

    resolve(`https://docs.google.com/presentation/d/${presentationId}/edit`);

  } catch (e) {
    console.error("Error creating slides", e);
    reject(e);
  }
};
