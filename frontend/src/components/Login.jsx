// frontend/src/components/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { name, pass });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Patient Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="mb-2 p-2 border"
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={pass} 
          onChange={(e) => setPass(e.target.value)} 
          className="mb-2 p-2 border"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2">Login</button>
      </form>
    </div>
  );
};

export default Login;
