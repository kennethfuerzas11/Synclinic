import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth as firebaseAuth, db } from "./Firebase/Database/firebase-config.js";

const A = document.querySelector("#app"),
  $ = (s) => document.querySelector(s),
  D = {
    role: "",
    user: null,
    profile: null,
    screen: "login",
    ar: "student",
    view: "booking",
    bt: "student",
    tab: "apps",
    modal: "",
    search: "",
    type: "All",
    status: "All",
    appointmentDateFilter: "",
    notice: "",
    dataError: "",
    loading: false,
    busy: false,
    pendingBooking: null,
    profileEditing: false,
    profileSaveStatus: "",
    restoreScrollTop: null,
    ignoreNextSignOutEvent: false,
    services: [],
    slotCapacity: 5,
    serviceDraft: [],
    serviceError: "",
    limitError: "",
  };

const T = [
<<<<<<< HEAD
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  ],
=======
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
>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc
  S = [
    "General Consultation", "Dental Check-up", "Vaccination / Immunization",
    "Medical Certificate", "Blood Pressure Monitoring", "First Aid / Wound Care",
    "Mental Health Consultation", "Laboratory Request", "Annual Physical Exam",
  ],
  P = [
    "SHS STEM_CT - Computing Technologies", "BS Architecture",
    "BS Information Technology", "BS Psychology", "BS Tourism Management",
    "BSBA Financial Management", "BSBA Marketing Management", "BS Civil Engineering", "BS Computer Engineering",
    "BS Hospitality Management", "BS Accountancy", "BA Communication", "SHS AHSS_EASS - Education, Arts and Social Sciences",
    "SHS BUEN_MA - Management and Accountancy", "SHS STEM_SAH - Science and Allied Health",
    "SHS STEM_EA - Engineering and Architecture",
  ],
  E = [
    "Office of the Registrar", "Human Resources", "Finance Department",
    "IT Department", "Library Services", "Guidance Office",
    "Student Development and Affairs Office", "School of Engineering and Technology",
    "School of Architecture",
    "School of Business and Accountancy",
    "School of Tourism and Hospitality Management",
    "Senior High School",
    "School of Arts and Sciences",
    "Security Office",
    "Discipline Office",
    "Facilities and Management Office",
  ];

<<<<<<< HEAD
let AP = [];
let NS = [];
let stopAppointments = null;
let stopNewStudents = null;
let stopClinicSettings = null;
let stopSlotReservation = null;
let activeSlotReservationId = "";
let profileSaveTimer = null;
let profileSaveQueue = Promise.resolve();
let stateScrollFrame = 0;

function sessionStateKey(uid) {
  return `synclinic:view:${uid}`;
}

function persistSessionState() {
  if (!D.user || !D.role) return;
  const state = {
    role: D.role,
    view: D.view,
    tab: D.tab,
    search: D.search,
    type: D.type,
    status: D.status,
    appointmentDateFilter: D.appointmentDateFilter,
    scrollY: D.restoreScrollTop ?? window.scrollY,
  };
  sessionStorage.setItem(sessionStateKey(D.user.uid), JSON.stringify(state));
}

window.addEventListener("scroll", () => {
  if (!D.user || !D.role || stateScrollFrame) return;
  stateScrollFrame = window.requestAnimationFrame(() => {
    stateScrollFrame = 0;
    persistSessionState();
  });
}, { passive: true });
window.addEventListener("pagehide", persistSessionState);

const op = (x, p) => `<option value="">${escapeHTML(p)}</option>` + x.map((y) => `<option value="${escapeHTML(y)}">${escapeHTML(y)}</option>`).join(""),
  escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
    ),
  fi = (l, n, t = "text", p = "") => {
    if (t === "password") {
      return `<div class="field"><label>${l} <b class="req">*</b></label><div style="position: relative;"><input class="input" name="${n}" type="password" placeholder="${p}" style="padding-right: 40px;" required><button type="button" onclick="const i=this.previousElementSibling;i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'👁️':'🙈';" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 14px; padding: 0;">👁️</button></div></div>`;
    }
    return `<div class="field"><label>${l} <b class="req">*</b></label><input class="input" name="${n}" type="${t}" placeholder="${p}" required></div>`;
  },
  se = (l, n, x, p) => `<div class="field"><label>${l} <b class="req">*</b></label><select class="select" name="${n}" required>${op(x, p)}</select></div>`;

function auth() {
  let u = D.screen === "signup",
    L = { student: "Student", faculty: "Faculty / Employee", staff: "Clinic Staff" };
  return `<div class="auth"><main><div class="wrap"><div class="brand"><div class="logo"><i class="cross"></i></div><b>SynClinic</b><small>University Health Office · National University Fairview</small></div><div class="gold"></div><section class="panel"><div class="head"><h1>${u ? "Create an account" : "Welcome back"}</h1><p>${u ? "Register for a SynClinic account to get started." : "Sign in to your SynClinic account to continue."}</p></div><form class="form" id="auth" novalidate><span class="caption">${u ? "Registering as" : "I am a"}</span><div class="roles">${Object.entries(L).map(([k, v]) => `<button type="button" class="${D.ar === k ? "on" : ""}" onclick="D.ar='${k}';render()"><span>${k === "student" ? "🎓" : k === "faculty" ? "👤" : "🏥"}</span>${v}</button>`).join("")}</div><p class="hint">You will be directed to the ${L[D.ar]} ${D.ar === "staff" ? "Dashboard" : "Booking form"}.</p><div class="divider"></div>${u ? fi("Full Name", "name", "text", "Last Name, First Name M.I.") + fi(D.ar === "student" ? "Student ID" : D.ar === "faculty" ? "Employee ID" : "Staff ID", "id", "text", "e.g. 2024-10234") + fi("Email Address", "email", "email", "name@nu-fairview.edu.ph") + fi("Username", "username", "text", "Choose a unique username") + `<div class="grid2">${fi("Password", "password", "password", "Min. 8 characters")}${fi("Confirm Password", "confirm", "password", "Re-enter password")}</div><label class="foot"><input name="agree" type="checkbox"> I agree to the <b style="color:var(--n)">Terms and Conditions</b> and Privacy Policy.</label>` : fi("Username", "username", "text", "Enter your username") + fi("Password", "password", "password", "Enter your password")}<p id="err" class="note hide"></p><button class="primary">${u ? "Create Account →" : "Sign In →"}</button><p class="foot">${u ? "Already have an account?" : "Don't have an account?"} <button type="button" class="link" onclick="D.screen=D.screen==='login'?'signup':'login';render()">${u ? "Sign In" : "Sign Up"}</button></p></form></section></div></main><footer>SynClinic · University Health Office · NU Fairview · © 2024</footer></div>`;
}

function header() {
  let r = D.role === "student" ? "🎓 Student" : D.role === "faculty" ? "👤 Faculty/Employee" : "🏥 Clinic Staff";
  const navButtons = [];

  if (D.role !== "staff") {
    navButtons.push(`<button class="${D.view === "booking" ? "on" : ""}" onclick="D.view='booking';render()">📝 Book Appointment</button>`);
    navButtons.push(`<button class="${D.view === "history" ? "on" : ""}" onclick="D.view='history';render()">📖 Booking History</button>`);
  }

  navButtons.push(`<button class="${D.view === "profile" ? "on" : ""}" onclick="D.view='profile';render()">📋 Profile Dashboard</button>`);

  if (D.role === "staff") {
    navButtons.push(`<button class="${D.view === "dash" ? "on" : ""}" onclick="D.view='dash';render()">📋 Staff Dashboard</button>`);
  }

  return `<header class="top"><div class="topin"><div class="toprow"><div class="brandrow"><div class="logo"><i class="cross"></i></div><div><div class="name">SynClinic</div><div class="sub">University Health Office · NU Fairview</div></div></div><div class="topactions"><span class="pill">${r}</span><button class="signout" onclick="D.role='';delete sessionStorage.synRole;render()">↩ Sign Out</button></div></div><nav class="nav">${navButtons.join("")}</nav></div></header><div class="gold"></div>`;
=======
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
  `<div class="field">
    <label>${l} <b class="req">*</b></label>
    ${
      t === "password"
        ? `<div class="password-wrap">
            <input
              class="input"
              name="${n}"
              type="password"
              placeholder="${p}"
              minlength="6"
              required
            >
            <button
              type="button"
              class="password-toggle"
              aria-label="Show password"
              onclick="togglePassword(this)"
            >👁</button>
          </div>`
        : `<input
            class="input"
            name="${n}"
            type="${t}"
            placeholder="${p}"
            ${t === "email" ? 'autocomplete="email"' : ""}
            required
          >`
    }
  </div>`,
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
            class="${D.view === "booking" ? "on" : ""}"
            onclick="D.view='booking';render()"
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
            D.role !== "student"
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
>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc
}

