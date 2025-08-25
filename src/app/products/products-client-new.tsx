"use client";
import { useState, useTransition } from 'react';
import { createProduct, updateStock, deleteProduct } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from 'sonner';
import { Package, Plus, Trash2, AlertTriangle, CheckCircle, ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number; name: string; sku: string; stock: number; threshold: number;
}

export default function ProductsClient({ initial }: { initial: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initial);
  const [pending, startTransition] = useTransition();

  async function handleCreate(form: FormData) {
    const name = String(form.get('name')||'').trim();
    const sku = String(form.get('sku')||'').trim();
    const stock = Number(form.get('stock')||0);
    const threshold = Number(form.get('threshold')||0);
    if(!name || !sku) { toast.error('Name and SKU required'); return; }
    startTransition(async () => {
      try {
        await createProduct(form);
        toast.success('Product added successfully');
        // optimistic: add temporary local record (id is placeholder until refresh)
        setProducts(p => [...p, { id: Math.max(0, ...p.map(x=>x.id))+1, name, sku, stock, threshold }]);
      } catch (e:any) {
        toast.error('Failed to add product');
      }
    });
  }

  async function handleStock(id: number, newStock: number) {
    const form = new FormData();
    form.append('id', String(id));
    form.append('stock', String(newStock));
    const prev = products;
    setProducts(p => p.map(r => r.id===id ? { ...r, stock: newStock }: r));
    startTransition(async () => {
      try {
        await updateStock(form);
        toast.success('Stock updated successfully');
      } catch(e) {
        toast.error('Failed to update stock');
        setProducts(prev);
      }
    });
  }

  async function handleDelete(id: number) {
    if(!confirm('Are you sure you want to delete this product?')) return;
    const form = new FormData(); form.append('id', String(id));
    const prev = products;
    setProducts(p => p.filter(r => r.id!==id));
    startTransition(async () => {
      try {
        await deleteProduct(form);
        toast.success('Product deleted successfully');
      } catch(e) {
        toast.error('Failed to delete product');
        setProducts(prev);
      }
    });
  }

  const lowStockProducts = products.filter(p => p.stock < p.threshold);
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-semibold tracking-tight geist-sans">
                  Product Management
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Active inventory items
              </p>
            </CardContent>
          </Card>
          
          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground">
                Units across all products
              </p>
            </CardContent>
          </Card>
          
          <Card className="modern-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${lowStockProducts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lowStockProducts.length > 0 ? 'text-destructive' : ''}`}>
                {lowStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {lowStockProducts.length > 0 ? (
                  <><TrendingDown className="inline h-3 w-3 mr-1" />Products need restocking</>
                ) : (
                  <><CheckCircle className="inline h-3 w-3 mr-1" />All stock levels healthy</>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Product Form */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="grid gap-6 md:grid-cols-5 items-end">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Product Name
                </label>
                <Input 
                  name="name" 
                  required 
                  placeholder="Premium Widget" 
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  SKU
                </label>
                <Input 
                  name="sku" 
                  required 
                  placeholder="WIDGET-001" 
                  className="h-10 jetbrains-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Initial Stock
                </label>
                <Input 
                  name="stock" 
                  type="number" 
                  defaultValue={0} 
                  min={0} 
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Low Stock Threshold
                </label>
                <Input 
                  name="threshold" 
                  type="number" 
                  defaultValue={10} 
                  min={0} 
                  className="h-10"
                />
              </div>
              <Button 
                disabled={pending} 
                className="md:col-span-5 h-10 button-highlighted-shadow" 
                type="submit"
              >
                {pending ? (
                  <>Adding Product...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="modern-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Inventory Overview ({products.length} products)
            </CardTitle>
            {lowStockProducts.length > 0 && (
              <Badge variant="destructive" className="flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {lowStockProducts.length} Low Stock
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Product Name</TableHead>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Current Stock</TableHead>
                    <TableHead className="font-semibold">Threshold</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => {
                    const low = p.stock < p.threshold;
                    return (
                      <TableRow 
                        key={p.id} 
                        className={`hover:bg-muted/50 transition-colors ${
                          low ? 'bg-destructive/5 border-l-4 border-l-destructive' : ''
                        }`}
                      >
                        <TableCell className="font-medium">{p.id}</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                          <code className="jetbrains-mono text-sm bg-muted px-2 py-1 rounded font-medium">
                            {p.sku}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Input 
                              defaultValue={p.stock} 
                              type="number" 
                              min={0} 
                              className="w-20 h-8 text-center font-medium" 
                              onBlur={(e)=>{
                                const v = Number(e.currentTarget.value); 
                                if(v!==p.stock) handleStock(p.id, v);
                              }} 
                            />
                            <span className="text-sm text-muted-foreground">units</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.threshold}</TableCell>
                        <TableCell>
                          {low ? (
                            <Badge variant="destructive" className="flex items-center w-fit">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              LOW STOCK
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center w-fit bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              IN STOCK
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={()=>handleDelete(p.id)}
                            className="h-8"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-3 text-muted-foreground">
                          <Package className="h-12 w-12 opacity-50" />
                          <div>
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm">Add your first product to get started</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
