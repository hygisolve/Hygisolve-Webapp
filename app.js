/* Hygisolve - dependency-free, local-first application */
let DEPOTS = loadDepots();
let currentDepot = null;

function loadDepots() {
  try {
    const raw = localStorage.getItem("hygisolve:depots");
    if (!raw) return [];
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) return [];
    const legacyIds = new Set(["mumbai", "pune", "delhi"]);
    let changed = false;
    const depots = saved
      .filter((depot) => {
        const valid = isValidDepotRecord(depot) && !legacyIds.has(String(depot.id));
        if (!valid) changed = true;
        return valid;
      })
      .map((depot) => ({
        id: depot.id,
        name: depot.name,
        location: depot.location,
        username: depot.username,
        password: depot.password,
        user: depot.user || "Administrator",
        role: depot.role || "Depot Administrator",
      }));
    const safeDepots = depots.filter(isValidDepotRecord);
    if (safeDepots.length !== depots.length) changed = true;
    if (safeDepots.length !== saved.length || changed) {
      if (safeDepots.length) localStorage.setItem("hygisolve:depots", JSON.stringify(safeDepots));
      else localStorage.removeItem("hygisolve:depots");
    }
    return safeDepots;
  } catch {
    return [];
  }
}

function saveDepots() {
  const cleanDepots = DEPOTS.filter(isValidDepotRecord);
  DEPOTS = cleanDepots;
  if (cleanDepots.length) localStorage.setItem("hygisolve:depots", JSON.stringify(cleanDepots));
  else localStorage.removeItem("hygisolve:depots");
}
function validDepotText(value) {
  const text = String(value == null ? "" : value).trim().toLowerCase();
  return (
    text &&
    text !== "nan" &&
    text !== "nana" &&
    text !== "undefined" &&
    text !== "null" &&
    !text.includes("nan")
  );
}
function isValidDepotRecord(depot) {
  return (
    depot &&
    validDepotText(depot.id) &&
    validDepotText(depot.name) &&
    validDepotText(depot.location) &&
    validDepotText(depot.username) &&
    validDepotText(depot.password)
  );
}
function canEdit() {
  return true;
}
function adminOnly() {
  return true;
}
function adminHTML(html) {
  return html;
}

const DB = {
  keys: [
    "employees",
    "attendance",
    "rawMaterials",
    "rawMaterialEntries",
    "materialConsumption",
    "products",
    "productionEntries",
    "finishedGoods",
    "packagingMaterials",
    "packagingEntries",
    "packagingUsage",
  ],
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(this.key(k))) || [];
    } catch {
      return [];
    }
  },
  set(k, v) {
    localStorage.setItem(this.key(k), JSON.stringify(v));
    return v;
  },
  key(k) {
    return `hygisolve:${currentDepot?.id || "unassigned"}:${k}`;
  },
  add(k, v) {
    const a = this.get(k);
    v.id = v.id || crypto.randomUUID();
    a.unshift(v);
    this.set(k, a);
    return v;
  },
  update(k, id, v) {
    const a = this.get(k).map((x) => (x.id === id ? { ...x, ...v } : x));
    this.set(k, a);
    return a;
  },
  remove(k, id) {
    this.set(
      k,
      this.get(k).filter((x) => x.id !== id),
    );
  },
  seed() {
    const sampleIds = {
      employees: ["e1", "e2", "e3", "e4", "e5"],
      attendance: ["a1", "a2", "a3", "a4"],
      rawMaterials: ["r1", "r2", "r3", "r4"],
      rawMaterialEntries: [],
      materialConsumption: ["mc1", "mc2"],
      products: ["p1", "p2", "p3"],
      productionEntries: ["pe1", "pe2", "pe3", "pe4"],
      finishedGoods: ["f1", "f2"],
      packagingMaterials: ["pk1", "pk2", "pk3", "pk4"],
      packagingEntries: [],
      packagingUsage: ["pu1", "pu2"],
    };
    const cleanupKey = this.key("sampleDataCleared");
    if (!localStorage.getItem(cleanupKey)) {
      this.keys.forEach((collection) => {
        const ids = new Set(sampleIds[collection] || []);
        this.set(collection, this.get(collection).filter((record) => !ids.has(record.id)));
      });
      localStorage.removeItem(this.key("erpSeeded"));
      localStorage.setItem(cleanupKey, "1");
    }
    return;

    /* Legacy sample records retained below for reference; no longer loaded. */
    if (localStorage.getItem(this.key("erpSeeded"))) return;
    const today = dateISO(),
      days = (n) => dateISO(new Date(Date.now() - n * 864e5));
    this.set("employees", [
      {
        id: "e1",
        employeeId: "HL-001",
        name: "Neha Sharma",
        department: "Production",
        designation: "Line Supervisor",
        joiningDate: "2021-04-12",
        dailyWage: 1200,
        phone: "9876543210",
        status: "Active",
      },
      {
        id: "e2",
        employeeId: "HL-002",
        name: "Ravi Kumar",
        department: "Quality",
        designation: "QC Chemist",
        joiningDate: "2022-08-01",
        dailyWage: 1450,
        phone: "9867012345",
        status: "Active",
      },
      {
        id: "e3",
        employeeId: "HL-003",
        name: "Priya Nair",
        department: "Packaging",
        designation: "Packing Operator",
        joiningDate: "2023-01-15",
        dailyWage: 850,
        phone: "9821123456",
        status: "Active",
      },
      {
        id: "e4",
        employeeId: "HL-004",
        name: "Imran Sheikh",
        department: "Stores",
        designation: "Store Assistant",
        joiningDate: "2020-11-20",
        dailyWage: 900,
        phone: "9892123456",
        status: "Active",
      },
      {
        id: "e5",
        employeeId: "HL-005",
        name: "Anita Das",
        department: "Administration",
        designation: "HR Executive",
        joiningDate: "2022-03-07",
        dailyWage: 1300,
        phone: "9819123456",
        status: "Inactive",
      },
    ]);
    this.set("attendance", [
      {
        id: "a1",
        date: today,
        employeeId: "e1",
        status: "Present",
        overtime: 2,
      },
      {
        id: "a2",
        date: today,
        employeeId: "e2",
        status: "Present",
        overtime: 0,
      },
      {
        id: "a3",
        date: today,
        employeeId: "e3",
        status: "Absent",
        overtime: 0,
      },
      {
        id: "a4",
        date: today,
        employeeId: "e4",
        status: "Half Day",
        overtime: 0,
      },
    ]);
    this.set("rawMaterials", [
      {
        id: "r1",
        code: "RM-101",
        name: "Sodium Hypochlorite",
        category: "Active Chemical",
        unit: "L",
        currentStock: 420,
        minStock: 250,
      },
      {
        id: "r2",
        code: "RM-102",
        name: "Sodium Lauryl Ether Sulfate",
        category: "Surfactant",
        unit: "KG",
        currentStock: 185,
        minStock: 200,
      },
      {
        id: "r3",
        code: "RM-103",
        name: "Citric Acid",
        category: "Acidifier",
        unit: "KG",
        currentStock: 96,
        minStock: 75,
      },
      {
        id: "r4",
        code: "RM-104",
        name: "Lemon Fragrance",
        category: "Fragrance",
        unit: "L",
        currentStock: 18,
        minStock: 25,
      },
    ]);
    this.set("materialConsumption", [
      {
        id: "mc1",
        date: days(1),
        materialId: "r1",
        quantity: 80,
        remarks: "Floor cleaner batch FC-2606",
      },
      {
        id: "mc2",
        date: days(2),
        materialId: "r2",
        quantity: 45,
        remarks: "Hand wash batch HW-2611",
      },
    ]);
    this.set("products", [
      {
        id: "p1",
        code: "FG-101",
        name: "Lemon Floor Cleaner 1L",
        category: "Floor Care",
      },
      {
        id: "p2",
        code: "FG-102",
        name: "Aloe Hand Wash 500ml",
        category: "Personal Hygiene",
      },
      {
        id: "p3",
        code: "FG-103",
        name: "Disinfectant Liquid 5L",
        category: "Disinfection",
      },
    ]);
    this.set("productionEntries", [
      {
        id: "pe1",
        date: today,
        productId: "p1",
        batch: "FC-260623-A",
        quantity: 1200,
        stage: 4,
      },
      {
        id: "pe2",
        date: today,
        productId: "p2",
        batch: "HW-260623-B",
        quantity: 850,
        stage: 2,
      },
      {
        id: "pe3",
        date: days(3),
        productId: "p3",
        batch: "DL-260620-A",
        quantity: 500,
        stage: 5,
      },
      {
        id: "pe4",
        date: days(8),
        productId: "p1",
        batch: "FC-260615-C",
        quantity: 1000,
        stage: 5,
      },
    ]);
    this.set("finishedGoods", [
      {
        id: "f1",
        productId: "p3",
        batch: "DL-260620-A",
        manufacturingDate: days(3),
        quantity: 420,
        dispatched: 80,
        status: "Available",
        sourceProduction: "pe3",
      },
      {
        id: "f2",
        productId: "p1",
        batch: "FC-260615-C",
        manufacturingDate: days(8),
        quantity: 750,
        dispatched: 250,
        status: "Available",
        sourceProduction: "pe4",
      },
    ]);
    this.set("packagingMaterials", [
      {
        id: "pk1",
        code: "PK-101",
        name: "1L HDPE Bottle",
        type: "Bottles",
        currentStock: 2450,
        minStock: 1000,
      },
      {
        id: "pk2",
        code: "PK-102",
        name: "28mm Flip Top Cap",
        type: "Caps",
        currentStock: 890,
        minStock: 1000,
      },
      {
        id: "pk3",
        code: "PK-103",
        name: "Floor Cleaner Label",
        type: "Labels",
        currentStock: 3100,
        minStock: 1200,
      },
      {
        id: "pk4",
        code: "PK-104",
        name: "12 Bottle Carton",
        type: "Cartons",
        currentStock: 160,
        minStock: 200,
      },
    ]);
    this.set("packagingUsage", [
      { id: "pu1", date: today, materialId: "pk1", used: 1200, damaged: 18 },
      { id: "pu2", date: today, materialId: "pk3", used: 1190, damaged: 8 },
    ]);
    localStorage.setItem(this.key("erpSeeded"), "1");
  },
};

