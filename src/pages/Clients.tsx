import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { supabase } from "../lib/supabase";

export function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', document_id: '', address: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('clients').update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          document_id: formData.document_id,
          address: formData.address,
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('clients').insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          document_id: formData.document_id,
          address: formData.address,
          status: 'Ativo'
        }]);
        if (error) throw error;
      }
      
      setFormData({ name: '', email: '', phone: '', document_id: '', address: '' });
      setEditingId(null);
      setIsAddModalOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Error adding/updating client:', error);
      alert('Erro ao guardar cliente');
    }
  };

  const handleEditClick = (client: any) => {
    setEditingId(client.id);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      document_id: client.document_id || '',
      address: client.address || ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', document_id: '', address: '' });
    setIsAddModalOpen(true);
  };

  const deleteClient = async (id: string) => {
    if (!confirm('Deseja eliminar este cliente?')) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Erro ao eliminar cliente');
    }
  };

  return (
    <Layout title="Clientes e Entidades">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input type="text" placeholder="Pesquisar por Nome, NUIT ou Telefone..." className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Adicionar Cliente
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden flex flex-col flex-1 mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead className="bg-surface-container/50 border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Documento (NUIT)</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    Carregando clientes...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    Nenhum cliente registado.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4 font-bold text-on-surface">{c.name}</td>
                    <td className="px-6 py-4 font-mono text-[12px] text-on-surface-variant">{c.document_id || '-'}</td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      <div className="text-sm">{c.phone || '-'}</div>
                      <div className="text-[12px] opacity-80">{c.email || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${c.status === 'Ativo' ? 'bg-primary/10 text-primary' : 'bg-outline-variant/20 text-on-surface-variant'}`}>
                        {c.status || 'Ativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(c)} className="p-1 hover:bg-surface-container rounded text-primary" title="Edit"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <button onClick={() => deleteClient(c.id)} className="p-1 hover:bg-error/10 rounded text-error" title="Delete"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-title-lg text-primary font-bold">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-on-surface-variant hover:bg-surface-variant p-1 rounded-full"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Nome Completo / Entidade</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-sm text-on-surface-variant">Documento (NUIT/BI)</label>
                  <input type="text" value={formData.document_id} onChange={e => setFormData({...formData, document_id: e.target.value})} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-on-surface-variant">Telefone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Email (Opcional)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Endereço</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary outline-none" />
              </div>

              <div className="pt-4 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-outline text-on-surface rounded-lg hover:bg-surface-container-low">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 font-bold shadow-sm">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
