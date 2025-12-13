import { createContext, useEffect, useRef, useState, useContext } from "react";
import { songService } from "../services/music";

export const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = (props) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const [songsData, setSongsData] = useState([]);
  const [track, setTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: { second: 0, minute: 0 },
    totalTime: { second: 0, minute: 0 },
  });

  // Fetch initial songs
  useEffect(() => {
    getSongsData();
  }, []);

  const getSongsData = async () => {
    try {
      const { success, songs } = await songService.getAll();
      if (success && songs.length > 0) {
        setSongsData(songs);
        setTrack(songs[0]);
      }
    } catch (error) {
      console.log("Error fetching songs:", error);
    }
  };

  const play = () => {
    audioRef.current.play();
    setPlayStatus(true);
  };

  const pause = () => {
    audioRef.current.pause();
    setPlayStatus(false);
  };

  const playWithId = async (id) => {
    const selectedTrack = songsData.find((item) => item._id === id);
    if (selectedTrack) {
        await setTrack(selectedTrack);
        await audioRef.current.play();
        setPlayStatus(true);
    }
  };

  const previous = async () => {
    const index = songsData.findIndex(item => item._id === track._id);
    if(index > 0) {
        await setTrack(songsData[index - 1]);
        await audioRef.current.play();
        setPlayStatus(true);
    }
  };

  const next = async () => {
    const index = songsData.findIndex(item => item._id === track._id);
    if(index < songsData.length - 1) {
        await setTrack(songsData[index + 1]);
        await audioRef.current.play();
        setPlayStatus(true);
    } else {
        // Loop back to start (optional) or stop
        await setTrack(songsData[0]);
        await audioRef.current.play();
        setPlayStatus(true);
    }
  };

  const seekSong = (e) => {
    audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration);
  };

  // Time Update Effect
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.ontimeupdate = () => {
      seekBar.current.style.width = (Math.floor(audioRef.current.currentTime / audioRef.current.duration * 100)) + "%";
      setTime({
        currentTime: {
          second: Math.floor(audioRef.current.currentTime % 60),
          minute: Math.floor(audioRef.current.currentTime / 60),
        },
        totalTime: {
          second: Math.floor(audioRef.current.duration % 60),
          minute: Math.floor(audioRef.current.duration / 60),
        },
      });
    };
  }, [audioRef]);


  const contextValue = {
    audioRef,
    seekBar,
    seekBg,
    track,
    setTrack,
    playStatus,
    setPlayStatus,
    time,
    setTime,
    play,
    pause,
    playWithId,
    previous,
    next,
    seekSong,
    songsData,
    getSongsData
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
