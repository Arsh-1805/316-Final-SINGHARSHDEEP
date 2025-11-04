class DatabaseManager {
  async connect() {
    throw new Error("connect() not implemented");
  }

  async disconnect() {
  }

  async getUserByEmail(email) {
    throw new Error("getUserByEmail() not implemented");
  }
  async getUserById(id) {
    throw new Error("getUserById() not implemented");
  }
  async createUser(userData) {
    throw new Error("createUser() not implemented");
  }

  async getPlaylistsByOwnerEmail(ownerEmail) {
    throw new Error("getPlaylistsByOwnerEmail() not implemented");
  }

  async getAllPlaylistsForUser(ownerEmail) {
    return this.getPlaylistsByOwnerEmail(ownerEmail);
  }
  
  async getPlaylistById(id) {
    throw new Error("getPlaylistById() not implemented");
  }
  async createPlaylist(playlistData) {
    throw new Error("createPlaylist() not implemented");
  }
  async updatePlaylist(id, playlistData) {
    throw new Error("updatePlaylist() not implemented");
  }
  async deletePlaylist(id) {
    throw new Error("deletePlaylist() not implemented");
  }
}

module.exports = DatabaseManager;
