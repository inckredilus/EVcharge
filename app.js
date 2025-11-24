// ------------------------------
// Utility Functions
// ------------------------------

function getNowDate() {
    return new Date().toISOString().slice(0, 10);
}

function getNowTime() {
    const d = new Date();
    return d.toTimeString().slice(0, 5);
}

function showMessage(msg) {
    document.getElementById("message").textContent = msg;
}

// LocalStorage keys
const PENDING_KEY = "evCharge_pending";
const HISTORY_KEY = "evCharge_history";

// ------------------------------
// Storage Helper Functions
// ------------------------------

function loadPending() {
    return JSON.parse(localStorage.getItem(PENDING_KEY));
}

function savePending(entry) {
    localStorage.setItem(PENDING_KEY, JSON.stringify(entry));
}

function clearPending() {
    localStorage.removeItem(PENDING_KEY);
}

function loadHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}

function saveHistory(list) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

// ------------------------------
// UI Helpers
// ------------------------------

function showHome() {
    document.getElementById("chargeForm").classList.add("hidden");
    document.getElementById("showArea").classList.add("hidden");
    document.getElementById("homeButtons").classList.remove("hidden");
    clearFields();
}

function clearFields() {
    let ids = ["startDate","startTime","startPct","startRange","Mileage",
               "endDate","endTime","endPct","endRange","Consumption"];
    ids.forEach(id => document.getElementById(id).value = "");
}

function autoFillIfEmpty() {
    let sd = document.getElementById("startDate");
    let st = document.getElementById("startTime");
    let ed = document.getElementById("endDate");
    let et = document.getElementById("endTime");

    if (!sd.value) sd.value = getNowDate();
    if (!st.value) st.value = getNowTime();
    if (!ed.value) ed.value = getNowDate();
    if (!et.value) et.value = getNowTime();
}

// ------------------------------
// Mode Switching
// ------------------------------

function enterStartMode() {
    const pending = loadPending();

    if (pending) {
        showMessage("A start entry is already pending.");
        return;
    }

    showForm("Start Charging");
    document.getElementById("deleteStartBtn").classList.add("hidden");
}

function enterCompleteMode() {
    const pending = loadPending();

    if (!pending) {
        showMessage("No pending start entry.");
        return;
    }

    fillFormFromPending(pending);
    showForm("Complete Charging");
    document.getElementById("deleteStartBtn").classList.remove("hidden");
}

function showForm(title) {
    showMessage("");
    document.getElementById("formTitle").textContent = title;
    document.getElementById("homeButtons").classList.add("hidden");
    document.getElementById("showArea").classList.add("hidden");
    document.getElementById("chargeForm").classList.remove("hidden");
    autoFillIfEmpty();
}

// ------------------------------
// Pending Form Helpers
// ------------------------------

function fillFormFromPending(p) {
    document.getElementById("startDate").value = p.startDate;
    document.getElementById("startTime").value = p.startTime;
    document.getElementById("startPct").value = p.startPct;
    document.getElementById("startRange").value = p.startRange;
    document.getElementById("Mileage").value = p.Mileage;
}

// ------------------------------
// SUBMIT LOGIC
// ------------------------------

function submitForm() {
    const data = collectFormData();
    const pending = loadPending();

    if (!pending) {
        handleStartSubmit(data);
    } else {
        handleCompleteSubmit(data, pending);
    }
}

function collectFormData() {
    return {
        startDate: document.getElementById("startDate").value,
        startTime: document.getElementById("startTime").value,
        startPct: document.getElementById("startPct").value,
        startRange: document.getElementById("startRange").value,
        Mileage: document.getElementById("Mileage").value,
        endDate: document.getElementById("endDate").value,
        endTime: document.getElementById("endTime").value,
        endPct: document.getElementById("endPct").value,
        endRange: document.getElementById("endRange").value,
        Consumption: document.getElementById("Consumption").value
    };
}

// ------------------------------
// START Submit
// ------------------------------

function handleStartSubmit(d) {
    // Check start-phase required fields
    if (!(d.startDate && d.startTime && d.startPct && d.startRange)) {
        showMessage("Missing required START fields.");
        return;
    }

    // Mileage optional here (but must be filled in COMPLETE mode)

    // If user filled EVERYTHING → treat as COMPLETE
    const allEndFilled =
        d.endDate && d.endTime && d.endPct && d.endRange && d.Consumption;

    if (allEndFilled && d.Mileage) {
        return handleCompleteSubmit(d, null);
    }

    // START only → store pending
    d.endDate = "";
    d.endTime = "";
    d.endPct = "";
    d.endRange = "";
    d.Consumption = "";

    savePending(d);
    showMessage("Start entry saved.");
    showHome();
}

// ------------------------------
// COMPLETE Submit
// ------------------------------

function handleCompleteSubmit(data, pending) {
    // If pending exists → merge start-phase values
    if (pending) {
        data.startDate = pending.startDate;
        data.startTime = pending.startTime;
        data.startPct = pending.startPct;
        data.startRange = pending.startRange;
        data.Mileage = pending.Mileage; // must not change
    }

    // Validate all fields
    const ok =
        data.startDate && data.startTime && data.startPct && data.startRange &&
        data.Mileage &&
        data.endDate && data.endTime && data.endPct && data.endRange && data.Consumption;

    if (!ok) {
        showMessage("All fields must be filled for COMPLETE submit.");
        return;
    }

    // Save to history
    const list = loadHistory();
    list.unshift(data); // newest first
    saveHistory(list);

    clearPending();
    showMessage("Charge entry completed.");
    showHome();
}

// ------------------------------
// Cancel & Delete
// ------------------------------

function cancelForm() {
    clearFields();
    showMessage("Operation canceled.");
    showHome();
}

function deletePendingStart() {
    clearPending();
    showMessage("Pending start entry deleted.");
    showHome();
}

// ------------------------------
// SHOW History
// ------------------------------

function showHistory() {
    const pending = loadPending();
    const list = loadHistory();

    let html = "";

    if (pending) {
        html += `<h3>Pending Start Entry</h3>`;
        html += formatEntry(pending);
    }

    if (list.length > 0) {
        html += `<h3>History</h3>`;
        list.forEach(entry => {
            html += formatEntry(entry);
        });
    }

    if (!pending && list.length === 0) {
        html = "<p>No entries yet.</p>";
    }

    document.getElementById("showArea").innerHTML = html;

    document.getElementById("homeButtons").classList.add("hidden");
    document.getElementById("chargeForm").classList.add("hidden");
    document.getElementById("showArea").classList.remove("hidden");
}

function formatEntry(e) {
    return `
        <div class="entry">
            ${e.startDate} ${e.Mileage ? e.Mileage + " km" : "..."} 
            ${e.startTime}-${e.endTime || "..."}  
            ${e.startPct}-${e.endPct || "..."}%  
            ${e.startRange}-${e.endRange || "..."} km  
            ${e.Consumption ? e.Consumption + " kWh" : ""}
        </div><hr>
    `;
}

// Load home on startup
showHome();
