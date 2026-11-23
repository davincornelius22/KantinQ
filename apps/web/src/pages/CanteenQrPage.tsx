import React, { useState, useEffect } from "react";
import { Canteen, UpdateCanteenDto } from "@kantinq/shared";
import { QRCodeSVG } from "qrcode.react";
import { ApiClient } from "../services/api";
import {
  QrCode,
  Store,
  MapPin,
  Share2,
  Check,
  Printer,
  ExternalLink,
} from "lucide-react";

interface CanteenQrPageProps {
  canteen: Canteen;
  onCanteenUpdated: (updated: Canteen) => void;
  onOpenCustomerView: () => void;
}

export const CanteenQrPage: React.FC<CanteenQrPageProps> = ({
  canteen,
  onCanteenUpdated,
  onOpenCustomerView,
}) => {
  const [formData, setFormData] = useState<UpdateCanteenDto>({
    Name: canteen.Name,
    Location: canteen.Location,
    Description: canteen.Description || "",
    IsActive: canteen.IsActive,
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      Name: canteen.Name,
      Location: canteen.Location,
      Description: canteen.Description || "",
      IsActive: canteen.IsActive,
    });
  }, [canteen]);

  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168."));

  const customProductionOrigin =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_PUBLIC_URL) || "";

  const baseUrl = (import.meta as any).env?.BASE_URL || "/";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const effectiveOrigin =
    customProductionOrigin || (typeof window !== "undefined" ? window.location.origin : "");
  const orderingUrl = `${effectiveOrigin}${cleanBase}?canteenId=${canteen.Id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(orderingUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveCanteen = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await ApiClient.updateCanteen(canteen.Id, formData);
      onCanteenUpdated(updated);
      alert("Informasi stan kantin berhasil diperbarui!");
    } catch (err) {
      alert((err as Error).message || "Gagal memperbarui profil kantin");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="print:hidden">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          QR Code & Profil Stan Kantin
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cetak QR Code ini dan pasang di depan stan kantin Anda agar mahasiswa dapat memesan langsung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: QR Code Standee Card (Printable) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center space-y-6 print:border-none print:shadow-none print:w-full print:p-0">
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl flex flex-col items-center justify-center print:bg-white print:border-2 print:border-slate-800">
            <div className="flex items-center gap-2 text-orange-700 font-extrabold text-sm mb-1 uppercase tracking-wider print:text-slate-900">
              <QrCode className="w-5 h-5" />
              <span>Scan Untuk Pesan Makanan</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-4">{canteen.Name}</h2>

            {/* QR SVG */}
            <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 inline-block print:shadow-none">
              <QRCodeSVG
                value={orderingUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="text-xs text-slate-500 font-medium mt-4 print:text-slate-700">
              KantinQ Kampus • Tanpa Antre, Praktis & Cepat
            </p>
          </div>

          {/* Localhost Warning Banner if printing while on localhost */}
          {isLocalHost && !customProductionOrigin && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-left text-xs text-amber-800 print:hidden">
              <span className="font-bold block mb-0.5">⚠️ Peringatan Hostname Lokal:</span>
              Dashboard diakses via <code>{window.location.hostname}</code>. QR Code ini hanya dapat dibuka di perangkat yang berada di jaringan yang sama. Saat dideploy ke domain produksi/VPS, URL akan otomatis menyesuaikan domain publik.
            </div>
          )}

          {/* URL Box */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs text-left print:hidden">
            <span className="truncate text-slate-600 font-mono">{orderingUrl}</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print QR Code</span>
            </button>

            <button
              type="button"
              onClick={onOpenCustomerView}
              className="py-2.5 px-4 rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Uji Buka Menu</span>
            </button>
          </div>
        </div>

        {/* Right Column: Canteen Profile Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 print:hidden">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pengaturan Stan Kantin</h2>
              <p className="text-xs text-slate-500">
                Informasi ini akan dilihat mahasiswa saat membuka halaman pemesanan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCanteen} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Stan Kantin <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lokasi Stan Kantin <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.Location}
                  onChange={(e) =>
                    setFormData({ ...formData, Location: e.target.value })
                  }
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deskripsi Stan Kantin
              </label>
              <textarea
                rows={3}
                value={formData.Description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, Description: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveCheckbox"
                checked={formData.IsActive ?? true}
                onChange={(e) =>
                  setFormData({ ...formData, IsActive: e.target.checked })
                }
                className="w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500"
              />
              <label
                htmlFor="isActiveCheckbox"
                className="text-xs font-bold text-slate-700 cursor-pointer"
              >
                Status Stan Aktif (Buka dan Menerima Pesanan)
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition cursor-pointer"
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan Profil"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
