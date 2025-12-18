import React, { useEffect, useState } from "react";
import { appendLog, replaceLastLog, buildIsoLocal, shortDate} from "../utils.js";

export default function StartForm({ onDone, onCancel, last, isEdit }) {

//  const isEdit = Boolean(last);

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

  // Prefill on EDIT
  useEffect(() => {
    if (!isEdit || !last) return;

    setForm({
      startDate: last.startDate ? shortDate(last.startDate) : "",
      startTime: last.startTime ?? "",
      startPct: last.startPct ?? "",
      startRange: last.startRange ?? "",
      Mileage: last.Mileage ?? "",
      endDate: last.endDate ? shortDate(last.endDate) : "",
      endTime: last.endTime ?? "",
      endPct: last.endPct ?? "",
      endRange: last.endRange ?? "",
      Consumption: last.Consumption ?? ""
    });
  }, [isEdit, last]);

  // Auto-fill date/time for START
  useEffect(() => {
    if (isEdit) return;

    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    setForm((f) => ({
      ...f,
      startDate: `${mm}/${dd}`,
      startTime: `${hh}:${min}`
    }));
  }, [isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateAndSave() {
    if (!form.startDate || !form.startTime || form.startPct === "" || form.startRange === "") {
      alert("Start fields 1–4 are required (Mileage optional).");
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

    const hasEnd =
      form.endDate &&
      form.endTime &&
      form.endPct !== "" &&
      form.endRange !== "" &&
      form.Consumption !== "";

    if (hasEnd) {
      entry.endDate = buildIsoLocal(form.endDate, form.endTime) || form.endDate;
      entry.endTime = form.endTime;
      entry.endPct = Number(form.endPct);
      entry.endRange = Number(form.endRange);
      entry.Consumption = parseFloat(form.Consumption);
    }

    if (isEdit) {
      replaceLastLog(entry);
      alert("Record updated.");
    } else {
      appendLog(entry);
      alert(hasEnd ? "Full session saved." : "Start entry saved (pending).");
    }

    onDone();
  }

  return (
    <div className="card">
      <h3>{isEdit ? "EDIT — Charging session" : "START — New charging session"}</h3>

      <label className="label-row">
        Start date (mm/dd)
        <input value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
      </label>

      <label className="label-row">
        Start time (hh:mm)
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
        End date (mm/dd)
        <input value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
      </label>

      <label className="label-row">
        End time (hh:mm)
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
        <button className="btn btn-start" onClick={validateAndSave}>
          Save
        </button>
        <button className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