function booking() {
  let f = D.bt === "faculty";
<<<<<<< HEAD
  return `<main class="content"><div class="booking"><h1 class="title">Appointment Booking</h1><p class="desc">University Health Office · National University Fairview</p><section class="panel"><div class="panelhead"><p>I am booking as a</p><div class="switch"><button class="${!f ? "on" : ""}" onclick="D.bt='student';render()">🎓 Student</button><button class="${f ? "on" : ""}" onclick="D.bt='faculty';render()">👤 Faculty / Employee</button></div></div><div class="gold"></div><form class="form" id="book">${f ? `<div class="grid2">${fi("Employee Name", "name", "text", "Last Name, First Name M.I.")}${fi("Faculty / Staff ID", "id", "text", "Enter your faculty/staff ID")}${se("Office / Department", "department", E, "Select department")}<div class="field" style="grid-column:1/-1"><label for="faculty-program">Program <span class="muted">(Optional)</span></label><input class="input" id="faculty-program" name="program" type="text" placeholder="Enter your program"></div></div>${fi("Purpose of Visit", "purpose", "text", "Briefly describe your reason for visiting...")}` : `<div class="grid2">${fi("Student ID", "id", "text", "e.g. 2024-10234")}${fi("Full Name", "name", "text", "Last Name, First Name M.I.")}<div style="grid-column:1/-1">${se("Program", "program", P, "Select your program")}</div>${se("Year Level", "year", ["1st Year", "2nd Year", "3rd Year", "4th Year", "SHS Grade 11", "SHS Grade 12"], "Select year level")}<div class="field"><label>Student Status <b class="req">*</b></label><div class="radios"><label><input type="radio" name="new" value="no" checked> ↩ Continuing</label><label><input type="radio" name="new" value="yes" onchange="$('#advice').classList.remove('hide')"> 🆕 New</label></div></div></div><div id="advice" class="note hide"><b>New Student Advisory</b><br>New students without an active NUIS account will be recorded manually by clinic staff and synced once activated.</div>${fi("Purpose of Visit", "purpose", "text", "Briefly describe your reason for visiting...")}`}<div class="divider"></div><p class="sched">Appointment Schedule</p><div class="grid3">${fi("Select Date", "date", "date")}${se("Select Time", "time", T, "Choose slot")}${se("Select Service", "service", D.services, "Choose service")}</div><p class="slot-availability" id="slotAvailability"></p><div class="summary hide" id="summary"></div><button class="primary">Book Appointment</button><p class="foot">By booking, you agree to attend your scheduled appointment on time. Walk-ins remain subject to availability.</p></form></section></div></main>`;
``}
=======

  return `<main class="content"><div class="booking"><h1 class="title">SynClinic Homepage</h1><p class="desc">Welcome to the University Health Office · National University Fairview</p><section class="panel"><div class="panelhead"><p>I am booking as a</p><div class="switch"><button class="${!f ? "on" : ""}" onclick="D.bt='student';render()">🎓 Student</button><button class="${f ? "on" : ""}" onclick="D.bt='faculty';render()">👤 Faculty / Employee</button></div></div><div class="gold"></div><form class="form" id="book">${f ? `<div class="grid2">${fi("Employee Name", "name", "text", "Last Name, First Name M.I.")}${se("Office / Department", "id", E, "Select department")}</div>${fi("Purpose of Visit", "purpose", "text", "Briefly describe your reason for visiting...")}` : `<div class="grid2">${fi("Student ID", "id", "text", "e.g. 2024-10234")}${fi("Full Name", "name", "text", "Last Name, First Name M.I.")}<div style="grid-column:1/-1">${se("Program", "program", P, "Select your program")}</div>${se("Year Level", "year", ["1st Year", "2nd Year", "3rd Year", "4th Year", "SHS Grade 11", "SHS Grade 12"], "Select year level")}<div class="field"><label>Student Status <b class="req">*</b></label><div class="radios"><label><input type="radio" name="new" value="no" checked> ↩ Continuing</label><label><input type="radio" name="new" value="yes" onchange="$('#advice').classList.remove('hide')"> 🆕 New</label></div></div></div><div id="advice" class="note hide"><b>New Student Advisory</b><br>New students without an active NUIS account will be recorded manually by clinic staff and synced once activated.</div>${fi("Purpose of Visit", "purpose", "text", "Briefly describe your reason for visiting...")}`}<div class="divider"></div><p class="sched">Appointment Schedule</p><div class="grid3">${fi("Select Date", "date", "date")}${se("Select Time", "time", T, "Choose slot")}${se("Select Service", "service", S, "Choose service")}</div><div class="summary hide" id="summary"></div><button class="primary">Book Appointment</button><p class="foot">By booking, you agree to attend your scheduled appointment on time. Walk-ins remain subject to availability.</p></form></section></div></main>`;
}
>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc

function badge(x) {
  return `<span class="badge ${x}">${x}</span>`;
}

function appTable() {
<<<<<<< HEAD
  let q = AP.filter((a) => (D.type === "All" || a[4] === D.type) && (D.status === "All" || a[8] === D.status) && (!D.search || a[1].toLowerCase().includes(D.search.toLowerCase()) || a[2].toLowerCase().includes(D.search.toLowerCase())));
  return `<div class="filters"><input class="input" value="${D.search}" oninput="D.search=this.value;render()" placeholder="Search by name or ID / dept..."><select class="select" onchange="D.type=this.value;render()">${["All", "Student", "Employee"].map((x) => `<option ${D.type === x ? "selected" : ""}>${x === "All" ? "All Types" : x}</option>`)}</select><select class="select" onchange="D.status=this.value;render()">${["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((x) => `<option ${D.status === x ? "selected" : ""}>${x === "All" ? "All Statuses" : x}</option>`)}</select></div><div class="scroll"><table><thead><tr>${["Name", "ID / Dept", "Program", "Date", "Time", "Service", "Status", "Actions"].map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${q.length ? q.map((a) => `<tr><td><div class="person">${a[1]}</div><div class="muted">${a[0]}</div></td><td>${a[2]}</td><td>${a[3]}</td><td>${a[5]}</td><td>${a[6]}</td><td>${a[7]}</td><td>${badge(a[8])}</td><td>${a[8] === "Pending" ? `<button class="act" onclick="setStatus('${a[0]}','Confirmed')">Confirm</button>` : ""}${a[8] === "Confirmed" ? `<button class="act complete" onclick="setStatus('${a[0]}','Completed')">Complete</button>` : ""}${["Pending", "Confirmed"].includes(a[8]) ? `<button class="act cancel" onclick="D.target='${a[0]}';D.modal='cancel';render()">Cancel</button>` : ""}</td></tr>`).join("") : `<tr><td colspan="8" style="text-align:center;padding:50px;color:#9ca3af">No appointments match the current filters.</td></tr>`}</tbody></table></div><div class="panel-foot"><span>Showing ${q.length} of ${AP.length} appointments</span><span>Last synced: ${new Date().toLocaleTimeString()}</span></div>`;
=======
  let q = AP.filter(
    (a) =>
      (D.type === "All" || a[4] === D.type) &&
      (D.status === "All" || a[8] === D.status) &&
      (!D.search ||
        a[1].toLowerCase().includes(D.search.toLowerCase()) ||
        a[2].toLowerCase().includes(D.search.toLowerCase())),
  );

  return `<div class="filters"><input class="input" value="${D.search}" oninput="D.search=this.value;render()" placeholder="Search by name or ID / dept..."><select class="select" onchange="D.type=this.value;render()">${["All", "Student", "Employee"].map((x) => `<option ${D.type === x ? "selected" : ""}>${x === "All" ? "All Types" : x}</option>`).join("")}</select><select class="select" onchange="D.status=this.value;render()">${["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((x) => `<option ${D.status === x ? "selected" : ""}>${x === "All" ? "All Statuses" : x}</option>`).join("")}</select></div><div class="scroll"><table><thead><tr>${["Name", "ID / Dept", "Program", "Date", "Time", "Service", "Status", "Actions"].map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${q.length ? q.map((a) => `<tr><td><div class="person">${a[1]}</div><div class="muted">${a[0]}</div></td><td>${a[2]}</td><td>${a[3]}</td><td>${a[5]}</td><td>${a[6]}</td><td>${a[7]}</td><td>${badge(a[8])}</td><td>${a[8] === "Pending" ? `<button class="act" onclick="setStatus('${a[0]}','Confirmed')">Confirm</button>` : ""}${a[8] === "Confirmed" ? `<button class="act complete" onclick="setStatus('${a[0]}','Completed')">Complete</button>` : ""}${["Pending", "Confirmed"].includes(a[8]) ? `<button class="act cancel" onclick="D.target='${a[0]}';D.modal='cancel';render()">Cancel</button>` : ""}</td></tr>`).join("") : `<tr><td colspan="8" style="text-align:center;padding:50px;color:#9ca3af">No appointments match the current filters.</td></tr>`}</tbody></table></div><div class="panel-foot"><span>Showing ${q.length} of ${AP.length} appointments</span><span>Last synced: ${new Date().toLocaleTimeString()}</span></div>`;
>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc
}

