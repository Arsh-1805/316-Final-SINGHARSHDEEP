const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/user-model");
const Playlist = require("../models/playlist-model");

function toObjectId(value) {
  if (!value) return new mongoose.Types.ObjectId();
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : new mongoose.Types.ObjectId();
}

async function upsertDocument(Model, doc, lookup) {
  const filter = lookup || { _id: doc._id };
  await Model.updateOne(filter, { $setOnInsert: doc }, { upsert: true });
}

async function seedDevData() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const sampleDataPath = path.join(
    __dirname,
    "..",
    "test",
    "data",
    "example-db-data.json"
  );
  const sampleData = require(sampleDataPath);
  const users = sampleData.users || [];
  const playlists = sampleData.playlists || [];

  const normalizedPlaylists = playlists.map((playlist) => {
    const playlistId = toObjectId(playlist._id);
    return {
      _id: playlistId,
      owner: toObjectId(playlist.owner),
      ownerEmail: playlist.ownerEmail,
      ownerName: playlist.ownerName || "",
      name: playlist.name || "Untitled",
      listenerCount: playlist.listenerCount || 0,
      songs: Array.isArray(playlist.songs) ? playlist.songs : [],
    };
  });

  const normalizedUsers = users.map((user) => ({
    _id: toObjectId(user._id),
    email: user.email,
    userName: user.userName || user.firstName || user.email,
    avatar: user.avatar || "",
    passwordHash: user.passwordHash,
    playlists: Array.isArray(user.playlists)
      ? user.playlists.map((id) => toObjectId(id))
      : [],
  }));

  for (const playlist of normalizedPlaylists) {
    await upsertDocument(Playlist, playlist);
  }

  for (const user of normalizedUsers) {
    await upsertDocument(User, user, { email: user.email });
  }

  console.log("[seed] Ensured default users and playlists exist");
}

module.exports = seedDevData;
