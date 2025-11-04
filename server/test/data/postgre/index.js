const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../../.env") });

const DB_NAME = process.env.PG_DB || "playlister";
const DB_USER = process.env.PG_USER || "arsh";       
const DB_PASS = process.env.PG_PASS || "";           
const DB_HOST = process.env.PG_HOST || "127.0.0.1";
const DB_PORT = process.env.PG_PORT || 5432;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: false,
});

const User = sequelize.define("User", {
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: DataTypes.STRING,
  passwordHash: DataTypes.STRING,
});

const Playlist = sequelize.define("Playlist", {
  name: DataTypes.STRING,
  ownerEmail: DataTypes.STRING,
  ownerUserName: DataTypes.STRING,
  songs: DataTypes.JSONB, 
});

async function resetPostgres() {
  try {
    console.log("Connecting to Postgres...");
    await sequelize.authenticate();

    await sequelize.sync({ force: true });

    const pwHash = bcrypt.hashSync("aaaaaaaa", 10);

    const [joe, jane, arsh] = await Promise.all([
      User.create({
        firstName: "Joe",
        lastName: "Shmo",
        email: "joe@shmo.com",
        passwordHash: pwHash,
      }),
      User.create({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@doe.com",
        passwordHash: pwHash,
      }),
      User.create({
        firstName: "Arshdeep",
        lastName: "Singh",
        email: "arsh@doe.com",
        passwordHash: pwHash,
      }),
    ]);

    const S = (title, artist, year, youTubeId) => ({
      title,
      artist,
      year,
      youTubeId,
    });

    await Playlist.bulkCreate([
      {
        name: "Modern Vibes",
        ownerEmail: arsh.email,
        ownerUserName: `${arsh.firstName} ${arsh.lastName}`,
        songs: [
          S("Passionfruit", "Drake", 2017, "COz9lDCFHjw"),
          S("After Hours", "The Weeknd", 2020, "ygTZZpVkmKg"),
        ],
      },
      {
        name: "R&B Essentials",
        ownerEmail: arsh.email,
        ownerUserName: `${arsh.firstName} ${arsh.lastName}`,
        songs: [
          S("We Find Love", "Daniel Caesar", 2017, "eBvKXGz0FPo"),
          S("Blinding Lights", "The Weeknd", 2020, "4NRXx6U8ABQ"),
        ],
      },
      {
        name: "Late Night Drive",
        ownerEmail: arsh.email,
        ownerUserName: `${arsh.firstName} ${arsh.lastName}`,
        songs: [
          S("Jungle", "Drake", 2015, "2fXDk1sU_8g"),
          S("Call Out My Name", "The Weeknd", 2018, "M3mJkSqZbX4"),
        ],
      },
    ]);

    console.log("Postgres reset complete");
    process.exit(0);
  } catch (err) {
    console.error("Reset failed:", err);
    process.exit(1);
  }
}

resetPostgres();
