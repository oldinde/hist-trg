document.addEventListener("DOMContentLoaded", function () {
  const draft = loadDraft();

  if (!draft) {
    window.location.href = "index.html";
    return;
  }

  initSignaturePad();
  initFinalSubmit();
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

function initSignaturePad() {
  const canvas = document.getElementById("signatureCanvas");
  const clearBtn = document.getElementById("clearSignatureBtn");

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

  canvas.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault();
      const pos = getTouchPos(canvas, e);
      startDraw(pos.x, pos.y);
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
      const pos = getTouchPos(canvas, e);
      draw(pos.x, pos.y);
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchend",
    function (e) {
      e.preventDefault();
      stopDraw();
    },
    { passive: false }
  );

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.dataset.signature = "";
      canvas.dataset.hasSignature = "";
    });
  }
}

function initFinalSubmit() {
  const btn = document.getElementById("finalSubmitBtn");
  const checkbox = document.getElementById("setujuCheckbox");
  const canvas = document.getElementById("signatureCanvas");

  if (!btn || !checkbox || !canvas) return;

  btn.addEventListener("click", async function () {
    if (!checkbox.checked) {
      alert("Centang persetujuan terlebih dahulu.");
      return;
    }

    if (canvas.dataset.hasSignature !== "true") {
      alert("Tanda tangan masih kosong.");
      return;
    }

    const draft = loadDraft() || {};
    const existingDraft = draft;

    try {
      // merge dulu draft supaya signature & flag ikut kebawa
      const nextDraft = {
        ...existingDraft,
        signatureDataUrl: canvas.dataset.signature || "",
        agreedToRules: true,
        finalSubmittedAt: new Date().toISOString(),
      };
      saveDraft(nextDraft);

      // --- 1) insert peserta ---
      const jabatanFinal =
        nextDraft.jabatan === "LAINNYA" ? (nextDraft.jabatanLainnya || null) : (nextDraft.jabatan || null);
      const departemenFinal =
        nextDraft.departemen === "LAINNYA" ? (nextDraft.departemenLainnya || null) : (nextDraft.departemen || null);

      const pesertaPayload = {
        nama_lengkap: nextDraft.namaLengkap || null,
        tempat_lahir: nextDraft.tempatLahir || null,
        tanggal_lahir: nextDraft.tanggalLahir || null,
        agama: nextDraft.agama || null,
        nrp: nextDraft.nrp || null,
        nik: nextDraft.nik || null,
        alamat_tempat_tinggal: nextDraft.alamatTinggal || null,
        alamat_sesuai_ktp: nextDraft.alamatKtp || null,
        golongan: nextDraft.golongan || null,

        jabatan: jabatanFinal,
        jabatan_lainnya: nextDraft.jabatan === "LAINNYA" ? (nextDraft.jabatanLainnya || null) : null,

        departemen: departemenFinal,
        departemen_lainnya: nextDraft.departemen === "LAINNYA" ? (nextDraft.departemenLainnya || null) : null,

        nama_perusahaan_pilihan: nextDraft.namaPerusahaanPilihan || null,
        nama_perusahaan_lainnya: nextDraft.namaPerusahaanPilihan === "LAINNYA" ? (nextDraft.namaPerusahaanLainnya || null) : null,
        nama_perusahaan_final: nextDraft.namaPerusahaan || null,
        alamat_perusahaan: nextDraft.alamatPerusahaan || null,

        tanggal_masuk_kerja: nextDraft.tanggalMasukKerja || null,
        pendidikan_terakhir: nextDraft.pendidikanTerakhir || null,
        jurusan: nextDraft.jurusan || null,
      };

      const { data: pesertaData, error: pesertaError } = await window.supabase
        .from("peserta")
        .insert(pesertaPayload)
        .select()
        .single();

      if (pesertaError) throw pesertaError;

      // --- 2) insert training_submissions (UNIT) ---
      const unitTypes = Array.isArray(nextDraft.unitTypes) ? nextDraft.unitTypes : [];

      const ktpPath = nextDraft.fileKtpPath || null;
      const simperPath = nextDraft.fileSimperPath || null;
      const minePermitPath = nextDraft.fileMinePermitPath || null;

      const ktpName = nextDraft.fileKtpName || null;
      const simperName = nextDraft.fileSimperName || null;
      const minePermitName = nextDraft.fileMinePermitName || null;

      const subPayload = {
        peserta_id: pesertaData.id,

        kategori_pelatihan: "TRAINING UNIT",
        jenis_pelatihan_unit: nextDraft.jenisPelatihanUnit || null,
        jenis_pelatihan_teknikal: null,

        group_egi: nextDraft.groupEgi || null,
        kelas_teknikal: null,

        wali_kelas_unit: nextDraft.waliKelasUnit || null,
        wali_kelas_teknikal: null,

        periode_bulan: nextDraft.periodeBulan || null,
        periode_tahun: nextDraft.periodeTahun || null,

        tempat_penyelenggaraan: nextDraft.tempatPenyelenggaraan || null,

        memiliki_simper: nextDraft.memilikiSimper || null,

        file_ktp_name: ktpName,
        file_ktp_path: ktpPath,

        file_simper_name: simperName,
        file_simper_path: simperPath,

        file_mine_permit_name: minePermitName,
        file_mine_permit_path: minePermitPath,

        signature_data_url: nextDraft.signatureDataUrl || "",
        review_signature_data_url: nextDraft.reviewSignatureDataUrl || null,

        agreed_to_rules: true,
        review_data_confirmed: nextDraft.reviewDataConfirmed || false,

        final_submitted_at: nextDraft.finalSubmittedAt || new Date().toISOString(),
      };

      const { data: subData, error: subError } = await window.supabase
        .from("training_submissions")
        .insert(subPayload)
        .select()
        .single();

      if (subError) throw subError;

      // --- 3) child: training_unit_types ---
      if (unitTypes.length) {
        const unitTypesRows = unitTypes.map((u) => ({
          training_submission_id: subData.id,
          unit_type: u,
        }));

        const { error: utErr } = await window.supabase
          .from("training_unit_types")
          .insert(unitTypesRows);

        if (utErr) throw utErr;
      }

      // --- 4) child: riwayat_pelatihan ---
      const riwayat = Array.isArray(nextDraft.riwayatPelatihan) ? nextDraft.riwayatPelatihan : [];
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

      // --- 5) child: pengalaman_kerja ---
      const pengalaman = Array.isArray(nextDraft.pengalamanKerja) ? nextDraft.pengalamanKerja : [];
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

      window.location.href = "selesai.html";
    } catch (err) {
      console.error(err);
      alert("Gagal insert ke database (TRAINING UNIT). Cek console.");
    }
  });
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
