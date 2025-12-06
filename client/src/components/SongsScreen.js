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

import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import SongCatalogCard from './SongCatalogCard';

const useUniqueSongList = (pairs) =>
    useMemo(() => {
        const byKey = new Map();
        pairs.forEach((pair) => {
            (pair.songs || []).forEach((song) => {
                const key = `${song.title || ''}||${song.artist || ''}||${song.year || ''}||${song.youTubeId || ''}`;
                if (!byKey.has(key)) {
                    byKey.set(key, song);
                }
            });
        });
        return Array.from(byKey.values());
    }, [pairs]);

const SongsScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const [titleFilter, setTitleFilter] = useState('');
    const [artistFilter, setArtistFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [snackbarState, setSnackbarState] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (!store.idNamePairs.length) {
            store.loadIdNamePairs({ keepCurrentList: true });
        }
    }, [store.idNamePairs.length]);

    const allSongs = useUniqueSongList(store.idNamePairs);

    const filteredSongs = useMemo(() => {
        const title = titleFilter.trim().toLowerCase();
        const artist = artistFilter.trim().toLowerCase();
        const year = yearFilter.trim().toLowerCase();

        return allSongs
            .filter((song) => {
                const songTitle = (song.title || '').toLowerCase();
                const songArtist = (song.artist || '').toLowerCase();
                const songYear = (song.year || '').toString().toLowerCase();
                return (
                    (!title || songTitle.includes(title)) &&
                    (!artist || songArtist.includes(artist)) &&
                    (!year || songYear.includes(year))
                );
            })
            .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }, [allSongs, titleFilter, artistFilter, yearFilter]);

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
                        <Typography variant="h6">Results</Typography>
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
                            filteredSongs.map((song, index) => (
                                <SongCatalogCard
                                    key={`${song.title}-${song.artist}-${index}`}
                                    song={song}
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
