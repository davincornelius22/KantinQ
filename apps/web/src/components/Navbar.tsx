import React from "react";
import { UtensilsCrossed, Users, LayoutDashboard, BookOpen, QrCode } from "lucide-react";

export type NavTab = "order" | "queue" | "dashboard" | "menu" | "canteen";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  canteenName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  canteenName,
}) => {
  const tabs = [
    {
      id: "order" as NavTab,
      label: "Pesan Menu",
      icon: <UtensilsCrossed className="w-4 h-4" />,
    },
    {
      id: "queue" as NavTab,
      label: "Pantau Antrean",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "dashboard" as NavTab,
      label: "Dashboard Penjual",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "menu" as NavTab,
      label: "Kelola Menu",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "canteen" as NavTab,
      label: "QR Kantin",
      icon: <QrCode className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Kantin<span className="text-orange-600">Q</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-orange-100 text-orange-800">
                  Kampus
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate max-w-[200px]">
                {canteenName}
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
