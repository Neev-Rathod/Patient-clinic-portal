import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ClinicDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [correctedText, setCorrectedText] = useState('');
  const [filter, setFilter] = useState('all'); // "all", "normal", or "emergency"
  const navigate = useNavigate();

  // Fetch clinic profile info (assumed endpoint)
  const fetchProfile = async () => {
    const token = localStorage.getItem('clinicToken');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/clinic/profile`, {
        headers: { Authorization: token }
      });
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      alert("Error fetching clinic profile. Please login again.");
      navigate('/clinic/login');
    }
  };

  // Fetch chats for the clinic's specialization using the new endpoint
  const fetchChats = async () => {
    const token = localStorage.getItem('clinicToken');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/clinic/chats`, {
        headers: { Authorization: token }
      });
      setChats(res.data);
      if (res.data.length > 0 && !selectedChat) setSelectedChat(res.data[0]);
    } catch (error) {
      console.error("Failed to fetch chats", error);
      alert("Error fetching chats.");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('clinicToken')) {
      navigate('/clinic/login');
    } else {
      fetchProfile();
    }
  }, [navigate]);

  useEffect(() => {
    if (profile && profile.specialization) {
      fetchChats();
    }
  }, [profile]);

  // Filter chats based on the current filter setting
  const getFilteredChats = () => {
    if (filter === 'normal') {
      return chats.filter(chat => !chat.isEmergency);
    }
    if (filter === 'emergency') {
      return chats.filter(chat => chat.isEmergency);
    }
    return chats;
  };

  // Handler for marking the chat as correct
  const handleCorrect = async () => {
    if (!selectedChat) return;
    const token = localStorage.getItem('clinicToken');
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/chat/review/${selectedChat._id}`, {
        updatedText: selectedChat.answerByAI,
        verificationType: "correct"
      }, {
        headers: { Authorization: token }
      });
      setChats(chats.map(chat => chat._id === selectedChat._id ? res.data.chat : chat));
      setSelectedChat(res.data.chat);
      alert("Chat marked as correct.");
    } catch (error) {
      console.error("Error updating chat", error);
      alert("Failed to update chat.");
    }
  };

  // Handler for marking the chat as incorrect (opens modal)
  const handleIncorrect = () => {
    if (!selectedChat) return;
    setShowModal(true);
  };

  // Submit the corrected response from modal
  const submitCorrectedResponse = async () => {
    if (!selectedChat) return;
    const token = localStorage.getItem('clinicToken');
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/chat/review/${selectedChat._id}`, {
        updatedText: correctedText,
        verificationType: "incorrect"
      }, {
        headers: { Authorization: token }
      });
      setChats(chats.map(chat => chat._id === selectedChat._id ? res.data.chat : chat));
      setSelectedChat(res.data.chat);
      setShowModal(false);
      setCorrectedText('');
      alert("Chat updated with correct response.");
    } catch (error) {
      console.error("Error updating chat", error);
      alert("Failed to update chat.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clinicToken');
    navigate('/');
  };

  const filteredChats = getFilteredChats();

  return (
    <div className="flex h-screen">
      {/* Left panel: Chat list and filter buttons */}
      <div className="w-1/3 border-r overflow-y-auto p-4">
        <h2 className="text-xl mb-4">Chats for {profile?.specialization}</h2>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All Chats
          </button>
          <button 
            onClick={() => setFilter('normal')} 
            className={`px-3 py-1 rounded ${filter === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Normal Chats
          </button>
          <button 
            onClick={() => setFilter('emergency')} 
            className={`px-3 py-1 rounded ${filter === 'emergency' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Emergency Chats
          </button>
        </div>
        
        {filteredChats.length === 0 ? (
          <p>No chats available.</p>
        ) : (
          filteredChats.map(chat => (
            <div 
              key={chat._id}
              className={`p-2 mb-2 border cursor-pointer ${selectedChat && selectedChat._id === chat._id ? 'bg-gray-200' : ''}`}
              onClick={() => setSelectedChat(chat)}
            >
              <h3 className="font-bold">{chat.chatName}</h3>
              <p className="text-sm truncate">{chat.questionAsked}</p>
              {chat.isEmergency && (
                <span className="text-red-600 text-xs font-semibold">Emergency</span>
              )}
            </div>
          ))
        )}
        <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-3 py-1 rounded">
          Logout
        </button>
      </div>

      {/* Right panel: Chat details */}
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedChat ? (
          <div>
            <h2 className="text-2xl mb-2">{selectedChat.chatName}</h2>
            <div className="mb-4">
              <p><strong>Question:</strong> {selectedChat.questionAsked}</p>
              <p><strong>AI Response:</strong> {selectedChat.answerByAI}</p>
              {selectedChat.correctedResponseByClinic && (
                <p><strong>Clinic Response:</strong> {selectedChat.correctedResponseByClinic}</p>
              )}
            </div>
            <div className="flex space-x-4">
              <button onClick={handleCorrect} className="bg-green-500 text-white px-4 py-2 rounded">
                Correct Response
              </button>
              <button onClick={handleIncorrect} className="bg-yellow-500 text-white px-4 py-2 rounded">
                Incorrect Response
              </button>
            </div>
          </div>
        ) : (
          <p>Select a chat to view details.</p>
        )}
      </div>

      {/* Modal for incorrect response */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md w-1/2">
            <h3 className="text-xl mb-4">Provide Correct Response</h3>
            <textarea
              className="w-full border p-2 mb-4"
              placeholder="Enter the correct response here..."
              value={correctedText}
              onChange={(e) => setCorrectedText(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={submitCorrectedResponse} className="bg-blue-600 text-white px-4 py-2 rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicDashboard;
