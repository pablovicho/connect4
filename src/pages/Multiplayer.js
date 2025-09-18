import useStore from "../utils/store";
import PlayerTurn from "../components/PlayerTurn";
import MatrixMulti from "../components/MatrixMulti";
import { useEffect } from "react";
import { PopUpMessage } from "../components/popUpMessage";
import { useParams, useLocation } from "react-router-dom";
import Return from '../components/Return';
import { supabase } from "../utils/supabaseClient";

export default function Multiplayer() {
    const winner = useStore((state) => state.winner);
    const gameId = useStore((state) => state.gameId);
    const params = useParams();
    const location = useLocation();
    const thisGamePlayer = useStore((state) => state.thisGamePlayer);    

    // Store actions for reset
    const resetPlayer = useStore((state) => state.resetPlayer);
    const resetWinner = useStore((state) => state.resetWinner);
    const resetMatrix = useStore((state) => state.resetMatrix);
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
    
    useEffect(() => {
        if (!gameId && params.gameId) {
            useStore.setState({gameId: params.gameId});
        }
        
        // Derive player slot from query string (?p=1|2) when not set yet
        if (thisGamePlayer === null) {
            const search = new URLSearchParams(location.search);
            const p = Number(search.get('p'));
            if (p === 1 || p === 2) {
                useStore.setState({ thisGamePlayer: p });
            }
        }

        // Server-based fallback: if still not set and we have a gameId, infer open slot from players table
        if ((thisGamePlayer === null) && (params.gameId || gameId)) {
            (async () => {
                const gid = params.gameId || gameId;
                try {
                    const { data, error } = await supabase
                        .from('players')
                        .select('slot')
                        .eq('game_id', gid);
                    if (error) return;
                    const slots = (data || []).map(r => r.slot);
                    if (slots.length === 1) {
                        const taken = slots[0];
                        if (taken === 1) useStore.setState({ thisGamePlayer: 2 });
                        else if (taken === 2) useStore.setState({ thisGamePlayer: 1 });
                    }
                    else if (slots.length === 0) {
                        useStore.setState({ thisGamePlayer: 1 });
                    }
                } catch (_) {
                    // ignore
                }
            })();
        }
    }, [gameId, params.gameId, thisGamePlayer, location.search]);
  
    return (
      <>
        <PlayerTurn />
        {winner > 0 && <PopUpMessage className="transition duration-300 ease-in-out" />}
        {winner > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
            <button className="btn btn-secondary" onClick={handleReset}>
              Reiniciar
            </button>
          </div>
        )}
        <MatrixMulti gameId={gameId} />
        <div className="title">
          <Return />
          <h1 className="titleName">Conecta 4</h1>
        </div>
      </>
    );
}
