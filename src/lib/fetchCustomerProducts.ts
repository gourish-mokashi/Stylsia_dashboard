import { supabase } from './supabase';
// import type { Product } from '../types/api';

export async function fetchCustomerProducts(query: string = ""): Promise<any[]> {
  let supa = supabase
    .from('products')
    .select(`id, name, price, description, brand_id, images:product_images(url,is_primary), status, availability, category, metadata, created_at, updated_at, brand:brands!inner(name)`) // join brand name
    .eq('status', 'approved')
    .eq('availability', 'in_stock')
    .order('created_at', { ascending: false });

  if (query) {
    supa = supa.ilike('name', `%${query}%`);
  }

  const { data, error } = await supa;
  if (error) throw new Error(error.message);
  return (
    data?.map((p: any) => ({
      ...p,
      image: p.images?.find((img: any) => img.is_primary)?.url || p.images?.[0]?.url || '',
      brand: p.brand?.name || '',
      specifications: p.metadata?.specifications || '',
      stock: p.availability === 'in_stock' ? 1 : 0,
    })) || []
  );
}

export async function fetchProductById(id: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`id, name, price, description, brand_id, images:product_images(url,is_primary), status, availability, category, metadata, created_at, updated_at, brand:brands!inner(name)`)
    .eq('id', id)
    .eq('status', 'approved')
    .single();

  if (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    image: data.images?.find((img: any) => img.is_primary)?.url || data.images?.[0]?.url || '',
    brand: Array.isArray(data.brand)
      ? ((data.brand[0] as { name?: string })?.name || '')
      : ((data.brand as { name?: string })?.name || ''),
    specifications: data.metadata?.specifications || '',
    stock: data.availability === 'in_stock' ? 1 : 0,
  };
}
