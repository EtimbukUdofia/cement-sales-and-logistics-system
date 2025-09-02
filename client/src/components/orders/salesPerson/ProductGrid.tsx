import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { toast } from "sonner"
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
              <h3 className="font-medium text-sm">{product.name}</h3>
              <p className="text-xs text-muted-foreground">{product.size}kg size</p>
            </div>
          </div>
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            {product.variant}
          </Badge>
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
}

export function ProductGrid({ searchTerm = '', selectedBrand = 'all' }: ProductGridProps) {
  const products: Product[] = [
    {
      id: '1',
      name: 'Dangote Cement',
      variant: '3X',
      brand: 'dangote',
      size: 50,
      imageUrl: dangote3x,
      price: 5000,
      availableStock: 2
    },
    {
      id: '2',
      name: 'Dangote Cement',
      variant: 'Supaset',
      brand: 'dangote',
      size: 50,
      imageUrl: dangoteFalcon,
      price: 5000,
      availableStock: 100
    },
    {
      id: '3',
      name: 'BUA Cement',
      variant: 'XL',
      brand: 'bua',
      size: 50,
      imageUrl: bua,
      price: 5000,
      availableStock: 100
    }
  ]

  // Filter products based on search term and selected brand
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.variant.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBrand = selectedBrand === 'all' ||
      product.name.toLowerCase().includes(selectedBrand.toLowerCase());

    return matchesSearch && matchesBrand;
  });

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
