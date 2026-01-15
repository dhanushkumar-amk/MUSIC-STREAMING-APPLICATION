import prisma from "../config/database.js";
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from "bcrypt";
import fs from "fs";

/* ==================== PROFILE MANAGEMENT ==================== */

/* GET USER PROFILE */
export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch profile"
        });
    }
};

/* UPDATE PROFILE (NAME & BIO) */
export const updateProfile = async (req, res) => {
    try {
        const { name, bio } = req.body;

        // Validation
        if (name && name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name must be less than 100 characters"
            });
        }

        if (bio && bio.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Bio must be less than 500 characters"
            });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (bio !== undefined) updateData.bio = bio.trim();

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: updateData
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update profile"
        });
    }
};

/* UPLOAD AVATAR */
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided"
            });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file type. Only JPEG, PNG, and WebP are allowed"
            });
        }

        // Get current user to delete old avatar if exists
        const currentUser = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { avatar: true }
        });

        // Upload new avatar to Cloudinary from buffer (memory storage)
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "music-app/avatars",
                    width: 500,
                    height: 500,
                    crop: "fill",
                    gravity: "face",
                    quality: "auto",
                    fetch_format: "auto"
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        const imageUpload = await uploadPromise;

        // Delete old avatar from Cloudinary if exists
        if (currentUser?.avatar) {
            try {
                const publicId = currentUser.avatar.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.error("Error deleting old avatar:", deleteError);
            }
        }

        // Update user with new avatar
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: { avatar: imageUpload.secure_url }
        });

        res.json({
            success: true,
            avatar: user.avatar,
            message: "Avatar updated successfully"
        });

    } catch (error) {
        console.error("Upload avatar error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload avatar"
        });
    }
};

/* DELETE AVATAR */
export const deleteAvatar = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { avatar: true }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete from Cloudinary if exists
        if (user.avatar) {
            try {
                const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.error("Error deleting avatar from Cloudinary:", deleteError);
            }
        }

        // Update user
        await prisma.user.update({
            where: { id: req.userId },
            data: { avatar: null }
        });

        res.json({
            success: true,
            message: "Avatar deleted successfully"
        });

    } catch (error) {
        console.error("Delete avatar error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete avatar"
        });
    }
};

/* ==================== PASSWORD MANAGEMENT ==================== */

/* CHANGE PASSWORD */
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Validation
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both current and new password"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: req.userId },
            data: { password: hashedPassword }
        });

        res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to change password"
        });
    }
};

/* ==================== ACCOUNT MANAGEMENT ==================== */

/* GET ACCOUNT STATS */
export const getAccountStats = async (req, res) => {
    try {
        const userId = req.userId;

        // Get stats in parallel using Prisma
        const [playlistCount, library, recentlyPlayedCount] = await Promise.all([
            prisma.playlist.count({ where: { userId } }),
            prisma.library.findUnique({
                where: { userId },
                select: {
                    likedSongIds: true,
                    likedAlbumIds: true
                }
            }),
            prisma.recentlyPlayed.count({ where: { userId } })
        ]);

        res.json({
            success: true,
            stats: {
                playlists: playlistCount,
                likedSongs: library?.likedSongIds.length || 0,
                likedAlbums: library?.likedAlbumIds.length || 0,
                recentlyPlayed: recentlyPlayedCount,
                totalListeningTime: 0 // Can be calculated from RecentlyPlayed if needed
            }
        });

    } catch (error) {
        console.error("Get account stats error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch account stats"
        });
    }
};

/* DELETE ACCOUNT */
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Please provide your password to confirm account deletion"
            });
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
        }

        // Delete avatar from Cloudinary if exists
        if (user.avatar) {
            try {
                const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.error("Error deleting avatar:", deleteError);
            }
        }

        // Delete user (cascade will delete related records)
        await prisma.user.delete({
            where: { id: req.userId }
        });

        res.json({
            success: true,
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete account"
        });
    }
};

/* ==================== ADMIN FUNCTIONS ==================== */

/* GET ALL USERS (ADMIN) */
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            users,
            count: users.length
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch users"
        });
    }
};

/* DELETE USER (ADMIN) */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: { avatar: true }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete avatar from Cloudinary if exists
        if (user.avatar) {
            try {
                const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.error("Error deleting avatar:", deleteError);
            }
        }

        await prisma.user.delete({ where: { id } });

        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete user"
        });
    }
};
