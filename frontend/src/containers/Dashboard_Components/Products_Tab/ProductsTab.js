import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getMediaUrl } from '../../../utils/mediaURL';
import { useNavigate } from 'react-router-dom';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName, isDeleting }) => {
  const [confirmationText, setConfirmationText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <span className="font-semibold">{productName}</span>? 
          This action cannot be undone.
        </p>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">
            Type <span className="font-bold">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            disabled={isDeleting}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={() => confirmationText === 'DELETE' && onConfirm()}
            disabled={confirmationText !== 'DELETE' || isDeleting}
            className={`px-4 py-2 text-white rounded-lg transition-colors relative ${
              confirmationText === 'DELETE' && !isDeleting
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-red-300 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <span className="opacity-0">Delete Product</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              </>
            ) : (
              'Delete Product'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const access = useSelector((state) => state.auth.access);
  const navigate = useNavigate();
  const [sellerId, setSellerId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!access) {
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `JWT ${access}`,
          Accept: 'application/json',
        },
      };

      try {
        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/users/me/`,
          config
        );

        if (!userResponse.data.is_seller) {
          setLoading(false);
          return;
        }

        const currentSellerId = userResponse.data.seller_id;
        setSellerId(currentSellerId);

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/seller_dashboardd/${currentSellerId}/`,
          config
        );

        setProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [access]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    const config = {
      headers: {
        Authorization: `JWT ${access}`,
        Accept: 'application/json',
      },
    };

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/product_handler/${productToDelete.id}/`,
        config
      );

      setProducts(products.filter(p => p.id !== productToDelete.id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleEdit = (productId) => {
    navigate(`/dashboard/products/edit/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Products</h1>
              <p className="text-gray-600 mt-1">Manage your product inventory</p>
            </div>
            <button 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/dashboard/products/addproduct')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products
            .filter(product => 
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((product) => (
              <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={getMediaUrl(product.main_image_url)}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                  <div className="flex items-center">
                    <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => handleEdit(product.id)}>
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-lg ml-2"
                      onClick={() => handleDeleteClick(product)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Stock: {product.stock}</span>
                  <span className="font-medium text-blue-600">GH₵{product.sale_price}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button 
                    className="text-blue-600 text-sm hover:underline"
                    onClick={() =>navigate(`/dashboard/products/${product.id}/analytics`)}
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          productName={productToDelete?.name}
          isDeleting={isDeleting}
        />

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first product</p>
            <button 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/dashboard/products/addproduct')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsTab;