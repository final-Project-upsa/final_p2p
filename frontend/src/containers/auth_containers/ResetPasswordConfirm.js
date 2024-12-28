import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { password_reset_confirm } from '../../actions/auth';
import { connect } from 'react-redux';


export const ResetPasswordConfirm = ({password_reset_confirm}) => {
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
      new_password: '',
      re_password: ''
    })
    const{new_password, re_password} = formData

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (new_password !== re_password) {
        setServerError('Passwords do not match');
        return;
      }
      setIsLoading(true);
      setServerError(null);
  
      try {
        await password_reset_confirm(uid, token, new_password, re_password);
        setSuccess(true);
      } catch (error) {
        setServerError(error.response?.data?.message || 'Failed to reset password. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl mb-8">
          <h1 className="text-center text-4xl font-extrabold text-gray-900">
            Trust<span className="text-blue-600">Trade</span>
          </h1>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>
  
        <div className="sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-100">
            {success ? (
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-xl font-medium text-gray-900">Password reset successful</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your password has been reset successfully.
                </p>
                <button
                  onClick={() => navigate('/auth/user')}
                  className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Login with new password
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="new_password"
                      type={showPassword1 ? 'text' : 'new_password'}
                      value={new_password}
                      name="new_password"
                      onChange={onChange}
                      required
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter new password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword1(!showPassword1)}
                    >
                      {showPassword1 ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
  
                <div>
                  <label htmlFor="re_password" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="re_password"
                      type={showPassword2 ? 'text' : 'password'}
                      value={re_password}
                      name="re_password"
                      onChange={onChange}
                      required
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Confirm new password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword2(!showPassword2)}
                    >
                      {showPassword2 ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
  
                {serverError && (
                  <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{serverError}</span>
                  </div>
                )}
  
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };


const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
}) 

export default connect(mapStateToProps, {password_reset_confirm}) (ResetPasswordConfirm);