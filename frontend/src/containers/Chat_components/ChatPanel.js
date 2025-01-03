import React, { useRef, useEffect } from 'react';
import { Send, Star, MoreVertical, ImageIcon, Paperclip, Loader2 } from 'lucide-react';
import { getDisplayName, LetterAvatar } from '../../utils/userDisplay';
import { getMediaUrl } from '../../utils/mediaURL';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-full">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
);

const ChatPanel = ({ 
    chat, 
    currentUser, 
    isLoading,
    messages,
    message,
    setMessage,
    isTyping,
    isSending,
    sendMessage,
    handleMessageChange,
    isMobileView
  }) => {
    const messagesEndRef = useRef(null);
    const messageContainerRef = useRef(null);
  
    const scrollToBottom = () => {
      if (messageContainerRef.current && messagesEndRef.current) {
        const container = messageContainerRef.current;
        const scrollHeight = container.scrollHeight;
        const containerHeight = container.clientHeight;
        
        // Calculate the correct scroll position accounting for fixed elements
        const headerHeight = 96; // 24rem padding-top in mobile view
        const inputHeight = 80; // approximate height of input area
        const targetScroll = isMobileView 
          ? scrollHeight - containerHeight + headerHeight + inputHeight
          : scrollHeight;
        
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    };
  
    // Scroll when new messages arrive
    useEffect(() => {
      if (messages.length > 0) {
        // Initial delay for DOM rendering
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
      }
    }, [messages]);

    // Handle mobile view changes
    useEffect(() => {
      if (isMobileView && messages.length > 0) {
        // Additional delay for mobile transition
        const timeoutId = setTimeout(scrollToBottom, 300);
        return () => clearTimeout(timeoutId);
      }
    }, [isMobileView, messages]);

    // Handle window resize
    useEffect(() => {
      const handleResize = () => {
        if (messages.length > 0) {
          scrollToBottom();
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [messages]);

    // Handle keyboard appearance on mobile
    useEffect(() => {
      const handleFocus = () => {
        if (isMobileView) {
          // Delay to account for keyboard animation
          setTimeout(scrollToBottom, 300);
        }
      };

      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.addEventListener('focus', handleFocus);
        return () => input.removeEventListener('focus', handleFocus);
      }
    }, [isMobileView]);
  
    if (isLoading || !chat) return <LoadingSpinner />;
  
    const isSeller = currentUser?.id === chat.product.seller.id;
    const otherUser = isSeller ? chat.other_participant : chat.product.seller;
    const displayName = getDisplayName(otherUser, !isSeller);
  
    return (
      <div className={`
        h-full bg-white flex flex-col
        ${isMobileView ? 'fixed inset-0' : 'lg:rounded-2xl lg:shadow-lg'}
      `}>
        {/* Chat Header */}
        <div className={`
          px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 border-b
          ${isMobileView ? 'fixed top-0 left-0 right-0 z-50' : 'lg:rounded-t-2xl'}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {otherUser.profile_photo ? (
                <img 
                  src={getMediaUrl(otherUser.profile_photo)} 
                  alt="" 
                  className="w-10 h-10 rounded-full border-2 border-white" 
                />
              ) : (
                <LetterAvatar 
                  name={displayName}
                  className="w-10 h-10 text-lg border-2 border-white"
                />
              )}
              <div className="text-white">
                <h3 className="font-semibold">{displayName}</h3>
                <div className="flex items-center space-x-2 text-sm opacity-90">
                  {otherUser.rating && (
                    <>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-300 mr-1" />
                        <span>{otherUser.rating}</span>
                      </div>
                      <span>•</span>
                    </>
                  )}
                  <span>Active {chat.last_message_at ? new Date(chat.last_message_at).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
  
        {/* Messages Container */}
        <div 
          ref={messageContainerRef}
          className={`
            flex-1 overflow-y-auto space-y-4 custom-scrollbar
            ${isMobileView ? 'pt-24 pb-32 px-4' : 'p-6'}
          `}
        >
          {messages.map((msg, index) => {
            const isCurrentUserMessage = msg.sender_id === currentUser?.id;
            return (
              <div 
                key={msg.id || `msg-${index}-${msg.timestamp}`} 
                className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  px-4 py-2 rounded-2xl max-w-[80%] shadow-sm break-words whitespace-pre-wrap
                  ${isCurrentUserMessage
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-100 rounded-tl-none'}
                `}>
                  <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
  
        {/* Message Input */}
        <form 
          onSubmit={sendMessage} 
          className={`
            p-4 bg-gray-50 
            ${isMobileView ? 'fixed bottom-16 left-0 right-0 z-50 shadow-lg' : 'lg:rounded-b-2xl'}
          `}
        >
          <div className="flex items-center space-x-3 bg-white rounded-full p-1 shadow-sm">
            <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ImageIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Paperclip className="w-6 h-6 text-gray-600" />
            </button>
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              placeholder="Type a message..."
              className="flex-1 py-2 px-4 focus:outline-none bg-transparent"
              disabled={isSending}
            />
            <button 
              type="submit"
              disabled={isSending || !message.trim()}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    );
};

export default ChatPanel;