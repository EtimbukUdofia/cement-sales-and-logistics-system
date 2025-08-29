
import { ProductCard } from "@/components/ProductCard"
import { ProductHeader } from "@/components/ProductHeader"
import { AddProductCard } from "@/components/AddProductCard"
import { products } from "@/data/products"

const ProductsPage = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-6 py-6">

          {/* Header */}
          <ProductHeader
            title="Total Products"
            subtitle="Products available in stock"
          />

          {/* Products Grid */}
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                />
              ))}

              {/* Add Product Card */}
              <AddProductCard />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProductsPage