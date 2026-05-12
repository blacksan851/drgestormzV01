import { Layout } from "../components/Layout";

export function Printers() {
  return (
    <Layout title="Impressoras">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0B2E1E]">Impressoras</h2>
        <p className="text-sm text-gray-500">Configure as impressoras térmicas para emissão de talões</p>
      </div>
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
        <span className="material-symbols-outlined text-[48px] text-gray-300 mb-4">print</span>
        <h3 className="text-xl font-bold text-gray-700 mb-2">Módulo de Impressoras em Desenvolvimento</h3>
        <p className="text-gray-500 max-w-md mx-auto">Configure a sua impressora Bluetooth/USB para imprimir faturas automaticamente a partir do POS.</p>
      </div>
    </Layout>
  );
}
