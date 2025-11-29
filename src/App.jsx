import React, { useEffect, useState } from "react";
import Home from "./components/Home.jsx";
import StartForm from "./components/StartForm.jsx";
import CompleteForm from "./components/CompleteForm.jsx";
import ShowView from "./components/ShowView.jsx";
import { loadLogs, getLastLog } from "./utils.js";

/*
  App controls the global mode/state.
  Modes:
    - "home"
    - "start"   (new start form)
    - "complete" (complete existing pending entry)
    - "show"    (view last record + history)
*/
export default function App() {
  const [mode, setMode] = useState("home");
  const [last, setLast] = useState(null);
  const [logsVersion, setLogsVersion] = useState(0); // bump when logs change

  useEffect(() => {
    setLast(getLastLog());
  }, [logsVersion]);

  function refreshLogs() {
    setLogsVersion((v) => v + 1);
    setLast(getLastLog());
  }

  // Render selected mode
  return (
    <div className="app-root">
      {mode === "home" && (
        <Home
          goStart={() => setMode("start")}
          goComplete={() => setMode("complete")}
          goShow={() => setMode("show")}
          last={last}
          refreshLogs={refreshLogs}
        />
      )}
      {mode === "start" && (
        <StartForm
          onDone={() => {
            refreshLogs();
            setMode("home");
          }}
          onCancel={() => setMode("home")}
          last={last}
        />
      )}
      {mode === "complete" && (
        <CompleteForm
          onDone={() => {
            refreshLogs();
            setMode("home");
          }}
          onCancel={() => setMode("home")}
          pending={last}
        />
      )}
      {mode === "show" && (
        <ShowView
          onBack={() => {
            // Show view back takes user to COMPLETE OR START depending on last record
            const l = getLastLog();
            if (!l) {
              setMode("start");
            } else {
              // if pending -> complete, else return to home (but HOME allows start)
              const { isPendingStart } = require("./utils.js"); // dynamic import not needed; using function below
              const pending = l && l.endDate === "" && l.endTime === "" && l.endPct === "" && l.endRange === "" && (l.Consumption === "" || l.Consumption === undefined || l.Consumption === null);
              if (pending) setMode("complete");
              else setMode("home");
            }
          }}
          onDelete={() => {
            refreshLogs();
            setMode("home");
          }}
        />
      )}
    </div>
  );
}
