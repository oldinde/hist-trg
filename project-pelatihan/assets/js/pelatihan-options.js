window.PELATIHAN_DATA = [
  {
    code: "DR",
    label: "DR (DRILLING)",
    unit: "DRILLING",
    types: [
      "SANDVIK D245S",
      "D245X",
      "CAT M620",
      "PCR200 FURUKAWA"
    ]
  },
  {
    code: "DZ",
    label: "DZ (BULLDOZER)",
    unit: "BULLDOZER",
    types: ["D85", "D155", "D375"]
  },
  {
    code: "EX",
    label: "EX (EXCAVATOR)",
    unit: "EXCAVATOR",
    types: [
      "PC200",
      "PC300",
      "PC400",
      "PC500",
      "PC700",
      "PC750",
      "PC800",
      "PC850",
      "ZX870",
      "PC1250",
      "EX1200",
      "PC2000",
      "EX2500",
      "EX2600"
    ]
  },
  {
    code: "GD",
    label: "GD (MOTOR GRADER)",
    unit: "MOTOR GRADER",
    types: ["GD705", "GD825", "CAT 14M3"]
  },
  {
    code: "HD",
    label: "HD (HEAVY DUTY DUMP TRUCK)",
    unit: "HEAVY DUTY TRUCK",
    types: ["HD465", "HD785"]
  },
  {
    code: "HM",
    label: "HM (ARTICULATED DUMP TRUCK)",
    unit: "ARTICULATED DUMP TRUCK",
    types: ["HM400"]
  },
  {
    code: "LD",
    label: "LD (LIGHT DUMP TRUCK)",
    unit: "LIGHT DUMP TRUCK",
    types: [
      "SC P360",
      "SC P380",
      "SC P410",
      "SC P420",
      "SC P460",
      "SC G460",
      "NISSAN CWB",
      "QUESTER CWE370"
    ]
  },
  {
    code: "ST",
    label: "ST (SINGLE DUMP TRAILER)",
    unit: "SINGLE DUMP TRAILER",
    types: ["SC P460", "SC R580", "SC R620", "VOLVO FH16 550", "FH16 700"]
  },
  {
    code: "DT",
    label: "DT (DOUBLE DUMP TRAILER)",
    unit: "DOUBLE DUMP TRAILER",
    types: ["SC R580", "SC R620", "VOLVO FH16 550", "FH16 700"]
  },
  {
    code: "WA",
    label: "WA (WHEEL LOADER)",
    unit: "WHEEL LOADER",
    types: ["980MK/C13", "WA500", "WA600", "WA900"]
  },
  {
    code: "AM",
    label: "AM (MOBILE MIXING UNIT)",
    unit: "MOBILE MIXING UNIT",
    types: ["MMU SC P360", "MMU SC P380"]
  },
  {
    code: "BL",
    label: "BL (BARGE LOADER)",
    unit: "BARGE LOADER",
    types: ["300TPH", "600TPH"]
  },
  {
    code: "CP",
    label: "CP (COMPACTOR)",
    unit: "COMPACTOR",
    types: ["BOMAG BW211", "SAKAI CP"]
  },
  {
    code: "CR",
    label: "CR (CRUSHER)",
    unit: "CRUSHER",
    types: ["100TPH", "CR0002", "CR0010", "CR0011", "CR01", "CR10P"]
  },
  {
    code: "CT",
    label: "CT (MOBILE CRAINE TRUCK)",
    unit: "MOBILE CRAINE TRUCK",
    types: ["CT SCANIA", "TADANO"]
  },
  {
    code: "FD",
    label: "FD (FORKLIFT)",
    unit: "FORKLIFT",
    types: ["FD30", "FD50"]
  },
  {
    code: "FT",
    label: "FT (FUEL TRUCK)",
    unit: "FUEL TRUCK",
    types: ["SC P360", "SC P380", "SC P410XT", "SC P420XT", "HD785"]
  },
  {
    code: "LB",
    label: "LB (LOWBOY)",
    unit: "LOWBOY",
    types: ["LOWBOY LD", "SELF LOADER TRUCK"]
  },
  {
    code: "LR",
    label: "LR (LOWBOY TRAILER)",
    unit: "LOWBOY TRAILER",
    types: ["HD465", "SC P420", "VOLVO FH16 550", "SC R620XT"]
  },
  {
    code: "LO",
    label: "LO (LUBECAR)",
    unit: "LUBECAR",
    types: ["LO", "SC P410", "SC P420"]
  },
  {
    code: "TH",
    label: "TH (TELEHANDLER)",
    unit: "TELEHANDLER",
    types: ["MANITO", "MERLO",]
  },
{
    code: "TR",
    label: "TR (TYRE HANDLER)",
    unit: "TYRE HANDLER",
    types: ["WA500/600", "MERLO",]
  },
  {
    code: "WT",
    label: "WT (WATER TRUCK)",
    unit: "WATER TRUCK",
    types: ["SC P380", "HD465", "HD785", "LOWBOY"]
  },
  {
    code: "PW",
    label: "PW (WHEEL EXCAVATOR)",
    unit: "WHEEL EXCAVATOR",
    types: ["PW140"]
  },
  {
    code: "PD",
    label: "PD (DRAGFLOW EXCAVATOR)",
    unit: "DRAGFLOW EXCAVATOR",
    types: ["PC200", "PC300", "PC400"]
  },
  {
    code: "PB",
    label: "PB (BREAKER EXCAVATOR)",
    unit: "BREAKER EXCAVATOR",
    types: ["PC200", "PC300", "PC400"]
  }
];

document.addEventListener("DOMContentLoaded", function () {
  initGroupEgiOptions();
});

function initGroupEgiOptions() {
  const groupSelect = document.getElementById("groupEgi");
  const unitTypeWrapper = document.getElementById("unitTypeWrapper");

  if (!groupSelect || !unitTypeWrapper) return;

  window.PELATIHAN_DATA.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.code;
    option.textContent = item.label;
    groupSelect.appendChild(option);
  });

  groupSelect.addEventListener("change", function () {
    renderUnitTypes(this.value);
  });
}

function renderUnitTypes(groupCode) {
  const unitTypeWrapper = document.getElementById("unitTypeWrapper");
  if (!unitTypeWrapper) return;

  unitTypeWrapper.innerHTML = "";

  if (!groupCode) {
    unitTypeWrapper.innerHTML = `<p class="muted">PILIH GROUP EGI TERLEBIH DAHULU.</p>`;
    return;
  }

  const selectedGroup = window.PELATIHAN_DATA.find((item) => item.code === groupCode);

  if (!selectedGroup) {
    unitTypeWrapper.innerHTML = `<p class="muted">DATA UNIT TYPE TIDAK DITEMUKAN.</p>`;
    return;
  }

  const info = document.createElement("p");
  info.className = "muted";
  info.style.marginBottom = "12px";
  info.textContent = `UNIT: ${selectedGroup.unit}`;

  const grid = document.createElement("div");
  grid.className = "checkbox-grid";

  selectedGroup.types.forEach((type, index) => {
    const label = document.createElement("label");
    label.className = "checkbox-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "unitType";
    checkbox.value = type;
    checkbox.id = `unitType_${groupCode}_${index}`;

    const span = document.createElement("span");
    span.textContent = type;

    label.appendChild(checkbox);
    label.appendChild(span);
    grid.appendChild(label);
  });

  unitTypeWrapper.appendChild(info);
  unitTypeWrapper.appendChild(grid);
}
