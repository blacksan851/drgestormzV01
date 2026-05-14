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
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const mockStats = {
    products: 15,
    clients: 10,
    sales: 4,
    totalSalesAmount: 20200.50
  };

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
        setIsUsingMockData(false);

        // Fetch recent activities
        const { data: recent } = await supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (recent) setRecentActivities(recent);

      } catch (error) {
        console.error("Error fetching stats:", error);
        console.warn("Usando dados de demonstração (Mock Data) para o Dashboard.");
        setStats(mockStats);
        setIsUsingMockData(true);
      }
    }

    fetchStats();
  }, []);

  return (
    <Layout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0B2E1E]">Dashboard</h2>
        <p className="text-sm text-gray-500">Visão geral do seu negócio</p>
      </div>

      </div>

      {isUsingMockData && (
        <div className="mb-6 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          Atenção: A ligação à base de dados falhou. A mostrar dados de demonstração (Mock Data).
        </div>
      )}

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

      {/* Dashboard Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <div className="bg-[#E6F4EA] rounded-xl p-5 border-l-4 border-[#0B2E1E] flex justify-between items-center h-28 shadow-sm hover:-translate-y-1 transition-transform">
          <div>
            <span className="text-sm text-gray-600 block mb-1">Vendas do Dia</span>
            <h3 className="text-2xl font-bold text-[#0B2E1E]">0 MZN</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#34D399]/20 flex items-center justify-center text-[#0B2E1E]">
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
          </div>
        </div>

        <div className="bg-[#E6F4EA] rounded-xl p-5 border-l-4 border-[#34D399] flex justify-between items-center h-28 shadow-sm hover:-translate-y-1 transition-transform">
          <div>
            <span className="text-sm text-gray-600 block mb-1">Vendas do Mês</span>
            <h3 className="text-2xl font-bold text-[#0B2E1E]">{stats.totalSalesAmount.toLocaleString('pt-MZ')} MZN</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#34D399]/20 flex items-center justify-center text-[#34D399]">
            <span className="material-symbols-outlined text-[20px]">trending_up</span>
          </div>
        </div>

        <div className="bg-[#E6F4EA] rounded-xl p-5 border-l-4 border-[#0B2E1E] flex justify-between items-center h-28 shadow-sm hover:-translate-y-1 transition-transform">
          <div>
            <span className="text-sm text-gray-600 block mb-1">Total de Produtos</span>
            <h3 className="text-2xl font-bold text-[#0B2E1E]">{stats.products}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#34D399]/20 flex items-center justify-center text-[#0B2E1E]">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          </div>
        </div>

        <div className="bg-[#E6F4EA] rounded-xl p-5 border-l-4 border-[#34D399] flex justify-between items-center h-28 shadow-sm hover:-translate-y-1 transition-transform">
          <div>
            <span className="text-sm text-gray-600 block mb-1">Total de Clientes</span>
            <h3 className="text-2xl font-bold text-[#0B2E1E]">{stats.clients}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#34D399]/20 flex items-center justify-center text-[#34D399]">
            <span className="material-symbols-outlined text-[20px]">group</span>
          </div>
        </div>
      </div>

      {/* Dashboard Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#E6F4EA] rounded-xl p-5 border-l-4 border-[#34D399] flex justify-between items-center h-28 shadow-sm hover:-translate-y-1 transition-transform">
          <div>
            <span className="text-sm text-gray-600 block mb-1">Lucro Real</span>
            <h3 className="text-2xl font-bold text-[#0B2E1E]">0 MZN</h3>
            <span className="text-xs text-gray-500 mt-1 block">Receita - Custo</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#34D399]/20 flex items-center justify-center text-[#34D399]">
            <span className="material-symbols-outlined text-[20px]">attach_money</span>
          </div>
        </div>

        <div className="bg-[#FCE8E8] rounded-xl p-5 border-l-4 border-[#EF4444] flex justify-between items-center h-28 shadow-sm hover:-translate-y-1 transition-transform">
          <div>
            <span className="text-sm text-gray-600 block mb-1">Estoque Baixo</span>
            <h3 className="text-2xl font-bold text-[#0B2E1E]">0</h3>
            <span className="text-xs text-[#EF4444] mt-1 block">Itens críticos</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444]">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
        </div>

        <div className="bg-[#FEF3C7] rounded-xl p-5 border-l-4 border-[#F59E0B] flex justify-between items-center h-28 shadow-sm hover:-translate-y-1 transition-transform">
          <div>
            <span className="text-sm text-gray-600 block mb-1">Despesas do Mês</span>
            <h3 className="text-2xl font-bold text-[#0B2E1E]">0 MZN</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-[#0B2E1E] mb-6">Vendas da Semana</h3>
          <div className="flex-1 min-h-[250px] relative border-l border-b border-gray-200">
            {/* Chart placeholders - dashed lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="w-full border-t border-dashed border-gray-200 h-0 relative"><span className="absolute -left-6 -top-2 text-xs text-gray-400">4</span></div>
              <div className="w-full border-t border-dashed border-gray-200 h-0 relative"><span className="absolute -left-6 -top-2 text-xs text-gray-400">3</span></div>
              <div className="w-full border-t border-dashed border-gray-200 h-0 relative"><span className="absolute -left-6 -top-2 text-xs text-gray-400">2</span></div>
              <div className="w-full border-t border-dashed border-gray-200 h-0 relative"><span className="absolute -left-6 -top-2 text-xs text-gray-400">1</span></div>
              <div className="w-full border-t border-dashed border-gray-200 h-0 relative"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-[#0B2E1E] mb-6">Produtos Mais Vendidos</h3>
          <div className="flex-1 min-h-[250px] relative border-l border-b border-gray-200 ml-8">
            {/* Chart placeholders - dashed lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="w-full border-t border-dashed border-gray-200 h-0"></div>
              <div className="w-full border-t border-dashed border-gray-200 h-0"></div>
              <div className="w-full border-t border-dashed border-gray-200 h-0"></div>
              <div className="w-full border-t border-dashed border-gray-200 h-0"></div>
              <div className="w-full border-t border-dashed border-gray-200 h-0"></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
