import React, { useState } from "react";
import {
  Canteen,
  MenuItem,
  QueueCondition,
  OrderResponse,
} from "@kantinq/shared";
import { ApiClient } from "../services/api";
import { QueueConditionBadge } from "../components/Badge";
import { MenuList } from "../components/MenuList";
import {
  MapPin,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface CustomerOrderingPageProps {
  canteen: Canteen;
  menus: MenuItem[];
  queueCondition: QueueCondition;
  onOrderSuccess: (order: OrderResponse) => void;
}

interface CartItem {
  menu: MenuItem;
  quantity: number;
}

export const CustomerOrderingPage: React.FC<CustomerOrderingPageProps> = ({
  canteen,
  menus,
  queueCondition,
  onOrderSuccess,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addToCart = (menu: MenuItem) => {
    if (!menu.IsAvailable) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.menu.Id === menu.Id);
      if (existing) {
        return prev.map((item) =>
          item.menu.Id === menu.Id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menu, quantity: 1 }];
    });
  };

  const updateQuantity = (menuId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.menu.Id === menuId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (menuId: number) => {
    setCart((prev) => prev.filter((item) => item.menu.Id !== menuId));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.menu.Price * item.quantity,
    0
  );

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage("Silakan masukkan nama pemesan terlebih dahulu");
      return;
    }

    if (cart.length === 0) {
      setErrorMessage("Keranjang pesanan masih kosong");
      return;
    }

    try {
      setIsSubmitting(true);
      const newOrder = await ApiClient.createOrder(canteen.Id, {
        CustomerName: customerName.trim(),
        Items: cart.map((item) => ({
          MenuItemId: item.menu.Id,
          Quantity: item.quantity,
        })),
      });

      setCart([]);
      setCustomerName("");
      onOrderSuccess(newOrder);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Gagal membuat pesanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredMenus = menus.filter(
    (m) =>
      m.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.Description &&
        m.Description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Canteen Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {canteen.Name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Buka
              </span>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-slate-600 mb-2">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <span>{canteen.Location}</span>
            </p>
            {canteen.Description && (
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                {canteen.Description}
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:items-end justify-center gap-1">
            <span className="text-xs font-medium text-slate-500">
              Kondisi Antrean Saat Ini:
            </span>
            <QueueConditionBadge condition={queueCondition} size="md" />
            <span className="text-[11px] text-slate-400 mt-0.5">
              Pesan sekarang agar segera diproses penjual
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Menu list on Left (col 8) + Cart on Right (col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Menu Items */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Daftar Menu Kantin</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                {filteredMenus.length} Menu
              </span>
            </h2>
            <input
              type="text"
              placeholder="Cari makanan atau minuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-64"
            />
          </div>

          <MenuList
            menus={filteredMenus}
            onAddToCart={addToCart}
            cartQuantities={cart.reduce<Record<number, number>>((acc, item) => {
              acc[item.menu.Id] = item.quantity;
              return acc;
            }, {})}
            onUpdateQuantity={updateQuantity}
          />
        </div>

        {/* Right Column: Shopping Cart & Order Form */}
        <div className="lg:col-span-4 sticky top-20">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <span className="text-base">Keranjang Pesanan</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                {totalItemsCount} item
              </span>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Keranjang masih kosong</p>
                <p className="text-xs mt-1">Pilih menu di sebelah kiri untuk memesan.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.menu.Id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-900 truncate">
                        {item.menu.Name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatRupiah(item.menu.Price)} x {item.quantity} ={" "}
                        <span className="font-semibold text-slate-700">
                          {formatRupiah(item.menu.Price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.menu.Id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.menu.Id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.menu.Id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-rose-500 hover:bg-rose-50 ml-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Section */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal ({totalItemsCount} item)</span>
                <span>{formatRupiah(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Pembayaran</span>
                <span className="text-orange-600">{formatRupiah(totalAmount)}</span>
              </div>
            </div>

            {/* Customer Form */}
            <form onSubmit={handleCreateOrder} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pemesan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi (NIM / Meja)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Petunjuk Pembayaran</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Pembayaran dilakukan secara langsung di kasir stan saat pesanan diambil.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Buat Pesanan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
