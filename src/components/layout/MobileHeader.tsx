import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function MobileHeader({ sidebarOpen, setSidebarOpen }: MobileHeaderProps) {
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
          
          <div className="flex items-center space-x-2">
            <img 
              src="/img/stylsiaLOGO-05.png" 
              alt="Stylsia" 
              className="h-8 w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}