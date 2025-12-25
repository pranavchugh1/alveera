import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const heroSlides = [
  {
    url: 'https://images.unsplash.com/photo-1654764745869-545a2316a169?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBpbmRpYW4lMjBzYXJlZSUyMG1vZGVsJTIwZWRpdG9yaWFsJTIwZmFzaGlvbnxlbnwwfHx8fDE3NjY2ODU2NzN8MA&ixlib=rb-4.1.0&q=85',
    title: 'ALVEERA ETHNIC ALLURE',
    subtitle: 'Timeless Elegance, Modern Grace',
  },
  {
    url: 'https://images.unsplash.com/photo-1757598077205-69a927f0240f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBpbmRpYW4lMjBzYXJlZSUyMG1vZGVsJTIwZWRpdG9yaWFsJTIwZmFzaGlvbnxlbnwwfHx8fDE3NjY2ODU2NzN8MA&ixlib=rb-4.1.0&q=85',
    title: 'FESTIVE COLLECTION',
    subtitle: 'Celebrate in Style',
  },
  {
    url: 'https://images.unsplash.com/photo-1638964327749-53436bcccdca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBpbmRpYW4lMjBzYXJlZSUyMG1vZGVsJTIwZWRpdG9yaWFsJTIwZmFzaGlvbnxlbnwwfHx8fDE3NjY2ODU2NzN8MA&ixlib=rb-4.1.0&q=85',
    title: 'BRIDAL COLLECTION',
    subtitle: 'Your Special Day Awaits',
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API}/products?category=new-arrivals`);
      setFeaturedProducts(response.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div data-testid="homepage">
      {/* Hero Slider */}
      <section className="relative h-[90vh] overflow-hidden" data-testid="hero-section">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            data-testid={`hero-slide-${index}`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.url})` }}
            >
              <div className="w-full h-full bg-black bg-opacity-30 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center text-white px-4"
                  data-testid="hero-content"
                >
                  <h1 className="font-serif text-5xl md:text-7xl mb-4 tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 tracking-widest font-light">
                    {slide.subtitle}
                  </p>
                  <Link to="/products">
                    <button className="btn-primary" data-testid="shop-now-button">
                      SHOP NOW
                    </button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-none transition-all"
          data-testid="hero-prev-button"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-none transition-all"
          data-testid="hero-next-button"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2" data-testid="hero-indicators">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-12 h-1 transition-all ${
                index === currentSlide ? 'bg-[#C5A059]' : 'bg-white/50'
              }`}
              data-testid={`hero-indicator-${index}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 bg-white" data-testid="featured-collections">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-4" data-testid="collections-title">
              Our Collections
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our curated selection of ethnic wear, crafted with precision and passion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'New Arrivals',
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
                link: '/products?category=new-arrivals',
              },
              {
                name: 'Festive Anecdotes',
                image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600',
                link: '/products?category=festive',
              },
              {
                name: 'Exquisite Silk',
                image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
                link: '/products?category=silk',
              },
            ].map((collection, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                data-testid={`collection-card-${index}`}
              >
                <Link to={collection.link} className="group block">
                  <div className="relative overflow-hidden aspect-[3/4] mb-4">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                  </div>
                  <h3 className="font-serif text-2xl text-center group-hover:text-[#C5A059] transition-colors">
                    {collection.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 bg-[#F9F5F0]" data-testid="featured-products">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-4xl md:text-5xl mb-4" data-testid="featured-products-title">
                New Arrivals
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  data-testid={`featured-product-${index}`}
                >
                  <Link to={`/products/${product.id}`} className="group block">
                    <div className="bg-white p-4 transition-all duration-300 border border-transparent hover:border-[#C5A059]/30">
                      <div className="aspect-[3/4] mb-4 overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="font-serif text-lg mb-2 group-hover:text-[#C5A059] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[#C5A059] font-bold">₹{product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products">
                <button className="btn-secondary" data-testid="view-all-button">
                  VIEW ALL
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Instagram Section */}
      <section className="py-24 bg-white" data-testid="instagram-section">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-4" data-testid="instagram-title">
              Follow Us @alveeraethnic
            </h2>
            <p className="text-gray-600">See how our customers style their Alveera pieces</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="instagram-grid">
            {[
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
              'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400',
              'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400',
              'https://images.unsplash.com/photo-1654764745869-545a2316a169?w=400',
            ].map((img, index) => (
              <div key={index} className="aspect-square overflow-hidden" data-testid={`instagram-item-${index}`}>
                <img
                  src={img}
                  alt={`Instagram ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}