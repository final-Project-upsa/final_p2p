import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { verify } from '../../actions/auth';

const ActivationSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [verificationState, setVerificationState] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState('');
  const { uid, token } = useParams();

  useEffect(() => {
    const verifyAccount = async () => {
      try {

        if (!uid || !token) {
          throw new Error('Invalid verification link');
        }

        await dispatch(verify(uid, token));
        setVerificationState('success');
        startCountdown();
      } catch (err) {
        setVerificationState('error');
        setError(err.response?.data?.detail || 'Verification failed. Please try again.');
      }
    };

    verifyAccount();
  }, [dispatch, uid, token]);

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/auth/user');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const renderContent = () => {
    switch (verificationState) {
      case 'verifying':
        return (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <Loader className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying Your Account
            </h2>
            <div className="mt-4 text-md text-gray-600">
              <p>Please wait while we verify your account...</p>
            </div>
          </>
        );

      case 'success':
        return (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Account Verified!
            </h2>
            <div className="mt-4 text-md text-gray-600">
              <p>Your email has been successfully verified.</p>
              <p className="font-semibold mt-1">Welcome to TrustTrade!</p>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <p>You will be redirected to the Login Page to login</p>
              <p className="text-lg font-semibold text-blue-600 mt-2">
                {countdown} seconds...
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => navigate('/auth/user')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to LoginPage Now
              </button>
            </div>
          </>
        );

      case 'error':
        return (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verification Failed
            </h2>
            <div className="mt-4 text-md text-gray-600">
              <p>{error}</p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => navigate('/auth/user')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Login
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-100">
          <div className="text-center">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {verificationState === 'success' && (
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need help getting started?</p>
          <a 
            href="/help"
            className="mt-2 text-blue-600 hover:text-blue-500 font-medium"
          >
            Check out our guide
          </a>
        </div>
      )}
    </div>
  );
};

export default ActivationSuccessPage;