import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get the redirect path from location state (or default to home)
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await signup(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone
    );
    setLoading(false);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F5F0] flex" data-testid="signup-page">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 border border-[#C5A059]/30 rounded-full" />
          <div className="absolute bottom-32 right-16 w-48 h-48 border border-[#C5A059]/30 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-[#C5A059]/20 rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <Link to="/" className="mb-8">
            <img
              src="https://customer-assets.emergentagent.com/job_d6ea3157-e29e-4364-a4af-889b78a54f92/artifacts/yyus097t_logo%20copy.png"
              alt="Alveera Logo"
              className="h-20 w-auto brightness-0 invert"
            />
          </Link>
          <h2 className="font-serif text-4xl text-white mb-4 text-center">Join Alveera</h2>
          <p className="text-gray-400 text-center max-w-md">
            Create an account to enjoy exclusive benefits, track your orders, and get early access to new collections.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 p-4 rounded">
              <p className="text-[#C5A059] font-bold text-xl">Exclusive</p>
              <p className="text-gray-400 text-sm">Member Offers</p>
            </div>
            <div className="bg-white/10 p-4 rounded">
              <p className="text-[#C5A059] font-bold text-xl">Easy</p>
              <p className="text-gray-400 text-sm">Order Tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/">
              <img
                src="https://customer-assets.emergentagent.com/job_d6ea3157-e29e-4364-a4af-889b78a54f92/artifacts/yyus097t_logo%20copy.png"
                alt="Alveera Logo"
                className="h-16 w-auto mx-auto"
              />
            </Link>
          </div>

          <div className="bg-white p-8 shadow-xl border border-gray-100">
            <h1 className="font-serif text-3xl text-center mb-2" data-testid="signup-title">Create Account</h1>
            <p className="text-gray-500 text-center mb-8">Join Alveera's exclusive community</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="fullName">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-colors"
                    placeholder="Your full name"
                    data-testid="fullname-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="email">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-colors"
                    placeholder="your@email.com"
                    data-testid="email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-colors"
                    placeholder="+91 98765 43210"
                    data-testid="phone-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="password">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-colors"
                    placeholder="Min 6 characters"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 uppercase tracking-wider" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-colors"
                    placeholder="Confirm your password"
                    data-testid="confirm-password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="signup-button"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  state={{ from }}
                  className="text-[#C5A059] hover:text-[#A08048] font-semibold transition-colors"
                  data-testid="login-link"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            <Link to="/" className="hover:text-[#C5A059] transition-colors">
              ← Back to Store
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
