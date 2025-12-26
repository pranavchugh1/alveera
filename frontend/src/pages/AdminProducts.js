import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Loader2,
  Search,
  ImageOff,
} from 'lucide-react';

const productSchema = z.object({
  design_no: z.string().min(1, 'Design number is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  material: z.string().min(1, 'Material is required'),
  color: z.string().min(1, 'Color is required'),
  images: z.array(z.string().url('Must be a valid URL')).min(1, 'At least one image is required'),
  category: z.string().min(1, 'Category is required'),
});

const categories = [
  { id: 'new-arrivals', name: 'New Arrivals' },
  { id: 'festive', name: 'Festive Anecdotes' },
  { id: 'silk', name: 'Exquisite Silk' },
];

export default function AdminProducts() {
  const { authAxios } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      design_no: '',
      name: '',
      description: '',
      price: '',
      material: '',
      color: '',
      images: [],
      category: '',
    },
  });

  const fetchProducts = useCallback(async () => {
    try {
      const response = await authAxios().get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [authAxios]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAddDialog = () => {
    setEditingProduct(null);
    form.reset({
      design_no: '',
      name: '',
      description: '',
      price: '',
      material: '',
      color: '',
      image_url: '',
      category: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    form.reset({
      design_no: product.design_no,
      name: product.name,
      description: product.description,
      price: product.price,
      material: product.material,
      color: product.color,
      images: product.images || (product.image_url ? [product.image_url] : []),
      category: product.category,
    });
    setDialogOpen(true);
  };

  const handleAddImage = (e) => {
    e.preventDefault();
    const currentImages = form.getValues('images');
    form.setValue('images', [...currentImages, '']);
  };

  const handleRemoveImage = (index) => {
    const currentImages = form.getValues('images');
    form.setValue('images', currentImages.filter((_, i) => i !== index));
  };

  const openDeleteDialog = (product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await authAxios().put(`/api/products/${editingProduct.id}`, data);
        toast.success('Product updated successfully');
      } else {
        await authAxios().post('/api/products', data);
        toast.success('Product added successfully');
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      const message = error.response?.data?.detail || 'Operation failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    setSubmitting(true);
    try {
      await authAxios().delete(`/api/products/${deletingProduct.id}`);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (error) {
      const message = error.response?.data?.detail || 'Delete failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockToggle = async (product) => {
    try {
      await authAxios().put(`/api/products/${product.id}`, {
        in_stock: !product.in_stock,
      });
      fetchProducts();
      toast.success(`Product marked as ${!product.in_stock ? 'in stock' : 'out of stock'}`);
    } catch (error) {
      toast.error('Failed to update stock status');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.design_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Products
          </h1>
          <p className="text-[#666] mt-1">Manage your product catalogue</p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-[#C5A059] hover:bg-[#B08D45] text-white gap-2"
          data-testid="add-product-button"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
        <Input
          placeholder="Search by name or design no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#444] focus:border-[#C5A059]"
          data-testid="product-search-input"
        />
      </div>

      {/* Products Table */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardContent className="p-0">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-[#666]">Image</TableHead>
                    <TableHead className="text-[#666]">Design No</TableHead>
                    <TableHead className="text-[#666]">Name</TableHead>
                    <TableHead className="text-[#666]">Price</TableHead>
                    <TableHead className="text-[#666]">Category</TableHead>
                    <TableHead className="text-[#666]">In Stock</TableHead>
                    <TableHead className="text-[#666] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className="border-[#2a2a2a] hover:bg-[#2a2a2a]/50"
                    >
                      <TableCell>
                        <div className="w-12 h-16 rounded overflow-hidden bg-[#2a2a2a] flex items-center justify-center">
                          {(product.images && product.images.length > 0) ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageOff className="w-5 h-5 text-[#444]" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-[#888]">
                        {product.design_no}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-xs text-[#666] truncate max-w-[200px]">
                            {product.material} • {product.color}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-[#C5A059]/30 text-[#C5A059] capitalize"
                        >
                          {categories.find((c) => c.id === product.category)?.name ||
                            product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={product.in_stock}
                          onCheckedChange={() => handleStockToggle(product)}
                          className="data-[state=checked]:bg-[#C5A059]"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            className="text-[#888] hover:text-white hover:bg-[#2a2a2a]"
                            data-testid={`edit-product-${product.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(product)}
                            className="text-[#888] hover:text-red-400 hover:bg-red-400/10"
                            data-testid={`delete-product-${product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
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
              <Package className="w-12 h-12 text-[#333] mx-auto mb-4" />
              <p className="text-[#666]">
                {searchTerm ? 'No products match your search' : 'No products yet'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={openAddDialog}
                  variant="link"
                  className="text-[#C5A059] mt-2"
                >
                  Add your first product
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-['Playfair_Display']">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Design No */}
              <div className="space-y-2">
                <Label htmlFor="design_no" className="text-[#888]">
                  Design No *
                </Label>
                <Input
                  id="design_no"
                  {...form.register('design_no')}
                  placeholder="ALV-001"
                  className="bg-[#0f0f0f] border-[#2a2a2a] text-white focus:border-[#C5A059]"
                />
                {form.formState.errors.design_no && (
                  <p className="text-red-400 text-xs">
                    {form.formState.errors.design_no.message}
                  </p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#888]">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Royal Silk Saree"
                  className="bg-[#0f0f0f] border-[#2a2a2a] text-white focus:border-[#C5A059]"
                />
                {form.formState.errors.name && (
                  <p className="text-red-400 text-xs">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[#888]">
                  Price (₹) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  {...form.register('price')}
                  placeholder="15000"
                  className="bg-[#0f0f0f] border-[#2a2a2a] text-white focus:border-[#C5A059]"
                />
                {form.formState.errors.price && (
                  <p className="text-red-400 text-xs">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#888]">
                  Category *
                </Label>
                <Controller
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white focus:border-[#C5A059]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.id}
                            className="text-white hover:bg-[#2a2a2a] focus:bg-[#2a2a2a]"
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.category && (
                  <p className="text-red-400 text-xs">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              {/* Material */}
              <div className="space-y-2">
                <Label htmlFor="material" className="text-[#888]">
                  Material *
                </Label>
                <Input
                  id="material"
                  {...form.register('material')}
                  placeholder="Pure Silk"
                  className="bg-[#0f0f0f] border-[#2a2a2a] text-white focus:border-[#C5A059]"
                />
                {form.formState.errors.material && (
                  <p className="text-red-400 text-xs">
                    {form.formState.errors.material.message}
                  </p>
                )}
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color" className="text-[#888]">
                  Color *
                </Label>
                <Input
                  id="color"
                  {...form.register('color')}
                  placeholder="Gold & Maroon"
                  className="bg-[#0f0f0f] border-[#2a2a2a] text-white focus:border-[#C5A059]"
                />
                {form.formState.errors.color && (
                  <p className="text-red-400 text-xs">
                    {form.formState.errors.color.message}
                  </p>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[#888]">Product Images *</Label>
                <Button
                  type="button"
                  onClick={handleAddImage}
                  variant="outline"
                  size="sm"
                  className="h-8 border-[#2a2a2a] text-[#C5A059] hover:text-[#B08D45] hover:bg-[#2a2a2a]"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add URL
                </Button>
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <>
                      {field.value.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={url}
                            onChange={(e) => {
                              const newImages = [...field.value];
                              newImages[index] = e.target.value;
                              field.onChange(newImages);
                            }}
                            placeholder="https://example.com/image.jpg"
                            className="bg-[#0f0f0f] border-[#2a2a2a] text-white focus:border-[#C5A059]"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveImage(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {field.value.length === 0 && (
                        <div className="text-center p-4 border border-dashed border-[#2a2a2a] rounded-md text-[#666] text-sm">
                          No images added. Click "Add URL" to add image links.
                        </div>
                      )}
                    </>
                  )}
                />
              </div>
              {form.formState.errors.images && (
                <p className="text-red-400 text-xs">
                  {form.formState.errors.images.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#888]">
                Description *
              </Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Describe the product in detail..."
                rows={4}
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white focus:border-[#C5A059] resize-none"
              />
              {form.formState.errors.description && (
                <p className="text-red-400 text-xs">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter className="gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-[#2a2a2a] text-[#888] hover:text-white hover:bg-[#2a2a2a]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#C5A059] hover:bg-[#B08D45] text-white"
                data-testid="save-product-button"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingProduct ? (
                  'Update Product'
                ) : (
                  'Add Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-['Playfair_Display']">
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              Are you sure you want to delete "{deletingProduct?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-[#2a2a2a] text-[#888] hover:text-white hover:bg-[#2a2a2a]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-500 hover:bg-red-600 text-white"
              data-testid="confirm-delete-button"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
