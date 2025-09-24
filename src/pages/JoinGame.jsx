import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import joinGame from '../utils/joinGame';
import useStore from '../utils/store';

export default function JoinGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinExistingGame = async () => {
      try {
        await joinGame(gameId);
        setIsJoining(false);
        useStore.setState({thisGamePlayer: 2});
        // Automatically redirect to the game after a short delay, carry slot in query
        setTimeout(() => {
          navigate(`/game/${gameId}?p=2`);
        }, 2000);
      } catch (error) {
        // eslint-disable-next-line no-console
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
  }, [gameId, navigate]);

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