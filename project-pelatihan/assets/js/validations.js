document.addEventListener("DOMContentLoaded", function () {
  setUppercaseInputs();
  setNrpValidation();
  setNikValidation();
  toggleJabatanLainnya();
  toggleDepartemenLainnya();
  toggleJurusan();
});

function setUppercaseInputs() {
  const textInputs = document.querySelectorAll('input[type="text"], textarea');

  textInputs.forEach((input) => {
    input.addEventListener("input", function () {
      this.value = this.value.toUpperCase();
    });
  });
}

function setNrpValidation() {
  const nrpInput = document.getElementById("nrp");
  if (!nrpInput) return;

  nrpInput.addEventListener("input", function () {
    this.value = this.value
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/[^A-Z0-9]/g, "");
  });
}

function setNikValidation() {
  const nikInput = document.getElementById("nik");
  if (!nikInput) return;

  nikInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });
}

function toggleJabatanLainnya() {
  const jabatan = document.getElementById("jabatan");
  const wrapper = document.getElementById("jabatanLainnyaWrapper");
  const input = document.getElementById("jabatanLainnya");

  if (!jabatan || !wrapper || !input) return;

  function update() {
    if (jabatan.value === "LAINNYA") {
      wrapper.style.display = "flex";
    } else {
      wrapper.style.display = "none";
      input.value = "";
    }
  }

  jabatan.addEventListener("change", update);
  update();
}

function toggleDepartemenLainnya() {
  const departemen = document.getElementById("departemen");
  const wrapper = document.getElementById("departemenLainnyaWrapper");
  const input = document.getElementById("departemenLainnya");

  if (!departemen || !wrapper || !input) return;

  function update() {
    if (departemen.value === "LAINNYA") {
      wrapper.style.display = "flex";
    } else {
      wrapper.style.display = "none";
      input.value = "";
    }
  }

  departemen.addEventListener("change", update);
  update();
}

function toggleJurusan() {
  const pendidikan = document.getElementById("pendidikanTerakhir");
  const wrapper = document.getElementById("jurusanWrapper");
  const input = document.getElementById("jurusan");

  if (!pendidikan || !wrapper || !input) return;

  function update() {
    const showValues = ["SMA/K", "D3", "S1"];

    if (showValues.includes(pendidikan.value)) {
      wrapper.style.display = "flex";
    } else {
      wrapper.style.display = "none";
      input.value = "";
    }
  }

  pendidikan.addEventListener("change", update);
  update();
}
