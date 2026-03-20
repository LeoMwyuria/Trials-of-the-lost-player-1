import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BeeHiveGate from './pages/BeeHiveGate';
import LastHarvestPuzzle from './pages/LastHarvestPuzzle';
import LibraryGate from './pages/LibraryGate';
import EldenRingGate from './pages/EldenRingGate';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/gate-1-library" element={<LibraryGate />} />
        <Route path="/gate-2-hive" element={<BeeHiveGate />} />
        <Route path="/gate-3-the-last-harvest" element={<LastHarvestPuzzle />} />
        <Route path="/gate-4-elden-ring" element={<EldenRingGate />} />
      </Routes>
    </Router>
  );
}

export default App;
