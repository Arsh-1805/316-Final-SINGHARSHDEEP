const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Playlist = require('../models/playlist-model');

const updates = [
    ["Passionfruit", "Drake", "COz9lDCFHjw"],
    ["After Hours", "The Weeknd", "ygTZZpVkmKg"],
    ["Crew Love", "Drake ft. The Weeknd", "v8waU_Msi9U"],
    ["Get Along", "Drake", "ZGHp_tAPzTg"],
    ["Pink + White", "Frank Ocean", "O8cDfnQDikQ"],
    ["Location", "Khalid", "by3yRdlQvzs"],
    ["For Tonight", "Giveon", "bDqu1Z1xqs8"],
    ["Outta Time", "Bryson Tiller ft. Drake", "ebkurI0ij7Q"],
    ["From Time", "Drake ft. Jhene Aiko", "6PyP8p21xuM"],
    ["Street Lights", "Kanye West", "6OdO9a4D0xY"],
    ["Lost", "Frank Ocean", "tfj0A9bJSgI"],
    ["Her Feelings", "NAV", "YqFPP3HcbsE"],
    ["Faith", "The Weeknd", "UtaYneynQ14"],
    ["Care Package", "Drake", "6c6zt6hGZFc"],
    ["Best Part", "Daniel Caesar ft. H.E.R.", "vBy7FaapGRo"],
    ["Die For You", "The Weeknd", "QLCpqdqeoII"],
    ["Back To You", "NAV", "AXeZz9FbTgU"],
    ["Too Deep to Turn Back", "Daniel Caesar", "L7tYcDqTMMg"],
    ["Faithful", "Drake ft. Pimp C & dvsn", "5uDPu3qgJ6o"],
    ["Lost Ones", "J. Cole", "ngzC_8zqInk"],
    ["We Find Love", "Daniel Caesar", "eBvKXGz0FPo"],
    ["Blinding Lights", "The Weeknd", "4NRXx6U8ABQ"],
    ["Get You", "Daniel Caesar ft. Kali Uchis", "upm1P6nPWy4"],
    ["Lost In Japan", "Shawn Mendes", "xD7x7Gx0y3I"],
    ["Come and See Me", "PARTYNEXTDOOR ft. Drake", "1K9Oa4fFZLQ"],
    ["Lofty Goals", "NAV", "ahhD-VrWnac"],
    ["Often", "The Weeknd", "JPIhUaONiLU"],
    ["Gravity", "Brent Faiyaz ft. Tyler, The Creator", "Pp-pElPOeyA"],
    ["Just Friends", "Musiq Soulchild", "iWJgJ3j58_I"],
    ["Let Me Know", "Brent Faiyaz", "38XSLJ9LUxk"],
    ["Hold On, We're Going Home", "Drake ft. Majid Jordan", "GxgqpCdOKak"],
    ["Get You Good", "Roy Woods", "1CTy-Fcb5bg"],
    ["Heartbreak Anniversary", "Giveon", "MxOZPj8V1Zo"],
    ["Truly Yours", "J. Cole", "amOYeQw4F_M"],
    ["Find Your Love", "Drake", "pZ12_E5R3qc"],
    ["Lost Without U", "Robin Thicke", "tR-Y4xkJhVc"],
    ["Confident", "Justin Bieber ft. Chance The Rapper", "50VNCymT-Cs"],
    ["Let Me Go", "Daniel Caesar ft. Ty Dolla $ign", "DNzVRN3Hj7o"],
    ["Snooze", "SZA", "kPBTXk1HNXs"],
    ["Earned It", "The Weeknd", "waU75jdUnYw"],
    ["Jungle", "Drake", "AfRdRXCo3IU"],
    ["NAV", "NAV", "qz_E3uidr_w"],
    ["Wasting Time", "Brent Faiyaz ft. Drake", "NdSH2h-lkYI"],
    ["Controla", "Drake", "qs50R_rRoJM"],
    ["Wait For U", "Future ft. Drake & Tems", "Y2QpQP8wPG8"],
    ["Call Out My Name", "The Weeknd", "rsEne1ZiQrk"],
    ["Peach", "Kevin Abstract", "9XkJwcW3nDs"],
    ["Shot For Me", "Drake", "wc7JPaRV5uU"],
    ["Do Not Disturb", "Drake", "CXXVY4h5iGI"],
    ["Loose", "Daniel Caesar", "Eakt1tkxIXc"],
    ["305 To My City", "Drake ft. Detail", "ceC1KsXV_jU"],
    ["Search & Rescue", "Drake", "ee2MTcUwas8"],
    ["NAV - Myself", "NAV", "sB46GqPpVdQ"],
    ["Cyanide", "Daniel Caesar", "Jnm3ukzmJe4"],
    ["Chicago Freestyle", "Drake ft. Giveon", "qHNcZ-nCOJo"],
    ["No Idea", "Don Toliver", "ZkJHEUKtvXI"]
];

const map = new Map(updates.map(([title, artist, id]) => [`${title.trim()}||${artist.trim()}`, id]));

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
        playlist.songs = (playlist.songs || []).map((song) => {
            const key = `${(song.title || '').trim()}||${(song.artist || '').trim()}`;
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
