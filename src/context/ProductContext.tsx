import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const initialProducts: Product[] = [
  { id: '1', name: "Relógio Chrono Pro", sku: "ELC-SC-PRO", category: "Eletrónica", price: 12500, stock: 42, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuChqaM4ddctWpC7_IWFiNLMc_u6Kfl6kuvbhiW7ru_z6dkLRZoVjTYoAA2djKr7VyA-ennpeixLey02PddBwY7OL1nhN3KTL5v18Iizbr5v8SgLCGgt-BRNLeS_wvOd8dS7_j6e2wjqyGXJrzCGnJccXic5DbQ-3kIx-fZFfgjjQpn0cJnJtLXmqn65sNW59hf3br5xW8pMefZuKKt8EU0_iNqjnv7M-m4No0IuLBOc3_4V7Wy6OH8tClbQHhUWHTbVYH_EKJwLtNDG" },
  { id: '2', name: "Auscultadores Sonic Wave", sku: "AUD-SWH-01", category: "Áudio", price: 8990, stock: 15, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOSq-IeXtURD1n6uCBNkeLMCBRNemI9t7XODVffineu_JX6TaLU22BdUBubSnqYNyBxiRXeoI6vYzy02Pkkrrm9wCBWp6F2vn0nXThtkp6mnafrLaWVKBYqRXcxX5b7vsevZmOuNgDNblWVHFcEINM3l6Fnfk3vXZ_HOL-t2PuZiqBTkIhO7q2J2iEuLALiJXUmQ8fLPUUrjbcHorkXAkm4OVr9d0D94__luXWoNhxbgstqX450V_7CMWuqAFVr56P0yKagotxcWy-" },
  { id: '3', name: "Ténis Eco-Runner", sku: "APP-ERE-RD", category: "Vestuário", price: 4200, stock: 56, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxqhT5yIwJR4lonVeFVE8r3Q1rqzaj_VE6yBIIVlwLZ3RmxgKRKLLtaJkYcxLXzs1Po3fywENV7FKt83Tg1UCTxBIVtd30MoDmt3bGeiiQG9HfDp6ED-HQcdui3K0_596pVrlElZbN3XPVsdufDWwhobww38TUzxYQRYghRh4jS3BYPi4DZBaKsOE_byaizDR6ur5dO7qmuS6wZ6S040WRkvU1DzG_hVomohekzBTDPCJPAXoSaaKJhYsBJqbTarj6LSvwZ_4VckdZ" },
  { id: '4', name: "Câmara Neo-Reflex", sku: "PHO-NRC-01", category: "Fotografia", price: 35000, stock: 8, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCY60eGKWlIhB8bpoNOLo6w53OewtcVLVHlBJVMMwRVdJT5lhZbbxOdxCNbihDOzSGiR1gB_e-41v_QOlJEzbQ5LQIAqkSGecawJBDVRt1gYU493YLiqDqEgkqoHtsYsYcuAAvMSbVxfKI9jBJeXFONuUMZ-BVV5cypMOzJvLbggPlqcZeKRdscTp5df1AXBqLL1ra0wFwY1dOa-yEsQJ9xB_ai1yjmcBIYsv3Jvki-EOrSf4hMz7jk7z6t_cWrWQXsqs3aubJer9yE" },
  { id: '5', name: "Máquina de Café Barista", sku: "HOM-BMP-02", category: "Casa", price: 18750, stock: 3, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKONECnlqswH_QjhOl8R5QfTTdytKbDZNlzNzBRujrf6SNBssmtjuHhKkueDrLIncyZS1HhezauqAZQplhy_Ne0rxyeypEdDPmk4bF3aLxwtOkxNHparBFnHUmJsjUx3qzLuqfU_u3-EoAPZ3E-ix4n_jMk89pHdeVmXSsPC-A4tU3_9KLk5h6-TagKG3WImsUyAaac0p5Dsfnu-l-HPFzy5f18-VShlttl56pIW2LpanjRNCb8HmTaOi7AhjOtGaRLsHbCm58Oy9n" },
  { id: '6', name: "Água Mineral 500ml", sku: "BEV-MW-500", category: "Bebidas", price: 35, stock: 124, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCqR6GzQ-7gntI8PjL9S3l4EwS279yOq1mE7J08tDftr1S3-pM7d9Q9A7sW7TtbK7q1P3E0Qv37Vq40E7pM4C-B9T2-y3rK8r9iU3dJ2mP_s7jA6w0-g4xJc1w8p9n5T93K9z40p9Q_jV2H2n97jR3y8T2H76p9T3T0C0g9_A5r930xQ8" }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);

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
      } else {
        // If empty, insert initial products
        const productsToInsert = initialProducts.map(p => {
          const { id, ...rest } = p;
          return rest;
        });
        const { data: newProducts, error: insertError } = await supabase
          .from('products')
          .insert(productsToInsert)
          .select();
          
        if (insertError) throw insertError;
        if (newProducts) {
          setProducts(newProducts);
        }
      }
    } catch (error) {
      console.error('Error fetching/inserting products from Supabase:', error);
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
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, updateProduct, refreshProducts: fetchProducts, loading }}>
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
