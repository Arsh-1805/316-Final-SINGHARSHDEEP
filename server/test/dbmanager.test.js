import { describe, it, beforeAll, expect } from "vitest";
import dotenv from "dotenv";
import path from "path";
import MongoDatabaseManager from "../db/mongodb/index.js";
import PostgresDatabaseManager from "../db/postgresql/index.js";

dotenv.config({ path: path.join(process.cwd(), "server", ".env") });

let db;

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

describe("DatabaseManager basic operations", () => {
  it("can get all playlists for a user", async () => {
    const email = "arsh@doe.com";
    const playlists = await db.getAllPlaylistsForUser(email);
    expect(playlists).toBeDefined();
    expect(Array.isArray(playlists)).toBe(true);
  });

  it("can create and then delete a playlist", async () => {
    const email = "arsh@doe.com";
    const created = await db.createPlaylist({
      name: "Test From Vitest",
      ownerEmail: email,
      songs: [],
    });

    expect(created).toBeDefined();
    expect(created._id || created.id).toBeDefined();

    const id = created._id ? created._id.toString() : created.id.toString();

    const fetched = await db.getPlaylistById(id);
    expect(fetched).toBeDefined();
    expect(fetched.name).toBe("Test From Vitest");

    await db.deletePlaylist(id);

    const shouldBeGone = await db.getPlaylistById(id);
    expect(shouldBeGone).toBeNull();
  });
});

