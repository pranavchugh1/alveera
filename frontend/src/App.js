import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AdminProvider } from "@/context/AdminContext";
import { AuthProvider } from "@/context/AuthContext";

// Lazy-loaded pages for code splitting - reduces initial bundle size
// Each page is loaded only when the user navigates to that route
const HomePage = lazy(() => import("@/pages/HomePage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("@/pages/OrderConfirmationPage"));

// Customer Auth Pages
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const MyOrdersPage = lazy(() => import("@/pages/MyOrdersPage"));

// Admin Pages
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/AdminProducts"));
const AdminOrders = lazy(() => import("@/pages/AdminOrders"));
const AdminLayout = lazy(() => import("@/components/AdminLayout").then(module => ({ default: module.AdminLayout })));

// Loading spinner component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F9F5F0]">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 font-serif">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <div className="App">
            <BrowserRouter>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Auth Routes (No Navbar/Footer) */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  {/* Public Routes */}
                  <Route
                    path="/"
                    element={
                      <>
                        <Navbar />
                        <HomePage />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <>
                        <Navbar />
                        <ProductsPage />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/products/:id"
                    element={
                      <>
                        <Navbar />
                        <ProductDetailPage />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <>
                        <Navbar />
                        <CartPage />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <>
                        <Navbar />
                        <CheckoutPage />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/order-confirmation/:orderId"
                    element={
                      <>
                        <Navbar />
                        <OrderConfirmationPage />
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/my-orders"
                    element={
                      <>
                        <Navbar />
                        <MyOrdersPage />
                        <Footer />
                      </>
                    }
                  />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                  </Route>
                </Routes>
              </Suspense>
              <Toaster position="top-center" richColors />
            </BrowserRouter>
          </div>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
