import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Users, TrendingUp, Package, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const ProductAnalytics = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'all'

  useEffect(() => {
    const fetchProductAnalytics = async () => {
      try {
        const token = localStorage.getItem('access');
        const config = {
          headers: {
            'Authorization': `JWT ${token}`,
            'Accept': 'application/json'
          }
        };

        // Fetch product details and favorites in parallel
        const [productRes, favoritesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/product/${id}/`, config),
          axios.get(`${process.env.REACT_APP_API_URL}/api/favorites/${id}/?seller_analytics=true`, config)
        ]);

        setProduct(productRes.data);
        setFavorites(favoritesRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error loading product analytics: {error}</div>
      </div>
    );
  }

  // Prepare data for the timeline chart
  const getFavoritesByDate = () => {
    const grouped = favorites.reduce((acc, fav) => {
      const date = new Date(fav.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      favorites: count
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Product Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product?.name}</h1>
        <p className="text-gray-600">{product?.description}</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold">{favorites.length}</span>
          </div>
          <h3 className="text-gray-600">Total Favorites</h3>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">
              {new Set(favorites.map(f => f.user_id)).size}
            </span>
          </div>
          <h3 className="text-gray-600">Unique Users</h3>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold">{product?.stock}</span>
          </div>
          <h3 className="text-gray-600">Current Stock</h3>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold">
              {new Date(product?.created_at).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-gray-600">Listed Date</h3>
        </div>
      </div>

      {/* Favorites Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-6">Favorites Timeline</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getFavoritesByDate()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="favorites" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Who Favorited */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Users Who Favorited</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">User</th>
                <th className="text-left py-3">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((favorite) => (
                <tr key={favorite.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">User #{favorite.user_id}</td>
                  <td className="py-3">
                    {new Date(favorite.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalytics;