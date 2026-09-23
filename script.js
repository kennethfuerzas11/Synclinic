const A = document.querySelector("#app"),
  $ = (s) => document.querySelector(s),
  D = {
    role: sessionStorage.synRole || "",
    screen: "login",
    ar: "student",
    view: "home",
    bt: "student",
    tab: "apps",
    modal: "",
    search: "",
    type: "All",
    status: "All",
  };

const T = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
],
  S = [
    "General Consultation",
    "Dental Check-up",
    "Vaccination / Immunization",
    "Medical Certificate",
    "Blood Pressure Monitoring",
    "First Aid / Wound Care",
    "Mental Health Consultation",
    "Laboratory Request",
    "Annual Physical Exam",
  ],
  P = [
    "SHS STEM_CT - Computing Technologies",
    "BS Architecture",
    "BS Information Technology",
    "BS Psychology",
    "BS Tourism Management",
    "BS Computer Engineering",
    "BS Civil Engineering",
    "BS Hospitality Management",
  ],
  E = [
    "Office of the Registrar",
    "Human Resources",
    "Finance Department",
    "IT Department",
    "Library Services",
    "Guidance Office",
    "Student Affairs Office",
    "School of Engineering and Technology",
  ];

let AP = [
  [
    "STU-2024-001",
    "Maria Santos",
    "2021-10234",
    "BS Architecture",
    "Student",
    "2024-08-09",
    "09:00 AM",
    "General Consultation",
    "Confirmed",
  ],
  [
    "STU-2024-002",
    "Juan dela Cruz",
    "2022-08712",
    "BS Information Technology",
    "Student",
    "2024-08-09",
    "09:30 AM",
    "Medical Certificate",
    "Pending",
  ],
  [
    "EMP-2024-003",
    "Prof. Liza Reyes",
    "School of Engineering and Technology",
    "-",
    "Employee",
    "2024-08-09",
    "10:00 AM",
    "Blood Pressure Monitoring",
    "Completed",
  ],
  [
    "STU-2024-004",
    "Carlo Mendoza",
    "2023-05431",
    "BS Architecture",
    "Student",
    "2024-08-09",
    "10:30 AM",
    "Dental Check-up",
    "Cancelled",
  ],
  [
    "EMP-2024-005",
    "Dr. Ramon Flores",
    "IT Department",
    "-",
    "Employee",
    "2024-08-09",
    "11:00 AM",
    "General Consultation",
    "Pending",
  ],
  [
    "STU-2024-006",
    "Ana Villanueva",
    "2021-11089",
    "BS Psychology",
    "Student",
    "2024-08-09",
    "01:00 PM",
    "Mental Health Consultation",
    "Confirmed",
  ],
  [
    "STU-2024-007",
    "Kevin Ramos",
    "2022-09345",
    "SHS STEM_CT - Computing Technologies",
    "Student",
    "2024-08-09",
    "01:30 PM",
    "First Aid / Wound Care",
    "Pending",
  ],
  [
    "EMP-2024-008",
    "Ms. Christine Tan",
    "Guidance Office",
    "-",
    "Employee",
    "2024-08-09",
    "02:00 PM",
    "Vaccination / Immunization",
    "Confirmed",
  ],
];

let NS = [
  [
    "TEMP-2024-001",
    "Bianca Torres",
    "BS Information Technology",
    "1st Year",
    "Pending",
  ],
  [
    "TEMP-2024-002",
    "Rafael Aquino",
    "SHS STEM_CT - Computing Technologies",
    "SHS Grade 11",
    "Pending",
  ],
  ["TEMP-2024-003", "Sophia Lim", "BS Psychology", "1st Year", "Synced"],
  [
    "TEMP-2024-004",
    "Miguel Santos",
    "SHS BUEN_MA - Management and Accountancy",
    "SHS Grade 11",
    "Pending",
  ],
];

const op = (x, p) =>
    `<option value="">${p}</option>` +
    x.map((y) => `<option>${y}</option>`).join(""),
  fi = (l, n, t = "text", p = "") =>
    `<div class="field"><label>${l} <b class="req">*</b></label><input class="input" name="${n}" type="${t}" placeholder="${p}" required></div>`,
  se = (l, n, x, p) =>
    `<div class="field"><label>${l} <b class="req">*</b></label><select class="select" name="${n}" required>${op(x, p)}</select></div>`;

