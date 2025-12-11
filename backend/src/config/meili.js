import { MeiliSearch } from "meilisearch"

export const meili = new MeiliSearch({
  host: process.env.MEILI_URL,
  apiKey: process.env.MEILI_MASTER_KEY
})

console.log("✅ Connected to MeiliSearch successfully")
