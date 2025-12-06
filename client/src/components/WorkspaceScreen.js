import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SongCard from './SongCard.js';
import MUIEditSongModal from './MUIEditSongModal';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CloseIcon from '@mui/icons-material/HighlightOff';
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';

function WorkspaceScreen() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    store.history = history;

    const isGuest = !auth.loggedIn;
    const [listName, setListName] = useState(store.currentList ? store.currentList.name : "");

    useEffect(() => {
        if (store.currentList) {
            setListName(store.currentList.name);
        }
    }, [store.currentList]);

    let modalJSX = "";
    if (!isGuest && store.isEditSongModalOpen()) {
        modalJSX = <MUIEditSongModal />;
    }

    const handleCommitName = () => {
        if (isGuest || !store.currentList) return;
        const trimmed = listName.trim();
        if (!trimmed || trimmed === store.currentList.name) {
            setListName(store.currentList.name);
            return;
        }
        store.changeListName(store.currentList._id, trimmed);
    };

    const handleAddSong = () => {
        if (isGuest) return;
        store.addNewSong();
    };

    const handleUndo = () => {
        if (isGuest) return;
        store.undo();
    };

    const handleRedo = () => {
        if (isGuest) return;
        store.redo();
    };

    const handleClose = () => {
        store.closeCurrentList();
    };

    useEffect(() => {
        if (!store.currentList) {
            history.push('/playlists');
        }
    }, [store.currentList, history]);

    if (!store.currentList) {
        return null;
    }

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                bgcolor: '#f5ccff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                p: 4
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    width: '100%',
                    maxWidth: 960,
                    borderRadius: 4,
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        bgcolor: '#2ecc71',
                        color: 'white',
                        p: 2.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {isGuest ? 'View Playlist' : 'Edit Playlist'}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddSong}
                        disabled={isGuest || !store.canAddNewSong()}
                        sx={{
                            bgcolor: '#7e57c2',
                            '&:hover': { bgcolor: '#673ab7' }
                        }}
                    >
                        New Song
                    </Button>
                </Box>

                <Box sx={{ bgcolor: '#f0ffee', p: 3 }}>
                    <TextField
                        label="Playlist Name"
                        fullWidth
                        value={listName}
                        disabled={isGuest}
                        onChange={(event) => setListName(event.target.value)}
                        onBlur={handleCommitName}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                handleCommitName();
                            }
                        }}
                        sx={{
                            mb: 3,
                            bgcolor: 'white',
                            borderRadius: 1
                        }}
                    />

                    <Box
                        sx={{
                            border: '3px solid #c1a7ff',
                            borderRadius: 3,
                            backgroundColor: '#fff',
                            minHeight: 280,
                            maxHeight: '50vh',
                            overflowY: 'auto',
                            p: 2
                        }}
                    >
                        {store.currentList.songs.length === 0 ? (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ textAlign: 'center', mt: 4 }}
                            >
                                No songs yet. Use "New Song" to start building your playlist.
                            </Typography>
                        ) : (
                            store.currentList.songs.map((song, index) => (
                                <SongCard
                                    id={'playlist-song-' + index}
                                    key={'playlist-song-' + index}
                                    index={index}
                                    song={song}
                                    readOnly={isGuest}
                                />
                            ))
                        )}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                startIcon={<UndoIcon />}
                                onClick={handleUndo}
                                disabled={isGuest || !store.canUndo()}
                                sx={{
                                    bgcolor: '#b388ff',
                                    '&:hover': { bgcolor: '#9575cd' }
                                }}
                            >
                                Undo
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<RedoIcon />}
                                onClick={handleRedo}
                                disabled={isGuest || !store.canRedo()}
                                sx={{
                                    bgcolor: '#b388ff',
                                    '&:hover': { bgcolor: '#9575cd' }
                                }}
                            >
                                Redo
                            </Button>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<CloseIcon />}
                            onClick={handleClose}
                            sx={{
                                bgcolor: '#009688',
                                '&:hover': { bgcolor: '#00796b' }
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {modalJSX}
        </Box>
    );
}

export default WorkspaceScreen;
