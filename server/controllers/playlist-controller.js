const Playlist = require('../models/playlist-model');
const User = require('../models/user-model');
const { verifyToken } = require('../auth');

async function createPlaylist(req, res) {
    try {
        const token = req.cookies.token;
        const payload = verifyToken(token);

        if (!payload)
            return res.status(401).json({ success: false, error: "Not logged in" });

        const user = await User.findById(payload.id);
        if (!user)
            return res.status(404).json({ success: false, error: "User not found" });

        const count = await Playlist.countDocuments({
            owner: user._id,
            name: /Untitled/i
        });

        const name = `Untitled${count + 1}`;

        const playlist = new Playlist({
            name,
            owner: user._id,
            ownerEmail: user.email,
            ownerName: user.userName || user.email,
            songs: []
        });

        await playlist.save();

        return res.status(201).json({
            success: true,
            id: playlist._id,
            name: playlist.name
        });
    }
    catch (err) {
        console.error("createPlaylist error:", err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

async function getPlaylistById(req, res) {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist)
            return res.status(404).json({ success: false, error: "Playlist not found" });

        return res.status(200).json({
            success: true,
            playlist
        });
    }
    catch (err) {
        console.error("getPlaylistById error:", err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

async function getUserPlaylists(req, res) {
    try {
        const token = req.cookies.token;
        const payload = verifyToken(token);

        if (!payload)
            return res.status(200).json({ success: true, playlists: [] });

        const playlists = await Playlist.find({ owner: payload.id });

        return res.status(200).json({
            success: true,
            playlists
        });
    }
    catch (err) {
        console.error("getUserPlaylists error:", err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

module.exports = {
    createPlaylist,
    getPlaylistById,
    getUserPlaylists
};
