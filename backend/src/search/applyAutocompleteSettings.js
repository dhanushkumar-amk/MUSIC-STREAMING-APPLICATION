import { meili } from "../config/meili.js";

export const applyAutocompleteSettings = async () => {
  try {
    // SONGS
    await meili.index("songs").updateSettings({
      searchableAttributes: ["name", "desc"],
      displayedAttributes: ["name", "desc", "image"],
      stopWords: [],
      typoTolerance: { enabled: true },
    });

    // ALBUMS
    await meili.index("albums").updateSettings({
      searchableAttributes: ["name", "desc"],
      displayedAttributes: ["name", "desc", "image"],
    });

    // USERS
    await meili.index("users").updateSettings({
      searchableAttributes: ["email"],
      displayedAttributes: ["email"],
    });

    console.log("Autocomplete settings applied");
  } catch (err) {
    console.log("Autocomplete settings error:", err.message);
  }
};
