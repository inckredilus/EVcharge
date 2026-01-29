#!/usr/bin/env bash
#
# update_evcharge.sh
#
# TITLE / COMMIT MESSAGE:
# "regen: full app regeneration — update BACK, SHOW, validation, layout and defaults"
#
# PURPOSE:
# - Regenerate the entire EVcharge frontend application by overwriting the
#   key app files (index.html, src/*.jsx, src/components/*, src/styles.css, src/utils.js).
# - This is an overwrite-only update (SAFE MODE): no unrelated files are deleted.
# - Before overwriting, existing versions of the files are copied into a backup folder:
#     ./evcharge_backup/YYYYMMDD_HHMMSS/
#
# HOW TO USE:
# 1. Save this file as update_evcharge.sh in the project root (the directory containing package.json).
# 2. Make it executable: chmod +x update_evcharge.sh
# 3. Run it: ./update_evcharge.sh
# 4. Verify changes, run: npm run build
# 5. Commit & push with suggested git commands printed at the end.
#
# WARNING:
# - This script will overwrite the listed files. Use the backup folder to restore if needed.
# - It will create directories that don't exist (src/, src/components/).
#
# -------------------------------------------------------

# Exit if not in a git branch (safety check)

branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
  echo "ERROR: Do NOT run this script on the main branch."
  echo "Switch to a feature branch (e.g. script-test) and run again."
  exit 1
fi

# Main script starts here
set -euo pipefail

# Timestamp for backup folder
TS=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./evcharge_backup/${TS}"
echo "Backup dir: ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"

# Helper: backup a file if it exists
backup_if_exists() {
  local f="$1"
  if [ -f "$f" ]; then
    echo "Backing up $f -> ${BACKUP_DIR}/"
    mkdir -p "$(dirname "${BACKUP_DIR}/${f}")"
    cp -p "$f" "${BACKUP_DIR}/${f}"
  fi
}

# Helper: write file from here-doc (caller must quote content with single-quoted EOF to avoid expansion)
write_file() {
  local path="$1"
  local tmp="$(mktemp)"
  cat > "$tmp"
  mkdir -p "$(dirname "$path")"
  backup_if_exists "$path"
  mv "$tmp" "$path"
  echo "Wrote $path"
}

echo "Creating directories (if missing)..."
mkdir -p src
mkdir -p src/components

# ---------------------------------------------------------------------
# Now write files. Each write_file call reads from stdin until EOF.
# We pass the content using a here-doc so the script remains self-contained.
# ---------------------------------------------------------------------

# index.html
cat > /tmp/_tmp_index_html <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>EV Charge Logger</title>
  <link rel="icon" href="/vite.svg" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF
write_file "index.html" < /tmp/_tmp_index_html

# src/main.jsx
cat > /tmp/_tmp_main_jsx <<'EOF'
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css"; // include CSS so Vite bundles it into dist

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF
write_file "src/main.jsx" < /tmp/_tmp_main_jsx

# src/utils.js
cat > /tmp/_tmp_utils_js <<'EOF'
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
EOF
write_file "src/utils.js" < /tmp/_tmp_utils_js

# src/App.jsx
cat > /tmp/_tmp_app_jsx <<'EOF'
import React, { useEffect, useState } from "react";
import Home from "./components/Home.jsx";
import StartForm from "./components/StartForm.jsx";
import CompleteForm from "./components/CompleteForm.jsx";
import ShowView from "./components/ShowView.jsx";
import { getLastLog } from "./utils.js";

