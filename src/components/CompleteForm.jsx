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
