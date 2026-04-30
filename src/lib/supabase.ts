import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  price: number;
  condition: 'new' | 'used';
  image_url: string;
  status: 'available' | 'reserved' | 'sold';
  created_at: string;
};

export type Reservation = {
  id: string;
  product_id: string;
  customer_name: string;
  phone: string;
  whatsapp: boolean;
  message: string;
  created_at: string;
  products?: Product;
};
