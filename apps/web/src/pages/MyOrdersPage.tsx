import React, { useState } from "react";
import { OrderResponse } from "@kantinq/shared";
import { StatusBadge } from "../components/Badge";
import { ApiClient } from "../services/api";
import { formatRupiah, formatDate } from "../utils/validation";
import {
  Receipt,
  Clock,
  Trash2,
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface MyOrdersPageProps {
  orders: OrderResponse[];
  onClearHistory: () => void;
  onViewOrderDetail: (order: OrderResponse) => void;
  onUpdateOrders?: (orders: OrderResponse[]) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({
  orders,
  onClearHistory,
  onViewOrderDetail,
  onUpdateOrders,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSyncStatuses = async () => {
    if (orders.length === 0) return;
    try {
      setIsSyncing(true);
      const updatedList = await Promise.all(
        orders.map(async (o) => {
          try {
            const fresh = await ApiClient.getOrderById(o.Id);
            return fresh || o;
          } catch {
            return o;
          }
        })
      );
      if (onUpdateOrders) {
        onUpdateOrders(updatedList);
      }
      setSyncFeedback("Status pesanan berhasil diperbarui!");
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch {
      setSyncFeedback("Gagal memperbarui beberapa status pesanan.");
      setTimeout(() => setSyncFeedback(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">
          Belum Ada Riwayat Pesanan
        </h2>
        <p className="text-sm text-slate-500">
          Pesanan yang Anda buat akan muncul di sini. Mulai pesan dari tab "Pesan Menu".
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Pesanan Saya
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {orders.length} pesanan tersimpan di perangkat ini
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncStatuses}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Segarkan Status</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm("Hapus semua riwayat pesanan di perangkat ini?")) {
                onClearHistory();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Riwayat</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <button
            key={order.Id}
            type="button"
            onClick={() => onViewOrderDetail(order)}
            className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-orange-300 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-orange-100/70 border border-orange-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-orange-700 uppercase">
                    Antrean
                  </span>
                  <span className="text-lg font-black text-orange-950">
                    {order.QueueNumber}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {order.CustomerName}
                    </span>
                    <StatusBadge status={order.Status} size="sm" />
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{formatDate(order.CreatedAt)}</span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-1 text-xs text-slate-600">
                    {order.OrderItems?.slice(0, 3).map((item) => (
                      <span
                        key={item.Id}
                        className="bg-slate-100 px-2 py-0.5 rounded-md font-medium"
                      >
                        {item.MenuItemName}{" "}
                        <strong className="text-slate-900">
                          x{item.Quantity}
                        </strong>
                      </span>
                    ))}
                    {(order.OrderItems?.length || 0) > 3 && (
                      <span className="text-slate-400 font-medium">
                        +{(order.OrderItems?.length || 0) - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-orange-600">
                  <Receipt className="w-3.5 h-3.5" />
                  <span className="font-extrabold text-sm">
                    {formatRupiah(order.TotalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
