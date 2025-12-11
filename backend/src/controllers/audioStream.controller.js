import axios from "axios";
import songModel from "../models/songModel.js";

export const streamAudio = async (req, res) => {
  try {
    const { songId } = req.params;

    const song = await songModel.findById(songId);
    if (!song) return res.status(404).send("Song not found");

    const audioUrl = song.file;

    const range = req.headers.range;
    if (!range) return res.status(416).send("Range header required");

    // Get file size from R2
    const head = await axios.head(audioUrl);
    const fileSize = Number(head.headers["content-length"]);

    const chunkSize = 1024 * 1024; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, fileSize - 1);
    const contentLength = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "audio/mpeg"
    });

    const audioStream = await axios({
      url: audioUrl,
      method: "GET",
      responseType: "stream",
      headers: {
        Range: `bytes=${start}-${end}`
      }
    });

    audioStream.data.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("Streaming error");
  }
};
