/*
    This is where we'll route all of the received http requests
    into controller response functions.
    
    @author McKilla Gorilla
*/

const express = require("express");
const router = express.Router();
const PlaylistController = require("../controllers/playlist-controller");

router.get("/playlistpairs", PlaylistController.getPlaylistPairs);
router.get("/playlist/:id", PlaylistController.getPlaylistById);
router.post("/playlist/", PlaylistController.createPlaylist);
router.put("/playlist/:id", PlaylistController.updatePlaylistById);
router.delete("/playlist/:id", PlaylistController.deletePlaylistById);

module.exports = router;