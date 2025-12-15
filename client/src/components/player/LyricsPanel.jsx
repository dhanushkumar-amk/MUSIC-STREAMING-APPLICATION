import { useState, useEffect, useRef } from 'react';
import { lyricsService } from '../../services/settings';
import { lyricsAPI } from '../../services/lyricsAPI';
import { Music2, X, Loader, Download } from 'lucide-react';

export default function LyricsPanel({ songId, songName, artistName, duration, currentTime, isOpen, onClose }) {
  const [lyrics, setLyrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [autoFetching, setAutoFetching] = useState(false);
  const lyricsContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && songId) {
      loadLyrics();
    }
  }, [isOpen, songId]);

  useEffect(() => {
    if (lyrics?.syncedLyrics && lyrics.syncedLyrics.length > 0) {
      updateCurrentLine();
    }
  }, [currentTime, lyrics]);

  const loadLyrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await lyricsService.getLyrics(songId);
      if (response.success) {
        setLyrics(response.lyrics);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No lyrics in database');
        // Don't set loading to false yet, we'll try auto-fetch
      } else {
        setError('Failed to load lyrics');
        setLoading(false);
      }
    } finally {
      if (!error) {
        setLoading(false);
      }
    }
  };

  // Auto-fetch lyrics from free API
  const handleAutoFetch = async () => {
    if (!songName || !artistName) {
      setError('Missing song or artist name');
      setLoading(false);
      return;
    }

    setAutoFetching(true);
    setError(null);

    try {
      const fetchedLyrics = await lyricsAPI.autoFetchLyrics(songName, artistName, '', duration);

      if (fetchedLyrics && (fetchedLyrics.syncedLyrics.length > 0 || fetchedLyrics.plainLyrics)) {
        setLyrics(fetchedLyrics);
        setError(null);

        // Optionally save to database
        try {
          await lyricsService.upsertLyrics({
            songId,
            plainLyrics: fetchedLyrics.plainLyrics,
            syncedLyrics: fetchedLyrics.syncedLyrics,
            language: 'en',
            source: 'lrclib'
          });
        } catch (saveError) {
          console.log('Could not save lyrics to database (admin only)');
        }
      } else {
        setError('No lyrics found online');
      }
    } catch (err) {
      console.error('Auto-fetch failed:', err);
      setError('Failed to fetch lyrics');
    } finally {
      setAutoFetching(false);
      setLoading(false);
    }
  };

  const updateCurrentLine = () => {
    if (!lyrics?.syncedLyrics) return;

    // Find the current line based on time
    let index = -1;
    for (let i = 0; i < lyrics.syncedLyrics.length; i++) {
      if (currentTime >= lyrics.syncedLyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }

    if (index !== currentLineIndex) {
      setCurrentLineIndex(index);

      // Auto-scroll to current line
      if (lyricsContainerRef.current && index >= 0) {
        const lineElement = lyricsContainerRef.current.querySelector(`[data-line-index="${index}"]`);
        if (lineElement) {
          lineElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music2 className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Lyrics</h2>
                <p className="text-purple-100 text-sm">Sing along with the music</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading lyrics...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Music2 className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-2">{error}</p>
              {songName && artistName ? (
                <button
                  onClick={handleAutoFetch}
                  disabled={autoFetching}
                  className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {autoFetching ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Fetching lyrics...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Fetch Lyrics Online
                    </>
                  )}
                </button>
              ) : (
                <p className="text-gray-500 text-sm">Lyrics will be added soon</p>
              )}
            </div>
          ) : lyrics?.syncedLyrics && lyrics.syncedLyrics.length > 0 ? (
            // Synchronized Lyrics
            <div
              ref={lyricsContainerRef}
              className="h-full overflow-y-auto p-8 space-y-6"
            >
              {lyrics.syncedLyrics.map((line, index) => (
                <div
                  key={index}
                  data-line-index={index}
                  className={`transition-all duration-300 ${
                    index === currentLineIndex
                      ? 'text-purple-600 text-2xl font-bold scale-105'
                      : index < currentLineIndex
                      ? 'text-gray-400 text-lg'
                      : 'text-gray-600 text-lg'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-xs text-gray-400 font-mono mt-1 w-12 flex-shrink-0">
                      {formatTime(line.time)}
                    </span>
                    <p className="flex-1 leading-relaxed">{line.text}</p>
                  </div>
                </div>
              ))}

              {/* Spacer at bottom */}
              <div className="h-64"></div>
            </div>
          ) : lyrics?.plainLyrics ? (
            // Plain Lyrics
            <div className="h-full overflow-y-auto p-8">
              <div className="prose prose-lg max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                  {lyrics.plainLyrics}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Music2 className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">No lyrics available</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {lyrics && !error && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>
                  {lyrics.syncedLyrics?.length > 0 ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Synchronized
                    </span>
                  ) : (
                    'Plain text'
                  )}
                </span>
                {lyrics.language && (
                  <span className="text-gray-400">•</span>
                )}
                {lyrics.language && (
                  <span>{lyrics.language.toUpperCase()}</span>
                )}
              </div>
              {lyrics.source && (
                <span className="text-gray-400 text-xs">
                  Source: {lyrics.source}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
