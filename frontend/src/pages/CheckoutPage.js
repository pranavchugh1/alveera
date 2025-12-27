import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { CreditCard, Smartphone, LogIn, User } from 'lucide-react';
import { FaStripe, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { SiRazorpay } from 'react-icons/si';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user, token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const [formData, setFormData] = useState({
    customer_name: user?.full_name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
  });

  // Update form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        customer_name: user.full_name || '',
        customer_email: user.email || '',
        customer_phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      return;
    }

    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        total: getCartTotal(),
        payment_method: paymentMethod
      };

      const response = await axios.post(`${API}/orders`, orderData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${response.data.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-white" data-testid="checkout-page">
      <div className="bg-[#F9F5F0] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl mb-4" data-testid="page-title">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8" data-testid="checkout-form-section">
              
              {/* Login Required Banner */}
              {!authLoading && !isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] p-6 text-white"
                  data-testid="login-required-banner"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#C5A059] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Login Required</h3>
                        <p className="text-gray-400 text-sm">Please sign in to complete your purchase</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to="/login"
                        state={{ from: '/checkout' }}
                        className="bg-[#C5A059] text-white px-6 py-2.5 font-semibold text-sm tracking-wide hover:bg-[#A08048] transition-colors flex items-center gap-2"
                        data-testid="login-to-checkout-button"
                      >
                        <LogIn className="w-4 h-4" />
                        LOGIN
                      </Link>
                      <Link
                        to="/signup"
                        state={{ from: '/checkout' }}
                        className="border border-white text-white px-6 py-2.5 font-semibold text-sm tracking-wide hover:bg-white/10 transition-colors"
                        data-testid="signup-to-checkout-button"
                      >
                        SIGN UP
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Customer Information */}
              <div data-testid="customer-info-section">
                <h2 className="font-serif text-2xl mb-6">Customer Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="customer_name">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      required
                      disabled={!isAuthenticated}
                      className="w-full px-0 py-3 border-b border-gray-300 focus:border-[#C5A059] outline-none bg-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="customer-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="customer_email">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="customer_email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      required
                      disabled={!isAuthenticated}
                      className="w-full px-0 py-3 border-b border-gray-300 focus:border-[#C5A059] outline-none bg-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="customer-email-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="customer_phone">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="customer_phone"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      required
                      disabled={!isAuthenticated}
                      className="w-full px-0 py-3 border-b border-gray-300 focus:border-[#C5A059] outline-none bg-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="customer-phone-input"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div data-testid="payment-method-section" className={!isAuthenticated ? 'opacity-50 pointer-events-none' : ''}>
                <h2 className="font-serif text-2xl mb-6">Payment Method</h2>
                <div className="space-y-4">
                  {/* Stripe */}
                  <label
                    className={`flex items-center gap-4 p-6 border-2 cursor-pointer transition-all ${paymentMethod === 'stripe'
                        ? 'border-[#C5A059] bg-[#F9F5F0]'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    data-testid="payment-stripe"
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-[#C5A059]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FaStripe className="w-8 h-8 text-[#635BFF]" />
                        <span className="font-semibold">Credit/Debit Card (Stripe)</span>
                      </div>
                      <div className="flex gap-2 text-gray-500">
                        <FaCcVisa className="w-8 h-6" />
                        <FaCcMastercard className="w-8 h-6" />
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Test Mode: Use test card for demo</p>
                    </div>
                  </label>

                  {/* Razorpay */}
                  <label
                    className={`flex items-center gap-4 p-6 border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay'
                        ? 'border-[#C5A059] bg-[#F9F5F0]'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    data-testid="payment-razorpay"
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-[#C5A059]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <SiRazorpay className="w-8 h-8 text-[#0C2451]" />
                        <span className="font-semibold">UPI / Cards / NetBanking (Razorpay)</span>
                      </div>
                      <div className="flex gap-2 items-center text-gray-500">
                        <Smartphone className="w-6 h-6" />
                        <span className="text-sm">UPI, Cards, Wallets & More</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Test Mode: Indian payment methods</p>
                    </div>
                  </label>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 text-sm text-blue-800" data-testid="test-mode-notice">
                  <strong>Note:</strong> This is a demo checkout. Payment integrations are set up with test/placeholder keys.
                  No actual payment will be processed.
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1" data-testid="order-summary-section">
              <div className="sticky top-24 bg-[#F9F5F0] p-8 border border-gray-200">
                <h2 className="font-serif text-2xl mb-6" data-testid="order-summary-title">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={item.product_id} className="flex gap-4" data-testid={`summary-item-${index}`}>
                      <img
                        src={item.product.images?.[0] || item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-20 object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold line-clamp-2">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-[#C5A059]">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span data-testid="summary-subtotal">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="text-[#C5A059]" data-testid="summary-total">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="place-order-button"
                  >
                    {loading ? 'PROCESSING...' : 'PLACE ORDER'}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    state={{ from: '/checkout' }}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                    data-testid="login-to-place-order-button"
                  >
                    <LogIn className="w-4 h-4" />
                    LOGIN TO PLACE ORDER
                  </Link>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}