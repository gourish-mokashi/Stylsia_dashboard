import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function MobileHeader({ sidebarOpen, setSidebarOpen }: MobileHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu button and logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors touch-target"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <button onClick={() => navigate('/')} className="flex items-center space-x-2 focus:outline-none hover:opacity-80 transition-opacity">
            <img 
              src="/img/logo.png" 
              alt="Stylsia" 
              className="h-8 w-auto"
            />
          </button>
        </div>
      </div>
    </div>
  );
}