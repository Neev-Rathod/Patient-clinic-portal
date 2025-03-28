import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const ClinicAnalytics = () => {
  const [chats, setChats] = useState([]);
  const [profile, setProfile] = useState(null);
  const [timeRange, setTimeRange] = useState('1month'); // Options: "1week", "1month", "6months", "1year"
  const navigate = useNavigate();
  const token = localStorage.getItem('clinicToken');

  // Fetch chats
  const fetchChats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/chat/clinic/chats`, {
        headers: { Authorization: token }
      });
      setChats(res.data);
    } catch (error) {
      console.error("Failed to fetch chats", error);
      alert("Error fetching chats.");
    }
  };

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/clinic/profile`, {
        headers: { Authorization: token }
      });
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      alert("Error fetching profile.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/clinic/login');
    } else {
      fetchChats();
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: Get time threshold based on timeRange selection
  const getTimeThreshold = () => {
    const now = new Date();
    switch (timeRange) {
      case '1week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '1month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '6months':
        return new Date(now.getTime() - 182 * 24 * 60 * 60 * 1000);
      case '1year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  };

  // Filter chats based on time range using timeOfQuestionAsked
  const filteredChatsByTime = chats.filter(chat => new Date(chat.timeOfQuestionAsked) >= getTimeThreshold());

  // Group chats by date (formatted as YYYY-MM-DD) and count them
  const groupChatsByDate = (chatsArray) => {
    const groups = {};
    chatsArray.forEach(chat => {
      const date = new Date(chat.timeOfQuestionAsked).toISOString().split('T')[0];
      groups[date] = (groups[date] || 0) + 1;
    });
    // sort by date
    const sortedDates = Object.keys(groups).sort();
    return {
      labels: sortedDates,
      data: sortedDates.map(date => groups[date]),
    };
  };

  // Data for the first graph: All prompts received (using all chats over time)
  const allChatsData = groupChatsByDate(filteredChatsByTime);

  // Data for the second graph: Number of prompts resolved by you (using verified chats over time)
  const verifiedChats = filteredChatsByTime.filter(chat => profile && chat.verifiedByClinic?.clinicId === profile.clinicId);
  const verifiedChatsData = groupChatsByDate(verifiedChats);

  // Data for the 3rd graph: Emergency vs Normal chats counts (converted to Pie)
  const emergencyCount = chats.filter(chat => chat.isEmergency).length;
  const normalCount = chats.filter(chat => !chat.isEmergency).length;
  const emergencyChartData = {
    labels: ['Emergency', 'Normal'],
    datasets: [
      {
        data: [emergencyCount, normalCount],
        backgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  // Data for the 4th graph: Verification breakdown (converted to Pie)
  const correctCount = chats.filter(chat => chat.verificationType === 'correct').length;
  const incorrectCount = chats.filter(chat => chat.verificationType === 'incorrect').length;
  const unverifiedCount = chats.filter(chat => !chat.verificationType).length;
  const verificationChartData = {
    labels: ['Correct', 'Incorrect', 'Unverified'],
    datasets: [
      {
        data: [correctCount, incorrectCount, unverifiedCount],
        backgroundColor: ['#4BC0C0', '#FFCE56', '#E7E9ED'],
      },
    ],
  };

  // Chart options for line charts with reduced height
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl mb-4">Clinic Analytics</h1>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-500 text-white px-3 py-1 rounded"
      >
        Back
      </button>
      <div className="mb-4">
        <span className="mr-2 font-semibold">Select Time Range:</span>
        {['1week', '1month', '6months', '1year'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 mr-2 rounded ${timeRange === range ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {range}
          </button>
        ))}
      </div>
      
      {/* Full-width Line Charts with fixed height */}
      <div className="mb-6 border p-4 rounded w-full" style={{ height: '300px' }}>
        <h2 className="text-xl mb-2">All prompts received</h2>
        <Line
          data={{
            labels: allChatsData.labels,
            datasets: [{
              label: 'Prompts',
              data: allChatsData.data,
              borderColor: '#36A2EB',
              backgroundColor: '#36A2EB',
            }],
          }}
          options={lineOptions}
        />
      </div>
      <div className="mb-6 border p-4 rounded w-full" style={{ height: '300px' }}>
        <h2 className="text-xl mb-2">Number of prompts resolved by you</h2>
        <Line
          data={{
            labels: verifiedChatsData.labels,
            datasets: [{
              label: 'Resolved Prompts',
              data: verifiedChatsData.data,
              borderColor: '#4BC0C0',
              backgroundColor: '#4BC0C0',
            }],
          }}
          options={lineOptions}
        />
      </div>

      {/* Grid for remaining charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3rd Graph: Emergency vs Normal Chats as a Pie Chart */}
        <div className="border p-4 rounded flex flex-col items-center">
          <h2 className="text-xl mb-2">Emergency vs Normal Chats</h2>
          <div style={{ width: '300px', height: '300px' }}>
            <Pie data={emergencyChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* 4th Graph: Verification Breakdown as a smaller Pie Chart */}
        <div className="border p-4 rounded flex flex-col items-center">
          <h2 className="text-xl mb-2">Verification Breakdown</h2>
          <div style={{ width: '300px', height: '300px' }}>
            <Pie data={verificationChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicAnalytics;
