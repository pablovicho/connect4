import useStore from "../utils/store";
import PlayerTurn from "../components/PlayerTurn";
import { PopUpMessage } from "../components/popUpMessage";
import Matrix from "../components/Matrix";
import Restart from "../components/Restart";
import Return from '../components/Return';
import Contact from '../components/Contact';

export default function SinglePlayer() {
    const winner = useStore((state) => state.winner);
  
    return (
      <>
        <PlayerTurn />
        {winner > 0 && <PopUpMessage className="transition duration-300 ease-in-out" />}
        <Matrix />
        <div className="title">
          <Return />
          <h1 className="titleName">Conecta 4</h1>
        </div>
        <Restart />
      </>
    );
}
