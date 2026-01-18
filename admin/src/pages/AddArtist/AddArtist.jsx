import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Upload, X, Plus } from 'lucide-react';
import axios from 'axios';

const AddArtist = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    country: '',
    verified: false,
    featured: false
  });

  const [genres, setGenres] = useState([]);
  const [genreInput, setGenreInput] = useState('');

  const [socialLinks, setSocialLinks] = useState({
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    youtube: '',
    spotify: ''
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addGenre = () => {
    if (genreInput.trim() && !genres.includes(genreInput.trim())) {
      setGenres([...genres, genreInput.trim()]);
      setGenreInput('');
    }
  };

  const removeGenre = (genre) => {
    setGenres(genres.filter(g => g !== genre));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Artist name is required');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      data.append('country', formData.country);
      data.append('verified', formData.verified);
      data.append('featured', formData.featured);
      data.append('genres', JSON.stringify(genres));
      data.append('socialLinks', JSON.stringify(socialLinks));

      if (avatar) {
        data.append('avatar', avatar);
      }

      if (coverImage) {
        data.append('coverImage', coverImage);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/artist/create`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Artist created successfully');
        navigate('/list-artist');
      }
    } catch (error) {
      console.error('Error creating artist:', error);
      toast.error(error.response?.data?.message || 'Failed to create artist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Artist</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Artist Avatar</label>
            <div className="relative">
              {avatarPreview ? (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar(null);
                      setAvatarPreview('');
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Avatar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Cover Image</label>
            <div className="relative">
              {coverPreview ? (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview('');
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Cover</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Artist Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Tell us about the artist..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className="block text-sm font-medium mb-2">Genres</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add genre..."
            />
            <button
              type="button"
              onClick={addGenre}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
              >
                {genre}
                <button
                  type="button"
                  onClick={() => removeGenre(genre)}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium mb-2">Social Links</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(socialLinks).map((platform) => (
              <div key={platform}>
                <label className="block text-xs text-gray-600 mb-1 capitalize">{platform}</label>
                <input
                  type="url"
                  name={platform}
                  value={socialLinks[platform]}
                  onChange={handleSocialLinkChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={`https://${platform}.com/...`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="verified"
              checked={formData.verified}
              onChange={handleInputChange}
              className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm font-medium">Verified Artist</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm font-medium">Featured Artist</span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Creating...' : 'Create Artist'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/list-artist')}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddArtist;
