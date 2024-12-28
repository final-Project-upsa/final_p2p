import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaURL';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { addFavorite, removeFavorite } from '../redux/features/favoriteSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.items);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    const isProductFavorited = favorites.some(fav => fav.id === product.id);
    setIsFavorite(isProductFavorited);
  }, [favorites, product.id]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    
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
      if (isFavorite) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/favorites/${product.id}/`, config);
        dispatch(removeFavorite(product.id));
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/favorites/${product.id}/`, {}, config);
        dispatch(addFavorite(product));
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.id}`} className="block">
        <img src={getMediaUrl(product.main_image_url)} alt={product.name} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xl font-bold text-blue-600">
              ₵{product.sale_price}
            </span>
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-current h-5 w-5" />
              <span className="ml-1 text-sm text-gray-600">{product.rating || 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center mb-2">
            <img src={getMediaUrl(product.seller.profile_photo_url)} alt={product.seller.business_name} className="w-6 h-6 rounded-full mr-2" />
            <h5 className="text-sm text-gray-600 truncate">{product.seller.business_name}</h5>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 flex justify-between">
        <Link 
          to={`/product/${product.id}`}
          className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition duration-300 flex-grow mr-2 text-center"
        >
          View Item
        </Link>
        <button 
          onClick={handleFavoriteClick}
          className={`border border-blue-600 p-2 rounded-lg transition duration-300 ${
            isFavorite ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;