import { useContext } from 'react';
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import Button from '@mui/material/Button';

function SongCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const { song, index, readOnly } = props;  
    // readOnly is passed from WorkspaceScreen for guest mode

    const isGuest = readOnly || !auth.loggedIn;

    /** DRAG-DROP EVENTS — disabled for guests **/
    function handleDragStart(event) {
        if (isGuest) return;
        event.dataTransfer.setData("song", index);
    }

    function handleDragOver(event) {
        if (isGuest) return;
        event.preventDefault();
    }

    function handleDragEnter(event) {
        if (isGuest) return;
        event.preventDefault();
    }

    function handleDragLeave(event) {
        if (isGuest) return;
        event.preventDefault();
    }

    function handleDrop(event) {
        if (isGuest) return;
        event.preventDefault();
        let targetIndex = index;
        let sourceIndex = Number(event.dataTransfer.getData("song"));
        store.addMoveSongTransaction(sourceIndex, targetIndex);
    }

    /** DELETE SONG — disabled for guests **/
    function handleRemoveSong(event) {
        if (isGuest) return;
        store.addRemoveSongTransaction(song, index);
    }

    /** DOUBLE CLICK TO EDIT — disabled for guests **/
    function handleClick(event) {
        if (isGuest) return;

        if (event.detail === 2) {
            store.showEditSongModal(index, song);
        }
    }

    let cardClass = "list-card unselected-list-card";

    return (
        <div
            key={index}
            id={'song-' + index + '-card'}
            className={cardClass}
            draggable={!isGuest}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            style={{
                opacity: isGuest ? 0.9 : 1,
                cursor: isGuest ? "default" : "pointer",
            }}
        >
            {index + 1}.{" "}
            <a
                id={'song-' + index + '-link'}
                className="song-link"
                href={"https://www.youtube.com/watch?v=" + song.youTubeId}
                target="_blank"
                rel="noopener noreferrer"
            >
                {song.title} ({song.year}) by {song.artist}
            </a>

            {/* REMOVE BUTTON — HIDDEN for guests */}
            {!isGuest && (
                <Button
                    sx={{ transform: "translate(-5%, -5%)", width: "5px", height: "30px" }}
                    variant="contained"
                    id={"remove-song-" + index}
                    className="list-card-button"
                    onClick={handleRemoveSong}
                >
                    {"\u2715"}
                </Button>
            )}
        </div>
    );
}

export default SongCard;
