import { useContext } from 'react';
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';

function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const { idNamePair } = props;

    const isOwner =
        auth.loggedIn &&
        auth.user &&
        (!idNamePair.ownerEmail || idNamePair.ownerEmail === auth.user.email);

    function handleLoadList(event, id) {
        event.preventDefault();
        store.setCurrentList(id);
    }

    function handleDeleteList(event, id) {
        event.stopPropagation();
        if (!isOwner) return;
        store.markListForDeletion(id);
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

    function handlePlayList(event, id) {
        event.stopPropagation();
        store.playPlaylist(id);
    }

    const ownerLabel = isOwner
        ? "You"
        : (idNamePair.ownerEmail || "Unknown Owner");
    const canCopy = auth.loggedIn;

    return (
        <Paper
            id={idNamePair._id}
            elevation={4}
            sx={{
                width: '100%',
                borderRadius: 3,
                p: 2.5,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                cursor: 'pointer',
            }}
            onClick={(event) => handleLoadList(event, idNamePair._id)}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: '#ff80ab', width: 56, height: 56 }}>
                    {idNamePair.name ? idNamePair.name[0].toUpperCase() : 'P'}
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4a148c' }}>
                        {idNamePair.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        by {ownerLabel}
                    </Typography>
                </Box>
            </Stack>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {isOwner && (
                    <>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={(event) => handleDeleteList(event, idNamePair._id)}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={(event) => handleEditList(event, idNamePair._id)}
                        >
                            Edit
                        </Button>
                    </>
                )}
                {canCopy && (
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={(event) => handleCopyList(event, idNamePair._id)}
                    >
                        Copy
                    </Button>
                )}
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        bgcolor: '#26a69a',
                        '&:hover': { bgcolor: '#1f8a7f' }
                    }}
                    onClick={(event) => handlePlayList(event, idNamePair._id)}
                >
                    Play
                </Button>
            </Box>
        </Paper>
    );
}

export default PlaylistCard;
