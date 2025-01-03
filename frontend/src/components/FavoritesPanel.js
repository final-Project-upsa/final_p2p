import React, { useState, useEffect } from 'react';
import { Heart, Loader2, Trash2, ChevronRight, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFavorite } from '../redux/features/favoriteSlice';
import axios from 'axios';
import { getMediaUrl } from '../utils/mediaURL';

const FavoritesPanel = ({ 
  isOpen, 
  onClose, 
  loading = false,
  className = '' 
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const favorites = useSelector(state => state.favorites.items);
  const { isAuthenticated } = useSelector(state => state.auth);

  const handleRemoveFavorite = async (productId) => {
    if (!isAuthenticated) {
      return;
    }

    const token = localStorage.getItem('access');
    const config = {
      headers: {
        'Authorization': `JWT ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/favorites/${productId}/`, config);
      dispatch(removeFavorite(productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const filteredFavorites = favorites.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className={`
        fixed inset-0 z-50 bg-black/25 backdrop-blur-sm
        md:absolute md:inset-auto md:right-0 md:top-full md:w-[420px] md:mt-2
        transform transition-all duration-200 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        ${className}
      `}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`
          absolute right-0 h-full w-full max-w-[420px] bg-white shadow-xl
          transform transition-all duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          md:h-auto md:rounded-xl md:max-h-[85vh]
        `}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Favorites</h3>
              <p className="text-sm text-gray-500">{favorites.length} items saved</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredFavorites.length > 0 ? (
          <div className="overflow-y-auto max-h-[calc(85vh-120px)] divide-y divide-gray-100">
            {filteredFavorites.map((item) => (
              <div 
                key={item.id} 
                className="group relative hover:bg-gray-50 transition-colors"
              >
                <div className="flex p-4 items-start space-x-4">
                  <div 
                    className="relative flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <img 
                      src={getMediaUrl(item.main_image_url)} 
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    {item.discount_percentage > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        -{item.discount_percentage}%
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2"
                    >
                      {item.name}
                    </h4>
                    
                    <div className="mt-1 flex items-baseline space-x-2">
                      <span className="text-lg font-semibold text-blue-600">₵{item.sale_price}</span>
                      {item.original_price && (
                        <span className="text-sm text-gray-500 line-through">₵{item.original_price}</span>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-sm text-gray-500 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        In Stock
                      </span>
                      <span className="text-sm text-gray-500">{item.seller_name}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFavorite(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 stroke-1 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching items found' : 'No favorites yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Items added to your favorites will appear here'
              }
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Explore Products
            </button>
          </div>
        )}

        {/* Footer */}
        {filteredFavorites.length > 0 && (
          <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100">
            <button
              onClick={() => navigate('/wishlist')}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Favorites
              <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPanel;