import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import createGame from '../utils/createGame';
import '../styles/createGame.css';

export default function CreateGame() {
  const history = useHistory();
  const [gameId, setGameId] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const createNewGame = async () => {
      try {
        const newGameId = await createGame();
        setGameId(newGameId);
        const gameUrl = `${window.location.origin}/join/${newGameId}`;
        await navigator.clipboard.writeText(gameUrl);
        setIsCopied(true);
      } catch (error) {
        console.error('Error creating game:', error);
      }
    };
    
    createNewGame();
  }, []);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleStartGame = () => {
    history.push(`/game/${gameId}?p=1`);
  };

  return (
    <div className="menu">
        <div className="title">
            <h1 className="titleName">Conecta 4</h1>
        </div>
        <img src="/logo512.png" alt="logo" style={{ height: "12rem" }} />
      {gameId ? (
        <div className="new-game-container">
          <p>¡Juego creado exitosamente!</p>
          <p>Comparte este enlace con tu amigo/a:</p>
          <div className="game-link">
            <button className="btn btn-primary standard-width" onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/join/${gameId}`);
              setIsCopied(true);
            }}>
              Copiar enlace
            </button>
            {isCopied && (
              <span className="copy-tooltip">¡Enlace copiado!</span>
            )}
          </div>
          <button className="btn btn-complimentary standard-width" onClick={handleStartGame}>
            Iniciar Juego
          </button>
        </div>
      ) : (
        <div className="new-game-container">
          <p>Creando juego...</p>
        </div>
      )}
    </div>
  );
}