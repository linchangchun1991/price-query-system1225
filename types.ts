export interface Product {
  id: string;
  type: string;
  name: string;
  industry: string;
  role: string;
  location: string;
  format: string; // e.g., "Remote", "On-site"
  duration: string;
  price_standard: number;
  price_floor: number;
  delivery_dept: string;
}

export type UserRole = 'admin' | 'viewer';

export interface User {
  email: string;
  role: UserRole;
}