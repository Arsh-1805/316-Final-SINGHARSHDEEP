import { useContext, useMemo, useState } from 'react';
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const { idNamePair } = props;
    const [expanded, setExpanded] = useState(false);

    const isOwner =
        auth.loggedIn &&
        auth.user &&
        (!idNamePair.ownerEmail || idNamePair.ownerEmail === auth.user.email);

    function handleLoadList(event, id) {
        event.preventDefault();
        store.setCurrentList(id);
    }

    function handleEditList(event, id) {
        event.stopPropagation();
        if (!isOwner) return;
        store.setCurrentList(id, { stayOnHome: true });
    }

    function handleCopyList(event, id) {
        event.stopPropagation();
        if (!auth.loggedIn) return;
        store.duplicatePlaylist(id);
    }

    function handleDeleteList(event, id) {
        event.stopPropagation();
        if (!isOwner) return;
        store.markListForDeletion(id);
    }

    function handlePlayList(event, id) {
        event.stopPropagation();
        store.playPlaylist(id);
    }

    const ownerLabel = idNamePair.ownerName || idNamePair.ownerEmail || 'Unknown';
    const songs = idNamePair.songs || [];
    const summarySongs = useMemo(() => songs.slice(0, 3), [songs]);
    const listeners = idNamePair.listenerCount ?? 0;

    const canCopy = auth.loggedIn;

    return (
        <Paper
            id={idNamePair._id}
            elevation={4}
            sx={{
                width: '100%',
                borderRadius: 3,
                p: 2.5,
                bgcolor: '#fff',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    cursor: 'pointer'
                }}
                onClick={(event) => handleLoadList(event, idNamePair._id)}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: '#ff80ab', width: 50, height: 50 }}>
                        {idNamePair.name ? idNamePair.name[0].toUpperCase() : 'P'}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4a148c' }}>
                            {idNamePair.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {ownerLabel}
                        </Typography>
                    </Box>
                </Stack>
                <IconButton size="small" onClick={(event) => {
                    event.stopPropagation();
                    setExpanded(!expanded);
                }}>
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Typography
                variant="body2"
                sx={{ color: '#7986cb', mt: 1 }}
            >
                {listeners} Listeners
            </Typography>

            <Box sx={{ mt: 1, color: '#4a148c' }}>
                {summarySongs.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No songs yet.
                    </Typography>
                ) : (
                    summarySongs.map((song, index) => (
                        <Typography key={index} variant="body2">
                            {index + 1}. {song.title} by {song.artist} ({song.year})
                        </Typography>
                    ))
                )}
                {expanded && songs.slice(summarySongs.length).map((song, index) => (
                    <Typography key={`extra-${index}`} variant="body2">
                        {summarySongs.length + index + 1}. {song.title} by {song.artist} ({song.year})
                    </Typography>
                ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                {isOwner && (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={(event) => handleEditList(event, idNamePair._id)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={(event) => handleDeleteList(event, idNamePair._id)}
                        >
                            Delete
                        </Button>
                    </>
                )}
                {canCopy && (
                    <Button
                        variant="contained"
                        color="success"
                        onClick={(event) => handleCopyList(event, idNamePair._id)}
                    >
                        Copy
                    </Button>
                )}
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={(event) => handlePlayList(event, idNamePair._id)}
                >
                    Play
                </Button>
            </Box>
        </Paper>
    );
}

export default PlaylistCard;
