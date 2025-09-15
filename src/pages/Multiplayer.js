import useStore from "../utils/store";
import PlayerTurn from "../components/PlayerTurn";
import MatrixMulti from "../components/MatrixMulti";
import { useEffect } from "react";
import { PopUpMessage } from "../components/popUpMessage";
import { useParams } from "react-router-dom";

export default function Multiplayer() {
    const winner = useStore((state) => state.winner);
    const gameId = useStore((state) => state.gameId);
    const params = useParams();
    const thisGamePlayer = useStore((state) => state.thisGamePlayer);    
    
    useEffect(() => {
        // Set gameId from params if not already set (for player 2 joining via link)
        if (!gameId && params.gameId) {
            useStore.setState({gameId: params.gameId});
        }
        
        // Set player from localStorage if not set
        if(thisGamePlayer === null) {
            const storedPlayer = Number(localStorage.getItem('thisGamePlayer'));
            useStore.setState({thisGamePlayer: Number(storedPlayer)});
        }
    }, [gameId, params.gameId, thisGamePlayer]);
  
    return (
      <>
        <PlayerTurn />
        {winner > 0 && <PopUpMessage className="transition duration-300 ease-in-out" />}
        <MatrixMulti gameId={gameId} />
        <div className="title">
          <h1 className="titleName">Conecta 4</h1>
        </div>
      </>
    );
}
