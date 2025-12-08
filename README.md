## Overview
This repository is to be used for Stony Brook University's CSE 316, Fall 2025 Semester, Homework 4. This assignment is similar to HWs 1 - 3 in that we are creating a similar application, but this time we're adding some unit testing, changing the database, and doing a bit of abstraction/redesign regarding how our back-end talks to the database.

All assignment instructions are provided <a href='https://www.cs.stonybrook.edu/~cse316/HW4.html'>here</a>.

## Testing
### Vitest unit tests
1. Ensure MongoDB is running locally and that `server/.env` has a `DB_CONNECT_TEST` URI that points at your test database (default is `mongodb://127.0.0.1:27017/playlister_test`).
2. From the `server` folder install dependencies (`npm install`) once.
3. Run all unit tests (models, DB managers, and controller helpers) with:
   ```bash
   cd server
   npm test
   ```
   Vitest will connect to the test database, isolate collections per suite, and cover playlists, users, database managers, and the song statistics controller logic located in `server/test`.

### Postman request tests
1. Start the API server (`cd server && npm start`) so Postman can reach `http://localhost:4000`.
2. Import the collection at `server/test/postman/Playlister.postman_collection.json` and the optional local environment `server/test/postman/Playlister.local.postman_environment.json`.
3. Select the **Playlister - Local** environment (or set `baseUrl` manually) and run the collection/folder to execute the request tests.
4. The collection covers `/api/playlistpairs` plus the `/api/songs/listen` and `/api/songs/stats` endpoints, asserting both success and validation-error flows through Postman's built-in test scripts.
