import React, { useState } from 'react';
import { Clock, Shield, MapPin, CheckCircle2, Star, Loader2 } from 'lucide-react';
import { getDisplayName, LetterAvatar } from '../../utils/userDisplay';
import { getMediaUrl } from '../../utils/mediaURL';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-full">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
);

const StepIndicator = () => (
  <div className="bg-white rounded-2xl p-4 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
    <div className="relative">
      <div className="absolute top-[2.5rem] left-0 w-full h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
          style={{width: '40%'}} 
        />
      </div>
      
      <div className="flex justify-between">
        {[
          { label: 'Trade Started', status: 'completed', date: '12/20/23' },
          { label: 'Payment Made', status: 'completed', date: '12/21/23' },
          { label: 'Order Shipped', status: 'pending', date: null },
          { label: 'Order Received', status: 'pending', date: null },
          { label: 'Trade Completed', status: 'pending', date: null }
        ].map((step, idx) => (
          <div key={step.label} className="relative" style={{width: '20%'}}>
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center z-10 
                transition-all duration-300 transform
                ${step.status === 'completed' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 scale-110' 
                  : 'bg-gray-200'}`}
              >
                <CheckCircle2 className={`
                  w-4 h-4 lg:w-6 lg:h-6 
                  ${step.status === 'completed' ? 'text-white' : 'text-gray-400'}
                `} />
              </div>
              <div className="mt-4 text-center">
                <div className={`
                  text-[10px] lg:text-sm font-medium
                  ${step.status === 'completed' ? 'text-blue-600' : 'text-gray-400'}
                `}>
                  {step.label}
                </div>
                {step.date && (
                  <div className="text-[8px] lg:text-xs text-gray-400 mt-1">
                    {step.date}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const getProductImages = (product) => {
  const images = [];
  if (product.main_image_url) images.push(product.main_image_url);
  if (product.image1_url) images.push(product.image1_url);
  if (product.image2_url) images.push(product.image2_url);
  if (product.image3_url) images.push(product.image3_url);
  if (product.image4_url) images.push(product.image4_url);
  if (product.image5_url) images.push(product.image5_url);
  return images.filter(Boolean);
};

const ActionPanel = ({ chat, currentUser, isLoading }) => {
  const [activeImage, setActiveImage] = useState(0);
  
  if (isLoading || !chat || !chat.product) return <LoadingSpinner />;
  
  const isSeller = currentUser?.id === chat.product.seller.id;
  const otherUser = isSeller ? chat.other_participant : chat.product.seller;
  const displayName = getDisplayName(otherUser, !isSeller);
  const productImages = getProductImages(chat.product);
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="px-4 lg:px-8 py-4 space-y-6">
        <StepIndicator />
        
        {/* Product Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          {/* Product Images Section */}
          {productImages.length > 0 && (
            <>
              <div className="relative aspect-video mb-4 rounded-xl overflow-hidden group">
                <img 
                  src={getMediaUrl(productImages[activeImage])} 
                  alt="Product" 
                  className="w-full h-full object-cover transform transition-transform group-hover:scale-105" 
                />
                {/* Image Navigation Dots */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {productImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`w-2 h-2 rounded-full transition-all
                          ${activeImage === idx 
                            ? 'bg-blue-500 w-4' 
                            : 'bg-white/70 hover:bg-white'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Thumbnail Navigation */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 mb-4 overflow-x-auto custom-scrollbar">
                  {productImages.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative rounded-xl overflow-hidden flex-shrink-0 w-20 aspect-video
                        ${activeImage === idx 
                          ? 'ring-2 ring-blue-500' 
                          : 'opacity-60 hover:opacity-100'} 
                        transition-all`}
                    >
                      <img 
                        src={getMediaUrl(image)} 
                        alt={`View ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Rest of the component remains the same */}
          {/* Product Information */}
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">
            {chat.product.name}
          </h2>
          <div className="flex items-center space-x-3 mb-4">
            <p className="text-3xl font-bold text-blue-600">
              ${chat.product.sale_price || chat.product.regular_price}
            </p>
            {chat.product.sale_price && (
              <p className="text-lg text-gray-400 line-through">
                ${chat.product.regular_price}
              </p>
            )}
          </div>
          <p className="text-gray-600 leading-relaxed">
            {chat.product.description}
          </p>
          
          {/* Additional Product Details */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Listed {new Date(chat.product.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{chat.product.location || 'Location not specified'}</span>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {isSeller ? "Buyer Information" : "Seller Information"}
            </h3>
            {otherUser.is_verified && (
              <div className="flex items-center text-blue-500">
                <Shield className="w-5 h-5 mr-1" />
                <span className="text-sm">Verified</span>
              </div>
            )}
          </div>

          <div className="flex items-start">
            <div className="relative">
              {otherUser.profile_photo ? (
                <img 
                  src={getMediaUrl(otherUser.profile_photo)} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100"
                />
              ) : (
                <LetterAvatar 
                  name={displayName}
                  className="w-16 h-16 text-xl"
                />
              )}
              {otherUser.is_online && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full ring-2 ring-white" />
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex items-center mb-3">
                <h4 className="font-semibold text-lg">{displayName}</h4>
                {otherUser.badge && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {otherUser.badge}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <span>{otherUser.rating || 'No ratings'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{otherUser.response_time || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{otherUser.region || 'Location not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <span>{otherUser.successful_trades || 0} successful trades</span>
                </div>
              </div>
              
              {/* User Stats */}
              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {otherUser.response_rate || '0%'}
                  </div>
                  <div className="text-xs text-gray-500">Response Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {otherUser.items_sold || '0'}
                  </div>
                  <div className="text-xs text-gray-500">Items Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {otherUser.join_date ? new Date(otherUser.join_date).getFullYear() : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Member Since</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Safety Notice Card */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Safety Notice</h4>
              <p className="text-yellow-700 text-sm leading-relaxed">
                To ensure your safety and security, all trades must be conducted solely within the platform.
                Any requests to trade outside are suspicious and could be scams. Never share personal financial
                information or make payments through unofficial channels.
              </p>
              <div className="mt-4 flex items-center text-yellow-600 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>Report suspicious activity to our support team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;