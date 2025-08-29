import dangote3x from '../assets/products/dangote-3x-cement.png';
import dangoteSupaset from '../assets/products/dangote-falcon-cement.png';
import buaCement from '../assets/products/bua-cement.jpg';
import lafargeElephant from '../assets/products/lafarge-elephant-cement.png';

export interface Product {
  id: string
  name: string
  image: string
  size: string
  price: number
  percentage?: number
  variant?: string
  backgroundColor?: string
}

export const products: Product[] = [
  {
    id: "1",
    name: "Dangote Cement",
    image: dangote3x,
    size: "Extra Large size",
    price: 5000,
    percentage: 10,
    variant: "3X",
    backgroundColor: "bg-red-50"
  },
  {
    id: "2",
    name: "Dangote Cement",
    image: dangoteSupaset,
    size: "Extra Large size",
    price: 5000,
    percentage: 10,
    variant: "Supaset",
    backgroundColor: "bg-purple-50"
  },
  {
    id: "3",
    name: "Bua Cement",
    image: buaCement,
    size: "Extra Large size",
    price: 5000,
    percentage: 10,
    backgroundColor: "bg-orange-50"
  },
  {
    id: "4",
    name: "Lafarge Cement",
    image: lafargeElephant,
    size: "Extra Large size",
    price: 5000,
    percentage: 10,
    backgroundColor: "bg-green-50"
  }
]
