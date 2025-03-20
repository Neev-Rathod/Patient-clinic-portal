// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('clinicToken');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('clinicToken');
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <div>
        <Link to="/" className="mr-4">Home</Link>
        {!token && (
          <>
            <Link to="/login" className="mr-4">Login as Patient</Link>
            <Link to="/clinic/login" className="mr-4">Login as Clinic</Link>
          </>
        )}
      </div>
      {token && (
        <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
