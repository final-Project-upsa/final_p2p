import React, { useState, useEffect, useRef } from 'react';
import { Heart, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import axios from 'axios';
import one from '../images/one.jpg'
import escrow from '../images/escrow.jpg'
import two1 from '../images/two1.jpg'
import NavBar from '../components/NavBar'
import Footer from '../components/FooterSide'
import ProductCard from '../components/ProductCard';
import { connect } from 'react-redux';

const MarketplacePage = ({isAuthenticated, user}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  
  const categoryRef = useRef(null);
  const sliderRef = useRef(null);
  const stickyRef = useRef(null);
  const navHeight = 64; 

  const heroSlides = [
    { image: escrow, title: 'Flash Sales', subtitle: 'Up to 50% off on selected items' },
    { image: two1, title: 'New Arrivals', subtitle: 'Check out the latest products' },
    { image: one, title: 'Free Shipping', subtitle: 'On orders over 50' },
  ];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);;

  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 5000);
  
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (categoryRef.current && stickyRef.current) {
        const categoryRect = categoryRef.current.getBoundingClientRect();
        const threshold = navHeight;
        
        if (categoryRect.top <= threshold && !isSticky) {
          setIsSticky(true);
          // Set height before the transition starts
          stickyRef.current.style.height = `${categoryRect.height}px`;
          requestAnimationFrame(() => {
            categoryRef.current.style.transform = `translateY(${-categoryRect.height}px)`;
          });
        } else if (categoryRect.top > threshold && isSticky) {
          setIsSticky(false);
          categoryRef.current.style.transform = 'translateY(0)';
          // Delay height reset until transition completes
          setTimeout(() => {
            stickyRef.current.style.height = '0px';
          }, 300);
        }
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky, navHeight]);

  const fetchProducts = async (category = '') => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/marketplace/`, {
        params: { category: category !== 'All' ? category : '' }
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/marketplace/`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    fetchProducts(category);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchProducts(activeCategory === 'All' ? '' : activeCategory, e.target.value);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const scrollCategories = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 200;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const CategorySection = ({ isSticky }) => (
    <div 
      className={`w-full transition-all duration-300 ease-in-out ${
        isSticky ? 'fixed top-16 left-0 right-0 bg-white z-40 shadow-md' : ''
      }`}
      style={{
        transform: isSticky ? 'translateY(0)' : 'translateY(0)',
        willChange: 'transform'
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="relative">
          <div ref={sliderRef} className="flex overflow-x-auto space-x-4 scrollbar-hide custom-scrollbar">
            <button
              className={`px-4 py-2 rounded-full text-sm flex-shrink-0 transition-colors duration-200 ${
                activeCategory === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-blue-100'
              }`}
              onClick={() => handleCategoryClick('All')}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm flex-shrink-0 transition-colors duration-200 ${
                  activeCategory === category.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-blue-100'
                }`}
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => scrollCategories('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition duration-300 z-10"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />

      {/*  Slideshow section */}
      <section className="relative bg-gray-100 overflow-hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{slide.title}</h2>
                    <p className="text-xl md:text-2xl text-white mb-8">{slide.subtitle}</p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition duration-300">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition duration-300"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition duration-300"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
      {/* Categories */}
      <section ref={categoryRef} className="mb-8 transition-transform duration-300 ease-in-out">
        <CategorySection isSticky={false} />
      </section>

      {/* Sticky placeholder */}
      <div 
        ref={stickyRef} 
        className="transition-all duration-300 ease-in-out"
        style={{ height: 0 }}
      >
        {isSticky && <CategorySection isSticky={true} />}
      </div>

        {/* Product section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">{activeCategory} Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};


const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user,
});

export default connect (mapStateToProps)(MarketplacePage);