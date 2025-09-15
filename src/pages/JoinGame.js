import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import joinGame from '../utils/joinGame';
import useStore from '../utils/store';

export default function JoinGame() {
  const { gameId } = useParams();
  const history = useHistory();
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinExistingGame = async () => {
      try {
        await joinGame(gameId);
        setIsJoining(false);
        useStore.setState({thisGamePlayer: 2});
        localStorage.setItem('thisGamePlayer', 2);
        // Automatically redirect to the game after a short delay
        setTimeout(() => {
          history.push(`/game/${gameId}`);
        }, 2000);
      } catch (error) {
        console.error('Error joining game:', error);
        setError('No se pudo unir al juego. El ID del juego podría ser inválido.');
        setIsJoining(false);
      }
    };

    if (gameId) {
      joinExistingGame();
    } else {
      setError('No se proporcionó un ID de juego válido');
      setIsJoining(false);
    }
  }, [gameId, history]);

  return (
    <div className="menu">
      <h2>Unirse a Juego</h2>
      {isJoining ? (
        <p>Uniéndose al juego...</p>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <p>¡Unido al juego exitosamente! Redirigiendo...</p>
      )}
    </div>
  );
}