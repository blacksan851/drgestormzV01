import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { supabase } from "../lib/supabase";

export function Billing() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (sale: any) => {
    alert(`A imprimir recibo para ${sale.tx_id}...\n\nO recibo será impresso na impressora padrão do sistema.`);
  };

  const changeStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('sales').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      fetchSales();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Erro ao atualizar estado.');
    }
  };

  return (
    <Layout title="Facturação e Recibos">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input type="text" placeholder="Pesquisar Fatura (#TX_ID)..." className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm" />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nova Fatura Manual
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead className="bg-surface-container/50 border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Tx / Fatura #</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Total (MT)</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider text-center">Estado</th>
                <th className="px-6 py-4 font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">Carregando facturação...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">Nenhuma venda registada até ao momento.</td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4 font-bold text-on-surface font-mono">{s.tx_id}</td>
                    <td className="px-6 py-4 text-on-surface">{s.client_name || 'Cliente Final'}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(s.created_at).toLocaleString('pt-MZ')}</td>
                    <td className="px-6 py-4 font-bold text-on-surface text-right">{Number(s.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${s.status === 'Pago' ? 'bg-primary/10 text-primary' : s.status === 'Pendente' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {s.status !== 'Pago' && (
                           <button onClick={() => changeStatus(s.id, 'Pago')} className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded transition-colors" title="Marcar como Pago">
                             Pagar
                           </button>
                        )}
                        <button onClick={() => handlePrint(s)} className="p-1 hover:bg-surface-container rounded text-primary" title="Imprimir Recibo">
                          <span className="material-symbols-outlined text-[18px]">print</span>
                        </button>
                        <button onClick={() => changeStatus(s.id, 'Anulado')} className="p-1 hover:bg-error/10 rounded text-error" title="Anular Fatura">
                          <span className="material-symbols-outlined text-[18px]">cancel</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
