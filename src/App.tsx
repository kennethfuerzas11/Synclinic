import { useEffect, useState } from 'react'

type AuthScreen = 'login' | 'signup'
type LoggedInAs = 'student' | 'faculty' | 'staff' | null
type UserType = 'student' | 'faculty'
type View = 'booking' | 'dashboard'
type AppStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
type SyncStatus = 'Pending' | 'Synced'
type ModalKind = 'confirmBook' | 'successBook' | 'cancelAppt' | 'syncNuis' | 'syncSuccess' | null


interface Appointment {
  id: string
  name: string
  idOrDept: string
  program: string
  type: 'Student' | 'Employee'
  date: string
  time: string
  service: string
  status: AppStatus
  purpose: string
}

interface NewStudent {
  tempId: string
  fullName: string
  program: string
  yearLevel: string
  purpose: string
  syncStatus: SyncStatus
}

// ── Data ──────────────────────────────────────────────────────────────────────

const PROGRAMS = [
  'SHS BUEN_MA – Management and Accountancy',
  'SHS STEM_CT – Computing Technologies',
  'SHS STEM_CA – Engineering and Architecture',
  'SHS STEM_SAH – Science and Allied Health',
  'SHS AHSS_EASS – Education, Arts and Social Sciences',
  'BA Communication',
  'BS Architecture',
  'BS Accountancy',
  'BSBA Financial Management',
  'BSBA Marketing Management',
  'BS Civil Engineering',
  'BS Computer Engineering',
  'BS Information Technology',
  'BS Hospitality Management',
  'BS Tourism Management',
  'BS Psychology',
]

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'SHS Grade 11', 'SHS Grade 12']

const DEPARTMENTS = [
  'Office of the Registrar', 'Human Resources', 'Finance Department',
  'IT Department', 'Library Services', 'Guidance Office',
  'Student Affairs Office', 'Physical Education Department',
  'School of Business and Accountancy', 'School of Engineering and Technology', 'School of Tourism and Hospitality Management', 'Senior High School','School of Arts and Sciences', 
  'School of Architecture', 'Office of the President', 'Quality Assurance Office', 'Administration Office',
]

const SERVICES = [
  'General Consultation',
  'Dental Check-up',
  'Vaccination / Immunization',
  'Medical Certificate',
  'Blood Pressure Monitoring',
  'First Aid / Wound Care',
  'Mental Health Consultation',
  'Laboratory Request',
  'Annual Physical Exam',
]

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
]

const SAMPLE_APPOINTMENTS: Appointment[] = [
  { id: 'STU-2024-001', name: 'Maria Santos', idOrDept: '2021-10234', program: 'BS Architecture', type: 'Student', date: '2024-08-09', time: '09:00 AM', service: 'General Consultation', status: 'Confirmed', purpose: 'Fever and headache for 2 days' },
  { id: 'STU-2024-002', name: 'Juan dela Cruz', idOrDept: '2022-08712', program: 'BS Information Technology', type: 'Student', date: '2024-08-09', time: '09:30 AM', service: 'Medical Certificate', status: 'Pending', purpose: 'Medical clearance for internship' },
  { id: 'EMP-2024-003', name: 'Prof. Liza Reyes', idOrDept: 'School of Engineering and Technology', program: '—', type: 'Employee', date: '2024-08-09', time: '10:00 AM', service: 'Blood Pressure Monitoring', status: 'Completed', purpose: 'Routine health monitoring' },
  { id: 'STU-2024-004', name: 'Carlo Mendoza', idOrDept: '2023-05431', program: 'BS Architecture', type: 'Student', date: '2024-08-09', time: '10:30 AM', service: 'Dental Check-up', status: 'Cancelled', purpose: 'Toothache and sensitivity' },
  { id: 'EMP-2024-005', name: 'Dr. Ramon Flores', idOrDept: 'IT Department', program: '—', type: 'Employee', date: '2024-08-09', time: '11:00 AM', service: 'General Consultation', status: 'Pending', purpose: 'Annual physical exam' },
  { id: 'STU-2024-006', name: 'Ana Villanueva', idOrDept: '2021-11089', program: 'BS Psychology', type: 'Student', date: '2024-08-09', time: '01:00 PM', service: 'Mental Health Consultation', status: 'Confirmed', purpose: 'Anxiety and academic stress' },
  { id: 'STU-2024-007', name: 'Kevin Ramos', idOrDept: '2022-09345', program: 'SHS STEM_CT – Computing Technologies', type: 'Student', date: '2024-08-09', time: '01:30 PM', service: 'First Aid / Wound Care', status: 'Pending', purpose: 'Laceration on right hand' },
  { id: 'EMP-2024-008', name: 'Ms. Christine Tan', idOrDept: 'Guidance Office', program: '—', type: 'Employee', date: '2024-08-09', time: '02:00 PM', service: 'Vaccination / Immunization', status: 'Confirmed', purpose: 'Flu vaccine' },
]

