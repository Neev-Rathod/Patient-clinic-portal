// src/components/ClinicLogin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const ClinicLogin = () => {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/clinic/login`, { fullName, password });
      localStorage.setItem('clinicToken', res.data.token);
      navigate('/chat');
    } catch (error) {
      console.error(error);
      alert('Clinic login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Clinic Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input 
          type="text" 
          placeholder="Full Name" 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          className="mb-2 p-2 border"
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="mb-2 p-2 border"
          required
        />
        <div className="mb-2 text-right text-sm">
          Don't have an account? <Link to="/clinic/register" className="text-blue-600">Register</Link>
        </div>
        <button type="submit" className="bg-blue-600 text-white p-2">Login</button>
      </form>
    </div>
  );
};

export default ClinicLogin;
