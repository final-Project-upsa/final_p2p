import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Heart, Share2, Star, Truck, ShieldCheck, ArrowLeft, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import Footer from '../components/FooterSide'; 
import NavBar from '../components/NavBar';

const ViewProductPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/product/${id}/`);
        setProduct(response.data.product);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const productImages = [
    product.main_image_url,
    product.image1_url,
    product.image2_url,
    product.image3_url,
    product.image4_url,
    product.image5_url,
  ].filter(Boolean);

  const nextImage = () => {
    setSelectedImage((prevImage) => (prevImage + 1) % productImages.length);
  };
  
  const prevImage = () => {
    setSelectedImage((prevImage) => 
      prevImage === 0 ? productImages.length - 1 : prevImage - 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button onClick={() => window.history.back()} className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 flex-grow">
            {product.name || 'Product Name Not Available'}
          </h1>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Share2 className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images Section */}
          <div className="space-y-3">
          <div
            style={{
              width: '100%',
              height: '450px',
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
              {productImages.length > 0 ? (
                <img
                  src={productImages[selectedImage]}
                  alt={`${product.name} - Pic ${selectedImage + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  No image available
                </div>
              )}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-800" />
                  </button>
                </>
              )}
            </div>
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onClick={() => setSelectedImage(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {product.name || 'Product Name Not Available'}
              </h2>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating || 'N/A'} ({product.reviewCount || 0} reviews)
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {product.sale_price ? `₵${product.sale_price}` : 'Price not available'}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-lg mb-2">Seller Information</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <img 
                    src={product.seller.profile_photo || '/default-avatar.png'} 
                    alt={product.seller?.business_name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">
                    {product.seller?.business_name || 'Business name not available'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {product.seller?.email || 'Email not available'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Region: {product.seller?.region || 'Region not available'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {product.seller?.phone_number || 'Phone not available'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Address: {product.seller?.business_address || 'Address not available'}
                  </p>
                </div>
              </div>
              <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                Contact Seller
              </button>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center space-x-2">
                <ShieldCheck className="h-5 w-5" />
                <span>Buy Now (Escrow Protected)</span>
              </button>
              <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition duration-300 flex items-center justify-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Make an Offer</span>
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Add to Wishlist</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
              <h3 className="font-semibold text-lg">Product Details</h3>
              <p className="text-gray-600">
                {product.description || 'Description not available'}
              </p>
              {product.features && product.features.length > 0 && (
                <ul className="list-disc list-inside text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Truck className="h-5 w-5" />
              <span>Free shipping on orders over ₵50</span>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <section className="mt-12">
          <h3 className="text-2xl font-bold mb-4">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {product.categories && product.categories.length > 0 ? (
              product.categories.map((category, index) => (
                <span 
                  key={index} 
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full"
                >
                  {category.name || 'Category name not available'}
                </span>
              ))
            ) : (
              <p>No categories available</p>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mt-12">
          <h3 className="text-2xl font-bold mb-4">Customer Reviews</h3>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600">Reviews coming soon...</p>
          </div>
        </section>

        {/* Related Products */}
        <section className="mt-12 mb-8">
          <h3 className="text-2xl font-bold mb-4">Related Products</h3>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600">Related products coming soon...</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ViewProductPage;