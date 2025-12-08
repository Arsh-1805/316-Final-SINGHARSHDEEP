const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Playlist = require('../models/playlist-model');
const updates = require('./youtubeUpdates');

const map = new Map(
    updates.map(([title, artist, id]) => [`${title.trim().toLowerCase()}||${artist.trim().toLowerCase()}`, id])
);

async function run() {
    const uri = process.env.DB_CONNECT;
    if (!uri) {
        console.error('DB_CONNECT missing from environment.');
        process.exit(1);
    }
    await mongoose.connect(uri);
    const playlists = await Playlist.find({});
    let playlistsTouched = 0;
    let songsUpdated = 0;

    for (const playlist of playlists) {
        let changed = false;
        playlist.songs = (playlist.songs || []).map((song = {}) => {
            const key = `${(song.title || '').trim().toLowerCase()}||${(song.artist || '').trim().toLowerCase()}`;
            if (map.has(key) && song.youTubeId !== map.get(key)) {
                song.youTubeId = map.get(key);
                changed = true;
                songsUpdated += 1;
            }
            return song;
        });
        if (changed) {
            playlistsTouched += 1;
            await playlist.save();
        }
    }
    console.log(`Updated ${songsUpdated} songs across ${playlistsTouched} playlists.`);
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error('Failed to update YouTube IDs:', err);
    mongoose.disconnect();
    process.exit(1);
});