const SAMPLE_NEW_STUDENTS: NewStudent[] = [
  { tempId: 'TEMP-2024-001', fullName: 'Bianca Torres', program: 'BS Information Technology', yearLevel: '1st Year', purpose: 'General check-up before enrollment', syncStatus: 'Pending' },
  { tempId: 'TEMP-2024-002', fullName: 'Rafael Aquino', program: 'SHS STEM_CA – Engineering and Architecture', yearLevel: 'SHS Grade 11', purpose: 'Medical clearance', syncStatus: 'Pending' },
  { tempId: 'TEMP-2024-003', fullName: 'Sophia Lim', program: 'BS Psychology', yearLevel: '1st Year', purpose: 'Mental health intake consultation', syncStatus: 'Synced' },
  { tempId: 'TEMP-2024-004', fullName: 'Miguel Santos', program: 'SHS BUEN_MA – Management and Accountancy', yearLevel: 'SHS Grade 11', purpose: 'Vaccination record update', syncStatus: 'Pending' },
]

// ── Shared style tokens ───────────────────────────────────────────────────────

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/25 focus:border-[#003366] transition-all placeholder:text-gray-400'
const selectCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/25 focus:border-[#003366] transition-all appearance-none cursor-pointer'

// ── Small shared components ───────────────────────────────────────────────────

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-[#003366] mb-1.5 tracking-wide uppercase">
      {text}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
  )
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
    </div>
  )
}

function StatusBadge({ status }: { status: AppStatus }) {
  const cfg: Record<AppStatus, string> = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-red-50 text-red-600 border-red-200',
  }
  const dot: Record<AppStatus, string> = {
    Pending: 'bg-amber-400', Confirmed: 'bg-blue-500',
    Completed: 'bg-emerald-500', Cancelled: 'bg-red-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot[status]}`} />
      {status}
    </span>
  )
}

function SyncBadge({ status }: { status: SyncStatus }) {
  return status === 'Synced'
    ? <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Synced</span>
    : <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />Pending Sync</span>
}

// ── Modals ────────────────────────────────────────────────────────────────────

function ModalShell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,30,60,0.55)', backdropFilter: 'blur(2px)' }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden ${wide ? 'max-w-lg' : 'max-w-md'}`}>
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #003366 0%, #00509E 100%)' }} className="px-6 py-4">
      <h2 className="text-white font-bold text-lg">{title}</h2>
      {sub && <p className="text-blue-200 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-800 text-xs font-semibold text-right max-w-[55%]">{value}</span>
    </div>
  )
}

function ConfirmBookModal({ open, onConfirm, onBack, data, userType }: {
  open: boolean; onConfirm: () => void; onBack: () => void
  data: Record<string, string>; userType: UserType
}) {
  if (!open) return null
  return (
    <ModalShell>
      <ModalHeader title="Confirm Appointment" sub="Please review your details before submitting." />
      <div className="px-6 pt-5 pb-2 space-y-0.5">
        {userType === 'student' ? (
          <>
            <DetailRow label="Student ID" value={data.studentId} />
            <DetailRow label="Full Name" value={data.fullName} />
            <DetailRow label="Program" value={data.program} />
            <DetailRow label="Year Level" value={data.yearLevel} />
            <DetailRow label="Status" value={data.studentStatus} />
          </>
        ) : (
          <>
            <DetailRow label="Employee Name" value={data.employeeName} />
            <DetailRow label="Department" value={data.department} />
          </>
        )}
        <DetailRow label="Date" value={data.date} />
        <DetailRow label="Time" value={data.time} />
        <DetailRow label="Service" value={data.service} />
        <DetailRow label="Purpose" value={data.purpose} />
      </div>
      {userType === 'student' && data.studentStatus === 'New Student' && (
        <div className="mx-6 mb-2 mt-1 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800">
          <strong>Note:</strong> As a new student, your record will be logged manually and synced to NUIS once your account is activated.
        </div>
      )}
      <div className="px-6 py-4 flex gap-3">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">Go Back</button>
        <button onClick={onConfirm} style={{ backgroundColor: '#003366' }} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity">Confirm Booking</button>
      </div>
    </ModalShell>
  )
}

function SuccessBookModal({ open, onClose, refId, isNew }: { open: boolean; onClose: () => void; refId: string; isNew: boolean }) {
  if (!open) return null
  return (
    <ModalShell>
      <div className="px-6 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Appointment Booked!</h2>
        <p className="text-gray-500 text-sm mb-5">
          {isNew
            ? 'Your appointment has been submitted. Since you are a new student, clinic staff will manually verify and sync your record to NUIS.'
            : 'Your appointment is pending confirmation from the clinic staff. Please arrive 10 minutes before your scheduled time.'}
        </p>
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6 inline-block mx-auto">
          <p className="text-xs text-gray-400 mb-1">Reference Number</p>
          <p className="text-xl font-bold text-[#003366] tracking-widest">{refId}</p>
        </div>
        <button onClick={onClose} style={{ backgroundColor: '#003366' }} className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity">Done</button>
      </div>
    </ModalShell>
  )
}

function CancelModal({ open, onConfirm, onClose, name }: { open: boolean; onConfirm: () => void; onClose: () => void; name: string }) {
  if (!open) return null
  return (
    <ModalShell>
      <div className="px-6 py-8">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800 text-center mb-2">Cancel Appointment</h2>
        <p className="text-gray-500 text-sm text-center mb-6">Cancel the appointment for <strong className="text-gray-700">{name}</strong>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">Keep It</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors">Yes, Cancel</button>
        </div>
      </div>
    </ModalShell>
  )
}

