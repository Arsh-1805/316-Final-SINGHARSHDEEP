const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const PlaylistSchema = new Schema(
    {
        name: { type: String, required: true },
        owner: { type: ObjectId, ref: 'User', required: true },
        songs: [
            {
                title: String,
                artist: String,
                youTubeId: String,
                year: String
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Playlist', PlaylistSchema);
