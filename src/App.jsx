import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/single" element={<SinglePlayer />} />
          <Route path="/create-game" element={<CreateGame />} />
          <Route path="/game/:gameId" element={<Multiplayer />} />
          <Route path="/join/:gameId" element={<JoinGame />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
    </ErrorBoundary>
  );
}

export default App;