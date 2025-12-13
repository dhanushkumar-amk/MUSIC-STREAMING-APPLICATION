import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

const AlbumItem = ({ image, name, desc, id }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/album/${id}`)}
      className='min-w-[180px] p-4 px-3 rounded-lg cursor-pointer hover:bg-white/10 transition-all group'
    >
      <div className='relative'>
        <img
          className='rounded-lg w-full aspect-square object-cover mb-4'
          src={image}
          alt={name}
        />
        <button
          className='absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-xl hover:scale-105'
          onClick={(e) => {
            e.stopPropagation();
            // Play album logic can be added here
          }}
        >
          <Play className='w-5 h-5 text-black fill-black ml-0.5' />
        </button>
      </div>
      <p className='font-bold mb-1 truncate'>{name}</p>
      <p className='text-slate-400 text-sm truncate'>{desc}</p>
    </div>
  );
};

export default AlbumItem;
