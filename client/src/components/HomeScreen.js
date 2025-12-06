import { useContext, useEffect, useState } from 'react';
import { GlobalStoreContext } from '../store';
import PlaylistCard from './PlaylistCard.js';
import MUIDeleteModal from './MUIDeleteModal';
import AuthContext from '../auth';
import WorkspaceScreen from './WorkspaceScreen';
import PlayPlaylistOverlay from './PlayPlaylistOverlay';

import AddIcon from '@mui/icons-material/Add';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

/*
    Playlists screen. Lists all playlists owned by the user
    (or visible to the user) and provides search + create.

    We’re now matching the PDF more closely with a left
    search panel and a right playlist list panel.
*/
const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const [nameFilter, setNameFilter] = useState('');
    const [ownerNameFilter, setOwnerNameFilter] = useState('');
    const [songTitleFilter, setSongTitleFilter] = useState('');
    const [songArtistFilter, setSongArtistFilter] = useState('');
    const [songYearFilter, setSongYearFilter] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('all');

    useEffect(() => {
        store.loadIdNamePairs();
        // We only need to fetch once when the screen mounts or when the page reloads.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleCreateNewList() {
        if (!auth.loggedIn) return;
        store.createNewList();
    }

    function handleClearFilters() {
        setNameFilter('');
        setOwnerNameFilter('');
        setSongTitleFilter('');
        setSongArtistFilter('');
        setSongYearFilter('');
        setOwnerFilter('all');
    }

    const filteredPairs = store.idNamePairs
        .filter((pair) =>
            pair.name.toLowerCase().includes(nameFilter.toLowerCase())
        )
        .filter((pair) =>
            pair.ownerName?.toLowerCase().includes(ownerNameFilter.toLowerCase()) || ownerNameFilter.trim() === ''
        )
        .filter((pair) => {
            if (ownerFilter === 'mine') {
                return auth.user && pair.ownerEmail === auth.user.email;
            }
            if (ownerFilter === 'others') {
                return !auth.user || pair.ownerEmail !== auth.user.email;
            }
            return true;
        })
        .filter((pair) => {
            const songs = pair.songs || [];
            const titleFilter = songTitleFilter.trim().toLowerCase();
            const artistFilter = songArtistFilter.trim().toLowerCase();
            const yearFilter = songYearFilter.trim().toLowerCase();

            const matchesTitle = !titleFilter || songs.some(song => (song.title || '').toLowerCase().includes(titleFilter));
            const matchesArtist = !artistFilter || songs.some(song => (song.artist || '').toLowerCase().includes(artistFilter));
            const matchesYear = !yearFilter || songs.some(song => (song.year || '').toString().toLowerCase().includes(yearFilter));
            return matchesTitle && matchesArtist && matchesYear;
        });

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
            </List>
        );
    }

    return (
        <div id="playlist-selector">
            <Box
                sx={{
                    minHeight: 'calc(100vh - 64px)',
                    bgcolor: '#ffe4ff', 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    p: 4,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        width: '100%',
                        maxWidth: 1200,
                        bgcolor: 'transparent',
                        gap: 3,
                    }}
                >
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
                        <TextField
                            label="by User Name"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={ownerNameFilter}
                            onChange={(e) => setOwnerNameFilter(e.target.value)}
                        />
                        <TextField
                            label="by Song Title"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={songTitleFilter}
                            onChange={(e) => setSongTitleFilter(e.target.value)}
                        />
                        <TextField
                            label="by Song Artist"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={songArtistFilter}
                            onChange={(e) => setSongArtistFilter(e.target.value)}
                        />
                        <TextField
                            label="by Song Year"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={songYearFilter}
                            onChange={(e) => setSongYearFilter(e.target.value)}
                        />

                        <ToggleButtonGroup
                            value={ownerFilter}
                            exclusive
                            onChange={(event, value) => {
                                if (value !== null) setOwnerFilter(value);
                            }}
                            size="small"
                            color="secondary"
                        >
                            <ToggleButton value="all">All</ToggleButton>
                            <ToggleButton value="mine">My Playlists</ToggleButton>
                            <ToggleButton value="others">Others</ToggleButton>
                        </ToggleButtonGroup>

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

                            
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box id="list-selector-list" sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            {listCard}
                            <MUIDeleteModal />
                        </Box>

                        {auth.loggedIn && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                sx={{
                                    alignSelf: 'center',
                                    mt: 3,
                                    px: 4,
                                    bgcolor: '#5e35b1',
                                    '&:hover': { bgcolor: '#4527a0' },
                                }}
                                onClick={handleCreateNewList}
                            >
                                New Playlist
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
            {store.workspaceOverlayActive && store.currentList && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 64,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        zIndex: 2000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        p: 4,
                    }}
                >
                    <WorkspaceScreen embedded />
                </Box>
            )}
            {store.playerOverlayActive && store.playerPlaylist && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 64,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        zIndex: 2100,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        p: 4,
                    }}
                >
                    <PlayPlaylistOverlay />
                </Box>
            )}
        </div>
    );
};

export default HomeScreen;
