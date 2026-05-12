import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", icon: "grid_view", label: "Painel Geral", match: "/dashboard" },
    { to: "/pos", icon: "receipt_long", label: "Faturamento", match: "/pos" },
    { to: "/inventory", icon: "account_balance_wallet", label: "Gestão de Custos", match: "/inventory" },
    { to: "/financials", icon: "monitoring", label: "Balanço Patrimonial", match: "/financials" },
    { to: "/settings", icon: "settings", label: "Configurações", match: "/settings" },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-full py-8 px-4 w-72 rounded-r-2xl bg-surface-container-low dark:bg-surface-container-lowest shadow-xl fixed left-0 top-0 z-40">
      <div className="flex items-center gap-4 mb-10 px-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl bg-primary-container text-on-primary-container font-headline-md text-headline-md">
           E
        </div>
        <div>
          <h2 className="font-headline-md text-[16px] font-bold text-primary leading-tight">Empresa Exemplo Lda</h2>
          <p className="font-body-md text-label-sm text-on-surface-variant">Administrador</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[10px]">Premium Plan</span>
        </div>
      </div>
      
      <ul className="flex flex-col gap-2 h-full">
        {navItems.map((item, i) => {
          const isActive = location.pathname.startsWith(item.match);
          const isBottom = i === navItems.length - 1;
          
          return (
            <li key={item.to} className={isBottom ? "mt-auto" : ""}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "text-secondary font-bold border-l-4 border-secondary bg-secondary/10"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
              >
                <span 
                  className={`material-symbols-outlined ${isActive ? "text-secondary" : ""}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="font-body-md text-body-md">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
