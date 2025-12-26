import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Loader2,
  Package,
  Eye,
  RefreshCw,
} from 'lucide-react';

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-500/20 text-green-500 border-green-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500/20 text-red-500 border-red-500/30',
  },
};

const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { authAxios } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await authAxios().get('/api/admin/orders', { params });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [authAxios, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openDetailsDialog = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    setUpdating(true);
    try {
      await authAxios().put(`/api/admin/orders/${selectedOrder.id}/status`, {
        status: newStatus,
      });
      toast.success('Order status updated');
      setStatusDialogOpen(false);
      fetchOrders();
    } catch (error) {
      const message = error.response?.data?.detail || 'Update failed';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-[#1a1a1a] rounded-lg w-1/3" />
        <div className="h-96 bg-[#1a1a1a] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-['Playfair_Display'] text-white font-semibold">
            Orders
          </h1>
          <p className="text-[#666] mt-1">Manage customer orders and update status</p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="border-[#2a2a2a] text-[#888] hover:text-white hover:bg-[#2a2a2a] gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-4">
        <Label className="text-[#888]">Filter by status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-[#1a1a1a] border-[#2a2a2a] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <SelectItem value="all" className="text-white hover:bg-[#2a2a2a]">
              All Orders
            </SelectItem>
            {statusOptions.map((status) => (
              <SelectItem
                key={status}
                value={status}
                className="text-white hover:bg-[#2a2a2a] capitalize"
              >
                {statusConfig[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardContent className="p-0">
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-[#666]">Order ID</TableHead>
                    <TableHead className="text-[#666]">Customer</TableHead>
                    <TableHead className="text-[#666]">Items</TableHead>
                    <TableHead className="text-[#666]">Total</TableHead>
                    <TableHead className="text-[#666]">Date</TableHead>
                    <TableHead className="text-[#666]">Status</TableHead>
                    <TableHead className="text-[#666] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-[#2a2a2a] hover:bg-[#2a2a2a]/50"
                    >
                      <TableCell className="font-mono text-sm text-[#888]">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{order.customer_name}</p>
                          <p className="text-xs text-[#666]">{order.customer_email}</p>
                          <p className="text-xs text-[#666]">{order.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#888]">
                        {order.items?.length || 0} item(s)
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        ₹{order.total?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-[#888] text-sm">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize cursor-pointer hover:opacity-80 transition-opacity ${statusConfig[order.status]?.color || statusConfig.pending.color}`}
                          onClick={() => openStatusDialog(order)}
                        >
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetailsDialog(order)}
                            className="text-[#888] hover:text-white hover:bg-[#2a2a2a]"
                            data-testid={`view-order-${order.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStatusDialog(order)}
                            className="text-[#C5A059] hover:text-[#B08D45] hover:bg-[#C5A059]/10"
                            data-testid={`update-status-${order.id}`}
                          >
                            Update Status
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 text-[#333] mx-auto mb-4" />
              <p className="text-[#666]">
                {statusFilter !== 'all'
                  ? `No ${statusFilter} orders found`
                  : 'No orders yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-['Playfair_Display']">
              Order Details
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#666] text-sm">Order ID</p>
                  <p className="text-white font-mono text-sm">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-[#666] text-sm">Date</p>
                  <p className="text-white">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-[#666] text-sm">Status</p>
                  <Badge
                    variant="outline"
                    className={`capitalize mt-1 ${statusConfig[selectedOrder.status]?.color}`}
                  >
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-[#666] text-sm">Payment Method</p>
                  <p className="text-white capitalize">{selectedOrder.payment_method}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t border-[#2a2a2a] pt-4">
                <h3 className="text-[#C5A059] font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#666] text-sm">Name</p>
                    <p className="text-white">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-[#666] text-sm">Email</p>
                    <p className="text-white">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-[#666] text-sm">Phone</p>
                    <p className="text-white">{selectedOrder.customer_phone}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-[#2a2a2a] pt-4">
                <h3 className="text-[#C5A059] font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-[#0f0f0f] rounded p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-[#666]" />
                        <span className="text-[#888] font-mono text-sm">
                          {item.product_id.slice(0, 8)}...
                        </span>
                      </div>
                      <span className="text-white">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-[#2a2a2a] pt-4 flex justify-between items-center">
                <span className="text-[#666]">Total Amount</span>
                <span className="text-2xl font-semibold text-[#C5A059]">
                  ₹{selectedOrder.total?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDetailsOpen(false)}
              className="border-[#2a2a2a] text-[#888] hover:text-white hover:bg-[#2a2a2a]"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setDetailsOpen(false);
                openStatusDialog(selectedOrder);
              }}
              className="bg-[#C5A059] hover:bg-[#B08D45] text-white"
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-['Playfair_Display']">
              Update Order Status
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <p className="text-[#666] text-sm mb-1">Order ID</p>
              <p className="text-white font-mono text-sm">
                {selectedOrder?.id.slice(0, 8)}...
              </p>
            </div>

            <div>
              <p className="text-[#666] text-sm mb-1">Customer</p>
              <p className="text-white">{selectedOrder?.customer_name}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[#888]">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full bg-[#0f0f0f] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  {statusOptions.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="text-white hover:bg-[#2a2a2a]"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${status === 'pending'
                            ? 'bg-yellow-500'
                            : status === 'confirmed'
                              ? 'bg-blue-500'
                              : status === 'shipped'
                                ? 'bg-purple-500'
                                : status === 'delivered'
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                            }`}
                        />
                        {statusConfig[status].label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-3">
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              className="border-[#2a2a2a] text-[#888] hover:text-white hover:bg-[#2a2a2a]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === selectedOrder?.status}
              className="bg-[#C5A059] hover:bg-[#B08D45] text-white"
              data-testid="confirm-status-update"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
