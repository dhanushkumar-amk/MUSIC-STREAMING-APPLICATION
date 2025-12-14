import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

const SongItem = ({ image, name, desc, id }) => {
  const { playWithId } = usePlayer();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className='cursor-pointer group'
      onClick={() => playWithId(id)}
    >
      {/* Image */}
      <div className='relative overflow-hidden rounded-xl mb-3 bg-gray-100 shadow-sm'>
        <div className="relative aspect-square">
          <img
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
            src={image}
            alt={name}
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className='w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-2xl transition-colors'
            >
              <Play className='w-6 h-6 text-white fill-white ml-0.5' />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Song Info */}
      <div className="space-y-1">
        <p className='font-semibold text-gray-900 truncate text-sm'>
          {name}
        </p>
        <p className='text-gray-500 text-xs truncate'>
          {desc}
        </p>
      </div>
    </motion.div>
  );
};

export default SongItem;
