import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch user's chats from the backend
  const fetchChats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/user`, {
        headers: { Authorization: token }
      });
      setChatList(res.data);
      if (res.data.length > 0 && !selectedChat) setSelectedChat(res.data[0]);
    } catch (error) {
      console.error(error);
      alert("Error fetching chats.");
    }
  };

  useEffect(() => {
    if (!token) navigate('/login');
    fetchChats();
  }, [token, navigate]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/chat/send`, { text: chatInput }, {
        headers: { Authorization: token }
      });
      // Prepend the new chat to the chat list
      setChatList(prev => [res.data, ...prev]);
      setSelectedChat(res.data);
      setChatInput('');
    } catch (error) {
      console.error(error);
      alert("Failed to send message");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('clinicToken');
    navigate('/');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar: List of chats */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <h2 className="text-xl mb-4">Your Chats</h2>
        {chatList.length === 0 ? (
          <p>No chats available.</p>
        ) : (
          chatList.map(chat => (
            <div 
              key={chat._id}
              className={`p-2 mb-2 border cursor-pointer ${selectedChat && selectedChat._id === chat._id ? 'bg-gray-200' : ''}`}
              onClick={() => setSelectedChat(chat)}
            >
              <h3 className="font-bold">{chat.chatName}</h3>
              <p className="text-sm truncate">{chat.questionAsked}</p>
            </div>
          ))
        )}
        <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-3 py-1 rounded">
          Logout
        </button>
      </div>
      
      {/* Main panel: Chat details */}
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
          </div>
        ) : (
          <p>No chat selected.</p>
        )}
        {/* Input for new message */}
        <div className="flex mt-4">
          <input 
            type="text" 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)} 
            className="flex-1 p-2 border" 
            placeholder="Ask your health question..."
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white p-2 ml-2">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
