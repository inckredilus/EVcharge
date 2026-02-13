/* --- src/Home.jsx --- */
import React from "react";
import { isPendingStart, isCompleteLog, shortDate } from "../utils.js";

export default function Home({
  goStart,
  goComplete,
  goShow,
  goEdit,
  goPost,
  last,
  lastPostedAt  // timestamp of last successful POST
}) {
  const lastLog = last;
  const hasAny = !!lastLog;
  const pending = lastLog ? isPendingStart(lastLog) : false;
  const complete = lastLog ? isCompleteLog(lastLog) : false;

  const startEnabled = !hasAny || complete;
  const completeEnabled = pending;
  const showEnabled = hasAny;
  const editEnabled = pending || complete;

  // POST button enabled only if last log exists and is complete
  const postEnabled = hasAny && complete;

  let infoText = "";
  if (!hasAny) {
    infoText = "No charging record exists yet — ready to start your first one.";
  } else if (pending) {
    infoText = "Last charging log not completed yet — please complete it or delete it.";
  } else {
    infoText = "Ready to start a new charging record.";
  }

  return (
    <div className="card">
      <h2>EV Charge Logger v1.2.6</h2>

      <div className="header">
        <button className="btn btn-start" onClick={goStart} disabled={!startEnabled}>
          START
        </button>

        <button className="btn btn-edit" onClick={goEdit} disabled={!editEnabled}>
          EDIT / FINISH
        </button>

        <button className="btn btn-show" onClick={goShow} disabled={!showEnabled}>
          SHOW
        </button>

        <button className="btn btn-post" onClick={goPost} disabled={!postEnabled}>
          POST
        </button>
      </div>

      <div className="small" style={{ marginTop: 12 }}>
        {infoText}
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Latest record summary (newest first)</strong>
        <div className="summary" style={{ marginTop: 8 }}>
          {lastLog ? formatSummary(lastLog) : "No records yet."}
        </div>

        {lastPostedAt && (
          <div className="small" style={{ marginTop: 8, fontStyle: "italic" }}>
            Last records posted: {lastPostedAt}
          </div>
        )}
      </div>
    </div>
  );
}

function formatSummary(e) {
  if (!e) return "";
  const sDate = e.startDate ? shortDate(e.startDate) : "";
  const sTime = e.startTime || "";
  const eTime = e.endTime || "";
  const mileage =
    e.Mileage === "" || e.Mileage === undefined || e.Mileage === null
      ? "..."
      : e.Mileage;
  const pct = (e.startPct ?? "") + "-" + (e.endPct ?? "");
  const range = (e.startRange ?? "") + "-" + (e.endRange ?? "");
  const cons =
    e.Consumption === "" || e.Consumption === undefined || e.Consumption === null
      ? ""
      : `${e.Consumption} kWh`;

  const note =
    e.note && e.note.trim() !== ""
      ? ` — ${e.note}`
      : "";

  return `${sDate} ${mileage} ${sTime}-${eTime} ${pct}% ${range} ${cons}${note}`;
}
