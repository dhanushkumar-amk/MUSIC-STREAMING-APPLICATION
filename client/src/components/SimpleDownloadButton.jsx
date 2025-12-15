import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SimpleDownloadButton = ({ song, size = 'md', showLabel = false }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation(); // Prevent triggering song play

    if (isDownloading) return;

    try {
      setIsDownloading(true);
      toast.loading('Downloading song...', { id: 'download' });

      // Fetch the audio file
      const response = await fetch(song.file);
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Set filename (sanitize song name)
      const filename = `${song.name} - ${song.artist || song.desc}.mp3`
        .replace(/[^a-z0-9\s\-_.]/gi, '') // Remove special characters
        .replace(/\s+/g, '_'); // Replace spaces with underscores

      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Song downloaded!', { id: 'download' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download song', { id: 'download' });
    } finally {
      setIsDownloading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`${sizeClasses[size]} bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group`}
      title="Download song"
    >
      {isDownloading ? (
        <Loader2 className={`${iconSizes[size]} text-emerald-600 animate-spin`} />
      ) : (
        <Download className={`${iconSizes[size]} text-emerald-600 group-hover:text-emerald-700 transition-colors`} />
      )}
      {showLabel && !isDownloading && (
        <span className="ml-2 text-sm font-medium text-gray-700">Download</span>
      )}
    </button>
  );
};

export default SimpleDownloadButton;
