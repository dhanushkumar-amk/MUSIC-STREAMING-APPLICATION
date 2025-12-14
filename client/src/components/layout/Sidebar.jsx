import { Link, useLocation } from "react-router-dom";
import { Home, Search, Library, Plus, Heart, Disc, ListMusic, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { playlistService } from "@/services/music";

const sidebarItems = [
  { icon: Home, label: "Discover", href: "/home" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Disc, label: "Albums", href: "/albums" },
  { icon: ListMusic, label: "Playlists", href: "/playlists" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const data = await playlistService.list();
      if (data.success) {
        setPlaylists(data.playlists.slice(0, 5));
      }
    } catch (error) {
      // Silently handle auth errors - user will be redirected by RequireAuth
      if (error.response?.status !== 401) {
        console.error("Failed to fetch playlists:", error);
      }
    }
  };

  return (
    <div className="hidden md:flex w-20 lg:w-64 h-full flex-col gap-3 p-3">
      {/* Brand & Nav */}
      <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-5">
        <Link to="/home" className="flex items-center gap-3 px-1 hover:opacity-70 transition-opacity">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden lg:block">SoundWave</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium",
                location.pathname === item.href
                    ? "bg-emerald-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden lg:block text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Library Section */}
      <div className="flex-1 bg-gray-50 rounded-2xl p-5 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:block">Library</span>
            <Link to="/playlists">
              <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                  <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
        </div>

        <div className="grid gap-2">
            <Link to="/collection/tracks" className="flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded-xl transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white">
                    <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="hidden lg:block overflow-hidden">
                    <p className="font-semibold truncate text-sm text-gray-900">Liked Songs</p>
                    <p className="text-xs text-gray-500 truncate">Playlist</p>
                </div>
            </Link>
        </div>

        <Separator className="bg-gray-200" />

        <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-1">
                {playlists.map((playlist) => (
                    <Link
                      key={playlist._id}
                      to={`/playlist/${playlist._id}`}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-100 cursor-pointer group transition-colors"
                    >
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                             {playlist.banner ? (
                               <img src={playlist.banner} alt={playlist.name} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
                             )}
                        </div>
                        <div className="hidden lg:block min-w-0">
                             <p className="text-sm font-medium truncate text-gray-900">{playlist.name}</p>
                             <p className="text-xs text-gray-500">Playlist • {playlist.songs?.length || 0} songs</p>
                        </div>
                    </Link>
                ))}
                {playlists.length === 0 && (
                  <div className="text-center py-4 text-xs text-gray-500 hidden lg:block">
                    No playlists yet
                  </div>
                )}
            </div>
        </ScrollArea>
      </div>
    </div>
  );
}
