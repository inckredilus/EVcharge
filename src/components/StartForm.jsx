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
