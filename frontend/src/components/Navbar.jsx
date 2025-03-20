// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-blue-600 p-4 text-white">
    <div className="container mx-auto flex justify-between">
      <div>
        <Link to="/" className="mr-4">Chat</Link>
        <Link to="/login" className="mr-4">Login</Link>
        <Link to="/register" className="mr-4">Register</Link>
      </div>
      <div>
        <Link to="/clinic/login" className="mr-4">Clinic Login</Link>
        <Link to="/clinic/register">Clinic Register</Link>
      </div>
    </div>
  </nav>
);

export default Navbar;
