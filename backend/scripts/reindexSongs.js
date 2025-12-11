
import "dotenv/config";
import connectDB from "../src/config/mongodb.js";
import { meili } from "../src/config/meili.js";
import songModel from "../src/models/songModel.js";
import albumModel from "../src/models/albumModel.js";
import User from "../src/models/user.model.js";

const run = async () => {
  await connectDB();

  console.log("\n🔄 Importing songs...");
  const songs = await songModel.find({});
  await meili.index("songs").addDocuments(
    songs.map(s => ({
      id: s._id.toString(),
      name: s.name,
      desc: s.desc,
      album: s.album,
      image: s.image
    }))
  );
  console.log(`✓ Imported ${songs.length} songs`);

  console.log("\n🔄 Importing albums...");
  const albums = await albumModel.find({});
  await meili.index("albums").addDocuments(
    albums.map(a => ({
      id: a._id.toString(),
      name: a.name,
      desc: a.desc,
      image: a.image
    }))
  );
  console.log(`✓ Imported ${albums.length} albums`);

  console.log("\n🔄 Importing users...");
  const users = await User.find({});
  await meili.index("users").addDocuments(
    users.map(u => ({
      id: u._id.toString(),
      email: u.email
    }))
  );
  console.log(`✓ Imported ${users.length} users`);

  console.log("\n🎉 Import complete. Meilisearch is fully synced.\n");
  process.exit();
};

run();
