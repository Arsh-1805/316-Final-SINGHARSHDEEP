class DatabaseManager {
  async init() {
    throw new Error("init() not implemented");
  }

  async createPlaylist(data) {
    throw new Error("createPlaylist() not implemented");
  }

  async getPlaylistById(id) {
    throw new Error("getPlaylistById() not implemented");
  }

  async getPlaylistPairs(ownerEmail) {
    throw new Error("getPlaylistPairs() not implemented");
  }

  async updatePlaylist(id, data) {
    throw new Error("updatePlaylist() not implemented");
  }

  async deletePlaylist(id) {
    throw new Error("deletePlaylist() not implemented");
  }

  async getUserByEmail(email) {
    throw new Error("getUserByEmail() not implemented");
  }
}

module.exports = DatabaseManager;
