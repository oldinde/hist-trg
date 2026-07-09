document.addEventListener("DOMContentLoaded", function () {
  setCurrentYearToPeriodeTahun();
  initKategoriPelatihan();
  initWaliKelasOptions();
  initPerusahaanOptions();
  initRiwayatPelatihan();
  initPengalamanKerja();
  restoreDraftToForm();
  initSimperToggle();
  initRealtimeValidationClear();
  initFormSubmit();
});

const DRAFT_KEY = "pesertaDraft";
const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const DEFAULT_PERUSAHAAN = "PT. KALIMANTAN PRIMA PERSADA / INDE";
const DEFAULT_ALAMAT_PERUSAHAAN = "PENGADAN, KUTAI TIMUR";

const WALI_KELAS_UNIT = [
  "ABDUL RAHMAN",
  "ADI KURNIAWAN",
  "AGUS PRAYITNO",
  "AGUS PRIATNO",
  "AHMAD AMAANULLAH ROBBANI",
  "AMIRUDIN",
  "ANGGA YULIYANTO YUSMAN",
  "ARI MARYANTO",
  "AS'AD MUJAYIT",
  "BAMBANG RUDIYANTO",
  "BAMBANG SUTIKNO",
  "BAYU HUTOMO",
  "BUDI SANTOSO",
  "DEDI SHANDRA",
  "DWI HARIYANTO",
  "DWI MUH BAHTIAR",
  "DWI PRASETIYO",
  "EKO SUSANTO",
  "ERIK FERNANDO",
  "FATHIA NAFIGHANI",
  "FERDIAN NUGROHO",
  "GALIH CHANDRA PRATAMA",
  "HERMANTINU PAMBUDI",
  "IHSANURFAJRI RAZANIL",
  "IRFAN WIJAYA",
  "JAUHAR MUSTAFA ALFAUZI",
  "JOHAN LESMANA PUTRA",
  "KASIADI",
  "KURNIAWAN SIDIX",
  "M ANGGI SANTOSO",
  "MARTA ARI PRASTYA",
  "MIFTACHUL ANIF",
  "MOCHAMAD YUSUF T. U.",
  "MOHAMAD SUBHAN",
  "MUALIQ RIZAL BAHARI",
  "MUCH FATIH MADCHAN",
  "MUHAMMAD AGUS WINURSITO",
  "MUHAMMAD CHOLID FATHONI",
  "MUHAMMAD KAISA ELMIZAN",
  "MUJIADI",
  "MUNAJIB SAFARI",
  "NANANG MAHMUDI",
  "NANANG MUHAMAD SULKHAN",
  "NOVI PRASTYAWAN",
  "NURUL NAFIUDIN",
  "OCKY ARIE NUGROHO",
  "RISDIANA FENI",
  "RUDI SAPUTRA",
  "RUNTUT SUSILO",
  "SAHRUR ROJI",
  "SETIAWAN AL FAUZI",
  "SIAM SETIYADI",
  "SUDARYADI",
  "SUGENG RIANTO",
  "SUHERMAN",
  "TRI WAHYU UTOMO",
  "TRIYONO",
  "UNTORO",
  "WISNU MUSLIMIN",
  "ZAZATULLOH"
];

const WALI_KELAS_TEKNIKAL = [
  "ABDUL RAHMAN",
  "ALLIYA NUR AZIZAH PURNOMO ADI",
  "ARI MARYANTO",
  "DEBBI KURNIAWAN",
  "KASIADI",
  "MUHAMMAD KAISA ELMIZAN",
  "NIGEL TRI ANGRAINI",
  "RISDIANA FENI",
  "WESTIA ALIFAH SURYA PRATIWI"
];

function saveDraft(data) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
}

// ====== TAMBAHAN (UPLOAD + SANITIZE) ======
function sanitizeFileName(name = "") {
  return String(name)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
}

async function uploadToBucket(bucket, path, file) {
  const { error } = await window.supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: false,
      contentType: file.type
    });

  if (error) throw error;
  return path;
}
// =========================================

function setCurrentYearToPeriodeTahun() {
  const periodeTahun = document.getElementById("periodeTahun");
  if (!periodeTahun) return;

  const currentYear = new Date().getFullYear();
  if (!periodeTahun.value) {
    periodeTahun.value = currentYear;
  }
}

function initWaliKelasOptions() {
  fillSelectOptions("waliKelasUnit", WALI_KELAS_UNIT, "PILIH WALI KELAS / PENGAJAR");
  fillSelectOptions("waliKelasTeknikal", WALI_KELAS_TEKNIKAL, "PILIH WALI KELAS");
}

function fillSelectOptions(selectId, options, firstLabel) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = `<option value="">${firstLabel}</option>`;
  options.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
}

function initPerusahaanOptions() {
  const select = document.getElementById("namaPerusahaanPilihan");
  if (!select) return;

  select.addEventListener("change", updatePerusahaanView);
  updatePerusahaanView();
}