function auth() {
  let u = D.screen === "signup",
    L = {
      student: "Student",
      faculty: "Faculty / Employee",
      staff: "Clinic Staff",
    };

  return `<div class="auth"><main><div class="wrap"><div class="brand"><div class="logo"><i class="cross"></i></div><b>SynClinic</b><small>University Health Office · National University Fairview</small></div><div class="gold"></div><section class="panel"><div class="head"><h1>${u ? "Create an account" : "Welcome back"}</h1><p>${u ? "Register for a SynClinic account to get started." : "Sign in to your SynClinic account to continue."}</p></div><form class="form" id="auth"><span class="caption">${u ? "Registering as" : "I am a"}</span><div class="roles">${Object.entries(
    L,
  )
    .map(
      ([k, v]) =>
        `<button type="button" class="${D.ar === k ? "on" : ""}" onclick="D.ar='${k}';render()"><span>${k === "student" ? "🎓" : k === "faculty" ? "👤" : "🏥"}</span>${v}</button>`,
    )
    .join(
      "",
    )}</div><p class="hint">You will be directed to the ${L[D.ar]} ${D.ar === "staff" ? "Dashboard" : "Booking form"}.</p><div class="divider"></div>${u ? fi("Full Name", "name", "text", "Last Name, First Name M.I.") + fi(D.ar === "student" ? "Student ID" : D.ar === "faculty" ? "Employee ID" : "Staff ID", "id", "text", "e.g. 2024-10234") + fi("Email Address", "email", "email", "name@nu-fairview.edu.ph") + fi("Username", "username", "text", "Choose a unique username") + `<div class="grid2">${fi("Password", "password", "password", "Min. 6 characters")}${fi("Confirm Password", "confirm", "password", "Re-enter password")}</div><label class="foot"><input name="agree" type="checkbox"> I agree to the <b style="color:var(--n)">Terms and Conditions</b> and Privacy Policy.</label>` : fi("Username or Email", "id", "text", "Enter your username or email") + fi("Password", "password", "password", "Enter your password")}<p id="err" class="note hide"></p><button class="primary">${u ? "Create Account →" : "Sign In →"}</button><p class="foot">${u ? "Already have an account?" : "Don't have an account?"} <button type="button" class="link" onclick="D.screen=D.screen==='login'?'signup':'login';render()">${u ? "Sign In" : "Sign Up"}</button></p></form></section></div></main><footer>SynClinic · University Health Office · NU Fairview · © 2024</footer></div>`;
}

function header() {
  let r =
    D.role === "student"
      ? "🎓 Student"
      : D.role === "faculty"
        ? "👤 Faculty/Employee"
        : "🏥 Clinic Staff";

  return `
    <header class="top">
      <div class="topin">

        <div class="toprow">
          <div class="brandrow">
            <div class="logo">
              <i class="cross"></i>
            </div>

            <div>
              <div class="name">SynClinic</div>
              <div class="sub">
                University Health Office · NU Fairview
              </div>
            </div>
          </div>

          <div class="topactions">
            <span class="pill">${r}</span>

            <button
              class="signout"
              onclick="D.role='';delete sessionStorage.synRole;render()"
            >
              ↩ Sign Out
            </button>
          </div>
        </div>

        <nav class="nav">

          <!-- Home -->
          <button
            class="${D.view === "home" ? "on" : ""}"
            onclick="D.view='home';render()"
          >
            🏠 Home
          </button>

          <!-- Book Appointment -->
          ${
            D.role !== "staff"
              ? `
                <button
                  onclick="D.view='booking';render()"
                >
                  📝 Book Appointment
                </button>
              `
              : ""
          }

          <!-- Staff Dashboard -->
          ${
            D.role === "staff"
              ? `
                <button
                  class="${D.view === "dash" ? "on" : ""}"
                  onclick="D.view='dash';render()"
                >
                  📋 Staff Dashboard
                </button>
              `
              : ""
          }

        </nav>

      </div>
    </header>

    <div class="gold"></div>
  `;
}

