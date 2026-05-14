import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  img: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  refreshProducts: () => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  loading: boolean;
  isUsingMockData: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const mockProducts: Product[] = [
    { id: uuidv4(), name: 'Produto Mock 1', sku: 'MOCK-001', category: 'Electrônicos', price: 1500, stock: 10, img: '' },
    { id: uuidv4(), name: 'Produto Mock 2', sku: 'MOCK-002', category: 'Acessórios', price: 350, stock: 25, img: '' },
    { id: uuidv4(), name: 'Produto Mock 3', sku: 'MOCK-003', category: 'Móveis', price: 4200, stock: 5, img: '' },
    { id: uuidv4(), name: 'Produto Mock 4', sku: 'MOCK-004', category: 'Vestuário', price: 800, stock: 50, img: '' },
    { id: uuidv4(), name: 'Produto Mock 5', sku: 'MOCK-005', category: 'Alimentação', price: 120, stock: 100, img: '' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setProducts(data);
        setIsUsingMockData(false);
      } else {
         // Se não retornou erro, mas também não tem dados, podemos opcionalmente usar mocks, 
         // mas o normal de uma db vazia é array vazio. Vamos forçar erro se quisermos mockar qnd vazio,
         // ou apenas manter vazio. O usuário pediu fallback se falhar.
         setProducts([]);
         setIsUsingMockData(false);
      }
    } catch (error) {
      console.error('Error fetching/inserting products from Supabase:', error);
      console.warn('Usando dados de demonstração (Mock Data) para Produtos.');
      setProducts(mockProducts);
      setIsUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();

      if (error) throw error;

      if (data) {
        setProducts(prev => [data[0], ...prev]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(prev => prev.map(p => p.id === id ? data[0] : p));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, updateProduct, refreshProducts: fetchProducts, loading, isUsingMockData }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
