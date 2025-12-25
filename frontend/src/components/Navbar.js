import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50" data-testid="navbar">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <img
              src="https://customer-assets.emergentagent.com/job_d6ea3157-e29e-4364-a4af-889b78a54f92/artifacts/yyus097t_logo%20copy.png"
              alt="Alveera Logo"
              className="h-16 w-auto"
              data-testid="logo-image"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8" data-testid="nav-links">
            <Link
              to="/"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
              data-testid="nav-home"
            >
              HOME
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
              data-testid="nav-products"
            >
              SHOP
            </Link>
            <Link
              to="/products?category=new-arrivals"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
              data-testid="nav-new-arrivals"
            >
              NEW ARRIVALS
            </Link>
            <Link
              to="/products?category=festive"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
              data-testid="nav-festive"
            >
              FESTIVE
            </Link>
          </div>

          <Link to="/cart" className="relative" data-testid="cart-button">
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-[#C5A059] transition-colors" />
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-[#C5A059] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold"
                data-testid="cart-count"
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}