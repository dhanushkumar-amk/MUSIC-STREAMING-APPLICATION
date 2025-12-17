import { useRef, useState, createContext, useContext as useReactContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "../Player";
import AuthNavbar from "./AuthNavbar";
import { useContext } from "react";
import { PlayerContext } from "../../context/PlayerContext";

// Create a context for mobile menu
export const MobileMenuContext = createContext();

export default function MainLayout() {
  const { track } = useContext(PlayerContext);
  const scrollContainerRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <MobileMenuContext.Provider value={{ toggleMobileMenu, closeMobileMenu }}>
      <div className='h-screen bg-white flex flex-col'>
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Upper Area: Sidebar + Main Content */}
        <div className={`flex ${track ? 'h-[calc(100vh-90px)]' : 'h-full'}`}>

          {/* Sidebar - Desktop: Fixed, Mobile: Slide-in */}
          <div className={`
            fixed md:static inset-y-0 left-0 z-50
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            w-[280px] md:w-[240px] lg:w-[280px]
          `}>
            <Sidebar onNavigate={closeMobileMenu} />
          </div>

          {/* Main Content (Scrollable) */}
          <div
            ref={scrollContainerRef}
            className='flex-1 bg-white overflow-y-scroll no-scrollbar relative'
          >
             <div className="relative z-10">
                <AuthNavbar />
                <div className="px-3 sm:px-4 md:px-6">
                  <Outlet />
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Area: Player */}
        <Player />

        {/* Audio Element */}
        {track && (
          <audio
            ref={useContext(PlayerContext).audioRef}
            src={track.file || ""}
            preload='auto'
            onEnded={useContext(PlayerContext).next}
          />
        )}
      </div>
    </MobileMenuContext.Provider>
  );
}
