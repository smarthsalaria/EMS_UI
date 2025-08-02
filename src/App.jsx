import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Login from './pages/Login';
import DashboardWrapper from './context/DashboardWrapper';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import SessionExpirePopup from './components/SessionExpirePopup'; // <- Make sure this is imported
import Home from './pages/Home';
import SLD from './pages/SLD';
import Alarms from './pages/Alarms';
import Analytics from './pages/Analytics';
import BESS from './pages/BESS';
import Modbus from './pages/Modbus';
import Network from './pages/Network';
import PCS from './pages/PCS';
import Reports from './pages/Reports';
import ContainerPage from './pages/BESSContainer';
import UserManagement from './pages/UserManagement';

const AppContent = () => {
  const { theme } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  

  return (
    <>
      <CssBaseline />
      
      {/* ✅ Always rendered on top-level, outside routes */}
      <SessionExpirePopup />
      
      <Routes>
        

        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardWrapper />}>
          <Route path="home" element={<Home />} />
          <Route path="sld" element={<SLD />} />
          <Route path="pcs" element={<PCS />} />
          <Route path="bess" element={<BESS />} />
            <Route path="/dashboard/BESS/:containerId" element={<ContainerPage />} />
          <Route path="network" element={<Network />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="alarms" element={<Alarms />} />
          <Route path="modbus" element={<Modbus />} />
          <Route path="usermanagement" element={<UserManagement />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;
