import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import SongCard from './SongCard.js';
import MUIEditSongModal from './MUIEditSongModal';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';

function WorkspaceScreen() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    store.history = useHistory();

    const isGuest = !auth.loggedIn;

    let modalJSX = "";
    if (!isGuest && store.isEditSongModalOpen()) {
        modalJSX = <MUIEditSongModal />;
    }

    return (
        <Box id="list-selector-list">
            <List
                id="playlist-cards"
                sx={{
                    overflow: "scroll",
                    height: "87%",
                    width: "100%",
                    bgcolor: "#8000F00F",
                }}
            >
                {store.currentList.songs.map((song, index) => (
                    <SongCard
                        id={'playlist-song-' + index}
                        key={'playlist-song-' + index}
                        index={index}
                        song={song}
                        readOnly={isGuest}   
                    />
                ))}
            </List>

            {modalJSX}
        </Box>
    );
}

export default WorkspaceScreen;
