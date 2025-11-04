const { Sequelize, DataTypes } = require("sequelize");
const DatabaseManager = require("../DatabaseManager");
const bcrypt = require("bcryptjs");

class PostgresDatabaseManager extends DatabaseManager {
  constructor() {
    super();
    this.sequelize = null;
    this.User = null;
    this.Playlist = null;
  }

  async connect() {
    const db = process.env.PG_DB;
    const user = process.env.PG_USER;
    const password = process.env.PG_PASSWORD;
    const host = process.env.PG_HOST || "127.0.0.1";
    const port = process.env.PG_PORT || 5432;

    this.sequelize = new Sequelize(db, user, password, {
      host,
      port,
      dialect: "postgres",
      logging: false,
    });

    this.User = this.sequelize.define("User", {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      passwordHash: DataTypes.STRING,
    });

    this.Playlist = this.sequelize.define("Playlist", {
      name: DataTypes.STRING,
      ownerEmail: DataTypes.STRING,
      songs: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
    });

    await this.sequelize.sync({alter: true});
    console.log("[DB] Connected to PostgreSQL");
  }

    async disconnect() {
    if (this.sequelize) {
      await this.sequelize.close();
    }
  }

  async getUserByEmail(email) {
    return this.User.findOne({ where: { email } });
  }

  async getUserById(id) {
    return this.User.findByPk(id);
  }

  async createUser(userData) {
    return this.User.create(userData);
  }

  async getPlaylistsByOwnerEmail(ownerEmail) {
    return this.Playlist.findAll({ where: { ownerEmail } });
  }

  async getAllPlaylistsForUser(ownerEmail) {
    return this.getPlaylistsByOwnerEmail(ownerEmail);
  }

  async getPlaylistById(id) {
    return this.Playlist.findByPk(id);
  }

  async createPlaylist(playlistData) {
    return this.Playlist.create(playlistData);
  }

  async updatePlaylist(id, playlistData) {
    const playlist = await this.Playlist.findByPk(id);
    if (!playlist) return null;
    return playlist.update(playlistData);
  }

  async deletePlaylist(id) {
    return this.Playlist.destroy({ where: { id } });
  }
}

module.exports = PostgresDatabaseManager;
