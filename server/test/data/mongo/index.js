const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

async function clearCollection(collection, collectionName) {
    try {
        await collection.deleteMany({});
        console.log(collectionName + " cleared");
    }
    catch (err) {
        console.log(err);
    }
}

async function fillCollection(collection, collectionName, data) {
    for (let i = 0; i < data.length; i++) {
        let doc = new collection(data[i]);
        await doc.save();
    }
    console.log(collectionName + " filled");
}

async function resetMongo() {
    const Playlist = require('../../../models/playlist-model')
    const User = require("../../../models/user-model")
    const testData = require("../example-db-data.json")

    const bcrypt = require("bcryptjs");

    const me = {
        firstName: "Arshdeep",
        lastName: "Singh",
        email: "arsh@doe.com",
        userName: "arsh",
        avatar: "",
        passwordHash: bcrypt.hashSync("aaaaaaaa", 10),
        };

    if (!testData.users.find(u => u.email === me.email)) {
        testData.users.push(me);

        const S = (title, artist, year, youTubeId) => ({ title, artist, year, youTubeId });

    testData.playlists.push(
        {
            name: "Modern Vibes",
            ownerEmail: me.email,
            ownerUserName: `${me.firstName} ${me.lastName}`,
            songs: [
                S("Passionfruit", "Drake", 2017, "COz9lDCFHjw"),
                S("After Hours", "The Weeknd", 2020, "ygTZZpVkmKg"),
                S("Crew Love", "Drake ft. The Weeknd", 2011, "v8waU_Msi9U"),
                S("Get Along Better", "Drake ft. Ty Dolla $ign", 2021, "R-uMLq0lkPw"),
                S("Pink + White", "Frank Ocean", 2016, "O8cDfnQDikQ"),
                S("Location", "Khalid", 2017, "by3yRdlQvzs"),
                S("For Tonight", "Giveon", 2021, "bDqu1Z1xqs8"),
                S("Outta Time", "Bryson Tiller ft. Drake", 2020, "ebkurI0ij7Q"),
                S("From Time", "Drake ft. Jhene Aiko", 2013, "6PyP8p21xuM"),
                S("Street Lights", "Kanye West", 2008, "6OdO9a4D0xY"),
                S("Lost", "Frank Ocean", 2012, "tfj0A9bJSgI"),
                S("Fell in Love", "NAV", 2016, "W9ObD5d9dKw"),
                S("Faith", "The Weeknd", 2020, "UtaYneynQ14"),
                S("Club Paradise", "Drake", 2011, "EfGOqrXcm_Y"),
                S("Best Part", "Daniel Caesar ft. H.E.R.", 2017, "vBy7FaapGRo"),
                S("Die For You", "The Weeknd", 2016, "QLCpqdqeoII"),
                S("Back 2 Buisness", "NAV", 2020, "wrc2TkmzZdU"),
                S("Too Deep to Turn Back", "Daniel Caesar", 2023, "L7tYcDqTMMg"),
                S("Faithful", "Drake ft. Pimp C & dvsn", 2016, "5uDPu3qgJ6o"),
                S("Lost Ones", "J. Cole", 2011, "ngzC_8zqInk"),
                S("Heartbreak Anniversary", "Giveon", 2020, "MxOZPj8V1Zo"),
                S("Pink + White", "Frank Ocean", 2016, "O8cDfnQDikQ")
                ]
        },
        {
            name: "R&B Essentials",
            ownerEmail: me.email,
            ownerUserName: `${me.firstName} ${me.lastName}`,
            songs: [
                S("We Find Love", "Daniel Caesar", 2017, "eBvKXGz0FPo"),
                S("Blinding Lights", "The Weeknd", 2020, "4NRXx6U8ABQ"),
                S("Get You", "Daniel Caesar ft. Kali Uchis", 2016, "upm1P6nPWy4"),
                S("Lost In Japan", "Shawn Mendes", 2018, "xD7x7Gx0y3I"),
                S("Come and See Me", "PARTYNEXTDOOR ft. Drake", 2016, "1K9Oa4fFZLQ"),
                S("Some Way", "NAV", 2017, "nnJ_h2hRpoI"),
                S("Often", "The Weeknd", 2014, "JPIhUaONiLU"),
                S("Gravity", "Brent Faiyaz ft. Tyler, The Creator", 2021, "Pp-pElPOeyA"),
                S("Just Friends", "Musiq Soulchild", 2000, "iWJgJ3j58_I"),
                S("Let Me Know", "Brent Faiyaz", 2017, "38XSLJ9LUxk"),
                S("Hold On, We're Going Home", "Drake ft. Majid Jordan", 2013, "GxgqpCdOKak"),
                S("Get You Good", "Roy Woods", 2015, "1CTy-Fcb5bg"),
                S("Heartbreak Anniversary", "Giveon", 2020, "MxOZPj8V1Zo"),
                S("Love Yourz", "J. Cole", 2014, "6tjlU4w4fSo"),
                S("Find Your Love", "Drake", 2010, "pZ12_E5R3qc"),
                S("Lost Without U", "Robin Thicke", 2006, "tR-Y4xkJhVc"),
                S("Confident", "Justin Bieber ft. Chance The Rapper", 2013, "50VNCymT-Cs"),
                S("Let Me Go", "Daniel Caesar", 2023, "JvrVT2VGcvg"),
                S("Snooze", "SZA", 2022, "kPBTXk1HNXs"),
                S("Earned It", "The Weeknd", 2015, "waU75jdUnYw")
                ]
        },
        {
            name: "Late Night Drive",
            ownerEmail: me.email,
            ownerUserName: `${me.firstName} ${me.lastName}`,
            songs: [
                S("Jungle", "Drake", 2015, "AfRdRXCo3IU"),
                S("NAV", "NAV", 2017, "qz_E3uidr_w"),
                S("Wasting Time", "Brent Faiyaz ft. Drake", 2021, "NdSH2h-lkYI"),
                S("Controla", "Drake", 2016, "qs50R_rRoJM"),
                S("Wait For U", "Future ft. Drake & Tems", 2022, "Y2QpQP8wPG8"),
                S("Call Out My Name", "The Weeknd", 2018, "rsEne1ZiQrk"),
                S("Peach", "Kevin Abstract", 2019, "9XkJwcW3nDs"),
                S("Shot For Me", "Drake", 2011, "wc7JPaRV5uU"),
                S("Outta Time", "Bryson Tiller ft. Drake", 2020, "ebkurI0ij7Q"),
                S("Do Not Disturb", "Drake", 2017, "CXXVY4h5iGI"),
                S("Loose", "Daniel Caesar", 2017, "Eakt1tkxIXc"),
                S("Crew", "GoldLink ft. Brent Faiyaz & Shy Glizzy", 2017, "nhNqbe6QENY"),
                S("305 To My City", "Drake ft. Detail", 2013, "ceC1KsXV_jU"),
                S("Search & Rescue", "Drake", 2023, "ee2MTcUwas8"),
                S("NAV - Myself", "NAV", 2017, "sB46GqPpVdQ"),
                S("Gravity", "Brent Faiyaz ft. Tyler, The Creator", 2021, "Pp-pElPOeyA"),
                S("Cyanide", "Daniel Caesar", 2019, "Jnm3ukzmJe4"),
                S("Out Of Time", "The Weeknd", 2022, "2fDzCWNS3ig"),
                S("Chicago Freestyle", "Drake ft. Giveon", 2020, "qHNcZ-nCOJo"),
                S("No Idea", "Don Toliver", 2019, "ZkJHEUKtvXI")
            ]   
        }
        );
    }

    testData.users = testData.users.map((user, index) => ({
        ...user,
        userName: user.userName || user.firstName || `user${index + 1}`,
        avatar: user.avatar || "",
        passwordHash: user.passwordHash || bcrypt.hashSync("aaaaaaaa", 10),
    }));

    console.log("Resetting the Mongo DB")
    await clearCollection(Playlist, "Playlist");
    await clearCollection(User, "User");
    await fillCollection(Playlist, "Playlist", testData.playlists);
    await fillCollection(User, "User", testData.users);
}

const mongoose = require('mongoose')
mongoose
    .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
    .then(() => { resetMongo() })
    .catch(e => {
        console.error('Connection error', e.message)
    })
