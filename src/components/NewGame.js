
import createGame from "../utils/createGame";
import joinGame from "../utils/joinGame";
import { useParams, useHistory } from "react-router-dom";

export default function NewGame() {
    const params = useParams();
    const gameId = params?.gameId;
    const history = useHistory();

    const handleCreateGame = (e) => {
        e.preventDefault();

        if (gameId) {
            alert("¡Iniciar juego!");
            joinGame(gameId);
            history.push("/multiplayer/" + gameId);
        } else {
            const gameId = createGame();
            const url = window.location.href + "/" + gameId;
            navigator.clipboard.writeText(url);
            alert("Juego creado. ¡Invita a tu amigo con el vínculo copiado!");
            history.push("/multiplayer/" + gameId);
        }
    }

    return (
        <button className="btn btn-primary" onClick={(e) => handleCreateGame(e)}>Iniciar juego</button>
    );
}