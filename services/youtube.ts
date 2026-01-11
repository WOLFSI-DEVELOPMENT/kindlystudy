
import { Video } from '../types';

const API_KEY = 'AIzaSyBd5o02cc1ArgEyHPRZZ_H0k0Ro_AqMbcY';
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

export const searchVideos = async (query: string): Promise<Video[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}?part=snippet&maxResults=6&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`
    );

    if (!response.ok) {
        console.error("YouTube API Error", await response.text());
        return [];
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt
    }));

  } catch (error) {
    console.error("Failed to fetch videos", error);
    return [];
  }
};
