import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import escrow from '../images/escrow.jpg';
import two1 from '../images/two1.jpg';
import one from '../images/one.jpg';

const heroSlides = [
  { image: escrow, title: 'Flash Sales', subtitle: 'Up to 50% off on selected items' },
  { image: two1, title: 'New Arrivals', subtitle: 'Check out the latest products' },
  { image: one, title: 'Free Shipping', subtitle: 'On orders over 50' },
];

const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
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
          <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition duration-300">
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition duration-300">
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSlideshow;