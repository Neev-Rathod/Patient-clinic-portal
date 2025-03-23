import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import ClinicLogin from './components/ClinicLogin';
import ClinicRegister from './components/ClinicRegister';
import Chat from './components/Chat';
import ClinicDashboard from './components/ClinicDashboard';
import ClinicAnalytics from './components/ClinicAnalytics';

function ProtectedRoute({ children, clinicOnly = false }) {
  // If clinicOnly is true, require clinicToken; otherwise, require either token.
  if (clinicOnly) {
    const clinicToken = localStorage.getItem('clinicToken');
    if (!clinicToken) {
      return <Navigate to='/' replace />;
    }
  } else {
    const token = localStorage.getItem('token') || localStorage.getItem('clinicToken');
    if (!token) {
      return <Navigate to='/' replace />;
    }
  }
  return children;
}

// A component to wrap routes that need to conditionally show the Navbar.
const Layout = ({ children }) => {
  const location = useLocation();
  // Define routes where you don't want to show the Navbar.
  const noNavbarRoutes = ['/chat', '/clinic/chats', '/clinic/analytics'];
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <div className="">
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/clinic/login" element={<ClinicLogin />} />
          <Route path="/clinic/register" element={<ClinicRegister />} />
          {/* Patient chat page without Navbar */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          {/* Clinic dashboard pages without Navbar */}
          <Route path="/clinic/chats" element={
            <ProtectedRoute clinicOnly={true}>
              <ClinicDashboard />
            </ProtectedRoute>
          } />
          <Route path="/clinic/analytics" element={
            <ProtectedRoute clinicOnly={true}>
              <ClinicAnalytics />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
