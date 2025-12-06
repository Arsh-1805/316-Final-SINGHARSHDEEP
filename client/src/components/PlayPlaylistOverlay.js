import { useContext, useEffect, useRef, useState } from 'react';
import { GlobalStoreContext } from '../store';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

let youTubeAPIReadyPromise = null;
function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        return Promise.resolve(window.YT);
    }
    if (!youTubeAPIReadyPromise) {
        youTubeAPIReadyPromise = new Promise((resolve) => {
            const previous = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (previous) previous();
                resolve(window.YT);
            };
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
        });
    }
    return youTubeAPIReadyPromise;
}

const PlayPlaylistOverlay = () => {
    const { store } = useContext(GlobalStoreContext);
    const playlist = store.playerPlaylist;
    const playerContainerRef = useRef(null);
    const playerRef = useRef(null);
    const [playerReady, setPlayerReady] = useState(false);

    const songs = playlist?.songs || [];
    const currentSong = songs[store.playerSongIndex] || null;

    useEffect(() => {
        let mounted = true;
        if (!store.playerOverlayActive || !playlist) return undefined;
        loadYouTubeAPI().then((YT) => {
            if (!mounted || !playerContainerRef.current) return;
            playerRef.current = new YT.Player(playerContainerRef.current, {
                height: "390",
                width: "640",
                videoId: currentSong ? currentSong.youTubeId : "",
                events: {
                    onReady: () => {
                        if (!mounted) return;
                        setPlayerReady(true);
                        if (currentSong) {
                            playerRef.current.loadVideoById(currentSong.youTubeId);
                        }
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            store.playNextSong();
                        }
                    }
                },
                playerVars: {
                    autoplay: 1,
                    rel: 0,
                    modestbranding: 1
                }
            });
        });
        return () => {
            mounted = false;
            setPlayerReady(false);
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [store.playerOverlayActive, playlist]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!playerReady || !playerRef.current || !currentSong) return;
        playerRef.current.loadVideoById(currentSong.youTubeId);
    }, [playerReady, currentSong]);

    if (!store.playerOverlayActive || !playlist) {
        return null;
    }

    const handleSelectSong = (index) => {
        store.selectPlayerSong(index);
    };

    const handleClose = () => {
        store.closePlayerOverlay();
    };

    return (
        <Paper
            elevation={8}
            sx={{
                width: '100%',
                maxWidth: 1000,
                borderRadius: 4,
                overflow: 'hidden',
                backgroundColor: '#d6ffd6'
            }}
        >
            <Box sx={{ bgcolor: '#2ecc71', color: 'white', p: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Play Playlist
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, p: 3 }}>
                <Box
                    sx={{
                        flexBasis: '45%',
                        bgcolor: '#fff',
                        borderRadius: 3,
                        p: 2,
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#ff80ab', width: 56, height: 56 }}>
                            {playlist.name ? playlist.name[0].toUpperCase() : 'P'}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4a148c' }}>
                                {playlist.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {playlist.ownerEmail || 'Unknown Creator'}
                            </Typography>
                        </Box>
                    </Stack>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 360, overflowY: 'auto' }}>
                        {songs.map((song, index) => (
                            <Button
                                key={index}
                                variant={store.playerSongIndex === index ? 'contained' : 'outlined'}
                                color="secondary"
                                onClick={() => handleSelectSong(index)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    fontWeight: store.playerSongIndex === index ? 'bold' : 'normal',
                                    bgcolor: store.playerSongIndex === index ? '#f9dd8f' : '#fff',
                                    color: '#4a148c'
                                }}
                            >
                                {index + 1}. {song.title} ({song.year})
                            </Button>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box
                        sx={{
                            position: 'relative',
                            paddingTop: '56.25%',
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            backgroundColor: '#000'
                        }}
                    >
                        <Box
                            ref={playerContainerRef}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        />
                        {!currentSong && (
                            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Typography>No video to display</Typography>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <IconButton color="primary" onClick={store.playPreviousSong}>
                            <SkipPreviousIcon />
                        </IconButton>
                        <IconButton color="primary" onClick={store.playNextSong}>
                            <SkipNextIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" color="success" onClick={handleClose}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default PlayPlaylistOverlay;
