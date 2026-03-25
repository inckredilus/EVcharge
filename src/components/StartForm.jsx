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
    Consumption: "",
    note: ""
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
      Consumption: last.Consumption ?? "",
      note: last.note ?? ""
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
    // --- Basic START validation (always required) ---
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
      alert("Start percentage must be 0–100.");
      return;
    }

    // --- Start from existing record if editing ---
    const base = isEdit && last ? { ...last } : {};

    // --- Always update START fields ---
    const entry = {
      ...base, // 🔑 preserve existing values

      startDate: startDateIso,
      startTime: startTimeNorm,
      startIso: `${startDateIso}T${startTimeNorm}`,
      startPct: Number(form.startPct),
      startRange: Number(form.startRange),

      // Mileage: allow empty for start, but preserve if already set
      Mileage:
        form.Mileage === ""
          ? base.Mileage ?? ""
          : Number(form.Mileage),

      note: form.note.trim(),
      savedAt: new Date().toISOString()
    };

    // --- Update END fields ONLY if provided ---
    if (form.endDate) {
      const d = parseDateInput(form.endDate);
      if (!d) {
        alert("Invalid end date.");
        return;
      }
      entry.endDate = d;
    }

    if (form.endTime) {
      const t = parseTimeInput(form.endTime);
      if (!t) {
        alert("Invalid end time.");
        return;
      }
      entry.endTime = t;
    }

    // Build endIso only if both exist
    if (entry.endDate && entry.endTime) {
      entry.endIso = `${entry.endDate}T${entry.endTime}`;
    }

    if (form.endPct !== "") {
      if (!isValidPct(form.endPct)) {
        alert("End percentage must be 0–100.");
        return;
      }
      entry.endPct = Number(form.endPct);
    }

    if (form.endRange !== "") {
      entry.endRange = Number(form.endRange);
    }

    if (form.Consumption !== "") {
      entry.Consumption = Number(form.Consumption);
    }

    // --- FINAL VALIDATION (only if trying to complete) ---
    const isComplete =
      entry.endDate &&
      entry.endTime &&
      entry.endPct !== "" &&
      entry.endRange !== "" &&
      entry.Consumption !== "" &&
      entry.Mileage !== "";

    if (isComplete) {
      // enforce mileage ONLY when completing
      if (entry.Mileage === "" || entry.Mileage === null) {
        alert("Mileage is required to complete the record.");
        return;
      }
    }

    // --- Save ---
    if (isEdit) {
      replaceLastLog(entry);
      alert(isComplete ? "Record completed." : "Progress saved.");
    } else {
      appendLog(entry);
      alert(isComplete ? "Full session saved." : "Start entry saved.");
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
      
      <label className="label-row">
        Note (optional)
        <input
          type="text"
          value={form.note}
          onChange={(e) => update("note", e.target.value)}
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