function SyncModal({ open, onConfirm, onClose, student }: { open: boolean; onConfirm: () => void; onClose: () => void; student?: NewStudent }) {
  if (!open || !student) return null
  return (
    <ModalShell>
      <ModalHeader title="Sync to NUIS" sub="Confirm manual entry into the NUIS student database." />
      <div className="px-6 pt-5 pb-2 space-y-0.5">
        <DetailRow label="Temporary ID" value={student.tempId} />
        <DetailRow label="Full Name" value={student.fullName} />
        <DetailRow label="Program" value={student.program} />
        <DetailRow label="Year Level" value={student.yearLevel} />
      </div>
      <div className="mx-6 my-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-800">
        This student will be added to the NUIS database. A permanent student ID will be assigned upon activation.
      </div>
      <div className="px-6 pb-5 flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={onConfirm} style={{ backgroundColor: '#003366' }} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity">Add to NUIS</button>
      </div>
    </ModalShell>
  )
}

function SyncSuccessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <ModalShell>
      <div className="px-6 py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Synced Successfully</h2>
        <p className="text-gray-500 text-sm mb-6">The student record has been added to the NUIS database. Status updated to Synced.</p>
        <button onClick={onClose} style={{ backgroundColor: '#003366' }} className="w-full py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity">Done</button>
      </div>
    </ModalShell>
  )
}

// ── Booking View ──────────────────────────────────────────────────────────────

