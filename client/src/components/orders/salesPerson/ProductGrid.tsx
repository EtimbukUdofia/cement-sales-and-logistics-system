import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { useShop } from "@/hooks/useShop"
import dangote3x from '@/assets/products/dangote-3x-cement.png';
import dangoteFalcon from '@/assets/products/dangote-falcon-cement.png';
import bua from '@/assets/products/bua-cement.jpg';

interface Product {
  id: string
  name: string
  variant: string
  brand: string
  size: number
  imageUrl: string
  price: number
  availableStock: number
}

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const items = useCartStore(state => state.items);

  // Check if product is already in cart and get its quantity
  const cartItem = items.find(item => item.id === product.id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;
  const canAddMore = cartQuantity < product.availableStock;

  const handleAddToCart = () => {
    if (canAddMore) {
      addItem({
        id: product.id,
        name: product.name,
        variant: product.variant,
        brand: product.brand,
        size: product.size,
        imageUrl: product.imageUrl,
        price: product.price,
        availableStock: product.availableStock
      });

      toast.success(`${product.name} (${product.variant}) added to cart!`);
    } else {
      toast.error("Cannot add more items. Stock limit reached.");
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              {/* product image */}
              <img src={product.imageUrl} alt={product.name} className="w-8 h-8 object-stretch" />
              {/* <span className="text-white font-bold text-xs">{product.variant}</span> */}
            </div>
            <div>
              <h3 className="font-medium text-sm">{ product.brand} {product.name}</h3>
              <p className="text-xs text-muted-foreground">{product.size}kg size</p>
            </div>
          </div>
          {product.variant && (
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
              {product.variant}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Price</span>
            <span className="font-medium">₦{product.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">In Stock</span>
            <span className="font-medium">{product.availableStock} bags</span>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          className="w-full mt-3 h-8 text-xs"
          size="sm"
          disabled={!canAddMore}
        >
          <Plus size={12} className="mr-1" />
          {isInCart ? `Add More (${cartQuantity} in cart)` : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  )
}

interface ProductGridProps {
  searchTerm?: string;
  selectedBrand?: string;
  refreshTrigger?: number;
}

export function ProductGrid({ searchTerm = '', selectedBrand = 'all', refreshTrigger = 0 }: ProductGridProps) {
  const { currentShop } = useShop();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is admin, they don't have a shop but can still view products
    if (!currentShop && user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        // For admin users, use a fallback shop or show sample data
        if (user?.role === 'admin' && !currentShop) {
          // Fallback to sample data for admin users without a shop
          if (isMounted) {
            setProducts([
              {
                id: '1',
                name: 'Dangote Cement',
                variant: '3X',
                brand: 'dangote',
                size: 50,
                imageUrl: dangote3x,
                price: 5000,
                availableStock: 100
              },
              {
                id: '2',
                name: 'Dangote Cement',
                variant: 'Falcon',
                brand: 'dangote',
                size: 50,
                imageUrl: dangoteFalcon,
                price: 5200,
                availableStock: 150
              },
              {
                id: '3',
                name: 'BUA Cement',
                variant: 'XL',
                brand: 'bua',
                size: 50,
                imageUrl: bua,
                price: 4800,
                availableStock: 75
              }
            ]);
          }
          return;
        }

        if (!currentShop) {
          throw new Error('No shop available');
        }

        const response = await apiClient.getProductsWithInventory(currentShop._id, {
          signal: abortController.signal
        });

        if (abortController.signal.aborted) {
          return;
        }

        if (response.success) {
          // Ensure response.products is an array of products before updating state
          if (isMounted) {
            setProducts(Array.isArray(response.products) ? (response.products as Product[]) : []);
          }
        } else {
          throw new Error(response.message || 'Failed to fetch products');
        }
      } catch (err) {
        if (abortController.signal.aborted) {
          return;
        }

        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch products');
          // Fallback to sample data for development
          setProducts([
            {
              id: '1',
              name: 'Dangote Cement',
              variant: '3X',
              brand: 'dangote',
              size: 50,
              imageUrl: dangote3x,
              price: 5000,
              availableStock: 100
            },
            {
              id: '2',
              name: 'Dangote Cement',
              variant: 'Falcon',
              brand: 'dangote',
              size: 50,
              imageUrl: dangoteFalcon,
              price: 5200,
              availableStock: 150
            },
            {
              id: '3',
              name: 'BUA Cement',
              variant: 'XL',
              brand: 'bua',
              size: 50,
              imageUrl: bua,
              price: 4800,
              availableStock: 75
            }
          ]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [currentShop, user?.role, refreshTrigger]);  // Add refreshTrigger to dependencies
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.variant.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBrand = selectedBrand === 'all' ||
      product.name.toLowerCase().includes(selectedBrand.toLowerCase());

    return matchesSearch && matchesBrand;
  });

  if (!currentShop && user?.role !== 'admin') {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-muted-foreground mb-2">No shop assigned</p>
        <p className="text-muted-foreground text-sm">Contact your administrator to assign a shop</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-full mt-3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-red-500 mb-2">Error loading products</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <p className="text-muted-foreground text-sm mt-2">Using sample data for now</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No products found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