function updatePerusahaanView() {
  const pilihan = document.getElementById("namaPerusahaanPilihan")?.value || "";
  const namaLainnyaWrapper = document.getElementById("namaPerusahaanLainnyaWrapper");
  const namaLainnyaInput = document.getElementById("namaPerusahaanLainnya");
  const alamatInput = document.getElementById("alamatPerusahaan");

  if (!alamatInput) return;

  if (pilihan === DEFAULT_PERUSAHAAN) {
    if (namaLainnyaWrapper) namaLainnyaWrapper.style.display = "none";
    if (namaLainnyaInput) namaLainnyaInput.value = "";

    alamatInput.value = DEFAULT_ALAMAT_PERUSAHAAN;
    alamatInput.readOnly = true;

    clearSingleFieldError("namaPerusahaanLainnya");
    clearSingleFieldError("alamatPerusahaan");
  } else if (pilihan === "LAINNYA") {
    if (namaLainnyaWrapper) namaLainnyaWrapper.style.display = "flex";
    alamatInput.readOnly = false;
    alamatInput.value = alamatInput.dataset.manualValue || "";

    clearSingleFieldError("namaPerusahaanLainnya");
    clearSingleFieldError("alamatPerusahaan");
  } else {
    if (namaLainnyaWrapper) namaLainnyaWrapper.style.display = "none";
    if (namaLainnyaInput) namaLainnyaInput.value = "";

    alamatInput.readOnly = false;
    alamatInput.value = "";

    clearSingleFieldError("namaPerusahaanLainnya");
    clearSingleFieldError("alamatPerusahaan");
  }
}

function initKategoriPelatihan() {
  const kategori = document.getElementById("kategoriPelatihan");
  if (!kategori) return;

  kategori.addEventListener("change", updateKategoriPelatihanView);
  updateKategoriPelatihanView();
}

function updateKategoriPelatihanView() {
  const kategori = document.getElementById("kategoriPelatihan")?.value || "";

  const jenisUnitWrapper = document.getElementById("jenisPelatihanUnitWrapper");
  const jenisTeknikalWrapper = document.getElementById("jenisPelatihanTeknikalWrapper");
  const groupEgiWrapper = document.getElementById("groupEgiWrapper");
  const kelasTeknikalWrapper = document.getElementById("kelasTeknikalWrapper");
  const unitTypeSectionWrapper = document.getElementById("unitTypeSectionWrapper");
  const waliKelasUnitWrapper = document.getElementById("waliKelasUnitWrapper");
  const waliKelasTeknikalWrapper = document.getElementById("waliKelasTeknikalWrapper");

  const jenisUnit = document.getElementById("jenisPelatihanUnit");
  const jenisTeknikal = document.getElementById("jenisPelatihanTeknikal");
  const groupEgi = document.getElementById("groupEgi");
  const kelasTeknikal = document.getElementById("kelasTeknikal");
  const waliUnit = document.getElementById("waliKelasUnit");
  const waliTeknikal = document.getElementById("waliKelasTeknikal");

  if (kategori === "TRAINING UNIT") {
    if (jenisUnitWrapper) jenisUnitWrapper.style.display = "flex";
    if (groupEgiWrapper) groupEgiWrapper.style.display = "flex";
    if (unitTypeSectionWrapper) unitTypeSectionWrapper.style.display = "flex";
    if (waliKelasUnitWrapper) waliKelasUnitWrapper.style.display = "flex";

    if (jenisTeknikalWrapper) jenisTeknikalWrapper.style.display = "none";
    if (kelasTeknikalWrapper) kelasTeknikalWrapper.style.display = "none";
    if (waliKelasTeknikalWrapper) waliKelasTeknikalWrapper.style.display = "none";

    if (jenisTeknikal) jenisTeknikal.value = "";
    if (kelasTeknikal) kelasTeknikal.value = "";
    if (waliTeknikal) waliTeknikal.value = "";

    clearSingleFieldError("jenisPelatihanTeknikal");
    clearSingleFieldError("kelasTeknikal");
    clearSingleFieldError("waliKelasTeknikal");
  } else if (kategori === "TRAINING TEKNIKAL PENGAWAS/GL") {
    if (jenisTeknikalWrapper) jenisTeknikalWrapper.style.display = "flex";
    if (kelasTeknikalWrapper) kelasTeknikalWrapper.style.display = "flex";
    if (waliKelasTeknikalWrapper) waliKelasTeknikalWrapper.style.display = "flex";

    if (jenisUnitWrapper) jenisUnitWrapper.style.display = "none";
    if (groupEgiWrapper) groupEgiWrapper.style.display = "none";
    if (unitTypeSectionWrapper) unitTypeSectionWrapper.style.display = "none";
    if (waliKelasUnitWrapper) waliKelasUnitWrapper.style.display = "none";

    if (jenisUnit) jenisUnit.value = "";
    if (groupEgi) {
      groupEgi.value = "";
      groupEgi.dispatchEvent(new Event("change"));
    }
    if (waliUnit) waliUnit.value = "";

    document.querySelectorAll('input[name="unitType"]').forEach((el) => {
      el.checked = false;
    });

    clearSingleFieldError("jenisPelatihanUnit");
    clearSingleFieldError("groupEgi");
    clearSingleFieldError("unitType");
    clearSingleFieldError("waliKelasUnit");
  } else {
    if (jenisUnitWrapper) jenisUnitWrapper.style.display = "none";
    if (jenisTeknikalWrapper) jenisTeknikalWrapper.style.display = "none";
    if (groupEgiWrapper) groupEgiWrapper.style.display = "none";
    if (kelasTeknikalWrapper) kelasTeknikalWrapper.style.display = "none";
    if (unitTypeSectionWrapper) unitTypeSectionWrapper.style.display = "none";
    if (waliKelasUnitWrapper) waliKelasUnitWrapper.style.display = "none";
    if (waliKelasTeknikalWrapper) waliKelasTeknikalWrapper.style.display = "none";

    if (jenisUnit) jenisUnit.value = "";
    if (jenisTeknikal) jenisTeknikal.value = "";
    if (groupEgi) {
      groupEgi.value = "";
      groupEgi.dispatchEvent(new Event("change"));
    }
    if (kelasTeknikal) kelasTeknikal.value = "";
    if (waliUnit) waliUnit.value = "";
    if (waliTeknikal) waliTeknikal.value = "";

    document.querySelectorAll('input[name="unitType"]').forEach((el) => {
      el.checked = false;
    });

    clearSingleFieldError("jenisPelatihanUnit");
    clearSingleFieldError("jenisPelatihanTeknikal");
    clearSingleFieldError("groupEgi");
    clearSingleFieldError("kelasTeknikal");
    clearSingleFieldError("unitType");
    clearSingleFieldError("waliKelasUnit");
    clearSingleFieldError("waliKelasTeknikal");
  }
}

