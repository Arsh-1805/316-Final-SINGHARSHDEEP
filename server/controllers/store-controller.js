const Playlist = require('../models/playlist-model');
const User = require('../models/user-model');
const auth = require('../auth');

async function createPlaylist(req, res) {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            console.log("createPlaylist: no valid token");
            return res.status(401).json({ success: false, errorMessage: 'UNAUTHORIZED' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, errorMessage: 'User not found' });
        }

        const body = (typeof req.body === 'object' && req.body !== null) ? req.body : {};

        const name =
            body.name ||
            `Untitled${Date.now()}`; 

        const songs = Array.isArray(body.songs) ? body.songs : [];

        
        const playlist = new Playlist({
            name,
            songs,
            owner: user._id,
            ownerEmail: user.email
        });

        await playlist.save();

        user.playlists.push(playlist._id);
        await user.save();

        return res.status(201).json({
            success: true,
            playlist
        });
    } catch (err) {
        console.warn('createPlaylist error:', err);
        return res.status(500).json({ success: false, errorMessage: 'Playlist Not Created!' });
    }
}

async function getPlaylistById(req, res) {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({ success: false, errorMessage: 'UNAUTHORIZED' });
        }

        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ success: false, errorMessage: 'Playlist not found!' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, errorMessage: 'User not found' });
        }

        const ownsByEmail = playlist.ownerEmail && playlist.ownerEmail === user.email;
        const ownsById = playlist.owner && playlist.owner.equals(user._id);
        const userHasPlaylist = Array.isArray(user.playlists) && user.playlists.some((pid) => pid.equals(playlist._id));

        if (!ownsByEmail && !ownsById && !userHasPlaylist) {
            return res.status(403).json({ success: false, errorMessage: 'authentication error' });
        }

        let needsSave = false;
        if (!playlist.ownerEmail) {
            playlist.ownerEmail = user.email;
            needsSave = true;
        }
        if (!playlist.owner) {
            playlist.owner = user._id;
            needsSave = true;
        }
        if (needsSave) {
            await playlist.save();
        }

        return res.status(200).json({ success: true, playlist });
    } catch (err) {
        console.warn('getPlaylistById error:', err);
        return res.status(500).json({ success: false, errorMessage: 'Playlist not found!' });
    }
}

async function getPlaylistPairs(req, res) {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({ success: false, errorMessage: 'UNAUTHORIZED' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, errorMessage: 'User not found' });
        }

        const playlists = await Playlist.find({})
            .sort({ updatedAt: -1 })
            .limit(200);

        const idNamePairs = [];
        for (const playlist of playlists) {
            let updated = false;
            if (!playlist.ownerEmail && playlist.owner) {
                const ownerUser = await User.findById(playlist.owner);
                if (ownerUser) {
                    playlist.ownerEmail = ownerUser.email;
                    updated = true;
                }
            }
            if (!playlist.owner && playlist.ownerEmail) {
                const ownerUser = await User.findOne({ email: playlist.ownerEmail });
                if (ownerUser) {
                    playlist.owner = ownerUser._id;
                    updated = true;
                }
            }
            if (updated) {
                await playlist.save();
            }
            idNamePairs.push({
                _id: playlist._id,
                name: playlist.name,
                ownerEmail: playlist.ownerEmail || "",
                ownerName: playlist.ownerName || ""
            });
        }

        return res.status(200).json({ success: true, idNamePairs });
    } catch (err) {
        console.warn('getPlaylistPairs error:', err);
        return res.status(500).json({ success: false, errorMessage: 'Could not load playlists' });
    }
}

async function updatePlaylist(req, res) {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({ success: false, errorMessage: 'UNAUTHORIZED' });
        }

        const playlistId = req.params.id;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ success: false, errorMessage: 'Playlist not found!' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, errorMessage: 'User not found' });
        }
        const ownsByEmail = playlist.ownerEmail && playlist.ownerEmail === user.email;
        const ownsById = playlist.owner && playlist.owner.equals(user._id);
        const userHasPlaylist = Array.isArray(user.playlists) && user.playlists.some((pid) => pid.equals(playlist._id));

        if (!ownsByEmail && !ownsById && !userHasPlaylist) {
            return res.status(403).json({ success: false, errorMessage: 'authentication error' });
        }

        const updated = req.body && req.body.playlist ? req.body.playlist : null;
        if (!updated) {
            return res.status(400).json({ success: false, errorMessage: 'No playlist data' });
        }

        playlist.name = updated.name;
        playlist.songs = updated.songs;
        await playlist.save();

        return res.status(200).json({ success: true, playlist });
    } catch (err) {
        console.warn('updatePlaylist error:', err);
        return res.status(500).json({ success: false, errorMessage: 'Playlist not updated!' });
    }
}

async function deletePlaylist(req, res) {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({ success: false, errorMessage: 'UNAUTHORIZED' });
        }

        const playlistId = req.params.id;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ success: false, errorMessage: 'Playlist not found!' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, errorMessage: 'User not found' });
        }
        const ownsByEmail = playlist.ownerEmail && playlist.ownerEmail === user.email;
        const ownsById = playlist.owner && playlist.owner.equals(user._id);
        const userHasPlaylist = Array.isArray(user.playlists) && user.playlists.some((pid) => pid.equals(playlist._id));

        if (!ownsByEmail && !ownsById && !userHasPlaylist) {
            return res.status(403).json({ success: false, errorMessage: 'authentication error' });
        }

        await Playlist.deleteOne({ _id: playlistId });

        user.playlists = user.playlists.filter(
            (id) => id.toString() !== playlistId.toString()
        );
        await user.save();

        return res.status(200).json({ success: true });
    } catch (err) {
        console.warn('deletePlaylist error:', err);
        return res.status(500).json({ success: false, errorMessage: 'Playlist not deleted!' });
    }
}

module.exports = {
    createPlaylist,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylist,
    deletePlaylist
};
