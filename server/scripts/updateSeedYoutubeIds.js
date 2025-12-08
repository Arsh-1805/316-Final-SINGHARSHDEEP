const fs = require('fs');
const path = require('path');

const updates = require('./youtubeUpdates');

const map = new Map(
    updates.map(([title, artist, id]) => [`${title.trim().toLowerCase()}||${artist.trim().toLowerCase()}`, id])
);

const seedPath = path.join(__dirname, '..', 'test', 'data', 'example-db-data.json');

const raw = fs.readFileSync(seedPath, 'utf8');
const data = JSON.parse(raw);

let updatedCount = 0;

data.playlists = (data.playlists || []).map((playlist) => {
    playlist.songs = (playlist.songs || []).map((song = {}) => {
        const key = `${(song.title || '').trim().toLowerCase()}||${(song.artist || '').trim().toLowerCase()}`;
        if (map.has(key) && song.youTubeId !== map.get(key)) {
            song.youTubeId = map.get(key);
            updatedCount += 1;
        }
        return song;
    });
    return playlist;
});

fs.writeFileSync(seedPath, JSON.stringify(data, null, 4));

console.log(`Seed data updated. ${updatedCount} songs patched in ${seedPath}`);
