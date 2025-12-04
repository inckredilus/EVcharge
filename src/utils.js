/*
 utils.js
 Utility functions for EVcharge: localStorage, parsing, ISO build, validators.
*/
export const LS_KEY = "evcharge_logs";

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

export function parseMmDd(mmdd) {
  if (!mmdd) return null;
  const p = mmdd.trim().split("/");
  if (p.length !== 2) return null;
  const mm = parseInt(p[0], 10), dd = parseInt(p[1], 10);
  if (Number.isNaN(mm) || Number.isNaN(dd)) return null;
  return { mm, dd };
}

export function parseHhMm(hhmm) {
  if (!hhmm) return null;
  const p = hhmm.trim().split(":");
  if (p.length !== 2) return null;
  const hh = parseInt(p[0], 10), mm = parseInt(p[1], 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return { hh, mm };
}

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

export function isPendingStart(log) {
  if (!log) return false;
  const endFields = ["endDate", "endTime", "endPct", "endRange", "Consumption"];
  for (const f of endFields) {
    if (log[f] !== null && log[f] !== undefined && String(log[f]).trim() !== "") return false;
  }
  return true;
}

export function isCompleteLog(log) {
  if (!log) return false;
  const startReq = ["startDate", "startTime", "startPct", "startRange", "Mileage"];
  const endReq = ["endDate", "endTime", "endPct", "endRange", "Consumption"];
  for (const f of [...startReq, ...endReq]) {
    if (log[f] === null || log[f] === undefined || String(log[f]).trim() === "") return false;
  }
  return true;
}
