/* --- src/App.jsx --- */
import React, { useEffect, useState } from "react";
import Home from "./components/Home.jsx";
import StartForm from "./components/StartForm.jsx";
import CompleteForm from "./components/CompleteForm.jsx";
import ShowView from "./components/ShowView.jsx";
import { getLastLog, loadLogs, saveLogs } from "./utils.js";

// Debug mode toggle
const DEBUG = true; // set to false when deploying to phone

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

  // ------------------------
  // POST logic
  // ------------------------
  async function handlePost() {
    const logs = loadLogs();
    // Only logs not yet posted (no postedAt)
    const toPost = logs.filter(
      (log) => !log.postedAt && log.endDate && log.endTime
    );

    if (toPost.length === 0) {
      alert("No new records to post.");
      return;
    }

    const postedAt = new Date().toISOString();

    if (DEBUG) {
      console.log("DEBUG: Would POST these records:", toPost);
      // Mark as posted locally
      toPost.forEach((log) => (log.postedAt = postedAt));
      saveLogs(logs);
      refresh();
      alert(`DEBUG: Simulated POST of ${toPost.length} record(s).`);
      return;
    }

    // Production POST
    try {
      const resp = await fetch(
        "http://127.0.0.1:8090/cgi-bin/write_csv.cgi",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPost),
        }
      );

      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
      // Mark posted logs
      toPost.forEach((log) => (log.postedAt = postedAt));
      saveLogs(logs);
      refresh();
      alert(`Successfully posted ${toPost.length} record(s).`);
    } catch (e) {
      alert("POST failed: " + e.message);
    }
  }

  return (
    <div className="app-root">
      {mode === "home" && (
        <Home
          goStart={() => setMode("start")}
          goComplete={() => setMode("complete")}
          goShow={() => setMode("show")}
          goEdit={() => setMode("edit")}
          goPost={handlePost}
          last={last}
          refreshLogs={refresh}
        />
      )}

      {mode === "start" && (
        <StartForm
          isEdit={false}
          last={null}
          onDone={() => {
            refresh();
            setMode("home");
          }}
          onCancel={() => setMode("home")}
        />
      )}

      {mode === "edit" && (
        <StartForm
          isEdit={true}
          last={last}
          onDone={() => {
            refresh();
            setMode("home");
          }}
          onCancel={() => setMode("home")}
        />
      )}

      {mode === "complete" && (
        <CompleteForm
          pending={last}
          onDone={() => {
            refresh();
            setMode("home");
          }}
          onCancel={() => setMode("home")}
        />
      )}

      {mode === "show" && (
        <ShowView
          onBack={() => setMode("home")}
          onDelete={() => {
            refresh();
            setMode("home");
          }}
        />
      )}
    </div>
  );
}
