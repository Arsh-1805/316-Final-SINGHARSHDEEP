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

describe("DatabaseManager basic operations", () => {
  it("can create and retrieve a playlist", async () => {
    const pl = await db.createPlaylist({
      name: "Vitest Example",
      ownerEmail: "vitest@example.com",
      songs: [],
    });
    const fetched = await db.getPlaylistById(pl._id || pl.id);
    expect(fetched).toBeDefined();
    expect(fetched.name).toBe("Vitest Example");
  });

  it("can fetch playlists by owner email", async () => {
    const lists = await db.getPlaylistsByOwnerEmail("vitest@example.com");
    expect(Array.isArray(lists)).toBe(true);
  });
});
