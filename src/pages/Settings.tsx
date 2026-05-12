import { Layout } from "../components/Layout";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

function GeneralSettings() {
  const [settings, setSettings] = useState({
    id: '', legal_name: '', commercial_name: '', tax_id: '', phone: '', address: '', logo_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase.from('settings').select('*').limit(1).single();
        if (data) setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.from('settings').update({
        legal_name: settings.legal_name, commercial_name: settings.commercial_name,
        tax_id: settings.tax_id, phone: settings.phone, address: settings.address,
        logo_url: settings.logo_url, updated_at: new Date().toISOString()
      }).eq('id', settings.id || '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      alert("Definições atualizadas com sucesso!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Erro ao atualizar definições.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSettings({ ...settings, logo_url: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="flex-1 space-y-gutter">
      {/* Company Profile Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
         <div className="p-6 border-b border-outline-variant/30">
           <h4 className="font-title-md text-title-md text-on-surface">Perfil da Empresa</h4>
           <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Gerencie os detalhes da empresa usados em recibos e relatórios.</p>
         </div>
         <div className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              {settings.logo_url ? (
                <div className="h-24 w-24 rounded-xl border-2 border-outline-variant/50 flex flex-col items-center justify-center overflow-hidden bg-white">
                  <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-xl border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer bg-surface-container-low/50 relative">
                   <span className="material-symbols-outlined text-[32px] mb-1">add_photo_alternate</span>
                   <span className="text-[10px] font-bold uppercase tracking-wider">Logo</span>
                   <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              )}
              <div>
                <h5 className="font-label-md text-label-md text-on-surface mb-2">Logo da Empresa</h5>
                <p className="text-[12px] text-on-surface-variant max-w-sm mb-3">Tamanho recomendado: 512x512px. Usado no ecrã inicial e nos recibos impressos.</p>
                <div className="flex gap-2">
                  <label className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-label-sm font-bold hover:bg-primary/20 transition-colors cursor-pointer inline-block">
                    Carregar
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button onClick={() => setSettings({...settings, logo_url: ''})} className="px-3 py-1.5 border border-outline-variant text-on-surface rounded-lg text-label-sm hover:bg-surface-variant transition-colors">Remover</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label-sm text-[12px] text-on-surface-variant">Nome Legal da Empresa</label>
                <input type="text" name="legal_name" value={settings.legal_name || ''} onChange={handleChange} placeholder="Empresa Lda." className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="font-label-sm text-[12px] text-on-surface-variant">Nome Comercial</label>
                <input type="text" name="commercial_name" value={settings.commercial_name || ''} onChange={handleChange} placeholder="Empresa Gestor" className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="font-label-sm text-[12px] text-on-surface-variant">NUIT (Número de Identificação)</label>
                <input type="text" name="tax_id" value={settings.tax_id || ''} onChange={handleChange} placeholder="400123456" className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono" />
              </div>
              <div className="space-y-1">
                <label className="font-label-sm text-[12px] text-on-surface-variant">Telemóvel / Telefone</label>
                <input type="text" name="phone" value={settings.phone || ''} onChange={handleChange} placeholder="+258 84 123 4567" className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="font-label-sm text-[12px] text-on-surface-variant">Endereço da Sede</label>
                <textarea name="address" value={settings.address || ''} onChange={handleChange} placeholder="Rua 1, Maputo" className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[80px]"></textarea>
              </div>
            </div>
         </div>
      </div>

      {/* Localization Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
         <div className="p-6 border-b border-outline-variant/30">
           <h4 className="font-title-md text-title-md text-on-surface">Localização</h4>
           <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Moeda, idioma e formatos de data.</p>
         </div>
         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="font-label-sm text-[12px] text-on-surface-variant">Moeda do Sistema</label>
              <select className="w-full p-3 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary outline-none transition-all">
                <option value="MZN">Metical Moçambicano (MZN)</option>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="ZAR">Rand Sul-Africano (ZAR)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-label-sm text-[12px] text-on-surface-variant">Fuso Horário</label>
              <select className="w-full p-3 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary outline-none transition-all">
                <option value="Africa/Maputo">Africa/Maputo (GMT+2)</option>
              </select>
            </div>
         </div>
      </div>

       {/* Save Button Container */}
      <div className="flex justify-end gap-3 pt-2">
        <button className="px-6 py-2.5 border border-outline text-on-surface rounded-xl font-label-md hover:bg-surface-container-low transition-colors">Cancelar</button>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50">
          <span className="material-symbols-outlined text-[18px]">save</span>
          {saving ? 'A Guardar...' : 'Guardar Alterações'}
        </button>
      </div>
    </div>
  );
}

function StoresSettings() {
  const [stores, setStores] = useState<any[]>([]);
  
  useEffect(() => {
    supabase.from('stores').select('*').then(({data}) => {
      if (data) setStores(data);
    });
  }, []);

  return (
    <div className="flex-1 space-y-gutter">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
         <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
           <div>
             <h4 className="font-title-md text-title-md text-on-surface">Lojas e Terminais</h4>
             <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Gerencie os terminais de venda e filiais.</p>
           </div>
           <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold flex items-center gap-2 text-sm shadow-sm hover:opacity-90 transition-all">
             <span className="material-symbols-outlined text-[18px]">add</span> Adicionar Loja
           </button>
         </div>
         <div className="p-0">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-surface-container-low border-b border-outline-variant/30">
                 <th className="p-4 font-label-sm text-on-surface-variant">Nome da Loja</th>
                 <th className="p-4 font-label-sm text-on-surface-variant hidden md:table-cell">Localização</th>
                 <th className="p-4 font-label-sm text-on-surface-variant text-center">Terminais</th>
                 <th className="p-4 font-label-sm text-on-surface-variant text-center">Estado</th>
                 <th className="p-4 font-label-sm text-on-surface-variant text-right">Ações</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-outline-variant/30">
               {stores.map((store, i) => (
                 <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                   <td className="p-4 font-label-md text-on-surface">{store.name}</td>
                   <td className="p-4 text-sm text-on-surface-variant hidden md:table-cell">{store.location}</td>
                   <td className="p-4 text-sm text-on-surface text-center font-mono">{store.terminals_count || 1}</td>
                   <td className="p-4 text-center">
                     <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${store.status === 'Ativa' ? 'bg-primary/10 text-primary' : 'bg-outline-variant/20 text-on-surface-variant'}`}>{store.status}</span>
                   </td>
                   <td className="p-4 text-right">
                     <button className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 rounded hover:bg-primary/10 inline-flex items-center justify-center">
                       <span className="material-symbols-outlined text-[18px]">edit</span>
                     </button>
                   </td>
                 </tr>
               ))}
               {stores.length === 0 && (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-on-surface-variant">Nenhuma loja cadastrada</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}

function TaxesSettings() {
  const [taxes, setTaxes] = useState<any[]>([]);
  
  useEffect(() => {
    supabase.from('taxes').select('*').then(({data}) => {
      if (data) setTaxes(data);
    });
  }, []);

  return (
    <div className="flex-1 space-y-gutter">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
         <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
           <div>
             <h4 className="font-title-md text-title-md text-on-surface">Impostos e Finanças</h4>
             <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Configuração de IVA e regras fiscais (Moçambique).</p>
           </div>
           <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold flex items-center gap-2 text-sm shadow-sm hover:opacity-90 transition-all">
             <span className="material-symbols-outlined text-[18px]">add</span> Adicionar Imposto
           </button>
         </div>
         <div className="p-6 border-b border-outline-variant/30 flex items-center gap-4 bg-primary/5">
           <div className="p-3 bg-primary/10 text-primary rounded-full">
             <span className="material-symbols-outlined">receipt_long</span>
           </div>
           <div>
             <h5 className="font-label-md text-on-surface">Série de Faturação Ativa</h5>
             <p className="text-sm text-on-surface-variant">As faturas atuais usarão o prefixo <strong className="text-on-surface">FT 2024/</strong></p>
           </div>
           <button className="ml-auto px-4 py-2 border border-outline-variant text-on-surface rounded-lg text-sm hover:bg-surface-container transition-colors">Configurar Séries</button>
         </div>
         <div className="p-0">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-surface-container-low border-b border-outline-variant/30">
                 <th className="p-4 font-label-sm text-on-surface-variant">Descrição do Imposto</th>
                 <th className="p-4 font-label-sm text-on-surface-variant text-center">Taxa (%)</th>
                 <th className="p-4 font-label-sm text-on-surface-variant text-center">Padrão</th>
                 <th className="p-4 font-label-sm text-on-surface-variant text-right">Ações</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-outline-variant/30">
               {taxes.map((tax, i) => (
                 <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                   <td className="p-4 font-label-md text-on-surface">{tax.name}</td>
                   <td className="p-4 text-sm text-on-surface text-center font-mono">{tax.rate}%</td>
                   <td className="p-4 text-center">
                     {tax.is_default ? <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span> : <span className="text-outline-variant">-</span>}
                   </td>
                   <td className="p-4 text-right">
                     <button className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 rounded hover:bg-primary/10 inline-flex items-center justify-center">
                       <span className="material-symbols-outlined text-[18px]">edit</span>
                     </button>
                   </td>
                 </tr>
               ))}
               {taxes.length === 0 && (
                 <tr>
                   <td colSpan={4} className="p-8 text-center text-on-surface-variant">Nenhum imposto cadastrado</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}

function ApiSettings() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  
  useEffect(() => {
    supabase.from('api_integrations').select('*').then(({data}) => {
      if (data) setIntegrations(data);
    });
  }, []);

  return (
    <div className="flex-1 space-y-gutter">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
         <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
           <div>
             <h4 className="font-title-md text-title-md text-on-surface">Integrações (API)</h4>
             <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Ligue o DR GESTOR a plataformas de pagamento e SMS externas.</p>
           </div>
           <button className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-surface-container transition-all">
             <span className="material-symbols-outlined text-[18px]">key</span> Gerar Chave API
           </button>
         </div>
         <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-outline-variant/30 rounded-xl p-5 hover:border-primary/50 transition-colors bg-surface relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-outline-variant/20 text-on-surface-variant">Inativo</span>
                 </div>
                 <div className="h-12 w-12 bg-[#E3000F]/10 rounded-lg flex items-center justify-center text-[#E3000F] mb-4">
                   <span className="material-symbols-outlined">account_balance</span>
                 </div>
                 <h5 className="font-label-md text-on-surface mb-1">M-Pesa API (Vodacom)</h5>
                 <p className="text-sm text-on-surface-variant mb-4">Receba pagamentos móveis diretamente no Ponto de Venda via B2C/C2B.</p>
                 <button className="w-full py-2 bg-surface-container text-on-surface border border-outline-variant/50 rounded-lg text-sm font-bold hover:bg-surface-container-highest transition-colors">Configurar</button>
              </div>

              <div className="border border-outline-variant/30 rounded-xl p-5 hover:border-primary/50 transition-colors bg-surface relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-primary/10 text-primary">Ativo</span>
                 </div>
                 <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                   <span className="material-symbols-outlined">sms</span>
                 </div>
                 <h5 className="font-label-md text-on-surface mb-1">Sendit SMS</h5>
                 <p className="text-sm text-on-surface-variant mb-4">Envio de faturas e notificações por SMS para clientes em Moçambique.</p>
                 <button className="w-full py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors">Gerir Integração</button>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ReceiptSettings() {
  const [settings, setSettings] = useState<any>({});
  
  useEffect(() => {
    supabase.from('settings').select('*').limit(1).single().then(({data}) => {
      if (data) setSettings(data);
    });
  }, []);

  const handleSave = async () => {
    await supabase.from('settings').update({
      receipt_footer: settings.receipt_footer,
      receipt_paper_size: settings.receipt_paper_size,
      receipt_show_logo: settings.receipt_show_logo,
    }).eq('id', settings.id);
    alert('Guardado com sucesso!');
  };

  return (
    <div className="flex-1 space-y-gutter">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
         <div className="p-6 border-b border-outline-variant/30">
           <h4 className="font-title-md text-title-md text-on-surface">Modelo de Recibo</h4>
           <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Personalize o rodapé e mensagens das faturas e talões.</p>
         </div>
         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div>
                  <label className="font-label-sm text-[12px] text-on-surface-variant mb-1 block">Mensagem de Rodapé (Fatura)</label>
                  <textarea rows={3} value={settings.receipt_footer || ''} onChange={e => setSettings({...settings, receipt_footer: e.target.value})} className="w-full p-3 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary outline-none transition-all resize-none"></textarea>
               </div>
               <div>
                  <label className="font-label-sm text-[12px] text-on-surface-variant mb-1 block">Tamanho do Papel Padrão (POS)</label>
                  <select value={settings.receipt_paper_size || '80mm'} onChange={e => setSettings({...settings, receipt_paper_size: e.target.value})} className="w-full p-3 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary outline-none transition-all">
                    <option value="80mm">Impressora Térmica 80mm</option>
                    <option value="58mm">Impressora Térmica 58mm</option>
                    <option value="A4">Formato A4 (Fatura Comercial)</option>
                  </select>
               </div>
               <div className="flex items-center gap-3 pt-2">
                 <input type="checkbox" checked={settings.receipt_show_logo ?? true} onChange={e => setSettings({...settings, receipt_show_logo: e.target.checked})} className="w-5 h-5 rounded border-outline focus:ring-primary text-primary" />
                 <span className="text-sm text-on-surface">Imprimir Logo nos Recibos</span>
               </div>
               <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md font-bold w-full hover:opacity-90 transition-all">Guardar Modelo</button>
            </div>
            
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/30 flex flex-col items-center justify-center min-h-[300px]">
               <div className="w-[200px] bg-white shadow-md border border-neutral-200 p-4 font-mono text-[10px] text-black">
                 <div className="text-center mb-3">
                   <div className="font-bold text-[12px]">{settings.legal_name || 'DR GESTOR MZ Lda'}</div>
                   <div>T: {settings.phone || '+258 84 123 4567'}</div>
                   <div>NUIT: {settings.tax_id || '400123456'}</div>
                   <div>{settings.address || 'Av. Kenneth Kaunda'}</div>
                 </div>
                 <div className="border-b border-dashed border-neutral-300 my-2"></div>
                 <div className="flex justify-between mb-1"><span>Talão VD</span><span>#2024</span></div>
                 <div className="flex justify-between mb-2"><span>1x Produto Exemplo</span><span>100,00</span></div>
                 <div className="border-b border-dashed border-neutral-300 my-2"></div>
                 <div className="flex justify-between font-bold text-[12px] mb-3"><span>TOTAL</span><span>100,00 MT</span></div>
                 <div className="text-center italic opacity-80 whitespace-pre-line">
                   {settings.receipt_footer || 'Obrigado pela preferência!\nVolte sempre.'}
                 </div>
               </div>
               <span className="text-xs text-on-surface-variant mt-4">Pré-visualização {settings.receipt_paper_size || '80mm'}</span>
            </div>
         </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [settings, setSettings] = useState<any>({});
  
  useEffect(() => {
    supabase.from('settings').select('*').limit(1).single().then(({data}) => {
      if (data) setSettings(data);
    });
  }, []);

  const handleToggle = async (field: string) => {
    const newValue = !settings[field];
    setSettings({...settings, [field]: newValue});
    await supabase.from('settings').update({ [field]: newValue }).eq('id', settings.id);
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSettings({...settings, security_session_timeout: newValue});
    await supabase.from('settings').update({ security_session_timeout: newValue }).eq('id', settings.id);
  };

  return (
    <div className="flex-1 space-y-gutter">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
         <div className="p-6 border-b border-outline-variant/30">
           <h4 className="font-title-md text-title-md text-on-surface">Segurança</h4>
           <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Proteja o acesso ao sistema da sua empresa.</p>
         </div>
         <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-6 border-b border-outline-variant/20">
               <div>
                  <h5 className="font-label-md text-on-surface">Autenticação de Dois Fatores (2FA)</h5>
                  <p className="text-sm text-on-surface-variant max-w-md mt-1">Exigir código SMS ou Google Authenticator para administradores.</p>
               </div>
               <button onClick={() => handleToggle('security_2fa_enabled')} className={`px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${settings.security_2fa_enabled ? 'bg-primary/10 text-primary border-primary/20' : 'border-outline-variant text-on-surface hover:bg-surface-container'}`}>{settings.security_2fa_enabled ? 'Desativar 2FA' : 'Ativar 2FA'}</button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-6 border-b border-outline-variant/20">
               <div>
                  <h5 className="font-label-md text-on-surface">Política de Password</h5>
                  <p className="text-sm text-on-surface-variant max-w-md mt-1">Exigir senhas fortes (8+ caractéres, letras, números, símbolos).</p>
               </div>
               <div className="flex items-center gap-3">
                 <input type="checkbox" checked={settings.security_password_policy ?? true} onChange={() => handleToggle('security_password_policy')} className="w-5 h-5 rounded border-outline focus:ring-primary text-primary" />
                 <span className="text-sm font-medium text-on-surface">{settings.security_password_policy !== false ? 'Ativado' : 'Desativado'}</span>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
               <div>
                  <h5 className="font-label-md text-on-surface">Sessão Expirada Automática</h5>
                  <p className="text-sm text-on-surface-variant max-w-md mt-1">Terminar sessão por inatividade (recomendado para Lojas/POS).</p>
               </div>
               <select value={settings.security_session_timeout || '30'} onChange={handleSelect} className="px-4 py-2 border border-outline-variant bg-surface rounded-lg text-sm text-on-surface outline-none">
                 <option value="15">15 Minutos</option>
                 <option value="30">30 Minutos</option>
                 <option value="60">1 Hora</option>
                 <option value="never">Nunca</option>
               </select>
            </div>
         </div>
      </div>
    </div>
  );
}


export function Settings() {
  const { tab = "general" } = useParams();
  const navigate = useNavigate();

  const tabs = [
    { id: "general", name: "Geral", icon: "tune" },
    { id: "roles", name: "Utilizadores e Cargos", icon: "group" },
    { id: "stores", name: "Lojas e Terminais", icon: "store" },
    { id: "taxes", name: "Impostos e Finanças", icon: "account_balance" },
    { id: "api", name: "Integrações (API)", icon: "api" },
    { id: "receipt", name: "Modelo de Recibo", icon: "receipt_long" },
    { id: "security", name: "Segurança", icon: "security" },
  ];

  return (
    <Layout title="Definições do Sistema">
      <div className="flex flex-col md:flex-row gap-gutter">
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((item) => (
            <button 
              key={item.id} 
              onClick={() => {
                if (item.id === "roles") {
                  navigate("/roles");
                } else {
                  navigate(`/settings/${item.id}`);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all ${tab === item.id ? 'bg-primary text-on-primary shadow-sm font-bold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>

        {/* Dynamic Settings Content Area */}
        {tab === "general" && <GeneralSettings />}
        {tab === "stores" && <StoresSettings />}
        {tab === "taxes" && <TaxesSettings />}
        {tab === "api" && <ApiSettings />}
        {tab === "receipt" && <ReceiptSettings />}
        {tab === "security" && <SecuritySettings />}
      </div>
    </Layout>
  );
}