function home() {
  let isStudent = D.role === "student";
  let roleLabel = isStudent ? "Student" : "Faculty / Employee";
  let roleIcon = isStudent ? "🎓" : "👤";

  return `<main class="content"><div class="booking">
    <h1 class="title">SynClinic Homepage</h1>
    <p class="desc">Welcome to the University Health Office · National University Fairview</p>
    <section class="panel">
      <div class="panelhead">
        <p>${roleIcon} You are signed in as <b>${roleLabel}</b></p>
      </div>
      <div class="gold"></div>
      <div class="form">
        <h2>Appointment Request</h2>
        <p class="desc">Schedule a visit with the University Health Office.</p>
        <button class="primary" onclick="D.view='booking';render()">📝 Book Appointment</button>
      </div>
    </section>
  </div></main>`;
}

function booking() {
  let f = D.role === "faculty";

  return `<main class="content"><div class="booking"><h1 class="title">${f ? "Faculty / Employee Appointment" : "Student Appointment"}</h1><p class="desc">Welcome to the University Health Office · National University Fairview</p><section class="panel"><div class="panelhead"><p>Booking as <b>${f ? "👤 Faculty / Employee" : "🎓 Student"}</b></p></div><div class="gold"></div><form class="form" id="book">${f ? `<div class="grid2">${fi("Employee Name", "name", "text", "Last Name, First Name M.I.")}${se("Office / Department", "id", E, "Select department")}</div>${fi("Purpose of Visit", "purpose", "text", "Briefly describe your reason for visiting...")}` : `<div class="grid2">${fi("Student ID", "id", "text", "e.g. 2024-10234")}${fi("Full Name", "name", "text", "Last Name, First Name M.I.")}<div style="grid-column:1/-1">${se("Program", "program", P, "Select your program")}</div>${se("Year Level", "year", ["1st Year", "2nd Year", "3rd Year", "4th Year", "SHS Grade 11", "SHS Grade 12"], "Select year level")}<div class="field"><label>Student Status <b class="req">*</b></label><div class="radios"><label><input type="radio" name="new" value="no" checked> ↩ Continuing</label><label><input type="radio" name="new" value="yes" onchange="$('#advice').classList.remove('hide')"> 🆕 New</label></div></div></div><div id="advice" class="note hide"><b>New Student Advisory</b><br>New students without an active NUIS account will be recorded manually by clinic staff and synced once activated.</div>${fi("Purpose of Visit", "purpose", "text", "Briefly describe your reason for visiting...")}`}<div class="divider"></div><p class="sched">Appointment Schedule</p><div class="grid3">${fi("Select Date", "date", "date")}${se("Select Time", "time", T, "Choose slot")}${se("Select Service", "service", S, "Choose service")}</div><div class="summary hide" id="summary"></div><button class="primary">Book Appointment</button><p class="foot">By booking, you agree to attend your scheduled appointment on time. Walk-ins remain subject to availability.</p></form></section></div></main>`;
}

function badge(x) {
  return `<span class="badge ${x}">${x}</span>`;
}

