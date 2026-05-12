import { Layout } from "../components/Layout";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    sales: 0,
    clients: 0,
    totalSalesAmount: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: productsCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        const { count: clientsCount } = await supabase
          .from("clients")
          .select("*", { count: "exact", head: true });

        const { data: salesData } = await supabase
          .from("sales")
          .select("amount, created_at, status");

        const salesCount = salesData?.length || 0;
        const totalSalesAmount = salesData?.reduce((acc, sale) => acc + Number(sale.amount), 0) || 0;

        setStats({
          products: productsCount || 0,
          clients: clientsCount || 0,
          sales: salesCount,
          totalSalesAmount
        });

        // Fetch recent activities
        const { data: recent } = await supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (recent) setRecentActivities(recent);

      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    fetchStats();
  }, []);

  return (
    <Layout title="Dashboard">
      <div className="mb-8 lg:hidden flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-primary">Empresa Exemplo Lda</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Bom dia, Administrador</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <Link to="/billing" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shrink-0 shadow-sm hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nova Fatura
        </Link>
        <Link to="/pos" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-transparent border border-secondary text-secondary font-label-md text-label-md shrink-0 hover:bg-secondary/5 transition-colors">
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          Registrar Venda
        </Link>
        <Link to="/clients" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container-high text-primary font-label-md text-label-md shrink-0 hover:bg-surface-dim transition-colors">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Novo Cliente
        </Link>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] border border-outline-variant/30 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant">Receita Total</span>
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-md text-[20px] font-bold text-primary">MT {stats.totalSalesAmount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}</h3>
            <p className="font-label-sm text-label-sm text-secondary mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% este mês
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] border border-outline-variant/30 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant">Vendas Totais</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-md text-[20px] font-bold text-primary">{stats.sales} un</h3>
            <p className="font-label-sm text-label-sm text-secondary mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +5% este mês
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] border border-outline-variant/30 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant">Estoque Registrado</span>
            <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-md text-[20px] font-bold text-primary">{stats.products} Itens</h3>
            <p className="font-label-sm text-label-sm text-error mt-1 flex items-center gap-1">
              Vigiar os níveis mínimos
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] border border-outline-variant/30 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant">Clientes Registrados</span>
            <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-md text-[20px] font-bold text-primary">{stats.clients}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Registrados recentemente</p>
          </div>
        </div>
      </div>

      {/* Complex Layout: Chart & Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-8">
        <div className="xl:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] border border-outline-variant/30 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-[20px] font-bold text-primary">Tendência de Receita</h3>
            <select className="bg-surface border border-outline-variant rounded-lg px-3 py-1 text-label-sm font-label-sm text-on-surface-variant focus:border-secondary focus:ring-1 focus:ring-secondary outline-none">
              <option>Últimos 6 meses</option>
              <option>Este Ano</option>
            </select>
          </div>
          <div className="flex-1 min-h-[250px] bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-end px-4 pt-8 pb-4 gap-2 relative overflow-hidden">
            <div className="w-full bg-secondary/20 h-[40%] rounded-t-sm hover:bg-secondary/40 transition-colors"></div>
            <div className="w-full bg-secondary/30 h-[60%] rounded-t-sm hover:bg-secondary/50 transition-colors"></div>
            <div className="w-full bg-secondary/20 h-[30%] rounded-t-sm hover:bg-secondary/40 transition-colors"></div>
            <div className="w-full bg-secondary/50 h-[80%] rounded-t-sm hover:bg-secondary/70 transition-colors"></div>
            <div className="w-full bg-secondary/40 h-[70%] rounded-t-sm hover:bg-secondary/60 transition-colors"></div>
            <div className="w-full bg-secondary h-[95%] rounded-t-sm shadow-[0_0_10px_rgba(0,108,73,0.3)]"></div>
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div className="w-full h-px bg-primary"></div>
              <div className="w-full h-px bg-primary"></div>
              <div className="w-full h-px bg-primary"></div>
              <div className="w-full h-px bg-primary"></div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_12px_rgba(26,43,75,0.05)] border border-outline-variant/30">
          <h3 className="font-headline-md text-[20px] font-bold text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">lightbulb</span>
            Atividade e Alertas
          </h3>
          <div className="space-y-4">
             {recentActivities.length === 0 ? (
               <div className="text-center text-on-surface-variant text-sm py-4">Sem atividade recente.</div>
             ) : (
               recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-surface-variant/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-primary">Venda {act.tx_id}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Cliente: {act.client_name}</p>
                    <div className="mt-2 font-label-md text-[13px] text-secondary font-bold hover:underline">
                      {Number(act.amount).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                    </div>
                  </div>
                </div>
               ))
             )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
