import { meili } from "../config/meili.js"

export const createIndexes = async () => {
  try {
    await meili.createIndex("songs", { primaryKey: "id" })
    await meili.createIndex("albums", { primaryKey: "id" })
    await meili.createIndex("users", { primaryKey: "id" })
  } catch (err) {
    console.log("Index creation error:", err.message)
  }
}