export default function App() {
  const [mode, setMode] = useState("home");
  const [last, setLast] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setLast(getLastLog());
  }, [version]);

  function refresh() {
    setVersion((v) => v + 1);
    setLast(getLastLog());
  }

  return (
    <div className="app-root">
      {mode === "home" && (
        <Home
          goStart={() => setMode("start")}
          goComplete={() => setMode("complete")}
          goShow={() => setMode("show")}
          last={last}
          refreshLogs={refresh}
        />
      )}
      {mode === "start" && (
        <StartForm
          onDone={() => {
            refresh();
            setMode("home");
          }}
          onCancel={() => setMode("home")}
          last={last}
        />
      )}
      {mode === "complete" && (
        <CompleteForm
          onDone={() => {
            refresh();
            setMode("home");
          }}
          onCancel={() => setMode("home")}
          pending={last}
        />
      )}
      {mode === "show" && (
        <ShowView
          onBack={() => {
            // Always return to home when BACK pressed from SHOW (per spec)
            setMode("home");
          }}
          onDelete={() => {
            refresh();
            setMode("home");
          }}
        />
      )}
    </div>
  );
}
EOF
write_file "src/App.jsx" < /tmp/_tmp_app_jsx

# src/components/Home.jsx
cat > /tmp/_tmp_home_jsx <<'EOF'
import React from "react";
import { isPendingStart, isCompleteLog } from "../utils.js";

export default function Home({ goStart, goComplete, goShow, last, refreshLogs }) {
  const lastLog = last;
  const hasAny = !!lastLog;
  const pending = lastLog ? isPendingStart(lastLog) : false;
  const complete = lastLog ? isCompleteLog(lastLog) : false;

  let startEnabled = false;
  let completeEnabled = false;
  let showEnabled = false;
  let infoText = "";

  if (!hasAny) {
    startEnabled = true;
    completeEnabled = false;
    showEnabled = false;
    infoText = "No charging record exists yet — ready to start your first one.";
  } else if (pending) {
    startEnabled = false;
    completeEnabled = true;
    showEnabled = true;
    infoText = "Last charging log not completed yet — please complete it or delete it.";
  } else if (complete) {
    startEnabled = true;
    completeEnabled = false;
    showEnabled = true;
    infoText = "Ready to start a new charging record.";
  } else {
    startEnabled = true;
    completeEnabled = false;
    showEnabled = true;
    infoText = "Ready to start a new charging record.";
  }

  return (
    <div className="card">
      <h2>EV Charge Logger</h2>

      <div className="header">
        <button className="btn btn-start" onClick={goStart} disabled={!startEnabled}>START</button>
        <button className="btn btn-complete" onClick={goComplete} disabled={!completeEnabled}>COMPLETE</button>
        <button className="btn btn-show" onClick={goShow} disabled={!showEnabled}>SHOW</button>
      </div>

      <div className="small" style={{ marginTop: 12 }}>{infoText}</div>

      <div style={{ marginTop: 16 }}>
        <strong>Latest record summary (newest first)</strong>
        <div className="summary" style={{ marginTop: 8 }}>
          {lastLog ? formatSummary(lastLog) : "No records yet."}
        </div>
      </div>
    </div>
  );
}

function formatSummary(e) {
  if (!e) return "";
  const sDate = e.startDate && e.startDate.indexOf("T") !== -1 ? e.startDate.split("T")[0] : e.startDate;
  const sTime = e.startTime || "";
  const eTime = e.endTime || "";
  const mileage = (e.Mileage === "" || e.Mileage === undefined || e.Mileage === null) ? "..." : e.Mileage;
  const pct = (e.startPct ?? "") + "-" + (e.endPct ?? "");
  const range = (e.startRange ?? "") + "-" + (e.endRange ?? "");
  const cons = (e.Consumption === "" || e.Consumption === undefined || e.Consumption === null) ? "" : `${e.Consumption} kWh`;
  return `${sDate} ${mileage} ${sTime}-${eTime} ${pct}% ${range} ${cons}`;
}
EOF
write_file "src/components/Home.jsx" < /tmp/_tmp_home_jsx

# src/components/StartForm.jsx
cat > /tmp/_tmp_start_jsx <<'EOF'
import React, { useEffect, useState } from "react";
import { appendLog, buildIsoLocal } from "../utils.js";

