/* --- src/components/CompleteForm.jsx --- */
import React, { useEffect, useState } from "react";
import { replaceLastLog, buildIsoLocal, isoToHhMm } from "../utils.js";

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

  // Prefill form from pending record
  useEffect(() => {
    if (!pending) return;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    const startDate =
      pending.startDate && String(pending.startDate).includes("T")
        ? pending.startDate.slice(0, 10) // extract YYYY-MM-DD from ISO
        : pending.startDate || "";

    const startTime =
      pending.startDate && String(pending.startDate).includes("T")
        ? isoToHhMm(pending.startDate) // extract HH:MM from ISO
        : pending.startTime || "";

    setForm({
      startDate,
      startTime,
      startPct: pending.startPct ?? "",
      startRange: pending.startRange ?? "",
      Mileage: pending.Mileage ?? "",
      endDate: `${yyyy}-${mm}-${dd}`, // default end date = today (ISO)
      endTime: `${hh}:${min}`,        // default end time = now
      endPct: "",
      endRange: "",
      Consumption: ""
    });
  }, [pending]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submitComplete() {
    // Validate required start fields
    if (
      !form.startDate ||
      !form.startTime ||
      form.startPct === "" ||
      form.startRange === "" ||
      form.Mileage === ""
    ) {
      alert("All start fields (including Mileage) are required.");
      return;
    }

    // Validate required end fields
    if (
      !form.endDate ||
      !form.endTime ||
      form.endPct === "" ||
      form.endRange === "" ||
      form.Consumption === ""
    ) {
      alert("All end fields are required to complete.");
      return;
    }

    // Build ISO safely: only build if not already ISO
    const startIso = String(form.startDate).includes("T")
      ? form.startDate
      : buildIsoLocal(form.startDate, form.startTime);

    const endIso = String(form.endDate).includes("T")
      ? form.endDate
      : buildIsoLocal(form.endDate, form.endTime);
// debug 2 rows:
      console.log("startIso", startIso);
      console.log("endIso", endIso);


    if (!startIso || !endIso) {
      alert("Invalid date or time format.");
      return;
    }

    const completed = {
      startDate: startIso, // always ISO here
      startTime: form.startTime,
      startPct: Number(form.startPct),
      startRange: Number(form.startRange),
      Mileage: Number(form.Mileage),
      endDate: endIso,     // always ISO here
      endTime: form.endTime,
      endPct: Number(form.endPct),
      endRange: Number(form.endRange),
      Consumption: Number(form.Consumption),
      savedAt: new Date().toISOString()
    };

    replaceLastLog(completed); // overwrite pending with completed record
    alert("Charging session completed.");
    onDone();
  }

  return (
    <div className="card">
      <h3>COMPLETE — Finish charging session</h3>

      <label className="label-row">
        Start date (YYYY-MM-DD or M/D)
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
        End date (YYYY-MM-DD or M/D)
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
