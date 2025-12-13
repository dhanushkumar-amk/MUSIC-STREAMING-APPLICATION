import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import AlbumItem from '../components/AlbumItem'
import SongItem from '../components/SongItem'
import { PlayerContext } from '../context/PlayerContext'
import { albumService, songService } from '../services/music'

const HomePage = () => {

  const { songsData, getSongsData } = useContext(PlayerContext);
  const [albumsData, setAlbumsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Songs are already fetched in Context, but we can double check or just use them
            // Fetch Albums
            const albumRes = await albumService.getAll();
            if(albumRes.success) {
                setAlbumsData(albumRes.albums);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  if(loading) return <div className="text-white p-8">Loading...</div>

  return (
    <>
      <Navbar />

      {/* Featured Charts / Albums */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold mb-5 mt-5'>Featured Charts</h1>
        <div className='flex overflow-auto gap-4 no-scrollbar pb-4'>
          {albumsData.length > 0 ? (
              albumsData.map((item, index) => (
                  <AlbumItem key={index} name={item.name} desc={item.desc} id={item._id} image={item.image} />
              ))
          ) : (
             <p className="text-gray-400">No albums available</p>
          )}
        </div>
      </div>

      {/* Today's Biggest Hits / Songs */}
      <div className='mb-24'>
        <h1 className='text-2xl font-bold mb-5'>Today's Biggest Hits</h1>
        <div className='flex overflow-auto gap-4 no-scrollbar pb-4'>
          {songsData.length > 0 ? (
              songsData.map((item, index) => (
                  <SongItem key={index} name={item.name} desc={item.desc} id={item._id} image={item.image} />
              ))
          ) : (
            <p className="text-gray-400">No songs available</p>
          )}
        </div>
      </div>
    </>
  )
}

export default HomePage
