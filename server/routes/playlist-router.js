const express = require("express");
const router = express.Router();
const PlaylistController = require("../controllers/playlist-controller");
const requireAuth = require("../middleware/requireAuth");

router.get("/playlistpairs", requireAuth, PlaylistController.getPlaylistPairs);
router.get("/playlist/:id", requireAuth, PlaylistController.getPlaylistById);
router.post("/playlist", requireAuth, PlaylistController.createPlaylist);
router.put("/playlist/:id", requireAuth, PlaylistController.updatePlaylist);
router.delete("/playlist/:id", requireAuth, PlaylistController.deletePlaylist);

module.exports = router;
