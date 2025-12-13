import React, { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Mic2, LayoutList, Volume2, MonitorSpeaker, Maximize2 } from 'lucide-react'
import { Slider } from "@/components/ui/slider"

const Player = () => {

  const { track, seekBar, seekBg, playStatus, play, pause, time, previous, next, seekSong } = useContext(PlayerContext);

  // Fallback if no track is loaded
  if (!track) return null;

  return (
    <div className='fixed bottom-0 w-full h-[90px] bg-black/90 backdrop-blur-lg border-t border-white/10 px-4 text-white flex justify-between items-center z-50'>

      {/* LEFT: Song Info */}
      <div className='hidden lg:flex items-center gap-4 w-[30%]'>
        <img className='w-12 h-12 rounded object-cover' src={track.image} alt="" />
        <div>
          <p className='font-medium hover:underline cursor-pointer'>{track.name}</p>
          <p className='text-xs text-gray-400 hover:underline cursor-pointer'>{track.desc.slice(0, 30)}</p>
        </div>
      </div>

      {/* CENTER: Controls & Progress */}
      <div className='flex flex-col items-center gap-1 m-auto w-[40%]'>
        <div className='flex gap-4'>
          <Shuffle className='w-4 cursor-pointer hover:text-green-500 transition-colors text-gray-400' />
          <SkipBack onClick={previous} className='w-5 cursor-pointer hover:text-white transition-colors fill-current' />

          {playStatus
            ? <Pause onClick={pause} className='w-8 h-8 cursor-pointer hover:scale-105 transition-transform fill-white' />
            : <Play onClick={play} className='w-8 h-8 cursor-pointer hover:scale-105 transition-transform fill-white' />
          }

          <SkipForward onClick={next} className='w-5 cursor-pointer hover:text-white transition-colors fill-current' />
          <Repeat className='w-4 cursor-pointer hover:text-green-500 transition-colors text-gray-400' />
        </div>

        <div className='flex items-center gap-3 w-full'>
          <p className='text-xs text-gray-400 min-w-[35px] text-right'>
            {time.currentTime.minute}:{time.currentTime.second.toString().padStart(2, '0')}
          </p>

          <div ref={seekBg} onClick={seekSong} className='w-full bg-gray-600 rounded-full cursor-pointer h-1 hover:h-1.5 transition-all group'>
            <div ref={seekBar} className='h-full bg-white rounded-full group-hover:bg-green-500 relative'>
                <div className='absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md'></div>
            </div>
          </div>

          <p className='text-xs text-gray-400 min-w-[35px]'>
            {time.totalTime.minute}:{time.totalTime.second.toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* RIGHT: Volume & Extras */}
      <div className='hidden lg:flex items-center gap-2 opacity-75 w-[30%] justify-end'>
        <Mic2 className='w-4 cursor-pointer hover:text-white' />
        <LayoutList className='w-4 cursor-pointer hover:text-white' />
        <MonitorSpeaker className='w-4 cursor-pointer hover:text-white' />
        <div className='flex items-center gap-2 w-24 group'>
            <Volume2 className='w-4' />
            <Slider defaultValue={[100]} max={100} step={1} className="w-full cursor-pointer" />
        </div>
        <Maximize2 className='w-4 cursor-pointer hover:text-white ml-2' />
      </div>

    </div>
  )
}

export default Player
