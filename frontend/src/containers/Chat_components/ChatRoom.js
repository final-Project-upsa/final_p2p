import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Send, Shield } from 'lucide-react';
import ActionPanel from './ActionPanel';
import ChatPanel from './ChatPanel';

// Create audio instance outside component
const notificationSound = new Audio('/notification.mp3');

const ScrollbarStyle = () => (
  <style>{`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `}</style>
);

const ChatRoom = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('actions');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { id } = useParams();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  const scrollToBottom = () => {
     if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
       }
  };

  const playNotificationSound = () => {
    try {
      notificationSound.currentTime = 0;
      const playPromise = notificationSound.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Audio playback failed:", error);
        });
      }
    } catch (error) {
      console.log("Error playing notification sound:", error);
    }
  };

  useEffect(() => {
    // Fetch current user data
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('access');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/me/`, {
          headers: { 'Authorization': `JWT ${token}` }
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!chat) return;

    const connectWebSocket = () => {
      const token = localStorage.getItem('access');
      const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(
        `${wsScheme}://${process.env.REACT_APP_WS_URL}/ws/chat/${id}/?token=${token}`
      );

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_history') {
          const sortedMessages = data.messages.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sortedMessages);
          setTimeout(scrollToBottom, 100);
        } else if (data.type === 'chat_message') {
          setMessages(prev => {
            const messageExists = prev.some(m => m.id === data.message.id);
            if (messageExists) return prev;
            const newMessages = [...prev, data.message];
            setTimeout(scrollToBottom, 100);
            return newMessages;
          });
          if (data.message.sender_id !== currentUser?.id) {
            playNotificationSound();
          }
        } else if (data.type === 'typing_indicator') {
          setIsTyping(data.is_typing);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        ws.close();
      };

      socketRef.current = ws;
      setSocket(ws);
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chat, id, currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access');
        const config = {
          headers: { 'Authorization': `JWT ${token}` }
        };

        const [chatResponse, messagesResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/chats/${id}/`, config),
          axios.get(`${process.env.REACT_APP_API_URL}/api/chats/${id}/messages/`, config)
        ]);

        setChat(chatResponse.data);
        const sortedMessages = messagesResponse.data.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    setIsSending(true);
    try {
      const messageData = {
        type: 'chat_message',
        content: message.trim(),
        metadata: {}
      };
      socketRef.current.send(JSON.stringify(messageData));
      setMessage('');

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socketRef.current.send(JSON.stringify({
          type: 'typing_indicator',
          is_typing: false
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${activeTab === 'actions' ? 'mt-16' : ''}`}>
      <ScrollbarStyle />
      
      {/* Main Content */}
      <div className="relative flex flex-col lg:flex-row">
        {/* Action Panel */}
        <div 
          className={`w-full lg:w-1/2 ${
            activeTab === 'actions' ? 'block' : 'hidden lg:block'
          } ${
            activeTab === 'actions' ? 'lg:p-6 pb-16' : 'lg:p-6'
          }`}
        >
          <div className="h-full lg:bg-gray-50 lg:rounded-2xl lg:shadow-lg">
            <ActionPanel 
              chat={chat}
              currentUser={currentUser}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        {/* Chat Panel */}
        <div 
          className={`w-full lg:w-1/2 ${
            activeTab === 'chat' ? 'block fixed inset-0 z-50' : 'hidden lg:block lg:static'
          }`}
        >
          <div className="h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] lg:fixed lg:top-16 lg:right-0 lg:w-1/2 lg:p-8">
            <div className="h-full lg:h-[84vh] w-full lg:max-w-[95%] lg:mx-auto">
              <ChatPanel 
                chat={chat}
                currentUser={currentUser}
                isLoading={isLoading}
                messages={messages}
                message={message}
                setMessage={setMessage}
                isTyping={isTyping}
                isSending={isSending}
                sendMessage={sendMessage}
                handleMessageChange={handleMessageChange}
                isMobileView={activeTab === 'chat'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Buttons */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex items-center justify-around z-[60]">
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'actions' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Shield className="w-6 h-6" />
          <span className="text-xs">Details</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'chat' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Send className="w-6 h-6" />
          <span className="text-xs">Chat</span>
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;