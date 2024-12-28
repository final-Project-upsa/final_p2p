import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Shield, 
  Lock, 
  CheckCircle, 
  Search,
  CreditCard,
  Package,
  RefreshCw,
  Users,
  TrendingUp,
  Star,
  Clock,
  ShieldCheck
} from 'lucide-react';

// Import images (to be updated later)
import heroImage from '../images/one.jpg';
import marketplaceImage from '../images/one.jpg';
import securityImage from '../images/one.jpg';

const LandingPage = () => {
  const [overlayDarkness, setOverlayDarkness] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const newDarkness = Math.min(100, scrollPosition / 8);
      setOverlayDarkness(newDarkness);
    };

    window.addEventListener('scroll', handleScroll);

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const escrowSteps = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Browse Products",
      description: "Find the perfect item from trusted sellers"
    },
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: "Place Order",
      description: "Select your item and place your order"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Secure Payment",
      description: "Your payment is held securely in escrow"
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Seller Ships",
      description: "Seller ships your item with tracking"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Receive & Verify",
      description: "Inspect your item upon delivery"
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Complete",
      description: "Payment released to seller"
    }
  ];

  const trustFeatures = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Verified Sellers",
      description: "All sellers are thoroughly vetted"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Buyer Protection",
      description: "100% money-back guarantee"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Round-the-clock customer service"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img src={heroImage} className="w-full h-full object-cover" alt="Trust Trade marketplace" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a2332]/80 to-[#202b3a]/70" />
        </div>
        
        {/* Animated Circles Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 animate-pulse" />
          <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full opacity-20 animate-pulse delay-300" />
          <div className="absolute bottom-40 right-40 w-72 h-72 bg-blue-600 rounded-full opacity-20 animate-pulse delay-500" />
        </div>

        <div className="relative container mx-auto px-4 lg:px-6 h-full">
          <div className="flex flex-col lg:flex-row min-h-screen pt-20 lg:pt-0">
            {/* Left Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center mb-12 lg:mb-0">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                TRUST TRADE
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8">
                Secure P2P Marketplace with Built-in Escrow Protection
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                <button 
                  onClick={() => navigate('/SignUp')} 
                  className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => navigate('/marketplace')}
                  className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-300"
                >
                  Browse Marketplace
                </button>
              </div>
              
              {/* Stats Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                  <Users className="w-8 h-8 text-blue-300 mb-2" />
                  <div className="text-3xl font-bold text-white mb-1">--+</div>
                  <div className="text-blue-200">Active Users</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                  <ShoppingBag className="w-8 h-8 text-blue-300 mb-2" />
                  <div className="text-3xl font-bold text-white mb-1">--+</div>
                  <div className="text-blue-200">Completed Orders</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-blue-300 mb-2" />
                  <div className="text-3xl font-bold text-white mb-1">₵--+</div>
                  <div className="text-blue-200">Trading Volume</div>
                </div>
              </div>
            </div>

            {/* Right Content - Trust Features */}
            <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end mb-4">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl w-full lg:w-96">
                <h3 className="text-xl font-semibold text-white mb-8">Why Trust Us?</h3>
                <div className="space-y-6">
                  {trustFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{feature.title}</h4>
                        <p className="text-blue-200 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Escrow Process - Bottom of Hero */}
          <div className="w-full pb-12">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-8 text-center">How Our Escrow Process Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {escrowSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center text-center p-4 rounded-xl transition-all duration-500 ${
                      index === activeStep ? 'bg-white/10 scale-105' : 'bg-white/5'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
                      index === activeStep ? 'bg-blue-600 text-white' : 'bg-white/20 text-white'
                    }`}>
                      {step.icon}
                    </div>
                    <h4 className="text-white font-semibold mb-2">{step.title}</h4>
                    <p className="text-blue-200 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Images */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative group overflow-hidden rounded-2xl">
              <img src={securityImage} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" alt="Security" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent flex flex-col justify-end p-6">
                <Shield className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Secure Escrow System</h3>
                <p className="text-blue-100">Your money is held safely until you receive and approve your purchase.</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-2xl">
              <img src={marketplaceImage} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" alt="Marketplace" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent flex flex-col justify-end p-6">
                <Lock className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Protected Payments</h3>
                <p className="text-blue-100">Advanced encryption and secure payment processing for peace of mind.</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-2xl">
              <img src={securityImage} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" alt="Verified Users" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent flex flex-col justify-end p-6">
                <CheckCircle className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Verified Users</h3>
                <p className="text-blue-100">Trust our community of verified buyers and sellers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with Background Image */}
      <div className="relative py-24">
        <img src={marketplaceImage} className="absolute inset-0 w-full h-full object-cover" alt="Call to action background" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a2332]/80 to-[#202b3a]/70" />
        <div className="relative container mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Start Shopping Safely?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of users who trust our platform for secure P2P transactions.
          </p>
          <button 
            onClick={() => navigate('/SignUp')}
            className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
          >
            Create Your Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;