function initSimperToggle() {
  const select = document.getElementById("memilikiSimper");
  const simperWrapper = document.getElementById("fileSimperWrapper");
  const minePermitWrapper = document.getElementById("fileMinePermitWrapper");
  const fileSimper = document.getElementById("fileSimper");
  const fileMinePermit = document.getElementById("fileMinePermit");

  if (!select || !simperWrapper || !minePermitWrapper) return;

  function update() {
    const value = select.value;

    if (value === "YA") {
      simperWrapper.style.display = "flex";
      minePermitWrapper.style.display = "none";
      if (fileMinePermit) fileMinePermit.value = "";
      clearSingleFieldError("fileMinePermit");
    } else if (value === "TIDAK MEMILIKI SIMPER") {
      simperWrapper.style.display = "none";
      minePermitWrapper.style.display = "flex";
      if (fileSimper) fileSimper.value = "";
      clearSingleFieldError("fileSimper");
    } else {
      simperWrapper.style.display = "none";
      minePermitWrapper.style.display = "none";
      if (fileSimper) fileSimper.value = "";
      if (fileMinePermit) fileMinePermit.value = "";
      clearSingleFieldError("fileSimper");
      clearSingleFieldError("fileMinePermit");
    }
  }

  select.addEventListener("change", update);
  update();
}

function initRiwayatPelatihan() {
  const tambahBtn = document.getElementById("tambahRiwayatBtn");
  const list = document.getElementById("riwayatPelatihanList");

  if (!tambahBtn || !list) return;

  if (!list.children.length) addRiwayatPelatihanItem();

  tambahBtn.addEventListener("click", function () {
    addRiwayatPelatihanItem();
  });
}

function addRiwayatPelatihanItem(data = {}) {
  const list = document.getElementById("riwayatPelatihanList");
  if (!list) return;

  const index = list.children.length + 1;
  const card = document.createElement("div");
  card.className = "repeat-card";
  card.innerHTML = `
    <div class="repeat-card-header">
      <h3 class="repeat-card-title">Riwayat Pelatihan ${index}</h3>
      <button type="button" class="btn-danger remove-riwayat-btn">Hapus</button>
    </div>
    <div class="repeat-card-grid">
      <div class="form-group">
        <label>Nama Pelatihan</label>
        <input type="text" name="riwayatNamaPelatihan[]" value="${escapeAttr(data.namaPelatihan || "")}" />
      </div>
      <div class="form-group">
        <label>Lembaga Pelatihan</label>
        <input type="text" name="riwayatLembagaPelatihan[]" value="${escapeAttr(data.lembagaPelatihan || "")}" />
      </div>
      <div class="form-group">
        <label>Bulan</label>
        <select name="riwayatBulan[]">
          ${getBulanOptions(data.bulan || "")}
        </select>
      </div>
      <div class="form-group">
        <label>Tahun</label>
        <input type="number" name="riwayatTahun[]" min="1900" max="2100" value="${escapeAttr(data.tahun || "")}" />
      </div>
    </div>
  `;

  list.appendChild(card);

  card.querySelector(".remove-riwayat-btn").addEventListener("click", function () {
    card.remove();
    renumberCards("riwayatPelatihanList", "Riwayat Pelatihan");
  });

  applyUppercaseToContainer(card);
}

