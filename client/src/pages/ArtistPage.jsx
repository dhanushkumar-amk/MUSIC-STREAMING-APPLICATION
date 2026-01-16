import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Play, Heart, MoreVertical, Share2, ExternalLink, Users, Music, Disc, CheckCircle } from 'lucide-react';
import artistAPI from '../services/artist';
import { usePlayer } from '../context/PlayerContext';

const ArtistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, setQueue } = usePlayer();

  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [similarArtists, setSimilarArtists] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchArtistData();
  }, [id]);

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      const [artistData, similarData] = await Promise.all([
        artistAPI.getArtistById(id),
        artistAPI.getSimilarArtists(id, 6)
      ]);

      setArtist(artistData.artist);
      setSongs(artistData.songs || []);
      setAlbums(artistData.albums || []);
      setIsFollowing(artistData.artist.isFollowing);
      setSimilarArtists(similarData.artists || []);
    } catch (error) {
      console.error('Error fetching artist:', error);
      toast.error('Failed to load artist');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await artistAPI.unfollowArtist(id);
        toast.success('Unfollowed artist');
        setIsFollowing(false);
        setArtist(prev => ({ ...prev, followerCount: prev.followerCount - 1 }));
      } else {
        await artistAPI.followArtist(id);
        toast.success('Following artist');
        setIsFollowing(true);
        setArtist(prev => ({ ...prev, followerCount: prev.followerCount + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs);
      playSong(songs[0]);
      toast.success('Playing all songs');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Artist not found</h2>
        <button onClick={() => navigate('/home')} className="btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px]">
        {/* Cover Image */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-black"
          style={{
            backgroundImage: artist.coverImage ? `url(${artist.coverImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
        </div>

        {/* Artist Info */}
        <div className="relative h-full flex flex-col justify-end p-6 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 flex-shrink-0">
              {artist.avatar ? (
                <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Music className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {artist.verified && (
                  <CheckCircle className="w-6 h-6 text-blue-500" fill="currentColor" />
                )}
                <span className="text-sm font-semibold text-white/80">ARTIST</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white">
                {artist.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{artist.followerCount?.toLocaleString()} followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  <span>{artist.totalSongs} songs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4" />
                  <span>{artist.totalAlbums} albums</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 md:px-12 py-6 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="btn-primary flex items-center gap-2 px-8 py-3 rounded-full disabled:opacity-50"
          >
            <Play className="w-5 h-5" fill="currentColor" />
            <span className="font-semibold">Play</span>
          </button>

          <button
            onClick={handleFollow}
            className={`btn-secondary flex items-center gap-2 px-6 py-3 rounded-full ${
              isFollowing ? 'bg-purple-500/20 text-purple-400' : ''
            }`}
          >
            <Heart className={`w-5 h-5 ${isFollowing ? 'fill-current' : ''}`} />
            <span className="font-semibold">{isFollowing ? 'Following' : 'Follow'}</span>
          </button>

          <button
            onClick={handleShare}
            className="btn-secondary p-3 rounded-full"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button className="btn-secondary p-3 rounded-full" title="More options">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 md:px-12 mb-6">
        <div className="flex gap-6 border-b border-white/10">
          {['overview', 'songs', 'albums', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Popular Songs */}
            {songs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Popular</h2>
                <div className="space-y-2">
                  {songs.slice(0, 5).map((song, index) => (
                    <div
                      key={song._id}
                      onClick={() => playSong(song)}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer group"
                    >
                      <span className="text-white/60 w-6 text-center">{index + 1}</span>
                      <img
                        src={song.image}
                        alt={song.name}
                        className="w-12 h-12 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{song.name}</p>
                        <p className="text-sm text-white/60">{song.playCount?.toLocaleString()} plays</p>
                      </div>
                      <Play className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Albums */}
            {albums.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Albums</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {albums.slice(0, 5).map((album) => (
                    <div
                      key={album._id}
                      onClick={() => navigate(`/album/${album._id}`)}
                      className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className="relative mb-4">
                        <img
                          src={album.image}
                          alt={album.name}
                          className="w-full aspect-square object-cover rounded-md"
                        />
                        <button className="absolute bottom-2 right-2 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                          <Play className="w-5 h-5 text-white" fill="currentColor" />
                        </button>
                      </div>
                      <h3 className="font-semibold truncate mb-1">{album.name}</h3>
                      <p className="text-sm text-white/60">Album</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Artists */}
            {similarArtists.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Fans also like</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {similarArtists.map((similarArtist) => (
                    <div
                      key={similarArtist._id}
                      onClick={() => navigate(`/artist/${similarArtist._id}`)}
                      className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all cursor-pointer text-center"
                    >
                      <div className="w-full aspect-square rounded-full overflow-hidden mb-3">
                        {similarArtist.avatar ? (
                          <img
                            src={similarArtist.avatar}
                            alt={similarArtist.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Music className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold truncate mb-1">{similarArtist.name}</h3>
                      <p className="text-sm text-white/60">Artist</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'songs' && (
          <div className="space-y-2">
            {songs.map((song, index) => (
              <div
                key={song._id}
                onClick={() => playSong(song)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer group"
              >
                <span className="text-white/60 w-6 text-center">{index + 1}</span>
                <img src={song.image} alt={song.name} className="w-12 h-12 rounded" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{song.name}</p>
                  <p className="text-sm text-white/60">{song.playCount?.toLocaleString()} plays</p>
                </div>
                <span className="text-sm text-white/60">{song.duration}</span>
                <Play className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'albums' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {albums.map((album) => (
              <div
                key={album._id}
                onClick={() => navigate(`/album/${album._id}`)}
                className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="relative mb-4">
                  <img
                    src={album.image}
                    alt={album.name}
                    className="w-full aspect-square object-cover rounded-md"
                  />
                  <button className="absolute bottom-2 right-2 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                    <Play className="w-5 h-5 text-white" fill="currentColor" />
                  </button>
                </div>
                <h3 className="font-semibold truncate mb-1">{album.name}</h3>
                <p className="text-sm text-white/60">
                  {new Date(album.createdAt).getFullYear()}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl space-y-6">
            {artist.bio && (
              <div>
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-white/80 leading-relaxed">{artist.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {artist.followerCount > 0 && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm text-white/60 mb-1">Followers</p>
                  <p className="text-2xl font-bold">{artist.followerCount.toLocaleString()}</p>
                </div>
              )}
              {artist.monthlyListeners > 0 && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm text-white/60 mb-1">Monthly Listeners</p>
                  <p className="text-2xl font-bold">{artist.monthlyListeners.toLocaleString()}</p>
                </div>
              )}
              {artist.totalPlays > 0 && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm text-white/60 mb-1">Total Plays</p>
                  <p className="text-2xl font-bold">{artist.totalPlays.toLocaleString()}</p>
                </div>
              )}
            </div>

            {artist.genres && artist.genres.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {artist.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {artist.socialLinks && Object.values(artist.socialLinks).some(link => link) && (
              <div>
                <h3 className="text-xl font-bold mb-3">Social Links</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(artist.socialLinks).map(([platform, url]) =>
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="capitalize">{platform}</span>
                      </a>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistPage;
