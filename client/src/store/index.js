import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {jsTPS} from "jstps"
import storeRequestSender from './requests'
import CreateSong_Transaction from '../transactions/CreateSong_Transaction'
import MoveSong_Transaction from '../transactions/MoveSong_Transaction'
import RemoveSong_Transaction from '../transactions/RemoveSong_Transaction'
import UpdateSong_Transaction from '../transactions/UpdateSong_Transaction'
import AuthContext from '../auth'

/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THIS IS THE CONTEXT WE'LL USE TO SHARE OUR STORE
export const GlobalStoreContext = createContext({});
console.log("create GlobalStoreContext");

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    REFRESH_ID_NAME_PAIRS: "REFRESH_ID_NAME_PAIRS",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    EDIT_SONG: "EDIT_SONG",
    REMOVE_SONG: "REMOVE_SONG",
    HIDE_MODALS: "HIDE_MODALS",
    SET_PLAYER_OVERLAY: "SET_PLAYER_OVERLAY",
    SET_PLAYER_SONG: "SET_PLAYER_SONG",
    CLOSE_PLAYER_OVERLAY: "CLOSE_PLAYER_OVERLAY",
    MARK_PLAYLIST_ACCESSED: "MARK_PLAYLIST_ACCESSED"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

const CurrentModal = {
    NONE : "NONE",
    DELETE_LIST : "DELETE_LIST",
    EDIT_SONG : "EDIT_SONG",
    ERROR : "ERROR"
}

const MAX_RECENT_PLAYLISTS = 8;

const sanitizeSongInput = (song = {}) => {
    const title = (song.title ?? '').toString().trim();
    const artist = (song.artist ?? '').toString().trim();
    const year = (song.year ?? '').toString().trim();
    const youTubeId = (song.youTubeId ?? '').toString().trim();
    return {
        title: title || 'Untitled',
        artist: artist || 'Unknown Artist',
        year,
        youTubeId
    };
};

const addPlaylistToRecents = (recents, playlist) => {
    if (!playlist || !playlist._id) return recents;
    const entry = {
        _id: playlist._id,
        name: playlist.name,
        ownerEmail: playlist.ownerEmail,
        ownerName: playlist.ownerName
    };
    const filtered = recents.filter((item) => item._id !== entry._id);
    filtered.unshift(entry);
    return filtered.slice(0, MAX_RECENT_PLAYLISTS);
};

const renameRecentPlaylist = (recents, playlist) => {
    if (!playlist || !playlist._id) return recents;
    return recents.map((entry) =>
        entry._id === playlist._id
            ? { ...entry, name: playlist.name }
            : entry
    );
};

