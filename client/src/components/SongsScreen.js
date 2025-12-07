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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import SongCatalogCard from './SongCatalogCard';

const useSongCatalogEntries = (pairs, userEmail) =>
    useMemo(() => {
        const byKey = new Map();
        pairs.forEach((pair) => {
            const playlistListeners = pair.listenerCount || 0;
            const playlistId = pair._id;
            const isOwner = userEmail && pair.ownerEmail === userEmail;
            (pair.songs || []).forEach((song) => {
                const key = `${song.title || ''}||${song.artist || ''}||${song.year || ''}||${song.youTubeId || ''}`;
                if (!byKey.has(key)) {
                    byKey.set(key, {
                        song,
                        listeners: playlistListeners,
                        playlistIds: new Set([playlistId]),
                        ownerPlaylistIds: isOwner ? new Set([playlistId]) : new Set()
                    });
                } else {
                    const entry = byKey.get(key);
                    entry.listeners += playlistListeners;
                    entry.playlistIds.add(playlistId);
                    if (isOwner) entry.ownerPlaylistIds.add(playlistId);
                }
            });
        });
        return Array.from(byKey.values()).map((entry) => ({
            song: entry.song,
            listeners: entry.listeners,
            playlistCount: entry.playlistIds.size,
            playlistIds: Array.from(entry.playlistIds),
            ownerPlaylistIds: Array.from(entry.ownerPlaylistIds)
        }));
    }, [pairs, userEmail]);

const SongsScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const [titleFilter, setTitleFilter] = useState('');
    const [artistFilter, setArtistFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [snackbarState, setSnackbarState] = useState({ open: false, message: '', severity: 'success' });
    const [sortOption, setSortOption] = useState('listenersHigh');
    const [editDialogState, setEditDialogState] = useState({ open: false, entry: null, form: { title: '', artist: '', year: '', youTubeId: '' } });
    const [removeDialogState, setRemoveDialogState] = useState({ open: false, entry: null });
    const [newSongDialog, setNewSongDialog] = useState({ open: false, form: { title: '', artist: '', year: '', youTubeId: '' }, playlistId: '' });

    useEffect(() => {
        if (!store.idNamePairs.length) {
            store.loadIdNamePairs({ keepCurrentList: true });
        }
    }, [store.idNamePairs.length]);

    const userEmail = auth.user?.email || null;
    const songEntries = useSongCatalogEntries(store.idNamePairs, userEmail);

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

    const pushSnackbar = (message, severity = 'success') =>
        setSnackbarState({ open: true, message, severity });

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

    const handleEditSong = (entry) => {
        setEditDialogState({
            open: true,
            entry,
            form: {
                title: entry.song.title || '',
                artist: entry.song.artist || '',
                year: entry.song.year || '',
                youTubeId: entry.song.youTubeId || ''
            }
        });
    };

    const handleRemoveSong = (entry) => {
        setRemoveDialogState({ open: true, entry });
    };

    const closeEditDialog = () =>
        setEditDialogState({ open: false, entry: null, form: { title: '', artist: '', year: '', youTubeId: '' } });

    const closeRemoveDialog = () => setRemoveDialogState({ open: false, entry: null });

    const handleEditFieldChange = (field, value) =>
        setEditDialogState((prev) => ({ ...prev, form: { ...prev.form, [field]: value } }));

    const submitSongEdit = async () => {
        if (!editDialogState.entry) return;
        const result = await store.updateSongInPlaylists(
            editDialogState.entry.ownerPlaylistIds,
            editDialogState.entry.song,
            editDialogState.form
        );
        if (result?.success) {
            pushSnackbar(
                `Updated "${editDialogState.form.title}" in ${result.updatedCount} playlist${result.updatedCount === 1 ? '' : 's'}.`
            );
        } else {
            pushSnackbar(result?.error || 'Could not update song.', 'error');
        }
        closeEditDialog();
    };

    const confirmSongRemoval = async () => {
        if (!removeDialogState.entry) return;
        const result = await store.removeSongFromPlaylists(
            removeDialogState.entry.ownerPlaylistIds,
            removeDialogState.entry.song
        );
        if (result?.success) {
            pushSnackbar(
                `Removed "${removeDialogState.entry.song.title}" from ${result.updatedCount} playlist${result.updatedCount === 1 ? '' : 's'}.`
            );
        } else {
            pushSnackbar(result?.error || 'Could not remove song.', 'error');
        }
        closeRemoveDialog();
    };

    const clearFilters = () => {
        setTitleFilter('');
        setArtistFilter('');
        setYearFilter('');
    };

    const openNewSongDialog = () => {
        if (!canAddSongs) {
            pushSnackbar('Create or open one of your playlists before adding a new song.', 'info');
            return;
        }
        const defaultPlaylist = playlistOptions[0]?._id || '';
        setNewSongDialog({
            open: true,
            playlistId: defaultPlaylist,
            form: { title: '', artist: '', year: '', youTubeId: '' }
        });
    };

    const closeNewSongDialog = () =>
        setNewSongDialog({ open: false, playlistId: '', form: { title: '', artist: '', year: '', youTubeId: '' } });

    const handleNewSongField = (field, value) =>
        setNewSongDialog((prev) => ({ ...prev, form: { ...prev.form, [field]: value } }));

    const handleNewSongPlaylist = (value) => setNewSongDialog((prev) => ({ ...prev, playlistId: value }));

    const submitNewSong = async () => {
        const { form, playlistId } = newSongDialog;
        if (!playlistId) {
            pushSnackbar('Please choose a playlist for the new song.', 'warning');
            return;
        }
        const requiredFields = form.title.trim() && form.artist.trim();
        if (!requiredFields) {
            pushSnackbar('Title and Artist are required.', 'warning');
            return;
        }
        const songData = {
            title: form.title.trim(),
            artist: form.artist.trim(),
            year: form.year.trim(),
            youTubeId: form.youTubeId.trim()
        };
        const result = await store.addSongToPlaylist(playlistId, songData);
        if (result?.success) {
            pushSnackbar(`Created "${songData.title}" and added it to the selected playlist.`);
            closeNewSongDialog();
        } else {
            pushSnackbar('Could not create the song. Please try again.', 'error');
        }
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
                p: 4,
                overflow: 'hidden'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    maxWidth: 1200,
                    gap: 3,
                    height: 'calc(100vh - 160px)'
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
                        maxHeight: '100%',
                        overflowY: 'auto'
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
                        flexDirection: 'column',
                        maxHeight: '100%',
                        overflow: 'hidden'
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
                            filteredSongs.map((entry, index) => {
                                const { song, listeners, playlistCount, ownerPlaylistIds } = entry;
                                const canEditEntry = auth.loggedIn && ownerPlaylistIds.length > 0;
                                return (
                                <SongCatalogCard
                                    key={`${song.title}-${song.artist}-${index}`}
                                    song={song}
                                    listeners={listeners}
                                    playlistCount={playlistCount}
                                    playlists={playlistOptions}
                                    onAdd={(playlist) => handleSongAdd(song, playlist)}
                                    canAdd={canAddSongs}
                                    canEdit={canEditEntry}
                                    canRemove={canEditEntry}
                                    onEdit={canEditEntry ? () => handleEditSong(entry) : null}
                                    onRemove={canEditEntry ? () => handleRemoveSong(entry) : null}
                                />
                                );
                            })
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            sx={{ bgcolor: '#5e35b1', '&:hover': { bgcolor: '#4527a0' } }}
                            disabled={!auth.loggedIn}
                            onClick={openNewSongDialog}
                        >
                            New Song
                        </Button>
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

            <Dialog open={editDialogState.open} onClose={closeEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Song</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Title"
                        value={editDialogState.form.title}
                        onChange={(e) => handleEditFieldChange('title', e.target.value)}
                    />
                    <TextField
                        label="Artist"
                        value={editDialogState.form.artist}
                        onChange={(e) => handleEditFieldChange('artist', e.target.value)}
                    />
                    <TextField
                        label="Year"
                        value={editDialogState.form.year}
                        onChange={(e) => handleEditFieldChange('year', e.target.value)}
                    />
                    <TextField
                        label="YouTube ID"
                        value={editDialogState.form.youTubeId}
                        onChange={(e) => handleEditFieldChange('youTubeId', e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEditDialog}>Cancel</Button>
                    <Button variant="contained" onClick={submitSongEdit}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={removeDialogState.open} onClose={closeRemoveDialog}>
                <DialogTitle>Remove Song from Catalog</DialogTitle>
                <DialogContent>
                    <Typography>
                        This will remove "{removeDialogState.entry?.song.title}" from all of your playlists that contain it.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRemoveDialog}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={confirmSongRemoval}>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={newSongDialog.open} onClose={closeNewSongDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add a New Song</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Title"
                        value={newSongDialog.form.title}
                        onChange={(e) => handleNewSongField('title', e.target.value)}
                        required
                    />
                    <TextField
                        label="Artist"
                        value={newSongDialog.form.artist}
                        onChange={(e) => handleNewSongField('artist', e.target.value)}
                        required
                    />
                    <TextField
                        label="Year"
                        value={newSongDialog.form.year}
                        onChange={(e) => handleNewSongField('year', e.target.value)}
                    />
                    <TextField
                        label="YouTube ID"
                        value={newSongDialog.form.youTubeId}
                        onChange={(e) => handleNewSongField('youTubeId', e.target.value)}
                    />
                    <FormControl fullWidth>
                        <InputLabel id="new-song-playlist-label">Playlist</InputLabel>
                        <Select
                            labelId="new-song-playlist-label"
                            label="Playlist"
                            value={newSongDialog.playlistId}
                            onChange={(e) => handleNewSongPlaylist(e.target.value)}
                        >
                            {playlistOptions.map((option) => (
                                <MenuItem key={option._id} value={option._id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeNewSongDialog}>Cancel</Button>
                    <Button variant="contained" onClick={submitNewSong} disabled={!canAddSongs}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SongsScreen;
