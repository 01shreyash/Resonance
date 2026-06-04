import { useNavigate } from 'react-router-dom';
import { LogOut, Home, Search, Library, Network, User } from 'lucide-react';

interface SidebarProps {
  username?: string; 
}

export default function Sidebar({ username }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <aside className="w-64 bg-gray-900 flex flex-col border-r border-gray-800 h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
          <Network className="w-6 h-6" />
          Resonance
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Home className="w-5 h-5" /> Home
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Search className="w-5 h-5" /> Search
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Library className="w-5 h-5" /> Your Library
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-indigo-400 hover:bg-gray-800 rounded-lg transition-colors mt-6">
          <Network className="w-5 h-5" /> AI Recommendations
        </a>
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-4">
        <div className="flex items-center gap-3 px-2 text-gray-300">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="font-medium truncate">{username || 'Loading...'}</span>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </button>
      </div>
    </aside>
  );
}