function initPengalamanKerja() {
  const tambahBtn = document.getElementById("tambahPengalamanBtn");
  const list = document.getElementById("pengalamanKerjaList");

  if (!tambahBtn || !list) return;

  if (!list.children.length) addPengalamanKerjaItem();

  tambahBtn.addEventListener("click", function () {
    addPengalamanKerjaItem();
  });
}

function addPengalamanKerjaItem(data = {}) {
  const list = document.getElementById("pengalamanKerjaList");
  if (!list) return;

  const index = list.children.length + 1;
  const card = document.createElement("div");
  card.className = "repeat-card";
  card.innerHTML = `
    <div class="repeat-card-header">
      <h3 class="repeat-card-title">Pengalaman Kerja ${index}</h3>
      <button type="button" class="btn-danger remove-pengalaman-btn">Hapus</button>
    </div>
    <div class="repeat-card-grid">
      <div class="form-group">
        <label>Perusahaan</label>
        <input type="text" name="pengalamanPerusahaan[]" value="${escapeAttr(data.perusahaan || "")}" />
      </div>
      <div class="form-group">
        <label>Jabatan</label>
        <input type="text" name="pengalamanJabatan[]" value="${escapeAttr(data.jabatan || "")}" />
      </div>
      <div class="form-group">
        <label>Tahun Mulai</label>
        <input type="number" name="pengalamanTahunMulai[]" min="1900" max="2100" value="${escapeAttr(data.tahunMulai || "")}" />
      </div>
      <div class="form-group">
        <label>Tahun Selesai</label>
        <input type="number" name="pengalamanTahunSelesai[]" min="1900" max="2100" value="${escapeAttr(data.tahunSelesai || "")}" />
      </div>
      <div class="form-group full">
        <label>Keterangan</label>
        <textarea name="pengalamanKeterangan[]" rows="3">${escapeHtml(data.keterangan || "")}</textarea>
      </div>
    </div>
  `;

  list.appendChild(card);

  card.querySelector(".remove-pengalaman-btn").addEventListener("click", function () {
    card.remove();
    renumberCards("pengalamanKerjaList", "Pengalaman Kerja");
  });

  applyUppercaseToContainer(card);
}

function renumberCards(listId, titlePrefix) {
  const list = document.getElementById(listId);
  if (!list) return;

  [...list.children].forEach((card, idx) => {
    const title = card.querySelector(".repeat-card-title");
    if (title) title.textContent = `${titlePrefix} ${idx + 1}`;
  });
}

function getBulanOptions(selectedValue = "") {
  const bulanList = [
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
  ];

  let html = `<option value="">PILIH BULAN</option>`;
  bulanList.forEach((bulan) => {
    const selected = bulan === selectedValue ? "selected" : "";
    html += `<option value="${bulan}" ${selected}>${bulan}</option>`;
  });

  return html;
}

function applyUppercaseToContainer(container) {
  const fields = container.querySelectorAll('input[type="text"], textarea');
  fields.forEach((field) => {
    field.addEventListener("input", function () {
      this.value = this.value.toUpperCase();
    });
  });
}

function initRealtimeValidationClear() {
  const fields = document.querySelectorAll("input, select, textarea");

  fields.forEach((field) => {
    const eventType = field.type === "file" || field.tagName === "SELECT" ? "change" : "input";

    field.addEventListener(eventType, function () {
      if (field.id === "alamatPerusahaan" && !field.readOnly) {
        field.dataset.manualValue = field.value;
      }

      clearSingleFieldError(field.id);

      if (field.id === "nik") validateNikRealtime();

      if (field.id === "fileKtp") validateFileSizeRealtime("fileKtp", "File KTP maksimal 1 MB.");
      if (field.id === "fileSimper") validateFileSizeRealtime("fileSimper", "File SIMPER maksimal 1 MB.");
      if (field.id === "fileMinePermit") validateFileSizeRealtime("fileMinePermit", "File MINE PERMIT maksimal 1 MB.");

      if (field.id === "jabatan") clearSingleFieldError("jabatanLainnya");
      if (field.id === "departemen") clearSingleFieldError("departemenLainnya");
      if (field.id === "pendidikanTerakhir") clearSingleFieldError("jurusan");
      if (field.id === "namaPerusahaanPilihan") {
        clearSingleFieldError("namaPerusahaanLainnya");
        clearSingleFieldError("alamatPerusahaan");
      }
      if (field.id === "memilikiSimper") {
        clearSingleFieldError("fileSimper");
        clearSingleFieldError("fileMinePermit");
      }
      if (field.id === "kategoriPelatihan") {
        clearSingleFieldError("jenisPelatihanUnit");
        clearSingleFieldError("jenisPelatihanTeknikal");
        clearSingleFieldError("groupEgi");
        clearSingleFieldError("kelasTeknikal");
        clearSingleFieldError("unitType");
        clearSingleFieldError("waliKelasUnit");
        clearSingleFieldError("waliKelasTeknikal");
      }

      maybeHideFormAlert();
    });
  });

  document.addEventListener("change", function (e) {
    if (e.target && e.target.name === "unitType") {
      clearUnitTypeErrorIfValid();
      maybeHideFormAlert();
    }
  });
}

