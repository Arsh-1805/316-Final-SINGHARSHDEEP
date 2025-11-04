const Playlist = require("../models/playlist-model");
const User = require("../models/user-model");


async function getPlaylistPairs(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const playlists = await Playlist.find({ ownerEmail: user.email });

    const idNamePairs = playlists.map((pl) => ({
      _id: pl._id,
      name: pl.name,
      ownerEmail: pl.ownerEmail,
    }));

    return res.status(200).json({ success: true, idNamePairs });
  } catch (err) {
    console.error("getPlaylistPairs error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error getting playlist pairs" });
  }
}

/**
 * GET /api/playlist/:id
 */
async function getPlaylistById(req, res) {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }
    return res.status(200).json({ success: true, playlist });
  } catch (err) {
    console.error("getPlaylistById error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error getting playlist" });
  }
}

/**
 * POST /store/playlist
 * client/src/store/requests/index.js is sending:
 * body: { name, ownerEmail, songs: [] }
 * We will prefer the logged-in user over the ownerEmail from the body.
 */
async function createPlaylist(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const { name, songs = [] } = req.body;

    const playlist = new Playlist({
      name: name || "Untitled",
      ownerEmail: user.email,
      ownerUserName: `${user.firstName} ${user.lastName}`,
      songs,
    });

    await playlist.save();

    return res.status(201).json({ success: true, playlist });
  } catch (err) {
    console.error("createPlaylist error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error creating playlist" });
  }
}

/**
 * PUT /store/playlist/:id
 * client sends: body: { playlist: {...} }
 */
async function updatePlaylist(req, res) {
  try {
    const { id } = req.params;
    const { playlist: bodyPlaylist } = req.body;

    if (!bodyPlaylist) {
      return res
        .status(400)
        .json({ success: false, message: "playlist data missing" });
    }

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }

    playlist.name = bodyPlaylist.name;
    playlist.songs = bodyPlaylist.songs;

    await playlist.save();

    return res.status(200).json({ success: true, playlist });
  } catch (err) {
    console.error("updatePlaylist error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error updating playlist" });
  }
}

/**
 * DELETE /store/playlist/:id
 */
async function deletePlaylist(req, res) {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }

    await Playlist.deleteOne({ _id: id });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("deletePlaylist error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting playlist" });
  }
}

module.exports = {
  getPlaylistPairs,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
};
