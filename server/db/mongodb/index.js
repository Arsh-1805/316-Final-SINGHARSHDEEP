const mongoose = require("mongoose");
const DatabaseManager = require("../DatabaseManager");
const User = require("../../models/user-model");
const Playlist = require("../../models/playlist-model");

class MongoDatabaseManager extends DatabaseManager {
  async connect() {
    const isTest = process.env.NODE_ENV === "test";
    const uri = isTest ? process.env.DB_CONNECT_TEST : process.env.DB_CONNECT;
    if (!uri) {
      throw new Error(
        isTest ? "DB_CONNECT_TEST missing in .env" : "DB_CONNECT missing in .env"
      );
    }

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("[DB] Connected to MongoDB", isTest ? "(test)" : "(dev)");
  }

  async disconnect() {
    await mongoose.disconnect();
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
  
  async getAllPlaylistsForUser(ownerEmail) {
    return this.getPlaylistsByOwnerEmail(ownerEmail);
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