function initFormSubmit() {
  const form = document.getElementById("formPeserta");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    clearValidationErrors();

    const errors = validateForm();
    if (errors.length > 0) {
      showFormAlert("Masih ada data wajib yang belum diisi. Silakan lengkapi field yang ditandai merah.");
      focusFirstError(errors);
      return;
    }

    hideFormAlert();

    const formData = collectFormData();

    const ktpInput = document.getElementById("fileKtp");
    const simperInput = document.getElementById("fileSimper");
    const minePermitInput = document.getElementById("fileMinePermit");

    const ktpFile = ktpInput?.files?.[0];
    const simperFile = simperInput?.files?.[0];
    const minePermitFile = minePermitInput?.files?.[0];

    const memilikiSimper = document.getElementById("memilikiSimper")?.value || "";

    // mengikuti test kamu: folder = test-${now.getTime()}
    const submissionCode = `test-${Date.now()}`;
    const folder = submissionCode;

    const ktpPath = `${folder}/ktp-${sanitizeFileName(ktpFile.name)}`;

    let simperPath = null;
    let minePermitPath = null;

    if (memilikiSimper === "YA") {
      simperPath = `${folder}/simper-${sanitizeFileName(simperFile.name)}`;
    } else if (memilikiSimper === "TIDAK MEMILIKI SIMPER") {
      minePermitPath = `${folder}/mine-permit-${sanitizeFileName(minePermitFile.name)}`;
    }

    try {
      // upload KTP
      await uploadToBucket("ktp", ktpPath, ktpFile);

      // upload SIMPER/MINE PERMIT
      if (memilikiSimper === "YA") {
        await uploadToBucket("simper", simperPath, simperFile);
      } else if (memilikiSimper === "TIDAK MEMILIKI SIMPER") {
        await uploadToBucket("mine-permit", minePermitPath, minePermitFile);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal upload file ke Storage. Cek console.");
      return;
    }

    // simpan draft path supaya review/submit bisa insert DB
    const draftToSave = {
      ...formData,
      submissionCode,

      // tetap simpan nama file (review kamu pakai ini)
      fileKtpName: formData.fileKtpName || "",
      fileSimperName: formData.fileSimperName || "",
      fileMinePermitName: formData.fileMinePermitName || "",

      // path file untuk insert DB
      fileKtpPath: ktpPath,
      fileSimperPath: simperPath,
      fileMinePermitPath: minePermitPath
    };

    saveDraft(draftToSave);
    window.location.href = "review.html";
  });
}

function validateForm() {
  const errors = [];

  checkRequiredText("namaLengkap", "Nama lengkap wajib diisi.", errors);
  checkRequiredText("tempatLahir", "Tempat lahir wajib diisi.", errors);
  checkRequiredText("tanggalLahir", "Tanggal lahir wajib diisi.", errors);
  checkRequiredText("agama", "Agama wajib dipilih.", errors);
  checkRequiredText("nrp", "NRP wajib diisi.", errors);
  checkRequiredText("alamatTinggal", "Alamat tempat tinggal wajib diisi.", errors);

  checkRequiredText("nik", "NIK wajib diisi.", errors);
  validateNikLength(errors);
  checkRequiredText("alamatKtp", "Alamat sesuai KTP wajib diisi.", errors);
  checkRequiredFile("fileKtp", "File KTP wajib diupload.", errors);
  validateFileSize("fileKtp", "File KTP maksimal 1 MB.", errors);

  checkRequiredText("golongan", "Golongan wajib dipilih.", errors);
  checkRequiredText("jabatan", "Jabatan wajib dipilih.", errors);
  if (document.getElementById("jabatan")?.value === "LAINNYA") {
    checkRequiredText("jabatanLainnya", "Jabatan lainnya wajib diisi.", errors);
  }

  checkRequiredText("departemen", "Departemen wajib dipilih.", errors);
  if (document.getElementById("departemen")?.value === "LAINNYA") {
    checkRequiredText("departemenLainnya", "Departemen lainnya wajib diisi.", errors);
  }

  checkRequiredText("namaPerusahaanPilihan", "Nama perusahaan / cabang wajib dipilih.", errors);
  if (document.getElementById("namaPerusahaanPilihan")?.value === "LAINNYA") {
    checkRequiredText("namaPerusahaanLainnya", "Nama perusahaan / cabang lainnya wajib diisi.", errors);
  }
  checkRequiredText("alamatPerusahaan", "Alamat perusahaan wajib diisi.", errors);

  checkRequiredText("tanggalMasukKerja", "Tanggal masuk kerja wajib diisi.", errors);
  checkRequiredText("pendidikanTerakhir", "Pendidikan terakhir wajib dipilih.", errors);

  if (["SMA/K", "D3", "S1"].includes(document.getElementById("pendidikanTerakhir")?.value || "")) {
    checkRequiredText("jurusan", "Jurusan wajib diisi.", errors);
  }

  checkRequiredText("kategoriPelatihan", "Kategori pelatihan wajib dipilih.", errors);

  const kategori = document.getElementById("kategoriPelatihan")?.value || "";
  if (kategori === "TRAINING UNIT") {
    checkRequiredText("jenisPelatihanUnit", "Jenis pelatihan wajib dipilih.", errors);
    checkRequiredText("groupEgi", "Group EGI wajib dipilih.", errors);
    validateUnitType(errors);
    checkRequiredText("waliKelasUnit", "Wali Kelas / Pengajar wajib dipilih.", errors);
  } else if (kategori === "TRAINING TEKNIKAL PENGAWAS/GL") {
    checkRequiredText("jenisPelatihanTeknikal", "Jenis pelatihan wajib dipilih.", errors);
    checkRequiredText("kelasTeknikal", "Kelas wajib dipilih.", errors);
    checkRequiredText("waliKelasTeknikal", "Wali Kelas wajib dipilih.", errors);
  }

  checkRequiredText("periodeBulan", "Periode pelatihan bulan wajib dipilih.", errors);
  checkRequiredText("periodeTahun", "Periode pelatihan tahun wajib diisi.", errors);

  checkRequiredText("memilikiSimper", "Pilih status kepemilikan SIMPER.", errors);

  const memilikiSimper = document.getElementById("memilikiSimper")?.value || "";
  if (memilikiSimper === "YA") {
    checkRequiredFile("fileSimper", "File SIMPER wajib diupload.", errors);
    validateFileSize("fileSimper", "File SIMPER maksimal 1 MB.", errors);
  } else if (memilikiSimper === "TIDAK MEMILIKI SIMPER") {
    checkRequiredFile("fileMinePermit", "File MINE PERMIT wajib diupload.", errors);
    validateFileSize("fileMinePermit", "File MINE PERMIT maksimal 1 MB.", errors);
  }

  return errors;
}

