import React from "react";
import { isPendingStart, isCompleteLog, shortDate } from "../utils.js";

export default function Home({
  goStart,
  goComplete,
  goShow,
  goEdit,
  goPost,
  last
}) {
  const lastLog = last;
  const hasAny = !!lastLog;
  const pending = lastLog ? isPendingStart(lastLog) : false;
  const complete = lastLog ? isCompleteLog(lastLog) : false;

  const startEnabled = !hasAny || complete;
  const completeEnabled = pending;
  const showEnabled = hasAny;
  const editEnabled = pending || complete;

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
      <h2>EV Charge Logger v1.1.4</h2>

      <div className="header">
        <button className="btn btn-start" onClick={goStart} disabled={!startEnabled}>
          START
        </button>

        <button className="btn btn-complete" onClick={goComplete} disabled={!completeEnabled}>
          COMPLETE
        </button>

        <button className="btn btn-show" onClick={goShow} disabled={!showEnabled}>
          SHOW
        </button>

        <button className="btn btn-edit" onClick={goEdit} disabled={!editEnabled}>
          EDIT
        </button>

        <button className="btn btn-post" onClick={goPost} disabled>
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
  return `${sDate} ${mileage} ${sTime}-${eTime} ${pct}% ${range} ${cons}`;
}
