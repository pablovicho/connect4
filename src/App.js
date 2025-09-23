import { BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import Home from "./pages/Home";
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
          <Route exact path="/" component={Home} />
          <Route path="/single" component={SinglePlayer} />
          <Route path="/create-game" component={CreateGame} />
          <Route path="/game/:gameId" component={Multiplayer} />
          <Route path="/join/:gameId" component={JoinGame} />
          <Route path="/about" component={About} />
          <Redirect to="/" />
        </Switch>
      </main>
    </Router>
    </ErrorBoundary>
  );
}

export default App;