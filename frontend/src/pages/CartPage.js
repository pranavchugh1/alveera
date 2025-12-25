import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount } = useCart();

  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`${productName} removed from cart`);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" data-testid="empty-cart">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-300" />
          <h2 className="font-serif text-4xl mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Discover our beautiful collection of ethnic wear</p>
          <Link to="/products">
            <button className="btn-primary" data-testid="continue-shopping-empty">CONTINUE SHOPPING</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="cart-page">
      <div className="bg-[#F9F5F0] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl mb-4" data-testid="page-title">Shopping Cart</h1>
          <p className="text-gray-600">{getCartItemsCount()} {getCartItemsCount() === 1 ? 'item' : 'items'} in your cart</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2" data-testid="cart-items-section">
            <div className="space-y-6">
              {cart.map((item, index) => (
                <motion.div
                  key={item.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-6 p-6 bg-[#F9F5F0] border border-transparent hover:border-[#C5A059]/30 transition-all"
                  data-testid={`cart-item-${index}`}
                >
                  <Link to={`/products/${item.product_id}`} className="shrink-0">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-32 h-40 object-cover"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/products/${item.product_id}`}>
                        <h3 className="font-serif text-xl mb-2 hover:text-[#C5A059] transition-colors" data-testid={`cart-item-name-${index}`}>
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-1">{item.product.material}</p>
                      <p className="text-sm text-gray-600">{item.product.color}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-2 hover:bg-white transition-colors"
                          data-testid={`decrease-quantity-${index}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold" data-testid={`cart-quantity-${index}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-2 hover:bg-white transition-colors"
                          data-testid={`increase-quantity-${index}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-[#C5A059]" data-testid={`cart-item-price-${index}`}>
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemove(item.product_id, item.product.name)}
                          className="text-sm text-red-600 hover:underline mt-2 flex items-center gap-1"
                          data-testid={`remove-item-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/products">
                <button className="btn-secondary" data-testid="continue-shopping">CONTINUE SHOPPING</button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1" data-testid="order-summary-section">
            <div className="sticky top-24 bg-[#F9F5F0] p-8 border border-gray-200">
              <h2 className="font-serif text-2xl mb-6" data-testid="order-summary-title">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="subtotal-amount">₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4 mb-6">
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="text-[#C5A059]" data-testid="total-amount">₹{getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary"
                data-testid="proceed-to-checkout"
              >
                PROCEED TO CHECKOUT
              </button>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Secure Checkout</p>
                <p className="mt-2">Free shipping on orders over ₹5000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}