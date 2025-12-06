/*
    This is where we'll route all of the received http requests
    into controller response functions.
    
    @author McKilla Gorilla
*/

const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/store-controller');

router.get('/playlistpairs', StoreController.getPlaylistPairs);
router.get('/playlist/:id', StoreController.getPlaylistById);
router.post('/playlist', StoreController.createPlaylist);
router.put('/playlist/:id', StoreController.updatePlaylist);
router.delete('/playlist/:id', StoreController.deletePlaylist);
router.post('/playlist/:id/listen', StoreController.incrementPlaylistListeners);

module.exports = router;
