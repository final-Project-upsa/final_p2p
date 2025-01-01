import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../utils/mediaURL';
import axios from 'axios';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Star, 
  Shield,
  ChevronDown,
  Filter,
  Loader2,
  MessageSquare,
  Package,
  PinIcon,
  Archive,
  Trash2,
  Settings,
  Bell,
  Flag,
  AlertCircle,
  BookmarkIcon
} from 'lucide-react';

const Inbox = () => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/chats/`,
          {
            headers: { 'Authorization': `JWT ${token}` }
          }
        );
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.other_participant.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.other_participant.last_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'unread') return matchesSearch && chat.unread_count > 0;
    if (selectedFilter === 'selling') return matchesSearch && chat.product.seller.id === chat.current_user_id;
    if (selectedFilter === 'buying') return matchesSearch && chat.product.seller.id !== chat.current_user_id;
    return matchesSearch;
  });

  const ChatListItem = ({ chat }) => {
    const isSeller = chat.product.seller.id === chat.current_user_id;
    const otherUser = isSeller ? chat.other_participant : chat.product.seller;

    return (
      <div 
        onClick={() => navigate(`/chatroom/${chat.id}`)}
        className="group p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0"
      >
        <div className="flex items-start space-x-4">
          <div className="relative flex-shrink-0">
            {otherUser.profile_photo ? (
              <img
                src={getMediaUrl(otherUser.profile_photo)}
                alt="User avatar"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center ring-2 ring-gray-100">
                <span className="text-white font-medium text-lg">
                  {otherUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {otherUser.is_online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-gray-900 truncate pr-2">
                {otherUser.business_name || otherUser.username}
              </h3>
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {getRelativeTime(chat.last_message_at)}
              </span>
            </div>

            <div className="flex items-center mb-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Package className="w-4 h-4" />
                <span className="truncate">{chat.product.name}</span>
                <span className="text-gray-400">•</span>
                <span className="font-medium text-blue-600">GH₵{chat.product.sale_price || chat.product.regular_price}</span>
              </div>
            </div>

            <p className={`text-sm truncate ${chat.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {chat.last_message || 'No messages yet'}
            </p>

            <div className="mt-2 flex items-center space-x-4">
              {otherUser.rating && (
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{otherUser.rating}</span>
                </div>
              )}
              {otherUser.is_verified && (
                <div className="flex items-center text-sm text-blue-600">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Verified</span>
                </div>
              )}
              {chat.unread_count > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {chat.unread_count} new
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sidebar Components
  const QuickActions = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        <button className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
          <PinIcon className="w-5 h-5 mr-3 text-blue-500" />
          Pinned Messages
        </button>
        <button className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
          <Archive className="w-5 h-5 mr-3 text-gray-500" />
          Archived
        </button>
        <button className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
          <Trash2 className="w-5 h-5 mr-3 text-red-500" />
          Trash
        </button>
      </div>
    </div>
  );
  const MessageStats = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Stats</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-blue-500 mr-3" />
            <span className="text-gray-700">Active Chats</span>
          </div>
          <span className="font-semibold text-blue-600">{chats.length}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-500 mr-3" />
            <span className="text-gray-700">Pending Responses</span>
          </div>
          <span className="font-semibold text-yellow-600">
            {chats.filter(chat => chat.unread_count > 0).length}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
          <div className="flex items-center">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-gray-700">Completed Deals</span>
          </div>
          <span className="font-semibold text-green-600">0</span>
        </div>
      </div>
    </div>
  );

  const NotificationsPanel = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <button className="text-blue-500 hover:text-blue-600">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-start p-3 bg-blue-50 rounded-xl">
            <Bell className="w-5 h-5 text-blue-500 mt-1 mr-3" />
            <div>
              <p className="text-sm text-gray-700">Enable push notifications to never miss a message</p>
              <button className="mt-2 text-sm text-blue-500 font-medium">Enable Now</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Safety</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-xl">
            <Flag className="w-5 h-5 text-gray-500 mr-3" />
            <span className="text-sm text-gray-700">Report Suspicious Activity</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-gray-500 mr-3" />
            <span className="text-sm text-gray-700">Safety Tips</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-xl">
            <BookmarkIcon className="w-5 h-5 text-gray-500 mr-3" />
            <span className="text-sm text-gray-700">Saved Responses</span>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <div className="max-w-screen-2xl mx-auto p-4 lg:p-8">
        {/* Mobile: Stack with messages first */}
        <div className="block lg:hidden mb-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Message Header */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-white">Messages</h1>
                  <div className="flex items-center space-x-2 text-blue-100">
                    <MessageSquare className="w-5 h-5" />
                    <span>{chats.length} conversations</span>
                  </div>
                </div>
            </div>
            {/* Chat List */}
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-500">
                    When you start conversations with sellers or buyers, they'll appear here
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <ChatListItem key={chat.id} chat={chat} />
                ))
              )}
            </div>
          </div>
          <div className="mt-6 space-y-6">
            <QuickActions />
            <MessageStats />
            <NotificationsPanel />
          </div>
        </div>

        {/* Desktop: Three-column layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <QuickActions />
            <MessageStats />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-white">Messages</h1>
                  <div className="flex items-center space-x-2 text-blue-100">
                    <MessageSquare className="w-5 h-5" />
                    <span>{chats.length} conversations</span>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <option value="all">All Messages</option>
                        <option value="unread">Unread</option>
                        <option value="selling">Selling</option>
                        <option value="buying">Buying</option>
                      </select>
                      <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-100 w-4 h-4" />
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-100 w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat List */}
              <div className="divide-y divide-gray-100">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-500">
                      When you start conversations with sellers or buyers, they'll appear here
                    </p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <ChatListItem key={chat.id} chat={chat} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <NotificationsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;