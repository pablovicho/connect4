import { useEffect, useRef, useState } from 'react';
import useStore from "../utils/store";

export function PopUpMessage() {
  const dialogRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const winner = useStore((state) => state.winner);
  const resetPlayer = useStore((state) => state.resetPlayer);
  const resetWinner = useStore((state) => state.resetWinner);
  const resetMatrix = useStore((state) => state.resetMatrix);
  const player1Win = useStore((state) => state.player1Win);
  const player2Win = useStore((state) => state.player2Win);

  useEffect(() => {
    if (winner > 0) {
      setIsOpen(true);
      const dialog = dialogRef.current;
      dialog.showModal();
    } else {
      setIsOpen(false);
    }
  }, [winner]);

  const handleClose = (e) => {
    e.preventDefault();
    if (winner === 1) player1Win();
    if (winner === 2) player2Win();
    resetMatrix();
    resetPlayer();
    resetWinner();
    setIsOpen(false);
    dialogRef.current?.close();
  };

  if (winner === 0) return null;

  return (
    <dialog 
      ref={dialogRef}
      className="dialog"
      open={isOpen}
    >
      <div className="dialog-content">
        <div className="dialog-header">
          <h2> ¡Jugador {winner} gana el juego!</h2>
        </div>
        <div className="dialog-body">
          <div className="">
            <div className="">
              🏆
            </div>
          </div>
        </div>
        <div className="dialog-footer">
          <button 
            onClick={(e) => handleClose(e)}
            className="btn btn-primary"
            autoFocus
          >
            Reiniciar
          </button>
        </div>
      </div>
    </dialog>
  );
}
