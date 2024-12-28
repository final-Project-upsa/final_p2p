export const getMediaUrl = (url) => {
    if (!url) return '/default-profile.png';
    
    // Check if the URL is already absolute (starts with http:// or https://)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Replace localhost URL with dev tunnel URL if needed
      if (process.env.NODE_ENV === 'development' && url.includes('localhost:8000')) {
        return url.replace(
          'http://localhost:8000', 
          'https://wh8txwpx-8000.uks1.devtunnels.ms'
        );
      }
      return url;
    }
    
    // If it's a relative URL, prepend the appropriate base URL
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'https://wh8txwpx-8000.uks1.devtunnels.ms'
      : process.env.REACT_APP_API_URL;
      
    return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };