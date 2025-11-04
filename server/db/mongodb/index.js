const mongoose = require("mongoose");
const DatabaseManager = require("../DatabaseManager");
const User = require("../../models/user-model");
const Playlist = require("../../models/playlist-model");

class MongoDatabaseManager extends DatabaseManager {
  async connect() {
    const uri = process.env.DB_CONNECT;
    if (!uri) throw new Error("DB_CONNECT missing in .env");

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("[DB] Connected to MongoDB");
  }

  async getUserByEmail(email) {
    return User.findOne({ email }).exec();
  }

  async getUserById(id) {
    return User.findById(id).exec();
  }

  async createUser(userData) {
    const user = new User(userData);
    return user.save();
  }

  async getPlaylistsByOwnerEmail(ownerEmail) {
    return Playlist.find({ ownerEmail }).exec();
  }

  async getPlaylistById(id) {
    return Playlist.findById(id).exec();
  }

  async createPlaylist(playlistData) {
    const playlist = new Playlist(playlistData);
    return playlist.save();
  }

  async updatePlaylist(id, playlistData) {
    return Playlist.findByIdAndUpdate(id, playlistData, { new: true }).exec();
  }

  async deletePlaylist(id) {
    return Playlist.findByIdAndDelete(id).exec();
  }
}

module.exports = MongoDatabaseManager;
