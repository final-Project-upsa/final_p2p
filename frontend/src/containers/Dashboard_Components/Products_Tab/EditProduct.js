import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Plus, X, Star, Upload, Loader2 } from 'lucide-react';

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();

  // Add initialLoading state
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Rest of the state declarations remain the same
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    regular_price: '',
    sale_price: '',
    stock: '',
    categories: [],
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [sellerId, setSellerId] = useState(null);

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        setInitialLoading(true);
        const accessToken = localStorage.getItem('access');
        
        // Rest of your fetch logic remains the same
        const categoriesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/marketplace/`,
          {
            headers: {
              'Authorization': `JWT ${accessToken}`,
            }
          }
        );
        setCategories(categoriesResponse.data.categories);

        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/users/me/`,
          {
            headers: {
              'Authorization': `JWT ${accessToken}`,
            }
          }
        );

        if (!userResponse.data.is_seller) {
          setError('Unauthorized: Seller access required');
          navigate('/dashboard');
          return;
        }

        const productResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/update_product/${productId}/`,
          {
            headers: {
              'Authorization': `JWT ${accessToken}`,
            }
          }
        );

        const productData = productResponse.data;
        
        if (!productData) {
          throw new Error('Product not found');
        }

        setFormData({
          name: productData.name,
          description: productData.description,
          regular_price: productData.regular_price,
          sale_price: productData.sale_price || '',
          stock: productData.stock,
          categories: productData.categories.map(cat => cat.id),
          is_active: productData.is_active
        });

        const productImages = [];
        if (productData.main_image_url) {
          productImages.push({
            url: productData.main_image_url,
            id: 'main',
            isMain: true
          });
        }

        ['image1_url', 'image2_url', 'image3_url', 'image4_url', 'image5_url'].forEach((key, index) => {
          if (productData[key]) {
            productImages.push({
              url: productData[key],
              id: `image${index + 1}`,
              isMain: false
            });
          }
        });

        setExistingImages(productImages);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load product data. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProductAndCategories();
  }, [productId, navigate]);

  // If in initial loading state, show the loader
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchValue.toLowerCase()) &&
    !formData.categories.includes(category.id)
  );

  // Image handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + newImages.length;
    
    if (totalImages + files.length > 6) {
      setError('Maximum 6 images allowed');
      return;
    }

    const newImageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isMain: false
    }));

    setNewImages(prev => [...prev, ...newImageFiles]);
    setError('');
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      return updated;
    });
  };

  const setMainImage = (index, type) => {
    if (type === 'existing') {
      setExistingImages(prev => prev.map((img, i) => ({
        ...img,
        isMain: i === index
      })));
      setNewImages(prev => prev.map(img => ({
        ...img,
        isMain: false
      })));
    } else {
      setNewImages(prev => prev.map((img, i) => ({
        ...img,
        isMain: i === index
      })));
      setExistingImages(prev => prev.map(img => ({
        ...img,
        isMain: false
      })));
    }
  };

  // Category handlers
  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, categoryId]
    }));
    setShowCategoryDropdown(false);
    setSearchValue('');
  };

  const removeCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(id => id !== categoryId)
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const productData = new FormData();
      
      // Append basic form data
      Object.keys(formData).forEach(key => {
        if (key === 'categories') {
          productData.append('categories', JSON.stringify(formData.categories));
        } else {
          productData.append(key, formData[key]);
        }
      });

      // Append existing images info
      productData.append('existingImages', JSON.stringify(existingImages));

      // Handle new images
      let mainImageFound = existingImages.some(img => img.isMain);
      
      newImages.forEach((image, index) => {
        if (image.isMain) {
          productData.append('main_image', image.file);
          mainImageFound = true;
        } else {
          productData.append(`image${index}`, image.file);
        }
      });

      // If no main image is set, use the first available image
      if (!mainImageFound && (existingImages.length > 0 || newImages.length > 0)) {
        if (existingImages.length > 0) {
          const updatedExisting = [...existingImages];
          updatedExisting[0].isMain = true;
          productData.append('existingImages', JSON.stringify(updatedExisting));
        } else {
          productData.append('main_image', newImages[0].file);
        }
      }

      const accessToken = localStorage.getItem('access');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/update_product/${productId}/`,
        productData,
        {
          headers: {
            'Authorization': `JWT ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      setSuccess('Product updated successfully');
      setTimeout(() => {
        navigate('/dashboard/products');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while updating the product';
      setError(errorMessage);
      console.error('Error updating product:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-200 p-6">
          <button
            onClick={() => navigate('/dashboard/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-b-xl shadow-sm divide-y divide-gray-200">
          {/* Basic Information */}
          <div className="p-6 space-y-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Categories Section */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories *
                </label>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.categories.map(categoryId => {
                      const category = categories.find(c => c.id === categoryId);
                      return category ? (
                        <span key={category.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {category.name}
                          <button
                            type="button"
                            onClick={() => removeCategory(category.id)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="flex items-center w-full justify-between rounded-lg border border-gray-300 px-4 py-2 text-left text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Add category
                      </span>
                    </button>

                    {showCategoryDropdown && (
                      <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                        <div className="p-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="Search categories..."
                              value={searchValue}
                              onChange={(e) => setSearchValue(e.target.value)}
                            />
                          </div>
                        </div>
                        <ul className="max-h-60 overflow-auto py-2">
                          {filteredCategories.length === 0 ? (
                            <li className="px-4 py-2 text-sm text-gray-500">No categories found</li>
                          ) : (
                            filteredCategories.map(category => (
                              <li
                                key={category.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleCategorySelect(category.id)}
                              >
                                {category.name}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
              <p className="text-sm text-gray-500">
                Manage existing images or upload new ones (up to 6 images total). The image marked with a star will be the main product image.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Existing Images */}
                {existingImages.map((image, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.url}
                        alt={`Existing Product ${index + 1}`}
                        className={`w-full h-full object-cover ${
                          image.isMain ? 'ring-2 ring-blue-500' : ''
                        }`}
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setMainImage(index, 'existing')}
                        className={`p-1.5 rounded-full ${
                          image.isMain ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="p-1.5 rounded-full bg-white text-red-500 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* New Images */}
                {newImages.map((image, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.preview}
                        alt={`New Product ${index + 1}`}
                        className={`w-full h-full object-cover ${
                          image.isMain ? 'ring-2 ring-blue-500' : ''
                        }`}
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setMainImage(index, 'new')}
                        className={`p-1.5 rounded-full ${
                          image.isMain ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="p-1.5 rounded-full bg-white text-red-500 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload Button */}
                {(existingImages.length + newImages.length) < 6 && (
                  <label className="cursor-pointer">
                    <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="mt-2 block text-sm text-gray-600">Add Image</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Pricing & Stock</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regular Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₵</span>
                    <input
                      type="number"
                      value={formData.regular_price}
                      onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                      className="w-full pl-8 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₵</span>
                    <input
                      type="number"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      className="w-full pl-8 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Product is active and visible to customers
              </label>
            </div>
          </div>

          {/* Submit Section */}
          <div className="p-6 bg-gray-50 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/products')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (existingImages.length + newImages.length === 0) || formData.categories.length === 0}
              className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>

        {/* Validation Messages */}
        {((existingImages.length + newImages.length === 0) || formData.categories.length === 0) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Required fields missing:</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {(existingImages.length + newImages.length === 0) && (
                      <li>Please add at least one product image</li>
                    )}
                    {formData.categories.length === 0 && (
                      <li>Please select at least one category</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProduct;