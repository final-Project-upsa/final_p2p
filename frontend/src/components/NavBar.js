import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Heart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { connect } from 'react-redux';
import { logout } from '../actions/auth';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites, clearFavorites } from '../redux/features/favoriteSlice';
import FavoritesPanel from './FavoritesPanel';

const NavBar = ({ auth: { isAuthenticated, user }, logout }) => {
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.items);
  const loading = useSelector(state => state.favorites.loading);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false); // New state for favorites panel
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFavorites());
    }
  }, [isAuthenticated, dispatch]);

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

  const handleLogout = () => {
    dispatch(clearFavorites());
    logout();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRemoveFromFavorites = (id) => {
    // Implement remove from favorites functionality
    console.log('Remove from favorites:', id);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-blue-600">TrustTrade</h1>
          </div>

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

          <div className="flex items-center space-x-1 md:space-x-4">
            <div className="relative hidden md:flex">
              <input
                type="text"
                placeholder="Search products..."
                className="w-64 pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            </div>

            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Search className="h-5 w-5 text-gray-600" />
            </button>

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

            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>

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
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Bell className="mr-3 h-4 w-4" />
                          Notifications
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

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden z-50`}
      >
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
          
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
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
              {isAuthenticated ? (
                <>
                  <div className="pt-4 pb-2">
                    <div className="px-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Your Account
                      </p>
                    </div>
                    <div className="mt-3 space-y-1">
                      <a 
                        href="/userprofile" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <User className="mr-3 h-4 w-4" />
                        Profile
                      </a>
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
                      <a 
                        href="#" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <Bell className="mr-3 h-4 w-4" />
                        Notifications
                      </a>
                      <button 
                        onClick={handleLogout}
                        className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
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
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-auto"
                  src="/api/placeholder/32/32"
                  alt="Store logo"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Need Help?</p>
                <p className="text-xs text-gray-500">Contact Support</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* New Favorites Panel */}
      <FavoritesPanel
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        loading={loading}
        onRemove={handleRemoveFromFavorites}
      />
    </nav>
  );
};

const mapStateToProps = state => ({
  auth: state.auth
});



export default connect(mapStateToProps, { logout })(NavBar);