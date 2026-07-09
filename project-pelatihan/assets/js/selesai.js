document.addEventListener("DOMContentLoaded", function () {
  const draft = loadDraft();

  if (!draft) {
    window.location.href = "index.html";
    return;
  }

  const nama = draft.namaLengkap || "-";
  const nrp = draft.nrp || "-";
  const pelatihanLengkap = buildPelatihanLengkap(draft);

  document.getElementById("successIntro").textContent =
    `Terima Kasih, ${nama} (${nrp}).`;

  document.getElementById("successPelatihan").textContent =
    `Selamat mengikuti pelatihan ${pelatihanLengkap}.`;

  document.getElementById("successWaktuSubmit").textContent =
    `Waktu Submit: ${formatTanggalWaktu(draft.finalSubmittedAt)}`;
});

const DRAFT_KEY = "pesertaDraft";

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
}

function buildPelatihanLengkap(data) {
  const kategori = data.kategoriPelatihan || "";

  if (kategori === "TRAINING UNIT") {
    const jenis = (data.jenisPelatihanUnit || "").trim();
    const groupInfo = getGroupInfo(data.groupEgi);
    const unit = (groupInfo?.unit || "").trim();
    const unitTypes = Array.isArray(data.unitTypes) && data.unitTypes.length
      ? data.unitTypes.join(", ")
      : "";

    return [jenis, unit, unitTypes].filter(Boolean).join(" ") || "-";
  }

  if (kategori === "TRAINING TEKNIKAL PENGAWAS/GL") {
    const jenis = (data.jenisPelatihanTeknikal || "").trim();
    const kelas = (data.kelasTeknikal || "").trim();
    return [jenis, kelas].filter(Boolean).join(" ") || "-";
  }

  return "-";
}

function getGroupInfo(code) {
  return (window.PELATIHAN_DATA || []).find((item) => item.code === code) || null;
}

function formatTanggalWaktu(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  const pad = (num) => String(num).padStart(2, "0");

  const tanggal = pad(date.getDate());
  const bulan = pad(date.getMonth() + 1);
  const tahun = date.getFullYear();
  const jam = pad(date.getHours());
  const menit = pad(date.getMinutes());

  return `${tanggal}-${bulan}-${tahun} ${jam}:${menit}`;
}
