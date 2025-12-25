import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const { isAuthenticated, loading, login } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-pulse text-[#C5A059] text-xl font-['Playfair_Display']">
          Loading...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Welcome back!');
      navigate('/admin');
    } else {
      toast.error(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#2a2a2a] relative z-10">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059] to-[#8B7340] rounded-lg flex items-center justify-center shadow-lg shadow-[#C5A059]/20">
              <span className="text-white font-bold text-2xl font-['Playfair_Display']">A</span>
            </div>
          </div>
          <h1 className="text-2xl font-['Playfair_Display'] text-white font-semibold">
            ALVEERA
          </h1>
          <p className="text-[#666] text-xs tracking-[0.3em] mt-1">ADMIN PORTAL</p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#888] text-sm">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@alveera.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-[#0f0f0f] border-[#2a2a2a] text-white placeholder:text-[#444] focus:border-[#C5A059] focus:ring-[#C5A059]/20"
                  data-testid="admin-email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#888] text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-[#0f0f0f] border-[#2a2a2a] text-white placeholder:text-[#444] focus:border-[#C5A059] focus:ring-[#C5A059]/20"
                  data-testid="admin-password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C5A059] hover:bg-[#B08D45] text-white font-['Lato'] tracking-widest uppercase text-xs py-6 transition-all duration-300"
              data-testid="admin-login-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#2a2a2a] text-center">
            <a
              href="/"
              className="text-[#666] hover:text-[#C5A059] text-sm transition-colors"
            >
              ← Back to Store
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
