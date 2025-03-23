import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ClinicRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    clinicId: '',
    licensePhoto: '',
    profilePic: '',
    address: '',
    description: ''
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
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Clinic Registration</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input 
          name="fullName" 
          type="text" 
          placeholder="Full Name" 
          value={formData.fullName} 
          onChange={handleChange} 
          className="mb-2 p-2 border" 
          required 
        />
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange} 
          className="mb-2 p-2 border" 
          required 
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={handleChange} 
          className="mb-2 p-2 border" 
          required 
        />
        <input 
          name="confirmPassword" 
          type="password" 
          placeholder="Confirm Password" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
          className="mb-2 p-2 border" 
          required 
        />
        <label className="mb-1">Specialization</label>
        <select 
          name="specialization" 
          value={formData.specialization} 
          onChange={handleChange} 
          className="mb-2 p-2 border" 
          required
        >
          <option value="">Select Specialization</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="General">General</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Gastroenterologist">Gastroenterologist</option>
          <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Psychiatrist/Psychologist">Psychiatrist/Psychologist</option>
          <option value="ENT Specialist (Otolaryngologist)">ENT Specialist (Otolaryngologist)</option>
          <option value="Ophthalmologist">Ophthalmologist</option>
          <option value="Pulmonologist">Pulmonologist</option>
          <option value="Endocrinologist">Endocrinologist</option>
          <option value="Urologist">Urologist</option>
          <option value="Gynecologist (OB/GYN)">Gynecologist (OB/GYN)</option>
          <option value="Pediatrician">Pediatrician</option>
          <option value="Dentist">Dentist</option>
          <option value="Oncologist">Oncologist</option>
          <option value="Rheumatologist">Rheumatologist</option>
          <option value="Allergist/Immunologist">Allergist/Immunologist</option>
          <option value="Infectious Disease Specialist">Infectious Disease Specialist</option>
          <option value="Physiotherapist">Physiotherapist</option>
        </select>
        <textarea
          name="description"
          placeholder="Clinic Description"
          value={formData.description}
          onChange={handleChange}
          className="mb-2 p-2 border"
          required
        />
        <input 
          name="clinicId" 
          type="text" 
          placeholder="Clinic ID" 
          value={formData.clinicId} 
          onChange={handleChange} 
          className="mb-2 p-2 border" 
          required 
        />
        <input 
          name="licensePhoto" 
          type="text" 
          placeholder="License Photo URL" 
          value={formData.licensePhoto} 
          onChange={handleChange} 
          className="mb-2 p-2 border" 
          required 
        />
        <input 
          name="profilePic" 
          type="text" 
          placeholder="Profile Picture URL (Optional)" 
          value={formData.profilePic} 
          onChange={handleChange} 
          className="mb-2 p-2 border" 
        />
        <input 
          name="address" 
          type="text" 
          placeholder="Address" 
          value={formData.address} 
          onChange={handleChange} 
          className="mb-2 p-2 border" 
          required 
        />
        <button type="submit" className="bg-blue-600 text-white p-2">Register</button>
      </form>
    </div>
  );
};

export default ClinicRegister;
