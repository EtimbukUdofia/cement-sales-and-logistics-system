import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Package, History, Save, Plus, Minus, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { apiClient } from '@/lib/api';

interface Product {
  _id: string;
  name: string;
  brand: string;
  type: string;
  unitPrice: number;
}

interface ShopInventoryItem {
  _id: string;
  product: Product;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  lastRestocked: string;
}

interface InventoryUpdate {
  _id: string;
  product: {
    name: string;
    brand: string;
  };
  previousQuantity: number;
  newQuantity: number;
  changeAmount: number;
  changeType: 'increase' | 'decrease' | 'restock' | 'adjustment';
  reason?: string;
  updatedBy: {
    username: string;
  };
  createdAt: string;
}

interface Shop {
  _id: string;
  name: string;
  address: string;
  manager?: {
    username: string;
  };
}

interface QuantityUpdateData {
  productId: string;
  newQuantity: number;
  changeType: 'increase' | 'decrease' | 'restock' | 'adjustment';
  reason?: string;
}

interface BulkUpdateModalData {
  isOpen: boolean;
  item: ShopInventoryItem | null;
}

interface BulkUpdateFormData {
  quantity: number;
  changeType: 'increase' | 'decrease' | 'restock' | 'adjustment';
  reason: string;
}

export default function ShopInventoryPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const [shop, setShop] = useState<Shop | null>(null);
  const [inventory, setInventory] = useState<ShopInventoryItem[]>([]);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [bulkUpdateModal, setBulkUpdateModal] = useState<BulkUpdateModalData>({
    isOpen: false,
    item: null
  });
  const [bulkUpdateForm, setBulkUpdateForm] = useState<BulkUpdateFormData>({
    quantity: 0,
    changeType: 'adjustment',
    reason: ''
  });

  const fetchShopDetails = useCallback(async () => {
    try {
      const data = await apiClient.getShopDetailsForInventory(shopId!) as { success: boolean; shop: Shop; message?: string };

      if (data.success) {
        setShop(data.shop);
      } else {
        throw new Error(data.message || 'Failed to fetch shop details');
      }
    } catch (error) {
      toast.error(`Failed to load shop details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [shopId]);

  const fetchInventory = useCallback(async () => {
    try {
      const data = await apiClient.getShopInventoryForAdmin(shopId!) as { success: boolean; inventory: ShopInventoryItem[]; message?: string };

      if (data.success) {
        setInventory(data.inventory || []);
      } else {
        throw new Error(data.message || 'Failed to fetch inventory');
      }
    } catch (error) {
      toast.error(`Failed to load inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [shopId]);

  const fetchInventoryHistory = useCallback(async () => {
    try {
      const data = await apiClient.getShopInventoryHistory(shopId!) as { success: boolean; history: InventoryUpdate[]; message?: string };

      if (data.success) {
        setInventoryHistory(data.history || []);
      } else {
        throw new Error(data.message || 'Failed to fetch inventory history');
      }
    } catch (error) {
      toast.error(`Failed to load inventory history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [shopId]);

  const updateQuantity = async (updateData: QuantityUpdateData) => {
    setUpdating(updateData.productId);
    try {
      const data = await apiClient.updateShopInventory(shopId!, updateData) as { success: boolean; message?: string };
      if (data.success) {
        toast.success('Inventory updated successfully');
        await Promise.all([fetchInventory(), fetchInventoryHistory()]);
      } else {
        throw new Error(data.message || 'Failed to update inventory');
      }
    } catch (error) {
      toast.error(`Failed to update inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleQuickAdjustment = (item: ShopInventoryItem, change: number) => {
    const newQuantity = Math.max(0, item.quantity + change);
    const changeType = change > 0 ? 'increase' : 'decrease';
    updateQuantity({
      productId: item.product._id,
      newQuantity,
      changeType,
      reason: `Quick ${changeType} by ${Math.abs(change)}`
    });
  };

  const handleBulkUpdate = () => {
    if (!bulkUpdateModal.item) return;

    updateQuantity({
      productId: bulkUpdateModal.item.product._id,
      newQuantity: bulkUpdateForm.quantity,
      changeType: bulkUpdateForm.changeType,
      reason: bulkUpdateForm.reason
    });

    setBulkUpdateModal({ isOpen: false, item: null });
    setBulkUpdateForm({ quantity: 0, changeType: 'adjustment', reason: '' });
  };

  const openBulkUpdateModal = (item: ShopInventoryItem) => {
    setBulkUpdateForm({
      quantity: item.quantity,
      changeType: 'adjustment',
      reason: ''
    });
    setBulkUpdateModal({ isOpen: true, item });
  };

  const getStockStatus = (item: ShopInventoryItem) => {
    if (item.quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (item.quantity <= item.minStockLevel) return { label: 'Low Stock', variant: 'secondary' as const };
    if (item.quantity >= item.maxStockLevel) return { label: 'Overstocked', variant: 'outline' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp size={16} className="text-green-600" />;
      case 'decrease': return <TrendingDown size={16} className="text-red-600" />;
      default: return <Package size={16} className="text-blue-600" />;
    }
  };

  // Fetch shop details and inventory
  useEffect(() => {
    if (!shopId) {
      navigate('/admin/shops');
      return;
    }

    Promise.all([
      fetchShopDetails(),
      fetchInventory(),
      fetchInventoryHistory()
    ]).finally(() => setLoading(false));
  }, [shopId, navigate, fetchShopDetails, fetchInventory, fetchInventoryHistory]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!shop) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/shops')}>
            <ArrowLeft size={16} />
            Back to Shops
          </Button>
        </div>
        <div className="mt-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500" />
          <h2 className="text-xl font-semibold mt-4">Shop Not Found</h2>
          <p className="text-muted-foreground">The shop you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/shops')}>
            <ArrowLeft size={16} />
            Back to Shops
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">
              {shop.name} • {shop.address}
              {shop.manager && ` • Manager: ${shop.manager.username}`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package size={16} />
            Current Inventory
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} />
            Update History
          </TabsTrigger>
        </TabsList>

        {/* Current Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                Manage stock levels for all products in this shop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory.length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-4">No inventory items found</p>
                  </div>
                ) : (
                  inventory.map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <Card key={item._id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{item.product.name}</h3>
                              <Badge variant={stockStatus.variant}>
                                {stockStatus.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.product.brand} • {item.product.type} • ₹{item.product.unitPrice}/unit
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Min: {item.minStockLevel} • Max: {item.maxStockLevel}
                              {item.lastRestocked && ` • Last restocked: ${new Date(item.lastRestocked).toLocaleDateString()}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{item.quantity}</p>
                              <p className="text-xs text-muted-foreground">units</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAdjustment(item, -1)}
                                disabled={updating === item.product._id || item.quantity === 0}
                              >
                                <Minus size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAdjustment(item, 1)}
                                disabled={updating === item.product._id}
                              >
                                <Plus size={16} />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => openBulkUpdateModal(item)}
                                disabled={updating === item.product._id}
                              >
                                <Save size={16} className="mr-2" />
                                Update
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Update History</CardTitle>
              <CardDescription>
                Track all inventory changes for this shop
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History size={48} className="mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-4">No update history found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryHistory.map((update) => (
                      <TableRow key={update._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{update.product.name}</p>
                            <p className="text-sm text-muted-foreground">{update.product.brand}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getChangeIcon(update.changeType)}
                            <span>
                              {update.previousQuantity} → {update.newQuantity}
                            </span>
                            <span className={`text-sm ${update.changeAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({update.changeAmount > 0 ? '+' : ''}{update.changeAmount})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {update.changeType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {update.reason || '-'}
                        </TableCell>
                        <TableCell>{update.updatedBy.username}</TableCell>
                        <TableCell>
                          {new Date(update.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bulk Update Modal */}
      <Dialog open={bulkUpdateModal.isOpen} onOpenChange={(open) => {
        if (!open) setBulkUpdateModal({ isOpen: false, item: null });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
            <DialogDescription>
              Update the quantity for {bulkUpdateModal.item?.product.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">New Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={bulkUpdateForm.quantity}
                onChange={(e) => setBulkUpdateForm(prev => ({
                  ...prev,
                  quantity: parseInt(e.target.value) || 0
                }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Current: {bulkUpdateModal.item?.quantity} units
              </p>
            </div>

            <div>
              <Label htmlFor="changeType">Change Type</Label>
              <select
                id="changeType"
                className="w-full p-2 border border-input rounded-md"
                value={bulkUpdateForm.changeType}
                onChange={(e) => setBulkUpdateForm(prev => ({
                  ...prev,
                  changeType: e.target.value as 'increase' | 'decrease' | 'restock' | 'adjustment'
                }))}
              >
                <option value="adjustment">Adjustment</option>
                <option value="restock">Restock</option>
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
              </select>
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this change..."
                value={bulkUpdateForm.reason}
                onChange={(e) => setBulkUpdateForm(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpdateModal({ isOpen: false, item: null })}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>
              Update Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}