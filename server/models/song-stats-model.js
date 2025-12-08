const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SongStatSchema = new Schema(
    {
        key: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        artist: { type: String, required: true },
        year: { type: String, required: true },
        listenCount: { type: Number, default: 0 }
    },
    { timestamps: true }
);

module.exports = mongoose.models.SongStat || mongoose.model('SongStat', SongStatSchema);
