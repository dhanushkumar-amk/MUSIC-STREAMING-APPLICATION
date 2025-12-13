import { useEffect, useState } from "react";
import { albumService } from "../services/music";
import { usePlayer } from "../context/PlayerContext";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await albumService.list();
        if (data.success) {
          setAlbums(data.albums);
        }
      } catch (error) {
        console.error("Failed to fetch albums:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Albums</h1>
        <p className="text-muted-foreground">Explore our collection of albums</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {albums.map((album) => (
          <div
            key={album._id}
            onClick={() => navigate(`/album/${album._id}`)}
            className="group cursor-pointer"
          >
            <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg aspect-square">
              <img
                src={album.image}
                alt={album.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundColor: album.bgColour }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button className="absolute bottom-4 right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110">
                <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
              </button>
            </div>
            <h3 className="font-bold truncate text-base mb-1">{album.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{album.desc}</p>
          </div>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No albums available yet</p>
        </div>
      )}
    </div>
  );
}