function BookingView({ defaultUserType = 'student' }: { defaultUserType?: UserType }) {
  const [userType, setUserType] = useState<UserType>(defaultUserType)
  const [modal, setModal] = useState<ModalKind>(null)
  const [refId, setRefId] = useState('')

  const [sf, setSf] = useState({ studentId: '', fullName: '', program: '', yearLevel: '', studentStatus: 'Continuing Student', purpose: '', date: '', time: '', service: '' })
  const [ff, setFf] = useState({ employeeName: '', department: '', purpose: '', date: '', time: '', service: '' })

  const sSet = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setSf(p => ({ ...p, [k]: e.target.value }))
  const fSet = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFf(p => ({ ...p, [k]: e.target.value }))

  const formData: Record<string, string> = userType === 'student' ? sf : ff
  const isNew = userType === 'student' && sf.studentStatus === 'New Student'

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setModal('confirmBook') }

  const handleConfirm = () => {
    const prefix = userType === 'student' ? 'STU' : 'EMP'
    setRefId(`${prefix}-${Date.now().toString().slice(-7)}`)
    setModal('successBook')
  }

  const handleDone = () => {
    setModal(null)
    if (userType === 'student') setSf({ studentId: '', fullName: '', program: '', yearLevel: '', studentStatus: 'Continuing Student', purpose: '', date: '', time: '', service: '' })
    else setFf({ employeeName: '', department: '', purpose: '', date: '', time: '', service: '' })
  }

  const hasSummary = userType === 'student'
    ? sf.date || sf.time || sf.service
    : ff.date || ff.time || ff.service

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#003366]">Appointment Booking</h1>
        <p className="text-gray-500 text-sm mt-1">University Health Office · National University Fairview</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Gradient header bar */}
        <div style={{ background: 'linear-gradient(135deg, #003366 0%, #00509E 100%)' }} className="px-6 py-5">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mb-3">I am booking as a</p>
          <div className="flex gap-2">
            {(['student', 'faculty'] as UserType[]).map(t => (
              <button
                key={t}
                onClick={() => setUserType(t)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  userType === t
                    ? 'bg-white text-[#003366] shadow-md'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <span>{t === 'student' ? '🎓' : '👤'}</span>
                {t === 'student' ? 'Student' : 'Faculty / Employee'}
              </button>
            ))}
          </div>
        </div>

        {/* Gold accent bar */}
        <div style={{ height: 3, backgroundColor: '#C9A227' }} />

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* ── Student fields ── */}
          {userType === 'student' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label text="Student ID" required />
                  <input className={inputCls} placeholder="e.g. 2024-10234" value={sf.studentId} onChange={sSet('studentId')} required />
                </div>
                <div>
                  <Label text="Full Name" required />
                  <input className={inputCls} placeholder="Last Name, First Name M.I." value={sf.fullName} onChange={sSet('fullName')} required />
                </div>
                <div className="sm:col-span-2">
                  <Label text="Program" required />
                  <SelectWrap>
                    <select className={selectCls} value={sf.program} onChange={sSet('program')} required>
                      <option value="">Select your program</option>
                      <optgroup label="Senior High School">
                        {PROGRAMS.filter(p => p.startsWith('SHS')).map(p => <option key={p}>{p}</option>)}
                      </optgroup>
                      <optgroup label="College">
                        {PROGRAMS.filter(p => !p.startsWith('SHS')).map(p => <option key={p}>{p}</option>)}
                      </optgroup>
                    </select>
                  </SelectWrap>
                </div>
                <div>
                  <Label text="Year Level" required />
                  <SelectWrap>
                    <select className={selectCls} value={sf.yearLevel} onChange={sSet('yearLevel')} required>
                      <option value="">Select year level</option>
                      {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </SelectWrap>
                </div>
                <div>
                  <Label text="Student Status" required />
                  <div className="flex gap-3 mt-1">
                    {['Continuing Student', 'New Student'].map(s => (
                      <label key={s} className={`flex items-center gap-2.5 flex-1 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${sf.studentStatus === s ? 'border-[#003366] bg-blue-50 text-[#003366]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        <input type="radio" name="status" value={s} checked={sf.studentStatus === s} onChange={sSet('studentStatus')} className="accent-[#003366]" />
                        {s === 'New Student' ? '🆕 New' : '↩ Continuing'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {isNew && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex gap-3 items-start">
                  <span className="text-amber-500 text-lg mt-0.5">⚠</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-800">New Student Advisory</p>
                    <p className="text-xs text-amber-700 mt-0.5">New students without an active NUIS account will be recorded manually by clinic staff and synced once your account is activated.</p>
                  </div>
                </div>
              )}
              <div>
                <Label text="Purpose of Visit" required />
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Briefly describe your reason for visiting..." value={sf.purpose} onChange={sSet('purpose')} required />
              </div>
            </>
          )}

          {/* ── Faculty fields ── */}
          {userType === 'faculty' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label text="Employee Name" required />
                  <input className={inputCls} placeholder="Last Name, First Name M.I." value={ff.employeeName} onChange={fSet('employeeName')} required />
                </div>
                <div>
                  <Label text="Office / Department" required />
                  <SelectWrap>
                    <select className={selectCls} value={ff.department} onChange={fSet('department')} required>
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </SelectWrap>
                </div>
              </div>
              <div>
                <Label text="Purpose of Visit" required />
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Briefly describe your reason for visiting..." value={ff.purpose} onChange={fSet('purpose')} required />
              </div>
            </>
          )}

          {/* ── Shared scheduling ── */}
          <div className="h-px bg-gray-100" />
          <p className="text-xs font-semibold text-[#003366] uppercase tracking-widest flex items-center gap-2">
            <span style={{ width: 12, height: 12, backgroundColor: '#C9A227', borderRadius: '50%', display: 'inline-block' }} />
            Appointment Schedule
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <Label text="Select Date" required />
              <input
                type="date"
                className={inputCls}
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={userType === 'student' ? sSet('date') : fSet('date')}
                required
              />
            </div>
            <div>
              <Label text="Select Time" required />
              <SelectWrap>
                <select className={selectCls} value={formData.time} onChange={userType === 'student' ? sSet('time') : fSet('time')} required>
                  <option value="">Choose slot</option>
                  {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </SelectWrap>
            </div>
            <div>
              <Label text="Select Service" required />
              <SelectWrap>
                <select className={selectCls} value={formData.service} onChange={userType === 'student' ? sSet('service') : fSet('service')} required>
                  <option value="">Choose service</option>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </SelectWrap>
            </div>
          </div>

          {/* ── Booking Summary ── */}
          {hasSummary && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-xs font-semibold text-[#003366] uppercase tracking-widest mb-3">Booking Summary</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                {userType === 'student' ? (
                  <>
                    {sf.fullName && <div><span className="text-gray-400">Name: </span><span className="font-semibold text-gray-700">{sf.fullName}</span></div>}
                    {sf.studentId && <div><span className="text-gray-400">ID: </span><span className="font-semibold text-gray-700">{sf.studentId}</span></div>}
                    {sf.program && <div className="col-span-2"><span className="text-gray-400">Program: </span><span className="font-semibold text-gray-700">{sf.program}</span></div>}
                  </>
                ) : (
                  <>
                    {ff.employeeName && <div><span className="text-gray-400">Name: </span><span className="font-semibold text-gray-700">{ff.employeeName}</span></div>}
                    {ff.department && <div><span className="text-gray-400">Dept: </span><span className="font-semibold text-gray-700">{ff.department}</span></div>}
                  </>
                )}
                {formData.date && <div><span className="text-gray-400">Date: </span><span className="font-semibold text-gray-700">{formData.date}</span></div>}
                {formData.time && <div><span className="text-gray-400">Time: </span><span className="font-semibold text-gray-700">{formData.time}</span></div>}
                {formData.service && <div className="col-span-2"><span className="text-gray-400">Service: </span><span className="font-semibold text-gray-700">{formData.service}</span></div>}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs text-amber-700 font-medium">Status: Pending Confirmation</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            style={{ background: 'linear-gradient(135deg, #003366 0%, #00509E 100%)' }}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-blue-900/20"
          >
            Book Appointment
          </button>
          <p className="text-center text-xs text-gray-400">
            By booking, you agree to attend your scheduled appointment on time. Walk-ins remain subject to availability.
          </p>
        </form>
      </div>

      <ConfirmBookModal open={modal === 'confirmBook'} onConfirm={handleConfirm} onBack={() => setModal(null)} data={formData} userType={userType} />
      <SuccessBookModal open={modal === 'successBook'} onClose={handleDone} refId={refId} isNew={isNew} />
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS)
  const [newStudents, setNewStudents] = useState<NewStudent[]>(SAMPLE_NEW_STUDENTS)
  const [activeTab, setActiveTab] = useState<'appointments' | 'newStudents'>('appointments')
  const [filterType, setFilterType] = useState<'All' | 'Student' | 'Employee'>('All')
  const [filterStatus, setFilterStatus] = useState<'All' | AppStatus>('All')
  const [search, setSearch] = useState('')
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [syncTarget, setSyncTarget] = useState<NewStudent | null>(null)
  const [modal, setModal] = useState<ModalKind>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [qa, setQa] = useState({ name: '', idOrDept: '', type: 'Student', program: '', date: '', time: '', service: '', purpose: '' })

  const today = '2024-08-09'
  const todayAppts = appointments.filter(a => a.date === today)
  const stats = {
    total: todayAppts.length,
    pending: todayAppts.filter(a => a.status === 'Pending').length,
    completed: todayAppts.filter(a => a.status === 'Completed').length,
    cancelled: todayAppts.filter(a => a.status === 'Cancelled').length,
    newStudents: newStudents.length,
  }

  const filtered = appointments.filter(a => {
    if (filterType !== 'All' && a.type !== filterType) return false
    if (filterStatus !== 'All' && a.status !== filterStatus) return false
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.idOrDept.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCancelConfirm = () => {
    if (!cancelTarget) return
    setAppointments(prev => prev.map(a => a.id === cancelTarget.id ? { ...a, status: 'Cancelled' } : a))
    setCancelTarget(null); setModal(null)
  }

  const handleStatusChange = (id: string, status: AppStatus) =>
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))

  const handleSyncConfirm = () => {
    if (!syncTarget) return
    setNewStudents(prev => prev.map(s => s.tempId === syncTarget.tempId ? { ...s, syncStatus: 'Synced' } : s))
    setSyncTarget(null); setModal('syncSuccess')
  }

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const prefix = qa.type === 'Student' ? 'STU' : 'EMP'
    const newA: Appointment = {
      id: `${prefix}-${Date.now().toString().slice(-6)}`,
      name: qa.name, idOrDept: qa.idOrDept, program: qa.program || '—',
      type: qa.type as 'Student' | 'Employee', date: qa.date, time: qa.time,
      service: qa.service, status: 'Pending', purpose: qa.purpose,
    }
    setAppointments(prev => [newA, ...prev])
    setShowQuickAdd(false)
    setQa({ name: '', idOrDept: '', type: 'Student', program: '', date: '', time: '', service: '', purpose: '' })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#003366]">Clinic Staff Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Real-time appointment monitoring · {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowQuickAdd(true)}
          style={{ backgroundColor: '#C9A227' }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-md self-start sm:self-auto"
        >
          <span className="text-lg leading-none font-light">+</span> Quick Add Appointment
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Today's Appointments", value: stats.total, icon: '📅', bg: '#EBF0F8', color: '#003366' },
          { label: 'Pending', value: stats.pending, icon: '⏳', bg: '#FEF9EC', color: '#92400E' },
          { label: 'Completed', value: stats.completed, icon: '✅', bg: '#ECFDF5', color: '#065F46' },
          { label: 'Cancelled', value: stats.cancelled, icon: '🚫', bg: '#FEF2F2', color: '#991B1B' },
          { label: 'New Students', value: stats.newStudents, icon: '🆕', bg: '#F5F3FF', color: '#5B21B6' },
        ].map(c => (
          <div key={c.label} style={{ backgroundColor: c.bg }} className="rounded-2xl p-4 flex items-center gap-3 border border-white">
            <span className="text-2xl">{c.icon}</span>
            <div>
              <div style={{ color: c.color }} className="text-3xl font-bold leading-none">{c.value}</div>
              <div className="text-xs text-gray-500 font-medium mt-1 leading-tight">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Manage Services', icon: '⚙️' },
          { label: 'Set Booking Limits', icon: '🔒' },
          { label: 'Generate Reports', icon: '📊' },
          { label: 'Sync NUIS Data', icon: '🔄' },
          { label: 'Manage New Students', icon: '🆕', highlight: true },
        ].map(a => (
          <button
            key={a.label}
            onClick={() => a.label === 'Manage New Students' ? setActiveTab('newStudents') : undefined}
            className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
              a.highlight
                ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                : 'border-gray-100 bg-white text-[#003366] hover:border-[#003366]/20 hover:bg-blue-50'
            }`}
          >
            <span className="text-base">{a.icon}</span>
            <span className="leading-tight text-left">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'appointments' as const, label: 'All Appointments', count: appointments.length },
            { key: 'newStudents' as const, label: 'New Students', count: newStudents.filter(s => s.syncStatus === 'Pending').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${activeTab === tab.key ? 'bg-[#003366] text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Appointments tab ── */}
        {activeTab === 'appointments' && (
          <>
            <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-3 flex-wrap">
              <input
                className={`${inputCls} max-w-xs py-2 text-xs`}
                placeholder="Search by name or ID / dept..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <SelectWrap>
                <select className={`${selectCls} max-w-[140px] py-2 text-xs`} value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)}>
                  <option value="All">All Types</option>
                  <option value="Student">Student</option>
                  <option value="Employee">Employee</option>
                </select>
              </SelectWrap>
              <SelectWrap>
                <select className={`${selectCls} max-w-[150px] py-2 text-xs`} value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}>
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </SelectWrap>
              <div className="sm:ml-auto flex items-center gap-2 text-xs text-gray-400 self-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFF' }} className="border-b border-gray-100">
                    {['Name', 'ID / Dept', 'Program', 'Date', 'Time', 'Service', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#003366] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id} className={`border-b border-gray-50 hover:bg-blue-50/20 transition-colors ${i % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800 text-xs">{a.name}</div>
                        <div className="text-gray-400 text-xs">{a.id}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{a.idOrDept}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[130px]">
                        <span className="truncate block" title={a.program}>{a.program}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{a.date}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{a.time}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        <span className="truncate block max-w-[120px]" title={a.service}>{a.service}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {a.status === 'Pending' && (
                            <button onClick={() => handleStatusChange(a.id, 'Confirmed')} style={{ backgroundColor: '#003366' }} className="text-white text-xs px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity whitespace-nowrap">Confirm</button>
                          )}
                          {a.status === 'Confirmed' && (
                            <button onClick={() => handleStatusChange(a.id, 'Completed')} className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity whitespace-nowrap">Complete</button>
                          )}
                          {(a.status === 'Pending' || a.status === 'Confirmed') && (
                            <button onClick={() => { setCancelTarget(a); setModal('cancelAppt') }} className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap border border-red-100">Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-14 text-center text-gray-400 text-sm">No appointments match the current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
              <span>Showing {filtered.length} of {appointments.length} appointments</span>
              <span>Last synced: {new Date().toLocaleTimeString()}</span>
            </div>
          </>
        )}

        {/* ── New Students tab ── */}
        {activeTab === 'newStudents' && (
          <>
            <div className="px-5 py-4 border-b border-gray-50 bg-purple-50/40">
              <p className="text-xs text-purple-800 font-medium flex items-start gap-2">
                <span className="mt-0.5">ℹ️</span>
                <span>New students without active NUIS accounts are listed here. Use <strong>"Add to NUIS"</strong> to manually sync their records once their accounts are activated.</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFF' }} className="border-b border-gray-100">
                    {['Temp. ID', 'Full Name', 'Program', 'Year Level', 'Purpose', 'Sync Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#003366] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {newStudents.map((s, i) => (
                    <tr key={s.tempId} className={`border-b border-gray-50 hover:bg-purple-50/20 transition-colors ${i % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>
                      <td className="px-4 py-3 text-gray-600 text-xs font-mono">{s.tempId}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-xs">{s.fullName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[130px]">
                        <span className="truncate block" title={s.program}>{s.program}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{s.yearLevel}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[150px]">
                        <span className="truncate block" title={s.purpose}>{s.purpose}</span>
                      </td>
                      <td className="px-4 py-3"><SyncBadge status={s.syncStatus} /></td>
                      <td className="px-4 py-3">
                        {s.syncStatus === 'Pending' ? (
                          <button
                            onClick={() => { setSyncTarget(s); setModal('syncNuis') }}
                            style={{ backgroundColor: '#003366' }}
                            className="text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity whitespace-nowrap"
                          >
                            Add to NUIS
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Synced ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
              <span>{newStudents.filter(s => s.syncStatus === 'Pending').length} pending sync · {newStudents.filter(s => s.syncStatus === 'Synced').length} synced</span>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      <CancelModal
        open={modal === 'cancelAppt'}
        onConfirm={handleCancelConfirm}
        onClose={() => { setCancelTarget(null); setModal(null) }}
        name={cancelTarget?.name ?? ''}
      />
      <SyncModal
        open={modal === 'syncNuis'}
        onConfirm={handleSyncConfirm}
        onClose={() => { setSyncTarget(null); setModal(null) }}
        student={syncTarget ?? undefined}
      />
      <SyncSuccessModal open={modal === 'syncSuccess'} onClose={() => setModal(null)} />

      {/* ── Quick Add Modal ── */}
      {showQuickAdd && (
        <ModalShell wide>
          <ModalHeader title="Quick Add Appointment" sub="Manually schedule an appointment for a patient." />
          <form onSubmit={handleQuickAdd} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label text="Patient Name" required />
                <input className={inputCls} placeholder="Full name" value={qa.name} onChange={e => setQa(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <Label text="Type" required />
                <SelectWrap>
                  <select className={selectCls} value={qa.type} onChange={e => setQa(p => ({ ...p, type: e.target.value }))}>
                    <option value="Student">Student</option>
                    <option value="Employee">Employee</option>
                  </select>
                </SelectWrap>
              </div>
              <div>
                <Label text={qa.type === 'Student' ? 'Student ID' : 'Department'} required />
                <input className={inputCls} placeholder={qa.type === 'Student' ? '2024-XXXXX' : 'Department'} value={qa.idOrDept} onChange={e => setQa(p => ({ ...p, idOrDept: e.target.value }))} required />
              </div>
              <div>
                <Label text="Service" required />
                <SelectWrap>
                  <select className={selectCls} value={qa.service} onChange={e => setQa(p => ({ ...p, service: e.target.value }))} required>
                    <option value="">Select service</option>
                    {SERVICES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </SelectWrap>
              </div>
              <div>
                <Label text="Date" required />
                <input type="date" className={inputCls} value={qa.date} onChange={e => setQa(p => ({ ...p, date: e.target.value }))} required />
              </div>
              <div>
                <Label text="Time" required />
                <SelectWrap>
                  <select className={selectCls} value={qa.time} onChange={e => setQa(p => ({ ...p, time: e.target.value }))} required>
                    <option value="">Choose slot</option>
                    {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </SelectWrap>
              </div>
            </div>
            <div>
              <Label text="Purpose of Visit" required />
              <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Reason for visit..." value={qa.purpose} onChange={e => setQa(p => ({ ...p, purpose: e.target.value }))} required />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowQuickAdd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" style={{ backgroundColor: '#003366' }} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity">Add Appointment</button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  )
}

// ── Logo mark (reused) ────────────────────────────────────────────────────────

function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-xl bg-white flex items-center justify-center shadow-md flex-shrink-0">
      <svg viewBox="0 0 32 32" style={{ width: size * 0.7, height: size * 0.7 }}>
        <rect x="13" y="4" width="6" height="24" rx="2" fill="#003366" />
        <rect x="4" y="13" width="24" height="6" rx="2" fill="#003366" />
      </svg>
    </div>
  )
}

// ── Auth shared wrapper ───────────────────────────────────────────────────────

function AuthCard({ children, title, sub }: { children: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="auth-shell min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Branding */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <LogoMark size={52} />
          <div className="text-center">
            <div className="text-[#003366] font-bold text-2xl tracking-wide">SynClinic</div>
            <div className="text-slate-600 text-xs font-medium mt-0.5">University Health Office · National University Fairview</div>
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* Gold accent top bar */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #C9A227, #E8C84A, #C9A227)', borderRadius: '8px 8px 0 0' }} />
          <div className="auth-panel bg-white rounded-b-2xl shadow-xl overflow-hidden">
            <div className="px-8 pt-6 pb-2">
              <h1 className="text-xl font-bold text-[#003366]">{title}</h1>
              <p className="text-gray-400 text-xs mt-1">{sub}</p>
            </div>
            {children}
          </div>
        </div>
      </div>

      <div className="pb-6 text-center">
        <p className="text-slate-500 text-xs">SynClinic · University Health Office · NU Fairview · © 2024</p>
      </div>
    </div>
  )
}

// ── Input helpers for auth forms ──────────────────────────────────────────────

function AuthInput({
  label, type = 'text', placeholder, value, onChange, icon, required,
}: {
  label: string; type?: string; placeholder: string; value: string
  onChange: (v: string) => void; icon: string; required?: boolean
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <label className="block text-xs font-semibold text-[#003366] uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base select-none">{icon}</span>
        <input
          type={isPassword && show ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/25 focus:border-[#003366] focus:bg-white transition-all placeholder:text-gray-400"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm select-none">
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Login Screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin, goSignup }: { onLogin: (role: 'student' | 'faculty' | 'staff') => void; goSignup: () => void }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'faculty' | 'staff'>('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!identifier.trim() || !password.trim()) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin(role) }, 900)
  }

  const roleHint: Record<'student' | 'faculty' | 'staff', string> = {
    student: 'You will be directed to the Student Booking form.',
    faculty: 'You will be directed to the Faculty/Employee Booking form.',
    staff: 'You will be directed to the Clinic Staff Dashboard.',
  }

  return (
    <AuthCard title="Welcome back" sub="Sign in to your SynClinic account to continue.">
      <form onSubmit={handleSubmit} className="px-8 pb-8 pt-5 space-y-4">
        {/* Role picker */}
        <div>
          <label className="block text-xs font-semibold text-[#003366] uppercase tracking-wide mb-2">I am a</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: 'student' as const, icon: '🎓', label: 'Student' },
              { key: 'faculty' as const, icon: '👤', label: 'Faculty / Employee' },
              { key: 'staff' as const, icon: '🏥', label: 'Clinic Staff' },
            ]).map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all leading-tight text-center ${
                  role === r.key
                    ? 'border-[#003366] bg-[#003366] text-white shadow-md'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                }`}
              >
                <span className="text-xl">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">{roleHint[role]}</p>
        </div>

        <div className="h-px bg-gray-100" />

        <AuthInput label="Username or Email" placeholder="Enter your username or email" value={identifier} onChange={setIdentifier} icon="✉️" required />
        <AuthInput label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} icon="🔒" required />

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="flex justify-end">
          <button type="button" className="text-xs text-[#003366] font-medium hover:underline">Forgot password?</button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #003366 0%, #00509E 100%)' }}
          className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Signing in...</>
          ) : (
            <>Sign In →</>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 pt-1">
          {"Don't have an account? "}
          <button type="button" onClick={goSignup} className="text-[#003366] font-bold hover:underline">Sign Up</button>
        </p>
      </form>
    </AuthCard>
  )
}

// ── Sign-up Screen ────────────────────────────────────────────────────────────

function SignupScreen({ onSignup, goLogin }: { onSignup: (role: 'student' | 'faculty' | 'staff') => void; goLogin: () => void }) {
  const [role, setRole] = useState<'student' | 'faculty' | 'staff'>('student')
  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !userId || !email || !username || !password || !confirmPassword) {
      setError('All fields are required.'); return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.'); return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.'); return
    }
    if (!agree) {
      setError('Please agree to the terms and conditions.'); return
    }
    setLoading(true)
    setTimeout(() => { setLoading(false); onSignup(role) }, 1000)
  }

  return (
    <AuthCard title="Create an account" sub="Register for a SynClinic account to get started.">
      <form onSubmit={handleSubmit} className="px-8 pb-8 pt-5 space-y-4">
        {/* Role picker */}
        <div>
          <label className="block text-xs font-semibold text-[#003366] uppercase tracking-wide mb-2">Registering as</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: 'student' as const, icon: '🎓', label: 'Student' },
              { key: 'faculty' as const, icon: '👤', label: 'Faculty / Employee' },
              { key: 'staff' as const, icon: '🏥', label: 'Clinic Staff' },
            ]).map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all leading-tight text-center ${
                  role === r.key
                    ? 'border-[#003366] bg-[#003366] text-white shadow-md'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                }`}
              >
                <span className="text-xl">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Fields */}
        <AuthInput
          label="Full Name"
          placeholder="Last Name, First Name M.I."
          value={name}
          onChange={setName}
          icon="👤"
          required
        />
        <AuthInput
          label={role === 'student' ? 'Student ID' : role === 'faculty' ? 'Employee ID' : 'Staff ID'}
          placeholder={role === 'student' ? 'e.g. 2024-10234' : role === 'faculty' ? 'e.g. EMP-2024-001' : 'e.g. STF-2024-001'}
          value={userId}
          onChange={setUserId}
          icon="🪪"
          required
        />
        <AuthInput
          label="Email Address"
          type="email"
          placeholder={role === 'student' ? 'student@nu-fairview.edu.ph' : role === 'faculty' ? 'employee@nu-fairview.edu.ph' : 'staff@nu-fairview.edu.ph'}
          value={email}
          onChange={setEmail}
          icon="✉️"
          required
        />
        <AuthInput
          label="Username"
          placeholder="Choose a unique username"
          value={username}
          onChange={setUsername}
          icon="🔤"
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <AuthInput label="Password" type="password" placeholder="Min. 6 characters" value={password} onChange={setPassword} icon="🔒" required />
          <AuthInput label="Confirm Password" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={setConfirmPassword} icon="🔑" required />
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
            className="mt-0.5 accent-[#003366] w-4 h-4 flex-shrink-0"
          />
          <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
            I agree to the{' '}
            <span className="text-[#003366] font-semibold">Terms and Conditions</span>
            {' '}and{' '}
            <span className="text-[#003366] font-semibold">Privacy Policy</span>
            {' '}of the NU Fairview University Health Office.
          </span>
        </label>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #003366 0%, #00509E 100%)' }}
          className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Creating account...</>
          ) : (
            <>Create Account →</>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 pt-1">
          Already have an account?{' '}
          <button type="button" onClick={goLogin} className="text-[#003366] font-bold hover:underline">Sign In</button>
        </p>
      </form>
    </AuthCard>
  )
}

// ── App shell ─────────────────────────────────────────────────────────────────

export default function App() {
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login')
  const [loggedInAs, setLoggedInAs] = useState<LoggedInAs>(() => {
    const savedRole = sessionStorage.getItem('synclinic-role')
    return savedRole === 'student' || savedRole === 'faculty' || savedRole === 'staff' ? savedRole : null
  })
  const [view, setView] = useState<View>('booking')

  useEffect(() => {
    if (loggedInAs) sessionStorage.setItem('synclinic-role', loggedInAs)
    else sessionStorage.removeItem('synclinic-role')
  }, [loggedInAs])

  const handleLogin = (role: 'student' | 'faculty' | 'staff') => {
    setLoggedInAs(role)
    setView(role === 'staff' ? 'dashboard' : 'booking')
  }

  const handleSignup = (role: 'student' | 'faculty' | 'staff') => {
    setLoggedInAs(role)
    setView(role === 'staff' ? 'dashboard' : 'booking')
  }

  const handleLogout = () => {
    setLoggedInAs(null)
    setAuthScreen('login')
    setView('booking')
  }

  // ── Auth gate ──
  if (!loggedInAs) {
    if (authScreen === 'login') return <LoginScreen onLogin={handleLogin} goSignup={() => setAuthScreen('signup')} />
    return <SignupScreen onSignup={handleSignup} goLogin={() => setAuthScreen('login')} />
  }

  // ── Main app (logged in) ──
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F5FA', fontFamily: "'Poppins', system-ui, sans-serif" }}>
      {/* Top nav */}
      <header style={{ background: 'linear-gradient(135deg, #003366 0%, #00509E 100%)' }} className="shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <LogoMark size={40} />
              <div>
                <div className="text-white font-bold text-lg leading-tight tracking-wide">SynClinic</div>
                <div className="text-blue-200 text-xs font-light">University Health Office · NU Fairview</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-xl ${
                  loggedInAs === 'student' ? 'bg-blue-500/30 text-blue-100'
                  : loggedInAs === 'faculty' ? 'bg-teal-500/30 text-teal-100'
                  : 'bg-amber-500/30 text-amber-100'
                }`}>
                  {loggedInAs === 'student' ? '🎓 Student' : loggedInAs === 'faculty' ? '👤 Faculty/Employee' : '🏥 Clinic Staff'}
                </span>
                <div style={{ backgroundColor: '#C9A227' }} className="text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow hidden md:block">
                  {new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white border border-white/20 hover:border-white/50 px-3 py-1.5 rounded-xl transition-all"
              >
                <span>↩</span> Sign Out
              </button>
            </div>
          </div>
          <nav className="flex gap-1 py-2">
            {([
              ...(loggedInAs !== 'staff' ? [{ key: 'booking' as View, label: 'Book Appointment', icon: '📝' }] : []),
              ...(loggedInAs === 'faculty' || loggedInAs === 'staff' ? [{ key: 'dashboard' as View, label: 'Staff Dashboard', icon: '📋' }] : []),
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  view === tab.key ? 'bg-white text-[#003366] shadow' : 'text-blue-100 hover:bg-white/15'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Gold accent strip */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #C9A227, #E8C84A, #C9A227)' }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'booking' && loggedInAs !== 'staff'
          ? <BookingView defaultUserType={loggedInAs as UserType} />
          : <Dashboard />}
      </main>

      <footer className="mt-10">
        <div style={{ background: 'linear-gradient(135deg, #003366 0%, #00509E 100%)' }} className="py-4">
          <p className="text-center text-blue-200 text-xs">
            SynClinic · University Health Office · National University Fairview · © 2024 · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  )
}
