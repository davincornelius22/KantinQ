import React, { useEffect, useState } from "react";
import {
  DashboardResponse,
  OrderResponse,
  OrderStatus,
} from "@kantinq/shared";
import { ApiClient } from "../services/api";
import { StatusBadge, QueueConditionBadge } from "../components/Badge";
import {
  ShoppingBag,
  Clock,
  Flame,
  CheckCircle,
  CheckCheck,
  Coins,
  RefreshCw,
  Ban,
  ArrowRight,
  History,
  ListOrdered,
} from "lucide-react";

interface SellerDashboardPageProps {
  canteenId: number;
}

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({ canteenId }) => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [historyOrders, setHistoryOrders] = useState<OrderResponse[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      const data = await ApiClient.getDashboard(canteenId);
      setDashboard(data);
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const hist = await ApiClient.getOrderHistory(canteenId);
      setHistoryOrders(hist);
    } catch (err) {
      console.error("Gagal mengambil riwayat pesanan:", err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchDashboardData(), fetchHistoryData()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(fetchDashboardData, 6000);
    return () => clearInterval(interval);
  }, [canteenId]);

  const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      setActionLoadingId(orderId);
      await ApiClient.updateOrderStatus(orderId, nextStatus);
      await fetchDashboardData();
      if (nextStatus === OrderStatus.COMPLETED || nextStatus === OrderStatus.CANCELLED) {
        await fetchHistoryData();
      }
    } catch (err) {
      alert((err as Error).message || "Gagal mengubah status pesanan");
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatTime = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Dashboard Penjual
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau arus pesanan, kelola antrean dapur, dan pantau omset harian kantin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dashboard && (
            <QueueConditionBadge condition={dashboard.QueueCondition} size="md" />
          )}
          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Pesanan Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pesanan Hari Ini</span>
            <ShoppingBag className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {dashboard?.TotalOrdersToday ?? 0}
          </div>
        </div>

        {/* Menunggu */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">Menunggu</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {dashboard?.WaitingOrders ?? 0}
          </div>
        </div>

        {/* Diproses */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-semibold">Diproses</span>
            <Flame className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {dashboard?.ProcessingOrders ?? 0}
          </div>
        </div>

        {/* Siap Diambil */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">Siap Diambil</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {dashboard?.ReadyOrders ?? 0}
          </div>
        </div>

        {/* Selesai */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold">Selesai</span>
            <CheckCheck className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-700">
            {dashboard?.CompletedOrders ?? 0}
          </div>
        </div>

        {/* Pendapatan Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-xs bg-linear-to-b from-orange-50/50 to-white">
          <div className="flex items-center justify-between text-orange-800 mb-2">
            <span className="text-xs font-semibold">Pendapatan Hari Ini</span>
            <Coins className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-orange-600 truncate">
            {formatRupiah(dashboard?.TotalRevenueToday ?? 0)}
          </div>
        </div>
      </div>

      {/* Tabs: Pesanan Aktif vs Riwayat */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-3 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "active"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Pesanan Aktif ({dashboard?.ActiveOrders.length ?? 0})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("history");
                fetchHistoryData();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "history"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Selesai & Dibatalkan ({historyOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Active Orders List */}
        {activeTab === "active" && (
          <div className="p-4 sm:p-6">
            {!dashboard || dashboard.ActiveOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                <p className="text-base font-bold text-slate-700">
                  Tidak ada pesanan aktif saat ini
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Semua pesanan yang masuk telah selesai diproses!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.ActiveOrders.map((order) => {
                  const isLoadingThis = actionLoadingId === order.Id;

                  return (
                    <div
                      key={order.Id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-orange-200 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      {/* Left: Queue Number & Customer */}
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-orange-100/70 border border-orange-200 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-orange-700 uppercase">
                            Antrean
                          </span>
                          <span className="text-xl font-black text-orange-950">
                            {order.QueueNumber}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-base">
                              {order.CustomerName}
                            </span>
                            <span className="text-xs text-slate-400">
                              • {formatTime(order.CreatedAt)}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-slate-600">
                            {order.OrderItems?.map((item) => (
                              <span
                                key={item.Id}
                                className="bg-slate-100 px-2 py-0.5 rounded-md font-medium"
                              >
                                {item.MenuItemName} <strong className="text-slate-900">x{item.Quantity}</strong>
                              </span>
                            ))}
                          </div>

                          <div className="text-xs font-bold text-orange-600 mt-1.5">
                            Total: {formatRupiah(order.TotalAmount)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <StatusBadge status={order.Status} size="md" />

                        {/* Transition actions */}
                        {order.Status === OrderStatus.WAITING && (
                          <button
                            type="button"
                            disabled={isLoadingThis}
                            onClick={() =>
                              handleUpdateStatus(order.Id, OrderStatus.PROCESSING)
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Proses Pesanan</span>
                          </button>
                        )}

                        {order.Status === OrderStatus.PROCESSING && (
                          <button
                            type="button"
                            disabled={isLoadingThis}
                            onClick={() =>
                              handleUpdateStatus(order.Id, OrderStatus.READY)
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Pesanan Siap</span>
                          </button>
                        )}

                        {order.Status === OrderStatus.READY && (
                          <button
                            type="button"
                            disabled={isLoadingThis}
                            onClick={() =>
                              handleUpdateStatus(order.Id, OrderStatus.COMPLETED)
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Selesaikan</span>
                          </button>
                        )}

                        {(order.Status === OrderStatus.WAITING ||
                          order.Status === OrderStatus.PROCESSING) && (
                          <button
                            type="button"
                            disabled={isLoadingThis}
                            onClick={() => {
                              if (confirm(`Batalkan pesanan ${order.QueueNumber} (${order.CustomerName})?`)) {
                                handleUpdateStatus(order.Id, OrderStatus.CANCELLED);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                            title="Batalkan pesanan"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Batalkan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="p-4 sm:p-6">
            {historyOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-base font-bold text-slate-700">
                  Belum ada riwayat pesanan
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Pesanan yang diselesaikan atau dibatalkan akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {historyOrders.map((order) => (
                  <div
                    key={order.Id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {order.QueueNumber}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-medium text-slate-800 text-sm">
                          {order.CustomerName}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({formatTime(order.CreatedAt)})
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Total: {formatRupiah(order.TotalAmount)} •{" "}
                        {order.OrderItems?.map((i) => `${i.MenuItemName} x${i.Quantity}`).join(", ")}
                      </div>
                    </div>

                    <div>
                      <StatusBadge status={order.Status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