function appTable() {
  let q = AP.filter(
    (a) =>
      (D.type === "All" || a[4] === D.type) &&
      (D.status === "All" || a[8] === D.status) &&
      (!D.search ||
        a[1].toLowerCase().includes(D.search.toLowerCase()) ||
        a[2].toLowerCase().includes(D.search.toLowerCase())),
  );

  return `<div class="filters"><input class="input" value="${D.search}" oninput="D.search=this.value;render()" placeholder="Search by name or ID / dept..."><select class="select" onchange="D.type=this.value;render()">${["All", "Student", "Employee"].map((x) => `<option ${D.type === x ? "selected" : ""}>${x === "All" ? "All Types" : x}</option>`).join("")}</select><select class="select" onchange="D.status=this.value;render()">${["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((x) => `<option ${D.status === x ? "selected" : ""}>${x === "All" ? "All Statuses" : x}</option>`).join("")}</select></div><div class="scroll"><table><thead><tr>${["Name", "ID / Dept", "Program", "Date", "Time", "Service", "Status", "Actions"].map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${q.length ? q.map((a) => `<tr><td><div class="person">${a[1]}</div><div class="muted">${a[0]}</div></td><td>${a[2]}</td><td>${a[3]}</td><td>${a[5]}</td><td>${a[6]}</td><td>${a[7]}</td><td>${badge(a[8])}</td><td>${a[8] === "Pending" ? `<button class="act" onclick="setStatus('${a[0]}','Confirmed')">Confirm</button>` : ""}${a[8] === "Confirmed" ? `<button class="act complete" onclick="setStatus('${a[0]}','Completed')">Complete</button>` : ""}${["Pending", "Confirmed"].includes(a[8]) ? `<button class="act cancel" onclick="D.target='${a[0]}';D.modal='cancel';render()">Cancel</button>` : ""}</td></tr>`).join("") : `<tr><td colspan="8" style="text-align:center;padding:50px;color:#9ca3af">No appointments match the current filters.</td></tr>`}</tbody></table></div><div class="panel-foot"><span>Showing ${q.length} of ${AP.length} appointments</span><span>Last synced: ${new Date().toLocaleTimeString()}</span></div>`;
}

function studentTable() {
  return `<div class="info">ℹ️ New students without active NUIS accounts are listed here. Use <b>"Add to NUIS"</b> to manually sync their records once activated.</div><div class="scroll"><table><thead><tr>${["Temp. ID", "Full Name", "Program", "Year Level", "Sync Status", "Action"].map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${NS.map((s) => `<tr><td>${s[0]}</td><td class="person">${s[1]}</td><td>${s[2]}</td><td>${s[3]}</td><td>${badge(s[4])}</td><td>${s[4] === "Pending" ? `<button class="act" onclick="D.target='${s[0]}';D.modal='sync';render()">Add to NUIS</button>` : '<i class="muted">Synced ✓</i>'}</td></tr>`).join("")}</tbody></table></div><div class="panel-foot"><span>${NS.filter((s) => s[4] === "Pending").length} pending sync · ${NS.filter((s) => s[4] === "Synced").length} synced</span></div>`;
}

function dash() {
  let x = AP.filter((a) => a[5] === "2024-08-09"),
    n = [
      x.length,
      x.filter((a) => a[8] === "Pending").length,
      x.filter((a) => a[8] === "Completed").length,
      x.filter((a) => a[8] === "Cancelled").length,
      NS.length,
    ],
    z = [
      ["📅", "Today's Appointments", "#ebf0f8", "#003366"],
      ["⏳", "Pending", "#fef9ec", "#92400e"],
      ["✅", "Completed", "#ecfdf5", "#065f46"],
      ["🚫", "Cancelled", "#fef2f2", "#991b1b"],
      ["🆕", "New Students", "#f5f3ff", "#5b21b6"],
    ];

  return `<main class="content"><div class="dash-head"><div><h1 class="title">Clinic Staff Dashboard</h1><p class="desc">● Real-time appointment monitoring · ${new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div><button class="primary quick" onclick="D.modal='quick';render()">＋ Quick Add Appointment</button></div><div class="stats">${z.map((a, i) => `<div class="stat" style="background:${a[2]};color:${a[3]}"><i>${a[0]}</i><div><b>${n[i]}</b><small>${a[1]}</small></div></div>`).join("")}</div><div class="actions">${["⚙️ Manage Services", "🔒 Set Booking Limits", "📊 Generate Reports", "🔄 Sync NUIS Data", "🆕 Manage New Students"].map((x, i) => `<button class="action" ${i === 4 ? `onclick="D.tab='students';render()"` : ""}>${x}</button>`).join("")}</div><section class="panel"><div class="tabs"><button class="${D.tab === "apps" ? "on" : ""}" onclick="D.tab='apps';render()">All Appointments <span class="count">${AP.length}</span></button><button class="${D.tab === "students" ? "on" : ""}" onclick="D.tab='students';render()">New Students <span class="count">${NS.filter((s) => s[4] === "Pending").length}</span></button></div>${D.tab === "apps" ? appTable() : studentTable()}</section></main>`;
}

