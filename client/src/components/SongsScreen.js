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
import Modal from '@mui/material/Modal';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import SongCatalogCard from './SongCatalogCard';
import { normalizeYouTubeId } from '../utils/youtube';

const buildSongCatalogKey = (song) => {
    if (!song) return '';
    const normalize = (value) => (value || '').toString().trim().toLowerCase();
    return `${normalize(song.title)}||${normalize(song.artist)}||${normalize(song.year)}`;
};
const useSongCatalogEntries = (pairs, userEmail) =>
    useMemo(() => {
        const byKey = new Map();
        pairs.forEach((pair) => {
            const playlistListeners = pair.listenerCount || 0;
            const playlistId = pair._id;
            const isOwner = userEmail && pair.ownerEmail === userEmail;
            (pair.songs || []).forEach((song) => {
                const key = buildSongCatalogKey(song);
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

    const emptySongForm = () => ({ title: '', artist: '', year: '', youTubeId: '' });

    const [titleFilter, setTitleFilter] = useState('');
    const [artistFilter, setArtistFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [snackbarState, setSnackbarState] = useState({ open: false, message: '', severity: 'success' });
    const [sortOption, setSortOption] = useState('listenersHigh');
    const [editDialogState, setEditDialogState] = useState({ open: false, entry: null, form: emptySongForm() });
    const [removeDialogState, setRemoveDialogState] = useState({ open: false, entry: null });
    const [newSongDialog, setNewSongDialog] = useState({ open: false, form: emptySongForm() });
    const [selectedSongKey, setSelectedSongKey] = useState(null);
    const formIsComplete = (form) =>
        ['title', 'artist', 'year', 'youTubeId'].every(
            (field) => (form[field] ?? '').toString().trim().length > 0
        );
    const isEditFormComplete = formIsComplete(editDialogState.form);
    const isNewSongFormComplete = formIsComplete(newSongDialog.form);

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
        playlistsHigh: (a, b) => (b.playlistCount || 0) - (a.playlistCount || 0),
        playlistsLow: (a, b) => (a.playlistCount || 0) - (b.playlistCount || 0),
        titleAZ: (a, b) => (a.song.title || '').localeCompare(b.song.title || ''),
        titleZA: (a, b) => (b.song.title || '').localeCompare(a.song.title || ''),
        artistAZ: (a, b) => (a.song.artist || '').localeCompare(b.song.artist || ''),
        artistZA: (a, b) => (b.song.artist || '').localeCompare(a.song.artist || ''),
        yearHigh: (a, b) => Number(b.song.year || 0) - Number(a.song.year || 0),
        yearLow: (a, b) => Number(a.song.year || 0) - Number(b.song.year || 0)
    };

    const sortOptionsList = [
        { value: 'listenersHigh', label: 'Listeners (Hi-Lo)' },
        { value: 'listenersLow', label: 'Listeners (Lo-Hi)' },
        { value: 'playlistsHigh', label: 'Playlists (Hi-Lo)' },
        { value: 'playlistsLow', label: 'Playlists (Lo-Hi)' },
        { value: 'titleAZ', label: 'Title (A-Z)' },
        { value: 'titleZA', label: 'Title (Z-A)' },
        { value: 'artistAZ', label: 'Artist (A-Z)' },
        { value: 'artistZA', label: 'Artist (Z-A)' },
        { value: 'yearHigh', label: 'Year (Hi-Lo)' },
        { value: 'yearLow', label: 'Year (Lo-Hi)' },
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

    const catalogKeySet = useMemo(
        () => new Set(songEntries.map((entry) => buildSongCatalogKey(entry.song))),
        [songEntries]
    );

    const selectedEntry = useMemo(() => {
        if (!selectedSongKey) return null;
        return songEntries.find((entry) => buildSongCatalogKey(entry.song) === selectedSongKey) || null;
    }, [songEntries, selectedSongKey]);

    const previewVideoId = selectedEntry ? normalizeYouTubeId(selectedEntry.song.youTubeId) : '';

    useEffect(() => {
        if (!filteredSongs.length) {
            setSelectedSongKey(null);
            return;
        }
        const stillVisible = filteredSongs.some(
            (entry) => buildSongCatalogKey(entry.song) === selectedSongKey
        );
        if (!stillVisible) {
            setSelectedSongKey(buildSongCatalogKey(filteredSongs[0].song));
        }
    }, [filteredSongs, selectedSongKey]);

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
        setEditDialogState({ open: false, entry: null, form: emptySongForm() });

    const closeRemoveDialog = () => setRemoveDialogState({ open: false, entry: null });

    const handleEditFieldChange = (field, value) =>
        setEditDialogState((prev) => ({ ...prev, form: { ...prev.form, [field]: value } }));

    const submitSongEdit = async () => {
        if (!editDialogState.entry || !isEditFormComplete) return;
        const trimmed = {
            title: editDialogState.form.title.trim(),
            artist: editDialogState.form.artist.trim(),
            year: editDialogState.form.year.trim(),
            youTubeId: editDialogState.form.youTubeId.trim()
        };
        const result = await store.updateSongInPlaylists(
            editDialogState.entry.ownerPlaylistIds,
            editDialogState.entry.song,
            trimmed
        );
        if (result?.success) {
            pushSnackbar(
                `Updated "${trimmed.title}" in ${result.updatedCount} playlist${result.updatedCount === 1 ? '' : 's'}.`
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
        setNewSongDialog({
            open: true,
            form: emptySongForm()
        });
    };

    const closeNewSongDialog = () =>
        setNewSongDialog({ open: false, form: emptySongForm() });

    const handleNewSongField = (field, value) =>
        setNewSongDialog((prev) => ({ ...prev, form: { ...prev.form, [field]: value } }));

    const submitNewSong = async () => {
        if (!canAddSongs) {
            pushSnackbar('Create or open one of your playlists before adding a new song.', 'info');
            return;
        }
        const targetPlaylist = playlistOptions[0];
        if (!targetPlaylist) {
            pushSnackbar('No playlist available to store this song yet.', 'warning');
            return;
        }

        const { form } = newSongDialog;
        const trimmed = {
            title: form.title.trim(),
            artist: form.artist.trim(),
            year: form.year.trim(),
            youTubeId: form.youTubeId.trim()
        };
        const requiredFields = trimmed.title && trimmed.artist && trimmed.year && trimmed.youTubeId;
        if (!requiredFields) {
            pushSnackbar('Please provide Title, Artist, Year, and a YouTube link.', 'warning');
            return;
        }

        const newKey = buildSongCatalogKey(trimmed);
        if (catalogKeySet.has(newKey)) {
            pushSnackbar('A song with that Title, Artist, and Year already exists.', 'warning');
            return;
        }
        const result = await store.addSongToPlaylist(targetPlaylist._id, trimmed);
        if (result?.success) {
            pushSnackbar(`Created "${trimmed.title}" and stored it with ${targetPlaylist.name}.`);
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

                    <Divider sx={{ my: 2 }} />
                    <Box
                        sx={{
                            minHeight: 220,
                            borderRadius: 2,
                            bgcolor: '#f3e5f5',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#6a1b9a' }}>
                            Song
                        </Typography>
                        {previewVideoId ? (
                            <Box
                                sx={{
                                    position: 'relative',
                                    paddingBottom: '56.25%',
                                    height: 0,
                                    width: '100%',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    boxShadow: 1
                                }}
                                >
                                    <iframe
                                        title={`${selectedEntry.song.title} preview`}
                                        src={`https://www.youtube.com/embed/${previewVideoId}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%'
                                    }}
                                />
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Select a song with a YouTube link to preview it here.
                            </Typography>
                        )}
                    </Box>
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
                                const entryKey = buildSongCatalogKey(entry.song);
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
                                    isSelected={entryKey === selectedSongKey}
                                    onSelect={() => setSelectedSongKey(entryKey)}
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

            <SongMetadataModal
                open={editDialogState.open}
                heading="Edit Song"
                form={editDialogState.form}
                onFieldChange={handleEditFieldChange}
                onCancel={closeEditDialog}
                onConfirm={submitSongEdit}
                confirmDisabled={!isEditFormComplete}
            />

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

            <SongMetadataModal
                open={newSongDialog.open}
                heading="Add Song to Catalog"
                form={newSongDialog.form}
                onFieldChange={handleNewSongField}
                onCancel={closeNewSongDialog}
                onConfirm={submitNewSong}
                confirmDisabled={!isNewSongFormComplete || !canAddSongs}
                helperText={
                    playlistOptions[0]
                        ? `New entries are staged with "${playlistOptions[0].name}" so they appear in your catalog.`
                        : 'Open or create a playlist first so we can store catalog entries.'
                }
            />
        </Box>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    bgcolor: '#d8ffd8',
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
};

const SongMetadataModal = ({
    open,
    heading,
    form,
    onFieldChange,
    onCancel,
    onConfirm,
    confirmDisabled,
    helperText
}) => (
    <Modal open={open} onClose={onCancel}>
        <Box sx={modalStyle}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4a148c' }}>
                {heading}
            </Typography>
            <Divider sx={{ my: 2, borderBottomWidth: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Title"
                    value={form.title}
                    onChange={(event) => onFieldChange('title', event.target.value)}
                    autoFocus
                />
                <TextField
                    label="Artist"
                    value={form.artist}
                    onChange={(event) => onFieldChange('artist', event.target.value)}
                />
                <TextField
                    label="Year"
                    value={form.year}
                    onChange={(event) => onFieldChange('year', event.target.value)}
                />
                <TextField
                    label="YouTube Id or Link"
                    value={form.youTubeId}
                    onChange={(event) => onFieldChange('youTubeId', event.target.value)}
                />
            </Box>
            {helperText && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {helperText}
                </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={confirmDisabled}
                    sx={{
                        bgcolor: confirmDisabled ? '#cfcfcf' : '#2e7d32',
                        color: confirmDisabled ? '#777' : '#fff',
                        fontWeight: 'bold'
                    }}
                >
                    Complete
                </Button>
                <Button variant="outlined" onClick={onCancel} sx={{ borderColor: '#4a148c', color: '#4a148c' }}>
                    Cancel
                </Button>
            </Box>
        </Box>
    </Modal>
);

export default SongsScreen;
