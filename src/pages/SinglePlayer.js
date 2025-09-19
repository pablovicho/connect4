import useStore from "../utils/store";
import PlayerTurn from "../components/PlayerTurn";
import { PopUpMessage } from "../components/popUpMessage";
import Matrix from "../components/Matrix";
import Restart from "../components/Restart";
import Return from '../components/Return';
import '../styles/board.css';

export default function SinglePlayer() {
    const winner = useStore((state) => state.winner);
    const resetMatrix = useStore((state) => state.resetMatrix);
    const resetPlayer = useStore((state) => state.resetPlayer);
    const resetWinner = useStore((state) => state.resetWinner);
    const player1Win = useStore((state) => state.player1Win);
    const player2Win = useStore((state) => state.player2Win);
    const handleReset = (e) => {
      e.preventDefault();
      if (winner === 1) player1Win();
      if (winner === 2) player2Win();
      resetMatrix();
      resetPlayer();
      resetWinner();
    };  
    return (
      <>
        <PlayerTurn />
        {winner > 0 && <PopUpMessage className="transition duration-300 ease-in-out" />}
        {winner > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
            <button className="btn btn-primary" onClick={handleReset}>
              Jugar de nuevo
            </button>
          </div>
        )}
        <Matrix />
        <div className="title">
          <Return />
          <h1 className="titleName">Conecta 4</h1>
        </div>
        {winner === 0 && (
          <Restart />
          )}
      </>
    );
}
