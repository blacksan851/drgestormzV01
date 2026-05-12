import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  title: string;
  children: ReactNode;
  headerChildren?: ReactNode;
  fullWidth?: boolean;
  hideFooter?: boolean;
}

export function Layout({ title, children, headerChildren, fullWidth = false }: LayoutProps) {
  const location = useLocation();
  const isPos = location.pathname.includes('/pos');

  return (
    <div className="min-h-screen bg-[#F4F9F4] text-on-surface">
      <Sidebar />
      <Header title={title}>
        {headerChildren}
      </Header>
      
      <main className="lg:ml-64 pt-16 min-h-screen transition-all duration-300 relative z-10">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
