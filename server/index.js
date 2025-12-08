const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const MongoDatabaseManager = require("./db/mongodb");
const PostgresDatabaseManager = require("./db/postgresql");
const seedDevData = require("./scripts/seedDevData");

const authRouter = require("./routes/auth-router");
const playlistRouter = require("./routes/playlist-router");
const storeRouter = require("./routes/store-router");

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);

app.use("/playlist", playlistRouter);
app.use("/api", storeRouter);

const PORT = process.env.PORT || 4000;

async function start() {
  const manager = (process.env.DB_MANAGER || "mongo").toLowerCase();
  let db;
  let shouldSeed = false;

  if (manager === "postgres" || manager === "postgresql") {
    console.log("Using PostgreSQL DatabaseManager");
    db = new PostgresDatabaseManager();
  } else {
    console.log("Using MongoDB DatabaseManager");
    db = new MongoDatabaseManager();
    shouldSeed = true;
  }

  try {
    await db.connect();
    if (shouldSeed) {
      await seedDevData();
    }
    app.set("db", db);

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

start();
