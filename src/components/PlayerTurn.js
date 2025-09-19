import SmallCircle from "./SmallCircle"
import useStore from "../utils/store"
import '../styles/turn.css'

function PlayerTurn () {
    const player1 = useStore((state) => state.player1)
    const player2 = useStore((state) => state.player2)
    return(
        <div className="playerTurn">
        <div className="turn">
          <h1>Turno:</h1>
          <SmallCircle/>
        </div>
        <div style={{backgroundColor: 'var(--darker-aqua)', borderRadius: '0 10px 10px 0'}}>
          <h3 className="name" style={{marginBottom: '0px', marginLeft: '10px', marginRight: '10px'}}>Jugador 1: <span className="score">{player1}</span></h3>
          <h3 className="name" style={{marginTop: '0px', marginLeft: '10px', marginRight: '10px'}}>Jugador 2: <span className="score">{player2}</span></h3>
        </div>
      </div>
    )
}

export default PlayerTurn