/* --- src/App.jsx --- */
import React, { useEffect, useState } from "react";
import Home from "./components/Home.jsx";
import StartForm from "./components/StartForm.jsx";
import CompleteForm from "./components/CompleteForm.jsx";
import ShowView from "./components/ShowView.jsx";
import { getLastLog, loadLogs, appendLog } from "./utils.js";

const DEBUG = true; // toggle for PC testing without actual CGI

export default function App() {
  const [mode, setMode] = useState("home");
  const [last, setLast] = useState(null);
  const [version, setVersion] = useState(0);
  const [lastPostedAt, setLastPostedAt] = useState(null);

  useEffect(() => {
    setLast(getLastLog());
  }, [version]);

  function refresh() {
    setVersion((v) => v + 1);
    setLast(getLastLog());
  }

  async function goPostHandler() {
    const logs = loadLogs();
    if (!logs.length) {
      alert("No records to post");
      return;
    }

    // Determine unposted logs (watermark)
    let startIndex = 0;
    if (lastPostedAt) {
      startIndex = logs.findIndex(
        (log) => log.postedAt && log.postedAt === lastPostedAt
      );
      if (startIndex >= 0) startIndex += 1; // start after last posted
      else startIndex = 0;
    }

    const toPost = logs.slice(startIndex);
    if (!toPost.length) {
      alert("All records already posted");
      return;
    }

    const payload = JSON.stringify(toPost);

    if (DEBUG) {
      console.log("DEBUG: POST payload", payload);
      const fakeTimestamp = new Date().toISOString();
      setLastPostedAt(fakeTimestamp);
      alert(`DEBUG: Simulated POST success at ${fakeTimestamp}`);
      return;
    }

    try {
      const response = await fetch("http://192.168.1.65:8090/cgi-bin/write_csv.cgi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      const text = await response.text();
      console.log("POST response:", text);

      if (!response.ok) {
        alert(`POST failed: ${text}`);
        return;
      }

      const now = new Date().toISOString();
      setLastPostedAt(now);
      alert(`Records posted successfully at ${now}`);
    } catch (err) {
      console.error("POST error:", err);
      alert(`POST error: ${err}`);
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
          goPost={goPostHandler}
          last={last}
          lastPostedAt={lastPostedAt}
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
