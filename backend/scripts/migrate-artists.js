import mongoose from "mongoose";
import "dotenv/config";
import Artist from "../src/models/artist.model.js";
import Song from "../src/models/songModel.js";
import Album from "../src/models/albumModel.js";

/*
 * MIGRATION SCRIPT: Convert Artist Strings to Artist Documents
 *
 * This script will:
 * 1. Find all unique artist names from songs
 * 2. Create Artist documents for each unique artist
 * 3. Update all songs to reference the new Artist ObjectIds
 * 4. Update all albums to reference the new Artist ObjectIds
 */

const migrateArtists = async () => {
  try {
    console.log("🚀 Starting Artist Migration...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // STEP 1: Get all unique artist names from songs
    console.log("📊 Step 1: Finding unique artists from songs...");
    const uniqueArtists = await Song.distinct("artist");
    console.log(`   Found ${uniqueArtists.length} unique artists\n`);

    // STEP 2: Create Artist documents
    console.log("👤 Step 2: Creating Artist documents...");
    const artistMap = new Map(); // Map artist name to ObjectId
    let created = 0;
    let skipped = 0;

    for (const artistName of uniqueArtists) {
      // Skip if artist is already an ObjectId (already migrated)
      if (mongoose.Types.ObjectId.isValid(artistName) && String(artistName).length === 24) {
        console.log(`   ⏭️  Skipping ObjectId: ${artistName}`);
        skipped++;
        continue;
      }

      // Skip empty or invalid names
      if (!artistName || typeof artistName !== 'string' || artistName.trim() === '') {
        console.log(`   ⚠️  Skipping invalid artist name: ${artistName}`);
        skipped++;
        continue;
      }

      const cleanName = artistName.trim();

      // Check if artist already exists
      let artist = await Artist.findOne({ name: cleanName });

      if (!artist) {
        // Create new artist
        artist = new Artist({
          name: cleanName,
          bio: `${cleanName} is a talented artist.`,
          verified: false,
          featured: false
        });
        await artist.save();
        created++;
        console.log(`   ✅ Created: ${cleanName} (${artist._id})`);
      } else {
        console.log(`   ℹ️  Already exists: ${cleanName} (${artist._id})`);
      }

      artistMap.set(cleanName, artist._id);
    }

    console.log(`\n   📈 Created: ${created} new artists`);
    console.log(`   📋 Skipped: ${skipped} entries\n`);

    // STEP 3: Update all songs with artist ObjectIds
    console.log("🎵 Step 3: Updating songs with Artist ObjectIds...");
    const songs = await Song.find({});
    let songsUpdated = 0;
    let songsFailed = 0;

    for (const song of songs) {
      try {
        // Skip if already using ObjectId
        if (mongoose.Types.ObjectId.isValid(song.artist) && String(song.artist).length === 24) {
          continue;
        }

        const artistName = typeof song.artist === 'string' ? song.artist.trim() : String(song.artist);
        const artistId = artistMap.get(artistName);

        if (artistId) {
          song.artist = artistId;
          await song.save();
          songsUpdated++;

          if (songsUpdated % 10 === 0) {
            console.log(`   📝 Updated ${songsUpdated} songs...`);
          }
        } else {
          console.log(`   ⚠️  No artist found for song: ${song.name} (artist: ${artistName})`);
          songsFailed++;
        }
      } catch (error) {
        console.error(`   ❌ Error updating song ${song.name}:`, error.message);
        songsFailed++;
      }
    }

    console.log(`\n   ✅ Updated: ${songsUpdated} songs`);
    console.log(`   ❌ Failed: ${songsFailed} songs\n`);

    // STEP 4: Update all albums with artist ObjectIds (if they have artist field)
    console.log("💿 Step 4: Updating albums with Artist ObjectIds...");
    const albums = await Album.find({});
    let albumsUpdated = 0;
    let albumsSkipped = 0;

    for (const album of albums) {
      try {
        // If album doesn't have artist field, try to infer from songs
        if (!album.artist) {
          // Find a song from this album
          const albumSong = await Song.findOne({ album: album.name }).populate('artist');

          if (albumSong && albumSong.artist) {
            album.artist = albumSong.artist._id || albumSong.artist;
            await album.save();
            albumsUpdated++;
            console.log(`   ✅ Inferred artist for album: ${album.name}`);
          } else {
            albumsSkipped++;
          }
        } else if (typeof album.artist === 'string') {
          // Album has string artist, convert to ObjectId
          const artistName = album.artist.trim();
          const artistId = artistMap.get(artistName);

          if (artistId) {
            album.artist = artistId;
            await album.save();
            albumsUpdated++;
          } else {
            console.log(`   ⚠️  No artist found for album: ${album.name} (artist: ${artistName})`);
            albumsSkipped++;
          }
        }
      } catch (error) {
        console.error(`   ❌ Error updating album ${album.name}:`, error.message);
        albumsSkipped++;
      }
    }

    console.log(`\n   ✅ Updated: ${albumsUpdated} albums`);
    console.log(`   ⏭️  Skipped: ${albumsSkipped} albums\n`);

    // STEP 5: Update artist stats
    console.log("📊 Step 5: Updating artist statistics...");
    const allArtists = await Artist.find({});

    for (const artist of allArtists) {
      await artist.updateStats();
    }

    console.log(`   ✅ Updated stats for ${allArtists.length} artists\n`);

    // STEP 6: Summary
    console.log("=" .repeat(60));
    console.log("✨ MIGRATION COMPLETED SUCCESSFULLY!");
    console.log("=" .repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   • Artists Created: ${created}`);
    console.log(`   • Songs Updated: ${songsUpdated}`);
    console.log(`   • Albums Updated: ${albumsUpdated}`);
    console.log(`   • Total Artists: ${allArtists.length}`);
    console.log("=" .repeat(60));

  } catch (error) {
    console.error("\n❌ MIGRATION FAILED:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run migration
migrateArtists();