function studentTable() {
  return `<div class="info">ℹ️ New students without active NUIS accounts are listed here. Use <b>"Add to NUIS"</b> to manually sync their records once activated.</div><div class="scroll"><table><thead><tr>${["Temp. ID", "Full Name", "Program", "Year Level", "Sync Status", "Action"].map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${NS.map((s) => `<tr><td>${s[0]}</td><td class="person">${s[1]}</td><td>${s[2]}</td><td>${s[3]}</td><td>${badge(s[4])}</td><td>${s[4] === "Pending" ? `<button class="act" onclick="D.target='${s[0]}';D.modal='sync';render()">Add to NUIS</button>` : '<i class="muted">Synced ✓</i>'}</td></tr>`).join("")}</tbody></table></div><div class="panel-foot"><span>${NS.filter((s) => s[4] === "Pending").length} pending sync · ${NS.filter((s) => s[4] === "Synced").length} synced</span></div>`;
}

<<<<<<< HEAD
function legacyDash() {
  let x = AP.filter((a) => a[5] === "2024-08-09"),
    n = [x.length, x.filter((a) => a[8] === "Pending").length, x.filter((a) => a[8] === "Completed").length, x.filter((a) => a[8] === "Cancelled").length, NS.length],
    z = [["📅", "Today's Appointments", "#ebf0f8", "#003366"], ["⏳", "Pending", "#fef9ec", "#92400e"], ["✅", "Completed", "#ecfdf5", "#065f46"], ["🚫", "Cancelled", "#fef2f2", "#991b1b"], ["🆕", "New Students", "#f5f3ff", "#5b21b6"]];
=======
function dash() {
  let x = AP.filter((a) => a[5] === "2024-08-09"),
    n = [
      x.length,
      x.filter((a) => a[8] === "Pending").length,
      x.filter((a) => a[8] === "Confirmed").length,
      x.filter((a) => a[8] === "Completed").length,
      x.filter((a) => a[8] === "Cancelled").length,
      NS.length,
    ],
    z = [
      ["📅", "Today's Appointments", "#ebf0f8", "#003366"],
      ["⏳", "Pending", "#fef9ec", "#92400e"],
      ["✓", "Confirmed", "#eff6ff", "#1d4ed8"],
      ["✅", "Completed", "#ecfdf5", "#065f46"],
      ["🚫", "Cancelled", "#fef2f2", "#991b1b"],
      ["🆕", "New Students", "#f5f3ff", "#5b21b6"],
    ];

>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc
  return `<main class="content"><div class="dash-head"><div><h1 class="title">Clinic Staff Dashboard</h1><p class="desc">● Real-time appointment monitoring · ${new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div><button class="primary quick" onclick="D.modal='quick';render()">＋ Quick Add Appointment</button></div><div class="stats">${z.map((a, i) => `<div class="stat" style="background:${a[2]};color:${a[3]}"><i>${a[0]}</i><div><b>${n[i]}</b><small>${a[1]}</small></div></div>`).join("")}</div><div class="actions">${["⚙️ Manage Services", "🔒 Set Booking Limits", "📊 Generate Reports", "🔄 Sync NUIS Data", "🆕 Manage New Students"].map((x, i) => `<button class="action" ${i === 4 ? `onclick="D.tab='students';render()"` : ""}>${x}</button>`).join("")}</div><section class="panel"><div class="tabs"><button class="${D.tab === "apps" ? "on" : ""}" onclick="D.tab='apps';render()">All Appointments <span class="count">${AP.length}</span></button><button class="${D.tab === "students" ? "on" : ""}" onclick="D.tab='students';render()">New Students <span class="count">${NS.filter((s) => s[4] === "Pending").length}</span></button></div>${D.tab === "apps" ? appTable() : studentTable()}</section></main>`;
}

function modal() {
  if (!D.modal) return "";
<<<<<<< HEAD
  if (D.modal === "services") {
    return `<div class="backdrop"><section class="modal management-modal"><div class="modal-head"><button type="button" class="modal-back" onclick="D.modal='';render()">← Back</button><div><h2>Manage Services</h2><p>Update the services available in appointment forms.</p></div></div><form class="modal-body" id="servicesForm"><div class="service-list">${D.serviceDraft.map((service, index) => `<div class="service-row"><input class="input" name="service" value="${escapeHTML(service)}" aria-label="Service ${index + 1}" maxlength="100" required><button type="button" class="service-remove" data-remove-service="${index}">Remove</button></div>`).join("")}</div><div class="service-add-row"><input class="input" name="newService" maxlength="100" placeholder="Add a service"><button type="button" class="secondary" id="addService">Add</button></div><p class="form-error" id="serviceError" role="alert">${escapeHTML(D.serviceError)}</p><div class="modal-actions"><button type="button" class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary" type="submit">Save Services</button></div></form></section></div>`;
  }
  if (D.modal === "limits") {
    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Set Booking Limits</h2><p>Limit appointments accepted for each date and time slot.</p></div><form class="modal-body" id="limitsForm"><label class="field"><span class="profile-label">Maximum appointments per time slot</span><input class="input" name="slotCapacity" type="number" min="1" max="500" step="1" value="${D.slotCapacity}" required></label><p class="form-error" id="limitError" role="alert">${escapeHTML(D.limitError)}</p><div class="modal-actions"><button type="button" class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary" type="submit">Save Limit</button></div></form></section></div>`;
  }
  if (D.modal === "reports") {
    const start = D.reportStart || "";
    const end = D.reportEnd || "";
    const reportAppointments = AP.filter((appointment) =>
      (!start || appointment[5] >= start) && (!end || appointment[5] <= end),
    );
    return `<div class="backdrop"><section class="modal management-modal"><div class="modal-head"><h2>Generate Appointment Report</h2><p>Choose an optional date range and download records as CSV.</p></div><form class="modal-body" id="reportForm"><div class="grid2"><label class="field"><span class="profile-label">From</span><input class="input" type="date" name="start" value="${escapeHTML(start)}"></label><label class="field"><span class="profile-label">To</span><input class="input" type="date" name="end" value="${escapeHTML(end)}"></label></div><p class="report-count">${reportAppointments.length} appointment${reportAppointments.length === 1 ? "" : "s"} in report</p><p class="form-error" id="reportError" role="alert"></p><div class="modal-actions"><button type="button" class="secondary" onclick="D.modal='';render()">Close</button><button class="primary" type="button" onclick="downloadReport()">Download CSV</button></div></form></section></div>`;
  }
  if (D.modal === "quick")
    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Quick Add Appointment</h2><p>Manually schedule an appointment for a patient.</p></div><form class="modal-body" id="quick"><div class="grid2">${fi("Patient Name", "name", "text", "Full name")}${se("Type", "type", ["New Student", "Continuing Student", "Employee"], "Select type")}${fi("Student ID / Department", "id", "text", "2024-XXXXX")}${se("Service", "service", D.services, "Select service")}${fi("Date", "date", "date")}${se("Time", "time", T, "Choose slot")}</div>${fi("Purpose of Visit", "purpose", "text", "Reason for visit...")}<div class="modal-actions" style="padding:4px 0 0"><button type="button" class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary">Add Appointment</button></div></form></section></div>`;
=======

  if (D.modal === "quick")
    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Quick Add Appointment</h2><p>Manually schedule an appointment for a patient.</p></div><form class="modal-body" id="quick"><div class="grid2">${fi("Patient Name", "name", "text", "Full name")}${se("Type", "type", ["Student", "Employee"], "Select type")}${fi("Student ID / Department", "id", "text", "2024-XXXXX")}${se("Service", "service", S, "Select service")}${fi("Date", "date", "date")}${se("Time", "time", T, "Choose slot")}</div>${fi("Purpose of Visit", "purpose", "text", "Reason for visit...")}<div class="modal-actions" style="padding:4px 0 0"><button type="button" class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary">Add Appointment</button></div></form></section></div>`;

>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc
  if (D.modal === "confirm") {
    let f = D.pendingBooking || {},
      r = [
        ["Name", f.name],
        ["Student ID / Department", f.id],
        ["Date", f.date],
        ["Time", f.time],
        ["Service", f.service],
        ["Purpose", f.purpose],
      ];
<<<<<<< HEAD
    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Confirm Appointment</h2><p>Please review your details before submitting.</p></div><div class="modal-body">${r.map((x) => `<div class="detail"><span>${x[0]}</span><b>${escapeHTML(x[1])}</b></div>`).join("")}</div><div class="modal-actions"><button class="secondary" onclick="D.modal='';render()">Go Back</button><button class="primary" onclick="D.modal='booked';D.ref=(D.bt==='student'?'STU':'EMP')+'-'+Date.now().toString().slice(-7);render()">Confirm Booking</button></div></section></div>`;
=======

    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Confirm Appointment</h2><p>Please review your details before submitting.</p></div><div class="modal-body">${r.map((x) => `<div class="detail"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}</div><div class="modal-actions"><button class="secondary" onclick="D.modal='';render()">Go Back</button><button class="primary" onclick="D.modal='booked';D.ref=(D.bt==='student'?'STU':'EMP')+'-'+Date.now().toString().slice(-7);render()">Confirm Booking</button></div></section></div>`;
>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc
  }

  if (D.modal === "booked" || D.modal === "synced") {
    let b = D.modal === "booked";

    return `<div class="backdrop"><section class="modal"><div class="success"><i>✓</i><h2>${b ? "Appointment Booked!" : "Synced Successfully"}</h2><p>${b ? "Your appointment is pending confirmation from the clinic staff. Please arrive 10 minutes before your scheduled time." : "The student record has been added to the NUIS database. Status updated to Synced."}</p>${b ? `<div class="ref"><small>Reference Number</small><b>${D.ref}</b></div>` : ""}<button class="primary" onclick="D.modal='';render()">Done</button></div></section></div>`;
  }

  if (D.modal === "cancel") {
    let a = AP.find((x) => x[0] === D.target);
<<<<<<< HEAD
    return `<div class="backdrop"><section class="modal"><div class="success"><i style="background:#fee2e2;color:#dc2626">×</i><h2>Cancel Appointment</h2><p>Cancel the appointment for <b>${escapeHTML(a?.[1] || "this patient")}</b>? This cannot be undone.</p><div class="modal-actions" style="padding:8px 0 0"><button class="secondary" onclick="D.modal='';render()">Keep It</button><button class="primary" style="background:#dc2626;box-shadow:none" onclick="setStatus(D.target,'Cancelled');D.modal=''">Yes, Cancel</button></div></div></section></div>`;
=======

    return `<div class="backdrop"><section class="modal"><div class="success"><i style="background:#fee2e2;color:#dc2626">×</i><h2>Cancel Appointment</h2><p>Cancel the appointment for <b>${a[1]}</b>? This cannot be undone.</p><div class="modal-actions" style="padding:8px 0 0"><button class="secondary" onclick="D.modal='';render()">Keep It</button><button class="primary" style="background:#dc2626;box-shadow:none" onclick="setStatus(D.target,'Cancelled');D.modal=''">Yes, Cancel</button></div></div></section></div>`;
>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc
  }

  let s = NS.find((x) => x[0] === D.target);
<<<<<<< HEAD
  return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Sync to NUIS</h2><p>Confirm manual entry into the NUIS student database.</p></div><div class="modal-body">${[["Temporary ID", s[0]], ["Full Name", s[1]], ["Program", s[2]], ["Year Level", s[3]]].map((x) => `<div class="detail"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}<div class="summary">This student will be added to the NUIS database. A permanent student ID will be assigned upon activation.</div></div><div class="modal-actions"><button class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary" onclick="NS.find(x=>x[0]===D.target)[4]='Synced';D.modal='synced';render()">Add to NUIS</button></div></section></div>`;
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function slotReservationId(date, time) {
  return `${date}_${time}`;
}

function stopSlotReservationListener() {
  if (stopSlotReservation) stopSlotReservation();
  stopSlotReservation = null;
  activeSlotReservationId = "";
}

function watchSlotAvailability(date, time) {
  const status = $("#slotAvailability");
  if (!date || !time || !status) {
    stopSlotReservationListener();
    if (status) status.textContent = "";
    return;
  }

  const reservationId = slotReservationId(date, time);
  if (reservationId === activeSlotReservationId) return;
  stopSlotReservationListener();
  activeSlotReservationId = reservationId;
  status.textContent = "Checking availability...";
  status.classList.remove("full");

  stopSlotReservation = onSnapshot(
    doc(db, "slotReservations", reservationId),
    (reservation) => {
      const currentStatus = $("#slotAvailability");
      if (reservationId !== activeSlotReservationId || !currentStatus) return;
      const count = reservation.exists() ? Number(reservation.data().count) || 0 : 0;
      currentStatus.textContent = count >= D.slotCapacity
        ? "This time slot is full. Please choose another time."
        : `${D.slotCapacity - count} of ${D.slotCapacity} appointments available for this time slot.`;
      currentStatus.classList.toggle("full", count >= D.slotCapacity);
    },
    (error) => {
      const currentStatus = $("#slotAvailability");
      if (reservationId !== activeSlotReservationId || !currentStatus) return;
      currentStatus.textContent = getFirebaseErrorMessage(error);
      currentStatus.classList.add("full");
    },
  );
}

async function saveClinicSettings(settings) {
  await setDoc(doc(db, "clinicSettings", "general"), {
    ...settings,
    updatedAt: serverTimestamp(),
    updatedBy: D.user.uid,
  }, { merge: true });
}

function downloadReport() {
  const start = D.reportStart || "";
  const end = D.reportEnd || "";
  if (start && end && start > end) {
    const error = $("#reportError");
    if (error) error.textContent = "The start date must be before or equal to the end date.";
    return;
  }
  const rows = AP.filter((appointment) =>
    (!start || appointment[5] >= start) && (!end || appointment[5] <= end),
  );
  const headers = ["Reference ID", "Name", "ID / Department", "Program", "Patient Type", "Date", "Time", "Service", "Status"];
  const csvValue = (value) => {
    let safeValue = String(value ?? "");
    if (/^[\s]*[=+\-@]/.test(safeValue)) safeValue = `'${safeValue}`;
    return `"${safeValue.replace(/"/g, '""')}"`;
  };
  const csv = [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `synclinic-appointments-${start || "all"}-to-${end || "all"}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getFirebaseErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "That email address already has an account.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Choose a password with at least 8 characters.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/network-request-failed": "Firebase Authentication could not connect. Check your internet connection and try again.",
    "auth/operation-not-allowed": "Email/password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.",
    "auth/invalid-api-key": "The Firebase API key is invalid. Check Firebase Console → Project settings → Your apps.",
    "permission-denied": "Firebase denied this request. Check that the Firestore rules are deployed.",
    "failed-precondition": "Cloud Firestore is not ready. Create the Firestore database in Firebase Console and try again.",
    "not-found": "The requested Firestore database or document was not found. Create the default Firestore database and try again.",
    "unavailable": "Could not reach Cloud Firestore. Check your internet or firewall; if those are working, create the Firestore database for project synclinic-563b5 and deploy Firebase/Database/firestore.rules.",
  };
  if (messages[error?.code]) return messages[error.code];
  if (error?.code) return `Firebase error (${error.code}): ${error.message || "Please check Firebase Console settings and try again."}`;
  return error?.message || "The Firebase request failed. Please try again.";
}

function setUserSession(user, profile) {
  if (!profile || !["student", "faculty", "staff"].includes(profile.role)) {
    throw new Error("This account does not have a valid SynClinic role.");
  }

  D.user = user;
  D.profile = {
    name: profile.name || "",
    email: profile.email || user?.email || "",
    username: profile.username || "",
    age: profile.age || "",
    sex: profile.sex || "",
    role: profile.role,
    address: profile.address || "",
    program: profile.program || "",
    department: profile.department || "",
    year: profile.year || "",
    identifier: profile.identifier || "",
    office: profile.office || "",
    phone: profile.phone || "",
    emergencyContact: profile.emergencyContact || "",
  };
  D.role = profile.role;
  D.profileEditing = false;
  D.services = [...S];
  D.slotCapacity = 5;
  let savedState = null;
  try {
    savedState = JSON.parse(sessionStorage.getItem(sessionStateKey(user.uid)) || "null");
  } catch (error) {
    console.warn("Could not restore the previous SynClinic view.", error);
  }
  const allowedViews = profile.role === "staff" ? ["dash", "profile"] : ["booking", "history", "profile"];
  D.view = savedState?.role === profile.role && allowedViews.includes(savedState.view)
    ? savedState.view
    : profile.role === "staff" ? "dash" : "booking";
  if (savedState?.role === profile.role) {
    if (["apps", "students"].includes(savedState.tab)) D.tab = savedState.tab;
    D.search = typeof savedState.search === "string" ? savedState.search : "";
    D.type = ["All", "Student", "Employee"].includes(savedState.type) ? savedState.type : "All";
    D.status = ["All", "Pending", "Confirmed", "Completed", "Cancelled"].includes(savedState.status)
      ? savedState.status
      : "All";
    D.appointmentDateFilter = typeof savedState.appointmentDateFilter === "string"
      ? savedState.appointmentDateFilter
      : "";
    D.restoreScrollTop = Number.isFinite(savedState.scrollY) ? savedState.scrollY : 0;
  } else {
    D.restoreScrollTop = null;
  }
  D.bt = profile.role === "faculty" ? "faculty" : "student";
  D.notice = "";
  subscribeLiveData();
}

function subscribeLiveData() {
  if (stopAppointments) stopAppointments();
  if (stopNewStudents) stopNewStudents();
  if (stopClinicSettings) stopClinicSettings();
  stopAppointments = null;
  stopNewStudents = null;
  stopClinicSettings = null;
  D.services = [...S];
  D.slotCapacity = 5;
  AP = [];
  NS = [];
  D.loading = true;

  stopClinicSettings = onSnapshot(
    doc(db, "clinicSettings", "general"),
    (snapshot) => {
      const settings = snapshot.exists() ? snapshot.data() : {};
      D.services = Array.isArray(settings.services)
        ? settings.services.filter((service) => typeof service === "string" && service.trim())
        : [...S];
      D.slotCapacity = Number.isInteger(settings.slotCapacity) && settings.slotCapacity > 0
        ? settings.slotCapacity
        : 5;
      render();
    },
    (error) => {
      D.dataError = getFirebaseErrorMessage(error);
      render();
    },
  );

  const appointments = D.role === "staff"
    ? collection(db, "appointments")
    : query(collection(db, "appointments"), where("ownerUid", "==", D.user.uid));
  stopAppointments = onSnapshot(
    appointments,
    (snapshot) => {
      AP = snapshot.docs.map((item) => {
        const appointment = item.data();
        return [
          item.id,
          appointment.name || "",
          appointment.department ? `${appointment.identifier || ""} · ${appointment.department}` : appointment.identifier || "",
          appointment.program || "-",
          appointment.patientType || "",
          appointment.date || "",
          appointment.time || "",
          appointment.service || "",
          appointment.status || "Pending",
        ];
      });
      D.loading = false;
      D.dataError = "";
      render();
    },
    (error) => {
      D.loading = false;
      D.dataError = getFirebaseErrorMessage(error);
      render();
    },
  );

  if (D.role === "staff") {
    stopNewStudents = onSnapshot(
      collection(db, "newStudents"),
      (snapshot) => {
        NS = snapshot.docs.map((item) => {
          const student = item.data();
          return [
            item.id,
            student.name || "",
            student.program || "",
            student.year || "",
            student.status || "Pending",
          ];
        });
        D.dataError = "";
        render();
      },
      (error) => {
        D.dataError = getFirebaseErrorMessage(error);
        render();
      },
    );
  }
}

async function authenticate(formData) {
  D.busy = true;
  D.notice = "";
  try {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const currentUser = firebaseAuth.currentUser;

    if (D.screen === "signup") {
      const hasExistingAuthUser = !!currentUser && currentUser.email?.toLowerCase() === email;
      const profile = {
        name: String(formData.get("name") || "").trim(),
        email,
        username: String(formData.get("username") || "").trim(),
        identifier: String(formData.get("id") || "").trim(),
        role: D.ar,
        createdAt: serverTimestamp(),
      };

      if (hasExistingAuthUser) {
        await setDoc(doc(db, "users", currentUser.uid), profile);
        D.ignoreNextSignOutEvent = true;
        await signOut(firebaseAuth);
        D.screen = "login";
        D.user = null;
        D.profile = null;
        D.role = "";
        D.view = "booking";
        D.notice = "Account created successfully. Please sign in to continue.";
        return;
      }

      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await setDoc(doc(db, "users", credential.user.uid), profile);
      D.ignoreNextSignOutEvent = true;
      await signOut(firebaseAuth);
      D.screen = "login";
      D.user = null;
      D.profile = null;
      D.role = "";
      D.view = "booking";
      D.notice = "Account created successfully. Please sign in to continue.";
      return;
    }

    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const profileSnapshot = await getDoc(doc(db, "users", credential.user.uid));
    if (!profileSnapshot.exists()) {
      D.notice = "Your Firebase account has no SynClinic profile yet. Complete your profile below to continue.";
      D.screen = "signup";
      D.user = credential.user;
      D.profile = null;
      D.role = "";
      return;
    }
    setUserSession(credential.user, profileSnapshot.data());
  } catch (error) {
    const errorMessage = getFirebaseErrorMessage(error);
    if (firebaseAuth.currentUser && !D.user) {
      try {
        await signOut(firebaseAuth);
      } catch (signOutError) {
        D.notice = `${errorMessage} Could not sign out: ${getFirebaseErrorMessage(signOutError)}`;
        return;
      }
    }
    D.notice = errorMessage;
  } finally {
    D.busy = false;
    render();
  }
}

async function createAppointment(values, quickAdd = false) {
  D.dataError = "";
  try {
    const appointmentRef = doc(collection(db, "appointments"));
    const date = String(values.date || "");
    const time = String(values.time || "");
    const reservationRef = doc(db, "slotReservations", slotReservationId(date, time));
    const isStudent = quickAdd
      ? values.type !== "Employee"
      : D.bt === "student";
    const newStudent = quickAdd
      ? values.type === "New Student"
      : isStudent && values.new === "yes";
    const appointment = {
      referenceId: appointmentRef.id,
      ownerUid: D.user.uid,
      createdByUid: D.user.uid,
      name: String(values.name || "").trim(),
      identifier: String(values.id || "").trim(),
      program: String(values.program || "-"),
      department: isStudent ? "" : String(values.department || ""),
      year: isStudent ? String(values.year || "") : "",
      patientType: isStudent ? "Student" : "Employee",
      date,
      time,
      service: String(values.service || ""),
      purpose: String(values.purpose || "").trim(),
      status: "Pending",
      newStudent,
      createdAt: serverTimestamp(),
    };
    const newStudentRef = newStudent ? doc(collection(db, "newStudents")) : null;
    await runTransaction(db, async (transaction) => {
      const settingsSnapshot = await transaction.get(doc(db, "clinicSettings", "general"));
      const reservationSnapshot = await transaction.get(reservationRef);
      const reservation = reservationSnapshot.exists() ? reservationSnapshot.data() : {};
      const count = Number(reservation.count) || 0;
      const configuredCapacity = settingsSnapshot.data()?.slotCapacity;
      const capacity = Number.isInteger(configuredCapacity) && configuredCapacity > 0
        ? configuredCapacity
        : 5;
      if (count >= capacity) {
        throw new Error(`This time slot is full. Choose another time or ask clinic staff to increase its limit (${capacity} appointments per slot).`);
      }

      transaction.set(appointmentRef, appointment);
      transaction.set(reservationRef, {
        date,
        time,
        count: count + 1,
        lastAppointmentId: appointmentRef.id,
        updatedAt: serverTimestamp(),
      });

      if (newStudentRef) {
        transaction.set(newStudentRef, {
          ownerUid: D.user.uid,
          appointmentId: appointmentRef.id,
          name: appointment.name,
          identifier: appointment.identifier,
          program: appointment.program,
          year: appointment.year,
          status: "Pending",
          createdAt: serverTimestamp(),
        });
      }
    });
    D.ref = appointmentRef.id;
    D.pendingBooking = null;
    D.modal = quickAdd ? "" : "booked";
    if (quickAdd && newStudent) {
      D.tab = "students";
      D.dataError = "";
      render();
      requestAnimationFrame(() => $("#dashboardRecords")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }
  } catch (error) {
    D.dataError = error?.message || getFirebaseErrorMessage(error);
  }
  render();
}

async function setStatus(id, status) {
  try {
    const appointmentRef = doc(db, "appointments", id);
    await runTransaction(db, async (transaction) => {
      const appointmentSnapshot = await transaction.get(appointmentRef);
      if (!appointmentSnapshot.exists()) {
        throw new Error("This appointment no longer exists.");
      }
      const appointment = appointmentSnapshot.data();
      const reservationRef = doc(db, "slotReservations", slotReservationId(appointment.date, appointment.time));
      const releasesSlot = ["Pending", "Confirmed"].includes(appointment.status)
        && ["Completed", "Cancelled"].includes(status);
      const reservationSnapshot = releasesSlot
        ? await transaction.get(reservationRef)
        : null;
      transaction.update(appointmentRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      if (releasesSlot) {
        if (!reservationSnapshot?.exists()) {
          throw new Error("The slot reservation is missing. Please contact clinic staff.");
        }
        const currentCount = Number(reservationSnapshot.data().count) || 0;
        if (currentCount < 1) {
          throw new Error("The slot reservation count is invalid. Please contact clinic staff.");
        }
        transaction.update(reservationRef, {
          count: currentCount - 1,
          lastAppointmentId: id,
          updatedAt: serverTimestamp(),
        });
      }
    });
    D.modal = "";
    D.dataError = "";
  } catch (error) {
    D.dataError = getFirebaseErrorMessage(error);
  }
  render();
}

async function setStudentStatus(id) {
  try {
    await updateDoc(doc(db, "newStudents", id), {
      status: "Reviewed",
      updatedAt: serverTimestamp(),
    });
    D.dataError = "";
  } catch (error) {
    D.dataError = getFirebaseErrorMessage(error);
  }
  render();
}

async function logout() {
  D.busy = true;
  try {
    await signOut(firebaseAuth);
    stopSlotReservationListener();
    if (stopAppointments) stopAppointments();
    if (stopNewStudents) stopNewStudents();
    if (stopClinicSettings) stopClinicSettings();
    stopAppointments = null;
    stopNewStudents = null;
    stopClinicSettings = null;
    D.services = [...S];
    D.slotCapacity = 5;
    AP = [];
    NS = [];
    D.user = null;
    D.profile = null;
    D.role = "";
    D.profileEditing = false;
    D.screen = "login";
    D.view = "booking";
    D.notice = "";
  } catch (error) {
    D.dataError = getFirebaseErrorMessage(error);
  } finally {
    D.busy = false;
    render();
  }
}

function liveAppTable() {
  const filtered = AP.filter((appointment) =>
    (D.type === "All" || appointment[4] === D.type)
    && (D.status === "All" || appointment[8] === D.status)
    && (!D.appointmentDateFilter || appointment[5] === D.appointmentDateFilter)
    && (!D.search
      || appointment[1].toLowerCase().includes(D.search.toLowerCase())
      || appointment[2].toLowerCase().includes(D.search.toLowerCase())),
  );
  const rows = filtered.map((appointment) => `
    <tr>
      <td><div class="person">${escapeHTML(appointment[1])}</div><div class="muted">${escapeHTML(appointment[0])}</div></td>
      <td>${escapeHTML(appointment[2])}</td><td>${escapeHTML(appointment[3])}</td>
      <td>${escapeHTML(appointment[5])}</td><td>${escapeHTML(appointment[6])}</td>
      <td>${escapeHTML(appointment[7])}</td><td>${badge(escapeHTML(appointment[8]))}</td>
      <td>${appointment[8] === "Pending" ? `<button class="act" onclick="setStatus('${escapeHTML(appointment[0])}','Confirmed')">Confirm</button>` : ""}
      ${appointment[8] === "Confirmed" ? `<button class="act complete" onclick="setStatus('${escapeHTML(appointment[0])}','Completed')">Complete</button>` : ""}
      ${["Pending", "Confirmed"].includes(appointment[8]) ? `<button class="act cancel" onclick="D.target='${escapeHTML(appointment[0])}';D.modal='cancel';render()">Cancel</button>` : ""}</td>
    </tr>`).join("");
  return `<div class="filters"><input class="input" value="${escapeHTML(D.search)}" oninput="D.search=this.value;render()" placeholder="Search by name or ID / dept..."><select class="select" onchange="D.type=this.value;render()">${["All", "Student", "Employee"].map((type) => `<option value="${type}" ${D.type === type ? "selected" : ""}>${type === "All" ? "All Types" : type}</option>`).join("")}</select><select class="select" onchange="D.status=this.value;D.appointmentDateFilter='';render()">${["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((status) => `<option value="${status}" ${D.status === status ? "selected" : ""}>${status === "All" ? "All Statuses" : status}</option>`).join("")}</select></div><div class="scroll"><table><thead><tr>${["Name", "ID / Dept", "Program", "Date", "Time", "Service", "Status", "Actions"].map((heading) => `<th>${heading}</th>`).join("")}</thead><tbody>${rows || `<tr><td colspan="8" style="text-align:center;padding:50px;color:#9ca3af">${D.loading ? "Loading appointments…" : "No appointments match the current filters."}</td></tr>`}</tbody></table></div><div class="panel-foot"><span>Showing ${filtered.length} of ${AP.length} appointments${D.appointmentDateFilter ? ` · ${escapeHTML(D.appointmentDateFilter)}` : ""}</span></div>`;
}

function bookingHistory() {
  const history = [...AP].sort((first, second) =>
    `${second[5]} ${second[6]}`.localeCompare(`${first[5]} ${first[6]}`),
  );
  const rows = history.map((appointment) => `
    <tr>
      <td><div class="person">${escapeHTML(appointment[0])}</div></td>
      <td>${escapeHTML(appointment[2])}</td>
      <td>${escapeHTML(appointment[3])}</td>
      <td>${escapeHTML(appointment[5])}</td>
      <td>${escapeHTML(appointment[6])}</td>
      <td>${escapeHTML(appointment[7])}</td>
      <td>${badge(escapeHTML(appointment[8]))}</td>
    </tr>`).join("");
  return `<main class="content"><div class="history-page"><h1 class="title">Booking History</h1><p class="desc">View your appointment bookings and their latest status.</p><section class="panel"><div class="scroll"><table><thead><tr>${["Reference", "ID / Department", "Program", "Date", "Time", "Service", "Status"].map((heading) => `<th>${heading}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td colspan="7" style="text-align:center;padding:50px;color:#9ca3af">${D.loading ? "Loading your bookings…" : "You have no bookings yet."}</td></tr>`}</tbody></table></div><div class="panel-foot"><span>${history.length} booking${history.length === 1 ? "" : "s"}</span></div></section></div></main>`;
}

function openDashboardStat(stat) {
  D.search = "";
  D.type = "All";
  D.status = "All";
  D.appointmentDateFilter = "";
  if (stat === "today") {
    D.tab = "apps";
    D.appointmentDateFilter = todayISO();
  } else if (["Pending", "Completed", "Cancelled"].includes(stat)) {
    D.tab = "apps";
    D.status = stat;
  } else if (stat === "students") {
    D.tab = "students";
  }
  render();
  requestAnimationFrame(() => $("#dashboardRecords")?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function liveStudentTable() {
  const pending = NS.filter((student) => student[4] === "Pending");
  return `<div class="info">New-student records are stored in Firebase for clinic review. This app does not connect to the university NUIS system.</div><div class="scroll"><table><thead><tr>${["Record ID", "Full Name", "Program", "Year Level", "Review Status", "Action"].map((heading) => `<th>${heading}</th>`).join("")}</tr></thead><tbody>${NS.length ? NS.map((student) => `<tr><td>${escapeHTML(student[0])}</td><td class="person">${escapeHTML(student[1])}</td><td>${escapeHTML(student[2])}</td><td>${escapeHTML(student[3])}</td><td>${badge(escapeHTML(student[4]))}</td><td>${student[4] === "Pending" ? `<button class="act" data-review-id="${escapeHTML(student[0])}">Mark reviewed</button>` : '<i class="muted">Reviewed</i>'}</td></tr>`).join("") : `<tr><td colspan="6" style="text-align:center;padding:50px;color:#9ca3af">No new-student records.</td></tr>`}</tbody></table></div><div class="panel-foot"><span>${pending.length} pending review · ${NS.length - pending.length} reviewed</span></div>`;
}

function profileDashboard() {
  const profile = D.profile || {};
  const editing = D.profileEditing;
  const roleLabels = {
    student: "Student",
    faculty: "Faculty / Staff",
    staff: "Clinic Staff",
  };
  const fields = [
    ["Name", "name", profile.name || "", "text"],
    ["Username", "username", profile.username || "", "text"],
    ["Age", "age", profile.age || "", "number"],
    ["Sex", "sex", profile.sex || "", "text"],
  ];
  if (D.role !== "staff") {
    fields.push(
      ["Address", "address", profile.address || "", "text"],
      ["Program", "program", profile.program || "", "text"],
      ["Department", "department", profile.department || "", "text"],
    );
  }
  if (D.role === "student") {
    fields.push(["Year", "year", profile.year || "", "text"]);
  }

  return `<main class="content"><div class="profile-dashboard"><h1 class="title">Profile Dashboard</h1><p class="desc">University Health Office · National University Fairview</p><section class="panel profile-card">
    <div class="profile-card-head"><span>Profile Information</span>${editing ? "" : '<button class="profile-edit" type="button" onclick="D.profileEditing=true;render()">Edit</button>'}</div>
    ${editing ? `<form id="profileForm" class="profile-form"><div class="profile-grid">
      ${fields.map(([label, name, value, type]) => `
        <div class="profile-item">
          <label class="profile-label" for="profile-${name}">${escapeHTML(label)}</label>
          <input class="input profile-input" id="profile-${name}" name="${name}" type="${type}" value="${escapeHTML(value)}" ${["name", "username"].includes(name) ? "required" : ""} ${name === "age" ? 'min="0" step="1"' : ""}>
        </div>
      `).join("")}
      <div class="profile-item">
        <div class="profile-label">Role</div>
        <div class="profile-value">${escapeHTML(roleLabels[D.role] || "")}</div>
      </div>
    </div><div class="profile-form-actions"><span id="profileSaveStatus" class="profile-save-status${D.profileSaveStatus.startsWith("Could not save:") || D.profileSaveStatus.startsWith("Please complete") ? " error" : ""}" role="status" aria-live="polite">${escapeHTML(D.profileSaveStatus.startsWith("Could not save:") || D.profileSaveStatus.startsWith("Please complete") ? D.profileSaveStatus : "")}</span><button class="primary profile-save" type="submit">Done</button></div></form>` : `<div class="profile-grid">
      ${fields.map(([label, , value]) => `
        <div class="profile-item">
          <div class="profile-label">${escapeHTML(label)}</div>
          <div class="profile-value">${escapeHTML(value || "—")}</div>
        </div>
      `).join("")}
      <div class="profile-item">
        <div class="profile-label">Role</div>
        <div class="profile-value">${escapeHTML(roleLabels[D.role] || "—")}</div>
      </div>
    </div>`}
  </section></div></main>`;
}

function profileUpdatesFromForm(form) {
  const formData = new FormData(form);
  const profileUpdates = {
    name: String(formData.get("name") || "").trim(),
    username: String(formData.get("username") || "").trim(),
    age: String(formData.get("age") || "").trim(),
    sex: String(formData.get("sex") || "").trim(),
    role: D.role,
    updatedAt: serverTimestamp(),
  };
  if (D.role !== "staff") {
    Object.assign(profileUpdates, {
      address: String(formData.get("address") || "").trim(),
      program: String(formData.get("program") || "").trim(),
      department: String(formData.get("department") || "").trim(),
    });
  }
  if (D.role === "student") {
    profileUpdates.year = String(formData.get("year") || "").trim();
  }
  return profileUpdates;
}

function setProfileSaveStatus(message, error = false) {
  D.profileSaveStatus = message;
  const status = $("#profileSaveStatus");
  if (status) {
    status.textContent = message;
    status.classList.toggle("error", error);
  }
}

function saveProfile(form, closeEditor = false) {
  const profileUpdates = profileUpdatesFromForm(form);
  if (!form.checkValidity()) {
    setProfileSaveStatus("Please complete the required fields with valid values.", true);
    return Promise.resolve();
  }
  setProfileSaveStatus("Saving...");

  profileSaveQueue = profileSaveQueue
    .catch(() => {})
    .then(() => updateDoc(doc(db, "users", D.user.uid), {
      ...profileUpdates,
      updatedAt: serverTimestamp(),
    }))
    .then(() => {
      D.profile = { ...D.profile, ...profileUpdates };
      D.dataError = "";
      D.profileSaveStatus = "";
      if (closeEditor) {
        D.profileEditing = false;
        render();
      } else {
        setProfileSaveStatus("");
      }
    })
    .catch((error) => {
      const message = getFirebaseErrorMessage(error);
      D.dataError = message;
      setProfileSaveStatus(`Could not save: ${message}`, true);
    });
  return profileSaveQueue;
}

function dash() {
  const today = todayISO();
  const todaysAppointments = AP.filter((appointment) => appointment[5] === today);
  const counts = [
    todaysAppointments.length,
    AP.filter((appointment) => appointment[8] === "Pending").length,
    AP.filter((appointment) => appointment[8] === "Completed").length,
    AP.filter((appointment) => appointment[8] === "Cancelled").length,
    NS.length,
  ];
  const cards = [
    ["📅", "Today's Appointments", "#ebf0f8", "#003366"],
    ["⏳", "Pending", "#fef9ec", "#92400e"],
    ["✅", "Completed", "#ecfdf5", "#065f46"],
    ["🚫", "Cancelled", "#fef2f2", "#991b1b"],
    ["🆕", "New Students", "#f5f3ff", "#5b21b6"],
  ];
  const statKeys = ["today", "Pending", "Completed", "Cancelled", "students"];
  return `<main class="content"><div class="dash-head"><div><h1 class="title">Clinic Staff Dashboard</h1><p class="desc">● Real-time appointment monitoring · ${new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div><button class="primary quick" onclick="D.modal='quick';render()">＋ Quick Add Appointment</button></div><div class="stats">${cards.map((card, index) => `<button type="button" class="stat stat-click" style="background:${card[2]};color:${card[3]}" onclick="openDashboardStat('${statKeys[index]}')" aria-label="View ${escapeHTML(card[1])}: ${counts[index]}"><i>${card[0]}</i><span><b>${counts[index]}</b><small>${card[1]}</small></span></button>`).join("")}</div>  <div class="actions"><button class="action" onclick="D.serviceDraft=[...D.services];D.serviceError='';D.modal='services';render()">⚙️ Manage Services</button><button class="action" onclick="D.limitError='';D.modal='limits';render()">🔒 Set Booking Limits</button><button class="action" onclick="D.reportStart='';D.reportEnd='';D.modal='reports';render()">📊 Generate Reports</button><button class="action" disabled title="Connect NUIS credentials and API before enabling sync">🔄 NUIS integration unavailable</button><button class="action" onclick="D.tab='students';render()">🆕 Manage New Students</button></div><section class="panel" id="dashboardRecords"><div class="tabs"><button class="${D.tab === "apps" ? "on" : ""}" onclick="D.tab='apps';render()">All Appointments <span class="count">${AP.length}</span></button><button class="${D.tab === "students" ? "on" : ""}" onclick="D.tab='students';render()">New Students <span class="count">${NS.filter((student) => student[4] === "Pending").length}</span></button></div>${D.tab === "apps" ? liveAppTable() : liveStudentTable()}</section></main>`;
}

=======

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

>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc
function render() {
  A.innerHTML = D.role
    ? header() + (D.role === "staff" && D.view === "dash"
      ? dash()
      : D.view === "profile"
        ? profileDashboard()
        : D.view === "history" && D.role !== "staff"
          ? bookingHistory()
          : booking()) + modal()
    : auth();

<<<<<<< HEAD
  if (!D.role || D.role === "staff" || D.view !== "booking") {
    stopSlotReservationListener();
  }

  if (!D.role && D.notice) {
    const authNotice = $("#auth .auth-notice");
    if (authNotice) {
      authNotice.textContent = D.notice;
    } else {
      const notice = document.createElement("p");
      notice.className = "note auth-notice";
      notice.setAttribute("role", "alert");
      notice.textContent = D.notice;
      $("#auth")?.prepend(notice);
    }
  } else {
    $("#auth .auth-notice")?.remove();
  }

  if (D.role && D.dataError) {
    const dataErrorNotice = A.querySelector(".data-error-note");
    if (dataErrorNotice) {
      dataErrorNotice.textContent = D.dataError;
    } else {
      const notice = document.createElement("p");
      notice.className = "note data-error-note";
      notice.setAttribute("role", "alert");
      notice.textContent = D.dataError;
      A.prepend(notice);
    }
  } else {
    A.querySelector(".data-error-note")?.remove();
  }

  if (D.role) {
    const signOutButton = document.querySelector(".signout");
    if (signOutButton) signOutButton.onclick = logout;
    const bookingSwitch = document.querySelector(".switch");
    if (bookingSwitch) bookingSwitch.classList.add("hide");
  }

  let a = $("#auth"),
    b = $("#book"),
    q = $("#quick"),
    servicesForm = $("#servicesForm"),
    limitsForm = $("#limitsForm"),
    reportForm = $("#reportForm");

  if (a) {
    if (D.screen === "login") {
      const emailInput = a.querySelector('[name="username"]');
      if (emailInput) {
        emailInput.name = "email";
        emailInput.type = "email";
        emailInput.placeholder = "name@nu-fairview.edu.ph";
        emailInput.previousElementSibling.textContent = "Email Address";
      }
      a.querySelector(".caption").classList.add("hide");
      a.querySelector(".roles").classList.add("hide");
      a.querySelector(".hint").classList.add("hide");
    } else {
      const hint = a.querySelector(".hint");
      if (D.ar === "staff") {
        hint.textContent = "Clinic Staff accounts open the staff dashboard after sign-up.";
      }
    }
    a.onsubmit = async (event) => {
      event.preventDefault();

      const formData = new FormData(a);
      const errors = [];
      const fields = a.querySelectorAll(".input, .select");

      fields.forEach((field) => {
        field.classList.remove("input-error");
      });

      const markInvalid = (name, message) => {
        const field = a.querySelector(`[name="${name}"]`);
        if (field) {
          field.classList.add("input-error");
        }
        errors.push(message);
      };

      if (D.screen === "login") {
        if (!formData.get("email")?.trim()) {
          markInvalid("email", "No Email Address.");
        }
        if (!formData.get("password")) {
          markInvalid("password", "No Password.");
        }
      }

      if (D.screen === "signup") {
        const existingAuthUser = !!firebaseAuth.currentUser && firebaseAuth.currentUser.email?.toLowerCase() === String(formData.get("email") || "").trim().toLowerCase();
        const requiredFields = [
          ["name", "No Full Name."],
          ["id", D.ar === "student" ? "No Student ID." : "No Employee/Staff ID."],
          ["email", "No Email Address."],
          ["username", "No Username."],
        ];

        if (!existingAuthUser) {
          requiredFields.push(["password", "No Password."], ["confirm", "No Confirm Password."]);
        }

        requiredFields.forEach(([name, message]) => {
          if (!formData.get(name)?.trim()) {
            markInvalid(name, message);
          }
        });

        if (!formData.get("agree")) {
          errors.push("Please agree to the Terms and Conditions.");
        }
      }

      const email = formData.get("email") || "";
      if (D.screen === "signup" && email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          markInvalid("email", "Enter a valid email address.");
        }
      }

      const password = formData.get("password") || "";
      const confirmPassword = formData.get("confirm") || "";

      if (password && password.length < 8) {
        markInvalid("password", "Password must contain at least 8 characters.");
      }

      if (D.screen === "signup" && password && confirmPassword && password !== confirmPassword) {
        markInvalid("confirm", "Passwords do not match.");
      }

      if (errors.length > 0) {
        $("#err").textContent = `⚠ ${errors.join(" ")}`;
        $("#err").classList.remove("hide");
        return;
      }

      await authenticate(formData);
    };
  }

  if (b) {
    const dateInput = b.querySelector('[name="date"]');
    if (dateInput) dateInput.min = todayISO();
    const updateSlotAvailability = () => watchSlotAvailability(
      b.querySelector('[name="date"]').value,
      b.querySelector('[name="time"]').value,
    );
    b.querySelector('[name="date"]').addEventListener("change", updateSlotAvailability);
    b.querySelector('[name="time"]').addEventListener("change", updateSlotAvailability);
    updateSlotAvailability();
    b.onsubmit = (event) => {
      event.preventDefault();
      D.pendingBooking = Object.fromEntries(new FormData(b).entries());
=======
  let a = $("#auth"),
    b = $("#book"),
    q = $("#quick");

if (a) {
  a.onsubmit = (e) => {
    e.preventDefault();

    const f = new FormData(a);
    const isSignup = D.screen === "signup";

    const name = (f.get("name") || "").trim();
    const id = (f.get("id") || "").trim();
    const email = (f.get("email") || "").trim();
    const username = (f.get("username") || "").trim();
    const password = f.get("password") || "";
    const confirm = f.get("confirm") || "";
    const agree = f.get("agree");

    let err = "";

    // =========================
    // SIGN-UP VALIDATION
    // =========================
    if (isSignup) {

      // Full Name
      if (!name) {
        err = "Full Name is required.";
      }

      // Student / Employee / Staff ID
      else if (!id) {
        err = "ID is required.";
      }

      // Email
      else if (!email) {
        err = "Email Address is required.";
      }

      // Email format
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err = "Please enter a valid email address.";
      }

      // Username
      else if (!username) {
        err = "Username is required.";
      }

      // Password
      else if (!password) {
        err = "Password is required.";
      }

      // Minimum password length
      else if (password.length < 6) {
        err = "Password must be at least 6 characters.";
      }

      // Confirm password
      else if (!confirm) {
        err = "Please confirm your password.";
      }

      // Password match
      else if (password !== confirm) {
        err = "Passwords do not match.";
      }

      // Terms and conditions
      else if (!agree) {
        err = "Please agree to the terms and conditions.";
      }
    }

    // =========================
    // LOGIN VALIDATION
    // =========================
    else {

      // Username / Email
      if (!id) {
        err = "Username or Email is required.";
      }

      // Password
      else if (!password) {
        err = "Password is required.";
      }

      // Minimum password length
      else if (password.length < 6) {
        err = "Password must be at least 6 characters.";
      }
    }

    // =========================
    // DISPLAY VALIDATION ERROR
    // =========================
    if (err) {
      const errorBox = $("#err");

      errorBox.textContent = "⚠ " + err;
      errorBox.classList.remove("hide");

      return;
    }

    // =========================
    // SUCCESS
    // =========================
    D.role = D.ar;
    sessionStorage.synRole = D.role;

    D.view = D.role === "staff"
      ? "dash"
      : "booking";

    render();
  };
}

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
>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc
      D.modal = "confirm";
      render();
    };
  }

<<<<<<< HEAD
  if (q) {
    const dateInput = q.querySelector('[name="date"]');
    if (dateInput) dateInput.min = todayISO();
    q.onsubmit = (event) => {
      event.preventDefault();
      createAppointment(Object.fromEntries(new FormData(q).entries()), true);
    };
  }
=======
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

function togglePassword(button) {
  const input = button.parentElement.querySelector("input");

  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    button.textContent = "🙈";
    button.setAttribute("aria-label", "Hide password");
  } else {
    input.type = "password";
    button.textContent = "👁";
    button.setAttribute("aria-label", "Show password");
  }
}

render();
>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc

  if (servicesForm) {
    servicesForm.querySelectorAll("[data-remove-service]").forEach((button) => {
      button.addEventListener("click", () => {
        D.serviceDraft = [...servicesForm.querySelectorAll('[name="service"]')]
          .map((input) => input.value.trim());
        D.serviceDraft.splice(Number(button.dataset.removeService), 1);
        render();
      });
    });
    $("#addService")?.addEventListener("click", () => {
      D.serviceError = "";
      const input = servicesForm.querySelector('[name="newService"]');
      const service = input.value.trim();
      if (!service) return;
      if (D.serviceDraft.some((item) => item.toLowerCase() === service.toLowerCase())) {
        D.serviceError = "That service is already in the list.";
        $("#serviceError").textContent = D.serviceError;
        return;
      }
      D.serviceDraft = [...servicesForm.querySelectorAll('[name="service"]')]
        .map((item) => item.value.trim())
        .filter(Boolean);
      D.serviceDraft.push(service);
      render();
    });
    servicesForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const names = [...servicesForm.querySelectorAll('[name="service"]')]
        .map((input) => input.value.trim())
        .filter(Boolean);
      const newService = servicesForm.querySelector('[name="newService"]').value.trim();
      if (newService) names.push(newService);
      if (!names.length) {
        D.serviceError = "Keep at least one service available.";
        $("#serviceError").textContent = D.serviceError;
        return;
      }
      if (new Set(names.map((name) => name.toLowerCase())).size !== names.length) {
        D.serviceError = "Service names must be unique.";
        $("#serviceError").textContent = D.serviceError;
        return;
      }
      try {
        await saveClinicSettings({ services: names });
        D.services = names;
        D.serviceError = "";
        D.modal = "";
        D.dataError = "";
      } catch (error) {
        D.serviceError = getFirebaseErrorMessage(error);
      }
      render();
    });
  }

<<<<<<< HEAD
  if (limitsForm) {
    limitsForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const capacity = Number(new FormData(limitsForm).get("slotCapacity"));
      if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) {
        D.limitError = "Enter a whole number between 1 and 500.";
        render();
        return;
      }
      try {
        await saveClinicSettings({ slotCapacity: capacity });
        D.slotCapacity = capacity;
        D.limitError = "";
        D.modal = "";
        D.dataError = "";
      } catch (error) {
        D.limitError = getFirebaseErrorMessage(error);
      }
      render();
    });
  }

  if (reportForm) {
    reportForm.addEventListener("change", () => {
      const formData = new FormData(reportForm);
      D.reportStart = String(formData.get("start") || "");
      D.reportEnd = String(formData.get("end") || "");
      render();
    });
  }

  const confirmButton = A.querySelector('.modal-actions .primary[onclick*="Date.now"]');
  if (confirmButton) {
    confirmButton.removeAttribute("onclick");
    confirmButton.addEventListener("click", () => createAppointment(D.pendingBooking));
  }

  A.querySelectorAll("[data-review-id]").forEach((button) => {
    button.addEventListener("click", () => setStudentStatus(button.dataset.reviewId));
  });

  const profileForm = $("#profileForm");
  if (profileForm) {
    const queueProfileSave = () => {
      if (profileSaveTimer) clearTimeout(profileSaveTimer);
      profileSaveTimer = setTimeout(() => {
        profileSaveTimer = null;
        saveProfile(profileForm);
      }, 500);
    };
    profileForm.addEventListener("input", queueProfileSave);
    profileForm.addEventListener("change", () => {
      if (profileSaveTimer) clearTimeout(profileSaveTimer);
      profileSaveTimer = null;
      saveProfile(profileForm);
    });
    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (profileSaveTimer) clearTimeout(profileSaveTimer);
      profileSaveTimer = null;
      saveProfile(profileForm, true);
    });
  }

  if (D.role) {
    persistSessionState();
    if (D.restoreScrollTop !== null && !D.loading) {
      const scrollTop = D.restoreScrollTop;
      D.restoreScrollTop = null;
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollTop);
        requestAnimationFrame(persistSessionState);
      });
    }
  }
}

