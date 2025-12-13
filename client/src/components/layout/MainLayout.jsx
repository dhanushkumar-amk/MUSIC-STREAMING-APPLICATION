import { useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "../Player";
import { useContext } from "react";
import { PlayerContext } from "../../context/PlayerContext";

export default function MainLayout() {
  const { track } = useContext(PlayerContext);
  const scrollContainerRef = useRef(null);

  // You can expose search bar functionality here if needed
  // using imperative handle or context

  return (
    <div className='h-screen bg-black text-white flex flex-col'>
      {/* Upper Area: Sidebar + Main Content */}
      <div className='flex h-[calc(100vh-90px)]'>

        {/* Sidebar (Fixed width) */}
        <Sidebar className="hidden md:flex w-[240px] lg:w-[280px]" />

        {/* Main Content (Scrollable) */}
        <div
          ref={scrollContainerRef}
          className='flex-1 bg-[#121212] rounded-lg m-2 overflow-y-scroll no-scrollbar relative'
        >
             {/* Gradient Background Effect (Optional) */}
             <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-900/30 to-transparent pointer-events-none" />

             <div className="relative z-10 p-6">
                <Outlet />
             </div>
        </div>

        {/* Right Sidebar (Optional - e.g. Friend Activity)
            Hidden for now as per Spotify standard layout */}
      </div>

      {/* Bottom Area: Player */}
      <Player />

      {/* Mobile Audio File Logic (Hidden) */}
      <audio
        ref={useContext(PlayerContext).audioRef}
        src={track ? track.file : ""}
        preload='auto'
        onEnded={useContext(PlayerContext).next}
      />
    </div>
  );
}
