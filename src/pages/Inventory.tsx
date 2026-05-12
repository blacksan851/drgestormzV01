import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { useProducts } from "../context/ProductContext";

export function Inventory() {
  const { products, addProduct, deleteProduct, updateProduct } = useProducts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', price: '', stock: '', img: ''
  });
  const [stockFilter, setStockFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateProduct(editingId, {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        img: formData.img
      });
    } else {
      await addProduct({
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        img: formData.img
      });
    }
    setFormData({ name: '', sku: '', category: '', price: '', stock: '', img: '' });
    setEditingId(null);
    setIsAddModalOpen(false);
  };

  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      img: product.img || ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', category: '', price: '', stock: '', img: '' });
    setIsAddModalOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStock = true;
    if (stockFilter === "in-stock") matchesStock = p.stock >= 10;
    else if (stockFilter === "low-stock") matchesStock = p.stock > 0 && p.stock < 10;
    else if (stockFilter === "out-of-stock") matchesStock = p.stock === 0;

    return matchesSearch && matchesStock;
  });
  return (
    <Layout title="Gestão de Stock">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Pesquisar por SKU, Nome ou Categoria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm" 
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">filter_list</span>
            <select 
              value={stockFilter} 
              onChange={e => setStockFilter(e.target.value)} 
              className="bg-transparent border-none outline-none font-label-md text-on-surface text-sm cursor-pointer"
            >
              <option value="all">Todos os Produtos</option>
              <option value="in-stock">Em Stock (≥10)</option>
              <option value="low-stock">Stock Baixo (1-9)</option>
              <option value="out-of-stock">Esgotado (0)</option>
            </select>
          </div>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Adicionar Produto
          </button>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden flex flex-col flex-1">
        
        {/* Table Controls */}
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
          <div className="flex gap-2">
            <select className="bg-surface border-none rounded text-label-sm font-label-sm text-on-surface-variant px-2 py-1 outline-none">
              <option>Ações em Massa</option>
              <option>Exportar Selecionados</option>
              <option>Eliminar Selecionados</option>
            </select>
          </div>
          <div className="flex items-center gap-4 text-label-sm text-on-surface-variant">
            <span>A mostrar {filteredProducts.length > 0 ? 1 : 0}-{filteredProducts.length} de {filteredProducts.length}</span>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-surface-variant rounded text-on-surface"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              <button className="p-1 hover:bg-surface-variant rounded text-on-surface"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead className="bg-surface-container/50 sticky top-0 z-10 backdrop-blur">
              <tr>
                <th className="px-6 py-3 w-12 pt-4"><input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4" /></th>
                <th className="px-6 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Preço</th>
                <th className="px-6 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider text-center">Stock</th>
                <th className="px-6 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredProducts.map((item) => {
                const isLowStock = item.stock < 10;
                const status = item.stock >= 10 ? "Em Stock" : item.stock > 0 ? "Stock Baixo" : "Esgotado";
                const type = item.stock >= 10 ? "primary" : "error";
                const icon = item.stock === 0 ? "error" : undefined;
                
                return (
                <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-surface-container overflow-hidden flex items-center justify-center border border-outline-variant/30">
                        {item.img ? (
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">inventory_2</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-on-surface font-bold group-hover:text-primary transition-colors">{item.name}</span>
                        {isLowStock && (
                          <span className="h-2 w-2 rounded-full bg-error" title="Stock Baixo (&lt;10 unidades)"></span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[12px] text-on-surface-variant">{item.sku}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-surface-container rounded text-[11px] font-bold text-on-surface">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-on-surface text-right">{item.price.toFixed(2)} MT</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${item.stock < 10 ? 'text-error' : 'text-on-surface'}`}>{item.stock}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 w-fit px-2 py-1 bg-${type}/10 text-${type} rounded-full text-[10px] uppercase font-bold tracking-wider`}>
                      {icon && <span className="material-symbols-outlined text-[12px]">{icon}</span>}
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} className="p-1 hover:bg-surface-container rounded text-primary" title="Edit"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteProduct(item.id); }} className="p-1 hover:bg-error/10 rounded text-error" title="Delete"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-title-lg text-primary font-bold">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-on-surface-variant hover:bg-surface-variant p-1 rounded-full"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-sm text-on-surface-variant">Nome do Produto</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-on-surface-variant">SKU</label>
                  <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-on-surface-variant">Categoria</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-on-surface-variant">Preço (MT)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-on-surface-variant">Quantidade em Stock</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none" />
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-outline-variant/30">
                <label className="font-label-sm text-on-surface-variant font-bold text-primary">Imagem do Produto</label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 items-center">
                    <label className="cursor-pointer px-4 py-2 bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant rounded-lg text-sm font-medium text-on-surface flex items-center gap-2 flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                      Carregar Foto
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, img: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                    <span className="text-xs text-on-surface-variant">ou URL:</span>
                    <input type="url" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} placeholder="https://..." className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none text-sm" />
                  </div>
                </div>
                {formData.img && (
                  <div className="mt-2 h-32 w-32 rounded-lg overflow-hidden border border-outline-variant/30 relative bg-surface-container text-center flex items-center justify-center">
                     <button type="button" onClick={() => setFormData({...formData, img: ''})} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 z-10">
                       <span className="material-symbols-outlined text-[14px]">close</span>
                     </button>
                     <img src={formData.img} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-[12px] text-error">Inválida</span>'; }} />
                  </div>
                )}
              </div>
              <div className="pt-4 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-outline text-on-surface rounded-lg hover:bg-surface-container-low">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 font-bold shadow-sm">Guardar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
