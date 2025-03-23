import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send 'password' field and email instead of name
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password: pass });
      localStorage.setItem('token', res.data.token);
      navigate('/chat');
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
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
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
        <div className="mb-2 text-right text-sm">
          Don't have an account? <Link to="/register" className="text-blue-600">Register</Link>
        </div>
        <button type="submit" className="bg-blue-600 text-white p-2">Login</button>
      </form>
    </div>
  );
};

export default Login;
