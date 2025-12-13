import { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { Search as SearchIcon, Play, Music, Disc, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchService } from "../services/music";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { playSong } = usePlayer();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const data = await searchService.search(query);
          if (data.success) {
            setResults(data.results);
          }
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const categories = [
    { name: 'Pop', color: 'from-pink-500 to-rose-500' },
    { name: 'Rock', color: 'from-red-500 to-orange-500' },
    { name: 'Hip-Hop', color: 'from-purple-500 to-indigo-500' },
    { name: 'Indie', color: 'from-teal-500 to-cyan-500' },
    { name: 'Jazz', color: 'from-amber-500 to-yellow-500' },
    { name: 'Electronic', color: 'from-blue-500 to-violet-500' },
    { name: 'Classical', color: 'from-emerald-500 to-green-500' },
    { name: 'R&B', color: 'from-fuchsia-500 to-pink-500' },
  ];

  return (
    <div className="p-6">
      {/* Search Input */}
      <div className="relative mb-8 max-w-2xl mx-auto md:mx-0">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to play?"
          className="pl-12 py-6 text-lg rounded-full bg-card/50 backdrop-blur border-border/50 ring-0 focus-visible:ring-2 focus-visible:ring-primary shadow-lg"
        />
      </div>

      {loading && (
        <div className="text-center text-muted-foreground py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          Searching...
        </div>
      )}

      {results ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {/* Top Result */}
            {(results.songs?.length > 0 || results.albums?.length > 0) && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Top Result</h2>
                {results.songs?.[0] && (
                  <div
                    onClick={() => playSong(results.songs[0])}
                    className="bg-card/40 backdrop-blur p-6 rounded-2xl hover:bg-card/60 transition-all cursor-pointer group max-w-md"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={results.songs[0].image}
                        alt={results.songs[0].name}
                        className="w-24 h-24 rounded-xl object-cover shadow-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-3xl font-bold mb-1 truncate">{results.songs[0].name}</h3>
                        <p className="text-muted-foreground truncate">{results.songs[0].artist}</p>
                        <div className="mt-2 inline-flex items-center gap-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          <Music className="w-3 h-3" />
                          Song
                        </div>
                      </div>
                    </div>
                    <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl hover:scale-105">
                      <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Songs */}
            {results.songs?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Songs</h2>
                <div className="space-y-2">
                  {results.songs.slice(0, 5).map((song) => (
                    <div
                      key={song.id}
                      onClick={() => playSong(song)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-card/40 transition-colors cursor-pointer group"
                    >
                      <div className="relative">
                        <img src={song.image} alt={song.name} className="w-12 h-12 rounded-md object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                          <Play className="w-5 h-5 fill-white text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{song.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{song.desc || song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Albums */}
            {results.albums?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Albums</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.albums.slice(0, 4).map((album) => (
                    <div
                      key={album.id}
                      className="bg-card/30 p-4 rounded-xl hover:bg-card/50 transition-all cursor-pointer group"
                    >
                      <div className="relative mb-3">
                        <img
                          src={album.image}
                          alt={album.name}
                          className="w-full aspect-square rounded-lg object-cover shadow-md"
                        />
                        <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                          <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
                        </div>
                      </div>
                      <h3 className="font-semibold truncate">{album.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{album.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="songs">
            {results.songs?.length > 0 ? (
              <div className="space-y-2">
                {results.songs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-card/40 transition-colors cursor-pointer group"
                  >
                    <div className="relative">
                      <img src={song.image} alt={song.name} className="w-14 h-14 rounded-md object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <Play className="w-5 h-5 fill-white text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{song.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{song.desc || song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">No songs found</p>
            )}
          </TabsContent>

          <TabsContent value="albums">
            {results.albums?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {results.albums.map((album) => (
                  <div
                    key={album.id}
                    className="bg-card/30 p-4 rounded-xl hover:bg-card/50 transition-all cursor-pointer group"
                  >
                    <div className="relative mb-3">
                      <img
                        src={album.image}
                        alt={album.name}
                        className="w-full aspect-square rounded-lg object-cover shadow-md"
                      />
                      <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                        <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
                      </div>
                    </div>
                    <h3 className="font-semibold truncate">{album.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{album.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">No albums found</p>
            )}
          </TabsContent>

          <TabsContent value="users">
            {results.users?.length > 0 ? (
              <div className="space-y-2">
                {results.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-card/40 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{user.email}</h3>
                      <p className="text-sm text-muted-foreground">User</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">No users found</p>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-6">Browse All</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((genre, i) => (
              <div
                key={i}
                className={`aspect-video bg-gradient-to-br ${genre.color} rounded-2xl p-6 flex items-end justify-between font-bold text-xl hover:scale-[1.02] transition-transform cursor-pointer shadow-lg text-white relative overflow-hidden`}
              >
                <span className="relative z-10">{genre.name}</span>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
