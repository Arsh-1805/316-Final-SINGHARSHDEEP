import { useContext, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import SongCatalogCard from './SongCatalogCard';

const useSongCatalogEntries = (pairs) =>
    useMemo(() => {
        const byKey = new Map();
        pairs.forEach((pair) => {
            const playlistListeners = pair.listenerCount || 0;
            const playlistId = pair._id;
            (pair.songs || []).forEach((song) => {
                const key = `${song.title || ''}||${song.artist || ''}||${song.year || ''}||${song.youTubeId || ''}`;
                if (!byKey.has(key)) {
                    byKey.set(key, {
                        song,
                        listeners: playlistListeners,
                        playlistIds: new Set([playlistId])
                    });
                } else {
                    const entry = byKey.get(key);
                    entry.listeners += playlistListeners;
                    entry.playlistIds.add(playlistId);
                }
            });
        });
        return Array.from(byKey.values()).map((entry) => ({
            song: entry.song,
            listeners: entry.listeners,
            playlistCount: entry.playlistIds.size
        }));
    }, [pairs]);

const SongsScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const [titleFilter, setTitleFilter] = useState('');
    const [artistFilter, setArtistFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [snackbarState, setSnackbarState] = useState({ open: false, message: '', severity: 'success' });
    const [sortOption, setSortOption] = useState('listenersHigh');

    useEffect(() => {
        if (!store.idNamePairs.length) {
            store.loadIdNamePairs({ keepCurrentList: true });
        }
    }, [store.idNamePairs.length]);

    const songEntries = useSongCatalogEntries(store.idNamePairs);

    const sortComparators = {
        listenersHigh: (a, b) => (b.listeners || 0) - (a.listeners || 0),
        listenersLow: (a, b) => (a.listeners || 0) - (b.listeners || 0),
        titleAZ: (a, b) => (a.song.title || '').localeCompare(b.song.title || ''),
        titleZA: (a, b) => (b.song.title || '').localeCompare(a.song.title || ''),
        artistAZ: (a, b) => (a.song.artist || '').localeCompare(b.song.artist || ''),
        artistZA: (a, b) => (b.song.artist || '').localeCompare(a.song.artist || ''),
    };

    const sortOptionsList = [
        { value: 'listenersHigh', label: 'Listeners (Hi-Lo)' },
        { value: 'listenersLow', label: 'Listeners (Lo-Hi)' },
        { value: 'titleAZ', label: 'Title (A-Z)' },
        { value: 'titleZA', label: 'Title (Z-A)' },
        { value: 'artistAZ', label: 'Artist (A-Z)' },
        { value: 'artistZA', label: 'Artist (Z-A)' },
    ];

    const filteredSongs = useMemo(() => {
        const title = titleFilter.trim().toLowerCase();
        const artist = artistFilter.trim().toLowerCase();
        const year = yearFilter.trim().toLowerCase();

        return songEntries
            .filter(({ song }) => {
                const songTitle = (song.title || '').toLowerCase();
                const songArtist = (song.artist || '').toLowerCase();
                const songYear = (song.year || '').toString().toLowerCase();
                return (
                    (!title || songTitle.includes(title)) &&
                    (!artist || songArtist.includes(artist)) &&
                    (!year || songYear.includes(year))
                );
            })
            .sort(sortComparators[sortOption] || sortComparators.listenersHigh);
    }, [songEntries, titleFilter, artistFilter, yearFilter, sortOption]);

    const playlistOptions = useMemo(() => {
        if (!auth.loggedIn || !auth.user) return [];
        const recencyIndex = new Map(store.recentPlaylists.map((entry, index) => [entry._id, index]));
        return store.idNamePairs
            .filter((pair) => pair.ownerEmail === auth.user.email)
            .sort((a, b) => {
                const rankA = recencyIndex.has(a._id) ? recencyIndex.get(a._id) : Number.MAX_SAFE_INTEGER;
                const rankB = recencyIndex.has(b._id) ? recencyIndex.get(b._id) : Number.MAX_SAFE_INTEGER;
                if (rankA === rankB) {
                    return a.name.localeCompare(b.name);
                }
                return rankA - rankB;
            })
            .map((pair) => ({ _id: pair._id, name: pair.name }));
    }, [auth.loggedIn, auth.user, store.idNamePairs, store.recentPlaylists]);

    const canAddSongs = auth.loggedIn && playlistOptions.length > 0;

    const handleSongAdd = async (song, playlist) => {
        if (!canAddSongs) return;
        const result = await store.addSongToPlaylist(playlist._id, song);
        setSnackbarState({
            open: true,
            message: result?.success
                ? `Added "${song.title}" to ${playlist.name}`
                : 'Could not add song. Please try again.',
            severity: result?.success ? 'success' : 'error'
        });
    };

    const clearFilters = () => {
        setTitleFilter('');
        setArtistFilter('');
        setYearFilter('');
    };

    const renderTextField = (label, value, setter) => (
        <TextField
            label={label}
            variant="outlined"
            size="small"
            fullWidth
            value={value}
            onChange={(event) => setter(event.target.value)}
            InputProps={{
                endAdornment: value ? (
                    <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setter('')}>
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ) : null
            }}
        />
    );

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                bgcolor: '#ffe4ff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                p: 4
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    maxWidth: 1200,
                    gap: 3
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
                        gap: 2
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d100d1' }}>
                        Songs Catalog
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Search for songs by title, artist, or year. Use the action menu on each card to drop the song into one of your playlists.
                    </Typography>
                    {renderTextField('Song Title', titleFilter, setTitleFilter)}
                    {renderTextField('Song Artist', artistFilter, setArtistFilter)}
                    {renderTextField('Song Year', yearFilter, setYearFilter)}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            sx={{ bgcolor: '#6a1b9a', '&:hover': { bgcolor: '#4a148c' } }}
                        >
                            Search
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={clearFilters}
                            sx={{ color: '#6a1b9a', borderColor: '#6a1b9a' }}
                        >
                            Clear
                        </Button>
                    </Box>

                    {!auth.loggedIn && (
                        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                            Sign in to add songs to your playlists.
                        </Typography>
                    )}
                    {auth.loggedIn && playlistOptions.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Open or create a playlist first so it appears here for quick adding.
                        </Typography>
                    )}
                </Box>

                <Box
                    sx={{
                        flexGrow: 1,
                        bgcolor: '#fffbe6',
                        borderRadius: 2,
                        p: 3,
                        boxShadow: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Sort:
                            </Typography>
                            <FormControl size="small" sx={{ minWidth: 170 }}>
                                <InputLabel id="songs-sort-label">Sort by</InputLabel>
                                <Select
                                    labelId="songs-sort-label"
                                    label="Sort by"
                                    value={sortOption}
                                    onChange={(event) => setSortOption(event.target.value)}
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
                            {filteredSongs.length} {filteredSongs.length === 1 ? 'Song' : 'Songs'}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {filteredSongs.length === 0 ? (
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                                No songs match your filters. Try adjusting your search.
                            </Typography>
                        ) : (
                            filteredSongs.map(({ song, listeners, playlistCount }, index) => (
                                <SongCatalogCard
                                    key={`${song.title}-${song.artist}-${index}`}
                                    song={song}
                                    listeners={listeners}
                                    playlistCount={playlistCount}
                                    playlists={playlistOptions}
                                    onAdd={(playlist) => handleSongAdd(song, playlist)}
                                    canAdd={canAddSongs}
                                />
                            ))
                        )}
                    </Box>
                </Box>
            </Box>

            <Snackbar
                open={snackbarState.open}
                autoHideDuration={4000}
                onClose={() => setSnackbarState((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbarState((prev) => ({ ...prev, open: false }))}
                    severity={snackbarState.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SongsScreen;
