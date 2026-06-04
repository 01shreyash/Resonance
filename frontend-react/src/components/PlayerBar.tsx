import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
}

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export default function PlayerBar({ currentTrack, isPlaying, onTogglePlay }: PlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  
  // NEW: Track the user's feedback for the current song
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const cleanArtist = currentTrack?.artist.replace(" - Topic", "").trim() || "";

  useEffect(() => {
    if (!currentTrack) return;
    
    setProgress(0);
    setCurrentTime("0:00");
    setFeedback(null); // Reset the thumbs when a new song plays!

    const fetchAudio = async () => {
      try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanArtist + ' ' + currentTrack.title)}&entity=song&limit=1`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setPreviewUrl(data.results[0].previewUrl);
        } else {
          setPreviewUrl(null);
        }
      } catch (err) {
        console.error("Failed to fetch audio", err);
        setPreviewUrl(null);
      }
    };
    fetchAudio();
  }, [currentTrack, cleanArtist]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && previewUrl) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [isPlaying, previewUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) setProgress((current / duration) * 100);
      const seconds = Math.floor(current);
      setCurrentTime(`0:${seconds.toString().padStart(2, '0')}`);
    }
  };

  // NEW: Send the interaction to FastAPI and Neo4j!
  const handleFeedback = async (action: "like" | "dislike") => {
    if (!currentTrack) return;
    setFeedback(action); // Instantly light up the button in the UI

    try {
      await fetch(`http://localhost:8000/api/interact/${currentTrack.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: 'a1b1be59-50a8-4255-a041-845c603083c9', // Using your specific UUID
          action: action 
        })
      });
    } catch (error) {
      console.error("Failed to send feedback", error);
    }
  };

  return (
    <div className="h-24 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-6 z-50">
      <audio ref={audioRef} src={previewUrl || undefined} onEnded={onTogglePlay} onTimeUpdate={handleTimeUpdate}/>

      {/* Left: Track Info & Feedback Buttons */}
      <div className="w-1/3 flex items-center gap-4">
        <div className="w-14 h-14 bg-black rounded shadow-inner flex items-center justify-center border border-gray-800">
          <Music className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="flex flex-col">
          <h4 className="font-semibold text-white truncate max-w-[200px]">
            {currentTrack ? currentTrack.title : "Select a track"}
          </h4>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">
            {currentTrack ? cleanArtist : "To start listening"}
          </p>
        </div>
        
        {/* NEW: Thumbs Up / Thumbs Down */}
        {currentTrack && (
          <div className="flex items-center gap-3 ml-4">
            <button onClick={() => handleFeedback("like")} className="focus:outline-none hover:scale-110 transition-transform">
              <ThumbsUp className={`w-4 h-4 ${feedback === "like" ? "text-emerald-500 fill-emerald-500" : "text-gray-500 hover:text-emerald-400"}`} />
            </button>
            <button onClick={() => handleFeedback("dislike")} className="focus:outline-none hover:scale-110 transition-transform">
              <ThumbsDown className={`w-4 h-4 ${feedback === "dislike" ? "text-red-500 fill-red-500" : "text-gray-500 hover:text-red-400"}`} />
            </button>
          </div>
        )}
      </div>

      {/* Center: Playback Controls */}
      <div className="w-1/3 flex flex-col items-center">
        <div className="flex items-center gap-6 mb-2">
          <SkipBack className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          <button 
            onClick={onTogglePlay}
            disabled={!currentTrack || !previewUrl}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              currentTrack && previewUrl ? 'bg-emerald-500 hover:bg-emerald-400 hover:scale-105' : 'bg-gray-800 cursor-not-allowed'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5 text-black fill-black" /> : <Play className="w-5 h-5 text-black fill-black ml-1" />}
          </button>
          <SkipForward className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
        </div>
        
        <div className="w-full max-w-md flex items-center gap-3">
          <span className="text-[10px] text-gray-500 w-6">{currentTime}</span>
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-[10px] text-gray-500">0:30</span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="w-1/3 flex items-center justify-end gap-3">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="w-2/3 h-full bg-emerald-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}