import { describe, it, expect, beforeAll, afterAll } from "vitest";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

import MongoDatabaseManager from "../db/mongodb/index.js";
import PostgresDatabaseManager from "../db/postgresql/index.js";

let db;

describe("DatabaseManager unified tests", () => {
  beforeAll(async () => {
    const manager = (process.env.DB_MANAGER || "mongo").toLowerCase();
    if (manager === "postgres" || manager === "postgresql") {
      db = new PostgresDatabaseManager();
    } else {
      db = new MongoDatabaseManager();
    }
    await db.connect();
  });

  afterAll(async () => {
    if (db && db.disconnect) {
      await db.disconnect();
    }
  });

  it("creates a playlist for current user", async () => {
    const ownerEmail = "arsh@doe.com";

    const playlist = await db.createPlaylist({
      name: "Test From Vitest",
      ownerEmail,
      songs: [],
    });

    expect(playlist).toBeDefined();
    const id = playlist._id || playlist.id;
    expect(id).toBeDefined();

    await db.deletePlaylist(id);
  });

  it("gets playlists by owner email", async () => {
    const ownerEmail = "arsh@doe.com";
    const lists = await db.getPlaylistsByOwnerEmail(ownerEmail);
    expect(Array.isArray(lists)).toBe(true);
  });
});
