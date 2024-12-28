import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getMediaUrl } from '../../utils/mediaURL';
import { useNavigate } from 'react-router-dom';

import {
  LayoutDashboard,
  Package,
  Store,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react';

// Moved SidebarLink outside
const SidebarLink = ({ icon, text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="font-medium">{text}</span>
  </button>
);

// Moved Sidebar component outside of DashboardLayout
const Sidebar = ({ 
  sellerData, 
  activeSection, 
  setActiveSection, 
  isSidebarOpen, 
  setIsSidebarOpen,
  handleNavigate 
}) => (
  <div 
    className={`fixed lg:relative w-64 bg-white flex flex-col shadow-sm z-50 transition-transform duration-300 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}
    style={{
      height: '100dvh',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto'
    }}
  >
    {/* Profile Section */}
    <div className="p-6 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={getMediaUrl(sellerData?.profile_photo_url) || '/default-profile.png'}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {sellerData?.business_name || 'Loading...'}
            </h2>
            <p className="text-xs text-gray-500 truncate">Seller Account</p>
          </div>
        </div>
        <button 
          className="lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>
    </div>

    {/* Main Navigation */}
    <div className="overflow-y-auto py-4">
      <div className="space-y-1 px-3">
        <SidebarLink
          icon={<LayoutDashboard className="w-5 h-5" />}
          text="Dashboard"
          active={activeSection === 'dashboard'}
          onClick={() => {
            setActiveSection('dashboard');
            handleNavigate('/dashboard');
          }}
        />
        <SidebarLink
          icon={<Package className="w-5 h-5" />}
          text="Products"
          active={activeSection === 'products'}
          onClick={() => {
            setActiveSection('products');
            handleNavigate('/dashboard/products');
          }}
        />
        <SidebarLink
          icon={<Store className="w-5 h-5" />}
          text="Orders"
          active={activeSection === 'orders'}
          onClick={() => {
            setActiveSection('orders');
            handleNavigate('/dashboard/orders');
          }}
        />
        <SidebarLink
          icon={<Users className="w-5 h-5" />}
          text="Customers"
          active={activeSection === 'customers'}
          onClick={() => {
            setActiveSection('customers');
            handleNavigate('/dashboard/customers');
          }}
        />
        <SidebarLink
          icon={<TrendingUp className="w-5 h-5" />}
          text="Analytics"
          active={activeSection === 'analytics'}
          onClick={() => {
            setActiveSection('analytics');
            handleNavigate('/dashboard/analytics');
          }}
        />
      </div>
    </div>

    {/* Bottom Actions */}
    <div className="border-t p-3 bg-white">
      <div className="space-y-1">
        <SidebarLink
          icon={<Settings className="w-5 h-5" />}
          text="Settings"
          active={activeSection === 'settings'}
          onClick={() => {
            setActiveSection('settings');
            handleNavigate('/dashboard/settings');
          }}
        />
        <SidebarLink
          icon={<LogOut className="w-5 h-5" />}
          text="Back to Marketplace"
          active={false}
          onClick={() => handleNavigate('/marketplace')}
        />
      </div>
    </div>
  </div>
);

const DashboardLayout = ({ children }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const access = useSelector((state) => state.auth.access);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndDashboard = async () => {
      if (!access) {
        setError('No access token found');
        setLoading(false);
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `JWT ${access}`,
          Accept: 'application/json',
        },
      };

      try {
        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/users/me/`,
          config
        );

        if (!userResponse.data.is_seller) {
          setError('User is not a seller');
          setLoading(false);
          navigate('/marketplace');
          return;
        }

        const dashboardResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/seller_dashboardd/${userResponse.data.seller_id}/`,
          config
        );

        setSellerData({
          ...dashboardResponse.data.seller,
          metrics: dashboardResponse.data.metrics,
          recent_orders: dashboardResponse.data.recent_orders
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.detail || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndDashboard();
  }, [access, navigate]);

  const handleNavigate = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  if (loading && !sellerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        sellerData={sellerData}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleNavigate={handleNavigate}
      />
      <div className="flex-1 flex flex-col h-screen">
        <button
          className="lg:hidden fixed top-4 left-4 z-40 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        
        <main className="flex-1 overflow-auto pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;