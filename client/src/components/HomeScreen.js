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
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const [nameFilter, setNameFilter] = useState('');
    const [ownerNameFilter, setOwnerNameFilter] = useState('');
    const [songTitleFilter, setSongTitleFilter] = useState('');
    const [songArtistFilter, setSongArtistFilter] = useState('');
    const [songYearFilter, setSongYearFilter] = useState('');
    const [ownerFilter, setOwnerFilter] = useState(auth.loggedIn ? 'mine' : 'all');
    const [sortOption, setSortOption] = useState('listenersHigh');

    useEffect(() => {
        store.loadIdNamePairs();
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
        setOwnerFilter(auth.loggedIn ? 'mine' : 'all');
    }

    useEffect(() => {
        setOwnerFilter(auth.loggedIn ? 'mine' : 'all');
    }, [auth.loggedIn]);

    const searchActive =
        nameFilter.trim() ||
        ownerNameFilter.trim() ||
        songTitleFilter.trim() ||
        songArtistFilter.trim() ||
        songYearFilter.trim();

    const sortComparators = {
        listenersHigh: (a, b) => (b.listenerCount || 0) - (a.listenerCount || 0),
        listenersLow: (a, b) => (a.listenerCount || 0) - (b.listenerCount || 0),
        nameAZ: (a, b) => a.name.localeCompare(b.name),
        nameZA: (a, b) => b.name.localeCompare(a.name),
        ownerAZ: (a, b) => (a.ownerName || a.ownerEmail || '').localeCompare(b.ownerName || b.ownerEmail || ''),
        ownerZA: (a, b) => (b.ownerName || b.ownerEmail || '').localeCompare(a.ownerName || a.ownerEmail || ''),
    };

    const sortOptionsList = [
        { value: 'listenersHigh', label: 'Listeners (Hi-Lo)' },
        { value: 'listenersLow', label: 'Listeners (Lo-Hi)' },
        { value: 'nameAZ', label: 'Playlist (A-Z)' },
        { value: 'nameZA', label: 'Playlist (Z-A)' },
        { value: 'ownerAZ', label: 'Owner (A-Z)' },
        { value: 'ownerZA', label: 'Owner (Z-A)' },
    ];

    const filteredPairs = [...store.idNamePairs]
        .filter((pair) =>
            pair.name.toLowerCase().includes(nameFilter.toLowerCase())
        )
        .filter((pair) => {
            const ownerDisplay =
                (pair.ownerName || pair.ownerEmail || '').toLowerCase();
            return ownerDisplay.includes(ownerNameFilter.toLowerCase());
        })
        .filter((pair) => {
            if (searchActive) return true;
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

            const matchesTitle =
                !titleFilter ||
                songs.some((song) =>
                    (song.title || '').toLowerCase().includes(titleFilter)
                );
            const matchesArtist =
                !artistFilter ||
                songs.some((song) =>
                    (song.artist || '').toLowerCase().includes(artistFilter)
                );
            const matchesYear =
                !yearFilter ||
                songs.some((song) =>
                    (song.year || '')
                        .toString()
                        .toLowerCase()
                        .includes(yearFilter)
                );
            return matchesTitle && matchesArtist && matchesYear;
        })
        .sort(sortComparators[sortOption] || sortComparators.listenersHigh);

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
                            InputProps={{
                                endAdornment: nameFilter ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setNameFilter('')}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                        />
                        <TextField
                            label="by User Name"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={ownerNameFilter}
                            onChange={(e) => setOwnerNameFilter(e.target.value)}
                            InputProps={{
                                endAdornment: ownerNameFilter ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setOwnerNameFilter('')}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                        />
                        <TextField
                            label="by Song Title"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={songTitleFilter}
                            onChange={(e) => setSongTitleFilter(e.target.value)}
                            InputProps={{
                                endAdornment: songTitleFilter ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSongTitleFilter('')}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                        />
                        <TextField
                            label="by Song Artist"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={songArtistFilter}
                            onChange={(e) => setSongArtistFilter(e.target.value)}
                            InputProps={{
                                endAdornment: songArtistFilter ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSongArtistFilter('')}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                        />
                        <TextField
                            label="by Song Year"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={songYearFilter}
                            onChange={(e) => setSongYearFilter(e.target.value)}
                            InputProps={{
                                endAdornment: songYearFilter ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSongYearFilter('')}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
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
                                startIcon={<SearchIcon />}
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
                                flexDirection: 'column',
                                gap: 1.5,
                                mb: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Sort:
                                    </Typography>
                                    <FormControl size="small" sx={{ minWidth: 170 }}>
                                        <InputLabel id="playlist-sort-label">Sort by</InputLabel>
                                        <Select
                                            labelId="playlist-sort-label"
                                            label="Sort by"
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                        >
                                            {sortOptionsList.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {filteredPairs.length}{' '}
                                    {filteredPairs.length === 1 ? 'Playlist' : 'Playlists'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                {[
                                    { value: 'mine', label: 'My Playlists', disabled: !auth.loggedIn },
                                    { value: 'others', label: 'Others', disabled: !auth.loggedIn },
                                    { value: 'all', label: 'All', disabled: false },
                                ].map((option) => (
                                    <Button
                                        key={option.value}
                                        variant={ownerFilter === option.value ? 'contained' : 'outlined'}
                                        sx={{
                                            textTransform: 'none',
                                            bgcolor: ownerFilter === option.value ? '#6a1b9a' : 'transparent',
                                            color: ownerFilter === option.value ? '#fff' : '#6a1b9a',
                                            borderColor: '#6a1b9a',
                                            '&:hover': {
                                                bgcolor: ownerFilter === option.value ? '#4a148c' : 'rgba(106,27,154,0.08)'
                                            }
                                        }}
                                        disabled={option.disabled}
                                        onClick={() => setOwnerFilter(option.value)}
                                    >
                                        {option.label}
                                    </Button>
                                ))}
                            </Box>

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
