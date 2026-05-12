import { Link, useLocation } from "react-router-dom";

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", icon: "dashboard", label: "Início" },
    { to: "/pos", icon: "receipt_long", label: "Vendas" },
    { to: "/inventory", icon: "payments", label: "Gastos" },
    { to: "/financials", icon: "analytics", label: "Relatórios" },
    { to: "/settings", icon: "menu", label: "Mais" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe border-t border-outline-variant bg-surface-container-lowest shadow-[0px_-4px_12px_rgba(26,43,75,0.05)] rounded-t-xl h-16">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 active:scale-90 w-16 ${
              isActive
                ? "bg-secondary-container text-on-secondary-container font-bold"
                : "text-on-surface-variant hover:bg-surface-variant/50"
            }`}
          >
            <span 
              className={`material-symbols-outlined mb-1 ${isActive ? "text-[24px]" : ""}`} 
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className={`font-label-sm ${isActive ? "text-[10px]" : "text-[10px] mt-1"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
