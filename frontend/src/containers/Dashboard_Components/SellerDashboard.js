import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Package, Store, ChevronRight } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const DashboardMetricCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 rounded-lg bg-blue-50">{icon}</div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-xl md:text-2xl font-bold mt-1">{value}</p>
  </div>
);

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const access = useSelector((state) => state.auth.access);
  const [sellerId, setSellerId] = useState(null);

  useEffect(() => {
    const fetchUserAndDashboard = async () => {
      if (!access) {
        setLoading(false);
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
          setLoading(false);
          return;
        }

        const currentSellerId = userResponse.data.seller_id;
        setSellerId(currentSellerId);

        const dashboardResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/seller_dashboardd/${currentSellerId}/`,
          config
        );

        setDashboardData(dashboardResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndDashboard();
  }, [access]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center text-red-600">Error loading dashboard data</div>
      </div>
    );
  }

  const { seller, metrics, recent_orders } = dashboardData;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back, {seller.business_name}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <DashboardMetricCard
            title="Total Revenue"
            value={`GH₵${metrics.total_revenue.toLocaleString()}`}
            icon={<Package className="w-6 h-6 text-blue-600" />}
          />
          <DashboardMetricCard
            title="Total Orders"
            value={metrics.total_orders}
            icon={<Store className="w-6 h-6 text-blue-600" />}
          />
          <DashboardMetricCard
            title="Active Products"
            value={metrics.active_products}
            icon={<Package className="w-6 h-6 text-blue-600" />}
          />
          <DashboardMetricCard
            title="Total Products"
            value={metrics.total_products}
            icon={<Package className="w-6 h-6 text-blue-600" />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenue Overview</h3>
            </div>
            <div className="h-60 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recent_orders}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="created_at" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="total_amount" 
                    stroke="#2563EB" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-600">Order ID</th>
                    <th className="pb-3 font-medium text-gray-600">Amount</th>
                    <th className="pb-3 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm">#{order.id}</td>
                      <td className="py-3 text-sm">${order.total_amount}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-lg font-semibold mb-4">Store Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Business Address</p>
              <p className="font-medium">{seller.business_address}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Contact</p>
              <p className="font-medium">{seller.phone}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Business Hours</p>
              <p className="font-medium">{seller.business_hours}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Delivery Radius</p>
              <p className="font-medium">{seller.delivery_radius} km</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Business Type</p>
              <p className="font-medium">{seller.business_type}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Website</p>
              <p className="font-medium">
                {seller.website ? (
                  <a 
                    href={seller.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline overflow-hidden text-ellipsis block"
                  >
                    Visit Website
                  </a>
                ) : (
                  'Not provided'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;