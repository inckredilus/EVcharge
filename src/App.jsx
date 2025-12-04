import React, { useEffect, useState } from "react";
import Home from "./components/Home.jsx";
import StartForm from "./components/StartForm.jsx";
import CompleteForm from "./components/CompleteForm.jsx";
import ShowView from "./components/ShowView.jsx";
import { getLastLog } from "./utils.js";

export default function App() {
  const [mode, setMode] = useState("home");
  const [last, setLast] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setLast(getLastLog());
  }, [version]);

  function refresh() {
    setVersion((v) => v + 1);
    setLast(getLastLog());
  }

  return (
    <div className="app-root">
      {mode === "home" && (
        <Home
          goStart={() => setMode("start")}
          goComplete={() => setMode("complete")}
          goShow={() => setMode("show")}
          last={last}
          refreshLogs={refresh}
        />
      )}
      {mode === "start" && (
        <StartForm
          onDone={() => {
            refresh();
            setMode("home");
          }}
          onCancel={() => setMode("home")}
          last={last}
        />
      )}
      {mode === "complete" && (
        <CompleteForm
          onDone={() => {
            refresh();
            setMode("home");
          }}
          onCancel={() => setMode("home")}
          pending={last}
        />
      )}
      {mode === "show" && (
        <ShowView
          onBack={() => {
            // Always return to home when BACK pressed from SHOW (per spec)
            setMode("home");
          }}
          onDelete={() => {
            refresh();
            setMode("home");
          }}
        />
      )}
    </div>
  );
}
