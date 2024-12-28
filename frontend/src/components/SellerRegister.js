import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { useDispatch } from 'react-redux';
import { USER_LOADED_SUCCESS } from '../actions/types';

// Custom Alert Component
const CustomAlert = ({ title, message, variant = 'default' }) => {
  const bgColor = variant === 'destructive' ? 'bg-red-50' : 'bg-blue-50';
  const textColor = variant === 'destructive' ? 'text-red-800' : 'text-blue-800';
  const borderColor = variant === 'destructive' ? 'border-red-200' : 'border-blue-200';
  

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-6`}>
      <div className={`font-semibold ${textColor} text-sm`}>{title}</div>
      <div className={`mt-1 ${textColor} text-sm`}>{message}</div>
    </div>
  );
};

const SellerRegistration = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const access = useSelector(state => state.auth.access);
    const user = useSelector(state => state.auth.user);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        DOB: '',
        phone: '',
        profile_photo: '',
        id_card: '',
        business_address: '',
        city: '',
        region: '',
        postal_code: '',
        business_name: '',
        business_type: '',
        business_hours: '',
        delivery_radius: '',
        // product_categories: [],
        website: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const businessTypes = [
        'Individual/Sole Proprietorship',
        'Limited Liability Company (LLC)',
        'Corporation',
        'Partnership'
    ];

    // const categories = [
    //     'Electronics',
    //     'Fashion',
    //     'Home & Garden',
    //     'Food & Beverages',
    //     'Beauty & Personal Care',
    //     'Sports & Outdoor',
    //     'Arts & Crafts',
    //     'Books & Media',
    //     'Automotive',
    //     'Health & Wellness'
    // ];

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const categories = [...formData.product_categories];
            if (e.target.checked) {
                categories.push(value);
            } else {
                const index = categories.indexOf(value);
                if (index > -1) {
                    categories.splice(index, 1);
                }
            }
            setFormData(prev => ({
                ...prev,
                product_categories: categories
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/enroll_seller/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `JWT ${access}`
                    }
                }
            );
            
            // Update Redux state with seller ID
            dispatch({
                type: USER_LOADED_SUCCESS,
                payload: {
                    ...user,
                    seller_id: response.data.seller_id,
                    is_seller: true
                }
            });
    
            // Optional: Save to localStorage if you need persistence
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...currentUser,
                seller_id: response.data.seller_id,
                is_seller: true
            }));
    
            navigate('/dashboard');
        } catch (err) {
            console.error('Full error:', err);
            console.error('Error response data:', err.response?.data);
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Start Your Seller Journey</h2>
                        <p className="mt-2 text-gray-600">Join our marketplace and reach thousands of customers</p>
                    </div>

                    {error && (
                        <CustomAlert 
                            title="Error"
                            message={error}
                            variant="destructive"
                        />
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-blue-50 p-6 rounded-lg mb-8">
                            <h3 className="text-xl font-semibold text-blue-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="DOB"
                                        value={formData.DOB}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                                    <input
                                        type="file"
                                        name="profile_photo"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            profile_photo: e.target.files[0]
                                        }))}
                                        className="mt-1 block w-full"
                                        accept="image/*"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ID Card</label>
                                    <input
                                        type="file"
                                        name="id_card"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            id_card: e.target.files[0]
                                        }))}
                                        className="mt-1 block w-full"
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg mb-8">
                            <h3 className="text-xl font-semibold text-green-900 mb-4">Location & Operations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Store Address</label>
                                    <input
                                        type="text"
                                        name="business_address"
                                        value={formData.business_address}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Region/State</label>
                                    <input
                                        type="text"
                                        name="region"
                                        value={formData.region}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Delivery Radius</label>
                                    <input
                                        type="number"
                                        name="delivery_radius"
                                        value={formData.delivery_radius}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg mb-8">
                            <h3 className="text-xl font-semibold text-purple-900 mb-4">Business Information</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                                    <input
                                        type="text"
                                        name="business_name"
                                        value={formData.business_name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Business Type</label>
                                    <select
                                        name="business_type"
                                        value={formData.business_type}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Business Type</option>
                                        {businessTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Business Hours</label>
                                    <input
                                        type="text"
                                        name="business_hours"
                                        value={formData.business_hours}
                                        placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Website (Optional)</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {categories.map(category => (
                                            <div key={category} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={category}
                                                    name="product_categories"
                                                    value={category}
                                                    checked={formData.product_categories.includes(category)}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor={category} className="ml-2 text-sm text-gray-700">
                                                    {category}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div> */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Business Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Tell customers about your business, products, and what makes you unique..."
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {loading ? 'Processing...' : 'Launch Your Store'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

        </div>
    );
};

export default SellerRegistration;