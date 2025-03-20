// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import ClinicLogin from './components/ClinicLogin';
import ClinicRegister from './components/ClinicRegister';
import Chat from './components/Chat';

function ProtectedRoute({ children }) {
  // Check for patient or clinic token
  const token = localStorage.getItem('token') || localStorage.getItem('clinicToken');
  if (!token) {
    return <Navigate to='/' replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/clinic/login" element={<ClinicLogin />} />
          <Route path="/clinic/register" element={<ClinicRegister />} />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
