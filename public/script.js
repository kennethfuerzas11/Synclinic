import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  deleteObject,
  getBlob,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { auth as firebaseAuth, db, storage } from "./Firebase/Database/firebase-config.js?v=20261018-auth-session-restore";

const IS_STAFF_PORTAL = window.SYNCLINIC_STAFF_PORTAL === true,
  A = document.querySelector("#app"),
  $ = (s) => document.querySelector(s),
  D = {
    role: "",
    user: null,
    profile: null,
    screen: "login",
    ar: IS_STAFF_PORTAL ? "staff" : "student",
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
    authReady: false,
    authRestoreError: "",
    loading: false,
    busy: false,
    pendingBooking: null,
    profileEditing: false,
    profileSaveStatus: "",
    restoreScrollTop: null,
    ignoreNextSignOutEvent: false,
    demoMode: false,
    services: [],
    slotCapacity: 5,
    blockedSlots: [],
    slotLimits: [],
    slotCounts: {},
    slotCapacities: {},
    bookingDraft: {},
    authDraft: {},
    authDraftScreen: "",
    serviceDraft: [],
    serviceError: "",
    limitError: "",
    scheduleError: "",
    completionError: "",
    cancellationError: "",
    reportError: "",
  };

const T = [
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  ],
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

let AP = [];
let NS = [];
let stopAppointments = null;
let stopNewStudents = null;
let stopClinicSettings = null;
let stopSlotReservations = null;
let stopBlockedSlots = null;
let stopSlotLimits = null;
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
let displayedDashboardDate = todayISO();
setInterval(() => {
  const clock = $("#dashboardClock");
  if (clock) clock.textContent = new Date().toLocaleString("en-PH");
  const currentDate = todayISO();
  if (currentDate !== displayedDashboardDate) {
    displayedDashboardDate = currentDate;
    if (D.role === "staff") render();
  }
}, 30000);

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
  fi = (l, n, t = "text", p = "", required = true, showPasswordToggle = true) => {
    const requiredMark = required ? '<b class="req">*</b>' : '<span class="muted">(Optional)</span>';
    const requiredAttribute = required ? " required" : "";
    const inputAttributes = n === "id"
      ? ` inputmode="numeric" pattern="[0-9]*" oninput="this.value=this.value.replace(/[^0-9]/g, '')"`
      : "";
    if (t === "password") {
      return `<div class="field"><label>${l} ${requiredMark}</label><div class="password-wrap"><input class="input" name="${n}" type="password" placeholder="${p}"${requiredAttribute}>${showPasswordToggle ? '<button type="button" class="password-toggle" onclick="togglePassword(this)" aria-label="Show password">👁</button>' : ""}</div></div>`;
    }
    return `<div class="field"><label>${l} ${requiredMark}</label><input class="input" name="${n}" type="${t}" placeholder="${p}"${requiredAttribute}${inputAttributes}></div>`;
  },
  se = (l, n, x, p) => `<div class="field"><label>${l} <b class="req">*</b></label><select class="select" name="${n}" required>${op(x, p)}</select></div>`;

function auth() {
  const signup = D.screen === "signup";
  const forgot = D.screen === "forgot";
  const roles = IS_STAFF_PORTAL
    ? { staff: "Clinic Staff" }
    : { student: "Student", faculty: "Faculty / Employee" };
  const title = forgot
    ? "Reset your password"
    : signup
      ? (IS_STAFF_PORTAL ? "Sign Up" : "Create an account")
      : (IS_STAFF_PORTAL ? "Clinic staff sign in" : "Welcome back");
  const emailPrompt = signup
    ? "Enter valid email address"
    : "Enter your email address";
  const body = forgot
    ? `${fi("Email Address", "email", "email", "Enter your registered email")}<p class="hint">We will email a secure, one-time password reset link if an account matches.</p>`
    : signup
      ? `${fi("Full Name", "name", "text", "Last Name, First Name M.I.")}${fi(IS_STAFF_PORTAL ? "Employee / Staff ID" : D.ar === "student" ? "Student ID" : "Employee ID", "id", "text", "Enter any ID")}${fi("Email Address", "email", "email", emailPrompt)}${fi("Username", "username", "text", "Choose a unique username")}<div class="grid2">${fi("Password", "password", "password", "Min. 8 characters")}${fi("Confirm Password", "confirm", "password", "Re-enter password")}</div><label class="foot terms-consent"><input name="agree" type="checkbox" required> I agree to the <button type="button" class="link" onclick="openTerms()">Terms &amp; Conditions</button> and Privacy Policy.</label>`
      : `${fi("Email Address", "email", "email", emailPrompt)}${fi("Password", "password", "password", "Enter your password")}<div class="auth-links"><button type="button" class="link" onclick="D.screen='forgot';D.notice='';render()">Forgot password?</button></div>`;

  const rolesMarkup = !forgot && !(signup && IS_STAFF_PORTAL)
    ? `<span class="caption">${signup ? "Registering as" : "I am a"}</span><div class="roles">${Object.entries(roles).map(([key, label]) => `<button type="button" class="${D.ar === key ? "on" : ""}" onclick="D.ar='${key}';render()"><span>${key === "student" ? "\u{1F393}" : key === "faculty" ? "\u{1F464}" : "\u{1F3E5}"}</span>${label}</button>`).join("")}</div><p class="hint">${IS_STAFF_PORTAL ? "Clinic staff accounts open the staff dashboard after sign-in." : `You will be directed to the ${roles[D.ar]} Booking form.`}</p><div class="divider"></div>`
    : "";
  const authFooter = forgot
    ? `<button type="button" class="link" onclick="D.screen='login';D.notice='';render()">Back to Sign In</button>`
    : signup
      ? `Already have an account? <button type="button" class="link" onclick="D.screen='login';render()">Sign In</button>`
      : `Don't have an account? <button type="button" class="link" onclick="D.screen='signup';D.notice='';render()">Sign Up</button>`;

  return `<div class="auth"><main><div class="wrap"><div class="brand"><div class="logo"><i class="cross"></i></div><b>SynClinic</b><small>University Health Office · National University Fairview</small></div><div class="gold"></div><section class="panel"><div class="head"><h1>${title}</h1><p>${forgot ? "Enter the email address linked to your account." : signup ? (IS_STAFF_PORTAL ? "Create your clinic staff account and sign in to continue." : "Register for a SynClinic account to get started.") : "Sign in to your SynClinic account to continue."}</p></div><form class="form" id="auth" novalidate>${rolesMarkup}${body}<p id="err" class="note hide"></p><button class="primary">${forgot ? "Send Reset Link →" : signup ? (IS_STAFF_PORTAL ? "Sign Up →" : "Create Account →") : "Sign In →"}</button><p class="foot">${authFooter}</p></form></section></div></main><footer>SynClinic · University Health Office · NU Fairview · © 2024</footer></div>`;
}

function openTerms() {
  const form = $("#auth");
  D.termsPasswordDraft = {
    screen: D.screen,
    password: form?.elements.namedItem("password")?.value || "",
    confirm: form?.elements.namedItem("confirm")?.value || "",
  };
  D.modal = "terms";
  render();
}

