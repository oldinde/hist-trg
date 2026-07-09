document.addEventListener("DOMContentLoaded", function () {
  const draft = loadDraft();

  if (!draft) {
    window.location.href = "index.html";
    return;
  }

  renderFormalReview(draft);
  initReviewFlow(draft);
});

const DRAFT_KEY = "pesertaDraft";

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
}

function saveDraft(data) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

function renderFormalReview(data) {
  setText("rvNamaLengkap", data.namaLengkap);
  setText(
    "rvTempatTanggalLahir",
    [data.tempatLahir, formatTanggalDisplay(data.tanggalLahir)].filter(Boolean).join(", ")
  );
  setText("rvAgama", data.agama);
  setText("rvNrp", data.nrp);

  const jabatanFinal = data.jabatan === "LAINNYA" ? data.jabatanLainnya : data.jabatan;
  const golJab = [data.golongan, jabatanFinal].filter(Boolean).join(" / ");
  setText("rvGolonganJabatan", golJab);

  setText("rvDepartemen", data.departemen === "LAINNYA" ? data.departemenLainnya : data.departemen);
  setText("rvNamaPerusahaan", data.namaPerusahaan);
  setText("rvTanggalMasukKerja", formatTanggalDisplay(data.tanggalMasukKerja));
  setText("rvAlamatPerusahaan", data.alamatPerusahaan);
  setText("rvAlamatTinggal", data.alamatTinggal);
  setText("rvNik", data.nik);
  setText("rvAlamatKtp", data.alamatKtp);
  setText("rvKategoriPelatihan", data.kategoriPelatihan || "-");
  setText("rvPelatihanLengkap", buildPelatihanLengkap(data));
  setText("rvPeriodePelatihan", formatPeriode(data.periodeBulan, data.periodeTahun));
  setText("rvTempatPenyelenggaraan", data.tempatPenyelenggaraan);
  setText("rvFileKtp", data.fileKtpName || "-");
  setText("rvMemilikiSimper", data.memilikiSimper || "-");
  setText("rvDokumenIzinOperasional", getDokumenIzinOperasionalLabel(data));

  renderWaliKelas(data);
  renderPendidikan(data.pendidikanTerakhir, data.jurusan);
  renderRiwayatPelatihanTable(data.riwayatPelatihan || []);
  renderPengalamanKerjaTable(data.pengalamanKerja || []);
}

function initReviewFlow(data) {
  const isTeknikal = data.kategoriPelatihan === "TRAINING TEKNIKAL PENGAWAS/GL";

  const teknikalBox = document.getElementById("reviewTeknikalApproval");
  const btnUnit = document.getElementById("btnSudahBenarUnit");
  const btnTeknikal = document.getElementById("btnSubmitTeknikal");

  if (isTeknikal) {
    if (teknikalBox) teknikalBox.style.display = "block";
    if (btnUnit) btnUnit.style.display = "none";
    if (btnTeknikal) btnTeknikal.style.display = "inline-flex";

    initReviewSignaturePad();
    initTeknikalSubmit();
  } else {
    if (teknikalBox) teknikalBox.style.display = "none";
    if (btnUnit) btnUnit.style.display = "inline-flex";
    if (btnTeknikal) btnTeknikal.style.display = "none";
  }
}

function initReviewSignaturePad() {
  const canvas = document.getElementById("reviewSignatureCanvas");
  const clearBtn = document.getElementById("clearReviewSignatureBtn");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let drawing = false;

  resizeCanvas(canvas, ctx);

  window.addEventListener("resize", function () {
    const existing = canvas.dataset.signature || "";
    resizeCanvas(canvas, ctx);

    if (existing) {
      const img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = existing;
    }
  });

  function startDraw(x, y) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(x, y) {
    if (!drawing) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    canvas.dataset.hasSignature = "true";
  }

  function stopDraw() {
    if (!drawing) return;
    drawing = false;
    canvas.dataset.signature = canvas.toDataURL("image/png");
  }

  canvas.addEventListener("mousedown", function (e) {
    const pos = getMousePos(canvas, e);
    startDraw(pos.x, pos.y);
  });

  canvas.addEventListener("mousemove", function (e) {
    const pos = getMousePos(canvas, e);
    draw(pos.x, pos.y);
  });

  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);

  canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    const pos = getTouchPos(canvas, e);
    startDraw(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    const pos = getTouchPos(canvas, e);
    draw(pos.x, pos.y);
  }, { passive: false });

  canvas.addEventListener("touchend", function (e) {
    e.preventDefault();
    stopDraw();
  }, { passive: false });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.dataset.signature = "";
      canvas.dataset.hasSignature = "";
    });
  }
}

