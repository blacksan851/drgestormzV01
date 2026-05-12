import { Layout } from "../components/Layout";
import { useProducts, Product } from "../context/ProductContext";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface CartItem extends Product {
  qty: number;
}

export function POS() {
  const { products, refreshProducts } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  useEffect(() => {
    supabase.from('clients').select('*').then(({ data }) => {
      if (data) setClients(data);
    });
  }, []);

  const categories = ["Todos", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.16; // 16% IVA
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    try {
      const txId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const { error } = await supabase.from('sales').insert([{
        tx_id: txId,
        client_name: selectedClient ? selectedClient.name : 'Cliente Final',
        amount: total,
        status: 'Pago',
        items_summary: cart.map(i => `${i.qty}x ${i.name}`).join(', ')
      }]);

      if (error) throw error;
      
      // Update stock for each product
      for (const item of cart) {
        if (item.id) {
          const newStock = Math.max(0, item.stock - item.qty);
          await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
        }
      }
      
      await refreshProducts();
      
      alert(`Pagamento de ${total.toFixed(2)} MT concluído com sucesso!\nNº Pedido: ${txId}`);
      setCart([]);
      setSelectedClient(null);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar o pagamento.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout title="" fullWidth>
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden w-full lg:max-w-none">
        
        {/* Main POS Area - Product Grid */}
        <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
          
          <div className="relative w-full px-4 pt-4 md:pt-0">
             <span className="material-symbols-outlined absolute left-8 top-1/2 md:translate-y-1 text-outline">search</span>
             <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all font-body-md text-body-md shadow-sm" placeholder="Buscar produtos, códigos de barra..." type="text"/>
          </div>
          
          {/* Categories Carousel */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-4 mt-4">
             {categories.map((category, i) => (
               <button 
                 key={i} 
                 onClick={() => setActiveCategory(category)}
                 className={`flex-shrink-0 px-6 py-2 rounded-full font-label-md text-label-md transition-colors ${activeCategory === category ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low'}`}
               >
                 {category}
               </button>
             ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} onClick={() => addToCart(product)} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(26,43,75,0.05)] hover:shadow-[0px_12px_24px_rgba(26,43,75,0.1)] transition-all cursor-pointer group flex flex-col">
                  <div className={`h-32 w-full ${product.img ? '' : 'bg-surface-container-low'} flex items-center justify-center relative overflow-hidden`}>
                    {product.img ? (
                       <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                       <span className={`material-symbols-outlined text-[40px] text-outline-variant`}>devices</span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-label-md text-label-md font-semibold text-on-surface line-clamp-2">{product.name}</h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">SKU: {product.sku}</p>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-label-md text-label-md font-bold text-primary">{product.price.toFixed(2)} MT</span>
                      <button className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Order Sidebar */}
        <div className="w-full md:w-[360px] lg:w-[400px] flex-shrink-0 bg-surface-container-lowest border border-outline-variant rounded-none md:rounded-l-2xl shadow-[0px_12px_24px_rgba(26,43,75,0.05)] flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-32px)] z-20 overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 border-b border-surface-variant bg-surface-container-low flex justify-between items-center">
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-primary">Nova Venda</h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{selectedClient ? selectedClient.name : 'Cliente Final (Consumidor)'}</p>
            </div>
            <button onClick={() => setIsClientModalOpen(true)} className="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>

          {/* Client Select Modal */}
          {isClientModalOpen && (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-surface rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                   <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
                      <h3 className="font-headline-md text-primary font-bold">Selecionar Cliente</h3>
                      <button onClick={() => setIsClientModalOpen(false)} className="text-on-surface-variant hover:bg-surface-variant p-1 rounded-full"><span className="material-symbols-outlined">close</span></button>
                   </div>
                   <div className="p-2 max-h-[60vh] overflow-y-auto">
                      <button onClick={() => { setSelectedClient(null); setIsClientModalOpen(false); }} className="w-full text-left p-3 hover:bg-surface-container rounded-lg mb-1 flex items-center gap-3 border border-outline-variant/30">
                        <span className="material-symbols-outlined text-on-surface-variant">person_off</span>
                        Cliente Final (Sem NUIT)
                      </button>
                      {clients.map(c => (
                        <button key={c.id} onClick={() => { setSelectedClient(c); setIsClientModalOpen(false); }} className="w-full text-left p-3 hover:bg-surface-container rounded-lg mb-1 border border-outline-variant/30">
                           <div className="font-bold text-on-surface">{c.name}</div>
                           <div className="text-xs text-on-surface-variant">NUIT: {c.document_id || 'N/A'}</div>
                        </button>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-[48px] mb-2">shopping_bag</span>
                <p>Nenhum item adicionado</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-surface p-3 rounded-lg border border-surface-variant group">
                  <div className="flex-1">
                     <h4 className="font-label-md text-label-md font-semibold text-on-surface leading-tight">{item.name}</h4>
                     <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{(item.price).toFixed(2)} MT / un</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center border border-outline-variant rounded-md bg-surface-container-lowest">
                       <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                         <span className="material-symbols-outlined text-[18px]">remove</span>
                       </button>
                       <span className="w-6 text-center font-label-md text-label-md font-bold">{item.qty}</span>
                       <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                         <span className="material-symbols-outlined text-[18px]">add</span>
                       </button>
                     </div>
                     <div className="flex flex-col items-end">
                       <button onClick={() => removeFromCart(item.id)} className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100 mb-1">
                         <span className="material-symbols-outlined text-[16px]">delete</span>
                       </button>
                       <span className="font-body-md text-body-md font-bold text-primary text-right min-w-[70px]">{(item.price * item.qty).toFixed(2)}</span>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals & Actions */}
          <div className="p-4 bg-surface-container-low border-t border-surface-variant flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-on-surface-variant font-label-md text-label-md">
                <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} itens)</span>
                <span>{subtotal.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between text-on-surface-variant font-label-md text-label-md">
                <span>IVA (16%)</span>
                <span>{tax.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between font-headline-md text-[20px] font-bold text-primary mt-2 pt-2 border-t border-outline-variant border-dashed">
                <span>Total</span>
                <span>{total.toFixed(2)} MT</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-2">
              <button className="flex flex-col items-center justify-center gap-1 p-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-secondary hover:bg-secondary/5 transition-all group">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">payments</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-secondary">Cash</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-1 p-2 border-2 border-secondary rounded-lg bg-secondary/10 transition-all group">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>phone_iphone</span>
                <span className="font-label-sm text-label-sm font-bold text-secondary">M-Pesa</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-1 p-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-secondary hover:bg-secondary/5 transition-all group">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">smartphone</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-secondary">E-Mola</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-1 p-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-secondary hover:bg-secondary/5 transition-all group">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">credit_card</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-secondary">Cartão</span>
              </button>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full py-4 bg-primary text-on-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-headline-md text-[18px] font-bold hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              {isProcessing ? 'A processar...' : 'Finalizar Venda'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