function modal() {
  if (!D.modal) return "";

  if (D.modal === "quick")
    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Quick Add Appointment</h2><p>Manually schedule an appointment for a patient.</p></div><form class="modal-body" id="quick"><div class="grid2">${fi("Patient Name", "name", "text", "Full name")}${se("Type", "type", ["Student", "Employee"], "Select type")}${fi("Student ID / Department", "id", "text", "2024-XXXXX")}${se("Service", "service", S, "Select service")}${fi("Date", "date", "date")}${se("Time", "time", T, "Choose slot")}</div>${fi("Purpose of Visit", "purpose", "text", "Reason for visit...")}<div class="modal-actions" style="padding:4px 0 0"><button type="button" class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary">Add Appointment</button></div></form></section></div>`;

  if (D.modal === "confirm") {
    let f = new FormData($("#book")),
      r = [
        ["Name", f.get("name")],
        ["Student ID / Department", f.get("id")],
        ["Date", f.get("date")],
        ["Time", f.get("time")],
        ["Service", f.get("service")],
        ["Purpose", f.get("purpose")],
      ];

    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Confirm Appointment</h2><p>Please review your details before submitting.</p></div><div class="modal-body">${r.map((x) => `<div class="detail"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}</div><div class="modal-actions"><button class="secondary" onclick="D.modal='';render()">Go Back</button><button class="primary" onclick="D.modal='booked';D.ref=(D.role==='student'?'STU':'EMP')+'-'+Date.now().toString().slice(-7);render()">Confirm Booking</button></div></section></div>`;
  }

  if (D.modal === "booked" || D.modal === "synced") {
    let b = D.modal === "booked";

    return `<div class="backdrop"><section class="modal"><div class="success"><i>✓</i><h2>${b ? "Appointment Booked!" : "Synced Successfully"}</h2><p>${b ? "Your appointment is pending confirmation from the clinic staff. Please arrive 10 minutes before your scheduled time." : "The student record has been added to the NUIS database. Status updated to Synced."}</p>${b ? `<div class="ref"><small>Reference Number</small><b>${D.ref}</b></div>` : ""}<button class="primary" onclick="D.modal='';render()">Done</button></div></section></div>`;
  }

  if (D.modal === "cancel") {
    let a = AP.find((x) => x[0] === D.target);

    return `<div class="backdrop"><section class="modal"><div class="success"><i style="background:#fee2e2;color:#dc2626">×</i><h2>Cancel Appointment</h2><p>Cancel the appointment for <b>${a[1]}</b>? This cannot be undone.</p><div class="modal-actions" style="padding:8px 0 0"><button class="secondary" onclick="D.modal='';render()">Keep It</button><button class="primary" style="background:#dc2626;box-shadow:none" onclick="setStatus(D.target,'Cancelled');D.modal=''">Yes, Cancel</button></div></div></section></div>`;
  }

  let s = NS.find((x) => x[0] === D.target);

  return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Sync to NUIS</h2><p>Confirm manual entry into the NUIS student database.</p></div><div class="modal-body">${[
    ["Temporary ID", s[0]],
    ["Full Name", s[1]],
    ["Program", s[2]],
    ["Year Level", s[3]],
  ]
    .map((x) => `<div class="detail"><span>${x[0]}</span><b>${x[1]}</b></div>`)
    .join(
      "",
    )}<div class="summary">This student will be added to the NUIS database. A permanent student ID will be assigned upon activation.</div></div><div class="modal-actions"><button class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary" onclick="NS.find(x=>x[0]===D.target)[4]='Synced';D.modal='synced';render()">Add to NUIS</button></div></section></div>`;
}

function render() {
  A.innerHTML = D.role
    ? header() +
      (D.view === "dash" ? dash() : D.view === "home" ? home() : booking()) +
      modal()
    : auth();

  let a = $("#auth"),
    b = $("#book"),
    q = $("#quick");

  if (a)
    a.onsubmit = (e) => {
      e.preventDefault();

      let f = new FormData(a),
        err =
          !f.get(D.screen === "signup" ? "name" : "id") ||
          !f.get("password")
            ? "Please fill in all fields."
            : f.get("password").length < 6
              ? "Password must be at least 6 characters."
              : D.screen === "signup" &&
                  f.get("password") !== f.get("confirm")
                ? "Passwords do not match."
                : D.screen === "signup" && !f.get("agree")
                  ? "Please agree to the terms and conditions."
                  : "";

      if (err) {
        $("#err").textContent = "⚠ " + err;
        $("#err").classList.remove("hide");
      } else {
        D.role = D.ar;
        D.bt = D.role;
        sessionStorage.synRole = D.role;
        D.view = D.role === "staff" ? "dash" : "home";
        render();
      }
    };

  if (b) {
    b.oninput = () => {
      let f = new FormData(b);

      if (f.get("date") || f.get("time") || f.get("service")) {
        $("#summary").innerHTML =
          `<h4>Booking Summary</h4><div class="summary-grid"><div><span>Name: </span><b>${f.get("name") || ""}</b></div><div><span>ID: </span><b>${f.get("id") || ""}</b></div><div><span>Date: </span><b>${f.get("date") || ""}</b></div><div><span>Time: </span><b>${f.get("time") || ""}</b></div><div><span>Service: </span><b>${f.get("service") || ""}</b></div></div><p style="color:#a16207">● Status: Pending Confirmation</p>`;

        $("#summary").classList.remove("hide");
      }
    };

    b.onsubmit = (e) => {
      e.preventDefault();
      D.modal = "confirm";
      render();
    };
  }

  if (q)
    q.onsubmit = (e) => {
      e.preventDefault();

      let f = new FormData(q);

      AP.unshift([
        `${f.get("type") === "Student" ? "STU" : "EMP"}-${Date.now().toString().slice(-6)}`,
        f.get("name"),
        f.get("id"),
        "-",
        f.get("type"),
        f.get("date"),
        f.get("time"),
        f.get("service"),
        "Pending",
      ]);

      D.modal = "";
      render();
    };
}

function setStatus(id, x) {
  AP.find((a) => a[0] === id)[8] = x;
  render();
}

render();

(() => {
  "use strict";

  const today = new Date().toISOString().slice(0, 10);

  function preventPastDates() {
    document.querySelectorAll('input[type="date"]').forEach((dateInput) => {
      dateInput.min = today;
    });
  }

  preventPastDates();

  new MutationObserver(preventPastDates).observe(document.body, {
    childList: true,
    subtree: true,
  });

  fi = (l, n, t = "text", p = "") => {
    const isPassword = t === "password";

    return `
    <div class="field">
      <label>${l} <b class="req">*</b></label>

      <div class="${isPassword ? "password-wrap" : ""}">
        <input
          class="input"
          name="${n}"
          type="${t}"
          placeholder="${p}"
          required
        >

        ${
          isPassword
            ? `
              <button
                type="button"
                class="password-toggle"
                aria-label="Show password"
              >👁</button>
            `
            : ""
        }
      </div>
    </div>
  `;
  };

  se = (l, n, x, p) =>
    `<div class="field">
      <label>${l} <b class="req">*</b></label>
      <select class="select" name="${n}" required>
        ${op(x, p)}
      </select>
    </div>`;

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest(".password-toggle");

    if (!toggle) return;

    const input = toggle.parentElement.querySelector("input");
    const showPassword = input.type === "password";

    input.type = showPassword ? "text" : "password";
    toggle.textContent = showPassword ? "🙈" : "👁";
    toggle.setAttribute(
      "aria-label",
      showPassword ? "Hide password" : "Show password",
    );
  });

  new MutationObserver(addPasswordEyes).observe(document.querySelector("#app"), {
    childList: true,
    subtree: true,
  });

  addPasswordEyes();

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest(".password-toggle");

    if (!toggle) {
      return;
    }

    const input = toggle.parentElement.querySelector("input");
    const hidden = input.type === "password";

    input.type = hidden ? "text" : "password";
    toggle.textContent = hidden ? "🙈" : "👁";
    toggle.setAttribute(
      "aria-label",
      hidden ? "Hide password" : "Show password",
    );
  });
})();