export default function StartForm({ onDone, onCancel, last }) {
  const [form, setForm] = useState({
    startDate: "",
    startTime: "",
    startPct: "",
    startRange: "",
    Mileage: "",
    endDate: "",
    endTime: "",
    endPct: "",
    endRange: "",
    Consumption: ""
  });

  useEffect(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    setForm((f) => ({
      ...f,
      startDate: f.startDate || `${mm}/${dd}`,
      startTime: f.startTime || `${hh}:${min}`
    }));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateAndSubmit() {
    if (!form.startDate || !form.startTime || form.startPct === "" || form.startRange === "") {
      alert("Start fields 1–4 are required (Mileage optional at START).");
      return;
    }

    const anyEnd = Boolean(form.endDate || form.endTime || form.endPct || form.endRange || form.Consumption);
    const allEnd = Boolean(form.endDate && form.endTime && form.endPct && form.endRange && (form.Consumption !== "" && form.Consumption !== null && form.Consumption !== undefined));

    if (anyEnd && !allEnd) {
      alert("You started entering end fields — please fill all end fields (endDate, endTime, endPct, endRange, Consumption) to submit a full entry.");
      return;
    }

    const entry = {
      startDate: buildIsoLocal(form.startDate, form.startTime) || form.startDate,
      startTime: form.startTime,
      startPct: Number(form.startPct),
      startRange: Number(form.startRange),
      Mileage: form.Mileage === "" ? "" : Number(form.Mileage),
      endDate: "",
      endTime: "",
      endPct: "",
      endRange: "",
      Consumption: "",
      savedAt: new Date().toISOString()
    };

    if (allEnd) {
      entry.endDate = buildIsoLocal(form.endDate, form.endTime) || form.endDate;
      entry.endTime = form.endTime;
      entry.endPct = Number(form.endPct);
      entry.endRange = Number(form.endRange);
      entry.Consumption = parseFloat(form.Consumption);
      appendLog(entry);
      alert("Full session saved to history.");
      onDone();
      return;
    }

    appendLog(entry);
    alert("Start entry saved (pending).");
    onDone();
  }

  return (
    <div className="card">
      <h3>START — New charging session</h3>
      <div className="small">Enter start values. Mileage optional. If you fill end values here fully, it will be saved as a complete entry.</div>

      <label className="label-row">Start date (mm/dd)
        <input value={form.startDate} onChange={(e)=>update("startDate", e.target.value)} placeholder="MM/DD" />
      </label>

      <label className="label-row">Start time (hh:mm)
        <input value={form.startTime} onChange={(e)=>update("startTime", e.target.value)} placeholder="HH:MM" />
      </label>

      <label className="label-row">Start % (remaining)
        <input value={form.startPct} onChange={(e)=>update("startPct", e.target.value)} type="number" min="0" max="100"/>
      </label>

      <label className="label-row">Start range (km)
        <input value={form.startRange} onChange={(e)=>update("startRange", e.target.value)} type="number"/>
      </label>

      <label className="label-row">Mileage / odometer (km) — optional at START
        <input value={form.Mileage} onChange={(e)=>update("Mileage", e.target.value)} type="number"/>
      </label>

      <hr/>

      <label className="label-row">End date (mm/dd)
        <input value={form.endDate} onChange={(e)=>update("endDate", e.target.value)} placeholder="MM/DD" />
      </label>

      <label className="label-row">End time (hh:mm)
        <input value={form.endTime} onChange={(e)=>update("endTime", e.target.value)} placeholder="HH:MM" />
      </label>

      <label className="label-row">End % (charged)
        <input value={form.endPct} onChange={(e)=>update("endPct", e.target.value)} type="number" min="0" max="100"/>
      </label>

      <label className="label-row">End range (km)
        <input value={form.endRange} onChange={(e)=>update("endRange", e.target.value)} type="number"/>
      </label>

      <label className="label-row">Consumption (kWh)
        <input value={form.Consumption} onChange={(e)=>update("Consumption", e.target.value)} type="number" step="0.01"/>
      </label>

      <div className="actions">
        <button className="btn btn-start" onClick={validateAndSubmit}>Submit</button>
        <button className="btn-ghost" onClick={onCancel}>CANCEL</button>
        <button className="btn-ghost" onClick={onCancel}>BACK</button>
      </div>
    </div>
  );
}
EOF
write_file "src/components/StartForm.jsx" < /tmp/_tmp_start_jsx

# src/components/CompleteForm.jsx
cat > /tmp/_tmp_complete_jsx <<'EOF'
import React, { useEffect, useState } from "react";
import { replaceLastLog, buildIsoLocal, isoToMmDd, isoToHhMm } from "../utils.js";

export default function CompleteForm({ onDone, onCancel, pending }) {
  const [form, setForm] = useState({
    startDate: "",
    startTime: "",
    startPct: "",
    startRange: "",
    Mileage: "",
    endDate: "",
    endTime: "",
    endPct: "",
    endRange: "",
    Consumption: ""
  });

  useEffect(() => {
    if (pending) {
      if (pending.startDate && String(pending.startDate).indexOf("T") !== -1) {
        setForm((f) => ({ ...f, startDate: isoToMmDd(pending.startDate), startTime: isoToHhMm(pending.startDate) }));
      } else {
        setForm((f) => ({ ...f, startDate: pending.startDate || "", startTime: pending.startTime || "" }));
      }
      setForm((f) => ({
        ...f,
        startPct: pending.startPct ?? "",
        startRange: pending.startRange ?? "",
        Mileage: pending.Mileage ?? ""
      }));
    }

    // Autofill end date/time if empty
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    setForm((f) => ({
      ...f,
      endDate: f.endDate || `${mm}/${dd}`,
      endTime: f.endTime || `${hh}:${mins}`
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submitComplete() {
    if (!form.startDate || !form.startTime || form.startPct === "" || form.startRange === "" || form.Mileage === "") {
      alert("All start fields including Mileage are required to complete.");
      return;
    }
    if (!form.endDate || !form.endTime || form.endPct === "" || form.endRange === "" || form.Consumption === "") {
      alert("All end fields including Consumption are required to complete.");
      return;
    }

    const completed = {
      startDate: buildIsoLocal(form.startDate, form.startTime) || form.startDate,
      startTime: form.startTime,
      startPct: Number(form.startPct),
      startRange: Number(form.startRange),
      Mileage: Number(form.Mileage),
      endDate: buildIsoLocal(form.endDate, form.endTime) || form.endDate,
      endTime: form.endTime,
      endPct: Number(form.endPct),
      endRange: Number(form.endRange),
      Consumption: parseFloat(form.Consumption),
      savedAt: new Date().toISOString()
    };

    replaceLastLog(completed);
    alert("Pending session completed and saved.");
    onDone();
  }

  return (
    <div className="card">
      <h3>COMPLETE — Finish pending session</h3>
      <div className="small">Edit start values if needed, then fill all end fields (Consumption mandatory).</div>

      <label className="label-row">Start date (mm/dd)
        <input value={form.startDate} onChange={(e)=>update("startDate", e.target.value)} />
      </label>

      <label className="label-row">Start time (hh:mm)
        <input value={form.startTime} onChange={(e)=>update("startTime", e.target.value)} />
      </label>

      <label className="label-row">Start % (remaining)
        <input value={form.startPct} onChange={(e)=>update("startPct", e.target.value)} type="number" min="0" max="100"/>
      </label>

      <label className="label-row">Start range (km)
        <input value={form.startRange} onChange={(e)=>update("startRange", e.target.value)} type="number"/>
      </label>

      <label className="label-row">Mileage / odometer (km) — REQUIRED to complete
        <input value={form.Mileage} onChange={(e)=>update("Mileage", e.target.value)} type="number"/>
      </label>

      <hr/>

      <label className="label-row">End date (mm/dd)
        <input value={form.endDate} onChange={(e)=>update("endDate", e.target.value)} />
      </label>

      <label className="label-row">End time (hh:mm)
        <input value={form.endTime} onChange={(e)=>update("endTime", e.target.value)} />
      </label>

      <label className="label-row">End % (charged)
        <input value={form.endPct} onChange={(e)=>update("endPct", e.target.value)} type="number" min="0" max="100"/>
      </label>

      <label className="label-row">End range (km)
        <input value={form.endRange} onChange={(e)=>update("endRange", e.target.value)} type="number"/>
      </label>

      <label className="label-row">Consumption (kWh)
        <input value={form.Consumption} onChange={(e)=>update("Consumption", e.target.value)} type="number" step="0.01"/>
      </label>

      <div className="actions">
        <button className="btn btn-complete" onClick={submitComplete}>Submit</button>
        <button className="btn-ghost" onClick={onCancel}>CANCEL</button>
        <button className="btn-ghost" onClick={onCancel}>BACK</button>
      </div>
    </div>
  );
}
EOF
write_file "src/components/CompleteForm.jsx" < /tmp/_tmp_complete_jsx

# src/components/ShowView.jsx
cat > /tmp/_tmp_show_jsx <<'EOF'
import React from "react";
import { loadLogs, removeLastLog } from "../utils.js";

export default function ShowView({ onBack, onDelete }) {
  const logs = loadLogs();
  const last = logs.length ? logs[logs.length - 1] : null;

  function handleDelete() {
    if (!last) {
      alert("No record to delete.");
      return;
    }
    if (!confirm("Delete the last record? This cannot be undone.")) return;
    removeLastLog();
    alert("Last record deleted.");
    if (onDelete) onDelete();
  }

  return (
    <div className="card">
      <h3>SHOW — Pending and History</h3>

      <div className="small">Pending (if any) is shown first. History follows (newest first).</div>

      <div style={{ marginTop: 12 }}>
        <strong>Pending / Latest</strong>
        <div className="summary" style={{ marginTop: 8 }}>
          {last ? formatDetailed(last) : "No records."}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>History</strong>
        <div className="list" style={{ marginTop: 8 }}>
          {logs.length === 0 && <div className="list-item">No history yet.</div>}
          {logs.slice().reverse().map((entry, idx) => (
            <div className="list-item" key={idx}>
              <div style={{ fontWeight: 700 }}>{formatSummary(entry)}</div>
              <div className="meta">{entry.savedAt || ""}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="actions" style={{ marginTop: 12 }}>
        <button className="btn-ghost" onClick={onBack}>BACK</button>
        <button className="btn-danger" onClick={handleDelete}>Delete last record</button>
      </div>
    </div>
  );
}

function formatSummary(e) {
  if (!e) return "";
  const sDate = (e.startDate && e.startDate.indexOf("T") !== -1) ? e.startDate.split("T")[0] : e.startDate;
  const sTime = e.startTime || "";
  const eTime = e.endTime || "";
  const mileage = (e.Mileage === "" || e.Mileage === null || e.Mileage === undefined) ? "..." : String(e.Mileage);
  const pct = `${e.startPct ?? ""}-${e.endPct ?? ""}%`;
  const range = `${e.startRange ?? ""}-${e.endRange ?? ""}`;
  const cons = (e.Consumption === "" || e.Consumption === null || e.Consumption === undefined) ? "" : `${e.Consumption} kWh`;
  return `${sDate} ${mileage} ${sTime}-${eTime} ${pct} ${range} ${cons}`;
}

function formatDetailed(e) {
  if (!e) return "";
  const sDate = (e.startDate && e.startDate.indexOf("T") !== -1) ? e.startDate.split("T")[0] : e.startDate;
  const sTime = e.startTime || "";
  const lines = [
    `Start: ${sDate} ${sTime}`,
    `Start SOC: ${e.startPct ?? ""} %`,
    `Start Range: ${e.startRange ?? ""} km`,
    `Mileage: ${(e.Mileage === "" || e.Mileage === null || e.Mileage === undefined) ? "..." : e.Mileage + " km"}`,
    ""
  ];
  if (e.endDate || e.endTime || e.endPct || e.endRange || (e.Consumption !== "" && e.Consumption !== null && e.Consumption !== undefined)) {
    const edate = (e.endDate && e.endDate.indexOf("T") !== -1) ? e.endDate.split("T")[0] : e.endDate;
    const etime = e.endTime || "";
    lines.push(`End: ${edate} ${etime}`);
    if (e.endPct !== "" && e.endPct !== null && e.endPct !== undefined) lines.push(`End SOC: ${e.endPct} %`);
    if (e.endRange !== "" && e.endRange !== null && e.endRange !== undefined) lines.push(`End Range: ${e.endRange} km`);
    if (e.Consumption !== "" && e.Consumption !== null && e.Consumption !== undefined) lines.push(`Consumption: ${e.Consumption} kWh`);
  } else {
    lines.push("End: (not entered)");
  }
  return lines.join("\n");
}
EOF
write_file "src/components/ShowView.jsx" < /tmp/_tmp_show_jsx

# src/styles.css
cat > /tmp/_tmp_styles_css <<'EOF'
:root {
  --bg: #f4f7fb;
  --card: #ffffff;
  --muted: #6b7280;
  --accent: #2563eb;
  --success: #10b981;
  --danger: #ef4444;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 12px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: var(--bg);
  color: #0f172a;
}
.app-root { max-width: 900px; margin: 0 auto; }

.card {
  background: var(--card);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(16,24,40,0.06);
  margin-bottom: 12px;
}
.header { display:flex; gap:8px; justify-content:center; margin-top:8px; flex-wrap:wrap; }
.btn { border:0; padding:10px 14px; border-radius:10px; font-weight:700; cursor:pointer; }
.btn-start { background:var(--accent); color:white; }
.btn-complete { background:var(--success); color:white; }
.btn-show { background:#f59e0b; color:white; }
.btn-ghost { background:#eef2ff; color:var(--accent); font-weight:700; border-radius:8px; padding:10px; }
.btn-danger { background:#fee2e2; color:var(--danger); font-weight:700; padding:10px; border-radius:8px; }

.small { font-size:13px; color:var(--muted); margin-top:8px; }
.row { display:flex; gap:8px; margin-top:6px; }
.col { flex:1; min-width:0; }

/* label-row ensures label and its input are horizontally aligned on same row */
.label-row { display:flex; align-items:center; gap:10px; margin-top:8px; }
.label-row input { flex:1; padding:8px; border-radius:8px; border:1px solid #e6eef9; font-size:15px; background:#fbfdff; }

input[type="text"], input[type="number"], input[type="tel"] {
  width:100%; padding:10px; border-radius:8px; border:1px solid #e6eef9; font-size:15px; background:#fbfdff;
}
.actions { margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; }
.summary { margin-top:12px; padding:8px; background:#f8fafc; border-radius:8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace; white-space:pre-wrap; }
.list { margin-top:8px; }
.list-item { padding:10px; border-bottom:1px solid #eef6ff; }
.meta { font-size:13px; color:var(--muted); margin-top:4px; }
@media (max-width:560px) { .row { flex-direction:column; } .header { flex-direction:column; } }
EOF
write_file "src/styles.css" < /tmp/_tmp_styles_css

# clean up temp files
rm -f /tmp/_tmp_*

echo
echo "--------------------------------------------------------"
echo "Update script finished. Files written and backups stored at: ${BACKUP_DIR}"
echo
echo "Next suggested steps:"
echo "  1) Inspect files and run a local build to verify:"
echo "       npm install"
echo "       npm run build"
echo
echo "  2) Serve the dist/ locally to test (on PC):"
echo "       npx serve -s dist"
echo "     or"
echo "       python3 -m http.server 8000 -d dist"
echo
echo "  3) If everything looks good, commit & push to git:"
echo "       git add ."
echo "       git commit -m \"regen: full app regeneration — update BACK, SHOW, validation, layout and defaults\""
echo "       git push"
echo
echo "Notes:"
echo "- The script does NOT touch node_modules or package.json."
echo "- It backups replaced files into ${BACKUP_DIR} so you can restore if needed."
echo "--------------------------------------------------------"
