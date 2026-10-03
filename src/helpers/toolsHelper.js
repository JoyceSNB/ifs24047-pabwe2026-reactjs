// SweetAlert2 dimuat saat dialog pertama kali dibutuhkan (lazy load),
// supaya tidak memperbesar JavaScript awal halaman.
let swalPromise = null;

function loadSwal() {
  if (!swalPromise) {
    swalPromise = import("sweetalert2").then((module) => module.default);
  }
  return swalPromise;
}

async function showInfoDialog(options) {
  const Swal = await loadSwal();
  const result = await Swal.fire({ confirmButtonText: "Tutup", ...options });
  if (result.isConfirmed) {
    Swal.close();
  }
  return result;
}

export function showErrorDialog(message) {
  return showInfoDialog({
    title: "Terjadi Kesalahan",
    text: message,
    icon: "error",
    confirmButtonColor: "#ef4444",
  });
}

export function showWarningDialog(message) {
  return showInfoDialog({
    title: "Peringatan",
    text: message,
    icon: "warning",
    confirmButtonColor: "#f59e0b",
  });
}

export function showSuccessDialog(message) {
  return showInfoDialog({
    title: "Tindakan Berhasil",
    text: message,
    icon: "success",
    confirmButtonColor: "#10b981",
  });
}

export async function showConfirmDialog(message) {
  const Swal = await loadSwal();
  return Swal.fire({
    title: "Konfirmasi",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    confirmButtonColor: "#0f766e",
    cancelButtonColor: "#64748b",
  });
}

export function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format tanggal pendek untuk kartu, contoh: "28 Feb 2024"
export function formatShortDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Format waktu untuk parameter API statistik, contoh: "2024-10-05 22:00:00"
export function toApiDateTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

// Alamat server Delcom, tempat semua foto (cover & avatar) disimpan.
const DELCOM_ORIGIN = "https://open-api.delcom.org";

// API bisa mengembalikan path relatif (img/lost-founds/cover/..., default/img/user.png)
// atau URL penuh. Path relatif selalu diarahkan ke server Delcom, bukan ke domain web ini,
// supaya tidak tertukar dengan halaman aplikasi (Vercel mengembalikan index.html untuk
// path yang tidak dikenal).
export function toImageUrl(path) {
  if (!path) return null;
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return `${DELCOM_ORIGIN}/${path.replace(/^\/+/, "")}`;
}

// URL foto yang dikecilkan oleh Vercel Image Optimization (hanya di produksi).
// Di luar produksi, atau untuk foto di luar server Delcom, kembali ke URL asli.
export function toOptimizedImageUrl(path, width = 828) {
  if (!path) return null;
  if (!import.meta.env.PROD) return toImageUrl(path);

  const absolute = toImageUrl(path);
  if (!absolute.startsWith(`${DELCOM_ORIGIN}/`)) return absolute;

  return `/_vercel/image?url=${encodeURIComponent(absolute)}&w=${width}&q=75`;
}