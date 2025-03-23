import React, { useState, useEffect, useRef } from 'react';
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
        <Link to="/chat" className="mr-4">Home</Link>
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

const RenderHTML = ({ htmlString, className = '' }) => {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlString }}
    />
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
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    // Function to handle clicks outside the popup
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    // Add event listener when the popup is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };
  console.log(chatList)

  return (
    <div>
      <div className="flex" >
        {/* Sidebar: List of chats and "New Chat" button */}
        <div className="w-[375px] border-r p-4 overflow-y-auto" style={{height:"calc(100vh)"}}>
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={handleNewChat}
              className="w-full font-bold p-1 bg-[#f6f6f6] rounded text-lg border-[#c9c9c9] hover:bg-gray-200 border-2 text-black"
            >
              New Chat
            </button>
          </div>
          <div className="w-full h-[1px] bg-[#e7e9ec] mb-2"></div>
         <div className='overflow-auto' style={{height:"calc(100vh - 138px)"}}>
         {chatList.length === 0 ? (
            <p>No chats available.</p>
          ) : (
            chatList.map(chat => (
              <div
                key={chat._id}
                className={`p-3 hover:bg-gray-200 mb-3 border-2
                  ${chat.verificationType === 'Unverified'
                  ? 'border-[#dedede]'
                  : chat.verificationType === 'correct'
                    ? 'border-[#73FA80]'
                    : 'border-[#FF8E72]'
                }
                 rounded-md cursor-pointer ${selectedChat && selectedChat._id === chat._id ? 'bg-gray-200' : ''}`}
                onClick={() => setSelectedChat(chat)}
              >
                        <RenderHTML htmlString={chat.chatName} className="font-bold truncate" />
                        </div>
            ))
          )}
         </div>
          <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-3 py-1 rounded w-full">
            Logout
          </button>
        </div>

        {/* Main panel: Chat details or new chat view */}
        <div className="flex-col flex overflow-y-auto justify-between" style={{ height: "calc(100vh - 10px)", width: "calc(100vw - 375px)" }}>
          {selectedChat ? (
            <div className='bg-[#F9FBFF]'>
              <div className='w-full bg-white my-2 px-4 flex justify-between border-b-[1px] items-center border-[#c9c9c9]'>

                <h2 className="text-2xl mb-2 truncate mr-4">{selectedChat.chatName}</h2>
                {/* Emergency Toggle Button */}
                <button
                  onClick={() => setIsEmergency(prev => !prev)}
                  className="bg-red-500 rounded-md text-white p-1.5 whitespace-nowrap mb-2"
                >
                  {isEmergency ? 'Emergency On' : 'Emergency Off'}
                </button>
              </div>
              <div className="mx-4 overflow-auto" style={{ height: "calc(100vh - 132px)" }}>
                <p className='justify-self-end p-3 w-2/3 bg-[#f6f6f6] rounded-md'>
                  {selectedChat.questionAsked}
                </p>
                <div className={`w-2/3 ${selectedChat.verificationType === 'Unverified'
                    ? 'bg-[#f6f6f6]'
                    : selectedChat.verificationType === 'correct'
                      ? 'bg-[#73FA80]'
                      : 'bg-[#FF8E72]'
                  } rounded-md items-center relative`}>
                  <RenderHTML htmlString={selectedChat.answerByAI} className="mt-3 p-4 w-full pr-10" />
                  <button
                    onClick={() => speakText(selectedChat.answerByAI, 'ai')}
                    className={`absolute top-2 p-1 rounded-[50%] right-2 ${speakingMessage === 'ai' ? 'bg-gray-200' : ''}`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor"></path></svg>
                  </button>
                  <div className='flex items-centre justify-between mx-4 pb-2 text-[#636363]'>

                    {selectedChat.verificationType == 'Unverified' ? (
                      <p>Unverified by the clinic</p>
                    ) : selectedChat.verificationType == 'correct' ? (
                      <p>Correct Answer by AI</p>
                    ) : (
                      <p>Incorrect Answer by AI</p>
                    )}
                    <TimeDisplay isoDateTime={selectedChat.timeOfResponseByAI} />
                  </div>


                  {/* <p>{selectedChat.timeOfResponseByAI}</p> */}
                </div>
                {selectedChat.correctedResponseByClinic  && (selectedChat.verificationType != 'correct') && (
                  <div className="flex items-center mt-2">
                    <div className="w-2/3 bg-[#f6f6f6] rounded-md  items-center relative">
                    <RenderHTML htmlString={selectedChat.correctedResponseByClinic} className="mt-3 p-4 w-full pr-10" />
                    <button
                        onClick={() => speakText(selectedChat.correctedResponseByClinic, 'ai')}
                        className={`absolute top-2 p-1 rounded-[50%] right-2 ${speakingMessage === 'ai' ? 'bg-gray-200' : ''}`}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor"></path></svg>
                      </button>
                      <div className='flex items-centre justify-between mx-4 pb-2 text-[#636363]'>
                        <div
                          ref={triggerRef}
                          className="flex items-center cursor-pointer"
                          onClick={togglePopup}
                        >
                          {isOpen && (
                            <div
                              ref={popupRef}
                              className="absolute bottom-15 left-0 mt-2 bg-white shadow-lg rounded p-3 z-10 border border-gray-200 w-64 h-30 overflow-auto"
                            >
                              <div className="space-y-2">
                                <div>
                                  <span className="font-semibold">Name: </span>
                                  <span>{selectedChat.verifiedByClinic.fullName}</span>
                                </div>
                                <div>
                                  <span className="font-semibold">Specialization: </span>
                                  <span>{selectedChat.verifiedByClinic.specialization}</span>
                                </div>
                                <div>
                                  <span className="font-semibold">Description: </span>
                                  <span>{selectedChat.verifiedByClinic.description}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          <img
                            src={selectedChat.verifiedByClinic.profilePic}
                            alt="profile"
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <p className="font-medium">{selectedChat.verifiedByClinic.fullName}</p>
                        </div>

                        <TimeDisplay isoDateTime={selectedChat.timeOfResponseByClinic} />
                      </div>


                      {/* <p>{selectedChat.timeOfResponseByAI}</p> */}
                    </div>

                    {/* The popup */}

                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center ">
              <h2 className="text-2xl mb-4">Start a New Chat</h2>
              <p className="text-gray-500">Type your health question below and press send.</p>
            </div>
          )}
          {/* Input for new message */}
          <div className="flex  mx-4 box-border bg-[#f6f6f6] border-[#c9c9c9] border-2 mt-4 items-center rounded-lg">
            <button onClick={startVoiceRecognition} className="text-white">
              <svg viewBox="0 0 24 24" className='w-8' fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M14.75 7.33303V11.222C14.7728 12.4877 13.7657 13.5325 12.5 13.556C11.2343 13.5325 10.2271 12.4877 10.25 11.222V7.33303C10.2277 6.06772 11.2347 5.02357 12.5 5.00003C13.7653 5.02357 14.7723 6.06772 14.75 7.33303Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8.46233 13.8534C8.13618 13.5981 7.66478 13.6555 7.40945 13.9817C7.15411 14.3078 7.21152 14.7792 7.53767 15.0346L8.46233 13.8534ZM17.4623 15.0346C17.7885 14.7792 17.8459 14.3078 17.5906 13.9817C17.3352 13.6555 16.8638 13.5981 16.5377 13.8534L17.4623 15.0346ZM13.25 16C13.25 15.5858 12.9142 15.25 12.5 15.25C12.0858 15.25 11.75 15.5858 11.75 16H13.25ZM11.75 19C11.75 19.4142 12.0858 19.75 12.5 19.75C12.9142 19.75 13.25 19.4142 13.25 19H11.75ZM7.53767 15.0346C10.4524 17.3164 14.5476 17.3164 17.4623 15.0346L16.5377 13.8534C14.1661 15.7101 10.8339 15.7101 8.46233 13.8534L7.53767 15.0346ZM11.75 16V19H13.25V16H11.75Z" fill="#000000"></path> </g></svg>

            </button>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 p-2 bg-transparent outline-none"
              placeholder="Ask your health question..."
            />
            <button onClick={sendMessage} className="mr-2">
              <svg viewBox="0 0 24 24" className='w-8' fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>            </button>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
