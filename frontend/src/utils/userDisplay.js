export const getDisplayName = (user, isSeller) => {
    if (isSeller && user.business_name) {
      return user.business_name;
    }
    return user.username;
  };
  
  export const getInitialAvatar = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };
  
  export const LetterAvatar = ({ name, className }) => {
    return (
      <div className={`flex items-center justify-center bg-blue-500 text-white rounded-full ${className}`}>
        {getInitialAvatar(name)}
      </div>
    );
  };