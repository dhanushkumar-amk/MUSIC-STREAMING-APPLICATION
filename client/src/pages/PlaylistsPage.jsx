import { useEffect, useState } from "react";
import { playlistService } from "../services/music";
import { usePlayer } from "../context/PlayerContext";
import { Play, Plus, Music, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const data = await playlistService.list();
      if (data.success) {
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const data = await playlistService.create(newPlaylistName);
      if (data.success) {
        setPlaylists([...playlists, data.playlist]);
        setNewPlaylistName("");
        setIsDialogOpen(false);
        toast.success("Playlist created");
      }
    } catch (error) {
      toast.error("Failed to create playlist");
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await playlistService.delete(playlistId);
      setPlaylists(playlists.filter(p => p._id !== playlistId));
      toast.success("Playlist deleted");
    } catch (error) {
      toast.error("Failed to delete playlist");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Your Playlists</h1>
          <p className="text-muted-foreground">Create and manage your playlists</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <Input
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="My Awesome Playlist"
                autoFocus
              />
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="group cursor-pointer"
            >
              <div
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="relative mb-4 overflow-hidden rounded-2xl shadow-lg aspect-square bg-gradient-to-br from-muted to-muted/50"
              >
                {playlist.banner ? (
                  <img
                    src={playlist.banner}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button className="absolute bottom-4 right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110">
                  <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
                </button>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate text-base mb-1">{playlist.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {playlist.songs?.length || 0} songs
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-card rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/playlist/${playlist._id}`)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeletePlaylist(playlist._id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">No playlists yet</h3>
          <p className="text-muted-foreground mb-4">Create your first playlist to get started</p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Playlist
          </Button>
        </div>
      )}
    </div>
  );
}
