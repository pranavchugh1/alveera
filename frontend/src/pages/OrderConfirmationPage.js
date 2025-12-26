import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CheckCircle2, Package, Mail, Phone } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API}/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-state">
        <div className="inline-block w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="order-not-found">
        <div className="text-center">
          <h2 className="font-serif text-3xl mb-4">Order Not Found</h2>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="order-confirmation-page">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Success Icon */}
          <div className="text-center mb-12" data-testid="success-section">
            <CheckCircle2 className="w-24 h-24 text-[#10B981] mx-auto mb-6" />
            <h1 className="font-serif text-5xl mb-4">Thank You!</h1>
            <p className="text-xl text-gray-600">Your order has been placed successfully</p>
          </div>

          {/* Order Details */}
          <div className="bg-[#F9F5F0] p-8 mb-8" data-testid="order-details-section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-600 mb-2">Order Number</p>
                <p className="text-lg font-mono" data-testid="order-id">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-600 mb-2">Order Total</p>
                <p className="text-lg font-bold text-[#C5A059]" data-testid="order-total">₹{order.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-6">
              <h3 className="font-serif text-xl mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2" data-testid="customer-name">
                  <Package className="w-5 h-5 text-[#C5A059]" />
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2" data-testid="customer-email">
                  <Mail className="w-5 h-5 text-[#C5A059]" />
                  <span>{order.customer_email}</span>
                </div>
                <div className="flex items-center gap-2" data-testid="customer-phone">
                  <Phone className="w-5 h-5 text-[#C5A059]" />
                  <span>{order.customer_phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 p-8 mb-8" data-testid="next-steps-section">
            <h3 className="font-serif text-2xl mb-4">What happens next?</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <span>You will receive an order confirmation email at {order.customer_email}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <span>Our team will contact you within 24 hours to confirm your order</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <span>Your order will be carefully packaged and shipped within 3-5 business days</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <span>Track your order status via email updates</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center" data-testid="action-buttons">
            <Link to="/products">
              <button className="btn-secondary" data-testid="continue-shopping">CONTINUE SHOPPING</button>
            </Link>
            <Link to="/">
              <button className="btn-primary" data-testid="back-home">BACK TO HOME</button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="text-center mt-12 text-sm text-gray-600" data-testid="contact-info">
            <p>Need help with your order?</p>
            <p className="mt-2">
              Contact us at{' '}
              <a href="mailto:info@alveeraethnic.com" className="text-[#C5A059] hover:underline">
                info@alveeraethnic.com
              </a>
              {' '}or call{' '}
              <a href="tel:+91XXXXXXXXXX" className="text-[#C5A059] hover:underline">
                +91-XXXXXXXXXX
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}