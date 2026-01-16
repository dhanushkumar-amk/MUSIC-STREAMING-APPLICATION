import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },
    bio: {
      type: String,
      default: null,
      maxlength: 2000
    },
    avatar: {
      type: String,
      default: null
    },
    coverImage: {
      type: String,
      default: null
    },
    verified: {
      type: Boolean,
      default: false
    },
    genres: [{
      type: String,
      trim: true
    }],
    socialLinks: {
      website: { type: String, default: null },
      instagram: { type: String, default: null },
      twitter: { type: String, default: null },
      facebook: { type: String, default: null },
      youtube: { type: String, default: null },
      spotify: { type: String, default: null }
    },
    monthlyListeners: {
      type: Number,
      default: 0
    },
    totalPlays: {
      type: Number,
      default: 0
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    followerCount: {
      type: Number,
      default: 0
    },
    // Stats
    totalSongs: {
      type: Number,
      default: 0
    },
    totalAlbums: {
      type: Number,
      default: 0
    },
    // Featured artist badge
    featured: {
      type: Boolean,
      default: false
    },
    // Country/Region
    country: {
      type: String,
      default: null
    },
    // Active status
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* INDEXES FOR OPTIMIZATION */
artistSchema.index({ name: 1 });
artistSchema.index({ verified: 1 });
artistSchema.index({ featured: 1 });
artistSchema.index({ followerCount: -1 });
artistSchema.index({ monthlyListeners: -1 });
artistSchema.index({ genres: 1 });
artistSchema.index({ createdAt: -1 });

/* TEXT INDEX FOR SEARCH */
artistSchema.index({ name: "text", bio: "text" });

/* VIRTUAL POPULATE - Get all songs by this artist */
artistSchema.virtual("songs", {
  ref: "song",
  localField: "_id",
  foreignField: "artist"
});

/* VIRTUAL POPULATE - Get all albums by this artist */
artistSchema.virtual("albums", {
  ref: "album",
  localField: "_id",
  foreignField: "artist"
});

/* METHODS */
artistSchema.methods.incrementFollowers = function() {
  this.followerCount += 1;
  return this.save();
};

artistSchema.methods.decrementFollowers = function() {
  this.followerCount = Math.max(0, this.followerCount - 1);
  return this.save();
};

artistSchema.methods.updateStats = async function() {
  const Song = mongoose.model("song");
  const Album = mongoose.model("album");

  const [songCount, albumCount, totalPlays] = await Promise.all([
    Song.countDocuments({ artist: this._id }),
    Album.countDocuments({ artist: this._id }),
    Song.aggregate([
      { $match: { artist: this._id } },
      { $group: { _id: null, total: { $sum: "$playCount" } } }
    ])
  ]);

  this.totalSongs = songCount;
  this.totalAlbums = albumCount;
  this.totalPlays = totalPlays[0]?.total || 0;

  return this.save();
};

export default mongoose.model("Artist", artistSchema);
