import redis from "../config/redis.js";
import songModel from "../models/songModel.js";

/* ----------------------------------------------------
   Helper — Get queue object from Redis
---------------------------------------------------- */
const getQueue = async userId => {
  const key = `queue:${userId}`;
  return await redis.get(key);
};

/* ----------------------------------------------------
   Helper — Save queue object in Redis
---------------------------------------------------- */
const saveQueue = async (userId, queueObj) => {
  const key = `queue:${userId}`;
  await redis.set(key, queueObj);
};

/* ----------------------------------------------------
   START A NEW QUEUE
   Body: { songIds: [], contextType, contextId }
---------------------------------------------------- */
export const startQueue = async (req, res) => {
  try {
    const { songIds, contextType = null, contextId = null } = req.body;
    const userId = req.userId;

    if (!songIds || songIds.length === 0)
      return res.status(400).json({ message: "No songs provided" });

    const queueObj = {
      queue: songIds,
      currentIndex: 0,
      shuffle: false,
      loopMode: "off",
      contextType,
      contextId
    };

    await saveQueue(userId, queueObj);

    res.json({ success: true, queue: queueObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start queue" });
  }
};

/* ----------------------------------------------------
   GET CURRENT QUEUE
---------------------------------------------------- */
export const getQueueState = async (req, res) => {
  try {
    const queueObj = await getQueue(req.userId);

    if (!queueObj)
      return res.status(404).json({ message: "No active queue" });

    res.json({ success: true, queue: queueObj });
  } catch {
    res.status(500).json({ message: "Failed to get queue" });
  }
};

/* ----------------------------------------------------
   NEXT SONG
---------------------------------------------------- */
export const nextSong = async (req, res) => {
  try {
    const userId = req.userId;
    let q = await getQueue(userId);

    if (!q) return res.status(404).json({ message: "No queue found" });

    const { currentIndex, queue, loopMode, shuffle } = q;

    // LOOP ONE (repeat same song)
    if (loopMode === "one") {
      const song = await songModel.findById(queue[currentIndex]);
      return res.json({ success: true, song });
    }

    // SHUFFLE MODE
    if (shuffle) {
      const next = queue[Math.floor(Math.random() * queue.length)];
      const song = await songModel.findById(next);
      return res.json({ success: true, song });
    }

    // NORMAL MODE
    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (loopMode === "all") {
        nextIndex = 0; // restart queue
      } else {
        return res.json({ success: false, message: "End of queue" });
      }
    }

    q.currentIndex = nextIndex;
    await saveQueue(userId, q);

    const song = await songModel.findById(queue[nextIndex]);
    res.json({ success: true, song });
  } catch {
    res.status(500).json({ message: "Failed to fetch next song" });
  }
};

/* ----------------------------------------------------
   PREVIOUS SONG
---------------------------------------------------- */
export const prevSong = async (req, res) => {
  try {
    const userId = req.userId;
    let q = await getQueue(userId);

    if (!q) return res.status(404).json({ message: "No queue found" });

    let prev = q.currentIndex - 1;

    if (prev < 0) prev = 0;

    q.currentIndex = prev;

    await saveQueue(userId, q);

    const song = await songModel.findById(q.queue[prev]);

    res.json({ success: true, song });
  } catch {
    res.status(500).json({ message: "Failed to fetch previous song" });
  }
};

/* ----------------------------------------------------
   SHUFFLE TOGGLE
---------------------------------------------------- */
export const toggleShuffle = async (req, res) => {
  try {
    const userId = req.userId;
    let q = await getQueue(userId);

    if (!q) return res.status(404).json({ message: "No active queue" });

    q.shuffle = !q.shuffle;

    await saveQueue(userId, q);

    res.json({ success: true, shuffle: q.shuffle });
  } catch {
    res.status(500).json({ message: "Error toggling shuffle" });
  }
};

/* ----------------------------------------------------
   UPDATE LOOP MODE
---------------------------------------------------- */
export const updateLoopMode = async (req, res) => {
  try {
    const { loopMode } = req.body;
    const userId = req.userId;

    if (!["off", "one", "all"].includes(loopMode))
      return res.status(400).json({ message: "Invalid loop mode" });

    let q = await getQueue(userId);
    if (!q) return res.status(404).json({ message: "No queue found" });

    q.loopMode = loopMode;
    await saveQueue(userId, q);

    res.json({ success: true, loopMode });
  } catch {
    res.status(500).json({ message: "Failed to update loop mode" });
  }
};

/* ----------------------------------------------------
   ADD TO QUEUE (END)
---------------------------------------------------- */
export const addToQueue = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.userId;

    let q = await getQueue(userId);
    if (!q) return res.status(404).json({ message: "No active queue" });

    q.queue.push(songId);

    await saveQueue(userId, q);

    res.json({ success: true, queue: q.queue });
  } catch {
    res.status(500).json({ message: "Failed to add song" });
  }
};

/* ----------------------------------------------------
   PLAY NEXT (INSERT AFTER CURRENT INDEX)
---------------------------------------------------- */
export const playNext = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.userId;

    let q = await getQueue(userId);
    if (!q) return res.status(404).json({ message: "No active queue" });

    q.queue.splice(q.currentIndex + 1, 0, songId);

    await saveQueue(userId, q);

    res.json({ success: true, queue: q.queue });
  } catch {
    res.status(500).json({ message: "Failed to queue next song" });
  }
};

/* ----------------------------------------------------
   REMOVE SONG FROM QUEUE
---------------------------------------------------- */
export const removeFromQueue = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.userId;

    let q = await getQueue(userId);
    if (!q) return res.status(404).json({ message: "No active queue" });

    q.queue = q.queue.filter(id => id !== songId);

    await saveQueue(userId, q);

    res.json({ success: true, queue: q.queue });
  } catch {
    res.status(500).json({ message: "Failed to remove song" });
  }
};

/* ----------------------------------------------------
   CLEAR QUEUE
---------------------------------------------------- */
export const clearQueue = async (req, res) => {
  try {
    const userId = req.userId;

    await redis.del(`queue:${userId}`);

    res.json({ success: true, message: "Queue cleared" });
  } catch {
    res.status(500).json({ message: "Failed to clear queue" });
  }
};
