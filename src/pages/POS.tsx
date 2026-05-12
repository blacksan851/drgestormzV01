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
  const [paymentMethod, setPaymentMethod] = useState("Cash");

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
      
      for (const item of cart) {
        if (item.id) {
          const newStock = Math.max(0, item.stock - item.qty);
          await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
        }
      }
      
      await refreshProducts();
      
      alert(`Pagamento via ${paymentMethod} de ${total.toFixed(2)} MT concluído com sucesso!\nNº Pedido: ${txId}`);
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
    <Layout title="">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] -m-8 relative">
        
        {/* Main POS Area - Product Grid */}
        <div className="flex-1 flex flex-col bg-[#F4F9F4] p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#0B2E1E]">Ponto de Venda</h2>
            <p className="text-sm text-gray-500">Selecione os produtos para o carrinho</p>
          </div>

          <div className="relative w-full mb-6">
             <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
             <input 
               value={searchQuery} 
               onChange={e => setSearchQuery(e.target.value)} 
               className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#34D399] focus:ring-1 focus:ring-[#34D399] transition-all shadow-sm text-[#0B2E1E]" 
               placeholder="Buscar produtos, código de barras..." 
               type="text"
              />
          </div>
          
          {/* Categories Carousel */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-6">
             {categories.map((category, i) => (
               <button 
                 key={i} 
                 onClick={() => setActiveCategory(category)}
                 className={`flex-shrink-0 px-6 py-2.5 rounded-full font-medium text-sm transition-colors ${activeCategory === category ? 'bg-[#0B2E1E] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
               >
                 {category}
               </button>
             ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)} 
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#34D399]/50 transition-all cursor-pointer group flex flex-col h-64"
              >
                <div className={`h-36 w-full ${product.img ? '' : 'bg-gray-50'} flex items-center justify-center relative overflow-hidden border-b border-gray-50`}>
                  {product.img ? (
                      <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                      <span className={`material-symbols-outlined text-[40px] text-gray-300`}>inventory_2</span>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full">
                      {product.stock} em estoque
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full">
                      Esgotado
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B2E1E] line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="text-[11px] text-gray-400 mt-1">SKU: {product.sku}</p>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="font-bold text-[#34D399]">{product.price.toFixed(2)} MT</span>
                    <button className="w-8 h-8 bg-[#E6F4EA] text-[#0B2E1E] rounded-full flex items-center justify-center group-hover:bg-[#34D399] group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Order Sidebar */}
        <div className="w-full lg:w-[420px] flex-shrink-0 bg-white border-l border-gray-200 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] flex flex-col h-full z-20">
          {/* Cart Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-xl font-bold text-[#0B2E1E]">Resumo do Pedido</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedClient ? selectedClient.name : 'Cliente Final'}</p>
            </div>
            <button onClick={() => setIsClientModalOpen(true)} className="w-10 h-10 rounded-full bg-[#F4F9F4] text-[#0B2E1E] flex items-center justify-center hover:bg-[#E6F4EA] transition-colors">
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>

          {/* Client Select Modal */}
          {isClientModalOpen && (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                   <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#F4F9F4]">
                      <h3 className="text-lg font-bold text-[#0B2E1E]">Selecionar Cliente</h3>
                      <button onClick={() => setIsClientModalOpen(false)} className="text-gray-500 hover:bg-white p-1.5 rounded-full transition-colors"><span className="material-symbols-outlined text-[20px]">close</span></button>
                   </div>
                   <div className="p-4 max-h-[60vh] overflow-y-auto">
                      <button onClick={() => { setSelectedClient(null); setIsClientModalOpen(false); }} className="w-full text-left p-4 hover:bg-[#F4F9F4] rounded-xl mb-2 flex items-center gap-3 border border-gray-100 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <span className="material-symbols-outlined text-[20px]">person_off</span>
                        </div>
                        <div>
                          <div className="font-bold text-[#0B2E1E]">Cliente Final</div>
                          <div className="text-xs text-gray-500">Sem NUIT associado</div>
                        </div>
                      </button>
                      {clients.map(c => (
                        <button key={c.id} onClick={() => { setSelectedClient(c); setIsClientModalOpen(false); }} className="w-full text-left p-4 hover:bg-[#F4F9F4] rounded-xl mb-2 flex items-center gap-3 border border-gray-100 transition-colors">
                           <div className="w-10 h-10 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#0B2E1E]">
                             <span className="material-symbols-outlined text-[20px]">person</span>
                           </div>
                           <div>
                             <div className="font-bold text-[#0B2E1E]">{c.name}</div>
                             <div className="text-xs text-gray-500">NUIT: {c.document_id || 'N/A'}</div>
                           </div>
                        </button>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-gray-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[48px]">shopping_bag</span>
                </div>
                <p className="font-medium text-gray-500">O carrinho está vazio</p>
                <p className="text-sm mt-1">Adicione produtos à esquerda</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm group">
                  <div className="flex-1 pr-2">
                     <h4 className="text-sm font-bold text-[#0B2E1E] leading-tight mb-1">{item.name}</h4>
                     <p className="text-xs text-gray-500">{(item.price).toFixed(2)} MT / un</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                     <span className="text-sm font-bold text-[#34D399]">{(item.price * item.qty).toFixed(2)}</span>
                     <div className="flex items-center bg-[#F4F9F4] rounded-lg border border-[#E6F4EA]">
                       <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#0B2E1E] transition-colors">
                         <span className="material-symbols-outlined text-[16px]">remove</span>
                       </button>
                       <span className="w-6 text-center text-sm font-bold text-[#0B2E1E]">{item.qty}</span>
                       <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#0B2E1E] transition-colors">
                         <span className="material-symbols-outlined text-[16px]">add</span>
                       </button>
                     </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Totals & Actions */}
          <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} itens)</span>
                <span className="font-medium text-gray-700">{subtotal.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>IVA (16%)</span>
                <span className="font-medium text-gray-700">{tax.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between items-end mt-2 pt-4 border-t border-dashed border-gray-200">
                <span className="text-[#0B2E1E] font-medium">Total</span>
                <span className="text-2xl font-bold text-[#0B2E1E]">{total.toFixed(2)} MT</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Método de Pagamento</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'Cash', icon: 'payments', label: 'Cash' },
                  { id: 'M-Pesa', icon: 'phone_iphone', label: 'M-Pesa' },
                  { id: 'E-Mola', icon: 'smartphone', label: 'E-Mola' },
                  { id: 'Card', icon: 'credit_card', label: 'Cartão' },
                ].map(method => (
                  <button 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all ${
                      paymentMethod === method.id 
                        ? 'bg-[#E6F4EA] border-2 border-[#34D399] text-[#0B2E1E]' 
                        : 'bg-[#F4F9F4] border-2 border-transparent text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={paymentMethod === method.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{method.icon}</span>
                    <span className="text-[11px] font-bold">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full py-4 mt-2 bg-[#0B2E1E] text-white disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 rounded-xl text-lg font-bold hover:bg-[#1A5D3F] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(11,46,30,0.2)] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">check_circle</span>
              {isProcessing ? 'A processar...' : 'Cobrar Pagamento'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
