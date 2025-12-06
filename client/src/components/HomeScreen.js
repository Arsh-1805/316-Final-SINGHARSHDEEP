import { useContext, useEffect } from 'react';
import { GlobalStoreContext } from '../store';
import PlaylistCard from './PlaylistCard.js';
import MUIDeleteModal from './MUIDeleteModal';
import AuthContext from '../auth';

import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import Box from '@mui/material/Box';

const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        store.loadIdNamePairs();
    }, [store]);

    function handleCreateNewList() {
        if (!auth.loggedIn) return;
        store.createNewList();
    }

    let listCard = "";
    if (store) {
        listCard = (
            <List sx={{ width: '100%', bgcolor: 'background.paper', mb: '20px' }}>
                {store.idNamePairs.map((pair) => (
                    <PlaylistCard
                        key={pair._id}
                        idNamePair={pair}
                        selected={false}
                    />
                ))}
                {auth.loggedIn && (
                    <Fab
                        sx={{ transform: 'translate(1150%, 10%)' }}
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
            <div id="list-selector-heading">
                {auth.loggedIn && (
                    <Fab
                        sx={{ transform: 'translate(-20%, 0%)' }}
                        color="primary"
                        aria-label="add"
                        id="add-list-button"
                        onClick={handleCreateNewList}
                    >
                        <AddIcon />
                    </Fab>
                )}
                Your Playlists
            </div>
            <Box sx={{ bgcolor: 'background.paper' }} id="list-selector-list">
                {listCard}
                <MUIDeleteModal />
            </Box>
        </div>
    );
};

export default HomeScreen;
