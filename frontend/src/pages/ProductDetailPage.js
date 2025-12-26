import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchRelatedProducts = async (category) => {
      try {
        const response = await axios.get(`${API}/products?category=${category}`);
        setRelatedProducts(response.data.filter(p => p.id !== id).slice(0, 4));
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API}/products/${id}`);
        setProduct(response.data);
        if (response.data.images && response.data.images.length > 0) {
          setSelectedImage(response.data.images[0]);
        } else {
          setSelectedImage(response.data.image_url);
        }
        fetchRelatedProducts(response.data.category);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handlePrevImage = () => {
    if (!product.images || product.images.length <= 1) return;
    const currentIndex = product.images.indexOf(selectedImage);
    const newIndex = currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;
    setSelectedImage(product.images[newIndex]);
  };

  const handleNextImage = () => {
    if (!product.images || product.images.length <= 1) return;
    const currentIndex = product.images.indexOf(selectedImage);
    const newIndex = currentIndex === product.images.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(product.images[newIndex]);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWhatsAppInquiry = () => {
    const message = `Hi! I'm interested in ${product.name} (${product.design_no}). Can you provide more details?`;
    const phone = '+91XXXXXXXXXX';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-state">
        <div className="inline-block w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="not-found">
        <div className="text-center">
          <h2 className="font-serif text-3xl mb-4">Product Not Found</h2>
          <Link to="/products" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="" data-testid="product-image-section"
          >
            <div className="space-y-4">
              <div className="relative border border-gray-100 rounded-lg overflow-hidden bg-white group">
                <Zoom>
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-auto object-cover"
                  />
                </Zoom>

                {/* Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Image Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`shrink-0 w-20 h-24 border-2 rounded-md overflow-hidden transition-all ${selectedImage === img ? 'border-[#C5A059]' : 'border-transparent hover:border-[#C5A059]/50'
                        }`}
                    >
                      <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
            data-testid="product-info-section"
          >
            <div>
              <p className="text-sm text-gray-500 mb-2" data-testid="product-design-no">{product.design_no}</p>
              <h1 className="font-serif text-4xl mb-4" data-testid="product-name">{product.name}</h1>
              <p className="text-3xl text-[#C5A059] font-bold mb-6" data-testid="product-price">
                ₹{product.price.toFixed(2)}
              </p>
            </div>

            <div className="border-t border-b border-gray-200 py-6 space-y-4" data-testid="product-details">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider">Material:</span>
                <span className="text-gray-600" data-testid="product-material">{product.material}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider">Color:</span>
                <span className="text-gray-600" data-testid="product-color">{product.color}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider">Availability:</span>
                <span className={`font-semibold ${product.in_stock ? 'text-green-600' : 'text-red-600'}`} data-testid="product-stock">
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div data-testid="product-description">
              <h3 className="font-semibold mb-2 uppercase tracking-wider text-sm">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4" data-testid="quantity-selector">
              <span className="font-semibold uppercase tracking-wider text-sm">Quantity:</span>
              <div className="flex items-center border border-gray-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                  data-testid="quantity-decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-2 font-semibold" data-testid="quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-100 transition-colors"
                  data-testid="quantity-increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="add-to-cart-button"
              >
                <ShoppingCart className="w-5 h-5" />
                ADD TO CART
              </button>
              <button
                onClick={handleWhatsAppInquiry}
                className="w-full btn-whatsapp justify-center"
                data-testid="whatsapp-inquiry-button"
              >
                <FaWhatsapp className="w-5 h-5" />
                INQUIRE VIA WHATSAPP
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section data-testid="related-products-section">
            <h2 className="font-serif text-4xl mb-8 text-center" data-testid="related-products-title">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  data-testid={`related-product-${index}`}
                >
                  <Link to={`/products/${item.id}`} className="group block">
                    <div className="bg-white p-4 transition-all duration-300 border border-transparent hover:border-[#C5A059]/30">
                      <div className="aspect-[3/4] mb-4 overflow-hidden">
                        <img
                          src={item.images?.[0] || item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="font-serif text-lg mb-2 group-hover:text-[#C5A059] transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-[#C5A059] font-bold">₹{item.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}