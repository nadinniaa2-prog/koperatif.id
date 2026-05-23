export type UserRole = 'ADMIN' | 'ANGGOTA';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  nis?: string;
  balance: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'SIMPANAN' | 'PINJAMAN' | 'BELANJA';
  amount: number;
  description: string;
  created_at: string;
}
