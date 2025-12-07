import { useContext } from 'react';
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import { normalizeYouTubeId } from '../utils/youtube';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';

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

    /** SONG ACTIONS **/
    function handleRemoveSong(event) {
        if (isGuest) return;
        store.addRemoveSongTransaction(song, index);
    }

    function handleDoubleClick() {
        if (isGuest) return;
        store.showEditSongModal(index, song);
    }

    function handleEditSong(event) {
        event.stopPropagation();
        if (isGuest) return;
        store.showEditSongModal(index, song);
    }

    function handleCopySong(event) {
        event.stopPropagation();
        if (isGuest) return;
        store.addCreateSongTransaction(index + 1, song.title, song.artist, song.year, song.youTubeId);
    }

    const rawLink = (song.youTubeId ?? '').toString().trim();
    const isFullUrl = /^https?:\/\//i.test(rawLink);
    const videoId = normalizeYouTubeId(rawLink);
    const youtubeUrl = isFullUrl
        ? rawLink
        : videoId
            ? `https://www.youtube.com/watch?v=${videoId}`
            : undefined;

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
                    component={youtubeUrl ? "a" : "span"}
                    href={youtubeUrl}
                    target={youtubeUrl ? "_blank" : undefined}
                    rel={youtubeUrl ? "noopener noreferrer" : undefined}
                    onClick={(event) => {
                        if (!youtubeUrl) {
                            event.preventDefault();
                        }
                    }}
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

            {!isGuest && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        aria-label="copy song"
                        onClick={handleCopySong}
                        sx={{
                            color: "#5e35b1",
                            backgroundColor: "white",
                            "&:hover": {
                                backgroundColor: "#ede7f6",
                            },
                        }}
                    >
                        <ContentCopyIcon />
                    </IconButton>
                    <IconButton
                        aria-label="edit song"
                        onClick={handleEditSong}
                        sx={{
                            color: "#1e88e5",
                            backgroundColor: "white",
                            "&:hover": {
                                backgroundColor: "#e3f2fd",
                            },
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        aria-label="delete song"
                        onClick={handleRemoveSong}
                        id={"remove-song-" + index}
                        sx={{
                            color: "#c62828",
                            backgroundColor: "white",
                            "&:hover": {
                                backgroundColor: "#ffcdd2",
                            },
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
}

export default SongCard;
