import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import PlayerBar from '../components/PlayerBar';
import TrackRow from '../components/TrackRow';
import NetworkPickCard from '../components/NetworkPickCard'; // NEW: Imported the shiny new card!
import { Network, Users, Search } from 'lucide-react';
import api from '../services/api';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  strength?: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<{ username: string, id: string } | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [networkPicks, setNetworkPicks] = useState<Track[]>([]);
  const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);

  // 1. Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };
    fetchProfile();
  }, []);

  // 2. Fetch Network Picks (Collaborative AI)
  useEffect(() => {
    const fetchNetworkPicks = async () => {
      try {
        // Hardcoded UUID for testing the collaborative network
        const userId = 'a1b1be59-50a8-4255-a041-845c603083c9'; 
        const response = await fetch(`http://localhost:8000/api/recommend/collaborative/${userId}`);
        const data = await response.json();
        if (data.recommendations) setNetworkPicks(data.recommendations);
      } catch (error) { console.error("Failed to fetch network picks", error); }
    };
    fetchNetworkPicks();
  }, []);

  // 3. Fetch Library Tracks
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/tracks');
        const data = await response.json();
        if (data.tracks) setLibraryTracks(data.tracks);
      } catch (error) { console.error("Failed to fetch library", error); }
    };
    fetchLibrary();
  }, []);

  // 4. Fetch AI Recommendations (Content-Based AI)
  useEffect(() => {
    if (!currentTrack) return;
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/recommend/${currentTrack.id}`);
        const data = await response.json();
        if (data.recommendations) setRecommendations(data.recommendations);
      } catch (error) { console.error("Failed to fetch AI recommendations", error); }
    };
    fetchRecommendations();
  }, [currentTrack]);

  // 5. Live Search Engine
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (data.tracks) setSearchResults(data.tracks);
      } catch (error) {
        console.error("Search failed", error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        
        <Sidebar username={user?.username} />

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-800 to-black p-8">
          
          {/* TOP HEADER & SEARCH BAR */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              Good Evening, {user?.username || 'Guest'}
            </h2>
            
            <div className="relative w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search artists or tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-full leading-5 bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
              />
            </div>
          </div>
          
          {/* SEARCH RESULTS OVERRIDE */}
          {searchQuery.trim() !== "" ? (
            <div className="mb-8 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-emerald-400">
                Search Results for "{searchQuery}"
              </h2>
              {searchResults.length === 0 ? (
                <p className="text-gray-500 italic">No tracks found in your database.</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((track, index) => (
                    <TrackRow 
                      key={`search-${track.id}`}
                      index={index + 1}
                      title={track.title}
                      artist={track.artist}
                      duration={track.duration}
                      isActive={currentTrack?.id === track.id}
                      onClick={() => handlePlayTrack(track)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* NORMAL DASHBOARD */}
              
              {/* Network Picks Section */}
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-400">
                  <Users className="w-5 h-5" />
                  Your Network Picks (Collaborative AI)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {networkPicks.map((track) => (
                    // We swapped the old div for the new NetworkPickCard!
                    <NetworkPickCard 
                      key={`network-${track.id}`}
                      track={track}
                      isActive={currentTrack?.id === track.id}
                      onClick={() => handlePlayTrack(track)}
                    />
                  ))}
                </div>
              </div>

              {/* Lower Section: Library vs Up Next */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Left: General Library */}
                <div>
                  <h2 className="text-xl font-bold mb-4">All Tracks</h2>
                  <div className="space-y-2">
                    {libraryTracks.map((track, index) => (
                      <TrackRow 
                        key={`lib-${track.id}`}
                        index={index + 1}
                        title={track.title}
                        artist={track.artist}
                        duration={track.duration}
                        isActive={currentTrack?.id === track.id}
                        onClick={() => handlePlayTrack(track)}
                      />
                    ))}
                  </div>
                </div>

                {/* Right: AI Up Next Queue */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
                    <Network className="w-5 h-5" />
                    Up Next (Content-Based AI)
                  </h2>
                  {!currentTrack ? (
                    <div className="text-gray-500 text-sm italic py-8 text-center border-2 border-dashed border-gray-800 rounded-lg">
                      Play a track to see AI recommendations...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recommendations.map((track, index) => (
                        <TrackRow 
                          key={`rec-${track.id}`}
                          index={index + 1}
                          title={track.title}
                          artist={track.artist}
                          duration={track.duration}
                          isActive={false} 
                          onClick={() => handlePlayTrack(track)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Upgraded PlayerBar with Thumbs Up/Down */}
      <PlayerBar 
        currentTrack={currentTrack} 
        isPlaying={isPlaying} 
        onTogglePlay={() => setIsPlaying(!isPlaying)} 
      />
    </div>
  );
}