function checkRequiredText(id, message, errors) {
  const el = document.getElementById(id);
  if (!el) return;

  const value = (el.value || "").trim();
  if (!value) {
    setFieldError(id, message);
    errors.push(id);
  }
}

function checkRequiredFile(id, message, errors) {
  const el = document.getElementById(id);
  if (!el) return;

  if (!el.files || !el.files.length) {
    setFieldError(id, message);
    errors.push(id);
  }
}

function validateFileSize(fileInputId, message, errors) {
  const fileInput = document.getElementById(fileInputId);
  if (!fileInput || !fileInput.files || !fileInput.files.length) return;

  const file = fileInput.files[0];
  if (file.size > MAX_FILE_SIZE_BYTES) {
    setFieldError(fileInputId, message);
    errors.push(fileInputId);
  }
}

function validateFileSizeRealtime(fileInputId, message) {
  const fileInput = document.getElementById(fileInputId);
  if (!fileInput || !fileInput.files || !fileInput.files.length) return;

  const file = fileInput.files[0];
  if (file.size > MAX_FILE_SIZE_BYTES) {
    setFieldError(fileInputId, message);
  } else {
    clearSingleFieldError(fileInputId);
  }
}

function validateNikLength(errors) {
  const nik = document.getElementById("nik");
  if (!nik) return;

  const value = (nik.value || "").trim();
  if (value && value.length !== 16) {
    setFieldError("nik", "NIK harus 16 digit.");
    errors.push("nik");
  }
}

function validateNikRealtime() {
  const nik = document.getElementById("nik");
  if (!nik) return;

  const value = (nik.value || "").trim();
  if (!value) return;

  if (value.length === 16) {
    clearSingleFieldError("nik");
  } else {
    setFieldError("nik", "NIK harus 16 digit.");
  }
}

function validateUnitType(errors) {
  const kategori = document.getElementById("kategoriPelatihan")?.value || "";
  if (kategori !== "TRAINING UNIT") return;

  const checked = document.querySelectorAll('input[name="unitType"]:checked');
  const wrapper = document.getElementById("unitTypeWrapper");
  const errorEl = document.getElementById("error-unitType");

  if (!checked.length) {
    if (wrapper) wrapper.classList.add("input-error");
    if (errorEl) errorEl.textContent = "Pilih minimal 1 unit type.";
    errors.push("unitType");
  }
}

function clearUnitTypeErrorIfValid() {
  const checked = document.querySelectorAll('input[name="unitType"]:checked');
  if (checked.length > 0) {
    clearSingleFieldError("unitType");
  }
}

function setFieldError(id, message) {
  const el = document.getElementById(id);
  const errorEl = document.getElementById(`error-${id}`);

  if (id === "unitType") {
    const wrapper = document.getElementById("unitTypeWrapper");
    if (wrapper) wrapper.classList.add("input-error");
    if (errorEl) errorEl.textContent = message;
    return;
  }

  if (el) el.classList.add("input-error");
  if (errorEl) errorEl.textContent = message;
}

