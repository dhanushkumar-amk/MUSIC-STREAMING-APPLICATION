import { useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "../Player";
import { useContext } from "react";
import { PlayerContext } from "../../context/PlayerContext";

export default function MainLayout() {
  const { track } = useContext(PlayerContext);
  const scrollContainerRef = useRef(null);

  return (
    <div className='h-screen bg-white flex flex-col'>
      {/* Upper Area: Sidebar + Main Content */}
      <div className='flex h-[calc(100vh-90px)]'>

        {/* Sidebar (Fixed width) */}
        <Sidebar className="hidden md:flex w-[240px] lg:w-[280px]" />

        {/* Main Content (Scrollable) */}
        <div
          ref={scrollContainerRef}
          className='flex-1 bg-white overflow-y-scroll no-scrollbar relative'
        >
             <div className="relative z-10 p-6">
                <Outlet />
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
  );
}
