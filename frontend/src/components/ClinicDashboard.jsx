import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
const RenderHTML = ({ htmlString, className = '' }) => {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlString }}
    />
  );
};
const ClinicDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [correctedText, setCorrectedText] = useState('');
  const [filter, setFilter] = useState('all'); // "all", "normal", or "emergency"
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const profileRef = useRef(null);

  // Click-outside detection for profile popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch clinic profile info
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
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/chat/review/${selectedChat._id}`,
        { updatedText: selectedChat.answerByAI, verificationType: "correct" },
        { headers: { Authorization: token } }
      );
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
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/chat/review/${selectedChat._id}`,
        { updatedText: correctedText, verificationType: "incorrect" },
        { headers: { Authorization: token } }
      );
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
  const TimeDisplay = ({ isoDateTime }) => {
    // Function to extract and format the time portion in IST
    const formatTimeInIST = (isoString) => {
      if (!isoString) return "Invalid Date"; // Handle missing or invalid input

      const date = new Date(isoString);

      // Extract local hours, minutes, and seconds (in IST)
      const hours = String(date.getHours()).padStart(2, "0"); // Local hours
      const minutes = String(date.getMinutes()).padStart(2, "0"); // Local minutes
      const seconds = String(date.getSeconds()).padStart(2, "0"); // Local seconds

      // Return formatted time (adjust as needed)
      return `${hours}:${minutes}`;
    };

    return (
      <p className=''>
        {/* Call the formatTimeInIST function and display the result */}
        {formatTimeInIST(isoDateTime)}
      </p>
    );
  };

  const filteredChats = getFilteredChats();
  return (
    <>
   

      {/* Main Content */}
      <div className="flex" style={{height:"calc(100vh)"}}>
        {/* Left panel: Chat list, filter buttons, and analytics button */}
        <div className="w-[375px] border-r overflow-y-auto p-4">
        <button 
            onClick={() => navigate('/clinic/analytics')}
            className=" mb-2 bg-purple-600 text-white px-3 py-2 rounded block w-full text-center"
          >
            Show Analytics
          </button>
          <div className="flex  space-x-2 mb-2">
            
            <button 
              onClick={() => setFilter('all')}
              className={` w-full px-1  rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All Chats
            </button>
            <button 
              onClick={() => setFilter('normal')}
              className={`w-full  px-1  rounded ${filter === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Normal Chats
            </button>
            <button 
              onClick={() => setFilter('emergency')}
              className={`w-full  px-1 rounded ${filter === 'emergency' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Emergency Chats
            </button>
          </div>
          <div className="w-full h-[1px] bg-[#e7e9ec] mb-2"></div>

          {filteredChats.length === 0 ? (
            <p>No chats available.</p>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat._id}
                className={`p-3 hover:bg-gray-200 mb-3 border border-[#bebebe] rounded-md cursor-pointer ${selectedChat && selectedChat._id === chat._id ? 'bg-gray-200' : ''}`}
                onClick={() => setSelectedChat(chat)}
              >
                        <RenderHTML htmlString={chat.chatName} className="font-bold truncate" />
                        {chat.isEmergency && (
                  <span className="text-red-600 text-xs font-semibold">Emergency</span>
                )}
              </div>
            ))
          )}
       
         
        </div>

        {/* Right panel: Chat details */}
        <div className="flex-1  bg-[#F9FBFF]" style={{width:"calc(100vw - 375px)"}}>
          {selectedChat ? (
            <div className=''>
            <div className='w-full bg-white my-2 px-4 flex justify-between border-b-[1px] items-center border-[#c9c9c9]'>

              <h2 className="text-2xl mb-2 truncate mr-4">{selectedChat.chatName}</h2>
              {/* Emergency Toggle Button */}
              {profile && (
          <div
            className="cursor-pointer flex items-center"
            onClick={() => setShowPopup(prev => !prev)}
            ref={profileRef}
          >
            <img 
              src={profile.profilePic || 'https://via.placeholder.com/40'} 
              alt="Profile" 
              className="w-10 h-10 rounded-full mr-2"
            />
            <span>{profile.fullName}</span>
            {showPopup && (
              <div
                ref={popupRef}
                className="absolute w-1/3 right-4 top-14 bg-white text-black p-4 rounded shadow-lg z-50"
              >
                <p><strong>Name:</strong> {profile.fullName}</p>
                <p><strong>Specialization:</strong> {profile.specialization}</p>
                <p><strong>Description:</strong> {profile.description}</p>
                <button 
                  onClick={handleLogout}
                  className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
              
            </div>
      
            <div className="mx-4 overflow-auto" style={{height:"calc(100vh - 122px)"}}>
              <p className='justify-self-end p-3 w-2/3 bg-[#f6f6f6] rounded-md'>
                {selectedChat.questionAsked}
              </p>
              <div className="w-2/3 bg-[#f6f6f6] rounded-md  items-center relative">
              <RenderHTML htmlString={selectedChat.answerByAI} className="mt-3 p-4 w-full pr-10" />
             
                <div className='flex items-centre justify-between mx-4 pb-2 text-[#636363]'>
                
                {selectedChat.verificationType == 'Unverified' ? (
                  <p>Unverified by the clinic</p>
                ) : selectedChat.verificationType == 'Correct' ? (
                <p>Correct Answer by AI</p>
                ) : (
                <p>Incorrect Answer by AI</p>
                )}
                <TimeDisplay isoDateTime={selectedChat.timeOfResponseByAI} />
                </div>
                

                {/* <p>{selectedChat.timeOfResponseByAI}</p> */}
              </div>
    
            </div>
            <div className="flex w-full space-x-4 px-4 mt-2">
              <button onClick={handleCorrect} className="bg-[#8dff89] w-1/2  px-4 py-2 rounded border-1 border-[#9d9d9d]">
                Correct Response
              </button>
              <button onClick={handleIncorrect} className="bg-[#ff8e72] w-1/2  px-4 py-2 rounded border-1 border-[#9d9d9d]">
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
          <>
          <div className="absolute top-0 left-0  z-10 w-full h-screen bg-black opacity-30 flex justify-center items-center">
            </div>
            <div className="bg-white p-6 rounded shadow-md absolute w-[500px] z-20 top-[50%] left-[50%] translate-[-50%]" >
              <h3 className="text-xl mb-4">Provide Correct Response</h3>
              <textarea
                className="w-full border p-2 mb-4 resize-none"
                placeholder="Enter the correct response here..."
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                rows={10}
              />
              <div className="flex w-full space-x-4">
                <button onClick={() => setShowModal(false)} className="bg-gray-500 w-1/2 text-white px-4 py-2 rounded ">
                  Cancel
                </button>
                <button onClick={submitCorrectedResponse} className="bg-blue-600 w-1/2 text-white px-4 py-2 rounded">
                  Submit
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ClinicDashboard;
