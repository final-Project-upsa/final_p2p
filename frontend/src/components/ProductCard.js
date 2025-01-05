import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { addFavorite, removeFavorite, fetchFavorites } from '../redux/features/favoriteSlice';
import { addCart, removeCart } from '../redux/features/cartSlice';

import { getMediaUrl } from '../utils/mediaURL';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.items);
  const carts = useSelector(state => state.carts.items);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCart, setIsCart] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
      if (isAuthenticated) {
        dispatch(fetchFavorites());
      }
    }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const isProductFavorited = favorites.some(fav => fav.id === product.id);
    setIsFavorite(isProductFavorited);
  }, [favorites, product.id]);

  useEffect(() => {
    const isProductInCart = carts.some(cart => cart.id === product.id);
    setIsCart(isProductInCart);
  }, [carts, product.id]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

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

  const handleCartClick = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    const token = localStorage.getItem('access');
    const config = {
      headers: {
        'Authorization': `JWT ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    try {
      if (isCart) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/carts/${product.id}/`, config);
        dispatch(removeCart(product.id));
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/carts/${product.id}/`, {}, config);
        dispatch(addCart(product));
      }
      setIsCart(!isCart);
    } catch (error) {
      console.error('Error toggling Cart:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 relative group">
      {/* Favorite Button */}
      <button 
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 z-10 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors duration-200"
      >
        <Heart 
          className={`h-5 w-5 transition-colors duration-200 ${
            isFavorite ? 'text-blue-500 fill-blue-500' : 'text-gray-600 hover:text-blue-500'
          }`}
        />
      </button>

      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={getMediaUrl(product.main_image_url)} 
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-3 left-3 flex items-center bg-white/90 px-2 py-1 rounded-full shadow-sm">
            <Star className="text-yellow-400 fill-current h-4 w-4" />
            <span className="ml-1 text-sm font-medium">{product.rating || 'N/A'}</span>
          </div>
        </div>

        <div className="p-2">
          <div className="flex items-center mb-2">
            <img 
              src={getMediaUrl(product.seller.profile_photo_url)} 
              alt={product.seller.business_name}
              className="w-6 h-6 rounded-full mr-2 border border-gray-200"
            />
            <span className="text-sm text-gray-600 truncate">
              {product.seller.business_name}
            </span>
          </div>

          <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-gray-800">
            {product.name}
          </h3>

          <div className="text-xl font-bold text-blue-600">
            ₵{product.sale_price}
          </div>
        </div>
      </Link>

      <div className="p-2 flex gap-2">
        <Link 
          to={`/product/${product.id}`}
          className="flex-1 flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition duration-300 text-sm"
        >
          View Product
        </Link>
        <button 
          onClick={handleCartClick}
          className="w-10 flex items-center justify-center bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition duration-300"
        >
          <ShoppingCart className={`h-5 w-5 ${
            isCart ? 'text-blue-500 fill-blue-500' : 'text-gray-600 hover:text-blue-500'
          }`} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;