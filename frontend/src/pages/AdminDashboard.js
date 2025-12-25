import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-500 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500/30',
};

export default function AdminDashboard() {
  const { authAxios } = useAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authAxios().get('/api/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [authAxios]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#1a1a1a] rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-[#1a1a1a] rounded-lg" />
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.total_revenue?.toLocaleString('en-IN') || 0}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Products',
      value: stats?.total_products || 0,
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Pending Orders',
      value: stats?.pending_orders || 0,
      icon: Clock,
      color: 'from-[#C5A059] to-[#8B7340]',
      bgColor: 'bg-[#C5A059]/10',
    },
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-['Playfair_Display'] text-white font-semibold">
          Dashboard
        </h1>
        <p className="text-[#666] mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card
              key={index}
              className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#666] text-sm font-['Lato'] tracking-wide">
                      {metric.title}
                    </p>
                    <p className="text-2xl lg:text-3xl font-semibold text-white mt-2">
                      {metric.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`w-6 h-6 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} style={{ stroke: 'currentColor' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-['Playfair_Display'] text-white">
            Recent Orders
          </CardTitle>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-[#C5A059] hover:text-[#B08D45] text-sm font-['Lato'] transition-colors"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {stats?.recent_orders?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-[#666]">Order ID</TableHead>
                    <TableHead className="text-[#666]">Customer</TableHead>
                    <TableHead className="text-[#666]">Total</TableHead>
                    <TableHead className="text-[#666]">Date</TableHead>
                    <TableHead className="text-[#666]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recent_orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-[#2a2a2a] hover:bg-[#2a2a2a]/50"
                    >
                      <TableCell className="font-mono text-sm text-[#888]">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-white">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-xs text-[#666]">{order.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        ₹{order.total?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-[#888]">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusColors[order.status] || statusColors.pending}`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-[#333] mx-auto mb-4" />
              <p className="text-[#666]">No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
