export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  memberSince: string;
  orders: number;
  totalSpent: number;
}

export const MOCK_USER: User = {
  id: 'user_123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: '👤',
  memberSince: 'January 2023',
  orders: 12,
  totalSpent: 459.87,
};
