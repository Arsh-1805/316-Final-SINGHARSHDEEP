const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },

    userName: { type: String, required: true },

    avatar: { type: String, required: false, default: "" },

    passwordHash: { type: String, required: true },

    playlists: [{ type: ObjectId, ref: "Playlist" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
