import { useContext, useState } from 'react';
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';

import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';

function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const [editActive, setEditActive] = useState(false);
    const [text, setText] = useState('');
    const { idNamePair } = props;

    const isOwner =
        auth.loggedIn &&
        auth.user &&
        idNamePair.ownerEmail &&
        idNamePair.ownerEmail === auth.user.email;

    function handleLoadList(event, id) {
        console.log('handleLoadList for ' + id);
        if (!event.target.disabled) {
            let _id = event.target.id;
            if (_id.indexOf('list-card-text-') >= 0)
                _id = ('' + _id).substring('list-card-text-'.length);

            console.log('load ' + event.target.id);

            store.setCurrentList(id);
        }
    }

    function handleToggleEdit(event) {
        event.stopPropagation();
        if (!isOwner) return; 
        toggleEdit();
    }

    function toggleEdit() {
        let newActive = !editActive;
        if (newActive) {
            store.setIsListNameEditActive();
        }
        setEditActive(newActive);
    }

    async function handleDeleteList(event, id) {
        event.stopPropagation();
        if (!isOwner) return; 
        store.markListForDeletion(id);
    }

    function handleKeyPress(event) {
        if (event.code === 'Enter') {
            let id = event.target.id.substring('list-'.length);
            store.changeListName(id, text);
            toggleEdit();
        }
    }
    function handleUpdateText(event) {
        setText(event.target.value);
    }

    let cardElement = (
        <ListItem
            id={idNamePair._id}
            key={idNamePair._id}
            sx={{
                borderRadius: '25px',
                p: '10px',
                bgcolor: '#8000F00F',
                marginTop: '15px',
                display: 'flex',
            }}
            style={{
                transform: 'translate(1%,0%)',
                width: '98%',
                fontSize: '48pt',
            }}
            button
            onClick={(event) => {
                handleLoadList(event, idNamePair._id);
            }}
        >
            <Box sx={{ p: 1, flexGrow: 1 }}>{idNamePair.name}</Box>

            {isOwner && (
                <Box sx={{ p: 1 }}>
                    <IconButton onClick={handleToggleEdit} aria-label="edit">
                        <EditIcon style={{ fontSize: '48pt' }} />
                    </IconButton>
                </Box>
            )}
            {isOwner && (
                <Box sx={{ p: 1 }}>
                    <IconButton
                        onClick={(event) => {
                            handleDeleteList(event, idNamePair._id);
                        }}
                        aria-label="delete"
                    >
                        <DeleteIcon style={{ fontSize: '48pt' }} />
                    </IconButton>
                </Box>
            )}
        </ListItem>
    );

    if (editActive) {
        cardElement = (
            <TextField
                margin="normal"
                required
                fullWidth
                id={'list-' + idNamePair._id}
                label="Playlist Name"
                name="name"
                autoComplete="Playlist Name"
                className="list-card"
                onKeyPress={handleKeyPress}
                onChange={handleUpdateText}
                defaultValue={idNamePair.name}
                inputProps={{ style: { fontSize: 48 } }}
                InputLabelProps={{ style: { fontSize: 24 } }}
                autoFocus
            />
        );
    }

    return cardElement;
}

export default PlaylistCard;
