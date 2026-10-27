import React, { useState } from "react";
import { MenuItem, CreateMenuItemDto } from "@kantinq/shared";
import { ApiClient } from "../services/api";
import {
  validateMenuName,
  validateMenuPrice,
  formatRupiah,
} from "../utils/validation";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

interface MenuManagementPageProps {
  canteenId: number;
  menus: MenuItem[];
  onRefreshMenus: () => void;
}

export const MenuManagementPage: React.FC<MenuManagementPageProps> = ({
  canteenId,
  menus,
  onRefreshMenus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateMenuItemDto>({
    Name: "",
    Description: "",
    Price: 15000,
    IsAvailable: true,
  });

  // Delete Confirm State
  const [menuToDelete, setMenuToDelete] = useState<MenuItem | null>(null);

  const openCreateModal = () => {
    setEditingMenu(null);
    setFormData({
      Name: "",
      Description: "",
      Price: 15000,
      IsAvailable: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (menu: MenuItem) => {
    setEditingMenu(menu);
    setFormData({
      Name: menu.Name,
      Description: menu.Description || "",
      Price: menu.Price,
      IsAvailable: menu.IsAvailable,
    });
    setIsModalOpen(true);
  };

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nameCheck = validateMenuName(formData.Name);
    if (!nameCheck.valid) {
      setFormError(nameCheck.message);
      return;
    }

    const priceCheck = validateMenuPrice(Number(formData.Price));
    if (!priceCheck.valid) {
      setFormError(priceCheck.message);
      return;
    }

    try {
      if (editingMenu) {
        await ApiClient.updateMenuItem(editingMenu.Id, {
          Name: formData.Name.trim(),
          Description: formData.Description?.trim() || null,
          Price: Number(formData.Price),
          IsAvailable: formData.IsAvailable,
        });
      } else {
        await ApiClient.createMenuItem(canteenId, {
          Name: formData.Name.trim(),
          Description: formData.Description?.trim() || null,
          Price: Number(formData.Price),
          IsAvailable: formData.IsAvailable,
        });
      }
      setIsModalOpen(false);
      setFormError(null);
      onRefreshMenus();
    } catch (err) {
      setFormError((err as Error).message || "Gagal menyimpan menu");
    }
  };

  const handleToggleAvailability = async (menu: MenuItem) => {
    try {
      await ApiClient.toggleMenuAvailability(menu.Id, !menu.IsAvailable);
      onRefreshMenus();
    } catch (err) {
      alert((err as Error).message || "Gagal mengubah ketersediaan menu");
    }
  };

  const handleDelete = async () => {
    if (!menuToDelete) return;
    try {
      await ApiClient.deleteMenuItem(menuToDelete.Id);
      setMenuToDelete(null);
      onRefreshMenus();
    } catch (err) {
      alert((err as Error).message || "Gagal menghapus menu");
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Kelola Menu Kantin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tambah, edit, hapus, dan atur ketersediaan menu makanan & minuman.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition shadow-md shadow-orange-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Menu Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
              <tr>
                <th className="px-6 py-4">Nama Menu</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4">Ketersediaan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {menus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Belum ada menu yang didaftarkan. Klik tombol "Tambah Menu Baru" di atas.
                  </td>
                </tr>
              ) : (
                menus.map((menu) => (
                  <tr key={menu.Id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {menu.Name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                      {menu.Description || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                      {formatRupiah(menu.Price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(menu)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          menu.IsAvailable
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        }`}
                        title="Klik untuk mengubah ketersediaan"
                      >
                        {menu.IsAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersedia</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Habis</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(menu)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer"
                        title="Edit Menu"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMenuToDelete(menu)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editingMenu ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="flex items-start gap-2 p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Menu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nasi Goreng Spesial"
                  value={formData.Name}
                  onChange={(e) =>
                    setFormData({ ...formData, Name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Menu
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan bahan, tingkat pedas, dll."
                  value={formData.Description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, Description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Harga (Rupiah) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={formData.Price}
                  onChange={(e) =>
                    setFormData({ ...formData, Price: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAvailableCheckbox"
                  checked={formData.IsAvailable ?? true}
                  onChange={(e) =>
                    setFormData({ ...formData, IsAvailable: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
                />
                <label
                  htmlFor="isAvailableCheckbox"
                  className="text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Status Menu Tersedia (Dapat dipesan pelanggan)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Delete */}
      {menuToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Menu Ini?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus <strong>"{menuToDelete.Name}"</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMenuToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
