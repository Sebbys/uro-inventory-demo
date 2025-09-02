"use client";
import { useState, useTransition } from 'react';
import { createProduct, updateStock, deleteProduct } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationButton } from '@/components/ui/notification-button';
import { NotificationSettings } from '@/components/ui/notification-settings';
import { GlobalReportButton } from '@/components/ui/global-report-button';
import { EmailReportButton } from '@/components/ui/email-report-button';
import { toast } from 'sonner';
import { Package, Plus, Trash2, AlertTriangle, CheckCircle, ArrowLeft, TrendingDown, TrendingUp, Bell } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
                <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span style={{
                    background: 'linear-gradient(135deg, oklch(0.64 0.216 264.53), oklch(0.72 0.196 280))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>Product</span>
                  <span className="text-foreground"> Management</span>
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/30 backdrop-blur-md border border-border/30 rounded-xl shadow-lg hover:border-border/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Products</CardTitle>
              <div className="p-2 bg-primary/20 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{totalProducts}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Active inventory items
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/30 backdrop-blur-md border border-border/30 rounded-xl shadow-lg hover:border-border/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Stock</CardTitle>
              <div className="p-2 bg-chart-2/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-chart-2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{totalStock}</div>
              <p className="text-xs text-muted-foreground">
                Units across all products
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/30 backdrop-blur-md border border-border/30 rounded-xl shadow-lg hover:border-border/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Low Stock Alerts</CardTitle>
              <div className={`p-2 rounded-lg ${lowStockProducts.length > 0 ? 'bg-destructive/20' : 'bg-chart-5/20'}`}>
                <AlertTriangle className={`h-4 w-4 ${lowStockProducts.length > 0 ? 'text-destructive' : 'text-chart-5'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-1 ${lowStockProducts.length > 0 ? 'text-destructive' : ''}`}>
                {lowStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                {lowStockProducts.length > 0 ? (
                  <><TrendingDown className="inline h-3 w-3 mr-1" />Products need restocking</>
                ) : (
                  <><CheckCircle className="inline h-3 w-3 mr-1" />All stock levels healthy</>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <NotificationSettings />
          <GlobalReportButton lowStockItems={lowStockProducts} />
          <EmailReportButton lowStockItems={lowStockProducts} />
        </div>

        {/* Add Product Form */}
        <Card className="bg-card/80 backdrop-blur-sm text-card-foreground border border-border/30 rounded-xl shadow-lg p-6">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="p-2 bg-primary/20 rounded-lg mr-3">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="grid gap-6 md:grid-cols-5 items-end">
              <div className="md:col-span-2 space-y-3">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Product Name
                </label>
                <Input 
                  name="name" 
                  required 
                  placeholder="Premium Widget" 
                  className="border border-border/50 bg-background/50 backdrop-blur-sm rounded-lg h-11 text-base focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  SKU
                </label>
                <Input 
                  name="sku" 
                  required 
                  placeholder="WIDGET-001" 
                  className="border border-border/50 bg-background/50 backdrop-blur-sm rounded-lg h-11 jetbrains-mono text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Initial Stock
                </label>
                <Input 
                  name="stock" 
                  type="number" 
                  defaultValue={0} 
                  min={0} 
                  className="border border-border/50 bg-background/50 backdrop-blur-sm rounded-lg h-11 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Threshold
                </label>
                <Input 
                  name="threshold" 
                  type="number" 
                  defaultValue={10} 
                  min={0} 
                  className="border border-border/50 bg-background/50 backdrop-blur-sm rounded-lg h-11 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
              <Button 
                disabled={pending} 
                className="md:col-span-5 h-12 text-base font-semibold" 
                type="submit"
                style={{
                  boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.3s ease'
                }}
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
        <Card className="bg-card/80 backdrop-blur-sm text-card-foreground border border-border/30 rounded-xl shadow-lg p-6">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <CardTitle className="flex items-center text-xl">
              <div className="p-2 bg-primary/20 rounded-lg mr-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
              Inventory Overview
              <Badge variant="secondary" className="ml-3 bg-muted/50 text-muted-foreground">
                {products.length} products
              </Badge>
            </CardTitle>
            {lowStockProducts.length > 0 && (
              <Badge variant="destructive" className="flex items-center bg-destructive/20 text-destructive border-destructive/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {lowStockProducts.length} Low Stock
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/30">
                    <TableHead className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">ID</TableHead>
                    <TableHead className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Product Name</TableHead>
                    <TableHead className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">SKU</TableHead>
                    <TableHead className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Current Stock</TableHead>
                    <TableHead className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Threshold</TableHead>
                    <TableHead className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Status</TableHead>
                    <TableHead className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">Notifications</TableHead>
                    <TableHead className="font-semibold text-muted-foreground uppercase tracking-wide text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => {
                    const low = p.stock < p.threshold;
                    return (
                      <TableRow 
                        key={p.id} 
                        className={`hover:bg-muted/30 transition-colors border-border/20 ${
                          low ? 'bg-destructive/5 border-l-4 border-l-destructive' : ''
                        }`}
                      >
                        <TableCell className="font-medium text-muted-foreground">#{p.id}</TableCell>
                        <TableCell className="font-semibold text-base">{p.name}</TableCell>
                        <TableCell>
                          <code className="jetbrains-mono text-sm bg-muted/50 px-3 py-1.5 rounded-lg font-medium border border-border/30">
                            {p.sku}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Input 
                              defaultValue={p.stock} 
                              type="number" 
                              min={0} 
                              className="w-24 h-9 text-center font-semibold border border-border/50 bg-background/50 backdrop-blur-sm rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300" 
                              onBlur={(e)=>{
                                const v = Number(e.currentTarget.value); 
                                if(v!==p.stock) handleStock(p.id, v);
                              }} 
                            />
                            <span className="text-sm text-muted-foreground font-medium">units</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium">{p.threshold}</TableCell>
                        <TableCell>
                          {low ? (
                            <Badge variant="destructive" className="flex items-center w-fit bg-destructive/20 text-destructive border-destructive/30">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              LOW STOCK
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center w-fit bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              IN STOCK
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <NotificationButton
                            productId={p.id}
                            productName={p.name}
                            sku={p.sku}
                            currentStock={p.stock}
                            threshold={p.threshold}
                            isLowStock={low}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={()=>handleDelete(p.id)}
                            className="h-9 hover:bg-destructive/90 transition-colors"
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
                      <TableCell colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center space-y-4 text-muted-foreground">
                          <div className="p-4 bg-muted/30 rounded-full">
                            <Package className="h-12 w-12 opacity-50" />
                          </div>
                          <div>
                            <p className="text-xl font-semibold mb-2">No products found</p>
                            <p className="text-base">Add your first product to get started with inventory management</p>
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
