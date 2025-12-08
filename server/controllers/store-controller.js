const Playlist = require('../models/playlist-model');
const User = require('../models/user-model');
const SongStat = require('../models/song-stats-model');
const auth = require('../auth');

const normalizeSongField = (value) => (value ?? '').toString().trim();
const buildSongKey = (song = {}) => {
    const title = normalizeSongField(song.title).toLowerCase();
    const artist = normalizeSongField(song.artist).toLowerCase();
    const year = normalizeSongField(song.year).toLowerCase();
    return `${title}||${artist}||${year}`;
};

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
            ownerEmail: user.email,
            ownerName: user.userName || user.email,
            listenerCount: 0
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
        const ownerCache = new Map();
        const playlists = await Playlist.find({})
            .sort({ updatedAt: -1 })
            .limit(200);

        const idNamePairs = [];
        for (const playlist of playlists) {
            let ownerEmail = playlist.ownerEmail || "";
            let ownerName = playlist.ownerName || "";
            const ownerId = playlist.owner ? playlist.owner.toString() : null;

            async function resolveOwner() {
                if (ownerId) {
                    if (!ownerCache.has(ownerId)) {
                        const ownerUser = await User.findById(ownerId);
                        ownerCache.set(ownerId, ownerUser);
                    }
                    return ownerCache.get(ownerId);
                }
                if (ownerEmail) {
                    if (!ownerCache.has(ownerEmail)) {
                        const ownerUser = await User.findOne({ email: ownerEmail });
                        ownerCache.set(ownerEmail, ownerUser);
                    }
                    return ownerCache.get(ownerEmail);
                }
                return null;
            }

            const ownerUser = (!ownerEmail || !ownerName || !ownerId)
                ? await resolveOwner()
                : null;

            if (ownerUser) {
                ownerEmail = ownerEmail || ownerUser.email;
                ownerName = ownerName || ownerUser.userName || "";
            }

            idNamePairs.push({
                _id: playlist._id,
                name: playlist.name,
                ownerEmail,
                ownerName,
                songs: playlist.songs || [],
                listenerCount: playlist.listenerCount || 0
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

async function incrementPlaylistListeners(req, res) {
    try {
        const playlistId = req.params.id;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ success: false, errorMessage: 'Playlist not found!' });
        }

        playlist.listenerCount = (playlist.listenerCount || 0) + 1;
        await playlist.save();

        return res.status(200).json({ success: true, listenerCount: playlist.listenerCount });
    } catch (err) {
        console.warn('incrementPlaylistListeners error:', err);
        return res.status(500).json({ success: false, errorMessage: 'Could not update listeners' });
    }
}

async function incrementSongListen(req, res) {
    try {
        const body = req.body || {};
        const title = normalizeSongField(body.title);
        const artist = normalizeSongField(body.artist);
        const year = normalizeSongField(body.year);

        if (!title || !artist || !year) {
            return res.status(400).json({ success: false, errorMessage: 'Missing song data' });
        }

        const key = buildSongKey({ title, artist, year });
        let stat = await SongStat.findOne({ key });
        if (!stat) {
            stat = new SongStat({
                key,
                title,
                artist,
                year,
                listenCount: 0
            });
        } else {
            stat.title = title;
            stat.artist = artist;
            stat.year = year;
        }
        stat.listenCount = (stat.listenCount || 0) + 1;
        await stat.save();

        return res.status(200).json({ success: true, listenCount: stat.listenCount });
    } catch (err) {
        console.warn('incrementSongListen error:', err);
        return res.status(500).json({ success: false, errorMessage: 'Could not update song listens' });
    }
}

async function getSongStats(req, res) {
    try {
        const stats = await SongStat.find({}).sort({ listenCount: -1 });
        return res.status(200).json({ success: true, stats });
    } catch (err) {
        console.warn('getSongStats error:', err);
        return res.status(500).json({ success: false, errorMessage: 'Could not load song stats' });
    }
}

module.exports = {
    createPlaylist,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylist,
    deletePlaylist,
    incrementPlaylistListeners,
    incrementSongListen,
    getSongStats
};