async function restoreSession(user) {
  D.busy = true;
  try {
    const snapshot = await getDoc(doc(db, "users", user.uid));
    if (!snapshot.exists()) {
      D.notice = "Your Firebase account has no SynClinic profile yet. Complete your profile below to continue.";
      D.screen = "signup";
      D.user = user;
      D.profile = null;
      D.role = "";
      return;
    }
    setUserSession(user, snapshot.data());
  } catch (error) {
    const errorMessage = getFirebaseErrorMessage(error);
    D.notice = errorMessage;
    if (firebaseAuth.currentUser) {
      try {
        await signOut(firebaseAuth);
      } catch (signOutError) {
        D.notice = `${errorMessage} Could not sign out: ${getFirebaseErrorMessage(signOutError)}`;
      }
    }
  } finally {
    D.busy = false;
    render();
  }
}

window.D = D;
window.$ = $;
window.render = render;
window.logout = logout;
window.setStatus = setStatus;
window.downloadReport = downloadReport;
window.openDashboardStat = openDashboardStat;

onAuthStateChanged(firebaseAuth, (user) => {
  if (!user && D.ignoreNextSignOutEvent) {
    D.ignoreNextSignOutEvent = false;
    return;
  }
  if (D.busy) return;
  if (user) {
    restoreSession(user);
  } else {
    stopSlotReservationListener();
    if (stopAppointments) stopAppointments();
    if (stopNewStudents) stopNewStudents();
    if (stopClinicSettings) stopClinicSettings();
    stopAppointments = null;
    stopNewStudents = null;
    stopClinicSettings = null;
    D.services = [...S];
    D.slotCapacity = 5;
    D.user = null;
    D.profile = null;
    D.role = "";
    D.profileEditing = false;
    D.notice = "";
    D.dataError = "";
    AP = [];
    NS = [];
    render();
  }
});

render();
=======
  preventPastDates();

  new MutationObserver(preventPastDates).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
>>>>>>> bf0cea96f05fb90234209364973509ad474e9abc
