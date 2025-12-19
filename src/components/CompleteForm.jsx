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

  // Prefill from pending record
  useEffect(() => {
    if (!pending) return;

    const startDate =
      pending.startDate && String(pending.startDate).includes("T")
        ? isoToMmDd(pending.startDate)
        : pending.startDate || "";

    const startTime =
      pending.startDate && String(pending.startDate).includes("T")
        ? isoToHhMm(pending.startDate)
        : pending.startTime || "";

    setForm({
      startDate,
      startTime,
      startPct: pending.startPct ?? "",
      startRange: pending.startRange ?? "",
      Mileage: pending.Mileage ?? "",
      endDate: "",
      endTime: "",
      endPct: "",
      endRange: "",
      Consumption: ""
    });

    // Autofill end date/time
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    setForm((f) => ({
      ...f,
      endDate: `${mm}/${dd}`,
      endTime: `${hh}:${min}`
    }));
  }, [pending]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submitComplete() {
    // Require all fields
    for (const [k, v] of Object.entries(form)) {
      if (v === "" || v === null || v === undefined) {
        alert("All fields are required to complete a session.");
        return;
      }
    }

    const completed = {
      startDate: buildIsoLocal(form.startDate, form.startTime),
      startTime: form.startTime,
      startPct: Number(form.startPct),
      startRange: Number(form.startRange),
      Mileage: Number(form.Mileage),
      endDate: buildIsoLocal(form.endDate, form.endTime),
      endTime: form.endTime,
      endPct: Number(form.endPct),
      endRange: Number(form.endRange),
      Consumption: Number(form.Consumption),
      savedAt: new Date().toISOString()
    };

    replaceLastLog(completed);
    alert("Charging session completed.");
    onDone();
  }

  return (
    <div className="card">
      <h3>COMPLETE — Finish charging session</h3>

      <label className="label-row">
        Start date (MM/DD)
        <input value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
      </label>

      <label className="label-row">
        Start time (HH:MM)
        <input value={form.startTime} onChange={(e) => update("startTime", e.target.value)} />
      </label>

      <label className="label-row">
        Start %
        <input type="number" value={form.startPct} onChange={(e) => update("startPct", e.target.value)} />
      </label>

      <label className="label-row">
        Start range (km)
        <input type="number" value={form.startRange} onChange={(e) => update("startRange", e.target.value)} />
      </label>

      <label className="label-row">
        Mileage (km)
        <input type="number" value={form.Mileage} onChange={(e) => update("Mileage", e.target.value)} />
      </label>

      <hr />

      <label className="label-row">
        End date (MM/DD)
        <input value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
      </label>

      <label className="label-row">
        End time (HH:MM)
        <input value={form.endTime} onChange={(e) => update("endTime", e.target.value)} />
      </label>

      <label className="label-row">
        End %
        <input type="number" value={form.endPct} onChange={(e) => update("endPct", e.target.value)} />
      </label>

      <label className="label-row">
        End range (km)
        <input type="number" value={form.endRange} onChange={(e) => update("endRange", e.target.value)} />
      </label>

      <label className="label-row">
        Consumption (kWh)
        <input type="number" step="0.01" value={form.Consumption} onChange={(e) => update("Consumption", e.target.value)} />
      </label>

      <div className="actions">
        <button className="btn btn-complete" onClick={submitComplete}>SAVE</button>
        <button className="btn-ghost" onClick={onCancel}>CANCEL</button>
      </div>
    </div>
  );
}
