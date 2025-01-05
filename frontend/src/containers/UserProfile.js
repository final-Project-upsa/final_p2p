import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { getMediaUrl } from '../utils/mediaURL';
import { 
  Heart, 
  Package, 
  Star, 
  Settings, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  ShoppingBag,
  ChevronRight,
  Loader2,
  TrendingUp,
  Clock,
  Gift,
  MessageCircle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites, clearFavorites } from '../redux/features/favoriteSlice';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const MetricCard = ({ title, value, icon: Icon, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
    <div className="flex items-center space-x-4">
      <div className="p-3 rounded-lg bg-blue-50">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  </div>
);

const UserProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.items);
  const favoritesLoading = useSelector(state => state.favorites.loading);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('access');
        const config = {
          headers: {
            'Authorization': `JWT ${token}`,
            'Accept': 'application/json'
          }
        };

        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/users/me/`,
          config
        );

        const currentUserId = userResponse.data.id;
        const profileResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/userprofile/${currentUserId}/`, 
          config
        );

        setProfileData(profileResponse.data);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const getRecentActivities = (orders, favorites, chats) => {
    console.log("Favorites: ", favorites);
    console.log("Chats: ", chats);

    // In getRecentActivities:
    const activities = [
      // Chats mapping stays the same
      ...((chats || []).map(chat => ({
        type: 'chat',
        date: new Date(chat.created_at),
        data: {
          id: chat.id,
          product_name: chat.product?.name || 'Unknown Product',
          other_participant: chat.other_participant
        }
      }))),
      // Updated favorites mapping to match the data structure
      ...(favorites || []).map(favorite => ({
        type: 'favorite',
        date: new Date(favorite.created_at),
        data: {
          id: favorite.id,
          product_name: favorite.name,  // Use favorite.name instead of product_name
          category: favorite.categories?.[0]?.name || 'Uncategorized'  // Get category name if available
        }
      }))
    ];

    console.log("Combined Activities before sort: ", activities);
    const sortedActivities = activities.sort((a, b) => b.date - a.date).slice(0, 5);
    console.log("Final sorted activities: ", sortedActivities);
    console.log("Final activities:", activities);
    
    return sortedActivities;
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600 animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Profile not found'}
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't load the profile data. Please try again later.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const { user_data: user, user_seller_data: seller, user_orders: orders } = profileData;
  const recentActivities = getRecentActivities(orders, favorites, profileData?.user_chats);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-4 py-8">
        {/* Profile Header - Full Width */}
        <div className="bg-white shadow-sm mb-6 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <div className="px-4 py-6 relative">
            <div className="sm:flex sm:items-end sm:space-x-5">
              <div className="relative -mt-24 flex">
                <div className="w-36 h-36 rounded-full ring-4 ring-white bg-gray-200 overflow-hidden">
                  {user.is_seller && seller?.profile_photo ? (
                    <img 
                      src={getMediaUrl(seller.profile_photo_url)}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-600">
                        {user.first_name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                <div className="sm:hidden md:block min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">
                    {`${user.first_name} ${user.last_name}`.trim() || user.username}
                  </h1>
                  <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {user.email}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {seller?.region || 'No region specified'}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <Link 
                    to={user.is_seller ? "/dashboard" : "/enroll_seller"}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    {user.is_seller ? 'Seller Dashboard' : 'Start Selling'}
                  </Link>
                  <Link 
                    to="/settings"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Activity & Metrics */}
          <div className="col-span-12 lg:col-span-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <MetricCard 
                title="Total Orders"
                value={orders?.length || 0}
                icon={ShoppingBag}
                description="Lifetime orders placed"
              />
              <MetricCard 
                title="Wishlist Items"
                value={favorites.length}
                icon={Heart}
                description="Saved for later"
              />
              <MetricCard 
                title="Wallet Balance"
                value="GH₵0.00"
                icon={Package}
                description="Available balance"
              />
            </div>

            {/* Updated Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivities && recentActivities.length > 0 ? (
            <div className="space-y-6">
              {recentActivities.map((activity, index) => (
                <div key={`${activity.type}-${index}`} className="flex items-start space-x-4">
                  {/* Icon Container */}
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'order' ? 'bg-blue-50' : 
                    activity.type === 'chat' ? 'bg-indigo-50' : 
                    'bg-pink-50'
                  }`}>
                    {activity.type === 'order' ? (
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    ) : activity.type === 'chat' ? (
                      <MessageCircle className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <Heart className="w-6 h-6 text-pink-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.type === 'order' ? (
                        `Placed order #${activity.data.id}`
                      ) : activity.type === 'chat' ? (
                        `Chat about ${activity.data.product_name}`
                      ) : (
                        `Saved ${activity.data.product_name || activity.data.name || activity.data.category || 'Product'} for later`
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.type === 'order' ? (
                        `Order placed on ${activity.date.toLocaleDateString()}`
                      ) : activity.type === 'chat' ? (
                        `With ${activity.data.other_participant.seller?.business_name || activity.data.other_participant.username} • ${activity.date.toLocaleDateString()}`
                      ) : (
                        `Added to wishlist • ${activity.date.toLocaleDateString()}`
                      )}
                    </p>
                  </div>

                  {/* Action/Status */}
                  {activity.type === 'order' ? (
                    <StatusBadge status={activity.data.status} />
                  ) : activity.type === 'chat' ? (
                    <Link 
                      to={`/chatroom/${activity.data.id}`}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      View Chat →
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your recent activities will appear here
              </p>
            </div>
          )}
        </div>
      </div>

            {/* Recommendations or Featured Items */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Gift className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Complete Your Profile</h3>
                      <p className="mt-1 text-sm text-gray-500">Add more details to personalize your experience</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Explore Marketplace</h3>
                      <p className="mt-1 text-sm text-gray-500">Discover new products and sellers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Business Info */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-500">
                      {user.phone_number || seller?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Region</p>
                    <p className="text-sm text-gray-500">
                      {user?.region || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            {user.is_seller && seller ? (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Business Name</h3>
                    <p className="mt-1 text-sm text-gray-500">{seller.business_name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Business Type</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {seller.business_type || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Operating Hours</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {seller.business_hours || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Delivery Coverage</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {seller.delivery_radius ? `${seller.delivery_radius} km radius` : 'Not specified'}
                    </p>
                  </div>

                  {seller.website && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Website</h3>
                      <a 
                        href={seller.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-blue-600 hover:text-blue-500 flex items-center"
                      >
                        Visit Website
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Start Selling Today</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Turn your passion into a business
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/enroll_seller"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Ratings & Reviews Summary - Only for Sellers */}
            {user.is_seller && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Ratings & Reviews</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="ml-2 text-lg font-semibold text-gray-900">--</span>
                    </div>
                    <span className="text-sm text-gray-500">Based on -- reviews</span>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <span className="text-sm text-gray-600 w-8">{rating}</span>
                        <div className="flex-1 h-2 mx-2 bg-gray-100 rounded">
                          <div className="h-2 bg-yellow-400 rounded" style={{ width: '0%' }} />
                        </div>
                        <span className="text-sm text-gray-500">0</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;