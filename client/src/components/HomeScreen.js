import { useContext, useEffect, useState } from 'react';
import { GlobalStoreContext } from '../store';
import PlaylistCard from './PlaylistCard.js';
import MUIDeleteModal from './MUIDeleteModal';
import AuthContext from '../auth';

import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

/*
    Playlists screen. Lists all playlists owned by the user
    (or visible to the user) and provides search + create.

    We’re now matching the PDF more closely with a left
    search panel and a right playlist list panel.
*/
const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    // simple text filter by playlist name (Use Case 2.12: Find Playlist)
    const [nameFilter, setNameFilter] = useState('');

    useEffect(() => {
        store.loadIdNamePairs();
    }, [store]);

    function handleCreateNewList() {
        // Guests should not be able to create playlists
        if (!auth.loggedIn) return;
        store.createNewList();
    }

    function handleClearFilters() {
        setNameFilter('');
    }

    // Filter playlists by name (case-insensitive)
    const filteredPairs = store.idNamePairs.filter((pair) =>
        pair.name.toLowerCase().includes(nameFilter.toLowerCase())
    );

    let listCard = '';
    if (store) {
        listCard = (
            <List
                sx={{
                    width: '100%',
                    bgcolor: '#f9f1ff',
                    mb: '20px',
                    borderRadius: 2,
                    p: 1,
                }}
            >
                {filteredPairs.map((pair) => (
                    <PlaylistCard
                        key={pair._id}
                        idNamePair={pair}
                        selected={false}
                    />
                ))}

                {/* bottom FAB – only when logged in */}
                {auth.loggedIn && (
                    <Fab
                        sx={{ mt: 2, alignSelf: 'center' }}
                        color="primary"
                        aria-label="add"
                        id="add-list-button"
                        onClick={handleCreateNewList}
                    >
                        <AddIcon />
                    </Fab>
                )}
            </List>
        );
    }

    return (
        <div id="playlist-selector">
            <Box
                sx={{
                    minHeight: 'calc(100vh - 64px)',
                    bgcolor: '#ffe4ff', // pink background like PDF
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    p: 4,
                }}
            >
                {/* Outer container that mimics the big yellow panel */}
                <Box
                    sx={{
                        display: 'flex',
                        width: '100%',
                        maxWidth: 1200,
                        bgcolor: 'transparent',
                        gap: 3,
                    }}
                >
                    {/* LEFT: Search / filter panel (like PDF 3.6) */}
                    <Box
                        sx={{
                            width: '32%',
                            bgcolor: '#fffbe6',
                            borderRadius: 2,
                            p: 3,
                            boxShadow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{ color: '#d100d1', fontWeight: 'bold', mb: 1 }}
                        >
                            Playlists
                        </Typography>

                        <TextField
                            label="by Playlist Name"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                        />
                        {/* These extra fields are mostly visual, to match the fig.
                           You can wire them into more advanced search later. */}
                        <TextField
                            label="by User Name"
                            variant="outlined"
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="by Song Title"
                            variant="outlined"
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="by Song Artist"
                            variant="outlined"
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="by Song Year"
                            variant="outlined"
                            size="small"
                            fullWidth
                        />

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mt: 2,
                            }}
                        >
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: '#6a1b9a',
                                    '&:hover': { bgcolor: '#4a148c' },
                                }}
                            >
                                Search
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: '#e0e0ff',
                                    color: '#333',
                                    '&:hover': { bgcolor: '#c5cae9' },
                                }}
                                onClick={handleClearFilters}
                            >
                                Clear
                            </Button>
                        </Box>
                    </Box>

                    {/* RIGHT: Playlists list panel */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            bgcolor: '#fffbe6',
                            borderRadius: 2,
                            p: 3,
                            boxShadow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Header row: sort + count + top FAB (like PDF) */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1">Sort:</Typography>
                                {/* Sort link placeholder for now (Use Case 2.13 later) */}
                                <Typography
                                    variant="subtitle1"
                                    sx={{ color: '#303f9f', cursor: 'pointer' }}
                                >
                                    Name (A–Z)
                                </Typography>
                            </Box>

                            <Typography variant="subtitle1">
                                {filteredPairs.length}{' '}
                                {filteredPairs.length === 1 ? 'Playlist' : 'Playlists'}
                            </Typography>

                            {auth.loggedIn && (
                                <Fab
                                    color="primary"
                                    size="small"
                                    aria-label="add"
                                    onClick={handleCreateNewList}
                                >
                                    <AddIcon />
                                </Fab>
                            )}
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box id="list-selector-list" sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            {listCard}
                            <MUIDeleteModal />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </div>
    );
};

export default HomeScreen;
