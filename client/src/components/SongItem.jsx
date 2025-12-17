import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import SimpleDownloadButton from './SimpleDownloadButton';

const SongItem = ({ image, name, desc, id, song }) => {
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
            src={image || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='80' fill='%239ca3af'%3E♪%3C/text%3E%3C/svg%3E`}
            alt={name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='80' fill='%239ca3af'%3E♪%3C/text%3E%3C/svg%3E`;
            }}
          />

          {/* Download Button - Top Right */}
          {song && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <SimpleDownloadButton song={song} size="sm" />
            </div>
          )}

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
