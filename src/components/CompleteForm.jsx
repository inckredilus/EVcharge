import React, { useEffect, useState } from "react";
import { replaceLastLog, buildIsoLocal } from "../utils.js";

/*
 CompleteForm:
 - Loads pending last log into editable fields.
 - Start fields editable (user may correct), Mileage required here.
 - End fields must all be filled (Consumption mandatory).
 - On success, replace last log and call onDone()
*/
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
    // populate from pending (if pending has ISO startDate, convert to mm/dd/hh:mm display)
    if (pending) {
      if (pending.startDate && String(pending.startDate).indexOf("T") !== -1) {
        const sISO = pending.startDate;
        const mmdd = isoToMmDd(sISO);
        const hhmm = isoToHhMm(sISO);
        setForm((f) => ({ ...f, startDate: mmdd, startTime: hhmm }));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  // helper to convert ISO to mm/dd and hh:mm for prefill
  function isoToMmDd(iso) {
    if (!iso) return "";
    const parts = String(iso).split("T")[0].split("-");
    return `${parts[1]}/${parts[2]}`;
  }
  function isoToHhMm(iso) {
    if (!iso) return "";
    const p = String(iso).split("T");
    return p[1].slice(0, 5);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submitComplete() {
    // validations
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

      <label>Start date (mm/dd)
        <input value={form.startDate} onChange={(e)=>update("startDate", e.target.value)} />
      </label>

      <div className="row">
        <div className="col">
          <label>Start time (hh:mm)
            <input value={form.startTime} onChange={(e)=>update("startTime", e.target.value)} />
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

      <label>Mileage / odometer (km) — REQUIRED to complete
        <input value={form.Mileage} onChange={(e)=>update("Mileage", e.target.value)} type="number"/>
      </label>

      <hr/>

      <label>End date (mm/dd)
        <input value={form.endDate} onChange={(e)=>update("endDate", e.target.value)} />
      </label>

      <div className="row">
        <div className="col">
          <label>End time (hh:mm)
            <input value={form.endTime} onChange={(e)=>update("endTime", e.target.value)} />
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
        <button className="btn btn-complete" onClick={submitComplete}>Submit</button>
        <button className="btn-ghost" onClick={onCancel}>CANCEL</button>
        <button className="btn-ghost" onClick={onCancel}>BACK</button>
      </div>
    </div>
  );
}
