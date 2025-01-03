import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Heart, User, Menu, X, LogOut, LayoutDashboard, Mail } from 'lucide-react';
import { connect } from 'react-redux';
import { logout } from '../actions/auth';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites, clearFavorites } from '../redux/features/favoriteSlice';
import { fetchNotifications } from '../redux/features/notificationSlice';
import FavoritesPanel from './FavoritesPanel';
import NotificationsPanel from './NotificationsPanel';

const NavBar = ({ auth: { isAuthenticated, user }, logout }) => {
  // Existing state and hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Redux selectors
  const favorites = useSelector(state => state.favorites.items);
  const unreadCount = useSelector(state => state.notifications.unreadCount);

  // Fetch data on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFavorites());
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  // Existing click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Existing handlers
  const handleLogout = () => {
    dispatch(clearFavorites());
    logout();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 w-full">
      <div className="max-w-[100vw] mx-auto">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and hamburger menu */}
            <div className="flex items-center">
              <button 
                className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-blue-600">TrustTrade</h1>
            </div>

            {/* Middle - Navigation Links (unchanged) */}
            <div className="hidden md:flex items-center space-x-8">
                <a href="/marketplace" className="text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors">Home</a>
                <a href="#" className="text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors">Categories</a>
                <a href="#" className="text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors">Deals</a>
                <a 
                href={user?.is_seller ? "/dashboard" : "/enroll_seller"} 
                className="text-gray-700 text-sm font-medium hover:text-blue-600 transition-colors"
                >
                {user?.is_seller ? "Dashboard" : "Sell"}
                </a>
            </div>

            {/* Right side - Search and Actions */}
            <div className="flex items-center space-x-1 md:space-x-4">
              {/* Search bar (unchanged) */}
              <div className="relative hidden md:flex">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-64 pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              </div>

              {/* Mobile search button */}
              <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Search className="h-5 w-5 text-gray-600" />
              </button>

              {/* Favorites button */}
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg relative group"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/auth/user');
                    return;
                  }
                  setIsFavoritesOpen(true);
                }}
              >
                <Heart className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                {isAuthenticated && favorites.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>

              {/* Notifications button */}
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg relative group"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/auth/user');
                    return;
                  }
                  setIsNotificationsOpen(true);
                }}
              >
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                {isAuthenticated && unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>

              {/* User dropdown (unchanged) */}
              <div className="relative">
                <button 
                ref={buttonRef}
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={toggleDropdown}
              >
                <User className="h-5 w-5 text-gray-600" />
              </button>

              {isDropdownOpen && (
                <div 
                  ref={dropdownRef} 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Welcome back,</p>
                        <p className="text-sm text-gray-500 truncate">{user?.username || user?.email}</p>
                      </div>
                      <div className="py-1">
                        <button 
                          onClick={() => navigate('/userprofile')} 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </button>
                        {user?.is_seller && (
                          <button 
                            onClick={() => navigate('/dashboard')} 
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <LayoutDashboard className="mr-3 h-4 w-4" />
                            Seller Dashboard
                          </button>
                        )}
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => navigate('/inbox')}
                        >
                          <Mail className="mr-3 h-4 w-4" />
                          Inbox
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Heart className="mr-3 h-4 w-4" />
                          Wishlist
                        </button>
                      </div>
                      <div className="border-t border-gray-100 mt-1">
                        <button 
                          onClick={handleLogout} 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-1">
                      <button 
                        onClick={() => navigate('/auth/user')} 
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        Log in
                      </button>
                      <button 
                        onClick={() => navigate('/signup')} 
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        Register
                      </button>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden z-50`}
      >
        {/* Sidebar header */}
        <div className="h-full flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-600">TrustTrade</h2>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {/* Main navigation links */}
              <a href="/marketplace" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
                Home
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
                Categories
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
                Deals
              </a>
              <a 
                href={user?.is_seller ? "/dashboard" : "/enroll_seller"}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                {user?.is_seller ? "Your Dashboard" : "Sell"}
              </a>
             

              {/* User account section */}
              {isAuthenticated ? (
                <>
                  <div className="pt-4 pb-2">
                    <div className="px-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Your Account
                      </p>
                    </div>
                    <div className="mt-3 space-y-1">
                      {/* Profile link */}
                      <a 
                        href="/userprofile" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <User className="mr-3 h-4 w-4" />
                        Profile
                      </a>

                      {/* Favorites button */}
                      <button 
                        onClick={() => {
                          setIsMobileSidebarOpen(false);
                          setIsFavoritesOpen(true);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <Heart className="mr-3 h-4 w-4" />
                        Favorites
                        {favorites.length > 0 && (
                          <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                            {favorites.length}
                          </span>
                        )}
                      </button>

                      {/* Notifications button */}
                      <button 
                        onClick={() => {
                          setIsMobileSidebarOpen(false);
                          setIsNotificationsOpen(true);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <Bell className="mr-3 h-4 w-4" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Logout button */}
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Login/Register buttons for non-authenticated users
                <div className="pt-4">
                  <div className="px-3 space-y-2">
                    <button
                      onClick={() => navigate('/auth/user')}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => navigate('/signup')}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </aside>

      {/* Panels */}
      <FavoritesPanel
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
      />
      
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </nav>
  );
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { logout })(NavBar);