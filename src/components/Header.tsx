import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 z-50 flex justify-between items-center px-8 h-16 bg-[#F4F9F4] border-b border-[#E2E8F0]">
      {/* Mobile Logo (hidden on desktop because Sidebar has it) */}
      <Link to="/" className="flex items-center gap-2 lg:hidden">
        <span className="material-symbols-outlined text-[#34D399] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
        <h1 className="font-headline-md text-lg font-bold tracking-tight text-[#0B2E1E]">GestãoPro</h1>
      </Link>

      {/* Desktop Search Bar */}
      <div className="hidden lg:flex items-center">
        <div className="relative w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm">search</span>
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#34D399] focus:ring-1 focus:ring-[#34D399]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {children}
        <button className="text-gray-500 hover:text-[#0B2E1E] transition-colors p-2 rounded-full hover:bg-white">
          <span className="material-symbols-outlined text-[20px]">account_circle</span>
        </button>
        <button className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white">
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  );
}
