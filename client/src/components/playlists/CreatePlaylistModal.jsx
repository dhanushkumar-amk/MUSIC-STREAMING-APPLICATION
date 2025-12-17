import { useState } from 'react';
import { X, Lock, Unlock } from 'lucide-react';

export default function CreatePlaylistModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await onCreate(name, desc, isPublic);
    setLoading(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:inset-x-auto w-auto sm:w-full sm:max-w-md z-50 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create Playlist</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Playlist Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Playlist"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                required
                autoFocus
              />
            </div>

            {/* Description Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Privacy Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Privacy
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    !isPublic
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Lock className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Private</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    isPublic
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Unlock className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Public</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || loading}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
