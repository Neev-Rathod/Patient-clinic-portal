// frontend/src/components/ClinicRegister.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ClinicRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    clinicId: '',
    licensePhoto: '',
    profilePic: '',
    address: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword){
      alert('Passwords do not match');
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/clinic/register`, formData);
      alert('Clinic registered successfully');
      navigate('/clinic/login');
    } catch (error) {
      console.error(error);
      alert('Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Clinic Registration</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input name="fullName" type="text" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="mb-2 p-2 border" required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} className="mb-2 p-2 border" required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="mb-2 p-2 border" required />
        <input name="specialization" type="text" placeholder="Specialization" value={formData.specialization} onChange={handleChange} className="mb-2 p-2 border" required />
        <input name="clinicId" type="text" placeholder="Clinic ID" value={formData.clinicId} onChange={handleChange} className="mb-2 p-2 border" required />
        <input name="licensePhoto" type="text" placeholder="License Photo URL" value={formData.licensePhoto} onChange={handleChange} className="mb-2 p-2 border" required />
        <input name="profilePic" type="text" placeholder="Profile Picture URL (Optional)" value={formData.profilePic} onChange={handleChange} className="mb-2 p-2 border" />
        <input name="address" type="text" placeholder="Address" value={formData.address} onChange={handleChange} className="mb-2 p-2 border" required />
        <button type="submit" className="bg-blue-600 text-white p-2">Register</button>
      </form>
    </div>
  );
};

export default ClinicRegister;
