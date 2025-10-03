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
        const result = await joinGame(gameId);
        setIsJoining(false);

        if (result?.role === 'player') {
          useStore.setState({ thisGamePlayer: result.slot });
          setTimeout(() => {
            navigate(`/game/${gameId}?p=${result.slot}`);
          }, 1000);
        } else {
          // Viewer: clear any prior player assignment and navigate with p=3 (spectator)
          useStore.setState({ thisGamePlayer: null });
          setTimeout(() => {
            navigate(`/game/${gameId}?p=3`);
          }, 1000);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error joining game:', error);
        setError('No se pudo unir al juego. El ID del juego podría ser inválido, o podría ya tener dos jugadores.');
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', marginBottom: '5rem', height: '100vh' }}>
        <img src="/logo192.png" width="100" height="100" alt="logo" />
        <div className="error">{error}</div>
        <button onClick={() => navigate('/')} className="btn btn-about">Volver al menú</button>
        </div>
      ) : (
        <p>¡Unido al juego exitosamente! Redirigiendo...</p>
      )}
    </div>
  );
}