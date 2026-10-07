import React, { useState } from "react";
import { OrderResponse, OrderStatus } from "@kantinq/shared";
import { StatusBadge } from "../components/Badge";
import { ApiClient } from "../services/api";
import {
  CheckCircle,
  RefreshCw,
  Utensils,
  Receipt,
  ArrowLeft,
  Clock,
  Sparkles,
} from "lucide-react";

interface OrderConfirmationPageProps {
  order: OrderResponse;
  onBackToMenu: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order: initialOrder,
  onBackToMenu,
}) => {
  const [order, setOrder] = useState<OrderResponse>(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const updated = await ApiClient.getOrderById(order.Id);
      if (updated) {
        setOrder(updated);
      }
    } catch (err) {
      console.error("Gagal memperbarui status pesanan:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const steps = [
    { key: OrderStatus.WAITING, label: "Menunggu" },
    { key: OrderStatus.PROCESSING, label: "Diproses" },
    { key: OrderStatus.READY, label: "Siap Diambil" },
    { key: OrderStatus.COMPLETED, label: "Selesai" },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.WAITING:
        return 0;
      case OrderStatus.PROCESSING:
        return 1;
      case OrderStatus.READY:
        return 2;
      case OrderStatus.COMPLETED:
        return 3;
      default:
        return -1;
    }
  };

  const currentStep = getStepIndex(order.Status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-1">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Pesanan Berhasil Dibuat!
        </h1>
        <p className="text-sm text-slate-500">
          Simpan halaman ini untuk memantau status pembuatan makanan Anda.
        </p>
      </div>

      {/* Main Digital Ticket Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Ticket Header: Queue Number */}
        <div className="bg-linear-to-b from-orange-500 to-orange-600 text-white p-6 sm:p-8 text-center relative">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-200 block mb-1">
            Nomor Antrean Anda
          </span>
          <div className="text-5xl sm:text-6xl font-black tracking-tight my-2">
            {order.QueueNumber}
          </div>
          <p className="text-sm text-orange-100 font-medium">
            Pemesan: <span className="font-bold text-white">{order.CustomerName}</span>
          </p>

          <div className="mt-4 inline-block">
            <StatusBadge status={order.Status} size="lg" />
          </div>
        </div>

        {/* Ready Notification Callout */}
        {order.Status === OrderStatus.READY && (
          <div className="bg-emerald-500 text-white px-6 py-3 flex items-center justify-center gap-2 font-bold text-sm animate-pulse">
            <Sparkles className="w-5 h-5" />
            <span>PESANAN SIAP! Silakan ambil makanan Anda di stan kasir.</span>
          </div>
        )}

        {/* Progress Tracker */}
        {order.Status !== OrderStatus.CANCELLED && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="relative flex justify-between items-center max-w-md mx-auto">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%`,
                }}
              />

              {steps.map((s, idx) => {
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;
                return (
                  <div key={s.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-orange-600 text-white ring-4 ring-orange-200"
                          : isPassed
                          ? "bg-orange-500 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap ${
                        isCurrent
                          ? "text-orange-600 font-bold"
                          : isPassed
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ordered Items Breakdown */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Utensils className="w-4 h-4 text-orange-600" />
              <span>Detail Item yang Dipesan</span>
            </h3>

            <div className="divide-y divide-slate-100 rounded-xl bg-slate-50 p-4 border border-slate-100">
              {order.OrderItems?.map((item) => (
                <div key={item.Id} className="py-2.5 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-slate-800">{item.MenuItemName}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      ({formatRupiah(item.Price)} × {item.Quantity})
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatRupiah(item.Subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-600" />
              <div>
                <span className="text-xs font-medium text-slate-600 block">Total Pembayaran</span>
                <span className="text-xl font-extrabold text-orange-600">
                  {formatRupiah(order.TotalAmount)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                Bayar di Kasir
              </span>
            </div>
          </div>

          {/* Payment Instruction Callout */}
          <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Instruksi Pengambilan & Pembayaran:
            </span>
            <p>
              Tunjukkan nomor antrean <strong>{order.QueueNumber}</strong> saat kasir memanggil nomor Anda. Pembayaran dilakukan secara tunai atau langsung di kasir stan kantin.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Lihat Status Pesanan (Refresh)</span>
            </button>

            <button
              type="button"
              onClick={onBackToMenu}
              className="py-3 px-5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Pesan Menu Lain</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
