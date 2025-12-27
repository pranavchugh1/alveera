import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AdminProvider } from "@/context/AdminContext";
import { AuthProvider } from "@/context/AuthContext";

// Customer Auth Pages
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import MyOrdersPage from "@/pages/MyOrdersPage";

// Admin Pages
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProducts from "@/pages/AdminProducts";
import AdminOrders from "@/pages/AdminOrders";
import { AdminLayout } from "@/components/AdminLayout";

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <div className="App">
            <BrowserRouter>
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
              <Toaster position="top-center" richColors />
            </BrowserRouter>
          </div>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
