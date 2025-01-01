import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { X, Loader2, ShoppingBag, MessageCircle, Heart, BellOff, Bell } from 'lucide-react';
import { fetchNotifications, markAllAsRead, markAsRead, addNotification } from '../redux/features/notificationSlice';

// Create audio instance outside component
const notificationSound = new Audio('/notification.mp3');

const NotificationType = {
  ORDER: 'order',
  CHAT: 'chat',
  FAVORITE: 'favorite',
  SYSTEM: 'system'
};

const NotificationIcon = ({ type, className = "w-6 h-6" }) => {
  switch (type) {
    case NotificationType.ORDER:
      return <ShoppingBag className={`${className} text-blue-600`} />;
    case NotificationType.CHAT:
      return <MessageCircle className={`${className} text-indigo-600`} />;
    case NotificationType.FAVORITE:
      return <Heart className={`${className} text-pink-600`} />;
    default:
      return <Bell className={`${className} text-gray-600`} />;
  }
};

const NotificationsPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: notifications, loading, unreadCount } = useSelector(state => state.notifications);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const notificationSocketRef = useRef(null);

  const playNotificationSound = () => {
    try {
      notificationSound.currentTime = 0;
      const playPromise = notificationSound.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio playback failed:", error);
        });
      }
    } catch (error) {
      console.log("Error playing notification sound:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      // Fetch initial notifications
      dispatch(fetchNotifications());
      
      // Setup WebSocket connection
      const connectWebSocket = () => {
        const token = localStorage.getItem('access');
        const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(
          `${wsScheme}://localhost:8000/ws/notifications/?token=${token}`
        );

        ws.onopen = () => {
          console.log('Notification WebSocket Connected');
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message_notification') {
            playNotificationSound();
            dispatch(addNotification(data.notification));
          }
        };

        ws.onerror = (error) => {
          console.error('Notification WebSocket Error:', error);
        };

        ws.onclose = () => {
          console.log('Notification WebSocket Closed');
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        notificationSocketRef.current = ws;
      };

      connectWebSocket();

      // Cleanup on unmount or when panel closes
      return () => {
        if (notificationSocketRef.current) {
          notificationSocketRef.current.close();
        }
      };
    }
  }, [isAuthenticated, isOpen, dispatch]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }

    switch (notification.type) {
      case NotificationType.ORDER:
        navigate(`/order/${notification.reference_id}`);
        break;
      case NotificationType.CHAT:
        navigate(`/chatroom/${notification.reference_id}`);
        break;
      case NotificationType.FAVORITE:
        navigate(`/product/${notification.reference_id}`);
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <div 
      className={`
        fixed inset-0 z-50 bg-black/25 backdrop-blur-sm
        md:absolute md:inset-auto md:right-0 md:top-full md:w-[420px] md:mt-2
        transform transition-all duration-200 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
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
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread` : 'No new notifications'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="overflow-y-auto max-h-[calc(85vh-120px)] divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  group relative hover:bg-gray-50 transition-colors cursor-pointer
                  ${!notification.read ? 'bg-blue-50/40' : ''}
                `}
              >
                <div className="flex p-4 items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    notification.type === NotificationType.ORDER ? 'bg-blue-50' :
                    notification.type === NotificationType.CHAT ? 'bg-indigo-50' :
                    notification.type === NotificationType.FAVORITE ? 'bg-pink-50' :
                    'bg-gray-50'
                  }`}>
                    <NotificationIcon type={notification.type} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-medium' : ''} text-gray-900`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 text-center">
            <BellOff className="h-16 w-16 mx-auto mb-4 stroke-1 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500 mb-6">
              We'll let you know when something important happens
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;