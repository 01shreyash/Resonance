// src/services/lastfm.ts

const API_KEY = '777c9515dc7dd8d71983f9c14db7c357';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export const fetchTrackData = async (artist: string, track: string): Promise<{ coverUrl: string | null; duration: string | null }> => {
  try {
    const response = await fetch(
      `${BASE_URL}?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`
    );
    const data = await response.json();
    
    // 1. Get the Album Art
    const coverUrl = data?.track?.album?.image?.[2]?.['#text'] || null;
    
    // 2. Get and Format the Duration
    let duration = null;
    if (data?.track?.duration && data.track.duration !== "0") {
      const ms = parseInt(data.track.duration, 10);
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      // Pad single-digit seconds with a zero (e.g., 3:05 instead of 3:5)
      duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return { coverUrl, duration };
  } catch (error) {
    console.error("Failed to fetch track data from Last.fm", error);
    return { coverUrl: null, duration: null };
  }
};