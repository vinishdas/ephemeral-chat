// src/App.tsx
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { RoomProvider } from './RoomContext';
import LandingPage from './pages/LandingPage';
import ChatDashboardPage from './pages/ChatDashboardPage';
import { AnimatePresence, motion } from 'framer-motion'; // Import for animations

// Wrapper for page animations (simple fade + slight scale)
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.99 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.99 }}
    transition={{ duration: 0.2, ease: "easeInOut" }}
    // Ensures wrapper takes space and centers content
    className="w-full h-full flex items-center justify-center p-2 sm:p-4"
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <AppProvider>
      <RoomProvider>
        {/* Main app container - ensures full viewport coverage */}
        <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col">
          <AnimatePresence mode="wait" initial={false}>
            {/* Keyed Routes for transition */}
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={<PageWrapper><LandingPage /></PageWrapper>}
              />
              <Route
                path="/dashboard"
                // Dashboard needs specific layout, handle inside PageWrapper
                element={<PageWrapper><ChatDashboardPage /></PageWrapper>}
              />
            </Routes>
          </AnimatePresence>
        </div>
      </RoomProvider>
    </AppProvider>
  );
}

export default App;