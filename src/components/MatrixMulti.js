import { useEffect, useCallback } from 'react';
import Circle from "./Circle";
import useStore from "../utils/store";
import column from "../utils/column";
import { supabase } from '../utils/supabaseClient';
import subscribeToGame from '../utils/subscribeToGame';
import matrixUpdated from '../utils/updateMatrix';

const MatrixMulti = ({ gameId }) => {
  const {winner, matrix, updateMatrix, changePlayer, checkWinner, player, thisGamePlayer} = useStore();
  const handleGameUpdate = useCallback((data) => {
    console.log('Updating matrix from subscription:', data);
    useStore.setState({ matrix: data.matrix });
    checkWinner();
  }, [checkWinner]);

  useEffect(() => {
    // Only set up subscription if we have both gameId and player info
    if (!gameId) {
      console.log('MatrixMulti: No gameId, skipping subscription');
      return;
    }
    
    if (thisGamePlayer === null) {
      console.log('MatrixMulti: No player info yet, will retry when available');
      return;
    }
    
    console.log(`MatrixMulti: Setting up subscription for gameId ${gameId}, player ${thisGamePlayer}`);
    const subscription = subscribeToGame(gameId, handleGameUpdate);
  
    return () => {
      console.log(`MatrixMulti: Cleaning up subscription for gameId ${gameId}`);
      subscription.unsubscribe();
    };
  }, [gameId, thisGamePlayer, handleGameUpdate]);

  const handleClick = async (e, row) => {
    e.preventDefault();
    // Only allow move if it's this player's turn
    if (player !== thisGamePlayer) return;
    
    const col = column(matrix, row);

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
      console.error('Error updating game:', error);
      return;
    } else {      
      // Update local player state
      changePlayer();
      checkWinner();
    }
  };

  return (
    <div className="matrix">
      {matrix
        .map((row, rowIndex) => {
          return row.map((element, colIndex) => {
            const isClickable = winner === 0 && player === thisGamePlayer;
            
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