import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-gutter h-16 bg-surface shadow-[0px_4px_12px_rgba(26,43,75,0.05)] lg:hidden border-b border-outline-variant/30">
      <Link to="/" className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>business</span>
        <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-primary">DR Gestor MZ</h1>
      </Link>
      <div className="flex items-center gap-2">
        {children}
        <button className="text-primary active:scale-[0.98] transition-all duration-200 hover:bg-surface-container-high p-2 rounded-full">
          <span className="material-symbols-outlined text-2xl">notifications</span>
        </button>
      </div>
    </header>
  );
}
