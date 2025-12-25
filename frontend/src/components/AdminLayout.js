import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
];

export const AdminLayout = () => {
  const { isAuthenticated, loading, admin, logout } = useAdmin();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-pulse text-[#C5A059] text-xl font-['Playfair_Display']">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#2a2a2a]">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#8B7340] rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-white font-['Playfair_Display'] text-lg font-semibold">
                  ALVEERA
                </h1>
                <p className="text-[#666] text-xs tracking-widest">ADMIN PANEL</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30'
                      : 'text-[#888] hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-['Lato'] tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Admin info & Logout */}
          <div className="p-4 border-t border-[#2a2a2a]">
            <div className="px-4 py-2 mb-3">
              <p className="text-white font-medium text-sm truncate">{admin?.full_name}</p>
              <p className="text-[#666] text-xs truncate">{admin?.email}</p>
            </div>
            <Separator className="bg-[#2a2a2a] mb-3" />
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start gap-3 text-[#888] hover:text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 lg:px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>

          <div className="flex items-center gap-4 ml-auto">
            <Link
              to="/"
              className="text-[#888] hover:text-[#C5A059] text-sm font-['Lato'] tracking-wide transition-colors"
            >
              View Store →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