function clearSingleFieldError(id) {
  const el = document.getElementById(id);
  const errorEl = document.getElementById(`error-${id}`);

  if (id === "unitType") {
    const wrapper = document.getElementById("unitTypeWrapper");
    const unitError = document.getElementById("error-unitType");
    if (wrapper) wrapper.classList.remove("input-error");
    if (unitError) unitError.textContent = "";
    return;
  }

  if (el) el.classList.remove("input-error");
  if (errorEl) errorEl.textContent = "";
}

function clearValidationErrors() {
  document.querySelectorAll(".input-error").forEach((el) => {
    el.classList.remove("input-error");
  });

  document.querySelectorAll(".error-text").forEach((el) => {
    el.textContent = "";
  });
}

function showFormAlert(message) {
  const alertBox = document.getElementById("formAlert");
  if (!alertBox) return;

  alertBox.textContent = message;
  alertBox.style.display = "block";
}

function hideFormAlert() {
  const alertBox = document.getElementById("formAlert");
  if (!alertBox) return;

  alertBox.textContent = "";
  alertBox.style.display = "none";
}

function maybeHideFormAlert() {
  const stillHasError =
    document.querySelector(".input-error") ||
    [...document.querySelectorAll(".error-text")].some(el => el.textContent.trim() !== "");

  if (!stillHasError) hideFormAlert();
}

