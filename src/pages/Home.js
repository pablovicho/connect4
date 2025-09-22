import { useHistory } from "react-router-dom";
import Contact from "../components/Contact";
import "../styles/home.css";

export default function Home() {
    const history = useHistory();
  
    return (
      <div className="home-root">
        <div className="menu">
          <div className="title">
            <h1 className="titleName">Conecta 4</h1>
          </div>
          <img className="main-logo" src="/logo512.png" alt="logo" />
          <div className="menu-buttons">
              <button 
                className="btn btn-primary" 
                onClick={() => history.push('/single')}
                >
                Solitario
              </button>
              <button 
                className="btn btn-complimentary" 
                onClick={() => history.push('/create-game')}
                >
                Multijugador
              </button>
              <button 
                className="btn btn-about" 
                onClick={() => history.push('/about')}
                >
                Reglas del juego
              </button>
          </div>
          <Contact />
        </div>
      </div>
    );
  }