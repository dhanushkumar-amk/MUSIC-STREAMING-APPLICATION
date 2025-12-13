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
        setPlaylists(data.playlists.slice(0, 5)); // Show first 5
      }
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    }
  };

  return (
    <div className="hidden md:flex w-20 lg:w-72 h-full flex-col gap-4">
      {/* Brand & Nav */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 flex flex-col gap-6 shadow-sm">
        <Link to="/home" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary-foreground">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
            </div>
            <span className="font-bold text-xl tracking-tight hidden lg:block">SoundWave</span>
        </Link>

        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium group",
                location.pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", location.pathname === item.href && "fill-current")} />
              <span className="hidden lg:block">{item.label}</span>
              {location.pathname === item.href && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden lg:block" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Library Section */}
      <div className="flex-1 bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden lg:block">Your Library</span>
            <Link to="/playlists">
              <button className="p-1.5 hover:bg-muted rounded-full transition-colors">
                  <Plus className="w-5 h-5 text-muted-foreground" />
              </button>
            </Link>
        </div>

        <div className="grid gap-2">
            <Link to="/collection/tracks" className="flex items-center gap-4 px-2 py-2 hover:bg-muted/50 rounded-xl transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="hidden lg:block overflow-hidden">
                    <p className="font-semibold truncate text-sm">Liked Songs</p>
                    <p className="text-xs text-muted-foreground truncate">Playlist</p>
                </div>
            </Link>
        </div>

        <Separator className="bg-border/50" />

        <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-1">
                {playlists.map((playlist) => (
                    <Link
                      key={playlist._id}
                      to={`/playlist/${playlist._id}`}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 cursor-pointer group transition-colors"
                    >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted-foreground/20 transition-colors overflow-hidden">
                             {playlist.banner ? (
                               <img src={playlist.banner} alt={playlist.name} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                             )}
                        </div>
                        <div className="hidden lg:block min-w-0">
                             <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{playlist.name}</p>
                             <p className="text-xs text-muted-foreground">Playlist • {playlist.songs?.length || 0} songs</p>
                        </div>
                    </Link>
                ))}
                {playlists.length === 0 && (
                  <div className="text-center py-4 text-xs text-muted-foreground hidden lg:block">
                    No playlists yet
                  </div>
                )}
            </div>
        </ScrollArea>
      </div>
    </div>
  );
}