function confirmTerms() {
  const passwordDraft = D.termsPasswordDraft;
  D.termsPasswordDraft = null;
  D.modal = "";
  render();
  if (passwordDraft?.screen !== D.screen || D.screen !== "signup") return;
  const form = $("#auth");
  const password = form?.elements.namedItem("password");
  const confirm = form?.elements.namedItem("confirm");
  if (password) password.value = passwordDraft.password;
  if (confirm) confirm.value = passwordDraft.confirm;
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

  return `<header class="top"><div class="topin"><div class="toprow"><div class="brandrow"><div class="logo"><i class="cross"></i></div><div><div class="name">SynClinic</div><div class="sub">University Health Office · NU Fairview</div></div></div><div class="topactions"><span class="pill">${r}</span><button class="signout" onclick="logout()">↩ Sign Out</button></div></div><nav class="nav">${navButtons.join("")}</nav></div></header><div class="gold"></div>`;
}

function booking() {
  const faculty = D.role === "faculty";
  const identity = (label, field, value, pattern) => `<div class="field"><label>${label} <b class="req">*</b></label><input class="input identity-field" name="${field}" value="${escapeHTML(value)}" readonly required pattern="${pattern}" aria-readonly="true"></div>`;
  const serviceSelect = se("Select Service", "service", [...D.services.filter((service) => !["Optional", "Others"].includes(service)), "Others"], "Choose service");
  const serviceCustom = `<div class="field hide" id="customServiceField"><label for="customService">Preferred Service <b class="req">*</b></label><input class="input" id="customService" name="customService" maxlength="100" placeholder="Write your preferred service"></div>`;
  const profile = D.profile || {};
  const patientFields = faculty
    ? `<div class="grid2">${identity("Employee Name", "name", profile.name, ".+")}${identity("Employee ID", "id", profile.identifier, "Enter any ID")}${se("Office / Department", "department", E, "Select department")}<div class="field" style="grid-column:1/-1"><label for="faculty-program">Program <span class="muted">(Optional)</span></label><input class="input" id="faculty-program" name="program" type="text" placeholder="Enter your program"></div></div>`
    : `<div class="grid2">${identity("Student ID", "id", profile.identifier, "Enter any ID")}${identity("Full Name", "name", profile.name, ".+")}<div style="grid-column:1/-1">${se("Program", "program", P, "Select your program")}</div>${se("Year Level", "year", ["1st Year", "2nd Year", "3rd Year", "4th Year", "SHS Grade 11", "SHS Grade 12"], "Select year level")}<div class="field"><label>Student Status <b class="req">*</b></label><div class="radios"><label><input type="radio" name="new" value="no" checked> ↩ Continuing</label><label><input type="radio" name="new" value="yes" onchange="$('#advice').classList.remove('hide')"> 🆕 New</label></div></div></div><div id="advice" class="note hide"><b>New Student Advisory</b><br>New students without an active NUIS account will be recorded manually by clinic staff.</div>`;
  return `<main class="content"><div class="booking"><h1 class="title">Appointment Booking</h1><p class="desc">University Health Office · National University Fairview</p><section class="panel"><div class="panelhead"><p>Booking as ${faculty ? "Faculty / Employee" : "Student"}</p></div><div class="gold"></div><form class="form" id="book">${patientFields}<div class="grid3">${dateSelect()}${timeSelect(D.bookingDraft.date || "")}${serviceSelect}</div>${serviceCustom}${fi("Purpose of Visit", "purpose", "text", "Briefly describe your reason for visiting...", false)}<p class="slot-availability" id="slotAvailability" role="status"></p><div class="summary hide" id="summary"></div><button class="primary">Book Appointment</button><p class="foot">By booking, you agree to attend your scheduled appointment on time. Walk-ins remain subject to availability.</p></form></section></div></main>`;
}

function timeSelect(date, selectedTime = "") {
  return `<div class="field"><label>Select Time <b class="req">*</b></label><select class="select" name="time" required><option value="">Choose time</option>${timeOptionMarkup(date, selectedTime)}</select></div>`;
}

function timeOptionMarkup(date, selectedTime = "") {
  return T.map((time) => {
    const blocked = date && isSlotBlocked(date, time);
    const noDoctor = D.blockedSlots.some((slot) => slot.id === slotReservationId(date, time));
    const full = Number(D.slotCounts[slotReservationId(date, time)] || 0)
      >= Number(D.slotCapacities[slotReservationId(date, time)] || D.slotCapacity);
    const suffix = noDoctor ? " — No doctor" : full ? " — Full" : "";
    return `<option value="${escapeHTML(time)}" ${blocked ? "disabled" : ""} ${selectedTime === time ? "selected" : ""}>${escapeHTML(time)}${suffix}</option>`;
  }).join("");
}

function dateSelect() {
  const start = new Date();
  const options = [];
  for (let offset = 0; offset < 60; offset += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const blocked = T.every((time) => D.blockedSlots.some((slot) => slot.id === slotReservationId(value, time)));
    const label = date.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    options.push(`<option value="${value}" ${blocked ? "disabled" : ""}>${escapeHTML(label)}${blocked ? " — No doctor available" : ""}</option>`);
  }
  return `<div class="field"><label>Select Date <b class="req">*</b></label><select class="select" name="date" required><option value="">Choose date</option>${options.join("")}</select></div>`;
}

function isSlotBlocked(date, time) {
  const key = slotReservationId(date, time);
  return D.blockedSlots.some((slot) => slot.id === key)
    || Number(D.slotCounts?.[key] || 0) >= Number(D.slotCapacities?.[key] || D.slotCapacity);
}

function badge(x) {
  return `<span class="badge ${x}">${x}</span>`;
}

function appTable() {
  const q = AP.filter((a) => (D.type === "All" || a[4] === D.type) && (D.status === "All" || a[8] === D.status) && (!D.search || a[1].toLowerCase().includes(D.search.toLowerCase()) || a[2].toLowerCase().includes(D.search.toLowerCase())));
  return `<div class="filters"><input class="input" value="${D.search}" oninput="D.search=this.value;render()" placeholder="Search by name or ID / dept..."><select class="select" onchange="D.type=this.value;render()">${["All", "Student", "Employee"].map((x) => `<option ${D.type === x ? "selected" : ""}>${x === "All" ? "All Types" : x}</option>`).join("")}</select><select class="select" onchange="D.status=this.value;render()">${["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((x) => `<option ${D.status === x ? "selected" : ""}>${x === "All" ? "All Statuses" : x}</option>`).join("")}</select></div><div class="scroll"><table><thead><tr>${["Name", "ID / Dept", "Program", "Date", "Time", "Service", "Status", "Actions"].map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${q.length ? q.map((a) => `<tr><td><div class="person">${a[1]}</div><div class="muted">${a[0]}</div></td><td>${a[2]}</td><td>${a[3]}</td><td>${a[5]}</td><td>${a[6]}</td><td>${a[7]}</td><td>${badge(a[8])}</td><td>${a[8] === "Pending" ? `<button class="act" onclick="setStatus('${a[0]}','Confirmed')">Confirm</button>` : ""}${a[8] === "Confirmed" ? `<button class="act complete" onclick="setStatus('${a[0]}','Completed')">Complete</button>` : ""}${["Pending", "Confirmed"].includes(a[8]) ? `<button class="act cancel" onclick="D.target='${a[0]}';D.modal='cancel';render()">Cancel</button>` : ""}</td></tr>`).join("") : `<tr><td colspan="8" style="text-align:center;padding:50px;color:#9ca3af">No appointments match the current filters.</td></tr>`}</tbody></table></div><div class="panel-foot"><span>Showing ${q.length} of ${AP.length} appointments</span><span>Last synced: ${new Date().toLocaleTimeString()}</span></div>`;
}

