export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  category: string;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 79.99,
    image: '🎧',
    rating: 4.5,
    reviews: 328,
    description: 'Premium wireless headphones with active noise cancellation',
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 199.99,
    image: '⌚',
    rating: 4.7,
    reviews: 512,
    description: 'Feature-rich smartwatch with health tracking',
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'USB-C Cable',
    price: 12.99,
    image: '🔌',
    rating: 4.3,
    reviews: 1240,
    description: 'Durable fast-charging USB-C cable',
    category: 'Accessories',
  },
  {
    id: '4',
    name: 'Phone Case',
    price: 24.99,
    image: '📱',
    rating: 4.4,
    reviews: 856,
    description: 'Protective phone case with grip design',
    category: 'Accessories',
  },
  {
    id: '5',
    name: 'Portable Charger',
    price: 39.99,
    image: '🔋',
    rating: 4.6,
    reviews: 652,
    description: '20000mAh portable power bank',
    category: 'Electronics',
  },
  {
    id: '6',
    name: 'Screen Protector',
    price: 9.99,
    image: '🛡️',
    rating: 4.2,
    reviews: 432,
    description: 'Tempered glass screen protector',
    category: 'Accessories',
  },
];