const songsEqual = (a, b) => {
    if (!a || !b) return false;
    const norm = (value) => (value ?? '').toString().trim();
    return (
        norm(a.title) === norm(b.title) &&
        norm(a.artist) === norm(b.artist) &&
        norm(a.year) === norm(b.year) &&
        norm(a.youTubeId) === norm(b.youTubeId)
    );
};

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
function GlobalStoreContextProvider(props) {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        currentModal : CurrentModal.NONE,
        idNamePairs: [],
        currentList: null,
        currentSongIndex : -1,
        currentSong : null,
        newListCounter: 0,
        listNameActive: false,
        listIdMarkedForDeletion: null,
        listMarkedForDeletion: null,
        workspaceOverlayActive: false,
        playerOverlayActive: false,
        playerPlaylist: null,
        playerSongIndex: 0,
        recentPlaylists: []
    });
    const history = useHistory();

    console.log("inside useGlobalStore");

    // SINCE WE'VE WRAPPED THE STORE IN THE AUTH CONTEXT WE CAN ACCESS THE USER HERE
    const { auth } = useContext(AuthContext);
    console.log("auth: " + auth);

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        setStore((prevStore) => {
            switch (type) {
                case GlobalStoreActionType.CHANGE_LIST_NAME: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.NONE,
                        idNamePairs: payload.idNamePairs,
                        currentList: payload.playlist,
                        currentSongIndex: -1,
                        currentSong: null,
                        listNameActive: false,
                        listIdMarkedForDeletion: null,
                        listMarkedForDeletion: null,
                        recentPlaylists: renameRecentPlaylist(prevStore.recentPlaylists, payload.playlist)
                    };
                }
                case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.NONE,
                        currentList: null,
                        currentSongIndex: -1,
                        currentSong: null,
                        listNameActive: false,
                        listIdMarkedForDeletion: null,
                        listMarkedForDeletion: null,
                        workspaceOverlayActive: false
                    };
                }
                case GlobalStoreActionType.CREATE_NEW_LIST: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.NONE,
                        currentList: payload,
                        currentSongIndex: -1,
                        currentSong: null,
                        newListCounter: prevStore.newListCounter + 1,
                        listNameActive: false,
                        listIdMarkedForDeletion: null,
                        listMarkedForDeletion: null,
                        workspaceOverlayActive: false,
                        recentPlaylists: addPlaylistToRecents(prevStore.recentPlaylists, payload)
                    };
                }
                case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.NONE,
                        idNamePairs: payload,
                        currentList: null,
                        currentSongIndex: -1,
                        currentSong: null,
                        listNameActive: false,
                        listIdMarkedForDeletion: null,
                        listMarkedForDeletion: null,
                        workspaceOverlayActive: false
                    };
                }
                case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.DELETE_LIST,
                        currentList: null,
                        currentSongIndex: -1,
                        currentSong: null,
                        listNameActive: false,
                        listIdMarkedForDeletion: payload.id,
                        listMarkedForDeletion: payload.playlist,
                        workspaceOverlayActive: false
                    };
                }
                case GlobalStoreActionType.SET_CURRENT_LIST: {
                    const playlistData = payload.playlist ? payload.playlist : payload;
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.NONE,
                        currentList: playlistData,
                        currentSongIndex: -1,
                        currentSong: null,
                        listNameActive: false,
                        listIdMarkedForDeletion: null,
                        listMarkedForDeletion: null,
                        workspaceOverlayActive: !!payload.workspaceOverlayActive,
                        recentPlaylists: addPlaylistToRecents(prevStore.recentPlaylists, playlistData)
                    };
                }
                case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.NONE,
                        currentList: payload,
                        currentSongIndex: -1,
                        currentSong: null,
                        listNameActive: true,
                        listIdMarkedForDeletion: null,
                        listMarkedForDeletion: null
                    };
                }
                case GlobalStoreActionType.EDIT_SONG: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.EDIT_SONG,
                        currentSongIndex: payload.currentSongIndex,
                        currentSong: payload.currentSong,
                        listNameActive: false,
                        listIdMarkedForDeletion: null,
                        listMarkedForDeletion: null
                    };
                }
                case GlobalStoreActionType.REMOVE_SONG: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.NONE,
                        currentSongIndex: payload.currentSongIndex,
                        currentSong: payload.currentSong,
                        listNameActive: false,
                        listIdMarkedForDeletion: null,
                        listMarkedForDeletion: null
                    };
                }
                case GlobalStoreActionType.HIDE_MODALS: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.NONE,
                        currentSongIndex: -1,
                        currentSong: null,
                        listNameActive: false,
                        listIdMarkedForDeletion: null,
                        listMarkedForDeletion: null
                    };
                }
                case GlobalStoreActionType.REFRESH_ID_NAME_PAIRS: {
                    return {
                        ...prevStore,
                        currentModal: CurrentModal.NONE,
                        idNamePairs: payload
                    };
                }
                case GlobalStoreActionType.MARK_PLAYLIST_ACCESSED: {
                    return {
                        ...prevStore,
                        recentPlaylists: addPlaylistToRecents(prevStore.recentPlaylists, payload.playlist)
                    };
                }
                case GlobalStoreActionType.SET_PLAYER_OVERLAY: {
                    return {
                        ...prevStore,
                        playerOverlayActive: true,
                        playerPlaylist: payload.playlist,
                        playerSongIndex: payload.songIndex ?? 0
                    };
                }
                case GlobalStoreActionType.SET_PLAYER_SONG: {
                    return {
                        ...prevStore,
                        playerSongIndex: payload
                    };
                }
                case GlobalStoreActionType.CLOSE_PLAYER_OVERLAY: {
                    return {
                        ...prevStore,
                        playerOverlayActive: false,
                        playerPlaylist: null,
                        playerSongIndex: 0
                    };
                }
                default:
                    return prevStore;
            }
        });
    }

    store.tryAcessingOtherAccountPlaylist = function(){
        let id = "635f203d2e072037af2e6284";
        async function asyncSetCurrentList(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: { playlist, workspaceOverlayActive: false }
                });
            }
        }
        asyncSetCurrentList(id);
        history.push("/playlist/635f203d2e072037af2e6284");
    }

    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName, options = {}) {
        const { stayOnHome = false } = options;
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                playlist.name = newName;
                async function updateList(playlist) {
                    response = await storeRequestSender.updatePlaylistById(playlist._id, playlist);
                    if (response.data.success) {
                        async function getListPairs(playlist) {
                            response = await storeRequestSender.getPlaylistPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        playlist: playlist
                                    }
                                });
                                store.setCurrentList(id, { stayOnHome: stayOnHome || store.workspaceOverlayActive });
                            }
                        }
                        getListPairs(playlist);
                    }
                }
                updateList(playlist);
            }
        }
        asyncChangeListName(id);
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        const stayOnHome = store.workspaceOverlayActive;
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        tps.clearAllTransactions();
        history.push(stayOnHome ? "/playlists" : "/");
        store.loadIdNamePairs();
    }

    // THIS FUNCTION CREATES A NEW LIST
