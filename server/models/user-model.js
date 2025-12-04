const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema(
  {
    // Spec: account is unique to email
    email: { type: String, required: true, unique: true },

    // Spec: user name does NOT need to be unique
    userName: { type: String, required: true },

    // Avatar image stored as a string (base64)
    avatar: { type: String, required: true },

    passwordHash: { type: String, required: true },

    playlists: [{ type: ObjectId, ref: "Playlist" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
