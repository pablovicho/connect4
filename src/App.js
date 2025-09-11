import useStore from "./utils/store";

import "./App.css";

import { PopUpMessage } from "./components/popUpMessage";
import Restart from "./components/Restart";
import Contact from "./components/Contact";
import Matrix from "./components/Matrix";
import PlayerTurn from "./components/PlayerTurn";

//player 1 = 1
//player 2 = 2
//no player = 0
function App() {
  const winner = useStore((state) => state.winner);

  return (
    <main>
      <PlayerTurn />

      {winner > 0 && <PopUpMessage className="transition duration-300 ease-in-out " />}

      <Matrix />
      <div className="title">
        <h1 className="titleName">Conecta 4</h1>
      </div>
      <Restart />
      <Contact />
    </main>
  );
}

export default App;
