import React, { useEffect, useState } from "react";
import {
  Canteen,
  MenuItem,
  OrderResponse,
  QueueCondition,
} from "@kantinq/shared";
import { ApiClient } from "./services/api";
import { Navbar, NavTab } from "./components/Navbar";
import { CustomerOrderingPage } from "./pages/CustomerOrderingPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { QueueMonitorPage } from "./pages/QueueMonitorPage";
import { SellerDashboardPage } from "./pages/SellerDashboardPage";
import { MenuManagementPage } from "./pages/MenuManagementPage";
import { CanteenQrPage } from "./pages/CanteenQrPage";
import { RefreshCw } from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>("order");
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [queueCondition, setQueueCondition] = useState<QueueCondition>(
    QueueCondition.SEPI
  );
  const [activePlacedOrder, setActivePlacedOrder] =
    useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Check URL param for ?canteenId=X
  const urlParams = new URLSearchParams(window.location.search);
  const canteenIdFromUrl = parseInt(urlParams.get("canteenId") || "1", 10);
  const canteenId = isNaN(canteenIdFromUrl) ? 1 : canteenIdFromUrl;

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const c = await ApiClient.getCanteenById(canteenId);
      setCanteen(c);

      const m = await ApiClient.getMenu(canteenId);
      setMenus(m);

      const q = await ApiClient.getQueue(canteenId);
      setQueueCondition(q.Condition);
    } catch (err) {
      console.error("Gagal memuat data awal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [canteenId]);

  const handleRefreshMenus = async () => {
    if (!canteen) return;
    try {
      const m = await ApiClient.getMenu(canteen.Id);
      setMenus(m);
    } catch (err) {
      console.error("Gagal menyegarkan menu:", err);
    }
  };

  const handleOrderSuccess = (newOrder: OrderResponse) => {
    setActivePlacedOrder(newOrder);
    setActiveTab("order");
  };

  if (loading && !canteen) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-bold">Menghubungkan ke KantinQ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        canteenName={canteen?.Name || "Kantin Kampus"}
      />

      {/* Main Content View */}
      <main className="flex-1 pb-12">
        {canteen && activeTab === "order" && (
          activePlacedOrder ? (
            <OrderConfirmationPage
              order={activePlacedOrder}
              onBackToMenu={() => setActivePlacedOrder(null)}
            />
          ) : (
            <CustomerOrderingPage
              canteen={canteen}
              menus={menus}
              queueCondition={queueCondition}
              onOrderSuccess={handleOrderSuccess}
            />
          )
        )}

        {canteen && activeTab === "queue" && (
          <QueueMonitorPage canteenId={canteen.Id} />
        )}

        {canteen && activeTab === "dashboard" && (
          <SellerDashboardPage canteenId={canteen.Id} />
        )}

        {canteen && activeTab === "menu" && (
          <MenuManagementPage
            canteenId={canteen.Id}
            menus={menus}
            onRefreshMenus={handleRefreshMenus}
          />
        )}

        {canteen && activeTab === "canteen" && (
          <CanteenQrPage
            canteen={canteen}
            onCanteenUpdated={(updated) => setCanteen(updated)}
            onOpenCustomerView={() => {
              setActivePlacedOrder(null);
              setActiveTab("order");
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          KantinQ — Sistem Pemesanan & Antrean Digital Kantin Kampus
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Tugas Besar Rekayasa Perangkat Lunak (RPL)
        </p>
      </footer>
    </div>
  );
};

export default App;
