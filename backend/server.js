import express from "express"
import cors from "cors"
import "dotenv/config"

import connectCloudinary from "./src/config/cloudinary.js"
import connectDB from "./src/config/mongodb.js"
import redis from "./src/config/redis.js"

import songRouter from "./src/routes/songRoute.js"
import albumRouter from "./src/routes/albumRoute.js"

import authRouter from "./src/routes/auth.route.js"

// app config
const app = express()
const port = process.env.PORT || 4000

// database config
connectCloudinary()
connectDB()

redis
  .ping()
  .then(() => console.log("✅ Redis connected successfully"))
  .catch(err => {
    console.error("❌ Redis connection failed", err.message)
  })

// middlewares
app.use(express.json())
app.use(cors())

// Initializing Routers
app.use("/api/song", songRouter)
app.use("/api/album", albumRouter)
app.use("/api/auth", authRouter)

app.get("/", (req, res) => res.send("API Working"))

app.listen(port, () => console.log(`✅ Server started on ${port}`))
