const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../../../.env' });

const sequelize = new Sequelize('playlister', 'arsh', '', {
  host: '127.0.0.1',
  port: 5432,
  dialect: 'postgres',
  logging: false,
});

const User = sequelize.define('User', {
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: DataTypes.STRING,
  passwordHash: DataTypes.STRING,
});

const Playlist = sequelize.define('Playlist', {
  name: DataTypes.STRING,
  ownerEmail: DataTypes.STRING,
});

async function resetPostgres() {
  try {
    console.log('Connecting to Postgres...');
    await sequelize.authenticate();

    await sequelize.sync({ force: true });

    const users = await User.bulkCreate([
      {
        firstName: 'Joe',
        lastName: 'Shmo',
        email: 'joe@shmo.com',
        passwordHash: 'aaaaaaaa', 
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@doe.com',
        passwordHash: 'aaaaaaaa',
      },
    ]);

    await Playlist.bulkCreate([
      { name: 'Modern Vibes', ownerEmail: 'arsh@doe.com' },
      { name: 'R&B Essentials', ownerEmail: 'arsh@doe.com' },
      { name: 'Late Night Drive', ownerEmail: 'arsh@doe.com' },
    ]);

    console.log('Postgres reset complete');
    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  }
}

resetPostgres();
