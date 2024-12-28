import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { register as registerUser } from '../../actions/auth';

const RegisterPage = ({ registerUser, isAuthenticated }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (formData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const { name, email, username, password, re_password, region } = formData;
      await registerUser(name, email, username, password, re_password, region);
      navigate('/activate');
    } catch (error) {
      setServerError(
        error.response?.data?.detail || 
        Object.values(error.response?.data || {})[0]?.[0] || 
        'An error occurred during registration'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ label, name, icon: Icon, type = 'text', placeholder, validation = {}, showPasswordToggle = false }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={name}
          {...register(name, validation)}
          type={showPasswordToggle ? (name === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')) : type}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {(name === 'password' ? showPassword : showConfirmPassword) ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            )}
          </button>
        )}
      </div>
      {errors[name] && (
        <p className="mt-1 text-xs text-red-500">{errors[name].message}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h2 className="text-center text-4xl font-extrabold text-gray-900">
          Create your Trust<span className="text-blue-600">Trade</span> Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join us today and start trading with confidence
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InputField
              label="Full Name"
              name="name"
              icon={User}
              placeholder="Enter your full name"
              validation={{ required: 'Full name is required' }}
            />
            
            <InputField
              label="Username"
              name="username"
              icon={User}
              placeholder="Choose a username"
              validation={{ required: 'Username is required' }}
            />
            
            <InputField
              label="Email"
              name="email"
              icon={Mail}
              type="email"
              placeholder="Enter your email"
              validation={{
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Invalid email address'
                }
              }}
            />

            <InputField
              label="Phone Number"
              name="phone_number"
              icon={Phone}
              placeholder="Enter your phone number"
              validation={{
                required: 'Phone number is required',
              }}
            />

            <InputField
              label="Region"
              name="region"
              icon={MapPin}
              placeholder="Enter your region"
              validation={{ required: 'Region is required' }}
            />

            <InputField
              label="Password"
              name="password"
              icon={Lock}
              placeholder="Create a password"
              validation={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long'
                }
              }}
              showPasswordToggle={true}
            />

            <InputField
              label="Confirm Password"
              name="re_password"
              icon={Lock}
              placeholder="Confirm your password"
              validation={{
                required: 'Please confirm your password',
                validate: (val, formValues) => val === formValues.password || 'Passwords do not match'
              }}
              showPasswordToggle={true}
            />

            {serverError && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>
            <div className="mt-6">
              <a
                href="/auth/user"
                className="w-full flex justify-center py-3 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in to your account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { registerUser })(RegisterPage);