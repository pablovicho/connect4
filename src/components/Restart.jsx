import useStore from "../utils/store";

function Restart() {
  const resetPlayer = useStore((state) => state.resetPlayer);
  const resetWinner = useStore((state) => state.resetWinner);
  const resetMatrix = useStore((state) => state.resetMatrix);
  const player1Win = useStore((state) => state.player1Win);
  const player2Win = useStore((state) => state.player2Win);
  const winner = useStore((state) => state.winner);
  const resetScore = useStore((state) => state.resetScore)

  const Restart = (e) => {
    e.preventDefault();
    if (winner === 1) player1Win();
    if (winner === 2) player2Win();
    resetMatrix();
    resetPlayer();
    resetWinner();
  };

  return (
    <main style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '2rem'}}>
      <button className="btn btn-primary" onClick={(e) => Restart(e)}>
        Reiniciar
      </button>
      <button onClick={() => resetScore()}
      className="btn btn-secondary"
      >
        Borrar Puntaje
      </button>
    </main>
  );
}

export default Restart;
