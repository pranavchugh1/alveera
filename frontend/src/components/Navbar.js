import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { getCartItemsCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const cartCount = getCartItemsCount();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

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

          <div className="flex items-center gap-4">
            {/* User Authentication */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#C5A059] transition-colors"
                  data-testid="user-menu-button"
                >
                  <div className="w-8 h-8 bg-[#C5A059] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 hidden md:block transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg py-2 z-50" data-testid="user-dropdown">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/my-orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#F9F5F0] hover:text-[#C5A059] transition-colors"
                      data-testid="dropdown-orders"
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
                      data-testid="dropdown-logout"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
                data-testid="login-button"
              >
                <User className="w-5 h-5" />
                LOGIN
              </Link>
            )}

            {/* Cart */}
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

            {/* Mobile Menu Button */}
            <button
              className="md:hidden ml-2 p-2 text-gray-700 hover:text-[#C5A059] transition-colors"
              onClick={toggleMobileMenu}
              data-testid="mobile-menu-button"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg" data-testid="mobile-menu">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              to="/"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
              onClick={closeMobileMenu}
              data-testid="mobile-nav-home"
            >
              HOME
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
              onClick={closeMobileMenu}
              data-testid="mobile-nav-products"
            >
              SHOP
            </Link>
            <Link
              to="/products?category=new-arrivals"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
              onClick={closeMobileMenu}
              data-testid="mobile-nav-new-arrivals"
            >
              NEW ARRIVALS
            </Link>
            <Link
              to="/products?category=festive"
              className="text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
              onClick={closeMobileMenu}
              data-testid="mobile-nav-festive"
            >
              FESTIVE
            </Link>
            
            {/* Mobile User Section */}
            <div className="border-t border-gray-100 pt-4 space-y-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C5A059] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/my-orders"
                    className="flex items-center gap-3 text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
                    onClick={closeMobileMenu}
                    data-testid="mobile-nav-orders"
                  >
                    <Package className="w-4 h-4" />
                    MY ORDERS
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-sm font-medium tracking-wide text-red-600 hover:text-red-700 transition-colors"
                    data-testid="mobile-nav-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-3 text-sm font-medium tracking-wide text-gray-700 hover:text-[#C5A059] transition-colors"
                  onClick={closeMobileMenu}
                  data-testid="mobile-nav-login"
                >
                  <User className="w-4 h-4" />
                  LOGIN / SIGNUP
                </Link>
              )}
            </div>
            
            <Link
              to="/admin/login"
              className="text-sm font-medium tracking-wide text-gray-400 hover:text-gray-600 transition-colors border-t border-gray-100 pt-4"
              onClick={closeMobileMenu}
              data-testid="mobile-nav-admin"
            >
              ADMIN LOGIN
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}