/**
 * Example: User Controller with Prisma
 *
 * This is an example showing how to convert your existing Mongoose controllers to Prisma.
 * Use this as a reference when updating your actual controllers.
 */

import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

// ==================== GET USER PROFILE ====================
export const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        // Exclude sensitive fields: password, refreshToken, otp, otpExpiry
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== UPDATE USER PROFILE ====================
export const updateUserProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        bio
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
      }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== UPDATE AVATAR ====================
export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== GET USER STATS ====================
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Parallel queries for better performance
    const [playlistCount, library, recentlyPlayedCount] = await Promise.all([
      prisma.playlist.count({
        where: { userId }
      }),
      prisma.library.findUnique({
        where: { userId },
        select: {
          likedSongIds: true,
          likedAlbumIds: true,
        }
      }),
      prisma.recentlyPlayed.count({
        where: { userId }
      })
    ]);

    res.json({
      success: true,
      stats: {
        playlists: playlistCount,
        likedSongs: library?.likedSongIds.length || 0,
        likedAlbums: library?.likedAlbumIds.length || 0,
        recentlyPlayed: recentlyPlayedCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== DELETE ACCOUNT ====================
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== GET USER BY EMAIL ====================
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== SEARCH USERS ====================
export const searchUsers = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
      },
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== PRISMA CHEAT SHEET ====================

/*
COMMON PRISMA OPERATIONS:

1. FIND ONE (by unique field)
   const user = await prisma.user.findUnique({
     where: { id: userId }
   });

2. FIND MANY (with filters)
   const users = await prisma.user.findMany({
     where: { isEmailVerified: true },
     orderBy: { createdAt: 'desc' },
     take: 10,
     skip: 0
   });

3. CREATE
   const user = await prisma.user.create({
     data: {
       email: 'test@example.com',
       password: 'hashedpassword',
       name: 'Test User'
     }
   });

4. UPDATE
   const user = await prisma.user.update({
     where: { id: userId },
     data: { name: 'New Name' }
   });

5. DELETE
   await prisma.user.delete({
     where: { id: userId }
   });

6. UPSERT (update or create)
   const user = await prisma.user.upsert({
     where: { email: 'test@example.com' },
     update: { name: 'Updated Name' },
     create: {
       email: 'test@example.com',
       password: 'hashedpassword',
       name: 'New User'
     }
   });

7. COUNT
   const count = await prisma.user.count({
     where: { isEmailVerified: true }
   });

8. AGGREGATE
   const result = await prisma.recentlyPlayed.aggregate({
     _sum: { playDuration: true },
     _avg: { playDuration: true },
     where: { userId: userId }
   });

9. GROUP BY
   const result = await prisma.recentlyPlayed.groupBy({
     by: ['songId'],
     _count: { songId: true },
     orderBy: { _count: { songId: 'desc' } }
   });

10. TRANSACTIONS
    const result = await prisma.$transaction([
      prisma.user.create({ data: userData }),
      prisma.library.create({ data: libraryData })
    ]);

11. RAW QUERIES (when needed)
    const result = await prisma.$queryRaw`
      SELECT * FROM users WHERE email = ${email}
    `;

12. RELATIONS (include related data)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        playlists: true,
        library: true,
        settings: true
      }
    });

13. SELECT SPECIFIC FIELDS
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

14. NESTED WRITES
    const playlist = await prisma.playlist.create({
      data: {
        name: 'My Playlist',
        user: {
          connect: { id: userId }
        },
        collaborators: {
          connect: [
            { id: collaboratorId1 },
            { id: collaboratorId2 }
          ]
        }
      }
    });

15. ARRAY OPERATIONS
    // Add to array
    await prisma.library.update({
      where: { userId },
      data: {
        likedSongIds: {
          push: songId
        }
      }
    });

    // Remove from array (use set with filtered array)
    const library = await prisma.library.findUnique({ where: { userId } });
    await prisma.library.update({
      where: { userId },
      data: {
        likedSongIds: library.likedSongIds.filter(id => id !== songId)
      }
    });
*/