function initTeknikalSubmit() {
  const btn = document.getElementById("btnSubmitTeknikal");
  const checkbox = document.getElementById("reviewSetujuDataBenar");
  const canvas = document.getElementById("reviewSignatureCanvas");

  if (!btn || !checkbox || !canvas) return;

  btn.addEventListener("click", async function () {
    if (!checkbox.checked) {
      alert("Centang pernyataan bahwa semua data sudah benar terlebih dahulu.");
      return;
    }

    if (canvas.dataset.hasSignature !== "true") {
      alert("Tanda tangan masih kosong.");
      return;
    }

    const draft = loadDraft() || {};

    try {
      // 1) (opsional) simpan signature ke draft dulu biar konsisten
      const nextDraft = {
        ...draft,
        reviewDataConfirmed: true,
        reviewSignatureDataUrl: canvas.dataset.signature || "",
        signatureDataUrl: canvas.dataset.signature || "",
        finalSubmittedAt: new Date().toISOString(),
      };
      saveDraft(nextDraft);

      // 2) insert peserta
      const jabatanFinal =
        draft.jabatan === "LAINNYA" ? (draft.jabatanLainnya || "") : (draft.jabatan || "");
      const departemenFinal =
        draft.departemen === "LAINNYA" ? (draft.departemenLainnya || "") : (draft.departemen || "");

      const pesertaPayload = {
        nama_lengkap: draft.namaLengkap,
        tempat_lahir: draft.tempatLahir,
        tanggal_lahir: draft.tanggalLahir,
        agama: draft.agama,
        nrp: draft.nrp,
        nik: draft.nik,
        alamat_tempat_tinggal: draft.alamatTinggal,
        alamat_sesuai_ktp: draft.alamatKtp,
        golongan: draft.golongan,
        jabatan: jabatanFinal,
        jabatan_lainnya: draft.jabatan === "LAINNYA" ? (draft.jabatanLainnya || null) : null,
        departemen: departemenFinal,
        departemen_lainnya: draft.departemen === "LAINNYA" ? (draft.departemenLainnya || null) : null,

        nama_perusahaan_pilihan: draft.namaPerusahaanPilihan,
        nama_perusahaan_lainnya: draft.namaPerusahaanPilihan === "LAINNYA" ? (draft.namaPerusahaanLainnya || null) : null,
        nama_perusahaan_final: draft.namaPerusahaan,
        alamat_perusahaan: draft.alamatPerusahaan,

        tanggal_masuk_kerja: draft.tanggalMasukKerja,
        pendidikan_terakhir: draft.pendidikanTerakhir,
        jurusan: draft.jurusan,
      };

      const { data: pesertaData, error: pesertaError } = await window.supabase
        .from("peserta")
        .insert(pesertaPayload)
        .select()
        .single();

      if (pesertaError) throw pesertaError;

      // 3) insert training_submissions (teknikal)
      const ktpPath = draft.fileKtpPath || null;
      const simperPath = draft.fileSimperPath || null;
      const minePermitPath = draft.fileMinePermitPath || null;

      const ktpName = draft.fileKtpName || null;
      const simperName = draft.fileSimperName || null;
      const minePermitName = draft.fileMinePermitName || null;

      const subPayload = {
        peserta_id: pesertaData.id,

        kategori_pelatihan: "TRAINING TEKNIKAL PENGAWAS/GL",

        jenis_pelatihan_unit: null,
        jenis_pelatihan_teknikal: draft.jenisPelatihanTeknikal || null,

        group_egi: draft.groupEgi || null,
        kelas_teknikal: draft.kelasTeknikal || null,

        wali_kelas_unit: null,
        wali_kelas_teknikal: draft.waliKelasTeknikal || null,

        periode_bulan: draft.periodeBulan || null,
        periode_tahun: draft.periodeTahun || null,
        tempat_penyelenggaraan: draft.tempatPenyelenggaraan || null,

        memiliki_simper: draft.memilikiSimper || null,

        file_ktp_name: ktpName,
        file_ktp_path: ktpPath,

        file_simper_name: simperName,
        file_simper_path: simperPath,

        file_mine_permit_name: minePermitName,
        file_mine_permit_path: minePermitPath,

        signature_data_url: nextDraft.signatureDataUrl || "",
        review_signature_data_url: nextDraft.reviewSignatureDataUrl || null,

        agreed_to_rules: true, // untuk teknikal di flow kamu anggap setuju
        review_data_confirmed: true,
        final_submitted_at: nextDraft.finalSubmittedAt || new Date().toISOString(),
      };

      const { data: subData, error: subError } = await window.supabase
        .from("training_submissions")
        .insert(subPayload)
        .select()
        .single();

      if (subError) throw subError;

      // 4) insert child tables: riwayat_pelatihan + pengalaman_kerja
      const riwayat = Array.isArray(draft.riwayatPelatihan) ? draft.riwayatPelatihan : [];
      const pengalaman = Array.isArray(draft.pengalamanKerja) ? draft.pengalamanKerja : [];

      if (riwayat.length) {
        const riwayatRows = riwayat.map((r) => ({
          training_submission_id: subData.id,
          nama_pelatihan: r.namaPelatihan || null,
          lembaga_pelatihan: r.lembagaPelatihan || null,
          bulan: r.bulan || null,
          tahun: r.tahun || null,
        }));

        const { error: rErr } = await window.supabase
          .from("riwayat_pelatihan")
          .insert(riwayatRows);

        if (rErr) throw rErr;
      }

      if (pengalaman.length) {
        const pengalamanRows = pengalaman.map((p) => ({
          training_submission_id: subData.id,
          perusahaan: p.perusahaan || null,
          jabatan: p.jabatan || null,
          tahun_mulai: p.tahunMulai || null,
          tahun_selesai: p.tahunSelesai || null,
          keterangan: p.keterangan || null,
        }));

        const { error: pErr } = await window.supabase
          .from("pengalaman_kerja")
          .insert(pengalamanRows);

        if (pErr) throw pErr;
      }

      // 5) sukses -> selesai
      window.location.href = "selesai.html";
    } catch (err) {
      console.error(err);
      alert("Gagal insert ke database (teknikal). Lihat console untuk detail.");
    }
  });
}

