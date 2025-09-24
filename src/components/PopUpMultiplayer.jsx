import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/dialog.css";

export function PopUpMultiplayer({ gameId }) {
  const dialogRef = useRef(null);
  const [isOpen, setIsOpen] = useState(true)
  const message = gameId ? "Comparte el vínculo con tu amigo/a para iniciar el juego" : "Iniciar juego";
  const url = window.location.href + "/multiplayer/" + gameId;
  const navigate = useNavigate();

  const handleClose = (e) => {
    e.preventDefault();
    navigate("/multiplayer/" + gameId);
    setIsOpen(false);
    dialogRef.current?.close();
  };

  return (
    <dialog 
      ref={dialogRef}
      className="dialog"
    >
      <div className="dialog-content">
        <div className="dialog-header">
          <h2> {message}</h2>
        </div>
        <div className="dialog-body">
          <div className="">
            <button className="no-style" onClick={() => navigator.clipboard.writeText(url)}>
              {url}
            </button>
          </div>
        </div>
        <div className="dialog-footer">
          <button 
            onClick={(e) => handleClose(e)}
            className="btn btn-primary"
            autoFocus
          >
            Iniciar
          </button>
        </div>
      </div>
    </dialog>
  );
}
