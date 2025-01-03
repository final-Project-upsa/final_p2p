import React, { useState } from 'react';
import { Clock, Shield, MapPin, CheckCircle2, Star, Loader2, MessageCircle, Package, AlertTriangle } from 'lucide-react';
import { getDisplayName, LetterAvatar } from '../../utils/userDisplay';
import { getMediaUrl } from '../../utils/mediaURL';
import { StepIndicator, getProductImages, TRADE_STATUSES } from './TradeProgress.js';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-full">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
);

const ActionButton = ({ onClick, variant = 'primary', disabled = false, children, icon: Icon, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center justify-center gap-2
      w-full px-6 py-4 rounded-2xl font-medium text-sm
      transform transition-all duration-200 hover:scale-[1.02]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      ${variant === 'primary' 
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl' 
        : variant === 'danger'
        ? 'border border-red-200 bg-white text-red-500 hover:bg-red-50'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
      ${className}
    `}
  >
    {Icon && <Icon className="w-5 h-5" />}
    {children}
  </button>
);

const TradeBanner = ({ product, tradeStatus, isSeller, otherUser }) => {
  console.log('otherUser:', otherUser);
  console.log('product.seller:', product?.seller);
  const getDisplayStatus = () => {
    if (!tradeStatus || tradeStatus === 'initial') return 'Trade Started';
    return tradeStatus.replace(/_/g, ' ').toUpperCase();
  };

  const getTradeText = () => {
    if (isSeller) {
      return `Selling ${product.name} to ${getDisplayName(otherUser, true)}`;
    }
    return `Buying ${product.name} from ${product.seller.business_name}`;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-3xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-32 -translate-y-32" />
      <div className="relative">
        <h2 className="text-sm font-medium opacity-80">Trade Status</h2>
        <div className="mt-2 flex items-center gap-3">
          <MessageCircle className="w-6 h-6" />
          <h1 className="text-xl md:text-2xl font-bold">{getTradeText()}</h1>
        </div>
        <div className="mt-4 inline-block px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
          {getDisplayStatus()}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, images, activeImage, setActiveImage }) => (
  <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm">
    <div className="relative aspect-[16/9] mb-4 rounded-2xl overflow-hidden bg-gray-100">
      {images.length > 0 ? (
        <img 
          src={getMediaUrl(images[activeImage])} 
          alt="Product" 
          className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105" 
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <Package className="w-12 h-12" />
        </div>
      )}
    </div>

    {images.length > 1 && (
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={`
              relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden
              ${activeImage === idx ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'} 
              transition-all duration-200
            `}
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

    <h2 className="text-xl font-bold mb-3 text-gray-900">{product.name}</h2>
    <div className="flex items-center gap-4 mb-4">
      <p className="text-2xl font-bold text-blue-600">GH₵ {product.sale_price || product.regular_price}</p>
      {product.sale_price && (
        <p className="text-lg text-gray-400 line-through">GH₵ {product.regular_price}</p>
      )}
    </div>

    <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-500 mb-4 gap-2">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>Listed {new Date(product.created_at).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        <span>{product.seller?.region || 'Location not specified'}</span>
      </div>
    </div>

    <p className="text-gray-600 leading-relaxed">{product.description}</p>
  </div>
);

const UserCard = ({ user, role, isOnline }) => {
  if (!user) return null; // Add early return if user is null
  
  // Helper function to get the correct business name or username
  const getCardDisplayName = (user, isBuyer) => {
    // If user has a direct business_name (seller profile)
    if (!isBuyer && user.business_name) {
      return user.business_name;
    }
    // If user has a nested seller profile with business_name
    if (!isBuyer && user.seller?.business_name) {
      return user.seller.business_name;
    }
    // Fallback to username
    return user.username || 'Unknown User';
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="relative">
        {/* Check for pp */}
        {(user?.profile_photo || user?.seller?.profile_photo) ? (
          <img 
            src={getMediaUrl(user?.profile_photo || user?.seller?.profile_photo)} 
            alt="Profile" 
            className="w-12 h-12 rounded-xl object-cover"
          />
        ) : (
          <LetterAvatar 
            name={getCardDisplayName(user, role === 'buyer')}
            className="w-12 h-12 rounded-xl text-lg"
          />
        )}
        {isOnline && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium truncate">
            {getCardDisplayName(user, role === 'buyer')}
          </h4>
          {user?.is_verified && <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />}
          <span className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded-full">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        </div>
        
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{(user?.rating || user?.seller?.rating) || 'New'}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{(user?.successful_trades || user?.seller?.successful_trades) || 0} trades</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SafetyTips = () => (
  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 md:p-6 border border-amber-200/50">
    <div className="flex gap-3">
      <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div>
        <h4 className="font-medium text-amber-900 mb-2">Safety Tips</h4>
        <ul className="space-y-2 text-sm text-amber-700">
          <li>• Never trade outside the platform</li>
          <li>• Don't share personal financial info</li>
          <li>• Report suspicious activity</li>
          <li>• Wait for escrow confirmation</li>
        </ul>
      </div>
    </div>
  </div>
);

const ActionPanel = ({ chat, currentUser, isLoading, onUpdateTradeStatus }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (isLoading || !chat || !chat.product) return <LoadingSpinner />;
  
  const isSeller = currentUser?.id === chat.product.seller.id;
  const otherUser = isSeller ? chat.other_participant : chat.product.seller;
  const productImages = getProductImages(chat.product);
  const tradeStatus = chat.trade_status || 'initial';

  const handleTradeAction = async (action) => {
    setIsProcessing(true);
    try {
      await onUpdateTradeStatus(action);
    } catch (error) {
      console.error('Failed to update trade status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTradeActions = () => {
    const actions = {
      buyer: {
        initial: [
          { 
            label: `Pay Now (GH₵ ${chat.product.sale_price || chat.product.regular_price})`, 
            action: 'make_payment', 
            variant: 'primary'
          }
        ],
        accepted: [
          { 
            label: `Pay Now (GH₵ ${chat.product.sale_price || chat.product.regular_price})`, 
            action: 'make_payment', 
            variant: 'primary'
          }
        ],
        shipped: [
          { 
            label: 'Confirm Receipt', 
            action: 'confirm_received', 
            variant: 'primary' 
          }
        ]
      },
      seller: {
        payment_received: [
          { 
            label: 'Mark as Shipped', 
            action: 'mark_shipped', 
            variant: 'primary'
          }
        ],
        shipped: [
          { 
            label: 'Confirm Delivery', 
            action: 'confirm_delivery', 
            variant: 'primary'
          }
        ]
      }
    };

    const userActions = isSeller ? actions.seller[tradeStatus] : actions.buyer[tradeStatus];
    
    return (
      <div className="space-y-4">
        {userActions?.map(({ label, action, variant }) => (
          <ActionButton 
            key={action}
            onClick={() => handleTradeAction(action)}
            variant={variant}
            disabled={isProcessing}
          >
            {label}
          </ActionButton>
        ))}
        {tradeStatus !== 'completed' && tradeStatus !== 'cancelled' && (
          <ActionButton 
            onClick={() => handleTradeAction('cancel_trade')}
            variant="danger"
            disabled={isProcessing}
            icon={AlertTriangle}
            className="mt-8"
          >
            Cancel Trade
          </ActionButton>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <TradeBanner 
          product={chat.product} 
          tradeStatus={tradeStatus}
          isSeller={isSeller}
          otherUser={otherUser}
        />
        
        <StepIndicator 
          currentStatus={tradeStatus} 
          completedSteps={{
            [TRADE_STATUSES.ACCEPTED]: { date: chat.accepted_at },
            [TRADE_STATUSES.PAYMENT_HELD]: { date: chat.payment_date },
            [TRADE_STATUSES.SHIPPED]: { date: chat.shipped_date },
            [TRADE_STATUSES.DELIVERED]: { date: chat.delivered_date },
            [TRADE_STATUSES.COMPLETED]: { date: chat.completed_date }
          }}
        />

        {/* Mobile Layout */}
        <div className="block md:hidden space-y-4">
          <ProductCard 
            product={chat.product}
            images={productImages}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
          />
          
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Trade Actions</h3>
            {renderTradeActions()}
          </div>

          <SafetyTips />

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Trade Participants</h3>
            <div className="space-y-4">
              <UserCard 
                user={chat.product.seller} 
                role="seller" 
                isOnline={chat.product.seller.is_online}
              />
              <UserCard 
                user={isSeller ? chat.other_participant : currentUser} 
                role="buyer" 
                isOnline={chat.other_participant.is_online}
              />
            </div>
            
            {/* Dispute Section */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Having issues with this trade?</h4>
                  <p className="text-sm text-gray-600">
                    If you're experiencing problems with delivery, product condition, or communication, our dispute resolution team can help mediate the situation.
                  </p>
                </div>
              </div>
              <button
                // onClick={() => handleStartDispute()}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors duration-200"
              >
                Start a Dispute
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <ProductCard 
                product={chat.product}
                images={productImages}
                activeImage={activeImage}
                setActiveImage={setActiveImage}
              />
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Trade Actions</h3>
                {renderTradeActions()}
              </div>

              <SafetyTips />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Trade Participants</h3>
            <div className="grid grid-cols-2 gap-4">
              <UserCard 
                user={chat.product.seller} 
                role="seller" 
                isOnline={chat.product.seller.is_online}
              />
              <UserCard 
                user={isSeller ? chat.other_participant : currentUser}  
                role="buyer" 
                isOnline={chat.other_participant.is_online}
              />
            </div>
            
            {/* Dispute Section */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Having issues with this trade?</h4>
                    <p className="text-sm text-gray-600">
                      If you're experiencing problems with delivery, product condition, or communication, our dispute resolution team can help mediate the situation.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    // onClick={() => handleStartDispute()}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors duration-200"
                  >
                    Start a Dispute
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;