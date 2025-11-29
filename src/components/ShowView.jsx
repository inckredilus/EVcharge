import React from "react";
import { loadLogs, removeLastLog } from "../utils.js";

/*
 ShowView:
 - Displays pending (if any) and history (newest-first).
 - BACK button: returns to caller (App) which will direct to COMPLETE or START as appropriate.
 - DELETE allows deleting the last record and returns home.
*/
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
