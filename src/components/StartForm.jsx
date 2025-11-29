import React, { useEffect, useState } from "react";
import { appendLog, buildIsoLocal } from "../utils.js";

/*
 StartForm: used to create a new start (or full) entry.
 - Mileage optional for START. If user starts entering end fields, they must complete all end fields to submit.
 - When a full entry is submitted in Start mode, it's appended as complete.
 - On successful submit -> call onDone()
*/
export default function StartForm({ onDone, onCancel, last }) {
  // local form state
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
    // Autofill start date/time only if empty
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateAndSubmit() {
    // require first four start fields
    if (!form.startDate || !form.startTime || form.startPct === "" || form.startRange === "") {
      alert("Start fields 1–4 are required (Mileage optional at START).");
      return;
    }

    // detect if any end fields entered
    const anyEnd = Boolean(form.endDate || form.endTime || form.endPct || form.endRange || form.Consumption);
    const allEnd = Boolean(form.endDate && form.endTime && form.endPct && form.endRange && (form.Consumption !== "" && form.Consumption !== null && form.Consumption !== undefined));

    if (anyEnd && !allEnd) {
      alert("You started entering end fields — please fill all end fields (endDate, endTime, endPct, endRange, Consumption) to submit a full entry.");
      return;
    }

    // Build object - use ISO for dates if parsable
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

    // otherwise store as pending start
    appendLog(entry);
    alert("Start entry saved (pending).");
    onDone();
  }

  return (
    <div className="card">
      <h3>START — New charging session</h3>
      <div className="small">Enter start values. Mileage optional. If you fill end values here fully, it will be saved as a complete entry.</div>

      <label>Start date (mm/dd)
        <input value={form.startDate} onChange={(e)=>update("startDate", e.target.value)} placeholder="MM/DD" />
      </label>

      <div className="row">
        <div className="col">
          <label>Start time (hh:mm)
            <input value={form.startTime} onChange={(e)=>update("startTime", e.target.value)} placeholder="HH:MM" />
          </label>
        </div>
        <div className="col">
          <label>Start % (remaining)
            <input value={form.startPct} onChange={(e)=>update("startPct", e.target.value)} type="number" min="0" max="100"/>
          </label>
        </div>
      </div>

      <label>Start range (km)
        <input value={form.startRange} onChange={(e)=>update("startRange", e.target.value)} type="number"/>
      </label>

      <label>Mileage / odometer (km) — optional at START
        <input value={form.Mileage} onChange={(e)=>update("Mileage", e.target.value)} type="number"/>
      </label>

      <hr/>

      <label>End date (mm/dd)
        <input value={form.endDate} onChange={(e)=>update("endDate", e.target.value)} placeholder="MM/DD" />
      </label>

      <div className="row">
        <div className="col">
          <label>End time (hh:mm)
            <input value={form.endTime} onChange={(e)=>update("endTime", e.target.value)} placeholder="HH:MM" />
          </label>
        </div>
        <div className="col">
          <label>End % (charged)
            <input value={form.endPct} onChange={(e)=>update("endPct", e.target.value)} type="number" min="0" max="100"/>
          </label>
        </div>
      </div>

      <label>End range (km)
        <input value={form.endRange} onChange={(e)=>update("endRange", e.target.value)} type="number"/>
      </label>

      <label>Consumption (kWh)
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
