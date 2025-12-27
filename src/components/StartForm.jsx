/* --- src/components/StartForm.jsx --- */
import React, { useEffect, useState } from "react";
import {
  appendLog,
  replaceLastLog,
  parseDateInput,
  parseTimeInput,
  isValidPct
} from "../utils.js";

export default function StartForm({ onDone, onCancel, last, isEdit }) {
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

  /* =========================
     Prefill on EDIT
     ========================= */
  useEffect(() => {
    if (!isEdit || !last) return;

    setForm({
      startDate: last.startDate ?? "",
      startTime: last.startTime ?? "",
      startPct: last.startPct ?? "",
      startRange: last.startRange ?? "",
      Mileage: last.Mileage ?? "",
      endDate: last.endDate ?? "",
      endTime: last.endTime ?? "",
      endPct: last.endPct ?? "",
      endRange: last.endRange ?? "",
      Consumption: last.Consumption ?? ""
    });
  }, [isEdit, last]);

  /* =========================
     Auto-fill START datetime
     ========================= */
  useEffect(() => {
    if (isEdit) return;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    setForm((f) => ({
      ...f,
      startDate: `${yyyy}-${mm}-${dd}`,
      startTime: `${hh}:${min}`
    }));
  }, [isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  /* =========================
     Validate & Save
     ========================= */
  function validateAndSave() {
    if (
      !form.startDate ||
      !form.startTime ||
      form.startPct === "" ||
      form.startRange === ""
    ) {
      alert("Start fields 1–4 are required (Mileage optional).");
      return;
    }

    const startDateIso = parseDateInput(form.startDate);
    const startTimeNorm = parseTimeInput(form.startTime);

    if (!startDateIso || !startTimeNorm) {
      alert("Invalid start date or time.");
      return;
    }

    if (!isValidPct(form.startPct)) {
      alert("Start percentage must be a number between 0 and 100.");
      return;
    }    

    const entry = {
      startDate: startDateIso,
      startTime: startTimeNorm,
      startIso: `${startDateIso}T${startTimeNorm}`,
      startPct: Number(form.startPct),
      startRange: Number(form.startRange),
      Mileage: form.Mileage === "" ? "" : Number(form.Mileage),
      endDate: "",
      endTime: "",
      endIso: "",
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
      const endDateIso = parseDateInput(form.endDate);
      const endTimeNorm = parseTimeInput(form.endTime);

      if (!endDateIso || !endTimeNorm) {
        alert("Invalid end date or time.");
        return;
      }

      if (!isValidPct(form.endPct)) {
        alert("End percentage must be a number between 0 and 100.");
        return;
      }

      entry.endDate = endDateIso;
      entry.endTime = endTimeNorm;
      entry.endIso = `${endDateIso}T${endTimeNorm}`;
      entry.endPct = Number(form.endPct);
      entry.endRange = Number(form.endRange);
      entry.Consumption = Number(form.Consumption);
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
        Start date (YYYY-MM-DD or M/D)
        <input
          value={form.startDate}
          onChange={(e) => update("startDate", e.target.value)}
        />
      </label>

      <label className="label-row">
        Start time (hh:mm)
        <input
          value={form.startTime}
          onChange={(e) => update("startTime", e.target.value)}
        />
      </label>

      <label className="label-row">
        Start %
        <input
          type="number"
          value={form.startPct}
          onChange={(e) => update("startPct", e.target.value)}
        />
      </label>

      <label className="label-row">
        Start range (km)
        <input
          type="number"
          value={form.startRange}
          onChange={(e) => update("startRange", e.target.value)}
        />
      </label>

      <label className="label-row">
        Mileage (km)
        <input
          type="number"
          value={form.Mileage}
          onChange={(e) => update("Mileage", e.target.value)}
        />
      </label>

      <hr />

      <label className="label-row">
        End date (YYYY-MM-DD or M/D)
        <input
          value={form.endDate}
          onChange={(e) => update("endDate", e.target.value)}
        />
      </label>

      <label className="label-row">
        End time (hh:mm)
        <input
          value={form.endTime}
          onChange={(e) => update("endTime", e.target.value)}
        />
      </label>

      <label className="label-row">
        End %
        <input
          type="number"
          value={form.endPct}
          onChange={(e) => update("endPct", e.target.value)}
        />
      </label>

      <label className="label-row">
        End range (km)
        <input
          type="number"
          value={form.endRange}
          onChange={(e) => update("endRange", e.target.value)}
        />
      </label>

      <label className="label-row">
        Consumption (kWh)
        <input
          type="number"
          step="0.01"
          value={form.Consumption}
          onChange={(e) => update("Consumption", e.target.value)}
        />
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
