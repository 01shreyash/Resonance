import { useState, useEffect } from 'react';
import { Music, Play } from 'lucide-react';
// NEW: Import the upgraded fetcher
import { fetchTrackData } from '../services/lastfm';

interface TrackRowProps {
  index: number;
  title: string;
  artist: string;
  duration: string;
  isActive: boolean;
  onClick: () => void;
}

export default function TrackRow({ index, title, artist, duration, isActive, onClick }: TrackRowProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  
  // NEW: State to manage the timestamp display
  const [displayDuration, setDisplayDuration] = useState<string>(duration);

  const cleanArtist = artist.replace(" - Topic", "").trim();

  useEffect(() => {
    const getData = async () => {
      const result = await fetchTrackData(cleanArtist, title);
      
      if (result.coverUrl) {
        setCoverUrl(result.coverUrl);
      }
      
      // NEW: If Last.fm found a real duration, override the database's 0:00
      if (result.duration && result.duration !== "0:00") {
        setDisplayDuration(result.duration);
      }
    };
    getData();
  }, [cleanArtist, title]);

  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-lg transition-colors group cursor-pointer ${
        isActive ? 'bg-gray-800 border border-gray-700' : 'hover:bg-gray-800/50 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="w-4 text-right flex justify-center">
          {isActive ? (
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          ) : (
            <span className="text-gray-500 group-hover:text-white transition-colors">{index}</span>
          )}
        </span>
        
        <div className="w-10 h-10 bg-gray-900 rounded flex items-center justify-center shadow-inner overflow-hidden shrink-0">
          {coverUrl ? (
            <img src={coverUrl} alt={`${title} cover`} className="w-full h-full object-cover" />
          ) : (
            <Music className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-gray-600'}`} />
          )}
        </div>
        
        <div className="truncate">
          <h4 className={`font-medium transition-colors truncate ${isActive ? 'text-emerald-400' : 'text-white'}`}>
            {title}
          </h4>
          <p className="text-sm text-gray-400 truncate">{cleanArtist}</p>
        </div>
      </div>
      
      {/* NEW: Render the dynamic timestamp instead of the static prop */}
      <span className={`text-sm ml-4 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
        {displayDuration}
      </span>
    </div>
  );
}