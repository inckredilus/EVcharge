import React from "react";
import { getLastLog, isPendingStart, isCompleteLog } from "../utils.js";

/*
 Home shows three buttons and an info text below them.
 Buttons enabled/disabled depending on last log state.
*/
export default function Home({ goStart, goComplete, goShow, last, refreshLogs }) {
  // Evaluate state
  const lastLog = last; // passed from App
  const hasAny = !!lastLog;
  const pending = lastLog ? isPendingStart(lastLog) : false;
  const complete = lastLog ? isCompleteLog(lastLog) : false;

  // Determine button enabled/disabled and info text
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
    // fallback - treat as ready to start
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

/* Compact inline summary. Keep simple. */
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
