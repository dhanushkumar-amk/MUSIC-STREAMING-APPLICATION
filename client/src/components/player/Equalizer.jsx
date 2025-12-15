import { useState, useEffect } from 'react';
import { settingsService } from '../../services/settings';
import toast from 'react-hot-toast';
import { Sliders, X, RotateCcw } from 'lucide-react';

const EQ_PRESETS = {
  flat: { name: 'Flat', icon: '━' },
  rock: { name: 'Rock', icon: '🎸' },
  pop: { name: 'Pop', icon: '🎤' },
  jazz: { name: 'Jazz', icon: '🎷' },
  classical: { name: 'Classical', icon: '🎻' },
  electronic: { name: 'Electronic', icon: '🎹' },
  'hip-hop': { name: 'Hip-Hop', icon: '🎧' }
};

const BAND_LABELS = [
  { key: 'band32', label: '32Hz' },
  { key: 'band64', label: '64Hz' },
  { key: 'band125', label: '125Hz' },
  { key: 'band250', label: '250Hz' },
  { key: 'band500', label: '500Hz' },
  { key: 'band1k', label: '1kHz' },
  { key: 'band2k', label: '2kHz' },
  { key: 'band4k', label: '4kHz' },
  { key: 'band8k', label: '8kHz' },
  { key: 'band16k', label: '16kHz' }
];

export default function Equalizer({ isOpen, onClose, onSettingsChange }) {
  const [enabled, setEnabled] = useState(false);
  const [preset, setPreset] = useState('flat');
  const [bands, setBands] = useState({
    band32: 0, band64: 0, band125: 0, band250: 0, band500: 0,
    band1k: 0, band2k: 0, band4k: 0, band8k: 0, band16k: 0
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
        setEnabled(response.settings.equalizerEnabled);
        setPreset(response.settings.equalizerPreset);
        setBands(response.settings.equalizerBands);
      }
    } catch (error) {
      console.error('Failed to load EQ settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      const newEnabled = !enabled;
      await settingsService.toggleEqualizer(newEnabled);
      setEnabled(newEnabled);
      onSettingsChange?.({ equalizerEnabled: newEnabled });
      toast.success(`Equalizer ${newEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle equalizer');
    }
  };

  const handlePresetChange = async (newPreset) => {
    try {
      const response = await settingsService.updateEqualizerPreset(newPreset);
      if (response.success) {
        setPreset(newPreset);
        setBands(response.settings.equalizerBands);
        onSettingsChange?.({
          equalizerPreset: newPreset,
          equalizerBands: response.settings.equalizerBands
        });
        toast.success(`Preset: ${EQ_PRESETS[newPreset]?.name || newPreset}`);
      }
    } catch (error) {
      toast.error('Failed to change preset');
    }
  };

  const handleBandChange = async (bandKey, value) => {
    const newBands = { ...bands, [bandKey]: parseFloat(value) };
    setBands(newBands);

    try {
      await settingsService.updateEqualizerBands(newBands);
      onSettingsChange?.({ equalizerBands: newBands });
    } catch (error) {
      console.error('Failed to update band:', error);
    }
  };

  const handleReset = () => {
    handlePresetChange('flat');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sliders className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Equalizer</h2>
                <p className="text-emerald-100 text-sm">Fine-tune your audio experience</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Equalizer</h3>
                  <p className="text-sm text-gray-600">Adjust audio frequencies</p>
                </div>
                <button
                  onClick={handleToggle}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    enabled ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      enabled ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Presets */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Presets</h3>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(EQ_PRESETS).map(([key, { name, icon }]) => (
                    <button
                      key={key}
                      onClick={() => handlePresetChange(key)}
                      disabled={!enabled}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preset === key
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-emerald-300 text-gray-700'
                      } ${!enabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                    >
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-sm font-medium">{name}</div>
                    </button>
                  ))}
                  <button
                    disabled={!enabled}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preset === 'custom'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-emerald-300 text-gray-700'
                    } ${!enabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                  >
                    <div className="text-2xl mb-1">⚙️</div>
                    <div className="text-sm font-medium">Custom</div>
                  </button>
                </div>
              </div>

              {/* Frequency Bands */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Frequency Bands</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-end justify-between gap-4 h-64">
                    {BAND_LABELS.map(({ key, label }) => (
                      <div key={key} className="flex flex-col items-center flex-1">
                        {/* Value Display */}
                        <div className="text-xs font-medium text-emerald-600 mb-2 h-6">
                          {bands[key] > 0 ? '+' : ''}{bands[key].toFixed(1)}dB
                        </div>

                        {/* Slider */}
                        <div className="relative h-full w-12 bg-gray-200 rounded-full overflow-hidden">
                          {/* Center line */}
                          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-400 z-10"></div>

                          {/* Fill */}
                          <div
                            className={`absolute left-0 right-0 transition-all ${
                              bands[key] >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                            style={{
                              bottom: '50%',
                              height: `${Math.abs(bands[key]) * 4.166}%`,
                              top: bands[key] >= 0 ? 'auto' : '50%'
                            }}
                          ></div>

                          <input
                            type="range"
                            min="-12"
                            max="12"
                            step="0.5"
                            value={bands[key]}
                            onChange={(e) => handleBandChange(key, e.target.value)}
                            disabled={!enabled}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            style={{
                              writingMode: 'bt-lr',
                              WebkitAppearance: 'slider-vertical'
                            }}
                          />
                        </div>

                        {/* Label */}
                        <div className="text-xs text-gray-600 font-medium mt-3">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Scale */}
                  <div className="flex justify-between mt-4 text-xs text-gray-500">
                    <span>-12dB</span>
                    <span>0dB</span>
                    <span>+12dB</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Adjust individual frequency bands to customize your sound.
                  Lower frequencies (32Hz-250Hz) control bass, mid frequencies (500Hz-2kHz) affect vocals,
                  and higher frequencies (4kHz-16kHz) control treble and clarity.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
