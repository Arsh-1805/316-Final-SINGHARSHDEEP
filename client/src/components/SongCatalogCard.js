import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const SongCatalogCard = ({ song, playlists = [], onAdd, canAdd, listeners = 0, playlistCount = 0 }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const disabled = !canAdd;

    const handleOpenMenu = (event) => {
        if (disabled) return;
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => setAnchorEl(null);

    const handleSelectPlaylist = (playlist) => {
        if (!playlist) return;
        onAdd(playlist);
        handleCloseMenu();
    };

    const playlistsAvailable = playlists.length > 0;

    return (
        <Paper
            elevation={2}
            sx={{
                mb: 2,
                p: 2,
                borderRadius: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {song.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {song.artist}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#5e35b1' }}>
                        Listens: {Number(listeners || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Playlists: {playlistCount}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    {song.year && <Chip size="small" label={song.year} />}
                    {song.youTubeId && (
                        <IconButton
                            size="small"
                            component="a"
                            href={`https://www.youtube.com/watch?v=${song.youTubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <OpenInNewIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
            </Box>

            <Tooltip
                title={
                    disabled
                        ? 'Sign in and open a playlist to add songs'
                        : 'Add this song to one of your playlists'
                }
            >
                <span>
                    <IconButton
                        onClick={handleOpenMenu}
                        disabled={disabled}
                        sx={{ bgcolor: '#f3e5f5' }}
                    >
                        <MoreVertIcon />
                    </IconButton>
                </span>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                {playlistsAvailable ? (
                    playlists.map((playlist) => (
                        <MenuItem key={playlist._id} onClick={() => handleSelectPlaylist(playlist)}>
                            {playlist.name}
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>No playlists available</MenuItem>
                )}
            </Menu>
        </Paper>
    );
};

export default SongCatalogCard;
