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
    <div className="bg-background text-on-surface min-h-screen flex font-body-md antialiased pb-20 md:pb-0">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72 w-full">
        {!isPos && <Header title={title} />}
        <main className={`flex-1 flex flex-col ${fullWidth ? "w-full" : "p-margin-mobile md:p-margin-desktop gap-gutter max-w-container-max mx-auto w-full"} ${isPos ? "pt-20 md:pt-8" : "pt-24 lg:pt-8"}`}>
            {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