function renderWaliKelas(data) {
  const lineUnit = document.getElementById("rvWaliKelasUnitLine");
  const lineTeknikal = document.getElementById("rvWaliKelasTeknikalLine");

  if (data.kategoriPelatihan === "TRAINING UNIT") {
    if (lineUnit) lineUnit.style.display = "grid";
    if (lineTeknikal) lineTeknikal.style.display = "none";
    setText("rvWaliKelasUnit", data.waliKelasUnit || "-");
  } else if (data.kategoriPelatihan === "TRAINING TEKNIKAL PENGAWAS/GL") {
    if (lineUnit) lineUnit.style.display = "none";
    if (lineTeknikal) lineTeknikal.style.display = "grid";
    setText("rvWaliKelasTeknikal", data.waliKelasTeknikal || "-");
  } else {
    if (lineUnit) lineUnit.style.display = "none";
    if (lineTeknikal) lineTeknikal.style.display = "none";
  }
}

function getDokumenIzinOperasionalLabel(data) {
  if (data.memilikiSimper === "YA") return data.fileSimperName || "-";
  if (data.memilikiSimper === "TIDAK MEMILIKI SIMPER") return data.fileMinePermitName || "-";
  return "-";
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

function renderPendidikan(pendidikan, jurusan) {
  const map = {
    "SD": "eduSD",
    "SMP": "eduSMP",
    "SMA/K": "eduSMAK",
    "D3": "eduD3",
    "S1": "eduS1"
  };

  Object.values(map).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });

  if (map[pendidikan]) {
    document.getElementById(map[pendidikan])?.classList.add("active");
  }

  const jurusanLine = document.getElementById("jurusanLine");
  const jurusanValue = document.getElementById("rvJurusan");

  if (["SMA/K", "D3", "S1"].includes(pendidikan)) {
    if (jurusanLine) jurusanLine.style.display = "grid";
    if (jurusanValue) jurusanValue.textContent = jurusan || "-";
  } else {
    if (jurusanLine) jurusanLine.style.display = "none";
  }
}

function renderRiwayatPelatihanTable(items) {
  const body = document.getElementById("reviewRiwayatPelatihanBody");
  if (!body) return;

  const validItems = items.filter((item) =>
    item.namaPelatihan || item.lembagaPelatihan || item.bulan || item.tahun
  );

  if (!validItems.length) {
    body.innerHTML = `
      <tr>
        <td colspan="4" class="empty-cell">BELUM ADA DATA</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = validItems.map((item, index) => {
    const bulanTahun = [item.bulan, item.tahun].filter(Boolean).join(" / ");
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.namaPelatihan || "-")}</td>
        <td>${escapeHtml(item.lembagaPelatihan || "-")}</td>
        <td>${escapeHtml(bulanTahun || "-")}</td>
      </tr>
    `;
  }).join("");
}

function renderPengalamanKerjaTable(items) {
  const body = document.getElementById("reviewPengalamanKerjaBody");
  if (!body) return;

  const validItems = items.filter((item) =>
    item.perusahaan || item.jabatan || item.tahunMulai || item.tahunSelesai || item.keterangan
  );

  if (!validItems.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">BELUM ADA DATA</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = validItems.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(item.perusahaan || "-")}</td>
      <td>${escapeHtml(item.jabatan || "-")}</td>
      <td>${escapeHtml(item.tahunMulai || "-")}</td>
      <td>${escapeHtml(item.tahunSelesai || "-")}</td>
      <td>${escapeHtml(item.keterangan || "-")}</td>
    </tr>
  `).join("");
}

function resizeCanvas(canvas, ctx) {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function getTouchPos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const touch = evt.touches[0] || evt.changedTouches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value || "-";
}

function formatTanggalDisplay(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
}

function formatPeriode(bulan, tahun) {
  if (!bulan && !tahun) return "-";
  return [bulan, tahun].filter(Boolean).join(" ");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
