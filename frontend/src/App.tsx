// src/App.tsx
import './App.css'
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { RoomProvider } from './RoomContext';
import LandingPage from './pages/LandingPage';
import ChatDashboardPage from './pages/ChatDashboardPage';

function App() {
  return (
    <AppProvider>
      <RoomProvider>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ChatDashboardPage />} />
          </Routes>
        </div>
      </RoomProvider>
    </AppProvider>
  )
}

export default App