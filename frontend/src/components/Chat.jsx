import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Local Navbar component for Chat page
const Navbar = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('clinicToken');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('clinicToken');
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <div>
        <Link to="/" className="mr-4">Home</Link>
        {!token && (
          <>
            <Link to="/login" className="mr-4">Login as Patient</Link>
            <Link to="/clinic/login" className="mr-4">Login as Clinic</Link>
          </>
        )}
      </div>
      {token && (
        <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
          Logout
        </button>
      )}
    </nav>
  );
};

const Chat = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [speakingMessage, setSpeakingMessage] = useState(null); // "ai" or "clinic"
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch user's chats from the backend
  const fetchChats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/user`, {
        headers: { Authorization: token }
      });
      setChatList(res.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching chats.");
    }
  };

  useEffect(() => {
    if (!token) navigate('/login');
    fetchChats();
    // Do not auto-select any chat so that a fresh conversation is shown.
    setSelectedChat(null);
  }, [token, navigate]);

  // Handler for "New Chat" button
  const handleNewChat = () => {
    setSelectedChat(null);
    setChatInput('');
    setIsEmergency(false); // reset emergency flag for a new chat
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      // Include isEmergency flag in the payload
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat/send`,
        { text: chatInput, isEmergency },
        { headers: { Authorization: token } }
      );
      // Prepend the new chat to the chat list
      setChatList(prev => [res.data, ...prev]);
      setSelectedChat(res.data);
      setChatInput('');
      setIsEmergency(false); // reset after sending
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

  // Voice recognition using Web Speech API
  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      alert("Voice recognition error: " + event.error);
    };
  };

  // Text-to-Speech function with toggle using the Web Speech API
  const speakText = (text, id) => {
    // If the same message is currently speaking, stop it.
    if (speakingMessage === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessage(null);
      return;
    }
    // Cancel any ongoing speech before starting a new one.
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setSpeakingMessage(null);
    };
    setSpeakingMessage(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <Navbar />
      <div className="flex h-screen">
        {/* Sidebar: List of chats and "New Chat" button */}
        <div className="w-1/3 border-r p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl">Your Chats</h2>
            <button 
              onClick={handleNewChat} 
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              New Chat
            </button>
          </div>
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
        
        {/* Main panel: Chat details or new chat view */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedChat ? (
            <div>
              <h2 className="text-2xl mb-2">{selectedChat.chatName}</h2>
              <div className="mb-4">
                <p>
                  <strong>Question:</strong> {selectedChat.questionAsked}
                </p>
                <div className="flex items-center">
                  <p className="mr-2"><strong>AI Response:</strong> {selectedChat.answerByAI}</p>
                  <button 
                    onClick={() => speakText(selectedChat.answerByAI, 'ai')}
                    className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                  >
                    {speakingMessage === 'ai' ? 'Stop' : 'Speak'}
                  </button>
                </div>
                {selectedChat.correctedResponseByClinic && (
                  <div className="flex items-center mt-2">
                    <p className="mr-2">
                      <strong>Clinic Response:</strong> {selectedChat.correctedResponseByClinic}
                    </p>
                    <button 
                      onClick={() => speakText(selectedChat.correctedResponseByClinic, 'clinic')}
                      className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                    >
                      {speakingMessage === 'clinic' ? 'Stop' : 'Speak'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full">
              <h2 className="text-2xl mb-4">Start a New Chat</h2>
              <p className="text-gray-500">Type your health question below and press send.</p>
            </div>
          )}
          {/* Input for new message */}
          <div className="flex mt-4 items-center">
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
            <button onClick={startVoiceRecognition} className="bg-green-600 text-white p-2 ml-2">
              Voice
            </button>
            {/* Emergency Toggle Button */}
            <button 
              onClick={() => setIsEmergency(prev => !prev)} 
              className="bg-red-700 text-white p-2 ml-2"
            >
              {isEmergency ? 'Emergency On' : 'Emergency Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
