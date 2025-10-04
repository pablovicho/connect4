import { useEffect, useCallback, useRef } from 'react';
import Circle from "./Circle";
import useStore from "../utils/store";
import column from "../utils/column";
import { supabase } from '../utils/supabaseClient';
import subscribeToGame from '../utils/subscribeToGame';
import matrixUpdated from '../utils/updateMatrix';

const MatrixMulti = ({ gameId }) => {
  const {winner, matrix, updateMatrix, changePlayer, checkWinner, player, thisGamePlayer} = useStore();
  const handleGameUpdate = useCallback((data) => {
    useStore.setState({ matrix: data.board, player: data.turn });
    checkWinner();
  }, [checkWinner]);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!gameId) {
      return;
    }
    let isMounted = true;
    let subscription = null;

    (async () => {
      try {
        const sub = await subscribeToGame(gameId, handleGameUpdate);
        if (!isMounted) {
          sub?.unsubscribe?.();
          return;
        }
        subscription = sub;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize subscription:', e);
      }
    })();
  
    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [gameId, handleGameUpdate]);

  const handleClick = async (e, row) => {
    e.preventDefault();
    if (player !== thisGamePlayer) return;
    // debounce
    if (isSubmittingRef.current) return;

    const col = column(matrix, row);
    // if column is full, return
    if(col.every((element) => element !== 0)) return;

    try {
      isSubmittingRef.current = true;

      // Update local state
      updateMatrix(col, player, row);
      const newMatrix = matrixUpdated(matrix, col, player, row);
      
      // Update server state
      const newPlayer = player === 1 ? 2 : 1;
      const { error } = await supabase
        .from('games')
        .update({ 
          board: newMatrix,
          turn: newPlayer,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error updating game:', error);
        return;
      } else {      
        // Update local player state
        changePlayer();
        checkWinner();
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  if(!matrix) return (
    <div className="matrix">
      <p>Loading...</p>
    </div>
  )

  return (
    <div className="matrix">
      {matrix
        .map((row, rowIndex) => {
          return row.map((element, colIndex) => {
            const isClickable = winner === 0 && player === thisGamePlayer && !isSubmittingRef.current;
            
            return (
              <div 
                key={`${rowIndex},${colIndex}`} 
                onClick={isClickable ? (e) => handleClick(e, colIndex) : undefined}
                style={{ 
                  cursor: isClickable ? 'pointer' : 'default',
                  opacity: isClickable ? 1 : 0.7
                }}
              >
                <Circle player={element} />
              </div>
            );
          });
        })
        .reverse()}
    </div>
  );
};

export default MatrixMulti;