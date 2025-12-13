import { useEffect, useState } from "react";
import { userService } from "../services/music";
import { User, Mail, Calendar, Music, Heart, Clock, Edit2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({ email: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      if (data.success) {
        setUser(data.user);
        setEditData({ email: data.user.email });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const data = await userService.updateProfile(editData);
      if (data.success) {
        setUser(data.user);
        setIsEditOpen(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const data = await userService.uploadAvatar(file);
      if (data.success) {
        setUser({ ...user, avatar: data.avatar });
        toast.success("Avatar updated successfully");
      }
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.email} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-primary-foreground" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{user.email.split('@')[0]}</h1>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Playlists</p>
            </div>
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/10 rounded-xl">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Liked Songs</p>
            </div>
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0h</p>
              <p className="text-sm text-muted-foreground">Listening Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No recent activity</p>
          <p className="text-sm mt-2">Start listening to see your activity here</p>
        </div>
      </div>
    </div>
  );
}
