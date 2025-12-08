const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Playlist = require('../models/playlist-model');
const User = require('../models/user-model');

const OUTPUT_PATH = path.join(__dirname, '..', 'test', 'data', 'example-db-data.json');

const sanitizeSong = (song = {}) => ({
    title: song.title || '',
    artist: song.artist || '',
    year: song.year ?? '',
    youTubeId: song.youTubeId || ''
});

const sanitizePlaylist = (playlist) => ({
    _id: playlist._id.toString(),
    owner: playlist.owner ? playlist.owner.toString() : undefined,
    ownerEmail: playlist.ownerEmail || '',
    ownerName: playlist.ownerName || '',
    name: playlist.name || '',
    listenerCount: playlist.listenerCount ?? 0,
    songs: (playlist.songs || []).map(sanitizeSong)
});

const sanitizeUser = (user) => ({
    _id: user._id.toString(),
    email: user.email || '',
    userName: user.userName || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatar: user.avatar || '',
    passwordHash: user.passwordHash || '',
    playlists: (user.playlists || []).map((id) => id.toString())
});

async function run() {
    const uri = process.env.DB_CONNECT;
    if (!uri) {
        console.error('DB_CONNECT missing from environment.');
        process.exit(1);
    }

    await mongoose.connect(uri);

    const [users, playlists] = await Promise.all([
        User.find({}).lean().exec(),
        Playlist.find({}).lean().exec()
    ]);

    const payload = {
        users: users.map(sanitizeUser),
        playlists: playlists.map(sanitizePlaylist)
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 4));
    console.log(`Exported ${payload.playlists.length} playlists and ${payload.users.length} users to ${OUTPUT_PATH}`);

    await mongoose.disconnect();
}

run().catch((err) => {
    console.error('Failed to export playlists snapshot:', err);
    mongoose.disconnect().finally(() => process.exit(1));
});
