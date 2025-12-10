import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ MongoDB Connected: Successfully`);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    setTimeout(connectDB, 3000);
  }
};

export default connectDB;
