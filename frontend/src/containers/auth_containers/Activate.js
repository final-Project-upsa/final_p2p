import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Activate = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-100">
          <div className="text-center">
            {/* Email Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            
            {/* Header */}
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            
            {/* Message */}
            <div className="mt-4 text-md text-gray-600">
              <p>We've sent you an email with a verification link to</p>
              <p className="font-semibold mt-1">verify your account.</p>
            </div>
            
            {/* Additional Instructions */}
            <div className="mt-6 text-sm text-gray-500">
              <p>Please check your inbox and click on the verification link to activate your account.</p>
              <p className="mt-2">Don't see the email? Check your spam folder.</p>
            </div>
            
            {/* Back to Login Button */}
            <div className="mt-8">
              <Link
                to="/auth/user"
                className="w-full flex justify-center py-3 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Support Section */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>Didn't receive the email?</p>
        <button 
          className="mt-2 text-blue-600 hover:text-blue-500 font-medium"
          onClick={() => window.location.reload()}
        >
          Click here to resend
        </button>
      </div>
    </div>
  );
};

export default Activate;