store.createNewList = async function () {
    // 1. make sure we actually have a logged-in user
    if (!auth.user || !auth.user.email) {
        console.error("No logged-in user, cannot create playlist.");
        return;
    }

    // 2. build the name the same way you had it
    let newListName = "Untitled" + store.newListCounter;

    // 3. call the request with the 3 params your store expects
    const response = await storeRequestSender.createPlaylist(
        newListName,
        [],                  // empty songs array to start
        auth.user.email      // owner
    );

    console.log("createNewList response:", response);

    // 4. same success check as you had
    if (response.status === 201 && response.data && response.data.playlist) {
        tps.clearAllTransactions();
        let newList = response.data.playlist;

        storeReducer({
            type: GlobalStoreActionType.CREATE_NEW_LIST,
            payload: newList
        });
        history.push("/playlist/" + newList._id);
        store.loadIdNamePairs({ keepCurrentList: true });
    }
    else {
        console.log("FAILED TO CREATE A NEW LIST");
    }
};

    store.duplicatePlaylist = function (id) {
        if (!auth.user || !auth.user.email) {
            console.error("No logged-in user, cannot duplicate playlist.");
            return;
        }
        async function asyncDuplicatePlaylist(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (!response.data.success) {
                response = await storeRequestSender.getSharedPlaylistById(id);
            }
            if (response.data && response.data.success) {
                const playlist = response.data.playlist;
                const baseName = playlist.name || "Untitled";
                const existingNames = new Set(
                    store.idNamePairs.map((pair) => pair.name.toLowerCase())
                );
                let copyName = `${baseName} Copy`;
                let suffix = 2;
                while (existingNames.has(copyName.toLowerCase())) {
                    copyName = `${baseName} Copy ${suffix++}`;
                }
                const createResponse = await storeRequestSender.createPlaylist(
                    copyName,
                    playlist.songs || [],
                    auth.user.email
                );
                if (createResponse.status === 201 && createResponse.data && createResponse.data.playlist) {
                    store.loadIdNamePairs({ keepCurrentList: true });
                }
            }
        }
        asyncDuplicatePlaylist(id);
    }

    store.addSongToPlaylist = function(playlistId, song) {
        async function asyncAdd(id, songData) {
            try {
                let response = await storeRequestSender.getPlaylistById(id);
                if (!response?.data?.success) {
                    return { success: false, error: 'Could not load playlist' };
                }
                const playlist = response.data.playlist;
        const sanitizedSong = sanitizeSongInput(songData);
        playlist.songs = Array.isArray(playlist.songs) ? playlist.songs : [];
        playlist.songs.push(sanitizedSong);

                const updateResponse = await storeRequestSender.updatePlaylistById(id, playlist);
                if (updateResponse?.data?.success) {
                    storeReducer({
                        type: GlobalStoreActionType.MARK_PLAYLIST_ACCESSED,
                        payload: { playlist }
                    });

                    if (store.currentList && store.currentList._id === id) {
                        storeReducer({
                            type: GlobalStoreActionType.SET_CURRENT_LIST,
                            payload: { playlist, workspaceOverlayActive: store.workspaceOverlayActive }
                        });
                    } else {
                        store.loadIdNamePairs({ keepCurrentList: true });
                    }
                    return { success: true };
                }
                return { success: false, error: 'Failed to update playlist' };
            } catch (err) {
                console.warn('addSongToPlaylist error:', err);
                return { success: false, error: 'Unexpected error' };
            }
        }
        return asyncAdd(playlistId, song);
    }

    async function loadPlaylistById(id) {
        let response = await storeRequestSender.getPlaylistById(id);
        if (response?.data?.success) return response.data.playlist;
        return null;
    }

    async function persistPlaylist(playlist) {
        const updateResponse = await storeRequestSender.updatePlaylistById(playlist._id, playlist);
        if (updateResponse?.data?.success) {
            if (store.currentList && store.currentList._id === playlist._id) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: { playlist, workspaceOverlayActive: store.workspaceOverlayActive }
                });
            }
            return true;
        }
        return false;
    }

    store.updateSongInPlaylists = async function(playlistIds = [], originalSong, updatedSong) {
        const uniqueIds = Array.from(new Set(playlistIds.filter(Boolean)));
        if (uniqueIds.length === 0) {
            return { success: false, error: 'No playlists to update.' };
        }
        let updatedCount = 0;
        const sanitizedUpdatedSong = sanitizeSongInput(updatedSong);
        for (const id of uniqueIds) {
            const playlist = await loadPlaylistById(id);
            if (!playlist) continue;
            let changed = false;
            playlist.songs = (playlist.songs || []).map((song) => {
                if (songsEqual(song, originalSong)) {
                    changed = true;
                    return { ...sanitizedUpdatedSong };
                }
                return song;
            });
            if (changed && (await persistPlaylist(playlist))) {
                updatedCount++;
            }
        }
        if (updatedCount > 0) {
            store.loadIdNamePairs({ keepCurrentList: true });
            return { success: true, updatedCount };
        }
        return { success: false, error: 'No matching songs were found.' };
    }

    store.removeSongFromPlaylists = async function(playlistIds = [], targetSong) {
        const uniqueIds = Array.from(new Set(playlistIds.filter(Boolean)));
        if (uniqueIds.length === 0) {
            return { success: false, error: 'No playlists to update.' };
        }
        let updatedCount = 0;
        for (const id of uniqueIds) {
            const playlist = await loadPlaylistById(id);
            if (!playlist) continue;
            const originalLength = playlist.songs ? playlist.songs.length : 0;
            playlist.songs = (playlist.songs || []).filter((song) => !songsEqual(song, targetSong));
            if (playlist.songs.length !== originalLength && (await persistPlaylist(playlist))) {
                updatedCount++;
            }
        }
        if (updatedCount > 0) {
            store.loadIdNamePairs({ keepCurrentList: true });
            return { success: true, updatedCount };
        }
        return { success: false, error: 'Song not found in your playlists.' };
    }

    store.openPlayerOverlay = function(playlist, songIndex = 0) {
        const sanitizedPlaylist = playlist
            ? {
                ...playlist,
                songs: (playlist.songs || []).map((song) => sanitizeSongInput(song))
            }
            : playlist;
        storeReducer({
            type: GlobalStoreActionType.SET_PLAYER_OVERLAY,
            payload: { playlist: sanitizedPlaylist, songIndex }
        });
    }

    store.closePlayerOverlay = function() {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_PLAYER_OVERLAY,
            payload: {}
        });
    }

    store.selectPlayerSong = function(index) {
        storeReducer({
            type: GlobalStoreActionType.SET_PLAYER_SONG,
            payload: index
        });
    }

    store.playNextSong = function() {
        if (!store.playerPlaylist || store.playerPlaylist.songs.length === 0) return;
        const nextIndex = (store.playerSongIndex + 1) % store.playerPlaylist.songs.length;
        store.selectPlayerSong(nextIndex);
    }

    store.playPreviousSong = function() {
        if (!store.playerPlaylist || store.playerPlaylist.songs.length === 0) return;
        const length = store.playerPlaylist.songs.length;
        const prevIndex = (store.playerSongIndex - 1 + length) % length;
        store.selectPlayerSong(prevIndex);
    }

    store.playPlaylist = function (id) {
        async function asyncPlay(playlistId) {
            let playlist = null;
            let response = await storeRequestSender.getPlaylistById(playlistId);
            if (response?.data?.success) {
                playlist = response.data.playlist;
            }
            else {
                response = await storeRequestSender.getSharedPlaylistById(playlistId);
                if (response?.data?.success) {
                    playlist = response.data.playlist;
                }
            }

            if (playlist) {
                store.openPlayerOverlay(playlist, 0);
                try {
                    const listenResponse = await storeRequestSender.incrementPlaylistListeners(playlistId);
                    if (listenResponse?.data?.success) {
                        store.loadIdNamePairs({ keepCurrentList: true });
                    }
                } catch (err) {
                    console.warn('Failed to increment playlist listeners', err);
                }
            }
        }
        asyncPlay(id);
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function (options = {}) {
        const { keepCurrentList = false } = options;
        async function asyncLoadIdNamePairs() {
            const response = await storeRequestSender.getPlaylistPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                console.log(pairsArray);
                storeReducer({
                    type: keepCurrentList ? GlobalStoreActionType.REFRESH_ID_NAME_PAIRS : GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }

    // THE FOLLOWING 5 FUNCTIONS ARE FOR COORDINATING THE DELETION
    // OF A LIST, WHICH INCLUDES USING A VERIFICATION MODAL. THE
    // FUNCTIONS ARE markListForDeletion, deleteList, deleteMarkedList,
    // showDeleteListModal, and hideDeleteListModal
    store.markListForDeletion = function (id) {
        async function getListToDelete(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                    payload: {id: id, playlist: playlist}
                });
            }
        }
        getListToDelete(id);
    }
    store.deleteList = function (id) {
        async function processDelete(id) {
            let response = await storeRequestSender.deletePlaylistById(id);
            store.loadIdNamePairs();
            if (response.data.success) {
                history.push("/");
            }
        }
        processDelete(id);
    }
    store.deleteMarkedList = function() {
        store.deleteList(store.listIdMarkedForDeletion);
        store.hideModals();
        
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST

    store.showEditSongModal = (songIndex, songToEdit) => {
        storeReducer({
            type: GlobalStoreActionType.EDIT_SONG,
            payload: {currentSongIndex: songIndex, currentSong: songToEdit}
        });        
    }
    store.hideModals = () => {
        auth.errorMessage = null;
        storeReducer({
            type: GlobalStoreActionType.HIDE_MODALS,
            payload: {}
        });    
    }
    store.isDeleteListModalOpen = () => {
        return store.currentModal === CurrentModal.DELETE_LIST;
    }
    store.isEditSongModalOpen = () => {
        return store.currentModal === CurrentModal.EDIT_SONG;
    }
    store.isErrorModalOpen = () => {
        return store.currentModal === CurrentModal.ERROR;
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id, options = {}) {
        const { stayOnHome = false } = options;
        async function asyncSetCurrentList(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;

                response = await storeRequestSender.updatePlaylistById(playlist._id, playlist);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: { playlist, workspaceOverlayActive: stayOnHome }
                    });
                    if (!stayOnHome) {
                        history.push("/playlist/" + playlist._id);
                    }
                }
            }
        }
        asyncSetCurrentList(id);
    }

    store.getPlaylistSize = function() {
        return store.currentList.songs.length;
    }
    store.addNewSong = function() {
        let index = this.getPlaylistSize();
        this.addCreateSongTransaction(index, "Untitled", "?", new Date().getFullYear(), "dQw4w9WgXcQ");
    }
    // THIS FUNCTION CREATES A NEW SONG IN THE CURRENT LIST
    // USING THE PROVIDED DATA AND PUTS THIS SONG AT INDEX
    store.createSong = function(index, song) {
        let list = store.currentList;      
        list.songs.splice(index, 0, song);
        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    store.moveSong = function(start, end) {
        let list = store.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    // THIS FUNCTION REMOVES THE SONG AT THE index LOCATION
    // FROM THE CURRENT LIST
    store.removeSong = function(index) {
        let list = store.currentList;      
        list.songs.splice(index, 1); 

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    // THIS FUNCTION UPDATES THE TEXT IN THE ITEM AT index TO text
    store.updateSong = function(index, songData) {
        let list = store.currentList;
        let song = list.songs[index];
        song.title = songData.title;
        song.artist = songData.artist;
        song.year = songData.year;
        song.youTubeId = songData.youTubeId;

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    store.addNewSong = () => {
        let playlistSize = store.getPlaylistSize();
        store.addCreateSongTransaction(
            playlistSize, "Untitled", "?", new Date().getFullYear(), "dQw4w9WgXcQ");
    }
    // THIS FUNCDTION ADDS A CreateSong_Transaction TO THE TRANSACTION STACK
    store.addCreateSongTransaction = (index, title, artist, year, youTubeId) => {
        // ADD A SONG ITEM AND ITS NUMBER
        let song = sanitizeSongInput({
            title: title,
            artist: artist,
            year: year,
            youTubeId: youTubeId
        });
        let transaction = new CreateSong_Transaction(store, index, song);
        tps.processTransaction(transaction);
    }    
    store.addMoveSongTransaction = function (start, end) {
        let transaction = new MoveSong_Transaction(store, start, end);
        tps.processTransaction(transaction);
    }
    // THIS FUNCTION ADDS A RemoveSong_Transaction TO THE TRANSACTION STACK
    store.addRemoveSongTransaction = (song, index) => {
        //let index = store.currentSongIndex;
        //let song = store.currentList.songs[index];
        let transaction = new RemoveSong_Transaction(store, index, song);
        tps.processTransaction(transaction);
    }
    store.addUpdateSongTransaction = function (index, newSongData) {
        let song = store.currentList.songs[index];
        let oldSongData = {
            title: song.title,
            artist: song.artist,
            year: song.year,
            youTubeId: song.youTubeId
        };
        const sanitizedNewSong = sanitizeSongInput(newSongData);
        let transaction = new UpdateSong_Transaction(this, index, oldSongData, sanitizedNewSong);        
        tps.processTransaction(transaction);
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await storeRequestSender.updatePlaylistById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: { playlist: store.currentList, workspaceOverlayActive: store.workspaceOverlayActive }
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }
    store.canAddNewSong = function() {
        return (store.currentList !== null);
    }
    store.canUndo = function() {
        return ((store.currentList !== null) && tps.hasTransactionToUndo());
    }
    store.canRedo = function() {
        return ((store.currentList !== null) && tps.hasTransactionToDo());
    }
    store.canClose = function() {
        return (store.currentList !== null);
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    function KeyPress(event) {
        if (!store.modalOpen && event.ctrlKey){
            if(event.key === 'z'){
                store.undo();
            } 
            if(event.key === 'y'){
                store.redo();
            }
        }
    }
  
    document.onkeydown = (event) => KeyPress(event);

    return (
        <GlobalStoreContext.Provider value={{
            store
        }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };
