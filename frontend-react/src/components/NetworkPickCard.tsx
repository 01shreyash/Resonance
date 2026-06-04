import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { fetchTrackData } from '../services/lastfm';

interface Track {
  id: number;
  title: string;
  artist: string;
  strength?: number;
}

interface NetworkPickCardProps {
  track: Track;
  isActive: boolean;
  onClick: () => void;
}

export default function NetworkPickCard({ track, isActive, onClick }: NetworkPickCardProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  
  // Clean the artist name!
  const cleanArtist = track.artist.replace(" - Topic", "").trim();

  useEffect(() => {
    const getData = async () => {
      const result = await fetchTrackData(cleanArtist, track.title);
      if (result.coverUrl) {
        setCoverUrl(result.coverUrl);
      }
    };
    getData();
  }, [cleanArtist, track.title]);

  return (
    <div 
      onClick={onClick}
      className={`bg-gray-800/60 hover:bg-gray-700/80 transition-colors p-4 rounded-xl flex items-center gap-4 cursor-pointer border ${isActive ? 'border-emerald-500' : 'border-gray-700/50'}`}
    >
      <div className="w-12 h-12 bg-gray-900 rounded flex items-center justify-center shadow-inner overflow-hidden shrink-0">
        {coverUrl ? (
          <img src={coverUrl} alt={`${track.title} cover`} className="w-full h-full object-cover" />
        ) : (
          <Music className={`w-6 h-6 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold text-sm truncate ${isActive ? 'text-emerald-400' : 'text-white'}`}>
          {track.title}
        </h4>
        <p className="text-xs text-gray-400 truncate">{cleanArtist}</p>
      </div>
      <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full shrink-0">
        Strength: {track.strength}
      </div>
    </div>
  );
}