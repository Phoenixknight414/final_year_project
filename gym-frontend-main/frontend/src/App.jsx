import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SetupProfilePage from './pages/SetupProfilePage.jsx';
import LiveWorkoutPage from './pages/LiveWorkoutPage.jsx';
import TrainerPage from './pages/TrainerPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup-profile" element={<SetupProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/trainer" element={<TrainerPage />} />
        <Route path="/live-workout" element={<LiveWorkoutPage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </Router>
  );
}