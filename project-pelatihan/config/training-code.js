window.TRAINING_PREFIX_MAP = {
  "FRESH TRAINING": "F",
  "SKILL UP EGI": "S",
  "SKILL UP NON-EGI": "C",
  "REFRESH TRAINING": "R",
  "SIMILAR TRAINING": "M",
  "NEW PRODUCT SERIES TRAINING": "N",
  "EXPERIENTIAL LEARNING": "E"
};

window.normalizeDateOnly = function (value) {
  if (!value) return "";
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

window.getYearShortFromIso = function (value) {
  if (!value) return "";
  const d = new Date(value);
  return String(d.getFullYear()).slice(-2);
};

window.getTrainingPrefix = function (jenisPelatihanUnit) {
  if (!jenisPelatihanUnit) return "";
  const key = String(jenisPelatihanUnit).trim().toUpperCase();
  return window.TRAINING_PREFIX_MAP[key] || "";
};

window.padTrainingBatch = function (batchNumber) {
  return String(batchNumber).padStart(3, "0");
};

window.isTrainingUnitCategory = function (kategoriPelatihan) {
  return String(kategoriPelatihan || "").trim().toUpperCase() === "TRAINING UNIT";
};

window.generateTrainingCodeForSubmission = async function (submission) {
  if (!submission) {
    throw new Error("Submission tidak ditemukan.");
  }

  if (!window.isTrainingUnitCategory(submission.kategori_pelatihan)) {
    return null;
  }

  const prefix = window.getTrainingPrefix(submission.jenis_pelatihan_unit);
  const groupEgi = String(submission.group_egi || "").trim().toUpperCase();
  const finalSubmittedAt = submission.final_submitted_at || new Date().toISOString();

  if (!prefix) {
    throw new Error("Prefix training tidak ditemukan dari jenis pelatihan unit.");
  }

  if (!groupEgi) {
    throw new Error("Group EGI belum tersedia.");
  }

  const finalSubmitDateOnly = window.normalizeDateOnly(finalSubmittedAt);
  const yearShort = window.getYearShortFromIso(finalSubmittedAt);

  // ambil semua submission training unit yang sudah punya training_code
  // dengan kombinasi pelatihan unit + group egi yang sama
  const { data, error } = await window.sb
    .from("training_submissions")
    .select(`
      id,
      kategori_pelatihan,
      jenis_pelatihan_unit,
      group_egi,
      final_submitted_at,
      training_code
    `)
    .eq("kategori_pelatihan", "TRAINING UNIT")
    .eq("jenis_pelatihan_unit", submission.jenis_pelatihan_unit)
    .eq("group_egi", submission.group_egi)
    .not("training_code", "is", null);

  if (error) {
    throw error;
  }

  const rows = data || [];

  // aturan:
  // kalau tanggal final submit sama + pelatihan sama + group sama,
  // maka semua peserta pakai batch yang sama
  const sameBatchRow = rows.find(item => {
    if (!item.final_submitted_at) return false;
    const itemDateOnly = window.normalizeDateOnly(item.final_submitted_at);
    return itemDateOnly === finalSubmitDateOnly;
  });

  if (sameBatchRow && sameBatchRow.training_code) {
    return sameBatchRow.training_code;
  }

  // kalau belum ada batch di tanggal itu,
  // hitung jumlah tanggal unik di tahun yang sama untuk kombinasi tersebut
  const uniqueDatesInSameYear = new Set();

  rows.forEach(item => {
    if (!item.final_submitted_at) return;

    const itemYearShort = window.getYearShortFromIso(item.final_submitted_at);
    if (itemYearShort !== yearShort) return;

    uniqueDatesInSameYear.add(window.normalizeDateOnly(item.final_submitted_at));
  });

  const nextBatchNumber = uniqueDatesInSameYear.size + 1;
  const batchCode = window.padTrainingBatch(nextBatchNumber);

  return `${prefix}${groupEgi}${yearShort}${batchCode}`;
};
