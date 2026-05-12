import { Layout } from "../components/Layout";

export function Notifications() {
  return (
    <Layout title="Notificações">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0B2E1E]">Notificações</h2>
        <p className="text-sm text-gray-500">Alertas do sistema e automações</p>
      </div>
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
        <span className="material-symbols-outlined text-[48px] text-gray-300 mb-4">notifications_active</span>
        <h3 className="text-xl font-bold text-gray-700 mb-2">Central de Notificações</h3>
        <p className="text-gray-500 max-w-md mx-auto">Configure alertas para produtos com estoque baixo ou pagamentos pendentes de clientes.</p>
      </div>
    </Layout>
  );
}
