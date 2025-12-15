import { useState, useEffect } from 'react';
import { settingsService } from '../../services/settings';
import toast from 'react-hot-toast';
import { Settings, Gauge, Zap, Volume2, Music, X } from 'lucide-react';

const AUDIO_QUALITY_OPTIONS = [
  { value: 'low', label: 'Low', bitrate: '96 kbps', description: 'Save data' },
  { value: 'medium', label: 'Medium', bitrate: '160 kbps', description: 'Balanced' },
  { value: 'high', label: 'High', bitrate: '320 kbps', description: 'Best quality' },
  { value: 'very_high', label: 'Very High', bitrate: 'Lossless', description: 'Premium' }
];

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export default function AdvancedPlaybackSettings({ isOpen, onClose, onSettingsChange }) {
  const [settings, setSettings] = useState({
    audioQuality: 'high',
    crossfadeDuration: 0,
    gaplessPlayback: true,
    normalizeVolume: false,
    playbackSpeed: 1.0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const response = await settingsService.getSettings();
      if (response.success) {
        setSettings({
          audioQuality: response.settings.audioQuality,
          crossfadeDuration: response.settings.crossfadeDuration,
          gaplessPlayback: response.settings.gaplessPlayback,
          normalizeVolume: response.settings.normalizeVolume,
          playbackSpeed: response.settings.playbackSpeed
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioQualityChange = async (quality) => {
    try {
      await settingsService.updateAudioQuality(quality);
      setSettings(prev => ({ ...prev, audioQuality: quality }));
      onSettingsChange?.({ audioQuality: quality });
      toast.success(`Audio quality: ${quality}`);
    } catch (error) {
      toast.error('Failed to update audio quality');
    }
  };

  const handleCrossfadeChange = async (duration) => {
    try {
      await settingsService.updateCrossfade(duration);
      setSettings(prev => ({ ...prev, crossfadeDuration: duration }));
      onSettingsChange?.({ crossfadeDuration: duration });
    } catch (error) {
      toast.error('Failed to update crossfade');
    }
  };

  const handleGaplessToggle = async () => {
    try {
      const newValue = !settings.gaplessPlayback;
      await settingsService.toggleGapless(newValue);
      setSettings(prev => ({ ...prev, gaplessPlayback: newValue }));
      onSettingsChange?.({ gaplessPlayback: newValue });
      toast.success(`Gapless playback ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle gapless');
    }
  };

  const handleNormalizeToggle = async () => {
    try {
      const newValue = !settings.normalizeVolume;
      await settingsService.toggleNormalize(newValue);
      setSettings(prev => ({ ...prev, normalizeVolume: newValue }));
      onSettingsChange?.({ normalizeVolume: newValue });
      toast.success(`Volume normalization ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle normalize');
    }
  };

  const handlePlaybackSpeedChange = async (speed) => {
    try {
      await settingsService.updatePlaybackSpeed(speed);
      setSettings(prev => ({ ...prev, playbackSpeed: speed }));
      onSettingsChange?.({ playbackSpeed: speed });
      toast.success(`Playback speed: ${speed}x`);
    } catch (error) {
      toast.error('Failed to update playback speed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Advanced Playback</h2>
                <p className="text-blue-100 text-sm">Customize your listening experience</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Audio Quality */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900">
                  <Music className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Audio Quality</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {AUDIO_QUALITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAudioQualityChange(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        settings.audioQuality === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.bitrate}</div>
                      <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crossfade */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Crossfade</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {settings.crossfadeDuration === 0 ? 'Off' : `${settings.crossfadeDuration}s`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={settings.crossfadeDuration}
                    onChange={(e) => handleCrossfadeChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Off</span>
                    <span>12s</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Seamlessly blend tracks by overlapping the end of one song with the beginning of the next
                  </p>
                </div>
              </div>

              {/* Playback Speed */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900">
                  <Gauge className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Playback Speed</h3>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handlePlaybackSpeedChange(speed)}
                      className={`py-2 px-3 rounded-lg border-2 transition-all font-semibold ${
                        settings.playbackSpeed === speed
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  Adjust playback speed without changing pitch (great for podcasts and audiobooks)
                </p>
              </div>

              {/* Toggle Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Audio Enhancements</h3>
                </div>

                {/* Gapless Playback */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Gapless Playback</h4>
                    <p className="text-sm text-gray-600">Eliminate silence between tracks</p>
                  </div>
                  <button
                    onClick={handleGaplessToggle}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.gaplessPlayback ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.gaplessPlayback ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Normalize Volume */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Normalize Volume</h4>
                    <p className="text-sm text-gray-600">Keep consistent volume across all tracks</p>
                  </div>
                  <button
                    onClick={handleNormalizeToggle}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.normalizeVolume ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.normalizeVolume ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>💡 Pro Tip:</strong> Enable crossfade and gapless playback for a seamless listening experience.
                  Volume normalization is great for playlists with songs from different albums or eras.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
