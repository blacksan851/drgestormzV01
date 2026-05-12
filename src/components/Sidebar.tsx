import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", icon: "grid_view", label: "Dashboard", match: "/dashboard" },
    { to: "/pos", icon: "shopping_cart", label: "Vendas (POS)", match: "/pos" },
    { to: "/inventory", icon: "inventory_2", label: "Estoque", match: "/inventory" },
    { to: "/clients", icon: "group", label: "Clientes", match: "/clients" },
    { to: "/financials", icon: "payments", label: "Despesas", match: "/financials" },
    { to: "/reports", icon: "bar_chart", label: "Relatórios", match: "/reports" },
    { to: "/roles", icon: "manage_accounts", label: "Usuários", match: "/roles" },
    { to: "/printers", icon: "print", label: "Impressoras", match: "/printers" },
    { to: "/billing", icon: "receipt_long", label: "Assinatura", match: "/billing" },
    { to: "/notifications", icon: "notifications", label: "Notificações", match: "/notifications" },
    { to: "/settings", icon: "settings", label: "Configurações", match: "/settings" },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-full py-6 px-4 w-64 shadow-xl fixed left-0 top-0 z-40 bg-[#0B2E1E] overflow-y-auto">
      <div className="flex items-center gap-3 mb-8 px-2">
        <span className="material-symbols-outlined text-[#34D399] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
        <h2 className="font-headline-md text-xl font-bold text-white tracking-tight">GestãoPro</h2>
      </div>
      
      <ul className="flex flex-col gap-1.5 h-full">
        {navItems.map((item, i) => {
          const isActive = location.pathname.startsWith(item.match);
          
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "text-white font-bold bg-[#1A5D3F]"
                    : "text-[#D1FAE5] hover:text-white hover:bg-[#1A5D3F]/50"
                }`}
              >
                <span 
                  className={`material-symbols-outlined text-[20px] ${isActive ? "text-[#34D399]" : ""}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="font-body-md text-[15px]">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="mt-auto pt-4">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[#D1FAE5] hover:text-white hover:bg-[#1A5D3F]/50 w-full text-left">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            <span className="font-body-md text-[15px]">Recolher</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}
