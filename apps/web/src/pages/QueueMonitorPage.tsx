import React, { useEffect, useState } from "react";
import { QueueResponse, OrderStatus } from "@kantinq/shared";
import { ApiClient } from "../services/api";
import { QueueConditionBadge, StatusBadge } from "../components/Badge";
import { Users, Clock, Flame, CheckCircle, RefreshCw } from "lucide-react";

interface QueueMonitorPageProps {
  canteenId: number;
}

export const QueueMonitorPage: React.FC<QueueMonitorPageProps> = ({ canteenId }) => {
  const [queueData, setQueueData] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const data = await ApiClient.getQueue(canteenId);
      setQueueData(data);
    } catch (err) {
      console.error("Gagal mengambil data antrean:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [canteenId]);

  if (loading && !queueData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-600" />
        <p>Memuat papan antrean digital...</p>
      </div>
    );
  }

  const waitingOrders =
    queueData?.QueueList.filter((o) => o.Status === OrderStatus.WAITING) || [];
  const processingOrders =
    queueData?.QueueList.filter((o) => o.Status === OrderStatus.PROCESSING) || [];
  const readyOrders =
    queueData?.QueueList.filter((o) => o.Status === OrderStatus.READY) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Papan Informasi Antrean Real-Time</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Antrean {queueData?.CanteenName || "Kantin"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Nomor antrean diperbarui otomatis setiap 5 detik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Kondisi Stan</span>
            {queueData && (
              <QueueConditionBadge condition={queueData.Condition} size="lg" />
            )}
          </div>
          <div className="border-l border-slate-700 pl-4">
            <span className="text-xs text-slate-400 block mb-0.5">Total Antrean Aktif</span>
            <span className="text-3xl font-black text-white">
              {queueData?.ActiveCount ?? 0}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchQueue}
            className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition cursor-pointer"
            title="Segarkan data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Column Digital Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom 1: Menunggu */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-amber-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-lg">
              <Clock className="w-5 h-5" />
              <span>Menunggu</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
              {waitingOrders.length} antrean
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 bg-amber-50/20 max-h-[600px] overflow-y-auto">
            {waitingOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Tidak ada pesanan menunggu
              </div>
            ) : (
              waitingOrders.map((order) => (
                <div
                  key={order.Id}
                  className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <span className="text-2xl font-black text-slate-900 block tracking-tight">
                      {order.QueueNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {order.CustomerName}
                    </span>
                  </div>
                  <StatusBadge status={order.Status} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Sedang Diproses */}
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-lg">
              <Flame className="w-5 h-5" />
              <span>Sedang Diproses</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
              {processingOrders.length} antrean
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 bg-blue-50/20 max-h-[600px] overflow-y-auto">
            {processingOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Belum ada pesanan yang sedang dimasak
              </div>
            ) : (
              processingOrders.map((order) => (
                <div
                  key={order.Id}
                  className="bg-white rounded-xl p-4 border border-blue-200 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <span className="text-2xl font-black text-blue-900 block tracking-tight">
                      {order.QueueNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {order.CustomerName}
                    </span>
                  </div>
                  <StatusBadge status={order.Status} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 3: Siap Diambil */}
        <div className="bg-white rounded-2xl border-2 border-emerald-400 shadow-lg overflow-hidden flex flex-col">
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-lg">
              <CheckCircle className="w-5 h-5" />
              <span>Siap Diambil</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
              {readyOrders.length} siap!
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 bg-emerald-50/30 max-h-[600px] overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Belum ada pesanan siap
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.Id}
                  className="bg-white rounded-xl p-4 border-2 border-emerald-400 shadow-sm flex items-center justify-between ring-2 ring-emerald-100"
                >
                  <div>
                    <span className="text-3xl font-black text-emerald-700 block tracking-tight">
                      {order.QueueNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {order.CustomerName}
                    </span>
                  </div>
                  <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                    PANGGIL KASIR
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
