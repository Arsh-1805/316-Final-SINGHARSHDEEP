const express = require('express');
const router = express.Router();
const PlaylistController = require('../controllers/playlist-controller');

router.post('/create', PlaylistController.createPlaylist);
router.get('/user', PlaylistController.getUserPlaylists);
router.get('/:id', PlaylistController.getPlaylistById);

module.exports = router;
