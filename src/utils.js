/*
 utils.js
 Utility functions for EVcharge: localStorage, parsing, ISO build, validators.
*/

export const LS_KEY = "evcharge_logs";

/* =========================
   LocalStorage helpers
   ========================= */

export function loadLogs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("loadLogs error", e);
    return [];
  }
}

export function saveLogs(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

export function getLastLog() {
  const arr = loadLogs();
  return arr.length ? arr[arr.length - 1] : null;
}

export function appendLog(obj) {
  const arr = loadLogs();
  arr.push(obj);
  saveLogs(arr);
}

export function replaceLastLog(obj) {
  const arr = loadLogs();
  if (arr.length) arr[arr.length - 1] = obj;
  else arr.push(obj);
  saveLogs(arr);
}

export function removeLastLog() {
  const arr = loadLogs();
  if (arr.length) {
    arr.pop();
    saveLogs(arr);
  }
}

/* =========================
   CSV setup
   ========================= */

   function normalize(v) {
  if (v === null || v === undefined) return "";

  // Already a number → keep
  if (typeof v === "number") return v;

  if (typeof v === "string") {
    const s = v.trim();

    // Empty string
    if (s === "") return "";

    // Pure number (integer or decimal)
    if (/^-?\d+(\.\d+)?$/.test(s)) {
      return Number(s);
    }
  }

  // Everything else stays as-is
  return v;
}

  function csvEscape(value, delimiter = ";") {
    if (value === null || value === undefined) return "";

    const s = String(value);

    const mustQuote =
      s.includes(delimiter) ||
      s.includes('"') ||
      s.includes("\n") ||
      s.includes("\r");

    if (!mustQuote) return s;

    return `"${s.replace(/"/g, '""')}"`;
  }

export function logsToCsv(logs) {
  const delimiter = ";";

  const header = [
    "Mileage",
    "startDate",
    "startTime",
    "endDate",
    "endTime",
    "startPct",
    "endPct",
    "startRange",
    "endRange",
    "Consumption",
    "note",
  ].join(delimiter);

  const rows = logs.map((log) => {
    const values = [
      log.Mileage,
      log.startDate,
      log.startTime,
      log.endDate,
      log.endTime,
      log.startPct,
      log.endPct,
      log.startRange,
      log.endRange,
      log.Consumption,
      log.note,
    ];

//   return values.map(csvEscape).join(delimiter);
    return values
      .map((v) => csvEscape(normalize(v), delimiter))
      .join(delimiter);
  });

  return [header, ...rows].join("\n");
}


/* =========================
   Parsing helpers
   ========================= */

export function parseMmDd(mmdd) {
  if (!mmdd) return null;
  const p = mmdd.trim().split("/");
  if (p.length !== 2) return null;

  const mm = parseInt(p[0], 10);
  const dd = parseInt(p[1], 10);

  if (Number.isNaN(mm) || Number.isNaN(dd)) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  return { mm, dd };
}

export function parseHhMm(hhmm) {
  if (!hhmm) return null;
  const p = hhmm.trim().split(":");
  if (p.length !== 2) return null;

  const hh = parseInt(p[0], 10);
  const mm = parseInt(p[1], 10);

  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  if (hh < 0 || hh > 23) return null;
  if (mm < 0 || mm > 59) return null;

  return { hh, mm };
}

/* =========================
   ISO helpers
   ========================= */

export function buildIsoLocal(mmdd, hhmm) {
  const d = parseMmDd(mmdd);
  const t = parseHhMm(hhmm);
  if (!d || !t) return null;

  const y = new Date().getFullYear();
  const mm = String(d.mm).padStart(2, "0");
  const dd = String(d.dd).padStart(2, "0");
  const hh = String(t.hh).padStart(2, "0");
  const min = String(t.mm).padStart(2, "0");

  return `${y}-${mm}-${dd}T${hh}:${min}`;
}

export function isoToMmDd(iso) {
  if (!iso) return "";
  const parts = String(iso).split("T")[0].split("-");
  if (parts.length !== 3) return "";
  return `${String(parts[1]).padStart(2, "0")}/${String(parts[2]).padStart(2, "0")}`;
}

export function isoToHhMm(iso) {
  if (!iso) return "";
  const p = String(iso).split("T");
  if (p.length < 2) return "";
  return p[1].slice(0, 5);
}

/* =========================
   State checks
   ========================= */

export function isPendingStart(log) {
  if (!log) return false;

  const endFields = [
    "endDate",
    "endTime",
    "endPct",
    "endRange",
    "Consumption"
  ];

  for (const f of endFields) {
    if (log[f] !== null && log[f] !== undefined && String(log[f]).trim() !== "") {
      return false;
    }
  }
  return true;
}

export function isCompleteLog(log) {
  if (!log) return false;

  const startReq = [
    "startDate",
    "startTime",
    "startPct",
    "startRange",
    "Mileage"
  ];

  const endReq = [
    "endDate",
    "endTime",
    "endPct",
    "endRange",
    "Consumption"
  ];

  for (const f of [...startReq, ...endReq]) {
    if (log[f] === null || log[f] === undefined || String(log[f]).trim() === "") {
      return false;
    }
  }
  return true;
}

/* =========================
   Validation (Issue #2)
   ========================= */

/**
 * Validate numeric value within range
 */
export function isNumberInRange(val, min, max) {
  const n = Number(val);
  return Number.isFinite(n) && n >= min && n <= max;
}

/**
 * Validate percentage (0–100)
 */
export function isValidPct(val) {
  return isNumberInRange(val, 0, 100);
}

/**
 * Validate ISO date-time ordering
 * end must be strictly after start
 */
export function isEndAfterStart(startIso, endIso) {
  if (!startIso || !endIso) return false;
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  return Number.isFinite(s) && Number.isFinite(e) && e > s;
}

/**
 * High-level log validation
 * Returns { ok: boolean, error?: string }
 */
export function validateLog(log) {
  if (!log) return { ok: false, error: "Missing log object" };

  if (!isValidPct(log.startPct)) {
    return { ok: false, error: "Invalid start percentage" };
  }

  if (log.endPct !== undefined && !isValidPct(log.endPct)) {
    return { ok: false, error: "Invalid end percentage" };
  }

  if (log.startIso && log.endIso) {
    if (!isEndAfterStart(log.startIso, log.endIso)) {
      return { ok: false, error: "End time must be after start time" };
    }
  }

  return { ok: true };
}
export function removeFirstTenLogs() {
  const logs = loadLogs();
  saveLogs(logs.slice(10));
}

/* ---------- Validation helpers ---------- */

export function isPercent(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100;
}

export function parseDateInput(input) {
  if (!input) return null;

  const v = String(input).trim();

  // ISO already → keep
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return v;
  }

  // M/D, MM/D, M/DD, MM/DD
  const m = v.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;

  const year = new Date().getFullYear();
  const mm = Number(m[1]);
  const dd = Number(m[2]);

  if (!Number.isFinite(mm) || !Number.isFinite(dd)) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  return `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export function parseTimeInput(input) {
  if (!input) return null;

  const v = String(input).trim();
  const m = v.match(/^(\d{1,2}):(\d{2})$/);

  if (!m) return null;
   const hh = +m[1];
   const mm = +m[2];
   if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;

  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function shortDate(iso) {
  const [, m, d] = iso.split("-");
  return `${+m}/${+d}`;
}

