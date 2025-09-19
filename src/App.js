import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import "./styles/app.css";
import Contact from "./components/Contact";
import SinglePlayer from "./pages/SinglePlayer";
import Multiplayer from "./pages/Multiplayer";
import CreateGame from "./pages/CreateGame";
import JoinGame from "./pages/JoinGame";
import About from "./pages/About";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary fallback={<p>⚠️ Hubo un error al cargar la página</p>}>
    <Router>
      <main>
        <Switch>
          <Route exact path="/">
            <Home />
            <Contact />
          </Route>
          <Route path="/single" component={SinglePlayer} />
          <Route path="/create-game" component={CreateGame} />
          <Route path="/game/:gameId" component={Multiplayer} />
          <Route path="/join/:gameId" component={JoinGame} />
          <Route path="/about" component={About} />
        </Switch>
      </main>
    </Router>
    </ErrorBoundary>
  );
}

function Home() {
  const history = useHistory();

  return (
    <div className="menu">
      <div className="title">
        <h1 className="titleName">Conecta 4</h1>
      </div>
      <img src="/logo512.png" alt="logo" style={{ height: "20rem" }} />
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
  );
}

export default App;