function focusFirstError(errors) {
  if (!errors.length) return;

  const firstId = errors[0];

  if (firstId === "unitType") {
    document.getElementById("unitTypeWrapper")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const el = document.getElementById(firstId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus();
  }
}

function getFinalNamaPerusahaan() {
  const pilihan = document.getElementById("namaPerusahaanPilihan")?.value || "";
  const lainnya = document.getElementById("namaPerusahaanLainnya")?.value || "";

  if (pilihan === "LAINNYA") return lainnya.trim();
  return pilihan.trim();
}

function getFinalAlamatPerusahaan() {
  return (document.getElementById("alamatPerusahaan")?.value || "").trim();
}

function collectFormData() {
  const selectedUnitTypes = [...document.querySelectorAll('input[name="unitType"]:checked')].map(
    (el) => el.value
  );

  const riwayatPelatihan = [...document.querySelectorAll("#riwayatPelatihanList .repeat-card")].map((card) => ({
    namaPelatihan: card.querySelector('input[name="riwayatNamaPelatihan[]"]')?.value || "",
    lembagaPelatihan: card.querySelector('input[name="riwayatLembagaPelatihan[]"]')?.value || "",
    bulan: card.querySelector('select[name="riwayatBulan[]"]')?.value || "",
    tahun: card.querySelector('input[name="riwayatTahun[]"]')?.value || ""
  }));

  const pengalamanKerja = [...document.querySelectorAll("#pengalamanKerjaList .repeat-card")].map((card) => ({
    perusahaan: card.querySelector('input[name="pengalamanPerusahaan[]"]')?.value || "",
    jabatan: card.querySelector('input[name="pengalamanJabatan[]"]')?.value || "",
    tahunMulai: card.querySelector('input[name="pengalamanTahunMulai[]"]')?.value || "",
    tahunSelesai: card.querySelector('input[name="pengalamanTahunSelesai[]"]')?.value || "",
    keterangan: card.querySelector('textarea[name="pengalamanKeterangan[]"]')?.value || ""
  }));

  const fileKtpInput = document.getElementById("fileKtp");
  const fileSimperInput = document.getElementById("fileSimper");
  const fileMinePermitInput = document.getElementById("fileMinePermit");
  const kategoriPelatihan = document.getElementById("kategoriPelatihan")?.value || "";

  return {
    namaLengkap: document.getElementById("namaLengkap")?.value || "",
    tempatLahir: document.getElementById("tempatLahir")?.value || "",
    tanggalLahir: document.getElementById("tanggalLahir")?.value || "",
    agama: document.getElementById("agama")?.value || "",
    nrp: document.getElementById("nrp")?.value || "",
    alamatTinggal: document.getElementById("alamatTinggal")?.value || "",
    nik: document.getElementById("nik")?.value || "",
    alamatKtp: document.getElementById("alamatKtp")?.value || "",
    fileKtpName: fileKtpInput?.files?.[0]?.name || "",
    golongan: document.getElementById("golongan")?.value || "",
    jabatan: document.getElementById("jabatan")?.value || "",
    jabatanLainnya: document.getElementById("jabatanLainnya")?.value || "",
    departemen: document.getElementById("departemen")?.value || "",
    departemenLainnya: document.getElementById("departemenLainnya")?.value || "",
    namaPerusahaanPilihan: document.getElementById("namaPerusahaanPilihan")?.value || "",
    namaPerusahaanLainnya: document.getElementById("namaPerusahaanLainnya")?.value || "",
    namaPerusahaan: getFinalNamaPerusahaan(),
    tanggalMasukKerja: document.getElementById("tanggalMasukKerja")?.value || "",
    alamatPerusahaan: getFinalAlamatPerusahaan(),
    pendidikanTerakhir: document.getElementById("pendidikanTerakhir")?.value || "",
    jurusan: document.getElementById("jurusan")?.value || "",
    kategoriPelatihan,
    jenisPelatihanUnit: document.getElementById("jenisPelatihanUnit")?.value || "",
    jenisPelatihanTeknikal: document.getElementById("jenisPelatihanTeknikal")?.value || "",
    groupEgi: document.getElementById("groupEgi")?.value || "",
    kelasTeknikal: document.getElementById("kelasTeknikal")?.value || "",
    waliKelasUnit: document.getElementById("waliKelasUnit")?.value || "",
    waliKelasTeknikal: document.getElementById("waliKelasTeknikal")?.value || "",
    periodeBulan: document.getElementById("periodeBulan")?.value || "",
    periodeTahun: document.getElementById("periodeTahun")?.value || "",
    tempatPenyelenggaraan: document.getElementById("tempatPenyelenggaraan")?.value || "",
    unitTypes: selectedUnitTypes,
    riwayatPelatihan,
    pengalamanKerja,
    memilikiSimper: document.getElementById("memilikiSimper")?.value || "",
    fileSimperName: fileSimperInput?.files?.[0]?.name || "",
    fileMinePermitName: fileMinePermitInput?.files?.[0]?.name || ""
  };
}

function restoreDraftToForm() {
  const data = loadDraft();
  if (!data) return;

  setValue("namaLengkap", data.namaLengkap);
  setValue("tempatLahir", data.tempatLahir);
  setValue("tanggalLahir", data.tanggalLahir);
  setValue("agama", data.agama);
  setValue("nrp", data.nrp);
  setValue("alamatTinggal", data.alamatTinggal);
  setValue("nik", data.nik);
  setValue("alamatKtp", data.alamatKtp);
  setValue("golongan", data.golongan);
  setValue("jabatan", data.jabatan);
  setValue("jabatanLainnya", data.jabatanLainnya);
  setValue("departemen", data.departemen);
  setValue("departemenLainnya", data.departemenLainnya);
  setValue("namaPerusahaanPilihan", data.namaPerusahaanPilihan);
  setValue("namaPerusahaanLainnya", data.namaPerusahaanLainnya);
  setValue("tanggalMasukKerja", data.tanggalMasukKerja);
  setValue("alamatPerusahaan", data.alamatPerusahaan);
  setValue("pendidikanTerakhir", data.pendidikanTerakhir);
  setValue("jurusan", data.jurusan);
  setValue("kategoriPelatihan", data.kategoriPelatihan);
  setValue("jenisPelatihanUnit", data.jenisPelatihanUnit);
  setValue("jenisPelatihanTeknikal", data.jenisPelatihanTeknikal);
  setValue("groupEgi", data.groupEgi);
  setValue("kelasTeknikal", data.kelasTeknikal);
  setValue("waliKelasUnit", data.waliKelasUnit);
  setValue("waliKelasTeknikal", data.waliKelasTeknikal);
  setValue("periodeBulan", data.periodeBulan);
  setValue("periodeTahun", data.periodeTahun || new Date().getFullYear());
  setValue("tempatPenyelenggaraan", data.tempatPenyelenggaraan);
  setValue("memilikiSimper", data.memilikiSimper);

  const jabatan = document.getElementById("jabatan");
  if (jabatan) jabatan.dispatchEvent(new Event("change"));

  const departemen = document.getElementById("departemen");
  if (departemen) departemen.dispatchEvent(new Event("change"));

  const pendidikan = document.getElementById("pendidikanTerakhir");
  if (pendidikan) pendidikan.dispatchEvent(new Event("change"));

  const perusahaan = document.getElementById("namaPerusahaanPilihan");
  if (perusahaan) perusahaan.dispatchEvent(new Event("change"));

  const kategori = document.getElementById("kategoriPelatihan");
  if (kategori) kategori.dispatchEvent(new Event("change"));

  const simper = document.getElementById("memilikiSimper");
  if (simper) simper.dispatchEvent(new Event("change"));

  const groupEgi = document.getElementById("groupEgi");
  if (groupEgi) {
    groupEgi.dispatchEvent(new Event("change"));

    setTimeout(() => {
      if (Array.isArray(data.unitTypes)) {
        document.querySelectorAll('input[name="unitType"]').forEach((checkbox) => {
          checkbox.checked = data.unitTypes.includes(checkbox.value);
        });
      }
    }, 0);
  }

  restoreRiwayatPelatihan(data.riwayatPelatihan || []);
  restorePengalamanKerja(data.pengalamanKerja || []);
}

function restoreRiwayatPelatihan(items) {
  const list = document.getElementById("riwayatPelatihanList");
  if (!list) return;

  list.innerHTML = "";
  if (!items.length) {
    addRiwayatPelatihanItem();
    return;
  }

  items.forEach((item) => addRiwayatPelatihanItem(item));
}

function restorePengalamanKerja(items) {
  const list = document.getElementById("pengalamanKerjaList");
  if (!list) return;

  list.innerHTML = "";
  if (!items.length) {
    addPengalamanKerjaItem();
    return;
  }

  items.forEach((item) => addPengalamanKerjaItem(item));
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) {
    el.value = value;
  }
}

function escapeAttr(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
