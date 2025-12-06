import { useContext } from 'react'
import GlobalStoreContext from '../store';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

const style1 = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    bgcolor: 'background.paper',
    borderRadius: 2,
    p: 4,
    boxShadow: 24,
};

export default function MUIDeleteModal() {
    const { store } = useContext(GlobalStoreContext);
    let name = "";
    if (store.listMarkedForDeletion) {
        name = store.listMarkedForDeletion.name;
    }
    function handleDeleteList(event) {
        store.deleteMarkedList();
    }
    function handleCloseModal(event) {
        store.hideModals();
    }

    return (
        <Modal
        open={store.listMarkedForDeletion !== null}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style1}>
            <Typography sx={{fontWeight: 'bold', mb: 2}} id="modal-modal-title" variant="h5" component="h2">
                Delete Playlist
            </Typography>
            <Typography id="modal-modal-description" variant="body1" sx={{color: "text.secondary", mb: 3}}>
                Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={handleCloseModal}>Cancel</Button>
                <Button color="error" variant="contained" onClick={handleDeleteList}>Delete</Button>
            </Box>
        </Box>
    </Modal>
    );
}
