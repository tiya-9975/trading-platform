import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Menu } from "lucide-react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* SIDEBAR - Desktop (always visible) */}
      <div className="lg:block hidden">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>

      {/* Mobile Sidebar (slides in/out) */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar with Hamburger - Only visible on mobile/tablet */}
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center px-4 py-3">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} className="text-black" />
            </button>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">TradePro</h1>
              <p className="text-xs text-gray-500">Invest Smarter</p>
            </div>
          </div>
        </div>

        {/* Desktop Header - Only visible on desktop */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Main content area - scrollable */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;