const state = {
  page: "dashboard",
  search: "",
  filters: {},
  attendanceDate: dateISO(),
  salaryFrom: dateISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  salaryTo: dateISO(),
  attendanceRecordFrom: dateISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  attendanceRecordTo: dateISO(),
  attendanceRecordEmployee: "",
  rawMaterialFrom: dateISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  rawMaterialTo: dateISO(),
  consumptionFrom: dateISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  consumptionTo: dateISO(),
  productionFrom: dateISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  productionTo: dateISO(),
  finishedFrom: dateISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  finishedTo: dateISO(),
  packagingFrom: dateISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  packagingTo: dateISO(),
  packagingUsageFrom: dateISO(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  packagingUsageTo: dateISO(),
  productionStockProduct: "",
  stockProduct: "",
  materialsTab: "stock",
};
const navItems = [
  ["dashboard", "⌂", "Dashboard"],
  ["employees", "👥", "Employees"],
  ["attendance", "◷", "Attendance"],
  ["rawMaterials", "▣", "Materials"],
  ["finishedGoods", "✓", "Finished Goods"],
  ["reports", "▤", "Reports"],
  ["settings", "⚙", "Settings"],
];
const stages = [
  "Chemical Produced",
  "Filling Completed",
  "Labeling Completed",
  "Packing Completed",
  "Ready For Dispatch",
];
const schemas = {
  employees: {
    title: "Employee",
    collection: "employees",
    idField: "employeeId",
    fields: [
      ["employeeId", "Employee ID", "text", true],
      ["name", "Employee Name", "text", true],
      [
        "department",
        "Department",
        "select",
        ["Production", "Quality", "Packaging", "Stores", "Administration"],
      ],
      ["designation", "Designation", "text", true],
      ["joiningDate", "Joining Date", "date", true],
      ["workingHours", "Daily Working Hours", "number", true],
      ["dailyWage", "Daily Wage", "number", true],
      ["phone", "Phone Number", "tel", true],
      ["status", "Status", "select", ["Active", "Inactive"]],
    ],
    columns: [
      ["employeeId", "Employee ID"],
      ["name", "Employee"],
      ["department", "Department"],
      ["designation", "Designation"],
      ["workingHours", "Daily Hours"],
      ["dailyWage", "Daily Wage"],
      ["phone", "Phone"],
      ["status", "Status"],
    ],
  },
  rawMaterials: {
    title: "Raw Material",
    collection: "rawMaterials",
    idField: "code",
    fields: [
      ["entryDate", "Entry Date", "date", true],
      ["code", "Material Code", "text", true],
      ["name", "Material Name", "text", true],
      ["category", "Category", "text", true],
      ["unit", "Unit", "select", ["KG", "L", "G", "ML", "Units"]],
      ["currentStock", "Current Stock", "number", true],
      ["minStock", "Minimum Stock", "number", true],
    ],
    columns: [
      ["entryDate", "Entry Date"],
      ["code", "Code"],
      ["name", "Material"],
      ["category", "Category"],
      ["unit", "Unit"],
      ["currentStock", "Current Stock"],
      ["minStock", "Minimum"],
      ["stockStatus", "Stock Status"],
    ],
  },
  products: {
    title: "Product",
    collection: "products",
    idField: "code",
    fields: [
      ["code", "Product Code", "text", true],
      ["name", "Product Name", "text", true],
      ["category", "Product Category", "text", true],
      ["piecesPerBox", "Pieces per Box", "number", true],
      ["minFinishedStock", "Minimum Finished Stock (Pieces)", "number", false],
    ],
    columns: [
      ["code", "Code"],
      ["name", "Product"],
      ["category", "Category"],
      ["piecesPerBox", "Pieces/Box"],
      ["minFinishedStock", "Minimum Stock"],
    ],
  },
  production: {
    title: "Production Entry",
    collection: "productionEntries",
    fields: [
      ["date", "Production Date", "date", true],
      ["productId", "Product", "relation:products", true],
      [
        "productionRecord",
        "Entry For",
        "select",
        ["Chemical produced", "Filling completed", "Labeling completed", "Packing completed", "Finished goods ready"],
      ],
      ["quantity", "Quantity", "number", true],
      ["unit", "Unit", "select", ["Units", "L", "KG", "ML", "G", "Boxes", "Pieces"]],
      ["batch", "Batch", "text", true],
    ],
    columns: [
      ["date", "Date"],
      ["productId", "Product"],
      ["productionRecord", "Entry For"],
      ["quantity", "Quantity"],
      ["unit", "Unit"],
      ["batch", "Batch"],
    ],
  },
  finishedGoods: {
    title: "Finished Good",
    collection: "finishedGoods",
    fields: [
      ["productId", "Product", "relation:products", true],
      ["batch", "Batch Number", "text", true],
      ["manufacturingDate", "Manufacturing Date", "date", true],
      ["quantity", "Pieces", "number", true],
      ["boxes", "Boxes", "number", true],
    ],
    columns: [
      ["productId", "Product"],
      ["batch", "Batch"],
      ["manufacturingDate", "Mfg. Date"],
      ["quantity", "Pieces"],
      ["boxes", "Boxes"],
    ],
  },
  packagingMaterials: {
    title: "Packaging Material",
    collection: "packagingMaterials",
    idField: "code",
    fields: [
      ["entryDate", "Entry Date", "date", true],
      ["code", "Material Code", "text", true],
      ["name", "Material Name", "text", true],
      [
        "type",
        "Material Type",
        "select",
        [
          "Bottles",
          "Caps",
          "Labels",
          "Cartons",
          "Shrink Wrap",
          "Stickers",
          "Pouches",
          "Others",
        ],
      ],
      ["currentStock", "Current Stock", "number", true],
      ["minStock", "Minimum Stock", "number", true],
    ],
    columns: [
      ["entryDate", "Entry Date"],
      ["code", "Code"],
      ["name", "Material"],
      ["type", "Type"],
      ["currentStock", "Current Stock"],
      ["minStock", "Minimum"],
      ["stockStatus", "Stock Status"],
    ],
  },
};

function dateISO(d = new Date()) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}
function cleanDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? value : dateISO();
}
function cleanText(value) {
  if (value == null || Number.isNaN(value)) return "";
  const text = String(value);
  const lowered = text.trim().toLowerCase();
  return lowered === "nan" || lowered === "nana" ? "" : text;
}
function csvText(value) {
  return `"${cleanText(value).replaceAll('"', '""')}"`;
}
function fmtNum(n) {
  return Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
function esc(v) {
  return cleanText(v).replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
}
function relation(collection, id) {
  return DB.get(collection).find((x) => x.id === id)?.name || "-";
}
function badge(v) {
  const c = /active|present|available|dispatch/i.test(v)
    ? "green"
    : /absent|inactive|low|hold/i.test(v)
      ? "red"
      : /half|leave|reserved/i.test(v)
        ? "orange"
        : "blue";
  return `<span class="badge ${c}">${esc(v)}</span>`;
}
function toast(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  $("#toastWrap").append(el);
  setTimeout(() => el.remove(), 2800);
}
function $(s) {
  return document.querySelector(s);
}
function $$(s) {
  return [...document.querySelectorAll(s)];
}

function init() {
  setupLogin();
  const savedSession = JSON.parse(sessionStorage.getItem("hygisolve:session") || "null"),
    savedDepot = savedSession?.depotId || sessionStorage.getItem("hygisolve:depot");
  currentDepot = DEPOTS.find((x) => x.id === savedDepot) || null;
  if (!currentDepot) return showLogin();
  startApp();
}
function setupLogin() {
  refreshDepotOptions();
  $("#loginForm").onsubmit = (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.target));
    const depot = DEPOTS.find((x) => x.id === values.depot);
    const validLogin = depot && values.username.trim() === depot.username && values.password === depot.password;
    if (!validLogin) {
      $("#loginError").textContent = "The username or password does not match the selected depot.";
      return;
    }
    currentDepot = depot;
    sessionStorage.setItem("hygisolve:depot", depot.id);
    sessionStorage.setItem("hygisolve:session", JSON.stringify({ depotId: depot.id, username: depot.username }));
    $("#loginError").textContent = "";
    e.target.reset();
    $("#loginScreen").classList.add("hidden");
    startApp();
  };
  $("#showCreateDepot").onclick = () => switchLoginView("create");
  $("#cancelCreateDepot").onclick = () => {
    refreshDepotOptions();
    switchLoginView(DEPOTS.length ? "signin" : "create");
  };
  $("#createDepotForm").onsubmit = createDepot;
  $("#createDepotSubmit").onclick = () => $("#createDepotError").textContent = "";
}
function refreshDepotOptions(selectedId = "") {
  DEPOTS = loadDepots().filter(isValidDepotRecord);
  if (DEPOTS.length) saveDepots();
  else localStorage.removeItem("hygisolve:depots");
  $("#loginDepot").innerHTML = DEPOTS.length
    ? DEPOTS.map(
        (x) => `<option value="${esc(String(x.id).trim())}" ${x.id === selectedId ? "selected" : ""}>${esc(String(x.name).trim())} - ${esc(String(x.location).trim())}</option>`,
      ).join("")
    : '<option value="">No depots created yet</option>';
  $("#loginDepot").disabled = !DEPOTS.length;
  $("#loginSubmit").disabled = !DEPOTS.length;
}
function switchLoginView(view) {
  const creating = view === "create";
  $("#signInView").classList.toggle("hidden", creating);
  $("#createDepotView").classList.toggle("hidden", !creating);
  $("#cancelCreateDepot").hidden = !DEPOTS.length;
  $("#loginError").textContent = "";
  $("#createDepotError").textContent = "";
  (creating ? $("#depotName") : $("#loginUsername")).focus();
}
function createDepot(e) {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(e.target));
  const adminUsername = values.username.trim();
  const adminPassword = values.password;
  if (![values.name, values.location, values.username, values.password, values.adminName].every(validDepotText)) {
    $("#createDepotError").textContent = "Please enter clean depot and administrator details.";
    return;
  }
  if (adminPassword.length < 6) {
    $("#createDepotError").textContent = "Password must be at least 6 characters.";
    return;
  }
  const idBase = values.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "depot";
  let id = idBase;
  let suffix = 2;
  while (DEPOTS.some((depot) => depot.id === id)) id = `${idBase}-${suffix++}`;
  if (DEPOTS.some((depot) => depot.username.toLowerCase() === adminUsername.toLowerCase())) {
    $("#createDepotError").textContent = "That username is already in use.";
    return;
  }
  const depot = {
    id,
    name: values.name.trim(),
    location: values.location.trim(),
    username: adminUsername,
    password: values.password,
    user: values.adminName.trim(),
    role: values.role.trim() || "Depot Administrator",
  };
  if (!isValidDepotRecord(depot)) {
    $("#createDepotError").textContent = "Something is missing in depot details. Please check and try again.";
    return;
  }
  DEPOTS.push(depot);
  saveDepots();
  refreshDepotOptions(id);
  e.target.reset();
  switchLoginView("signin");
  $("#loginUsername").value = depot.username;
  $("#loginPassword").focus();
  $("#loginNotice").textContent = `${depot.name} created. Enter the administrator password to sign in.`;
}
function showLogin() {
  $("#loginScreen").classList.remove("hidden");
  refreshDepotOptions();
  if (DEPOTS.length) switchLoginView("signin");
  else switchLoginView("create");
}
function logout() {
  sessionStorage.removeItem("hygisolve:depot");
  sessionStorage.removeItem("hygisolve:session");
  currentDepot = null;
  state.page = "dashboard";
  showLogin();
}
function startApp() {
  DB.seed();
  $("#loginScreen").classList.add("hidden");
  const userName = currentDepot.user || "Administrator";
  const userRole = currentDepot.role || "Depot Administrator";
  $("#profileName").textContent = userName;
  $("#profileRole").textContent = `${userRole} - ${currentDepot.name}`;
  $("#profileAvatar").textContent = userName.split(" ").map((x) => x[0]).join("").slice(0, 2);
  $("#depotStatus").textContent = `${currentDepot.name} operational`;
  $("#depotStatusSub").textContent = currentDepot.location;
  $("#nav").innerHTML = navItems
    .map(
      ([id, ic, l]) =>
        `<button data-page="${id}"><span class="ico">${ic}</span><span class="nav-label">${esc(l)}</span></button>`,
    )
    .join("");
  $("#nav").onclick = (e) => {
    const b = e.target.closest("button");
    if (b) navigate(b.dataset.page);
  };
  $("#menuBtn").onclick = () => {
    $("#sidebar").classList.add("open");
    $("#overlay").classList.add("menu-open");
  };
  $("#sidebarClose").onclick = closeMenu;
  $("#overlay").onclick = () => {
    closeModal();
    closeMenu();
  };
  $("#modalClose").onclick = $("#modalCancel").onclick = closeModal;
  $("#globalSearch").oninput = (e) => {
    state.search = e.target.value;
    render();
  };
  $("#notificationBtn").onclick = () => navigate("dashboard");
  $("#profileButton").onclick = logout;
  render();
}
function closeMenu() {
  $("#sidebar").classList.remove("open");
  $("#overlay").classList.remove("menu-open");
}
function navigate(p) {
  state.page = p;
  state.search = "";
  $("#globalSearch").value = "";
  closeMenu();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function setHeader(title, eyebrow) {
  $("#pageTitle").textContent = title;
  $("#eyebrow").textContent = eyebrow;
  $$("#nav button").forEach((b) =>
    b.classList.toggle("active", b.dataset.page === state.page),
  );
  const alerts = lowStock().length;
  $("#notificationCount").textContent = alerts;
}
function render() {
  const renderers = {
    dashboard: renderDashboard,
    employees: () => renderMaster("employees"),
    attendance: renderAttendance,
    rawMaterials: renderRawMaterials,
    finishedGoods: renderFinishedGoods,
    reports: renderReports,
    settings: renderSettings,
  };
  if (!renderers[state.page]) state.page = "dashboard";
  renderers[state.page]();
}

function lowStock() {
  return [
    ...DB.get("rawMaterials")
      .filter((x) => +x.currentStock <= +x.minStock)
      .map((x) => ({ ...x, kind: "Raw material" })),
    ...DB.get("packagingMaterials")
      .filter((x) => +x.currentStock <= +x.minStock)
      .map((x) => ({ ...x, kind: "Packaging" })),
  ];
}
function sumNumbers(rows, field) {
  return rows.reduce((total, row) => total + (+row[field] || 0), 0);
}
function prodInDays(days) {
  const cut = new Date();
  cut.setDate(cut.getDate() - days + 1);
  return DB.get("productionEntries")
    .filter((x) => new Date(x.date) >= new Date(dateISO(cut)))
    .reduce((s, x) => s + (+x.quantity || 0), 0);
}
function statCard(label, value, icon, color, trend = "Live data") {
  const iconMap = {
    Emp: "👥",
    OK: "✓",
    FG: "📦",
    Raw: "⚗",
    Stock: "▦",
    Used: "↘",
    P: "•",
    B: "□",
    S: "▦",
    U: "↘",
    D: "◷",
    W: "◷",
    M: "◷",
    X: "✕",
    "#": "№",
    "!": "!",
  };
  const shownIcon = iconMap[icon] || icon;
  return `<article class="stat-card" style="--accent:${color}"><div class="stat-top"><span>${esc(label)}</span><span class="stat-icon">${esc(shownIcon)}</span></div><h3>${esc(value)}</h3><span class="trend neutral">${esc(trend)}</span></article>`;
}
function lineChart(values, labels, color = "#1677ff") {
  const w = 600,
    h = 220,
    p = 28,
    max = Math.max(...values, 1),
    pts = values.map(
      (v, i) =>
        `${p + (i * (w - 2 * p)) / (values.length - 1)},${h - p - (v / (max * 1.15)) * (h - 2 * p)}`,
    );
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${[0, 1, 2, 3].map((i) => `<line class="grid" x1="${p}" y1="${p + i * 48}" x2="${w - p}" y2="${p + i * 48}"/>`).join("")}<polygon class="area" fill="${color}" points="${p},${h - p} ${pts.join(" ")} ${w - p},${h - p}"/><polyline class="line" stroke="${color}" points="${pts.join(" ")}"/>${pts
    .map((x, i) => {
      const [cx, cy] = x.split(",");
      return `<circle class="dot" fill="${color}" cx="${cx}" cy="${cy}" r="5"/><text x="${cx}" y="${h - 5}" text-anchor="middle">${labels[i]}</text>`;
    })
    .join("")}</svg>`;
}
function chartOrEmpty(values, labels, color, message) {
  return values.some((value) => value > 0)
    ? lineChart(values, labels, color)
    : `<div class="empty chart-empty">${message}</div>`;
}
function renderDashboard() {
  setHeader("Dashboard", "Operations overview");
  const emp = DB.get("employees"),
    att = DB.get("attendance").filter((x) => x.date === dateISO()),
    raw = DB.get("rawMaterials"),
    pack = DB.get("packagingMaterials"),
    fg = DB.get("finishedGoods"),
    alerts = lowStock();
  const present = att.filter(
      (x) => x.status === "Present" || x.status === "Half Day",
    ).length,
    absent = att.filter((x) => x.status === "Absent").length;
  const dayOffsets = [6, 5, 4, 3, 2, 1, 0],
    finishedTrend = dayOffsets.map((n) => {
      const d = dateISO(new Date(Date.now() - n * 864e5));
      return DB.get("finishedGoods")
        .filter((x) => x.manufacturingDate === d)
        .reduce((s, x) => s + (+x.quantity || 0), 0);
    }),
    attendanceTrend = dayOffsets.map((n) => {
      const d = dateISO(new Date(Date.now() - n * 864e5));
      return DB.get("attendance").filter(
        (x) => x.date === d && ["Present", "Half Day", "Overtime"].includes(x.status),
      ).length;
    }),
    consumptionTrend = dayOffsets.map((n) => {
      const d = dateISO(new Date(Date.now() - n * 864e5));
      return DB.get("materialConsumption")
        .filter((x) => x.date === d)
        .reduce((sum, x) => sum + (+x.quantity || 0), 0);
    }),
    labels = dayOffsets.map((n) =>
      new Date(Date.now() - n * 864e5).toLocaleDateString("en", {
        weekday: "short",
      }),
    );
  $("#app").innerHTML =
    `<div class="page-actions"><div class="page-intro"><h2>Good morning, ${esc(currentDepot.user || "Administrator")}</h2><p>Here is what is happening across your manufacturing floor today.</p></div>${adminHTML(`<button class="btn primary" onclick="navigate('finishedGoods')">+ Add finished goods</button>`)}</div><div class="stats-grid">${statCard("Total Employees", emp.length, "Emp", "#1677ff", "Current workforce")}${statCard("Present Today", present, "OK", "#17a673", Math.round((present / Math.max(emp.filter((x) => x.status === "Active").length, 1)) * 100) + "% attendance")}${statCard("Finished Goods", fmtNum(fg.length), "FG", "#11b8bd", "Manual records")}${statCard("Low Stock Alerts", alerts.length, "!", "#f59e0b", "Requires attention")}</div>
 <div class="dashboard-grid"><div class="card chart-card"><div class="chart-head"><div><h3>Finished goods trend</h3><span>Manual finished goods entries for the last 7 days</span></div><b>${fmtNum(finishedTrend.reduce((a, x) => a + x, 0))} pieces</b></div>${chartOrEmpty(finishedTrend, labels, "#1677ff", "No finished goods recorded in the last 7 days.")}</div><div class="card"><div class="chart-head"><div><h3>Inventory composition</h3><span>Current item categories</span></div></div><div class="donut-wrap"><div class="donut"></div><div class="legend"><div><i style="background:#1677ff"></i>Raw (${raw.length})</div><div><i style="background:#11b8bd"></i>Packaging (${pack.length})</div><div><i style="background:#f59e0b"></i>Finished (${fg.length})</div></div></div></div></div>
 <div class="dashboard-grid"><div class="card"><div class="chart-head"><div><h3>Attendance trend</h3><span>Present employee count</span></div><b>${absent} absent today</b></div>${chartOrEmpty(attendanceTrend, labels, "#17a673", "No attendance recorded in the last 7 days.")}</div><div class="card"><div class="chart-head"><div><h3>Low stock alerts</h3><span>Materials at or below minimum</span></div></div><div class="alert-list">${
   alerts.length
     ? alerts
         .slice(0, 5)
         .map(
           (x) =>
             `<div class="alert-item"><div><strong>${esc(x.name)}</strong><span>${x.kind} - Min ${fmtNum(x.minStock)}</span></div><b>${fmtNum(x.currentStock)}</b></div>`,
         )
         .join("")
     : '<div class="empty">All stock levels look healthy.</div>'
 }</div></div></div>
 <div class="dashboard-grid"><div class="card"><div class="chart-head"><div><h3>Material consumption</h3><span>Recent recorded consumption</span></div></div>${chartOrEmpty(consumptionTrend, labels, "#f59e0b", "No material consumption recorded in the last 7 days.")}</div><div class="card"><div class="chart-head"><div><h3>Finished goods snapshot</h3><span>Manual finished stock records</span></div></div><div class="activity"><div class="activity-item"><div class="activity-icon">FG</div><div><p><b>${fmtNum(fg.length)}</b> finished records</p><small>Batch-wise manual entries</small></div></div><div class="activity-item"><div class="activity-icon">P</div><div><p><b>${fmtNum(fg.reduce((sum, row) => sum + (+row.quantity || 0), 0))}</b> pieces</p><small>Total finished pieces</small></div></div><div class="activity-item"><div class="activity-icon">B</div><div><p><b>${fmtNum(fg.reduce((sum, row) => sum + finishedGoodBoxes(row), 0))}</b> boxes</p><small>Total finished boxes</small></div></div></div></div></div>`;
}

function pageIntro(title, desc, button = "") {
  return `<div class="page-actions"><div class="page-intro"><h2>${title}</h2><p>${desc}</p></div>${button}</div>`;
}
function renderMaster(key) {
  const s = schemas[key];
  setHeader(
    key === "employees"
      ? "Employees"
      : key === "finishedGoods"
        ? "Finished Goods"
        : "Master Data",
    "Management workspace",
  );
  let rows = DB.get(s.collection);
  const q = state.search.toLowerCase();
  if (q)
    rows = rows.filter((x) =>
      Object.values(x).some((v) => String(v).toLowerCase().includes(q)),
    );
  $("#app").innerHTML =
    pageIntro(
      `${s.title} Management`,
      `Manage, search and maintain ${s.title.toLowerCase()} records.`,
      adminHTML(`<button class="btn primary" onclick="openForm('${key}')">+ Add ${s.title}</button>`),
    ) + tableCard(key, rows, s);
}
function tableCard(key, rows, s, extra = "") {
  return `<div class="card table-card"><div class="toolbar"><div class="toolbar-left"><input class="input" placeholder="Search records..." value="${esc(state.search)}" oninput="state.search=this.value;render()">${extra}</div><div class="toolbar-right"><span class="badge blue">${rows.length} records</span><button class="btn secondary small" onclick="exportCSV('${s.collection}')">Export CSV</button><button class="btn secondary small" onclick="window.print()">Print</button></div></div><div class="table-wrap"><table><thead><tr>${s.columns.map((c) => `<th>${c[1]}</th>`).join("")}<th>Actions</th></tr></thead><tbody>${rows.length ? rows.map((r) => `<tr>${s.columns.map((c) => `<td>${cell(key, c[0], r)}</td>`).join("")}<td><div class="actions">${tableActions(key, r)}</div></td></tr>`).join("") : `<tr><td colspan="${s.columns.length + 1}"><div class="empty">No records found.</div></td></tr>`}</tbody></table></div></div>`;
}
function tableActions(key, r) {
  const stockActions =
    key === "rawMaterials"
      ? `<button class="action-btn stock-add-action" title="Increase stock" onclick="openStockIncrease('${r.id}')">+ Stock</button><button class="action-btn stock-action" title="Decrease stock" onclick="openTransaction('raw','${r.id}')">- Stock</button>`
      : key === "packagingMaterials"
        ? `<button class="action-btn stock-add-action" title="Increase stock" onclick="openPackagingStockIncrease('${r.id}')">+ Stock</button><button class="action-btn stock-action" title="Record usage" onclick="openTransaction('pack','${r.id}')">Usage</button>`
        : "";
  return `${adminHTML(stockActions)}<button class="action-btn" title="View" onclick="viewRecord('${key}','${r.id}')">View</button>${adminHTML(`<button class="action-btn" title="Edit" onclick="openForm('${key}','${r.id}')">Edit</button><button class="action-btn" title="Delete" onclick="deleteRecord('${key}','${r.id}')">Delete</button>`)}`;
}
function cell(key, f, r) {
  let v = r[f];
  if (f === "workingHours") v = +v || 8;
  if (f === "productId") v = relation("products", v);
  if (f === "productionRecord")
    return esc(v || stages[(+r.stage || 1) - 1] || "-");
  if (f === "unit") return esc(v || "Units");
  if (f === "piecesPerBox") return fmtNum(+v || 1);
  if (f === "materialPerPiece") return fmtNum(+v || +r.chemicalPerPiece || 1);
  if (f === "materialUnit") return esc(v || (r.chemicalPerPiece ? "L" : "ML"));
  if (f === "minFinishedStock") return fmtNum(+v || 0);
  if (f === "boxes") return fmtNum(finishedGoodBoxes(r));
  if (f === "remarks") return esc(v || "-");
  if (f === "stockStatus")
    return badge(+r.currentStock <= +r.minStock ? "Low Stock" : "In Stock");
  if (f === "status") return badge(v);
  if (f === "stage") {
    const p = +v * 20;
    return `<div><b>${p}%</b><div class="progress"><span style="width:${p}%"></span></div></div>`;
  }
  if (f === "stageName") return badge(stages[(+r.stage || 1) - 1]);
  if (/quantity|Stock|Salary|Wage|dispatched/i.test(f)) return fmtNum(v);
  return esc(v);
}
function finishedGoodBoxes(row) {
  if (row.boxes !== undefined && row.boxes !== "") return +row.boxes || 0;
  const product = DB.get("products").find((x) => x.id === row.productId) || {},
    piecesPerBox = Math.max(+product.piecesPerBox || 1, 1);
  return (+row.quantity || 0) / piecesPerBox;
}
function finishedStockSummary() {
  const finished = DB.get("finishedGoods"),
    products = DB.get("products");
  return products.map((product) => {
    const productRows = finished.filter((row) => row.productId === product.id),
      pieces = productRows.reduce((a, row) => a + +row.quantity, 0),
      boxes = productRows.reduce((a, row) => a + finishedGoodBoxes(row), 0),
      minimum = +product.minFinishedStock || 0;
    return {
      product,
      pieces,
      boxes,
      minimum,
      status: minimum > 0 && pieces <= minimum ? "Low Stock" : "In Stock",
    };
  });
}
function renderFinishedStockSummary(rows = finishedStockSummary()) {
  return `<div class="section-filter finished-stock-filter"><div><b>Finished goods stock available</b><span>Product-wise available stock and low stock status</span></div></div><div class="card table-card finished-stock-summary"><div class="table-wrap"><table><thead><tr><th>Product</th><th>Available Pieces</th><th>Available Boxes</th><th>Minimum Stock</th><th>Status</th></tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td><b>${esc(row.product.name)}</b><br><small>${esc(row.product.code || "")}</small></td><td>${fmtNum(row.pieces)}</td><td>${fmtNum(row.boxes)}</td><td>${row.minimum ? fmtNum(row.minimum) : "-"}</td><td>${badge(row.status)}</td></tr>`).join("") : '<tr><td colspan="5"><div class="empty">No products added yet.</div></td></tr>'}</tbody></table></div></div>`;
}

function renderRawMaterials() {
  setHeader("Materials", "Inventory control");
  ensureRawMaterialEntryRecords();
  ensurePackagingEntryRecords();
  const rawSchema = schemas.rawMaterials,
    packSchema = schemas.packagingMaterials,
    allRows = DB.get("rawMaterials"),
    rawRows = allRows.filter(
      (x) => !x.entryDate || (x.entryDate >= state.rawMaterialFrom && x.entryDate <= state.rawMaterialTo),
    ),
    packagingRows = DB.get("packagingMaterials"),
    entries = DB.get("rawMaterialEntries")
      .filter((x) => x.date >= state.rawMaterialFrom && x.date <= state.rawMaterialTo)
      .sort((a, b) => b.date.localeCompare(a.date)),
    consumption = DB.get("materialConsumption")
      .filter((x) => x.date >= state.consumptionFrom && x.date <= state.consumptionTo)
      .sort((a, b) => b.date.localeCompare(a.date)),
    packagingEntries = DB.get("packagingEntries")
      .filter((x) => x.date >= state.packagingFrom && x.date <= state.packagingTo)
      .sort((a, b) => b.date.localeCompare(a.date)),
    packagingUsage = DB.get("packagingUsage")
      .filter((x) => x.date >= state.packagingUsageFrom && x.date <= state.packagingUsageTo)
      .sort((a, b) => b.date.localeCompare(a.date)),
    materialTypes = rawRows.length + packagingRows.length,
    lowStockCount =
      rawRows.filter((x) => (+x.currentStock || 0) <= (+x.minStock || 0)).length +
      packagingRows.filter((x) => (+x.currentStock || 0) <= (+x.minStock || 0)).length,
    usedTotal =
      sumNumbers(consumption, "quantity") +
      packagingUsage.reduce((sum, row) => sum + (+row.used || 0) + (+row.damaged || 0), 0);
  const tabs = [
      ["stock", "Stock"],
      ["entries", "Entry Records"],
      ["consumption", "Consumption"],
    ],
    activeTab = state.materialsTab || "stock",
    tabNav = `<div class="section-tabs">${tabs.map(([id, label]) => `<button class="${activeTab === id ? "active" : ""}" onclick="state.materialsTab='${id}';render()">${label}</button>`).join("")}</div>`,
    stockView =
      `<div class="section-filter compact-filter"><div><b>Raw materials available</b><span>Current raw material stock and entry date filter</span></div>${dateRangeFields("rawMaterialFrom", "rawMaterialTo")}</div>` +
      tableCard("rawMaterials", rawRows, rawSchema) +
      `<div class="section-filter packaging-filter compact-filter"><div><b>Packaging materials available</b><span>Current packaging stock and low stock status</span></div><div class="filter-actions"><button class="btn secondary small" onclick="exportPackagingStockCSV()">Export CSV</button></div></div>` +
      tableCard("packagingMaterials", packagingRows, packSchema),
    entryView =
      renderEntryRecords(entries, allRows) +
      renderPackagingEntryRecords(packagingEntries, packagingRows),
    consumptionView =
      renderConsumptionRecords(consumption, allRows) +
      renderPackagingUsageRecords(packagingUsage, packagingRows);
  $("#app").innerHTML =
    pageIntro(
      "Materials Inventory",
      "Manage raw materials and packaging materials from one place.",
      adminHTML(`<div><button class="btn secondary" onclick="openTransaction('raw')">Raw consumption</button> <button class="btn secondary" onclick="openTransaction('pack')">Packaging usage</button> <button class="btn primary" onclick="openForm('rawMaterials')">+ Raw material</button> <button class="btn primary" onclick="openForm('packagingMaterials')">+ Packaging material</button></div>`),
    ) +
    `<div class="stats-grid">${statCard("Material Types", materialTypes, "▣", "#1677ff")}${statCard("Raw Stock", fmtNum(sumNumbers(rawRows, "currentStock")), "⚗", "#11b8bd")}${statCard("Packaging Stock", fmtNum(sumNumbers(packagingRows, "currentStock")), "□", "#17a673")}${statCard("Low Stock", lowStockCount, "!", "#e45454")}${statCard("Used in Range", fmtNum(usedTotal), "Used", "#f59e0b")}</div>` +
    tabNav +
    (activeTab === "entries" ? entryView : activeTab === "consumption" ? consumptionView : stockView);
}
function dateRangeFields(fromKey, toKey) {
  state[fromKey] = cleanDate(state[fromKey]);
  state[toKey] = cleanDate(state[toKey]);
  return `<div class="salary-date-filter"><label>From <input class="input" type="date" value="${esc(state[fromKey])}" onchange="setDateState('${fromKey}', this.value)"></label><label>To <input class="input" type="date" value="${esc(state[toKey])}" onchange="setDateState('${toKey}', this.value)"></label></div>`;
}
function setDateState(key, value, quiet = false) {
  state[key] = cleanDate(value);
  if (!quiet) render();
}
function setFilterState(key, value, quiet = false) {
  state[key] = value || "";
  if (!quiet) render();
}
function ensureRawMaterialEntryRecords() {
  const savedEntries = DB.get("rawMaterialEntries"),
    hadMissingId = savedEntries.some((entry) => !entry.id),
    existing = savedEntries.map((entry) => ({
      ...entry,
      id: entry.id || crypto.randomUUID(),
    })),
    existingSources = new Set(existing.map((x) => x.sourceId)),
    missing = DB.get("rawMaterials")
      .filter((material) => !existingSources.has(`material:${material.id}`))
      .map((material) => ({
        id: crypto.randomUUID(),
        date: material.entryDate || dateISO(),
        materialId: material.id,
        materialCode: material.code,
        materialName: material.name,
        unit: material.unit,
        quantity: +material.currentStock || 0,
        type: "Opening stock",
        remarks: "Created from existing material record",
        sourceId: `material:${material.id}`,
      }));
  if (missing.length || hadMissingId) DB.set("rawMaterialEntries", [...missing, ...existing]);
}
function renderEntryRecords(rows, materials = DB.get("rawMaterials")) {
  const materialLabel = (row) => {
    const material = materials.find((x) => x.id === row.materialId);
    if (material) return `${material.code} - ${material.name}`;
    return row.materialCode || row.materialName
      ? `${row.materialCode || "Deleted"} - ${row.materialName || "material"}`
      : "Deleted material";
  };
  return `<div class="section-filter entry-filter"><div><b>Raw material entry records</b><span>All stock added within the selected period</span></div><div class="filter-actions">${dateRangeFields("rawMaterialFrom", "rawMaterialTo")}<button class="btn secondary small" onclick="exportEntryCSV()">Export CSV</button></div></div><div class="card table-card entry-records"><div class="table-wrap"><table><thead><tr><th>Date</th><th>Material</th><th>Quantity Added</th><th>Entry Type</th><th>Remarks</th>${adminHTML("<th>Action</th>")}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td>${esc(row.date)}</td><td><b>${esc(materialLabel(row))}</b></td><td>${fmtNum(row.quantity)} ${esc(row.unit || "")}</td><td>${badge(row.type || "Stock entry")}</td><td>${esc(row.remarks || "-")}</td>${adminHTML(`<td><button class="action-btn undo-consumption-btn" title="Undo entry" onclick="undoRawEntry('${row.id}')">Undo</button></td>`)}</tr>`).join("") : `<tr><td colspan="${canEdit() ? 6 : 5}"><div class="empty">No raw material entry records found for this date range.</div></td></tr>`}</tbody></table></div></div>`;
}
function renderConsumptionRecords(rows, materials = DB.get("rawMaterials")) {
  const materialLabel = (id) => {
    const material = materials.find((x) => x.id === id);
    return material ? `${material.code} - ${material.name}` : "Deleted material";
  };
  return `<div class="section-filter consumption-filter"><div><b>Raw material consumption records</b><span>All usage recorded within the selected period</span></div><div class="filter-actions">${dateRangeFields("consumptionFrom", "consumptionTo")}<button class="btn secondary small" onclick="exportConsumptionCSV()">Export CSV</button></div></div><div class="card table-card consumption-records"><div class="table-wrap"><table><thead><tr><th>Date</th><th>Material</th><th>Quantity Used</th><th>Remarks</th>${adminHTML("<th>Action</th>")}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td>${esc(row.date)}</td><td><b>${esc(materialLabel(row.materialId))}</b></td><td>${fmtNum(row.quantity)}</td><td>${esc(row.remarks || "-")}</td>${adminHTML(`<td><button class="action-btn undo-consumption-btn" title="Undo consumption" onclick="undoConsumption('${row.id}')">Undo</button></td>`)}</tr>`).join("") : `<tr><td colspan="${canEdit() ? 5 : 4}"><div class="empty">No consumption records found for this date range.</div></td></tr>`}</tbody></table></div></div>`;
}
function undoRawEntry(recordId) {
  if (!adminOnly()) return;
  const record = DB.get("rawMaterialEntries").find((x) => x.id === recordId);
  if (!record) return toast("Entry record not found", "error");
  const material = DB.get("rawMaterials").find((x) => x.id === record.materialId);
  if (!material) {
    return toast("Cannot undo entry because this material no longer exists", "error");
  }
  if (+record.quantity > +material.currentStock) {
    return toast("Cannot undo because this stock is already used. Undo related consumption first.", "error");
  }
  if (!confirm(`Undo stock entry of ${fmtNum(record.quantity)} ${material.unit} for ${material.name}?`)) return;
  DB.update("rawMaterials", material.id, {
    currentStock: +material.currentStock - +record.quantity,
  });
  DB.remove("rawMaterialEntries", record.id);
  toast("Entry undone and stock reduced");
  render();
}
function undoConsumption(recordId) {
  if (!adminOnly()) return;
  const record = DB.get("materialConsumption").find((x) => x.id === recordId);
  if (!record) return toast("Consumption record not found", "error");
  const material = DB.get("rawMaterials").find((x) => x.id === record.materialId);
  if (!material) {
    return toast("Cannot restore stock because this material no longer exists", "error");
  }
  if (!confirm(`Undo consumption of ${fmtNum(record.quantity)} ${material.unit} for ${material.name}?`)) return;
  DB.update("rawMaterials", material.id, {
    currentStock: +material.currentStock + +record.quantity,
  });
  DB.remove("materialConsumption", record.id);
  toast("Consumption undone and stock restored");
  render();
}
function renderProduction() {
  setHeader("Production", "Manufacturing control");
  const q = state.search.toLowerCase();
  let productRows = DB.get("products"),
    rows = DB.get("productionEntries").filter(
      (x) => !x.date || (x.date >= state.productionFrom && x.date <= state.productionTo),
    ),
    s = schemas.production;
  if (q) {
    productRows = productRows.filter((x) =>
      Object.values(x).some((v) => String(v).toLowerCase().includes(q)),
    );
    rows = rows.filter((x) =>
      Object.values(x).some((v) => String(v).toLowerCase().includes(q)),
    );
  }
  $("#app").innerHTML =
    pageIntro(
      "Production Management",
      "Record each production activity with quantity and unit.",
      adminHTML(`<div><button class="btn secondary" onclick="openForm('products')">+ Add Product</button> <button class="btn primary" onclick="openForm('production')">+ Production entry</button></div>`),
    ) +
    `<div class="stats-grid">${statCard("Today", fmtNum(prodInDays(1)), "D", "#1677ff", "Quantity recorded")}${statCard("This Week", fmtNum(prodInDays(7)), "W", "#11b8bd", "Quantity recorded")}${statCard("This Month", fmtNum(prodInDays(30)), "M", "#17a673", "Quantity recorded")}${statCard("Entries", rows.length, "#", "#f59e0b", "Production records")}</div>` +
    renderProductRecords(productRows) +
    `<div class="section-filter production-filter"><div><b>Production records</b><span>Filter production entries by production date</span></div><div class="filter-actions">${dateRangeFields("productionFrom", "productionTo")}</div></div>` +
    tableCard("production", rows, s);
}
function renderProductRecords(rows) {
  const s = schemas.products;
  return `<div class="section-filter product-records-filter"><div><b>Product records</b><span>Edit products used for manual finished goods entries</span></div>${adminHTML(`<button class="btn secondary small" onclick="openForm('products')">+ Add Product</button>`)}</div><div class="card table-card product-records"><div class="table-wrap"><table><thead><tr>${s.columns.map((c) => `<th>${c[1]}</th>`).join("")}<th>Actions</th></tr></thead><tbody>${rows.length ? rows.map((row) => `<tr>${s.columns.map((c) => `<td>${cell("products", c[0], row)}</td>`).join("")}<td><div class="actions"><button class="action-btn" title="View product" onclick="viewRecord('products','${row.id}')">View</button>${adminHTML(`<button class="action-btn" title="Edit product" onclick="openForm('products','${row.id}')">Edit</button><button class="action-btn undo-consumption-btn" title="Delete product" onclick="deleteRecord('products','${row.id}')">Delete</button>`)}</div></td></tr>`).join("") : `<tr><td colspan="${s.columns.length + 1}"><div class="empty">No products found. Add a product before entering finished goods.</div></td></tr>`}</tbody></table></div></div>`;
}
function productionQuantityInStockUnits(entry) {
  const product = DB.get("products").find((x) => x.id === entry.productId) || {},
    piecesPerBox = Math.max(+product.piecesPerBox || 1, 1);
  return String(entry.unit || "").toLowerCase() === "boxes"
    ? (+entry.quantity || 0) * piecesPerBox
    : +entry.quantity || 0;
}
function productionStockRows() {
  const products = DB.get("products"),
    stock = new Map();
  const keyFor = (productId, stockType) => `${productId}::${stockType}`;
  DB.get("productionEntries").forEach((entry) => {
    const recordType = entry.productionRecord || stages[(+entry.stage || 1) - 1] || "";
    if (!entry.productId || !recordType) return;
    const isFinishedReady = String(recordType).toLowerCase() === "finished goods ready";
    const stockType = isFinishedReady ? "Packing completed" : recordType;
    if (!stockType) return;
    const key = keyFor(entry.productId, stockType),
      product = products.find((x) => x.id === entry.productId) || {},
      existing = stock.get(key) || {
        product,
        stockType,
        quantity: 0,
        unit: String(entry.unit || "Units").toLowerCase() === "boxes" ? "Pieces" : entry.unit || "Units",
      },
      qty = productionQuantityInStockUnits(entry);
    existing.quantity += isFinishedReady ? -qty : qty;
    if (existing.quantity < 0) existing.quantity = 0;
    stock.set(key, existing);
  });
  return [...stock.values()].sort((a, b) =>
    `${a.product.name || ""}${a.stockType}`.localeCompare(`${b.product.name || ""}${b.stockType}`),
  );
}
function renderProductionStock() {
  const products = DB.get("products"),
    rows = productionStockRows().filter(
      (row) => !state.productionStockProduct || row.product.id === state.productionStockProduct,
    ),
    selectedProduct = products.find((product) => product.id === state.productionStockProduct),
    productOptions = [`<option value="">All products</option>`]
      .concat(
        products.map(
          (product) =>
            `<option value="${product.id}" ${state.productionStockProduct === product.id ? "selected" : ""}>${esc(product.name)}</option>`,
        ),
      )
      .join("");
  return `<div class="section-filter production-stock-filter"><div><b>Production stock</b><span>${selectedProduct ? `Showing balance for ${esc(selectedProduct.name)}` : "Select a product to see chemical, labeled, packed and other stock left"}</span></div><div class="filter-actions"><label>Product <select class="input" onchange="state.productionStockProduct=this.value;render()">${productOptions}</select></label></div></div><div class="card table-card production-stock"><div class="table-wrap"><table><thead><tr><th>Stock Item</th><th>Quantity Left</th><th>Unit</th></tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td>${esc(row.stockType)}</td><td>${fmtNum(row.quantity)}</td><td>${esc(row.unit || "Units")}</td></tr>`).join("") : `<tr><td colspan="3"><div class="empty">${selectedProduct ? `No production stock available for ${esc(selectedProduct.name)} yet.` : "No production stock available yet."}</div></td></tr>`}</tbody></table></div></div>`;
}
function productionEntryPieces(entry, product) {
  const piecesPerBox = Math.max(+product.piecesPerBox || 1, 1);
  return String(entry.unit || "").toLowerCase() === "boxes"
    ? (+entry.quantity || 0) * piecesPerBox
    : +entry.quantity || 0;
}
function productionEntryLiters(entry) {
  return +entry.quantity || 0;
}
function materialPerPiece(product) {
  return Math.max(+product.materialPerPiece || +product.chemicalPerPiece || 1, 0);
}
function materialUnit(product) {
  return product.materialUnit || (product.chemicalPerPiece ? "L" : "ML");
}
function convertMaterialQuantity(quantity, fromUnit, toUnit) {
  const from = String(fromUnit || toUnit || "").toUpperCase(),
    to = String(toUnit || from || "").toUpperCase();
  if (from === to) return +quantity || 0;
  const liquid = { ML: 1, L: 1000 },
    weight = { G: 1, KG: 1000 };
  if (liquid[from] && liquid[to]) return ((+quantity || 0) * liquid[from]) / liquid[to];
  if (weight[from] && weight[to]) return ((+quantity || 0) * weight[from]) / weight[to];
  return +quantity || 0;
}
function displayMaterialQuantity(quantity, unit) {
  const normalizedUnit = String(unit || "").toUpperCase(),
    value = +quantity || 0;
  if (normalizedUnit === "ML" && Math.abs(value) >= 1000) {
    return { quantity: value / 1000, unit: "L" };
  }
  if (normalizedUnit === "G" && Math.abs(value) >= 1000) {
    return { quantity: value / 1000, unit: "KG" };
  }
  if (normalizedUnit === "L" && Math.abs(value) > 0 && Math.abs(value) < 1) {
    return { quantity: value * 1000, unit: "ML" };
  }
  if (normalizedUnit === "KG" && Math.abs(value) > 0 && Math.abs(value) < 1) {
    return { quantity: value * 1000, unit: "G" };
  }
  return { quantity: value, unit: unit || "" };
}
function calculatedStockForProduct(productId) {
  const product = DB.get("products").find((x) => x.id === productId) || {},
    entries = DB.get("productionEntries").filter((entry) => entry.productId === productId),
    productMaterialPerPiece = materialPerPiece(product),
    productMaterialUnit = materialUnit(product);
  let chemicalMade = 0,
    labeledMade = 0,
    filledMade = 0,
    packedMade = 0,
    finishedMade = 0;
  entries.forEach((entry) => {
    const type = String(entry.productionRecord || "").toLowerCase();
    if (type === "chemical produced")
      chemicalMade += convertMaterialQuantity(productionEntryLiters(entry), entry.unit, productMaterialUnit);
    if (type === "labeling completed") labeledMade += productionEntryPieces(entry, product);
    if (type === "filling completed") filledMade += productionEntryPieces(entry, product);
    if (type === "packing completed") packedMade += productionEntryPieces(entry, product);
    if (type === "finished goods ready") finishedMade += productionEntryPieces(entry, product);
  });
  const packedUsedForFinished = Math.min(packedMade, finishedMade),
    finishedStillNeeded = Math.max(finishedMade - packedUsedForFinished, 0),
    chemicalLeft = Math.max(chemicalMade - filledMade * productMaterialPerPiece, 0),
    labeledLeft = Math.max(labeledMade - filledMade, 0),
    filledLeft = Math.max(filledMade - packedMade - finishedStillNeeded, 0),
    packedLeft = Math.max(packedMade - finishedMade, 0);
  return [
    { item: "Chemical produced left", quantity: chemicalLeft, unit: productMaterialUnit },
    { item: "Labeled pieces left", quantity: labeledLeft, unit: "Pieces" },
    { item: "Filled pieces left", quantity: filledLeft, unit: "Pieces" },
    { item: "Packed pieces left", quantity: packedLeft, unit: "Pieces" },
  ];
}
function renderStocks() {
  setHeader("Stocks", "Production stock balance");
  const products = DB.get("products"),
    selectedId = state.stockProduct || products[0]?.id || "",
    selectedProduct = products.find((product) => product.id === selectedId),
    rows = selectedProduct ? calculatedStockForProduct(selectedId) : [],
    selectedMaterialUnit = selectedProduct ? materialUnit(selectedProduct) : "",
    selectedMaterialPerPiece = selectedProduct ? materialPerPiece(selectedProduct) : 1,
    chemicalDisplay = rows[0] ? displayMaterialQuantity(rows[0].quantity, rows[0].unit) : { quantity: 0, unit: selectedMaterialUnit },
    productOptions = products
      .map(
        (product) =>
          `<option value="${product.id}" ${selectedId === product.id ? "selected" : ""}>${esc(product.name)}</option>`,
      )
      .join("");
  $("#app").innerHTML =
    pageIntro(
      "Production Stocks",
      "Select a product to see chemical, labeled, filled and packed stock left.",
      `<button class="btn secondary" onclick="navigate('finishedGoods')">+ Finished goods</button>`,
    ) +
    `<div class="section-filter stocks-product-filter"><div><b>Select product</b><span>${selectedProduct ? `Showing stock for ${esc(selectedProduct.name)}` : "Add a product first, then record production entries."}</span></div><div class="filter-actions"><label>Product <select class="input" onchange="state.stockProduct=this.value;render()">${productOptions}</select></label></div></div>` +
    (selectedProduct
      ? `<div class="stats-grid">${statCard("Chemical Left", fmtNum(chemicalDisplay.quantity), chemicalDisplay.unit, "#1677ff", chemicalDisplay.unit)}${statCard("Labeled Left", fmtNum(rows[1].quantity), "P", "#11b8bd", "Pieces")}${statCard("Filled Left", fmtNum(rows[2].quantity), "F", "#17a673", "Pieces")}${statCard("Packed Left", fmtNum(rows[3].quantity), "B", "#f59e0b", "Pieces")}</div><div class="card table-card stocks-table"><div class="table-wrap"><table><thead><tr><th>Stock Item</th><th>Quantity Left</th><th>Unit</th></tr></thead><tbody>${rows.map((row) => { const shown = row.unit === selectedMaterialUnit ? displayMaterialQuantity(row.quantity, row.unit) : { quantity: row.quantity, unit: row.unit }; return `<tr><td>${esc(row.item)}</td><td>${fmtNum(shown.quantity)}</td><td>${esc(shown.unit)}</td></tr>`; }).join("")}</tbody></table></div></div><div class="card"><p><b>Calculation:</b> 1 piece uses ${fmtNum(selectedMaterialPerPiece)} ${esc(selectedMaterialUnit)} material for this product. Change it in Product Records if needed.</p></div>`
      : '<div class="card"><div class="empty">No products found. Add a product in Production first.</div></div>');
}
function renderFinishedGoods() {
  const s = schemas.finishedGoods;
  setHeader("Finished Goods", "Finished stock records");
  const stockRows = finishedStockSummary(),
    lowStockCount = stockRows.filter((row) => row.status === "Low Stock").length;
  let rows = DB.get("finishedGoods").filter(
    (x) =>
      !x.manufacturingDate ||
      (x.manufacturingDate >= state.finishedFrom && x.manufacturingDate <= state.finishedTo),
  );
  const q = state.search.toLowerCase();
  if (q)
    rows = rows.filter((x) =>
      Object.values(x).some((v) => String(v).toLowerCase().includes(q)),
    );
  $("#app").innerHTML =
    pageIntro(
      "Finished Goods Records",
      "Manually enter finished goods stock as pieces and boxes.",
      adminHTML(`<div><button class="btn secondary" onclick="openForm('products')">+ Add product</button> <button class="btn primary" onclick="openForm('finishedGoods')">+ Add finished goods</button></div>`),
    ) +
    `<div class="stats-grid">${statCard("Records", rows.length, "#", "#1677ff")}${statCard("Total Pieces", fmtNum(rows.reduce((a, x) => a + +x.quantity, 0)), "P", "#11b8bd")}${statCard("Total Boxes", fmtNum(rows.reduce((a, x) => a + +finishedGoodBoxes(x), 0)), "B", "#17a673")}${statCard("Low Stock", lowStockCount, "!", "#e45454", "Products")}</div>` +
    renderProductRecords(DB.get("products")) +
    renderFinishedStockSummary(stockRows) +
    `<div class="section-filter finished-filter"><div><b>Finished goods records</b><span>Filter by manufacturing date</span></div><div class="filter-actions">${dateRangeFields("finishedFrom", "finishedTo")}</div></div>` +
    tableCard("finishedGoods", rows, s);
}
function ensurePackagingEntryRecords() {
  const savedEntries = DB.get("packagingEntries"),
    hadMissingId = savedEntries.some((entry) => !entry.id),
    existing = savedEntries.map((entry) => ({
      ...entry,
      id: entry.id || crypto.randomUUID(),
    })),
    existingSources = new Set(existing.map((x) => x.sourceId)),
    missing = DB.get("packagingMaterials")
      .filter((material) => !existingSources.has(`packaging:${material.id}`))
      .map((material) => ({
        id: crypto.randomUUID(),
        date: material.entryDate || dateISO(),
        materialId: material.id,
        materialCode: material.code,
        materialName: material.name,
        unit: "Units",
        quantity: +material.currentStock || 0,
        type: "Opening stock",
        remarks: "Created from existing packaging material",
        sourceId: `packaging:${material.id}`,
      }));
  if (missing.length || hadMissingId) DB.set("packagingEntries", [...missing, ...existing]);
}
function packagingMaterialLabel(row, materials = DB.get("packagingMaterials")) {
  const material = materials.find((x) => x.id === row.materialId);
  if (material) return `${material.code} - ${material.name}`;
  return row.materialCode || row.materialName
    ? `${row.materialCode || "Deleted"} - ${row.materialName || "material"}`
    : "Deleted material";
}
function renderPackagingEntryRecords(rows, materials = DB.get("packagingMaterials")) {
  return `<div class="section-filter packaging-entry-filter"><div><b>Packaging entry records</b><span>All packaging stock added within the selected period</span></div><div class="filter-actions">${dateRangeFields("packagingFrom", "packagingTo")}<button class="btn secondary small" onclick="exportPackagingEntryCSV()">Export CSV</button></div></div><div class="card table-card packaging-entry-records"><div class="table-wrap"><table><thead><tr><th>Date</th><th>Material</th><th>Quantity Added</th><th>Entry Type</th><th>Remarks</th></tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td>${esc(row.date)}</td><td><b>${esc(packagingMaterialLabel(row, materials))}</b></td><td>${fmtNum(row.quantity)}</td><td>${badge(row.type || "Stock entry")}</td><td>${esc(row.remarks || "-")}</td></tr>`).join("") : '<tr><td colspan="5"><div class="empty">No packaging entry records found for this date range.</div></td></tr>'}</tbody></table></div></div>`;
}
function renderPackagingUsageRecords(rows, materials = DB.get("packagingMaterials")) {
  return `<div class="section-filter packaging-usage-filter"><div><b>Packaging consumption records</b><span>Used and damaged packaging within the selected period</span></div><div class="filter-actions">${dateRangeFields("packagingUsageFrom", "packagingUsageTo")}<button class="btn secondary small" onclick="exportPackagingUsageCSV()">Export CSV</button></div></div><div class="card table-card packaging-usage-records"><div class="table-wrap"><table><thead><tr><th>Date</th><th>Material</th><th>Used</th><th>Damaged</th><th>Total</th>${adminHTML("<th>Action</th>")}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td>${esc(row.date)}</td><td><b>${esc(packagingMaterialLabel(row, materials))}</b></td><td>${fmtNum(row.used)}</td><td>${fmtNum(row.damaged)}</td><td>${fmtNum(+row.used + +row.damaged)}</td>${adminHTML(`<td><button class="action-btn undo-consumption-btn" title="Undo usage" onclick="undoPackagingUsage('${row.id}')">Undo</button></td>`)}</tr>`).join("") : `<tr><td colspan="${canEdit() ? 6 : 5}"><div class="empty">No packaging consumption records found for this date range.</div></td></tr>`}</tbody></table></div></div>`;
}
function undoPackagingUsage(recordId) {
  if (!adminOnly()) return;
  const record = DB.get("packagingUsage").find((x) => x.id === recordId);
  if (!record) return toast("Packaging usage record not found", "error");
  const material = DB.get("packagingMaterials").find((x) => x.id === record.materialId);
  if (!material) return toast("Cannot restore stock because this material no longer exists", "error");
  const qty = +record.used + +record.damaged;
  if (!confirm(`Undo packaging usage of ${fmtNum(qty)} for ${material.name}?`)) return;
  DB.update("packagingMaterials", material.id, {
    currentStock: +material.currentStock + qty,
  });
  DB.remove("packagingUsage", record.id);
  toast("Packaging usage undone and stock restored");
  render();
}
function renderPackaging() {
  setHeader("Packaging Materials", "Inventory control");
  ensurePackagingEntryRecords();
  const rows = DB.get("packagingMaterials"),
    entries = DB.get("packagingEntries")
      .filter((x) => x.date >= state.packagingFrom && x.date <= state.packagingTo)
      .sort((a, b) => b.date.localeCompare(a.date)),
    usage = DB.get("packagingUsage")
      .filter((x) => x.date >= state.packagingUsageFrom && x.date <= state.packagingUsageTo)
      .sort((a, b) => b.date.localeCompare(a.date)),
    s = schemas.packagingMaterials;
  $("#app").innerHTML =
    pageIntro(
      "Packaging Materials",
      "Track packaging stock, daily usage and damage.",
      adminHTML(`<div><button class="btn secondary" onclick="openTransaction('pack')">Daily usage</button> <button class="btn primary" onclick="openForm('packagingMaterials')">+ Add material</button></div>`),
    ) +
    `<div class="stats-grid">${statCard("Material Types", rows.length, "P", "#1677ff")}${statCard("Units Left", fmtNum(sumNumbers(rows, "currentStock")), "S", "#11b8bd")}${statCard("Low Stock", rows.filter((x) => (+x.currentStock || 0) <= (+x.minStock || 0)).length, "!", "#e45454")}${statCard("Used in Range", fmtNum(usage.reduce((a, x) => a + (+x.used || 0) + (+x.damaged || 0), 0)), "U", "#f59e0b")}</div>` +
    `<div class="section-filter packaging-filter"><div><b>Packaging stock available</b><span>Which packaging materials are left, current quantity and low stock status</span></div></div>` +
    tableCard("packagingMaterials", rows, s) +
    renderPackagingEntryRecords(entries, rows) +
    renderPackagingUsageRecords(usage, rows);
}
function renderAttendance() {
  setHeader("Attendance", "Workforce management");
  state.attendanceDate = cleanDate(state.attendanceDate);
  const emps = DB.get("employees").filter((x) => x.status === "Active"),
    all = DB.get("attendance"),
    day = all.filter((x) => x.date === state.attendanceDate);
  const count = (s) => day.filter((x) => x.status === s).length;
  $("#app").innerHTML =
    pageIntro(
      "Attendance Management",
      "Mark daily attendance and calculate payroll-ready totals.",
      `<input class="input" type="date" value="${esc(state.attendanceDate)}" onchange="setDateState('attendanceDate', this.value)">`,
    ) +
    `<div class="stats-grid">${statCard("Present", count("Present"), "OK", "#17a673")}${statCard("Absent", count("Absent"), "X", "#e45454")}${statCard("Half Day", count("Half Day"), "1/2", "#f59e0b")}${statCard("On Leave", count("Leave"), "O", "#1677ff")}</div><div class="card table-card"><div class="toolbar"><b>Daily attendance register</b>${adminHTML(`<button class="btn primary small" onclick="saveAttendance()">Save attendance</button>`)}</div><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Status</th><th>Overtime (hrs)</th><th>Overtime Payment</th><th>Estimated salary</th></tr></thead><tbody>${emps
      .map((e) => {
        const a = day.find((x) => x.employeeId === e.id) || {};
        return `<tr data-emp="${e.id}"><td><b>${esc(e.name)}</b><br><small>${e.employeeId}</small></td><td>${e.department}</td><td><div class="attendance-grid">${["Present", "Absent", "Half Day", "Leave", "Overtime"].map((x) => `<button class="attendance-btn ${a.status === x ? "selected" : ""}" data-status="${x}" onclick="pickAttendance(this)">${x}</button>`).join("")}</div></td><td><input class="input overtime" type="number" min="0" value="${a.overtime || 0}" style="width:90px"></td><td><input class="input overtimePayment" type="number" min="0" value="${a.overtimePayment || 0}" style="width:120px"></td><td>${money(salarySummary(e.id, state.attendanceDate, state.attendanceDate).amount)}</td></tr>`;
      })
      .join("")}</tbody></table></div></div>` +
    renderSalarySummary() +
    renderAttendanceRecords();
}
function pickAttendance(btn) {
  btn
    .closest(".attendance-grid")
    .querySelectorAll("button")
    .forEach((x) => x.classList.remove("selected"));
  btn.classList.add("selected");
}
function saveAttendance() {
  if (!adminOnly()) return;
  const all = DB.get("attendance").filter(
    (x) => x.date !== state.attendanceDate,
  );
  $$("tr[data-emp]").forEach((tr) => {
    const status = tr.querySelector(".selected")?.dataset.status;
    if (status)
      all.push({
        id: crypto.randomUUID(),
        date: state.attendanceDate,
        employeeId: tr.dataset.emp,
        status,
        overtime: +tr.querySelector(".overtime").value || 0,
        overtimePayment: +tr.querySelector(".overtimePayment").value || 0,
      });
  });
  DB.set("attendance", all);
  toast("Attendance saved successfully");
  render();
}
function salarySummary(empId, from = state.salaryFrom, to = state.salaryTo) {
  const rows = DB.get("attendance").filter(
      (x) => x.employeeId === empId && x.date >= from && x.date <= to,
    ),
    e = DB.get("employees").find((x) => x.id === empId) || {};
  const present = rows.filter(
      (x) => x.status === "Present" || x.status === "Overtime",
    ).length,
    half = rows.filter((x) => x.status === "Half Day").length,
    leaves = rows.filter((x) => x.status === "Leave").length,
    ot = rows.reduce((a, x) => a + (+x.overtime || 0), 0),
    overtimePayment = rows.reduce((a, x) => a + (+x.overtimePayment || 0), 0);
  return {
    present,
    half,
    leaves,
    ot,
    overtimePayment,
    amount:
      (present + half * 0.5) * (+e.dailyWage || 0) +
      overtimePayment,
  };
}
function renderSalarySummary() {
  state.salaryFrom = cleanDate(state.salaryFrom);
  state.salaryTo = cleanDate(state.salaryTo);
  const emps = DB.get("employees").filter((x) => x.status === "Active");
  return `<div class="card table-card"><div class="toolbar salary-toolbar"><div><b>Salary calculator</b><div class="salary-date-filter"><label>From <input class="input" type="date" value="${esc(state.salaryFrom)}" onchange="setDateState('salaryFrom', this.value)"></label><label>To <input class="input" type="date" value="${esc(state.salaryTo)}" onchange="setDateState('salaryTo', this.value)"></label></div></div><div><button class="btn secondary small" onclick="exportSalaryCSV()">Export CSV</button> <button class="btn secondary small" onclick="window.print()">Print</button></div></div><div class="table-wrap"><table><thead><tr><th>Employee ID</th><th>Employee</th><th>Present Days</th><th>Half Days</th><th>Leaves</th><th>Overtime</th><th>Salary Amount</th></tr></thead><tbody>${emps
    .map((e) => {
      const s = salarySummary(e.id);
      return `<tr><td>${esc(e.employeeId)}</td><td>${esc(e.name)}</td><td>${s.present}</td><td>${s.half}</td><td>${s.leaves}</td><td>${s.ot} hrs</td><td><b>${money(s.amount)}</b></td></tr>`;
    })
    .join("")}</tbody></table></div></div>`;
}
function attendanceDaySalary(record, employee) {
  const dailyWage = +employee?.dailyWage || 0,
    basePay =
      record.status === "Present" || record.status === "Overtime"
        ? dailyWage
        : record.status === "Half Day"
          ? dailyWage * 0.5
          : 0;
  return basePay + (+record.overtimePayment || 0);
}
function filteredAttendanceRecords() {
  state.attendanceRecordFrom = cleanDate(state.attendanceRecordFrom);
  state.attendanceRecordTo = cleanDate(state.attendanceRecordTo);
  const employees = DB.get("employees"),
    employeeMap = Object.fromEntries(employees.map((x) => [x.id, x]));
  const records = DB.get("attendance")
    .filter(
      (x) =>
        x.date >= state.attendanceRecordFrom &&
        x.date <= state.attendanceRecordTo &&
        (!state.attendanceRecordEmployee ||
          x.employeeId === state.attendanceRecordEmployee),
    )
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        cleanText(employeeMap[a.employeeId]?.name).localeCompare(
          cleanText(employeeMap[b.employeeId]?.name),
        ),
    );
  return { records, employees, employeeMap };
}
function renderAttendanceRecords() {
  const { records, employees, employeeMap } = filteredAttendanceRecords(),
    options = employees
      .map(
        (x) =>
          `<option value="${esc(x.id)}" ${state.attendanceRecordEmployee === x.id ? "selected" : ""}>${esc(x.name)} (${esc(x.employeeId)})</option>`,
      )
      .join("");
  return `<div class="card table-card"><div class="toolbar salary-toolbar"><div><b>Attendance records</b><div class="muted">All completed attendance entries with date and employee filter</div><div class="salary-date-filter"><label>From <input class="input" type="date" value="${esc(state.attendanceRecordFrom)}" onchange="setDateState('attendanceRecordFrom', this.value)"></label><label>To <input class="input" type="date" value="${esc(state.attendanceRecordTo)}" onchange="setDateState('attendanceRecordTo', this.value)"></label><label>Employee <select class="input" onchange="setFilterState('attendanceRecordEmployee', this.value)"><option value="">All employees</option>${options}</select></label></div></div><div><span class="badge blue">${records.length} records</span> <button class="btn secondary small" onclick="exportAttendanceRecordsCSV()">Export CSV</button></div></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Employee ID</th><th>Employee</th><th>Status</th><th>Overtime</th><th>Overtime Payment</th><th>Estimated Salary</th></tr></thead><tbody>${records.length
    ? records
        .map((record) => {
          const employee = employeeMap[record.employeeId] || {};
          return `<tr><td>${esc(record.date)}</td><td>${esc(employee.employeeId || "-")}</td><td>${esc(employee.name || "Unknown employee")}</td><td><span class="badge ${record.status === "Absent" ? "red" : record.status === "Leave" ? "blue" : record.status === "Half Day" ? "orange" : "green"}">${esc(record.status)}</span></td><td>${fmtNum(record.overtime)} hrs</td><td>${money(record.overtimePayment)}</td><td><b>${money(attendanceDaySalary(record, employee))}</b></td></tr>`;
        })
        .join("")
    : `<tr><td colspan="7" class="empty">No attendance records found.</td></tr>`}</tbody></table></div></div>`;
}

function renderReports() {
  setHeader("Reports Center", "Analytics & exports");
  const reports = [
    ["Attendance Report", "Daily status and attendance summary", "attendance"],
    ["Salary Report", "Calculated employee salary totals", "employees"],
    ["Overtime Report", "Recorded overtime by employee", "attendance"],
    ["Raw Material Stock", "Live raw material balances", "rawMaterials"],
    ["Raw Material Entry Report", "Stock added by date and material", "rawMaterialEntries"],
    ["Packaging Stock", "Live packaging stock balances", "packagingMaterials"],
    ["Packaging Entry Report", "Packaging stock added records", "packagingEntries"],
    ["Consumption Report", "Material usage and remarks", "materialConsumption"],
    ["Wastage Report", "Packaging damage analysis", "packagingUsage"],
    ["Finished Goods", "Batch-wise available inventory", "finishedGoods"],
  ];
  $("#app").innerHTML =
    pageIntro(
      "Reports Center",
      "Generate, export and print operational reports.",
    ) +
    `<div class="report-grid">${reports.map((r, i) => `<div class="card report-card"><span class="badge ${i < 3 ? "blue" : i < 7 ? "orange" : "green"}">${i < 3 ? "Employee" : i < 7 ? "Inventory" : "Production"}</span><h3>${r[0]}</h3><p>${r[1]}</p><div class="report-actions"><button class="btn secondary small" onclick="exportCSV('${r[2]}')">CSV</button>${adminHTML(`<button class="btn secondary small" onclick="exportExcel('${r[2]}')">Excel</button>`)}<button class="btn secondary small" onclick="window.print()">Print</button></div></div>`).join("")}</div>`;
}
function renderSettings() {
  setHeader("Settings", "System configuration");
  $("#app").innerHTML =
    pageIntro(
      "ERP Settings",
      `Manage ${currentDepot.name} preferences and data.`,
    ) +
    `<div class="settings-grid"><div class="card"><h3>Current depot</h3><div class="field"><label>Depot</label><input class="input" value="${esc(currentDepot.name)}" disabled></div><div class="field" style="margin-top:14px"><label>Location</label><input class="input" value="${esc(currentDepot.location)}" disabled></div><button class="btn secondary" style="margin-top:16px" onclick="logout()">Switch depot / Log out</button></div><div class="card"><h3>Preferences</h3><div class="setting-row"><div><b>Low stock notifications</b><br><small>Show dashboard alerts</small></div><div class="switch on"></div></div><div class="setting-row"><div><b>Auto finished-goods entry</b><br><small>Create stock after packing</small></div><div class="switch on"></div></div><div class="setting-row"><div><b>Compact tables</b><br><small>Reduce row spacing</small></div><div class="switch"></div></div></div><div class="card"><h3>${esc(currentDepot.name)} data</h3><p>Download backup or clear this depot data.</p>${adminHTML(`<button class="btn secondary" onclick="exportBackup()">Download backup</button> <button class="btn danger" onclick="resetData()">Clear all data</button>`)}</div><div class="card"><h3>Data separation</h3><p>Inventory, employees, attendance, production and reports are isolated by depot.</p><span class="badge green">Depot workspace active</span></div></div>`;
}

function fieldHTML(f, val = "") {
  const [name, label, type, opts] = f,
    req = opts === true ? "required" : "";
  if (type === "date") val = cleanDate(val);
  if (type === "select" || type === "selectnum")
    return `<div class="field"><label>${label}</label><select class="input" name="${name}" ${req}>${(Array.isArray(opts) ? opts : []).map((x, i) => `<option value="${type === "selectnum" ? i + 1 : x}" ${String(val) === String(type === "selectnum" ? i + 1 : x) ? "selected" : ""}>${type === "selectnum" ? `${i + 1}. ${stages[i]}` : x}</option>`).join("")}</select></div>`;
  if (type.startsWith("relation:")) {
    const c = type.split(":")[1];
    return `<div class="field"><label>${label}</label><select class="input" name="${name}" required>${DB.get(
      c,
    )
      .map(
        (x) =>
          `<option value="${x.id}" ${val === x.id ? "selected" : ""}>${esc(x.name)}</option>`,
      )
      .join("")}</select></div>`;
  }
  return `<div class="field"><label>${label}</label><input class="input" name="${name}" type="${type}" value="${esc(val)}" ${req} ${type === "number" ? `min="${name === "workingHours" ? 1 : 0}" step="any"` : ""}></div>`;
}
function openForm(key, id = "") {
  if (!adminOnly()) return;
  const s = schemas[key],
    r = id ? DB.get(s.collection).find((x) => x.id === id) : {};
  const defaultFieldValue = (name) =>
    r?.[name] ??
    (name === "materialPerPiece" && r?.chemicalPerPiece
      ? r.chemicalPerPiece
      : name === "materialUnit" && r?.chemicalPerPiece
        ? "L"
        : name === "date" || name === "entryDate" || name === "manufacturingDate"
          ? dateISO()
          : name === "workingHours"
            ? 8
            : name === "piecesPerBox"
              ? 1
            : name === "materialPerPiece"
              ? 1
            : name === "materialUnit"
              ? "ML"
            : name === "minFinishedStock"
              ? 0
            : name === "stage"
              ? 1
              : "");
  $("#modalTitle").textContent = `${id ? "Edit" : "Add"} ${s.title}`;
  $("#modalEyebrow").textContent = s.collection;
  $("#modalFields").innerHTML = s.fields
    .map((f) =>
      fieldHTML(
        f,
        defaultFieldValue(f[0]),
      ),
    )
    .join("");
  $("#modalForm").onsubmit = (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target));
    s.fields
      .filter((f) => f[2] === "number" || f[2] === "selectnum")
      .forEach((f) => (v[f[0]] = +v[f[0]]));
    let savedRecord;
    if (id) DB.update(s.collection, id, v);
    else savedRecord = DB.add(s.collection, v);
    if (key === "rawMaterials" && !id) {
      DB.add("rawMaterialEntries", {
        date: savedRecord.entryDate || dateISO(),
        materialId: savedRecord.id,
        materialCode: savedRecord.code,
        materialName: savedRecord.name,
        unit: savedRecord.unit,
        quantity: +savedRecord.currentStock || 0,
        type: "Opening stock",
        remarks: "Material created",
        sourceId: `material:${savedRecord.id}`,
      });
    }
    if (key === "packagingMaterials" && !id) {
      DB.add("packagingEntries", {
        date: savedRecord.entryDate || dateISO(),
        materialId: savedRecord.id,
        materialCode: savedRecord.code,
        materialName: savedRecord.name,
        unit: "Units",
        quantity: +savedRecord.currentStock || 0,
        type: "Opening stock",
        remarks: "Packaging material created",
        sourceId: `packaging:${savedRecord.id}`,
      });
    }
    closeModal();
    toast(`${s.title} ${id ? "updated" : "added"} successfully`);
    render();
  };
  showModal();
}
function viewRecord(key, id) {
  const s = schemas[key],
    r = DB.get(s.collection).find((x) => x.id === id);
  $("#modalTitle").textContent = `${s.title} details`;
  $("#modalEyebrow").textContent = "Record overview";
  $("#modalFields").innerHTML = s.fields
    .map(
      (f) =>
        `<div class="field"><label>${f[1]}</label><div class="input">${f[0] === "productId" ? relation("products", r[f[0]]) : esc(r[f[0]])}</div></div>`,
    )
    .join("");
  $("#modalForm").onsubmit = (e) => {
    e.preventDefault();
    closeModal();
  };
  $(".modal-actions").innerHTML =
    '<button type="button" class="btn primary" onclick="closeModal()">Close</button>';
  showModal();
}
function deleteRecord(key, id) {
  if (!adminOnly()) return;
  const s = schemas[key];
  if (!confirm(`Delete this ${s.title.toLowerCase()} record?`)) return;
  DB.remove(s.collection, id);
  toast("Record deleted");
  render();
}
function showModal() {
  $("#overlay").classList.add("show");
  $("#modal").classList.add("show");
}
function closeModal() {
  $("#overlay").classList.remove("show");
  $("#modal").classList.remove("show");
  $(".modal-actions").innerHTML =
    '<button type="button" class="btn secondary" id="modalCancel" onclick="closeModal()">Cancel</button><button type="submit" class="btn primary">Save record</button>';
}
function openTransaction(type, selectedMaterialId = "") {
  if (!adminOnly()) return;
  const raw = type === "raw",
    collection = raw ? "rawMaterials" : "packagingMaterials";
  $("#modalTitle").textContent = raw
    ? "Material consumption"
    : "Packaging daily usage";
  $("#modalEyebrow").textContent = "Stock transaction";
  $("#modalFields").innerHTML =
    fieldHTML(["date", "Date", "date", true], dateISO()) +
    fieldHTML(["materialId", "Material", `relation:${collection}`, true], selectedMaterialId) +
    (raw
      ? fieldHTML(["quantity", "Quantity Used", "number", true]) +
        `<div class="field full"><label>Remarks</label><textarea class="input" name="remarks"></textarea></div>`
      : fieldHTML(["used", "Used Quantity", "number", true]) +
        fieldHTML(["damaged", "Damaged Quantity", "number", true]));
  $("#modalForm").onsubmit = (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target)),
      qty = raw ? +v.quantity : +v.used + +v.damaged,
      mat = DB.get(collection).find((x) => x.id === v.materialId);
    if (!mat) {
      toast("Please select a valid material", "error");
      return;
    }
    if (qty > +mat.currentStock) {
      toast("Quantity exceeds available stock", "error");
      return;
    }
    DB.update(collection, mat.id, { currentStock: +mat.currentStock - qty });
    DB.add(raw ? "materialConsumption" : "packagingUsage", {
      ...v,
      quantity: +v.quantity || undefined,
      used: +v.used || undefined,
      damaged: +v.damaged || undefined,
    });
    closeModal();
    toast("Stock transaction recorded");
    render();
  };
  showModal();
}
function openStockIncrease(materialId) {
  if (!adminOnly()) return;
  const material = DB.get("rawMaterials").find((x) => x.id === materialId);
  if (!material) return toast("Raw material not found", "error");
  $("#modalTitle").textContent = "Increase current stock";
  $("#modalEyebrow").textContent = `${material.code} - ${material.name}`;
  $("#modalFields").innerHTML =
    `<div class="field"><label>Current Stock</label><div class="input">${fmtNum(material.currentStock)} ${esc(material.unit)}</div></div>` +
    fieldHTML(["date", "Entry Date", "date", true], dateISO()) +
    fieldHTML(["quantity", `Quantity to Add (${material.unit})`, "number", true]) +
    `<div class="field full"><label>Remarks</label><textarea class="input" name="remarks"></textarea></div>`;
  $("#modalForm").onsubmit = (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target)),
      quantity = +form.quantity;
    if (quantity <= 0) return toast("Enter a quantity greater than zero", "error");
    DB.update("rawMaterials", material.id, {
      currentStock: +material.currentStock + quantity,
    });
    DB.add("rawMaterialEntries", {
      date: form.date || dateISO(),
      materialId: material.id,
      materialCode: material.code,
      materialName: material.name,
      unit: material.unit,
      quantity,
      type: "Stock increase",
      remarks: form.remarks || "",
      sourceId: `stock:${crypto.randomUUID()}`,
    });
    closeModal();
    toast(`${fmtNum(quantity)} ${material.unit} added to stock`);
    render();
  };
  showModal();
}
function openPackagingStockIncrease(materialId) {
  if (!adminOnly()) return;
  const material = DB.get("packagingMaterials").find((x) => x.id === materialId);
  if (!material) return toast("Packaging material not found", "error");
  $("#modalTitle").textContent = "Increase packaging stock";
  $("#modalEyebrow").textContent = `${material.code} - ${material.name}`;
  $("#modalFields").innerHTML =
    `<div class="field"><label>Current Stock</label><div class="input">${fmtNum(material.currentStock)} Units</div></div>` +
    fieldHTML(["date", "Entry Date", "date", true], dateISO()) +
    fieldHTML(["quantity", "Quantity to Add", "number", true]) +
    `<div class="field full"><label>Remarks</label><textarea class="input" name="remarks"></textarea></div>`;
  $("#modalForm").onsubmit = (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target)),
      quantity = +form.quantity;
    if (quantity <= 0) return toast("Enter a quantity greater than zero", "error");
    DB.update("packagingMaterials", material.id, {
      currentStock: +material.currentStock + quantity,
    });
    DB.add("packagingEntries", {
      date: form.date || dateISO(),
      materialId: material.id,
      materialCode: material.code,
      materialName: material.name,
      unit: "Units",
      quantity,
      type: "Stock increase",
      remarks: form.remarks || "",
      sourceId: `packaging-stock:${crypto.randomUUID()}`,
    });
    closeModal();
    toast(`${fmtNum(quantity)} units added to packaging stock`);
    render();
  };
  showModal();
}
function syncFinishedGoods(productionId, v) {
  const existing = DB.get("finishedGoods").find(
    (x) => x.sourceProduction === productionId,
  );
  const isReady = String(v.productionRecord || "").toLowerCase() === "finished goods ready";
  if (!isReady) {
    if (existing) DB.remove("finishedGoods", existing.id);
    return;
  }
  const product = DB.get("products").find((x) => x.id === v.productId) || {},
    piecesPerBox = Math.max(+product.piecesPerBox || 1, 1),
    finishedBoxes =
      String(v.unit || "").toLowerCase() === "boxes"
        ? +v.quantity || 0
        : (+v.quantity || 0) / piecesPerBox,
    finishedQuantity =
      String(v.unit || "").toLowerCase() === "boxes"
        ? (+v.quantity || 0) * piecesPerBox
        : +v.quantity || 0;
  if (existing)
    DB.update("finishedGoods", existing.id, {
      productId: v.productId,
      batch: v.batch,
      manufacturingDate: v.date,
      quantity: finishedQuantity,
      boxes: finishedBoxes,
      status: "Available",
    });
  else
    DB.add("finishedGoods", {
      productId: v.productId,
      batch: v.batch,
      manufacturingDate: v.date,
      quantity: finishedQuantity,
      boxes: finishedBoxes,
      dispatched: 0,
      status: "Available",
      sourceProduction: productionId,
    });
}

function exportCSV(collection) {
  let rows = DB.get(collection);
  if (collection === "rawMaterials") {
    if (state.rawMaterialFrom > state.rawMaterialTo) {
      toast("From date cannot be after To date", "error");
      return;
    }
    rows = rows.filter(
      (row) => !row.entryDate || (row.entryDate >= state.rawMaterialFrom && row.entryDate <= state.rawMaterialTo),
    );
  }
  if (collection === "rawMaterialEntries") {
    if (state.rawMaterialFrom > state.rawMaterialTo) {
      toast("From date cannot be after To date", "error");
      return;
    }
    ensureRawMaterialEntryRecords();
    rows = DB.get("rawMaterialEntries").filter(
      (row) => row.date >= state.rawMaterialFrom && row.date <= state.rawMaterialTo,
    );
  }
  if (!rows.length) return toast("No data available to export", "error");
  const keys = [...new Set(rows.flatMap(Object.keys))].filter(
    (x) => x !== "id",
  );
  const csv = [
    keys.join(","),
    ...rows.map((r) =>
      keys
        .map((k) => csvText(r[k]))
        .join(","),
    ),
  ].join("\n");
  download(`${collection}-${dateISO()}.csv`, csv, "text/csv");
  toast("CSV report downloaded");
}
function exportSalaryCSV() {
  if (state.salaryFrom > state.salaryTo) {
    toast("From date cannot be after To date", "error");
    return;
  }
  const rows = DB.get("employees")
    .filter((employee) => employee.status === "Active")
    .map((employee) => {
      const summary = salarySummary(employee.id);
      return {
        employeeId: employee.employeeId,
        employeeName: employee.name,
        fromDate: state.salaryFrom,
        toDate: state.salaryTo,
        presentDays: summary.present,
        halfDays: summary.half,
        leaveDays: summary.leaves,
        overtimeHours: summary.ot,
        overtimePayment: summary.overtimePayment.toFixed(2),
        salaryAmount: summary.amount.toFixed(2),
      };
    });
  if (!rows.length) return toast("No employee salary data to export", "error");
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((row) =>
      keys.map((key) => csvText(row[key])).join(","),
    ),
  ].join("\n");
  download(
    `salary-${state.salaryFrom}-to-${state.salaryTo}.csv`,
    csv,
    "text/csv",
  );
  toast("Salary CSV downloaded");
}
function exportAttendanceRecordsCSV() {
  if (state.attendanceRecordFrom > state.attendanceRecordTo) {
    toast("From date cannot be after To date", "error");
    return;
  }
  const { records, employeeMap } = filteredAttendanceRecords();
  if (!records.length)
    return toast("No attendance records to export", "error");
  const rows = records.map((record) => {
    const employee = employeeMap[record.employeeId] || {};
    return {
      date: record.date,
      employeeId: employee.employeeId || "",
      employeeName: employee.name || "Unknown employee",
      status: record.status,
      overtimeHours: +record.overtime || 0,
      overtimePayment: (+record.overtimePayment || 0).toFixed(2),
      estimatedSalary: attendanceDaySalary(record, employee).toFixed(2),
    };
  });
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((row) =>
      keys.map((key) => csvText(row[key])).join(","),
    ),
  ].join("\n");
  download(
    `attendance-records-${state.attendanceRecordFrom}-to-${state.attendanceRecordTo}.csv`,
    csv,
    "text/csv",
  );
  toast("Attendance records CSV downloaded");
}
function exportEntryCSV() {
  if (state.rawMaterialFrom > state.rawMaterialTo) {
    toast("From date cannot be after To date", "error");
    return;
  }
  ensureRawMaterialEntryRecords();
  const materials = DB.get("rawMaterials"),
    rows = DB.get("rawMaterialEntries")
      .filter((row) => row.date >= state.rawMaterialFrom && row.date <= state.rawMaterialTo)
      .map((row) => {
        const material = materials.find((x) => x.id === row.materialId) || {};
        return {
          date: row.date,
          materialCode: material.code || row.materialCode || "",
          materialName: material.name || row.materialName || "Deleted material",
          quantityAdded: row.quantity,
          unit: material.unit || row.unit || "",
          entryType: row.type || "Stock entry",
          remarks: row.remarks || "",
        };
      });
  if (!rows.length) return toast("No raw material entry records to export", "error");
  const keys = Object.keys(rows[0]),
    csv = [
      keys.join(","),
      ...rows.map((row) =>
        keys.map((key) => csvText(row[key])).join(","),
      ),
    ].join("\n");
  download(
    `raw-material-entries-${state.rawMaterialFrom}-to-${state.rawMaterialTo}.csv`,
    csv,
    "text/csv",
  );
  toast("Raw material entry CSV downloaded");
}
function exportConsumptionCSV() {
  if (state.consumptionFrom > state.consumptionTo) {
    toast("From date cannot be after To date", "error");
    return;
  }
  const materials = DB.get("rawMaterials"),
    rows = DB.get("materialConsumption")
      .filter((row) => row.date >= state.consumptionFrom && row.date <= state.consumptionTo)
      .map((row) => {
        const material = materials.find((x) => x.id === row.materialId) || {};
        return {
          date: row.date,
          materialCode: material.code || "",
          materialName: material.name || "Deleted material",
          quantityUsed: row.quantity,
          remarks: row.remarks || "",
        };
      });
  if (!rows.length) return toast("No consumption records to export", "error");
  const keys = Object.keys(rows[0]),
    csv = [
      keys.join(","),
      ...rows.map((row) =>
        keys.map((key) => csvText(row[key])).join(","),
      ),
    ].join("\n");
  download(
    `raw-material-consumption-${state.consumptionFrom}-to-${state.consumptionTo}.csv`,
    csv,
    "text/csv",
  );
  toast("Consumption CSV downloaded");
}
function exportPackagingStockCSV() {
  const rows = DB.get("packagingMaterials").map((row) => ({
    entryDate: row.entryDate || "",
    code: row.code || "",
    materialName: row.name || "",
    type: row.type || "",
    currentStock: +row.currentStock || 0,
    minimumStock: +row.minStock || 0,
    stockStatus:
      (+row.currentStock || 0) <= (+row.minStock || 0)
        ? "Low Stock"
        : "In Stock",
  }));
  if (!rows.length) return toast("No packaging stock to export", "error");
  const keys = Object.keys(rows[0]),
    csv = [
      keys.join(","),
      ...rows.map((row) =>
        keys.map((key) => csvText(row[key])).join(","),
      ),
    ].join("\n");
  download(`packaging-materials-available-${dateISO()}.csv`, csv, "text/csv");
  toast("Packaging materials CSV downloaded");
}
function exportPackagingEntryCSV() {
  if (state.packagingFrom > state.packagingTo) {
    toast("From date cannot be after To date", "error");
    return;
  }
  ensurePackagingEntryRecords();
  const materials = DB.get("packagingMaterials"),
    rows = DB.get("packagingEntries")
      .filter((row) => row.date >= state.packagingFrom && row.date <= state.packagingTo)
      .map((row) => {
        const material = materials.find((x) => x.id === row.materialId) || {};
        return {
          date: row.date,
          materialCode: material.code || row.materialCode || "",
          materialName: material.name || row.materialName || "Deleted material",
          quantityAdded: +row.quantity || 0,
          entryType: row.type || "Stock entry",
          remarks: row.remarks || "",
        };
      });
  if (!rows.length) return toast("No packaging entry records to export", "error");
  const keys = Object.keys(rows[0]),
    csv = [
      keys.join(","),
      ...rows.map((row) =>
        keys.map((key) => csvText(row[key])).join(","),
      ),
    ].join("\n");
  download(
    `packaging-entry-records-${state.packagingFrom}-to-${state.packagingTo}.csv`,
    csv,
    "text/csv",
  );
  toast("Packaging entry CSV downloaded");
}
function exportPackagingUsageCSV() {
  if (state.packagingUsageFrom > state.packagingUsageTo) {
    toast("From date cannot be after To date", "error");
    return;
  }
  const materials = DB.get("packagingMaterials"),
    rows = DB.get("packagingUsage")
      .filter((row) => row.date >= state.packagingUsageFrom && row.date <= state.packagingUsageTo)
      .map((row) => {
        const material = materials.find((x) => x.id === row.materialId) || {};
        return {
          date: row.date,
          materialCode: material.code || "",
          materialName: material.name || "Deleted material",
          used: +row.used || 0,
          damaged: +row.damaged || 0,
          total: (+row.used || 0) + (+row.damaged || 0),
        };
      });
  if (!rows.length) return toast("No packaging consumption records to export", "error");
  const keys = Object.keys(rows[0]),
    csv = [
      keys.join(","),
      ...rows.map((row) =>
        keys.map((key) => csvText(row[key])).join(","),
      ),
    ].join("\n");
  download(
    `packaging-consumption-records-${state.packagingUsageFrom}-to-${state.packagingUsageTo}.csv`,
    csv,
    "text/csv",
  );
  toast("Packaging consumption CSV downloaded");
}
function exportExcel(collection) {
  if (!adminOnly()) return;
  const rows = DB.get(collection);
  if (!rows.length) return toast("No data available to export", "error");
  const keys = [...new Set(rows.flatMap(Object.keys))].filter(
      (x) => x !== "id",
    ),
    html = `<table><tr>${keys.map((k) => `<th>${esc(k)}</th>`).join("")}</tr>${rows.map((r) => `<tr>${keys.map((k) => `<td>${esc(r[k])}</td>`).join("")}</tr>`).join("")}</table>`;
  download(`${collection}-${dateISO()}.xls`, html, "application/vnd.ms-excel");
  toast("Excel report downloaded");
}
function download(name, data, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}
function exportBackup() {
  if (!adminOnly()) return;
  const data = { depot: { id: currentDepot.id, name: currentDepot.name, location: currentDepot.location } };
  DB.keys.forEach((k) => (data[k] = DB.get(k)));
  download(
    `hygisolve-${currentDepot.id}-backup-${dateISO()}.json`,
    JSON.stringify(data, null, 2),
    "application/json",
  );
  toast("Backup downloaded");
}
function resetData() {
  if (!adminOnly()) return;
  if (!confirm(`Permanently clear all ${currentDepot.name} data? This cannot be undone.`)) return;
  DB.keys.forEach((k) => DB.set(k, []));
  toast("Depot data cleared");
  render();
}

window.navigate = navigate;
window.openForm = openForm;
window.viewRecord = viewRecord;
window.deleteRecord = deleteRecord;
window.exportCSV = exportCSV;
window.exportSalaryCSV = exportSalaryCSV;
window.exportAttendanceRecordsCSV = exportAttendanceRecordsCSV;
window.exportEntryCSV = exportEntryCSV;
window.exportConsumptionCSV = exportConsumptionCSV;
window.exportPackagingStockCSV = exportPackagingStockCSV;
window.exportPackagingEntryCSV = exportPackagingEntryCSV;
window.exportPackagingUsageCSV = exportPackagingUsageCSV;
window.exportExcel = exportExcel;
window.openTransaction = openTransaction;
window.openStockIncrease = openStockIncrease;
window.openPackagingStockIncrease = openPackagingStockIncrease;
window.undoRawEntry = undoRawEntry;
window.undoConsumption = undoConsumption;
window.undoPackagingUsage = undoPackagingUsage;
window.pickAttendance = pickAttendance;
window.saveAttendance = saveAttendance;
window.setDateState = setDateState;
window.setFilterState = setFilterState;
window.closeModal = closeModal;
window.exportBackup = exportBackup;
window.resetData = resetData;
window.logout = logout;
window.state = state;
document.addEventListener("DOMContentLoaded", init);








