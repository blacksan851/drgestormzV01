import { Layout } from "../components/Layout";

export function Reports() {
  return (
    <Layout title="Relatórios">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0B2E1E]">Relatórios</h2>
        <p className="text-sm text-gray-500">Exporte e analise os dados do seu negócio</p>
      </div>
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
        <span className="material-symbols-outlined text-[48px] text-gray-300 mb-4">analytics</span>
        <h3 className="text-xl font-bold text-gray-700 mb-2">Módulo de Relatórios em Desenvolvimento</h3>
        <p className="text-gray-500 max-w-md mx-auto">Em breve poderá exportar relatórios detalhados de vendas, fluxo de caixa e inventário em PDF e Excel.</p>
      </div>
    </Layout>
  );
}
