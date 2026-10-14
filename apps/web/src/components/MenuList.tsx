import React from "react";
import { MenuItem } from "@kantinq/shared";
import { Plus, Minus, Coffee } from "lucide-react";

export const MOCK_MENUS: MenuItem[] = [
  {
    Id: 1,
    CanteenId: 1,
    Name: "Nasi Goreng Spesial",
    Description: "Nasi goreng lezat dengan telur mata sapi, suwiran ayam, dan kerupuk renyah.",
    Price: 15000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 2,
    CanteenId: 1,
    Name: "Ayam Geprek Sambal Bawang",
    Description: "Ayam krispi gurih dengan ulekan sambal bawang pedas dan nasi putih hangat.",
    Price: 16000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 3,
    CanteenId: 1,
    Name: "Mie Ayam Pangsit",
    Description: "Mie kenyal berbumbu gurih dengan topping ayam manis dan 2 pangsit basah.",
    Price: 13000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 4,
    CanteenId: 1,
    Name: "Es Teh Manis Jumbo",
    Description: "Teh melati segar dengan gula tebu asli dan es batu melimpah.",
    Price: 4000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 5,
    CanteenId: 1,
    Name: "Jus Alpukat Kocok",
    Description: "Jus alpukat mentega segar kental dengan krimer cokelat manis.",
    Price: 10000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 6,
    CanteenId: 1,
    Name: "Nasi Uduk Komplit",
    Description: "Nasi gurih harum dengan bihun, tempe orek, dan telur dadar iris.",
    Price: 14000,
    IsAvailable: false,
    CreatedAt: new Date().toISOString(),
  },
];

export interface MenuListProps {
  menus?: MenuItem[];
  onAddToCart?: (menu: MenuItem) => void;
  cartQuantities?: Record<number, number>;
  onUpdateQuantity?: (menuId: number, delta: number) => void;
}

export const MenuList: React.FC<MenuListProps> = ({
  menus = MOCK_MENUS,
  onAddToCart,
  cartQuantities = {},
  onUpdateQuantity,
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (menus.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
        <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-semibold">Tidak ada menu yang sesuai</p>
        <p className="text-slate-400 text-sm mt-1">Coba kata kunci pencarian yang lain.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {menus.map((menu) => {
        const quantity = cartQuantities[menu.Id] || 0;
        const isAvailable = menu.IsAvailable;

        return (
          <div
            key={menu.Id}
            className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
              isAvailable
                ? "border-slate-200 hover:border-orange-300 hover:shadow-md"
                : "border-slate-200 bg-slate-50/70 opacity-60"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {menu.Name}
                </h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isAvailable
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isAvailable ? "Tersedia" : "Habis"}
                </span>
              </div>

              {menu.Description && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {menu.Description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
              <div className="font-extrabold text-orange-600 text-base sm:text-lg">
                {formatRupiah(menu.Price)}
              </div>

              {isAvailable ? (
                quantity > 0 && onUpdateQuantity ? (
                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(menu.Id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-orange-700 shadow-xs hover:bg-orange-600 hover:text-white transition-colors cursor-pointer"
                      aria-label={`Kurangi ${menu.Name}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-orange-950">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(menu.Id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-orange-700 shadow-xs hover:bg-orange-600 hover:text-white transition-colors cursor-pointer"
                      aria-label={`Tambah ${menu.Name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(menu)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition shadow-xs cursor-pointer active:scale-95"
                    aria-label={`Pilih ${menu.Name}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-400 text-xs font-medium cursor-not-allowed"
                >
                  Stok Habis
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
