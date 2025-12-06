import { useContext } from 'react';
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';

function SongCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const { song, index, readOnly } = props;  
    // readOnly is passed from WorkspaceScreen for guest mode

    const isGuest = readOnly || !auth.loggedIn;

    /** DRAG-DROP EVENTS — disabled for guests **/
    function handleDragStart(event) {
        if (isGuest) return;
        event.dataTransfer.setData("song", index);
    }

    function handleDragOver(event) {
        if (isGuest) return;
        event.preventDefault();
    }

    function handleDragEnter(event) {
        if (isGuest) return;
        event.preventDefault();
    }

    function handleDragLeave(event) {
        if (isGuest) return;
        event.preventDefault();
    }

    function handleDrop(event) {
        if (isGuest) return;
        event.preventDefault();
        let targetIndex = index;
        let sourceIndex = Number(event.dataTransfer.getData("song"));
        store.addMoveSongTransaction(sourceIndex, targetIndex);
    }

    /** DELETE SONG — disabled for guests **/
    function handleRemoveSong(event) {
        if (isGuest) return;
        store.addRemoveSongTransaction(song, index);
    }

    /** DOUBLE CLICK TO EDIT — disabled for guests **/
    function handleDoubleClick() {
        if (isGuest) return;
        store.showEditSongModal(index, song);
    }

    return (
        <Box
            key={index}
            id={'song-' + index + '-card'}
            draggable={!isGuest}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDoubleClick={handleDoubleClick}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: "2px solid #f7d26a",
                backgroundColor: "#fff3c4",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                transition: "transform 0.1s ease, box-shadow 0.1s ease",
                cursor: isGuest ? "default" : "grab",
                userSelect: "none",
                "&:active": {
                    cursor: isGuest ? "default" : "grabbing",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                },
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", minWidth: 32 }}
            >
                {index + 1}.
            </Typography>

            <Box sx={{ flexGrow: 1 }}>
                <Typography
                    id={'song-' + index + '-link'}
                    component="a"
                    href={"https://www.youtube.com/watch?v=" + song.youTubeId}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        textDecoration: "none",
                        color: "#4e342e",
                        fontWeight: 600,
                        display: "block",
                    }}
                >
                    {song.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {song.artist} • {song.year}
                </Typography>
            </Box>

            {/* REMOVE BUTTON — HIDDEN for guests */}
            {!isGuest && (
                <IconButton
                    aria-label="delete song"
                    onClick={handleRemoveSong}
                    id={"remove-song-" + index}
                    sx={{
                        color: "#7b1fa2",
                        backgroundColor: "white",
                        "&:hover": {
                            backgroundColor: "#f3e5f5",
                        },
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            )}
        </Box>
    );
}

export default SongCard;
