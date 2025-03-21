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
      // Sends the question text to the backend; expects a chat document in return.
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat/send`, 
        { text: chatInput },
        { headers: { Authorization: token } }
      );
      
      // Append the new chat object to chatHistory.
      // The response now contains: questionAsked, answerByAI, and optionally correctedResponseByClinic.
      setChatHistory(prev => [...prev, res.data]);
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
      {/* <button onClick={handleLogout} className="absolute top-0 right-0 mt-4 mr-4 bg-red-500 text-white px-3 py-1 rounded">
        Logout
      </button> */}
      <div className="border p-4 mb-4 h-96 overflow-y-scroll">
        {chatHistory.map((chat, index) => (
          <div key={index} className="mb-4">
            <div className="text-right mb-2">
              <span className="inline-block p-2 rounded bg-blue-100">
                <strong>You:</strong> {chat.questionAsked}
              </span>
            </div>
            <div className="text-left mb-2">
              <span className="inline-block p-2 rounded bg-gray-200">
                <strong>AI:</strong> {chat.answerByAI}
              </span>
            </div>
            {chat.correctedResponseByClinic && (
              <div className="text-left">
                <span className="inline-block p-2 rounded bg-green-200">
                  <strong>Clinic:</strong> {chat.correctedResponseByClinic}
                </span>
              </div>
            )}
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
