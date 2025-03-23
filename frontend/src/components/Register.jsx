import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);
      alert('Registration successful');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Patient Registration</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input 
          type="text" 
          placeholder="Name" 
          name="name"
          value={formData.name} 
          onChange={handleChange} 
          className="mb-2 p-2 border"
          required
        />
        <input 
          type="email" 
          placeholder="Email" 
          name="email"
          value={formData.email} 
          onChange={handleChange} 
          className="mb-2 p-2 border"
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          name="password"
          value={formData.password} 
          onChange={handleChange} 
          className="mb-2 p-2 border"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2">Register</button>
      </form>
    </div>
  );
};

export default Register;