function studentTable() {
  return `<div class="info">ℹ️ New students without active NUIS accounts are listed here. Use <b>"Add to NUIS"</b> to manually sync their records once activated.</div><div class="scroll"><table><thead><tr>${["Temp. ID", "Full Name", "Program", "Year Level", "Sync Status", "Action"].map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${NS.map((s) => `<tr><td>${s[0]}</td><td class="person">${s[1]}</td><td>${s[2]}</td><td>${s[3]}</td><td>${badge(s[4])}</td><td>${s[4] === "Pending" ? `<button class="act" onclick="D.target='${s[0]}';D.modal='sync';render()">Add to NUIS</button>` : '<i class="muted">Synced ✓</i>'}</td></tr>`).join("")}</tbody></table></div><div class="panel-foot"><span>${NS.filter((s) => s[4] === "Pending").length} pending sync · ${NS.filter((s) => s[4] === "Synced").length} synced</span></div>`;
}

function modal() {
  if (!D.modal) return "";
  if (D.modal === "terms") {
    return `<div class="backdrop"><section class="modal management-modal terms-modal"><div class="modal-head"><h2>Terms &amp; Conditions and Privacy</h2><p>SynClinic appointment services · NU Fairview</p></div><div class="modal-body terms-copy" tabindex="0" aria-label="Terms and privacy information"><p>SynClinic collects your name, university email address, student or employee ID, contact and academic details you provide, appointment date and time, selected service, and visit purpose to verify your account, schedule and manage clinic visits, and maintain appointment records.</p><p>Your account is authenticated through Firebase Authentication. Appointment and profile data are stored in Firebase services and are available to you and authorized clinic staff for clinic operations. Staff may add clinical remarks and relevant attachments to document a completed appointment. Data should not be used for unrelated purposes.</p><p>Use only your own NU Fairview account and ID, provide accurate information, keep your password private, and contact clinic staff if your information is incorrect. SynClinic uses access controls and secure transport, but no internet service can promise absolute security. The clinic should retain and handle records according to applicable university policies.</p></div><div class="modal-actions terms-actions"><button type="button" class="primary" onclick="confirmTerms()">Confirm</button></div></section></div>`;
  }
  if (D.modal === "services") {
    return `<div class="backdrop"><section class="modal management-modal"><div class="modal-head"><button type="button" class="modal-back" onclick="D.modal='';render()">← Back</button><div><h2>Manage Services</h2><p>Update the services available in appointment forms.</p></div></div><form class="modal-body" id="servicesForm"><div class="service-list">${D.serviceDraft.map((service, index) => `<div class="service-row"><input class="input" name="service" value="${escapeHTML(service)}" aria-label="Service ${index + 1}" maxlength="100" required><button type="button" class="service-remove" data-remove-service="${index}">Remove</button></div>`).join("")}</div><div class="service-add-row"><input class="input" name="newService" maxlength="100" placeholder="Add a service"><button type="button" class="secondary" id="addService">Add</button></div><p class="form-error" id="serviceError" role="alert">${escapeHTML(D.serviceError)}</p><div class="modal-actions"><button type="button" class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary" type="submit">Save Services</button></div></form></section></div>`;
  }
  if (D.modal === "limits") {
    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Set Booking Limits</h2><p>Set the maximum booking count for a specific date and time.</p></div><form class="modal-body" id="limitsForm"><div class="grid2"><label class="field"><span class="profile-label">Date</span><input class="input" name="date" type="date" min="${todayISO()}" required></label>${se("Time", "time", T, "Choose time")}</div><label class="field"><span class="profile-label">Maximum appointments for this date and time</span><input class="input" name="capacity" type="number" min="1" max="500" step="1" value="${D.slotCapacity}" required></label><p class="form-error" id="limitError" role="alert">${escapeHTML(D.limitError)}</p><div class="modal-actions"><button type="button" class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary" type="submit">Save Limit</button></div></form></section></div>`;
  }
  if (D.modal === "noDoctor") {
    const blocked = D.blockedSlots
      .filter((slot) => slot.date >= todayISO())
      .sort((first, second) => first.date.localeCompare(second.date) || timeToMinutes(first.time) - timeToMinutes(second.time));
    const ranges = [];
    blocked.forEach((slot) => {
      const index = T.indexOf(slot.time);
      if (index < 0) return;
      const lastRange = ranges[ranges.length - 1];
      if (lastRange?.date === slot.date && lastRange.endIndex + 1 === index) {
        lastRange.endIndex = index;
      } else {
        ranges.push({ date: slot.date, startIndex: index, endIndex: index });
      }
    });
    return `<div class="backdrop"><section class="modal management-modal"><div class="modal-head"><h2>Mark No-Doctor Availability</h2><p>Choose a start and end time; both times and every appointment slot between them will be blocked.</p></div><form class="modal-body" id="noDoctorForm"><div class="grid2"><label class="field"><span class="profile-label">Date</span><input class="input" name="date" type="date" min="${todayISO()}" required></label>${se("Unavailable From", "startTime", T, "Choose start time")}${se("Unavailable Through", "endTime", T, "Choose end time")}</div><p class="form-error" id="scheduleError" role="alert">${escapeHTML(D.scheduleError)}</p><div class="modal-actions"><button type="button" class="secondary" onclick="D.modal='';render()">Close</button><button class="primary" type="submit">Block Time Range</button></div></form><div class="modal-body"><h3>Current blocks</h3><div class="service-list">${ranges.length ? ranges.map((range) => `<div class="service-row"><span>${escapeHTML(range.date)} · ${escapeHTML(T[range.startIndex])}${range.startIndex === range.endIndex ? "" : ` – ${escapeHTML(T[range.endIndex])}`}</span><button class="service-remove" type="button" data-unblock-date="${escapeHTML(range.date)}" data-unblock-start="${range.startIndex}" data-unblock-end="${range.endIndex}">Doctor is in</button></div>`).join("") : `<p class="muted">No future no-doctor slots are blocked.</p>`}</div></div></section></div>`;
  }
  if (D.modal === "reports") {
    const start = D.reportStart || "";
    const end = D.reportEnd || "";
    const reportAppointments = AP.filter((appointment) =>
      appointment[8] === "Completed"
      && (!start || appointment[5] >= start)
      && (!end || appointment[5] <= end)
      && (!D.reportDate || appointment[5] === D.reportDate)
      && (!D.reportTime || appointment[6] === D.reportTime),
    );
    return `<div class="backdrop"><section class="modal management-modal"><div class="modal-head"><h2>Generate Appointment Report</h2><p>Only completed appointments are included in the CSV.</p></div><form class="modal-body" id="reportForm"><div class="grid2"><label class="field"><span class="profile-label">From</span><input class="input" type="date" name="start" value="${escapeHTML(start)}"></label><label class="field"><span class="profile-label">To</span><input class="input" type="date" name="end" value="${escapeHTML(end)}"></label><label class="field"><span class="profile-label">Exact date (optional)</span><input class="input" type="date" name="reportDate" value="${escapeHTML(D.reportDate || "")}"></label>${se("Exact time (optional)", "reportTime", T, "All times")}</div><p class="report-count">${reportAppointments.length} completed appointment${reportAppointments.length === 1 ? "" : "s"} in report</p><p class="form-error" id="reportError" role="alert">${escapeHTML(D.reportError || (reportAppointments.length ? "" : "No completed appointments match the selected date and time. Report generation is unavailable."))}</p><div class="modal-actions"><button type="button" class="secondary" onclick="D.modal='';render()">Close</button><button class="primary" type="button" onclick="downloadReport()" ${reportAppointments.length ? "" : "disabled"}>Download CSV</button></div></form></section></div>`;
  }
  if (D.modal === "quick")
    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Quick Add Appointment</h2><p>Manually schedule an appointment for a patient.</p></div><form class="modal-body" id="quick"><div class="grid2">${fi("Patient Name", "name", "text", "Full name")}${se("Type", "type", ["New Student", "Continuing Student", "Employee"], "Select type")}${fi("Student ID / Department", "id", "text", "Student or employee ID")}${se("Service", "service", [...D.services.filter((service) => !["Optional", "Others"].includes(service)), "Others"], "Select service")}${fi("Date", "date", "date")}${se("Time", "time", T, "Choose slot")}</div><div class="field hide" id="quickCustomServiceField"><label for="quickCustomService">Preferred Service <b class="req">*</b></label><input class="input" id="quickCustomService" name="customService" maxlength="100" placeholder="Write your preferred service"></div>${fi("Purpose of Visit", "purpose", "text", "Reason for visit...", false)}<div class="modal-actions" style="padding:4px 0 0"><button type="button" class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary">Add Appointment</button></div></form></section></div>`;

  if (D.modal === "complete") {
    const appointment = AP.find((item) => item[0] === D.target);
    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Complete Appointment</h2><p>Doctor's remarks and a PDF or image are required to complete this visit.</p></div><form class="modal-body" id="completionForm"><p><b>${escapeHTML(appointment?.[1] || "Appointment")}</b> · ${escapeHTML(appointment?.[5] || "")} ${escapeHTML(appointment?.[6] || "")}</p><label class="field"><span class="profile-label">Doctor's remarks</span><textarea class="input" name="doctorRemarks" rows="4" maxlength="2000" required placeholder="Document that the appointment is complete and any relevant notes.">${escapeHTML(appointment?.[10] || "")}</textarea></label><label class="field"><span class="profile-label">Attachment (PDF or image)</span><input class="input" type="file" name="attachment" accept="application/pdf,image/*" required></label><p class="hint">Maximum file size: 10 MB.</p><p class="form-error" id="completionError" role="alert">${escapeHTML(D.completionError)}</p><div class="modal-actions"><button type="button" class="secondary" onclick="D.modal='';render()">Cancel</button><button class="primary" type="submit">Save and Complete</button></div></form></section></div>`;
  }

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
    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Confirm Appointment</h2><p>Please review your details before submitting.</p></div><div class="modal-body">${r.map((x) => `<div class="detail"><span>${x[0]}</span><b>${escapeHTML(x[1])}</b></div>`).join("")}</div><div class="modal-actions"><button type="button" class="secondary" onclick="D.modal='';render()">Go Back</button><button id="confirmBooking" class="primary" type="button">Confirm Booking</button></div></section></div>`;
  }

  if (D.modal === "booked" || D.modal === "synced") {
    let b = D.modal === "booked";

    return `<div class="backdrop"><section class="modal"><div class="success"><i>✓</i><h2>${b ? "Appointment Booked!" : "Synced Successfully"}</h2><p>${b ? "Your appointment is pending confirmation from the clinic staff. Please arrive 10 minutes before your scheduled time." : "The student record has been added to the NUIS database. Status updated to Synced."}</p>${b ? `<div class="ref"><small>Reference Number</small><b>${D.ref}</b></div>` : ""}<button class="primary" onclick="D.modal='';render()">Done</button></div></section></div>`;
  }

  if (D.modal === "cancel") {
    let a = AP.find((x) => x[0] === D.target);
    return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Cancel Appointment</h2><p>Choose why this appointment is being cancelled.</p></div><form class="modal-body" id="cancellationForm"><p>Appointment for <b>${escapeHTML(a?.[1] || "this patient")}</b> · ${escapeHTML(a?.[5] || "")} ${escapeHTML(a?.[6] || "")}</p><label class="field"><span class="profile-label">Cancellation reason</span><select class="select" name="cancellationReason" required><option value="">Choose reason</option><option>No show</option><option>Patient asked to cancelled</option><option>Others</option></select></label><label class="field hide" id="cancellationDetailsField"><span class="profile-label">Specific reason</span><textarea class="input" name="cancellationDetails" rows="3" maxlength="500" placeholder="Enter the specific reason"></textarea></label><p class="form-error" id="cancellationError" role="alert">${escapeHTML(D.cancellationError)}</p><div class="modal-actions"><button type="button" class="secondary" onclick="D.modal='';render()">Keep It</button><button class="primary" type="submit">Confirm Cancellation</button></div></form></section></div>`;
  }

  let s = NS.find((x) => x[0] === D.target);
  return `<div class="backdrop"><section class="modal"><div class="modal-head"><h2>Student Record</h2><p>New-student information submitted with the appointment.</p></div><div class="modal-body">${[["Temporary ID", s?.[0]], ["Full Name", s?.[1]], ["Program", s?.[2]], ["Year Level", s?.[3]]].map((x) => `<div class="detail"><span>${x[0]}</span><b>${escapeHTML(x[1])}</b></div>`).join("")}</div><div class="modal-actions"><button class="primary" onclick="D.modal='';render()">Close</button></div></section></div>`;
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function slotReservationId(date, time) {
  return `${date}_${time}`;
}

function slotBookingId(date, time, uid) {
  return `${date}_${time}_${uid}`;
}

function stopSlotReservationListener() {
  if (stopSlotReservation) stopSlotReservation();
  stopSlotReservation = null;
  activeSlotReservationId = "";
}

function updateSlotAvailabilityStatus(date, time, count = Number(D.slotCounts[slotReservationId(date, time)] || 0)) {
  const status = $("#slotAvailability");
  if (!status) return;
  const key = slotReservationId(date, time);
  const capacity = Number(D.slotCapacities[key] || D.slotCapacity);
  const noDoctor = D.blockedSlots.some((slot) => slot.id === key);
  status.textContent = noDoctor
    ? "No doctor is available for this time slot."
    : count >= capacity
      ? "This time slot is full. Please choose another time."
      : `${capacity - count} of ${capacity} appointments available for this time slot.`;
  status.classList.toggle("full", noDoctor || count >= capacity);
}

function watchSlotAvailability(date, time) {
  const status = $("#slotAvailability");
  if (!date || !time || !status) {
    stopSlotReservationListener();
    if (status) status.textContent = "";
    return;
  }

  const reservationId = slotReservationId(date, time);
  if (reservationId === activeSlotReservationId) {
    updateSlotAvailabilityStatus(date, time);
    return;
  }
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
      updateSlotAvailabilityStatus(date, time, count);
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
    appointment[8] === "Completed"
    && (!start || appointment[5] >= start)
    && (!end || appointment[5] <= end)
    && (!D.reportDate || appointment[5] === D.reportDate)
    && (!D.reportTime || appointment[6] === D.reportTime),
  );
  if (!rows.length) {
    D.reportError = "No completed appointments match the selected date and time. There is no report to download.";
    render();
    return;
  }
  const headers = ["Reference ID", "Name", "ID / Department", "Program", "Patient Type", "Date", "Time", "Service", "Status"];
  const csvValue = (value) => {
    let safeValue = String(value ?? "");
    if (/^[\s]*[=+\-@]/.test(safeValue)) safeValue = `'${safeValue}`;
    return `"${safeValue.replace(/"/g, '""')}"`;
  };
  const csv = [headers, ...rows.map((row) => row.slice(0, 9))].map((row) => row.map(csvValue).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `synclinic-appointments-${start || "all"}-to-${end || "all"}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  D.reportError = "";
}

function timeToMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/i.exec(value);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

function sortAppointmentsChronologically(appointments) {
  return appointments.sort((first, second) =>
    first[5].localeCompare(second[5]) || timeToMinutes(first[6]) - timeToMinutes(second[6]),
  );
}

function getFirebaseErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "That email address already has an account.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Choose a password with at least 8 characters.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/user-not-found": "If an account exists for that email, a password reset link will be sent.",
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

function isValidPortalEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setUserSession(user, profile) {
  if (!profile || !["student", "faculty", "staff"].includes(profile.role)) {
    throw new Error("This account does not have a valid SynClinic role.");
  }
  if (IS_STAFF_PORTAL !== (profile.role === "staff")) {
    throw new Error(IS_STAFF_PORTAL
      ? "This is not a clinic staff account. Sign in through the student and faculty site."
      : "Clinic staff accounts must sign in through the staff portal.");
  }
  if (!isValidPortalEmail(user?.email || "")) {
    throw new Error("This account has an invalid email address.");
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
  if (stopSlotReservations) stopSlotReservations();
  if (stopBlockedSlots) stopBlockedSlots();
  if (stopSlotLimits) stopSlotLimits();
  stopAppointments = null;
  stopNewStudents = null;
  stopClinicSettings = null;
  stopSlotReservations = null;
  stopBlockedSlots = null;
  stopSlotLimits = null;
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

  const throughDate = new Date();
  throughDate.setDate(throughDate.getDate() + 60);
  const throughDateISO = `${throughDate.getFullYear()}-${String(throughDate.getMonth() + 1).padStart(2, "0")}-${String(throughDate.getDate()).padStart(2, "0")}`;
  const upcomingSlots = (name) => query(
    collection(db, name),
    where("date", ">=", todayISO()),
    where("date", "<=", throughDateISO),
  );
  stopSlotReservations = onSnapshot(
    upcomingSlots("slotReservations"),
    (snapshot) => {
      D.slotCounts = Object.fromEntries(snapshot.docs.map((item) => [
        item.id,
        Number(item.data().count) || 0,
      ]));
      render();
    },
    (error) => {
      D.dataError = getFirebaseErrorMessage(error);
      render();
    },
  );
  stopBlockedSlots = onSnapshot(
    upcomingSlots("blockedSlots"),
    (snapshot) => {
      D.blockedSlots = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      render();
    },
    (error) => {
      D.dataError = getFirebaseErrorMessage(error);
      render();
    },
  );
  stopSlotLimits = onSnapshot(
    upcomingSlots("slotLimits"),
    (snapshot) => {
      D.slotLimits = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      D.slotCapacities = Object.fromEntries(snapshot.docs.map((item) => [
        item.id,
        Number(item.data().capacity) || D.slotCapacity,
      ]));
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
      AP = sortAppointmentsChronologically(snapshot.docs.map((item) => {
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
          appointment.purpose || "",
          appointment.doctorRemarks || "",
          appointment.attachmentPath || "",
          appointment.cancellationReason || "",
          appointment.cancellationDetails || "",
        ];
      }));
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

    if (D.screen === "forgot") {
      try {
        await sendPasswordResetEmail(firebaseAuth, email);
      } catch (error) {
        if (error?.code !== "auth/user-not-found") throw error;
      }
      D.screen = "login";
      D.notice = "If an account exists for that email, a secure password reset link has been sent.";
      return;
    }

    if (D.screen === "signup") {
      const identifier = String(formData.get("id") || "").trim();
      if (!identifier) {
        throw new Error("Enter your ID.");
      }
      const hasExistingAuthUser = !!currentUser && currentUser.email?.toLowerCase() === email;
      if (IS_STAFF_PORTAL && currentUser && !hasExistingAuthUser) {
        throw new Error("Sign out of the other account before registering this staff account.");
      }
      const profile = {
        name: String(formData.get("name") || "").trim(),
        email,
        username: String(formData.get("username") || "").trim(),
        identifier: String(formData.get("id") || "").trim(),
        role: D.ar,
        createdAt: serverTimestamp(),
      };

      if (IS_STAFF_PORTAL) {
        if (hasExistingAuthUser) {
          await setDoc(doc(db, "users", currentUser.uid), profile);
          setUserSession(currentUser, profile);
          D.notice = "Your clinic staff account is ready.";
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
        D.notice = "Clinic staff account created successfully. Sign in to continue.";
        return;
      }

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

    if (!isValidPortalEmail(email)) {
      throw new Error("Enter a valid email address.");
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
    const date = String(values.date || "");
    const time = String(values.time || "");
    if (!date || !time || !T.includes(time)) {
      throw new Error("Choose an available appointment date and time.");
    }
    if (!quickAdd && (!D.user || !D.profile || !["student", "faculty"].includes(D.role))) {
      throw new Error("Sign in with a student or faculty / employee account to book.");
    }
    const service = String(values.service || "").trim() === "Others"
      ? String(values.customService || "").trim()
      : String(values.service || "").trim();
    if (!service) throw new Error("Select a service or enter your preferred service.");
    const appointmentRef = doc(collection(db, "appointments"));
    const reservationRef = doc(db, "slotReservations", slotReservationId(date, time));
    const isStudent = quickAdd ? values.type !== "Employee" : D.role === "student";
    const identityName = quickAdd ? String(values.name || "").trim() : D.profile.name;
    const identityNumber = quickAdd ? String(values.id || "").trim() : D.profile.identifier;
    if (!quickAdd && (
      String(values.name || "").trim() !== identityName
      || String(values.id || "").trim() !== identityNumber
    )) {
      throw new Error("Booking name and ID must match your signed-in SynClinic profile.");
    }
    if (isSlotBlocked(date, time)) {
      throw new Error("That date and time is unavailable. Please choose an open slot.");
    }
    const newStudent = quickAdd
      ? values.type === "New Student"
      : isStudent && values.new === "yes";
    const appointment = {
      referenceId: appointmentRef.id,
      ownerUid: D.user.uid,
      createdByUid: D.user.uid,
      name: identityName,
      identifier: identityNumber,
      program: String(values.program || "-"),
      department: isStudent ? "" : String(values.department || ""),
      year: isStudent ? String(values.year || "") : "",
      patientType: isStudent ? "Student" : "Employee",
      date,
      time,
      service,
      purpose: String(values.purpose || "").trim(),
      status: "Pending",
      newStudent,
      createdAt: serverTimestamp(),
    };
    const newStudentRef = newStudent ? doc(collection(db, "newStudents")) : null;
    await runTransaction(db, async (transaction) => {
      const settingsSnapshot = await transaction.get(doc(db, "clinicSettings", "general"));
      const reservationSnapshot = await transaction.get(reservationRef);
      const slotLimitRef = doc(db, "slotLimits", slotReservationId(date, time));
      const blockedSlotRef = doc(db, "blockedSlots", slotReservationId(date, time));
      const limitSnapshot = await transaction.get(slotLimitRef);
      const blockSnapshot = await transaction.get(blockedSlotRef);
      const bookingLockRef = !quickAdd
        ? doc(db, "slotBookings", slotBookingId(date, time, D.user.uid))
        : null;
      const bookingLockSnapshot = bookingLockRef
        ? await transaction.get(bookingLockRef)
        : null;
      const reservation = reservationSnapshot.exists() ? reservationSnapshot.data() : {};
      const count = Number(reservation.count) || 0;
      const configuredCapacity = settingsSnapshot.data()?.slotCapacity;
      const capacitySetting = limitSnapshot.exists() ? limitSnapshot.data().capacity : configuredCapacity;
      const capacity = Number.isInteger(capacitySetting) && capacitySetting > 0
        ? capacitySetting
        : 5;
      if (blockSnapshot.exists()) {
        throw new Error("No doctor is available for that date and time.");
      }
      if (bookingLockSnapshot?.exists()) {
        throw new Error("You already have an appointment for this date and time.");
      }
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
      if (bookingLockRef) {
        transaction.set(bookingLockRef, {
          ownerUid: D.user.uid,
          appointmentId: appointmentRef.id,
          date,
          time,
          createdAt: serverTimestamp(),
        });
      }

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
    D.bookingDraft = {};
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

async function setStatus(id, status, details = {}) {
  if (status === "Completed" && (!details.doctorRemarks?.trim() || !details.attachmentPath)) {
    D.dataError = "Add the doctor's completion remarks and a PDF or image attachment before completing this appointment.";
    render();
    return;
  }
  if (status === "Cancelled" && (
    !["No show", "Patient asked to cancelled", "Others"].includes(details.cancellationReason)
    || (details.cancellationReason === "Others" && !details.cancellationDetails?.trim())
  )) {
    D.dataError = "Choose a cancellation reason and specify it when you select Others.";
    render();
    return;
  }
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
        && status === "Cancelled";
      const bookingLockRef = status === "Cancelled"
        ? doc(db, "slotBookings", slotBookingId(appointment.date, appointment.time, appointment.ownerUid))
        : null;
      const reservationSnapshot = releasesSlot
        ? await transaction.get(reservationRef)
        : null;
      const bookingLockSnapshot = bookingLockRef
        ? await transaction.get(bookingLockRef)
        : null;
      const update = {
        status,
        updatedAt: serverTimestamp(),
      };
      if (status === "Completed") {
        update.doctorRemarks = details.doctorRemarks.trim();
        update.attachmentPath = details.attachmentPath;
      }
      if (status === "Cancelled") {
        update.cancellationReason = details.cancellationReason;
        update.cancellationDetails = details.cancellationReason === "Others"
          ? details.cancellationDetails.trim()
          : "";
      }
      transaction.update(appointmentRef, update);
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
      if (bookingLockRef && bookingLockSnapshot?.exists()) {
        transaction.delete(bookingLockRef);
      }
    });
    D.modal = "";
    D.dataError = "";
    D.completionError = "";
    D.cancellationError = "";
  } catch (error) {
    D.dataError = getFirebaseErrorMessage(error);
    render();
    return false;
  }
  render();
  return true;
}

async function completeAppointment(form) {
  const formData = new FormData(form);
  const file = formData.get("attachment");
  const doctorRemarks = String(formData.get("doctorRemarks") || "").trim();
  if (!(file instanceof File) || !file.size || !doctorRemarks) {
    D.completionError = "Add the doctor's remarks and choose a PDF or image attachment.";
    render();
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    D.completionError = "The attachment must be 10 MB or smaller.";
    render();
    return;
  }
  if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
    D.completionError = "Only PDF and image attachments are accepted.";
    render();
    return;
  }
  const id = D.target;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
  const path = `appointments/${id}/${Date.now()}-${safeName}`;
  const attachmentRef = storageRef(storage, path);
  try {
    await uploadBytes(attachmentRef, file, {
      contentType: file.type,
      customMetadata: { appointmentId: id },
    });
    const succeeded = await setStatus(id, "Completed", { doctorRemarks, attachmentPath: path });
    if (!succeeded) {
      await deleteObject(attachmentRef);
      return;
    }
  } catch (error) {
    D.completionError = getFirebaseErrorMessage(error);
    D.dataError = D.completionError;
    render();
  }
}

async function openAttachment(path) {
  if (!path) return;
  try {
    const blob = await getBlob(storageRef(storage, path));
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = path.split("/").pop() || "appointment-attachment";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    D.dataError = getFirebaseErrorMessage(error);
    render();
  }
}

async function logout() {
  D.busy = true;
  try {
    await signOut(firebaseAuth);
    stopSlotReservationListener();
    if (stopAppointments) stopAppointments();
    if (stopNewStudents) stopNewStudents();
    if (stopClinicSettings) stopClinicSettings();
    if (stopSlotReservations) stopSlotReservations();
    if (stopBlockedSlots) stopBlockedSlots();
    if (stopSlotLimits) stopSlotLimits();
    stopAppointments = null;
    stopNewStudents = null;
    stopClinicSettings = null;
    stopSlotReservations = null;
    stopBlockedSlots = null;
    stopSlotLimits = null;
    D.services = [...S];
    D.slotCapacity = 5;
    D.blockedSlots = [];
    D.slotLimits = [];
    D.slotCounts = {};
    D.slotCapacities = {};
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
      <td>${escapeHTML(appointment[7])}</td><td>${badge(escapeHTML(appointment[8]))}${appointment[8] === "Completed" ? `<div class="muted completion-note">${escapeHTML(appointment[10])}</div><button class="act" type="button" onclick="openAttachment('${escapeHTML(appointment[11])}')">View attachment</button>` : ""}</td>
      <td>${appointment[8] === "Pending" ? `<button class="act" onclick="setStatus('${escapeHTML(appointment[0])}','Confirmed')">Confirm</button>` : ""}
      ${appointment[8] === "Confirmed" ? `<button class="act complete" onclick="D.target='${escapeHTML(appointment[0])}';D.modal='complete';D.completionError='';render()">Complete</button>` : ""}
      ${["Pending", "Confirmed"].includes(appointment[8]) ? `<button class="act cancel" onclick="D.target='${escapeHTML(appointment[0])}';D.modal='cancel';D.cancellationError='';render()">Cancel</button>` : ""}</td>
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
    D.status = "Confirmed";
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
  return `<div class="info">New-student details submitted with appointments. This app does not connect to the university NUIS system.</div><div class="scroll"><table><thead><tr>${["Record ID", "Full Name", "Program", "Year Level"].map((heading) => `<th>${heading}</th>`).join("")}</tr></thead><tbody>${NS.length ? NS.map((student) => `<tr><td>${escapeHTML(student[0])}</td><td class="person">${escapeHTML(student[1])}</td><td>${escapeHTML(student[2])}</td><td>${escapeHTML(student[3])}</td></tr>`).join("") : `<tr><td colspan="4" style="text-align:center;padding:50px;color:#9ca3af">No new-student records.</td></tr>`}</tbody></table></div><div class="panel-foot"><span>${NS.length} new-student record${NS.length === 1 ? "" : "s"}</span></div>`;
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
    ["Sex", "sex", profile.sex || "", "select"],
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
          ${type === "select"
            ? `<select class="select profile-input" id="profile-${name}" name="${name}"><option value="">Select an option</option>${["Male", "Female", "Preferred not to say"].map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`).join("")}</select>`
            : `<input class="input profile-input" id="profile-${name}" name="${name}" type="${type}" value="${escapeHTML(value)}" ${["name", "username"].includes(name) ? "required" : ""} ${name === "age" ? 'min="0" step="1"' : ""}>`}
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
  const todaysAppointments = AP.filter((appointment) =>
    appointment[5] === today && appointment[8] === "Confirmed",
  );
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
  return `<main class="content"><div class="dash-head"><div><h1 class="title">Clinic Staff Dashboard</h1><p class="desc">● Real-time appointment monitoring · <span id="dashboardClock">${new Date().toLocaleString("en-PH")}</span></p></div><div class="dash-head-actions"><button class="primary quick" onclick="D.modal='quick';render()">＋ Quick Add Appointment</button><button class="secondary" onclick="D.scheduleError='';D.modal='noDoctor';render()">Doctor unavailable</button></div></div><div class="stats">${cards.map((card, index) => `<button type="button" class="stat stat-click" style="background:${card[2]};color:${card[3]}" onclick="openDashboardStat('${statKeys[index]}')" aria-label="View ${escapeHTML(card[1])}: ${counts[index]}"><i>${card[0]}</i><span><b>${counts[index]}</b><small>${card[1]}</small></span></button>`).join("")}</div><div class="actions"><button class="action" onclick="D.serviceDraft=[...D.services];D.serviceError='';D.modal='services';render()">⚙️ Manage Services</button><button class="action" onclick="D.limitError='';D.modal='limits';render()">🔒 Set Booking Limits</button><button class="action" onclick="D.reportStart='';D.reportEnd='';D.reportDate='';D.reportTime='';D.reportError='';D.modal='reports';render()">📊 Generate Reports</button><button class="action" disabled title="Connect NUIS credentials and API before enabling sync">🔄 NUIS integration unavailable</button><button class="action" onclick="D.tab='students';render()">🆕 New Student Records</button></div><section class="panel" id="dashboardRecords"><div class="tabs"><button class="${D.tab === "apps" ? "on" : ""}" onclick="D.tab='apps';render()">All Appointments <span class="count">${AP.length}</span></button><button class="${D.tab === "students" ? "on" : ""}" onclick="D.tab='students';render()">New Students <span class="count">${NS.length}</span></button></div>${D.tab === "apps" ? liveAppTable() : liveStudentTable()}</section></main>`;
}

function render() {
  if (!D.authReady) {
    A.innerHTML = `<main class="content"><section class="panel"><p>Restoring your session…</p></section></main>`;
    return;
  }
  if (D.authRestoreError) {
    A.innerHTML = `<main class="content"><section class="panel"><h1 class="title">Unable to restore your session</h1><p class="desc">${escapeHTML(D.authRestoreError)}</p><button class="primary" type="button" onclick="retrySessionRestore()">Retry</button> <button class="secondary" type="button" onclick="logout()">Sign Out</button></section></main>`;
    return;
  }
  const currentBooking = D.role && $("#book")
    ? Object.fromEntries(new FormData($("#book")).entries())
    : null;
  if (currentBooking) D.bookingDraft = { ...D.bookingDraft, ...currentBooking };
  const currentAuth = !D.role && $("#auth") && D.authDraftScreen === D.screen
    ? [...$("#auth").elements].reduce((draft, field) => {
      if (field.name && !["password", "confirm"].includes(field.name)) {
        draft[field.name] = field.type === "checkbox" ? field.checked : field.value;
      }
      return draft;
    }, {})
    : null;
  if (currentAuth) D.authDraft = { ...D.authDraft, ...currentAuth };
  if (!D.role && !$("#auth")) D.authDraftScreen = D.screen;

  A.innerHTML = D.role
    ? header() + (D.role === "staff" && D.view === "dash"
      ? dash()
      : D.view === "profile"
        ? profileDashboard()
        : D.view === "history" && D.role !== "staff"
          ? bookingHistory()
          : booking()) + modal()
    : auth() + modal();

  if (!D.role && D.authDraftScreen !== D.screen) {
    D.authDraft = {};
    D.authDraftScreen = D.screen;
  }
  if (currentAuth && D.authDraftScreen === D.screen) {
    Object.entries(D.authDraft).forEach(([name, value]) => {
      const field = $("#auth")?.elements.namedItem(name);
      if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else if (!["password", "confirm"].includes(name)) field.value = String(value);
    });
  }
  if (D.role && D.view === "booking") {
    Object.entries(D.bookingDraft).forEach(([name, value]) => {
      const field = $("#book")?.elements.namedItem(name);
      if (field && !["date", "time"].includes(name)) field.value = String(value);
    });
    const dateField = $("#book")?.elements.namedItem("date");
    if (dateField && D.bookingDraft.date) dateField.value = D.bookingDraft.date;
    const timeField = $("#book")?.elements.namedItem("time");
    if (timeField && D.bookingDraft.time) timeField.value = D.bookingDraft.time;
    const serviceField = $("#book")?.elements.namedItem("service");
    const customField = $("#customServiceField");
    if (serviceField && customField) {
      customField.classList.toggle("hide", serviceField.value !== "Others");
      const customInput = customField.querySelector("input");
      if (customInput) customInput.required = serviceField.value === "Others";
    }
  }

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
      a.querySelector(".caption")?.classList.add("hide");
      a.querySelector(".roles")?.classList.add("hide");
      a.querySelector(".hint")?.classList.add("hide");
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

      if (D.screen === "login" || D.screen === "forgot") {
        if (!formData.get("email")?.trim()) {
          markInvalid("email", "No Email Address.");
        }
        if (D.screen === "login" && !formData.get("password")) {
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
    const refreshSelectedTime = () => {
      const selectedTime = b.querySelector('[name="time"]').value;
      const replacement = document.createElement("select");
      replacement.className = "select";
      replacement.name = "time";
      replacement.required = true;
      replacement.innerHTML = `<option value="">Choose time</option>${timeOptionMarkup(dateInput.value, selectedTime)}`;
      if (replacement.selectedOptions[0]?.disabled) replacement.value = "";
      b.querySelector('[name="time"]').replaceWith(replacement);
      D.bookingDraft = Object.fromEntries(new FormData(b).entries());
      replacement.addEventListener("change", () => {
        D.bookingDraft = Object.fromEntries(new FormData(b).entries());
        updateSlotAvailability();
      });
    };
    const updateSlotAvailability = () => watchSlotAvailability(
      dateInput.value,
      b.querySelector('[name="time"]').value,
    );
    const serviceInput = b.querySelector('[name="service"]');
    const customServiceField = $("#customServiceField");
    const toggleCustomService = () => {
      const custom = serviceInput.value === "Others";
      customServiceField?.classList.toggle("hide", !custom);
      const customInput = customServiceField?.querySelector("input");
      if (customInput) customInput.required = custom;
    };
    dateInput.addEventListener("change", () => {
      refreshSelectedTime();
      D.bookingDraft = Object.fromEntries(new FormData(b).entries());
      updateSlotAvailability();
    });
    serviceInput.addEventListener("change", () => {
      toggleCustomService();
      D.bookingDraft = Object.fromEntries(new FormData(b).entries());
    });
    b.addEventListener("input", () => {
      D.bookingDraft = Object.fromEntries(new FormData(b).entries());
    });
    b.querySelector('[name="time"]').addEventListener("change", updateSlotAvailability);
    toggleCustomService();
    updateSlotAvailability();
    b.onsubmit = (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(b).entries());
      if (values.name !== D.profile?.name || values.id !== D.profile?.identifier) {
        D.dataError = "Your booking name and ID must match the signed-in profile.";
        render();
        return;
      }
      if (isSlotBlocked(values.date, values.time)) {
        D.dataError = "That date and time is full or has no doctor available. Choose an available slot.";
        render();
        return;
      }
      values.service = values.service === "Others" ? values.customService : values.service;
      if (!String(values.service || "").trim()) {
        D.dataError = "Choose a service or enter your preferred service.";
        render();
        return;
      }
      D.bookingDraft = Object.fromEntries(new FormData(b).entries());
      D.pendingBooking = values;
      D.modal = "confirm";
      render();
    };
  }

  if (q) {
    const dateInput = q.querySelector('[name="date"]');
    const serviceInput = q.querySelector('[name="service"]');
    const customServiceField = $("#quickCustomServiceField");
    const toggleQuickCustomService = () => {
      const custom = serviceInput.value === "Others";
      customServiceField.classList.toggle("hide", !custom);
      customServiceField.querySelector("input").required = custom;
    };
    serviceInput.addEventListener("change", toggleQuickCustomService);
    toggleQuickCustomService();
    if (dateInput) dateInput.min = todayISO();
    q.onsubmit = (event) => {
      event.preventDefault();
      createAppointment(Object.fromEntries(new FormData(q).entries()), true);
    };
  }

  const confirmBooking = $("#confirmBooking");
  if (confirmBooking) {
    confirmBooking.addEventListener("click", () => createAppointment(D.pendingBooking));
  }

  const completionForm = $("#completionForm");
  if (completionForm) {
    completionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      completeAppointment(completionForm);
    });
  }

  const cancellationForm = $("#cancellationForm");
  if (cancellationForm) {
    const reason = cancellationForm.elements.namedItem("cancellationReason");
    const details = cancellationForm.elements.namedItem("cancellationDetails");
    const detailsField = $("#cancellationDetailsField");
    reason.addEventListener("change", () => {
      const others = reason.value === "Others";
      detailsField.classList.toggle("hide", !others);
      details.required = others;
    });
    cancellationForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(cancellationForm).entries());
      const succeeded = await setStatus(D.target, "Cancelled", values);
      if (succeeded) D.modal = "";
    });
  }

  A.querySelectorAll("[data-unblock-date]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const startIndex = Number(button.dataset.unblockStart);
        const endIndex = Number(button.dataset.unblockEnd);
        if (!Number.isInteger(startIndex) || !Number.isInteger(endIndex) || startIndex < 0 || endIndex >= T.length || startIndex > endIndex) {
          D.scheduleError = "The selected unavailable time range is invalid. Refresh and try again.";
          render();
          return;
        }
        const batch = writeBatch(db);
        T.slice(startIndex, endIndex + 1).forEach((time) => {
          batch.delete(doc(db, "blockedSlots", slotReservationId(button.dataset.unblockDate, time)));
        });
        await batch.commit();
        D.scheduleError = "";
      } catch (error) {
        D.scheduleError = getFirebaseErrorMessage(error);
      }
      render();
    });
  });

  const noDoctorForm = $("#noDoctorForm");
  if (noDoctorForm) {
    noDoctorForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(noDoctorForm).entries());
      const startIndex = T.indexOf(values.startTime);
      const endIndex = T.indexOf(values.endTime);
      if (startIndex < 0 || endIndex < 0 || startIndex > endIndex) {
        D.scheduleError = "Choose a valid start and end time. The end time must be at or after the start time.";
        render();
        return;
      }
      try {
        const batch = writeBatch(db);
        T.slice(startIndex, endIndex + 1).forEach((time) => {
          batch.set(doc(db, "blockedSlots", slotReservationId(values.date, time)), {
            date: values.date,
            time,
            updatedAt: serverTimestamp(),
            updatedBy: D.user.uid,
          });
        });
        await batch.commit();
        D.scheduleError = "";
        D.modal = "";
      } catch (error) {
        D.scheduleError = getFirebaseErrorMessage(error);
      }
      render();
    });
  }

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

  if (limitsForm) {
    limitsForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(limitsForm).entries());
      const capacity = Number(values.capacity);
      if (!values.date || !T.includes(values.time) || !Number.isInteger(capacity) || capacity < 1 || capacity > 500) {
        D.limitError = "Enter a whole number between 1 and 500.";
        render();
        return;
      }
      try {
        const id = slotReservationId(values.date, values.time);
        await setDoc(doc(db, "slotLimits", id), {
          date: values.date,
          time: values.time,
          capacity,
          updatedAt: serverTimestamp(),
          updatedBy: D.user.uid,
        });
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
      D.reportDate = String(formData.get("reportDate") || "");
      D.reportTime = String(formData.get("reportTime") || "");
      D.reportError = "";
      render();
    });
  }

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

