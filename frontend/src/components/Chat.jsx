// src/components/Chat.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const navigate = useNavigate();
  
  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/chat/send`, { text: chatInput }, {
        headers: { Authorization: token }
      });
      setChatHistory(prev => [...prev, ...res.data.messages]);
      setChatInput('');
    } catch (error) {
      console.error(error);
      alert('Failed to send message');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('clinicToken');
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto relative">
      <h2 className="text-2xl mb-4">Health Chat</h2>
      <div className="border p-4 mb-4 h-96 overflow-y-scroll">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className="inline-block p-2 rounded bg-gray-200">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input 
          type="text" 
          value={chatInput} 
          onChange={(e) => setChatInput(e.target.value)} 
          className="flex-1 p-2 border" 
          placeholder="Ask your health question..."
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white p-2 ml-2">Send</button>
      </div>
    
    </div>
  );
};

export default Chat;
