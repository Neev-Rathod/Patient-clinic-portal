// src/components/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="max-w-md mx-auto text-center mt-10">
      <h1 className="text-3xl font-bold mb-6">Welcome to Health Chat</h1>
      <div className="flex flex-col gap-4">
        <Link to="/login" className="bg-blue-600 text-white p-3 rounded">Login as Patient</Link>
        <Link to="/clinic/login" className="bg-green-600 text-white p-3 rounded">Login as Clinic</Link>
      </div>
    </div>
  );
};

export default LandingPage;
