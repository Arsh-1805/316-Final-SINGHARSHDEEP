import { useContext, useEffect, useState } from 'react'
import GlobalStoreContext from '../store';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

const style1 = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    bgcolor: 'background.paper',
    borderRadius: 2,
    p: 4,
    boxShadow: 24,
};

export default function MUIEditSongModal() {
    const { store } = useContext(GlobalStoreContext);
    const currentSong = store.currentSong || { title: '', artist: '', year: '', youTubeId: '' };
    const [ title, setTitle ] = useState(currentSong.title);
    const [ artist, setArtist ] = useState(currentSong.artist);
    const [ year, setYear ] = useState(currentSong.year);
    const [ youTubeId, setYouTubeId ] = useState(currentSong.youTubeId);

    useEffect(() => {
        setTitle(currentSong.title || '');
        setArtist(currentSong.artist || '');
        setYear(currentSong.year || '');
        setYouTubeId(currentSong.youTubeId || '');
    }, [currentSong]);

    const isFormComplete =
        title.trim().length > 0 &&
        artist.trim().length > 0 &&
        year.trim().length > 0 &&
        youTubeId.trim().length > 0;

    function handleConfirmEditSong() {
        let newSongData = {
            title: title,
            artist: artist,
            year: year,
            youTubeId: youTubeId
        };
        store.addUpdateSongTransaction(store.currentSongIndex, newSongData);
        store.hideModals();
    }

    function handleCancelEditSong() {
        store.hideModals();
    }

    function handleUpdateTitle(event) {
        setTitle(event.target.value);
    }

    function handleUpdateArtist(event) {
        setArtist(event.target.value);
    }

    function handleUpdateYear(event) {
        setYear(event.target.value);
    }

    function handleUpdateYouTubeId(event) {
        setYouTubeId(event.target.value);
    }

    return (
        <Modal
            open={store.currentModal === "EDIT_SONG"}
        >
        <Box sx={style1}>
            <div id="edit-song-modal" data-animation="slideInOutLeft">
            <Typography 
                sx={{fontWeight: 'bold'}} 
                id="edit-song-modal-title" variant="h4" component="h2">
                Edit Song
            </Typography>
            <Divider sx={{borderBottomWidth: 5, p: '5px', transform: 'translate(-5.5%, 0%)', width:377}}/>
            <Typography 
                sx={{mt: "10px", color: "#702963", fontWeight:"bold", fontSize:"30px"}} 
                id="modal-modal-title" variant="h6" component="h2">
                Title: <input id="edit-song-modal-title-textfield" className='modal-textfield' type="text" value={title} onChange={handleUpdateTitle} />
            </Typography>
            <Typography 
                sx={{color: "#702963", fontWeight:"bold", fontSize:"30px"}} 
                id="modal-modal-artist" variant="h6" component="h2">
                Artist: <input id="edit-song-modal-artist-textfield" className='modal-textfield' type="text" value={artist} onChange={handleUpdateArtist} />
            </Typography>
            <Typography 
                sx={{color: "#702963", fontWeight:"bold", fontSize:"30px"}} 
                id="modal-modal-year" variant="h6" component="h2">
                Year: <input id="edit-song-modal-year-textfield" className='modal-textfield' type="text" value={year} onChange={handleUpdateYear} />
            </Typography>
            <Typography 
                sx={{color: "#702963", fontWeight:"bold", fontSize:"25px"}} 
                id="modal-modal-youTubeId" variant="h6" component="h2">
                YouTubeId: <input id="edit-song-modal-youTubeId-textfield" className='modal-textfield' type="text" value={youTubeId} onChange={handleUpdateYouTubeId} />
            </Typography>
            <Button 
                sx={{color: isFormComplete ? "#fff" : "#999", backgroundColor: isFormComplete ? "#4caf50" : "#d0d0d0", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"20px"}} variant="contained" 
                id="edit-song-confirm-button" onClick={handleConfirmEditSong} disabled={!isFormComplete}>Complete</Button>
            <Button 
                sx={{opacity: 0.80, color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"20px", ml:"197px"}} variant="outlined" 
                id="edit-song-confirm-button" onClick={handleCancelEditSong}>Cancel</Button>
            </div>
        </Box>
        </Modal>
    );
}
