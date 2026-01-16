import Artist from "../models/artist.model.js";
import Song from "../models/songModel.js";
import Album from "../models/albumModel.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

/* ==================== ARTIST CRUD OPERATIONS ==================== */

/* CREATE ARTIST */
export const createArtist = async (req, res) => {
  try {
    const { name, bio, genres, socialLinks, country } = req.body;

    // Check if artist already exists
    const existingArtist = await Artist.findOne({ name: name.trim() });
    if (existingArtist) {
      return res.status(400).json({
        success: false,
        message: "Artist with this name already exists"
      });
    }

    // Handle avatar upload if provided
    let avatarUrl = null;
    if (req.files && req.files.avatar) {
      const avatarUpload = await cloudinary.uploader.upload(req.files.avatar[0].path, {
        folder: "artists/avatars",
        resource_type: "image"
      });
      avatarUrl = avatarUpload.secure_url;
    }

    // Handle cover image upload if provided
    let coverImageUrl = null;
    if (req.files && req.files.coverImage) {
      const coverUpload = await cloudinary.uploader.upload(req.files.coverImage[0].path, {
        folder: "artists/covers",
        resource_type: "image"
      });
      coverImageUrl = coverUpload.secure_url;
    }

    const artist = new Artist({
      name: name.trim(),
      bio,
      avatar: avatarUrl,
      coverImage: coverImageUrl,
      genres: genres ? JSON.parse(genres) : [],
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
      country
    });

    await artist.save();

    res.status(201).json({
      success: true,
      message: "Artist created successfully",
      artist
    });
  } catch (error) {
    console.error("Create artist error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* GET ALL ARTISTS */
export const getAllArtists = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "-followerCount",
      genre,
      verified,
      featured,
      search
    } = req.query;

    const query = { isActive: true };

    // Filter by genre
    if (genre) {
      query.genres = genre;
    }

    // Filter by verified status
    if (verified !== undefined) {
      query.verified = verified === "true";
    }

    // Filter by featured status
    if (featured !== undefined) {
      query.featured = featured === "true";
    }

    // Search by name or bio
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [artists, total] = await Promise.all([
      Artist.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-followers"),
      Artist.countDocuments(query)
    ]);

    res.json({
      success: true,
      artists,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get artists error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* GET ARTIST BY ID */
export const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await Artist.findById(id).select("-followers");

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Get artist's songs and albums
    const [songs, albums] = await Promise.all([
      Song.find({ artist: id })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("name image duration playCount createdAt"),
      Album.find({ artist: id })
        .sort({ createdAt: -1 })
        .select("name image bgColour createdAt")
    ]);

    // Check if current user follows this artist
    let isFollowing = false;
    if (req.user) {
      isFollowing = artist.followers.includes(req.user.userId);
    }

    res.json({
      success: true,
      artist: {
        ...artist.toObject(),
        isFollowing
      },
      songs,
      albums
    });
  } catch (error) {
    console.error("Get artist error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* UPDATE ARTIST */
export const updateArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio, genres, socialLinks, country, verified, featured } = req.body;

    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Handle avatar upload if provided
    if (req.files && req.files.avatar) {
      const avatarUpload = await cloudinary.uploader.upload(req.files.avatar[0].path, {
        folder: "artists/avatars",
        resource_type: "image"
      });
      artist.avatar = avatarUpload.secure_url;
    }

    // Handle cover image upload if provided
    if (req.files && req.files.coverImage) {
      const coverUpload = await cloudinary.uploader.upload(req.files.coverImage[0].path, {
        folder: "artists/covers",
        resource_type: "image"
      });
      artist.coverImage = coverUpload.secure_url;
    }

    // Update fields
    if (name) artist.name = name.trim();
    if (bio !== undefined) artist.bio = bio;
    if (genres) artist.genres = JSON.parse(genres);
    if (socialLinks) artist.socialLinks = JSON.parse(socialLinks);
    if (country) artist.country = country;
    if (verified !== undefined) artist.verified = verified === "true";
    if (featured !== undefined) artist.featured = featured === "true";

    await artist.save();

    res.json({
      success: true,
      message: "Artist updated successfully",
      artist
    });
  } catch (error) {
    console.error("Update artist error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* DELETE ARTIST */
export const deleteArtist = async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Soft delete - just mark as inactive
    artist.isActive = false;
    await artist.save();

    res.json({
      success: true,
      message: "Artist deleted successfully"
    });
  } catch (error) {
    console.error("Delete artist error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ==================== FOLLOW/UNFOLLOW ==================== */

/* FOLLOW ARTIST */
export const followArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Check if already following
    if (artist.followers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Already following this artist"
      });
    }

    artist.followers.push(userId);
    await artist.incrementFollowers();

    res.json({
      success: true,
      message: "Artist followed successfully",
      followerCount: artist.followerCount
    });
  } catch (error) {
    console.error("Follow artist error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* UNFOLLOW ARTIST */
export const unfollowArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Check if not following
    if (!artist.followers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Not following this artist"
      });
    }

    artist.followers = artist.followers.filter(
      (followerId) => followerId.toString() !== userId
    );
    await artist.decrementFollowers();

    res.json({
      success: true,
      message: "Artist unfollowed successfully",
      followerCount: artist.followerCount
    });
  } catch (error) {
    console.error("Unfollow artist error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* GET USER'S FOLLOWED ARTISTS */
export const getFollowedArtists = async (req, res) => {
  try {
    const userId = req.user.userId;

    const artists = await Artist.find({
      followers: userId,
      isActive: true
    })
      .sort({ name: 1 })
      .select("-followers");

    res.json({
      success: true,
      artists
    });
  } catch (error) {
    console.error("Get followed artists error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ==================== ARTIST ANALYTICS ==================== */

/* GET TOP ARTISTS */
export const getTopArtists = async (req, res) => {
  try {
    const { limit = 10, metric = "followers" } = req.query;

    let sortField = "-followerCount";
    if (metric === "plays") sortField = "-totalPlays";
    if (metric === "listeners") sortField = "-monthlyListeners";

    const artists = await Artist.find({ isActive: true })
      .sort(sortField)
      .limit(parseInt(limit))
      .select("-followers");

    res.json({
      success: true,
      artists
    });
  } catch (error) {
    console.error("Get top artists error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* GET FEATURED ARTISTS */
export const getFeaturedArtists = async (req, res) => {
  try {
    const artists = await Artist.find({
      featured: true,
      isActive: true
    })
      .sort("-followerCount")
      .limit(20)
      .select("-followers");

    res.json({
      success: true,
      artists
    });
  } catch (error) {
    console.error("Get featured artists error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* GET ARTIST STATS (ADMIN) */
export const getArtistStats = async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Update stats before returning
    await artist.updateStats();

    // Get top songs
    const topSongs = await Song.find({ artist: id })
      .sort({ playCount: -1 })
      .limit(10)
      .select("name playCount uniqueListeners");

    // Get monthly listener trend (mock for now)
    const monthlyTrend = [
      { month: "Jan", listeners: Math.floor(Math.random() * 10000) },
      { month: "Feb", listeners: Math.floor(Math.random() * 10000) },
      { month: "Mar", listeners: Math.floor(Math.random() * 10000) },
      { month: "Apr", listeners: Math.floor(Math.random() * 10000) },
      { month: "May", listeners: Math.floor(Math.random() * 10000) },
      { month: "Jun", listeners: Math.floor(Math.random() * 10000) }
    ];

    res.json({
      success: true,
      stats: {
        totalSongs: artist.totalSongs,
        totalAlbums: artist.totalAlbums,
        totalPlays: artist.totalPlays,
        followerCount: artist.followerCount,
        monthlyListeners: artist.monthlyListeners,
        topSongs,
        monthlyTrend
      }
    });
  } catch (error) {
    console.error("Get artist stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* SEARCH ARTISTS */
export const searchArtists = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        artists: []
      });
    }

    const artists = await Artist.find({
      name: { $regex: q, $options: "i" },
      isActive: true
    })
      .sort({ followerCount: -1 })
      .limit(parseInt(limit))
      .select("name avatar verified followerCount");

    res.json({
      success: true,
      artists
    });
  } catch (error) {
    console.error("Search artists error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* GET ARTISTS BY GENRE */
export const getArtistsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const { limit = 20 } = req.query;

    const artists = await Artist.find({
      genres: genre,
      isActive: true
    })
      .sort("-followerCount")
      .limit(parseInt(limit))
      .select("-followers");

    res.json({
      success: true,
      genre,
      artists
    });
  } catch (error) {
    console.error("Get artists by genre error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* GET SIMILAR ARTISTS */
export const getSimilarArtists = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist not found"
      });
    }

    // Find artists with similar genres
    const similarArtists = await Artist.find({
      _id: { $ne: id },
      genres: { $in: artist.genres },
      isActive: true
    })
      .sort("-followerCount")
      .limit(parseInt(limit))
      .select("-followers");

    res.json({
      success: true,
      artists: similarArtists
    });
  } catch (error) {
    console.error("Get similar artists error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