function togglePassword(button) {
  const input = button.parentElement.querySelector("input");
  if (!input) return;
  const showPassword = input.type === "password";
  input.type = showPassword ? "text" : "password";
  button.textContent = showPassword ? "🙈" : "👁";
  button.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
}

async function restoreSession(user) {
  D.busy = true;
  D.authRestoreError = "";
  try {
    const snapshot = await getDoc(doc(db, "users", user.uid));
    if (!snapshot.exists()) {
      if (IS_STAFF_PORTAL) {
        D.notice = "Complete your staff profile to continue.";
        D.screen = "signup";
        D.user = user;
        D.profile = null;
        D.role = "";
        return;
      }
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
    D.authRestoreError = errorMessage;
  } finally {
    D.busy = false;
    D.authReady = true;
    render();
  }
}

function retrySessionRestore() {
  if (firebaseAuth.currentUser) {
    restoreSession(firebaseAuth.currentUser);
    return;
  }
  D.authRestoreError = "";
  D.authReady = true;
  render();
}

window.D = D;
window.$ = $;
window.render = render;
window.logout = logout;
window.togglePassword = togglePassword;
window.openTerms = openTerms;
window.confirmTerms = confirmTerms;
window.retrySessionRestore = retrySessionRestore;
window.setStatus = setStatus;
window.downloadReport = downloadReport;
window.openDashboardStat = openDashboardStat;
window.openAttachment = openAttachment;

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
    if (stopSlotReservations) stopSlotReservations();
    if (stopBlockedSlots) stopBlockedSlots();
    if (stopSlotLimits) stopSlotLimits();
    stopAppointments = null;
    stopNewStudents = null;
    stopClinicSettings = null;
    stopSlotReservations = null;
    stopBlockedSlots = null;
    stopSlotLimits = null;
    D.services = [...S];
    D.slotCapacity = 5;
    D.blockedSlots = [];
    D.slotLimits = [];
    D.slotCounts = {};
    D.slotCapacities = {};
    D.user = null;
    D.profile = null;
    D.role = "";
    D.profileEditing = false;
    D.notice = "";
    D.dataError = "";
    D.authRestoreError = "";
    D.authReady = true;
    AP = [];
    NS = [];
    render();
  }
});

render();