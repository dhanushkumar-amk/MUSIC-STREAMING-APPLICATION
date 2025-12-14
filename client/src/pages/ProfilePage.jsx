import { useEffect, useState } from "react";
import { userService } from "../services/music";
import { User, Mail, Calendar, Music, Heart, Clock, Edit2, Camera, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({ name: "", bio: "" });
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    playlists: 0,
    likedSongs: 0,
    likedAlbums: 0,
    recentlyPlayed: 0,
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      if (data.success) {
        setUser(data.user);
        setEditData({
          name: data.user.name || "",
          bio: data.user.bio || ""
        });
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await userService.getAccountStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      // Silently handle 401 errors (not logged in)
      if (error.response?.status !== 401) {
        console.error("Failed to fetch stats:", error);
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setUpdating(true);
    try {
      const data = await userService.updateProfile(editData);
      if (data.success) {
        setUser(data.user);
        setIsEditOpen(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB)
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
      console.error("Avatar upload error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload avatar";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Are you sure you want to delete your avatar?")) return;

    try {
      const data = await userService.deleteAvatar();
      if (data.success) {
        setUser({ ...user, avatar: null });
        toast.success("Avatar deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete avatar:", error);
      toast.error("Failed to delete avatar");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Failed to load profile</p>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.email.split('@')[0];

  return (
    <div className="min-h-full bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-emerald-500 rounded-2xl p-8 mb-6 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-lg">
                {user.avatar ? (
                  <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-emerald-500" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {user.avatar && (
                <button
                  onClick={handleDeleteAvatar}
                  className="absolute -bottom-2 -right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transition-colors"
                  title="Delete avatar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
              {user.bio && (
                <p className="text-white/90 mb-3">{user.bio}</p>
              )}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm">
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
                <Button className="bg-white text-emerald-600 hover:bg-gray-100 gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your profile information
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="bg-white border-gray-300"
                      disabled={updating}
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself"
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="bg-white border-gray-300 resize-none"
                      disabled={updating}
                      maxLength={500}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {editData.bio.length}/500 characters
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 gap-2"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Music className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-2xl font-bold text-gray-900">{stats.playlists}</p>
            <p className="text-sm text-gray-500">Playlists</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Heart className="w-8 h-8 mx-auto mb-2 text-pink-500" />
            <p className="text-2xl font-bold text-gray-900">{stats.likedSongs}</p>
            <p className="text-sm text-gray-500">Liked Songs</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Music className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold text-gray-900">{stats.likedAlbums}</p>
            <p className="text-sm text-gray-500">Liked Albums</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-gray-900">{stats.recentlyPlayed}</p>
            <p className="text-sm text-gray-500">Recently Played</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Recent Activity</h2>
          <div className="text-center py-12 text-gray-500">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-2">Start listening to see your activity here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
