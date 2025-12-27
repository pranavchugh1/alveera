import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600 bg-blue-100', label: 'Confirmed' },
  shipped: { icon: Truck, color: 'text-purple-600 bg-purple-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Cancelled' },
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/my-orders' } });
      return;
    }

    const fetchOrders = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, token, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C5A059]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="my-orders-page">
      <div className="bg-[#F9F5F0] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl mb-4" data-testid="page-title">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="font-serif text-2xl mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              EXPLORE COLLECTION <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Order ID</p>
                      <p className="font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex flex-wrap gap-4 mb-4">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-16 h-20 object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{item.product_name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500">+{order.items.length - 3} more items</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>
                          Placed: {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span>Payment: {order.payment_method}</span>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className="text-lg font-bold text-[#C5A059]">₹{order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
