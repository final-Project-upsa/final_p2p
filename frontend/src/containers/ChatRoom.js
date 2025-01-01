import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Send, ImageIcon, Paperclip, CheckCircle2, Star, MoreVertical, Clock, Shield, MapPin, Loader2 } from 'lucide-react';

// Create audio instance outside component
const notificationSound = new Audio('/notification.mp3');

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-full">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
);

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
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
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
        `${wsScheme}://${process.env.REACT_APP_API_URL}/ws/chat/${id}/?token=${token}`
      );

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_history') {
          // Sort messages by timestamp in ascending order
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

  // Fetch chat and messages data
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
        // Sort messages by timestamp in ascending order
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

  const sendTypingIndicator = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'typing_indicator',
        is_typing: true
      }));

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.send(JSON.stringify({
          type: 'typing_indicator',
          is_typing: false
        }));
      }, 2000);
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    sendTypingIndicator();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending || !socket || socket.readyState !== WebSocket.OPEN) return;

    setIsSending(true);
    try {
      const messageData = {
        type: 'chat_message',
        content: message.trim(),
        metadata: {}
      };
      socket.send(JSON.stringify(messageData));
      setMessage('');

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.send(JSON.stringify({
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

  const StepIndicator = () => (
  <div className="bg-white rounded-2xl p-4 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
    <div className="relative">
      <div className="absolute top-[2.5rem] left-0 w-full h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
          style={{width: '40%'}} 
        />
      </div>
      
      <div className="flex justify-between">
        {[
          { label: 'Trade Started', status: 'completed', date: '12/20/23' },
          { label: 'Payment Made', status: 'completed', date: '12/21/23' },
          { label: 'Order Shipped', status: 'pending', date: null },
          { label: 'Order Received', status: 'pending', date: null },
          { label: 'Trade Completed', status: 'pending', date: null }
        ].map((step, idx) => (
          <div key={step.label} className="relative" style={{width: '20%'}}>
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center z-10 
                transition-all duration-300 transform
                ${step.status === 'completed' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 scale-110' 
                  : 'bg-gray-200'}`}
              >
                <CheckCircle2 className={`
                  w-4 h-4 lg:w-6 lg:h-6 
                  ${step.status === 'completed' ? 'text-white' : 'text-gray-400'}
                `} />
              </div>
              <div className="mt-4 text-center">
                <div className={`
                  text-[10px] lg:text-sm font-medium
                  ${step.status === 'completed' ? 'text-blue-600' : 'text-gray-400'}
                `}>
                  {step.label}
                </div>
                {step.date && (
                  <div className="text-[8px] lg:text-xs text-gray-400 mt-1">
                    {step.date}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const getProductImages = (product) => {
  const images = [];
  if (product.main_image_url) images.push(product.main_image_url);
  if (product.image1_url) images.push(product.image1_url);
  if (product.image2_url) images.push(product.image2_url);
  if (product.image3_url) images.push(product.image3_url);
  if (product.image4_url) images.push(product.image4_url);
  if (product.image5_url) images.push(product.image5_url);
  return images.filter(Boolean); // Remove null/undefined values
};

const ActionPanel = () => {
  if (isLoading || !chat || !chat.product) return <LoadingSpinner />;
  
  const isSeller = currentUser?.id === chat.product.seller.id;
  const otherUser = isSeller ? chat.other_participant : chat.product.seller;
  const productImages = getProductImages(chat.product);
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="px-4 lg:px-8 py-4 space-y-6">
        <StepIndicator />
        
        {/* Product Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          {productImages.length > 0 && (
            <>
              <div className="relative aspect-video mb-4 rounded-xl overflow-hidden group">
                <img 
                  src={productImages[activeImage]} 
                  alt="Product" 
                  className="w-full h-full object-cover transform transition-transform group-hover:scale-105" 
                />
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {productImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`w-2 h-2 rounded-full transition-all
                          ${activeImage === idx 
                            ? 'bg-blue-500 w-4' 
                            : 'bg-white/70 hover:bg-white'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {productImages.length > 1 && (
                <div className="flex space-x-2 mb-4 overflow-x-auto custom-scrollbar">
                  {productImages.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative rounded-xl overflow-hidden flex-shrink-0 w-20 aspect-video
                        ${activeImage === idx 
                          ? 'ring-2 ring-blue-500' 
                          : 'opacity-60 hover:opacity-100'} 
                        transition-all`}
                    >
                      <img 
                        src={image} 
                        alt={`View ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
            {chat.product.name}
          </h2>
          <div className="flex items-center space-x-3 mb-4">
            <p className="text-3xl font-bold text-blue-600">
              ${chat.product.sale_price || chat.product.regular_price}
            </p>
            {chat.product.sale_price && (
              <p className="text-lg text-gray-400 line-through">
                ${chat.product.regular_price}
              </p>
            )}
          </div>
          <p className="text-gray-600 leading-relaxed">
            {chat.product.description}
          </p>
          
          {/* Additional Product Details */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Listed {new Date(chat.product.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{chat.product.location || 'Location not specified'}</span>
            </div>
          </div>
        </div>
        
        {/* User Information Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {isSeller ? "Buyer Information" : "Seller Information"}
            </h3>
            {otherUser.is_verified && (
              <div className="flex items-center text-blue-500">
                <Shield className="w-5 h-5 mr-1" />
                <span className="text-sm">Verified</span>
              </div>
            )}
          </div>
          <div className="flex items-start">
            <div className="relative">
              <img 
                src={otherUser.profile_image || '/default-avatar.png'} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100"
              />
              {otherUser.is_online && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full ring-2 ring-white" />
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center mb-3">
                <h4 className="font-semibold text-lg">
                  {`${otherUser.first_name} ${otherUser.last_name}`}
                </h4>
                {otherUser.badge && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {otherUser.badge}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <span>{otherUser.rating || 'No ratings'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{otherUser.response_time || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{otherUser.region || 'Location not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <span>{otherUser.successful_trades || 0} successful trades</span>
                </div>
              </div>
              
              {/* User Stats */}
              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {otherUser.response_rate || '0%'}
                  </div>
                  <div className="text-xs text-gray-500">Response Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {otherUser.items_sold || '0'}
                  </div>
                  <div className="text-xs text-gray-500">Items Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {otherUser.join_date ? new Date(otherUser.join_date).getFullYear() : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Member Since</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Safety Notice Card */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Safety Notice</h4>
              <p className="text-yellow-700 text-sm leading-relaxed">
                To ensure your safety and security, all trades must be conducted solely within the platform.
                Any requests to trade outside are suspicious and could be scams. Never share personal financial
                information or make payments through unofficial channels.
              </p>
              <div className="mt-4 flex items-center text-yellow-600 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>Report suspicious activity to our support team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  const ChatPanel = () => {
    if (isLoading || !chat) return <LoadingSpinner />;

    const isSeller = currentUser?.id === chat.product.seller.id;
    const otherUser = isSeller ? chat.other_participant : chat.product.seller;

    return (
      <div className="h-full bg-white lg:rounded-2xl shadow-lg flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 lg:rounded-t-2xl border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={otherUser.profile_image || '/default-avatar.png'} 
                alt="" 
                className="w-10 h-10 rounded-full border-2 border-white" 
              />
              <div className="text-white">
                <h3 className="font-semibold">{`${otherUser.first_name} ${otherUser.last_name}`}</h3>
                <div className="flex items-center space-x-2 text-sm opacity-90">
                  {otherUser.rating && (
                    <>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-300 mr-1" />
                        <span>{otherUser.rating}</span>
                      </div>
                      <span>•</span>
                    </>
                  )}
                  <span>Active {chat.last_message_at ? new Date(chat.last_message_at).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
        >
          {messages.map((msg, index) => {
            const isOwnMessage = msg.sender === currentUser?.id;
            return (
              <div 
                key={msg.id || `msg-${index}-${msg.timestamp}`} 
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  px-4 py-2 rounded-2xl max-w-[80%] shadow-sm
                  ${isOwnMessage
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-100 rounded-tl-none'}
                `}>
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 bg-gray-50 lg:rounded-b-2xl">
          <div className="flex items-center space-x-3 bg-white rounded-full p-2 shadow-sm">
            <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ImageIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Paperclip className="w-6 h-6 text-gray-600" />
            </button>
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type a message..."
              className="flex-1 py-2 px-4 focus:outline-none bg-transparent"
              disabled={isSending}
            />
            <button 
              type="submit"
              disabled={isSending || !message.trim()}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ScrollbarStyle />
      
      {/* Mobile Toggle Buttons */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex items-center justify-around z-50">
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

      {/* Main Content */}
      <div className="h-[calc(100vh-4rem)] lg:h-screen p-0 lg:p-8">
        <div className="h-full flex lg:space-x-6">
          <div className={`w-full lg:w-1/2 ${
            activeTab === 'actions' ? 'block' : 'hidden lg:block'
          }`}>
            <div className="h-full bg-gray-50 lg:rounded-2xl overflow-hidden shadow-lg">
              <ActionPanel />
            </div>
          </div>
          
          <div className={`w-full lg:w-1/2 ${
            activeTab === 'chat' ? 'block' : 'hidden lg:block'
          }`}>
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;