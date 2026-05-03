import { useEffect, useMemo, useRef, useState } from "react";
import { siteDefinitions, statusReasons, workbookWorkers } from "./data/adminDemoData.js";
import {
  DEFAULT_SITE_GPS_SETTINGS,
  calculateDistanceMeters,
  geocodeAddress,
  getCurrentLocation,
  hasGoogleMapsApiKey,
  isWithinAllowedRadius,
  searchAddressSuggestions,
} from "./utils/gps.js";
import {
  getCurrentMonthDates,
  getDefaultReportMonthId,
  getMonthId,
  getMonthLabel,
  getReportDates,
  getReportMonths,
  getReportRangeLabel,
  getTodayDate,
  isDateInMonth,
  isSameDate,
} from "./utils/dates.js";

const WORKER_USERNAME = "123";
const WORKER_PASSWORD = "123";
const ADMIN_USERNAME = "111";
const ADMIN_PASSWORD = "111";
const ADMIN_STORAGE_KEY = "connex-admin-workers-live-v1";
const WORKER_LANGUAGE_STORAGE_KEY = "connex-worker-language";
const ADMIN_LANGUAGE_STORAGE_KEY = "connex-admin-language";
const GPS_SETTINGS_STORAGE_KEY = "connex-site-gps-settings-v2";

const fieldInitialState = { workerId: "", password: "" };

const workerLanguages = [
  { code: "en", enLabel: "English", heLabel: "אנגלית" },
  { code: "th", enLabel: "Thai", heLabel: "תאילנדית", nativeLabel: "ไทย" },
  { code: "ro", enLabel: "Romanian", heLabel: "רומנית", nativeLabel: "Română" },
  { code: "hi", enLabel: "Hindi", heLabel: "הינדי", nativeLabel: "हिन्दी" },
  { code: "si", enLabel: "Sinhala", heLabel: "סינהלה", nativeLabel: "සිංහල" },
];

const adminLanguages = [
  { code: "en", enLabel: "English", heLabel: "אנגלית" },
  { code: "he", enLabel: "Hebrew", heLabel: "עברית" },
  { code: "ro", enLabel: "Romanian", heLabel: "רומנית", nativeLabel: "Română" },
  { code: "zh", enLabel: "Chinese", heLabel: "סינית", nativeLabel: "中文" },
];

const translations = {
  en: {
    subtitle: "Worker attendance system",
    dashboardSubtitle: "Making foreign workers visible",
    loginTitle: "Login",
    usernameLabel: "Username",
    usernamePlaceholder: "Enter username",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    signIn: "Sign In",
    languageLabel: "Language",
    demoCredentials: "Worker 123 / 123 · Admin 111 / 111",
    adminNavDashboard: "Dashboard",
    today: "Today",
    liveClock: "Live clock",
    todayHours: "Today hours",
    monthHours: "{month} hours",
    healthOverview: "Site health overview",
    recentActivity: "Recent activity",
    missingData: "Missing attendance data",
    unusualHours: "Unusual hours",
    openSite: "Open site",
    reportControls: "Report controls",
    selectSite: "Select site",
    dateRange: "Date range",
    contractorManager: "Contractor / site manager",
    projectStatus: "Project status",
    emptyFieldsError: "Please enter both username and password.",
    invalidCredentialsError: "Use demo credentials: worker 123 / 123 or admin 111 / 111.",
    logout: "Log out",
    workerName: "MINGQIANG SONG",
    passportNumber: "Passport number:",
    country: "Country",
    countryValue: "China",
    statusWorking: "At work",
    statusNotWorking: "Not at work",
    checkIn: "Check In",
    checkOut: "Check Out",
    enteredAt: "Checked in at {time}",
    recentHistory: "Attendance history",
    fullHistory: "Full attendance history",
    monthlyHistory: "{month} attendance",
    monthlySummary: "Monthly hours summary",
    totalMonthlyHours: "Total monthly hours: {hours}",
    date: "Date",
    entry: "Entry",
    exit: "Exit",
    totalHours: "Total hours",
    back: "Back",
    noExitYet: "In progress",
    adminTitle: "Admin Dashboard",
    adminSubtitle: "General site performance overview",
    sites: "Sites",
    reports: "Reports",
    managerRole: "System Manager",
    totalWorkers: "Total workers",
    missingToday: "Did not arrive today",
    attendancePercent: "Attendance percentage",
    totalWorkHours: "Total work hours",
    workersOnSite: "Site workers",
    workerNameColumn: "Worker name",
    passport: "Passport number",
    statusReason: "Status / reason",
    monthlyWorkerHistory: "Worker attendance history",
    monthlyReport: "Monthly report",
    dailyReport: "Daily report",
    reportSelectionSubtitle: "Select a site to open daily or monthly reports",
    arrivedToday: "Arrived today",
    daysWorked: "Days worked",
    missingDays: "Missing days",
    reportRange: "{start} - {end}",
    worked: "Worked",
    detailedMonthlyReport: "Detailed monthly report",
    siteMonthlyTotal: "Site monthly hours total",
    present: "Present",
    monthlyHours: "Monthly hours",
    projectsSubtitle: "Manage and track construction projects",
    location: "Location",
    client: "Contractor / client",
    stage: "Construction stage",
    progress: "Progress",
    assigned: "Assigned workers",
    profileName: "Mohammad",
    siteHealth: "Site health",
    sitesNeedingAttention: "Sites needing attention",
    operationalAlerts: "Operational alerts",
    stableSites: "Stable sites",
    viewSite: "View site",
    reportStatus: "Report ready",
    siteReport: "Site report",
    openReport: "Open report",
    quickStats: "Quick stats",
    attention: "Attention",
    activeSites: "Active sites",
    online: "Online",
    lastUpdated: "Last updated",
    systemFooter: "Foreign worker attendance system",
    attendanceAlert: "Missing workers detected",
    siteReviewAlert: "Site requires review",
    monthlyReportUpdated: "Monthly report updated",
    liveOperations: "Live operations",
    reportMonth: "Report month",
    selectedRange: "Selected range",
    missingWorkersTitle: "Workers who did not arrive today",
    missingWorkersSubtitle: "Focused list for {date}",
    note: "Note",
    close: "Close",
    noNote: "No note",
    settings: "Settings",
    siteGpsSettings: "Site GPS Settings",
    gpsSettingsSubtitle: "Configure check-in radius for the construction site",
    siteName: "Site name",
    siteAddress: "Site address",
    latitude: "Latitude",
    longitude: "Longitude",
    allowedRadius: "Allowed radius",
    allowedRadiusMeters: "Allowed radius in meters",
    saveSettings: "Save settings",
    settingsSaved: "Settings saved",
    testCurrentLocation: "Test current location",
    currentLatitude: "Current latitude",
    currentLongitude: "Current longitude",
    siteLatitude: "Site latitude",
    siteLongitude: "Site longitude",
    distanceFromSite: "Distance from site",
    insideAllowedRadius: "Inside allowed radius",
    outsideAllowedRadius: "Outside allowed radius",
    gpsTestIntro: "Use this from your phone to compare your location with the site.",
    checkingLocation: "Checking location...",
    locationPermissionRequired: "Location permission is required to check in.",
    locationUnavailable: "Could not detect your location. Please try again.",
    tooFarFromSite: "You are too far from the construction site. Check-in is allowed only within {radius} meters.",
    tooFarFromSiteWithDistance: "You are {distance} meters from the site. Check-in is allowed only within {radius} meters.",
    withinRangeApproved: "You are within range. Check-in approved.",
    gpsSettingsInvalid: "Please enter valid latitude, longitude, and radius.",
    findCoordinates: "Find coordinates",
    searchingAddress: "Searching address...",
    addressUpdated: "Address found. Coordinates updated.",
    addressNotFound: "Could not find this address. Try a more specific address.",
    addressSuggestions: "Address suggestions",
    googleMapsReady: "Google Maps autocomplete is ready.",
    googleMapsFallback: "Google Maps key is missing. Address lookup is using a simple fallback for now.",
  },
  he: {},
  th: {},
  hi: {},
  ro: {},
  si: {},
  zh: {},
};

for (const code of ["th", "hi", "ro", "si", "zh"]) {
  translations[code] = { ...translations.en };
}

Object.assign(translations.th, {
  subtitle: "ระบบบันทึกเวลาคนงาน",
  loginTitle: "เข้าสู่ระบบ",
  usernameLabel: "ชื่อผู้ใช้",
  usernamePlaceholder: "กรอกชื่อผู้ใช้",
  passwordLabel: "รหัสผ่าน",
  passwordPlaceholder: "กรอกรหัสผ่าน",
  signIn: "เข้าสู่ระบบ",
  languageLabel: "ภาษา",
  demoCredentials: "คนงาน 123 / 123 · ผู้ดูแล 111 / 111",
  emptyFieldsError: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน",
  invalidCredentialsError: "ใช้บัญชีตัวอย่าง: คนงาน 123 / 123 หรือผู้ดูแล 111 / 111",
});

Object.assign(translations.hi, {
  subtitle: "वर्कर उपस्थिति प्रणाली",
  loginTitle: "लॉग इन",
  usernameLabel: "उपयोगकर्ता नाम",
  usernamePlaceholder: "उपयोगकर्ता नाम दर्ज करें",
  passwordLabel: "पासवर्ड",
  passwordPlaceholder: "पासवर्ड दर्ज करें",
  signIn: "साइन इन",
  languageLabel: "भाषा",
  demoCredentials: "वर्कर 123 / 123 · एडमिन 111 / 111",
  emptyFieldsError: "कृपया उपयोगकर्ता नाम और पासवर्ड दोनों दर्ज करें।",
  invalidCredentialsError: "डेमो लॉगिन उपयोग करें: वर्कर 123 / 123 या एडमिन 111 / 111।",
});

Object.assign(translations.ro, {
  subtitle: "Sistem de pontaj pentru lucrători",
  loginTitle: "Autentificare",
  usernameLabel: "Utilizator",
  usernamePlaceholder: "Introdu utilizatorul",
  passwordLabel: "Parolă",
  passwordPlaceholder: "Introdu parola",
  signIn: "Intră în cont",
  languageLabel: "Limbă",
  demoCredentials: "Lucrător 123 / 123 · Admin 111 / 111",
  emptyFieldsError: "Introdu utilizatorul și parola.",
  invalidCredentialsError: "Folosește datele demo: lucrător 123 / 123 sau admin 111 / 111.",
});

Object.assign(translations.si, {
  subtitle: "සේවක පැමිණීමේ පද්ධතිය",
  loginTitle: "පිවිසෙන්න",
  usernameLabel: "පරිශීලක නාමය",
  usernamePlaceholder: "පරිශීලක නාමය ඇතුළත් කරන්න",
  passwordLabel: "මුරපදය",
  passwordPlaceholder: "මුරපදය ඇතුළත් කරන්න",
  signIn: "පිවිසෙන්න",
  languageLabel: "භාෂාව",
  demoCredentials: "සේවක 123 / 123 · පරිපාලක 111 / 111",
  emptyFieldsError: "කරුණාකර පරිශීලක නාමය සහ මුරපදය ඇතුළත් කරන්න.",
  invalidCredentialsError: "ඩෙමෝ පිවිසුම් භාවිත කරන්න: සේවක 123 / 123 හෝ පරිපාලක 111 / 111.",
});

Object.assign(translations.zh, {
  languageLabel: "Language",
  adminNavDashboard: "Dashboard",
  adminTitle: "Admin Dashboard",
  sites: "Sites",
  reports: "Reports",
  profileName: "Mohammad",
  managerRole: "System Manager",
});

Object.assign(translations.he, {
  subtitle: "מערכת נוכחות עובדים",
  dashboardSubtitle: "הנגשת עובדים זרים לבנייה",
  loginTitle: "כניסה",
  usernameLabel: "שם משתמש",
  usernamePlaceholder: "הזן שם משתמש",
  passwordLabel: "סיסמה",
  passwordPlaceholder: "הזן סיסמה",
  signIn: "כניסה",
  emptyFieldsError: "יש להזין שם משתמש וסיסמה.",
  invalidCredentialsError: "פרטי הדמו הם עובד 123 / 123 או מנהל 111 / 111.",
  logout: "יציאה מהחשבון",
  workerName: "MINGQIANG SONG",
  passportNumber: "מספר דרכון:",
  country: "מדינה:",
  countryValue: "סין",
  statusWorking: "בעבודה",
  statusNotWorking: "לא בעבודה",
  checkIn: "כניסה",
  checkOut: "יציאה",
  enteredAt: "נכנס ב-{time}",
  recentHistory: "היסטוריית כניסות",
  fullHistory: "היסטוריית כניסות",
  monthlyHistory: "נוכחות {month}",
  monthlySummary: "סיכום שעות החודש",
  totalMonthlyHours: "סה\"כ שעות חודשיות: {hours}",
  date: "תאריך",
  entry: "כניסה",
  exit: "יציאה",
  totalHours: "סה\"כ שעות",
  back: "חזרה",
  noExitYet: "בתהליך",
  adminTitle: "דשבורד מנהל",
  adminSubtitle: "סקירת ביצועים כללית של האתרים",
  sites: "אתרים",
  reports: "דוחות",
  managerRole: "מנהל מערכת",
  totalWorkers: "סה\"כ עובדים",
  missingToday: "לא הגיעו היום",
  attendancePercent: "אחוז נוכחות כללית",
  totalWorkHours: "סה\"כ שעות עבודה",
  workersOnSite: "עובדים באתר",
  workerNameColumn: "שם עובד",
  passport: "מספר דרכון",
  statusReason: "סטטוס / סיבה",
  monthlyWorkerHistory: "היסטוריית נוכחות עובד",
  monthlyReport: "דוח חודשי",
  dailyReport: "דוח יומי",
  reportSelectionSubtitle: "בחר אתר לפתיחת דוח יומי או חודשי",
  arrivedToday: "הגיעו היום",
  daysWorked: "ימי עבודה",
  missingDays: "ימי היעדרות",
  reportRange: "{start} - {end}",
  worked: "עבדו",
  detailedMonthlyReport: "דוח חודשי מפורט",
  siteMonthlyTotal: "סה\"כ שעות חודשיות לאתר",
  present: "נוכח",
  monthlyHours: "סה\"כ שעות חודשיות",
  projectsSubtitle: "ניהול ומעקב אחר פרויקטי הבנייה",
  location: "מיקום",
  client: "קבלן / לקוח",
  stage: "שלב בנייה",
  progress: "התקדמות",
  assigned: "עובדים משויכים",
  profileName: "מוחמד",
});

Object.assign(translations.he, {
  languageLabel: "שפה",
  demoCredentials: "עובד 123 / 123 · מנהל 111 / 111",
  adminNavDashboard: "דשבורד",
  siteHealth: "מצב אתרים",
  sitesNeedingAttention: "אתרים שדורשים תשומת לב",
  operationalAlerts: "התראות תפעוליות",
  stableSites: "אתרים יציבים",
  viewSite: "צפה באתר",
  reportStatus: "דוח מוכן",
  siteReport: "דוח אתר",
  openReport: "פתח דוח",
});

Object.assign(translations.he, {
  subtitle: "מערכת נוכחות עובדים",
  dashboardSubtitle: "הנגשת עובדים זרים לבנייה",
  loginTitle: "כניסה",
  usernameLabel: "שם משתמש",
  usernamePlaceholder: "הזן שם משתמש",
  passwordLabel: "סיסמה",
  passwordPlaceholder: "הזן סיסמה",
  signIn: "כניסה",
  emptyFieldsError: "יש להזין שם משתמש וסיסמה.",
  invalidCredentialsError: "פרטי הדמו הם עובד 123 / 123 או מנהל 111 / 111.",
  logout: "יציאה מהחשבון",
  passportNumber: "מספר דרכון:",
  country: "מדינה",
  countryValue: "סין",
  statusWorking: "בעבודה",
  statusNotWorking: "לא בעבודה",
  checkIn: "כניסה",
  checkOut: "יציאה",
  enteredAt: "נכנס ב-{time}",
  recentHistory: "היסטוריית כניסות",
  fullHistory: "היסטוריית כניסות",
  monthlyHistory: "נוכחות {month}",
  monthlySummary: "סיכום שעות החודש",
  totalMonthlyHours: "סה\"כ שעות חודשיות: {hours}",
  date: "תאריך",
  entry: "כניסה",
  exit: "יציאה",
  totalHours: "סה\"כ שעות",
  back: "חזרה",
  noExitYet: "בתהליך",
  adminTitle: "דשבורד מנהל",
  adminSubtitle: "סקירת ביצועים כללית של האתרים",
  sites: "אתרים",
  reports: "דוחות",
  managerRole: "מנהל מערכת",
  totalWorkers: "סה\"כ עובדים",
  missingToday: "לא הגיעו היום",
  attendancePercent: "אחוז נוכחות כללית",
  totalWorkHours: "סה\"כ שעות עבודה",
  workersOnSite: "עובדים באתר",
  workerNameColumn: "שם עובד",
  passport: "מספר דרכון",
  statusReason: "סטטוס / סיבה",
  monthlyWorkerHistory: "היסטוריית נוכחות עובד",
  monthlyReport: "דוח חודשי",
  dailyReport: "דוח יומי",
  reportSelectionSubtitle: "בחר אתר לפתיחת דוח יומי או חודשי",
  arrivedToday: "הגיעו היום",
  daysWorked: "ימי עבודה",
  missingDays: "ימי היעדרות",
  reportRange: "{start} - {end}",
  worked: "עבדו",
  detailedMonthlyReport: "דוח חודשי מפורט",
  siteMonthlyTotal: "סה\"כ שעות חודשיות לאתר",
  present: "נוכח",
  monthlyHours: "סה\"כ שעות חודשיות",
  projectsSubtitle: "ניהול ומעקב אחר פרויקטי הבנייה",
  location: "מיקום",
  client: "קבלן / לקוח",
  stage: "שלב בנייה",
  progress: "התקדמות",
  assigned: "עובדים משויכים",
  profileName: "מוחמד",
});

for (const code of Object.keys(translations)) {
  translations[code] = { ...translations.en, ...translations[code] };
}

Object.assign(translations.he, {
  languageLabel: "שפה",
  demoCredentials: "עובד 123 / 123 · מנהל 111 / 111",
  adminNavDashboard: "דשבורד",
  today: "היום",
  liveClock: "שעון חי",
  todayHours: "שעות היום",
  monthHours: "שעות {month}",
  healthOverview: "סקירת מצב אתרים",
  recentActivity: "פעילות אחרונה",
  missingData: "נתוני נוכחות חסרים",
  unusualHours: "שעות חריגות",
  openSite: "פתח אתר",
  reportControls: "בקרת דוחות",
  selectSite: "בחר אתר",
  dateRange: "טווח תאריכים",
  contractorManager: "קבלן / מנהל אתר",
  projectStatus: "סטטוס פרויקט",
  siteHealth: "מצב אתרים",
  sitesNeedingAttention: "אתרים שדורשים תשומת לב",
  operationalAlerts: "התראות תפעוליות",
  stableSites: "אתרים יציבים",
  viewSite: "צפה באתר",
  reportStatus: "דוח מוכן",
  siteReport: "דוח אתר",
  openReport: "פתח דוח",
  quickStats: "נתונים מהירים",
  attention: "לתשומת לב",
  activeSites: "אתרים פעילים",
  online: "מחובר",
  lastUpdated: "עודכן לאחרונה",
  systemFooter: "מערכת נוכחות עובדים זרים",
  attendanceAlert: "זוהו עובדים חסרים",
  siteReviewAlert: "אתר דורש בדיקה",
  monthlyReportUpdated: "דוח חודשי עודכן",
  liveOperations: "תפעול בזמן אמת",
  reportMonth: "חודש דוח",
  selectedRange: "טווח נבחר",
  missingWorkersTitle: "עובדים שלא הגיעו היום",
  missingWorkersSubtitle: "רשימה ממוקדת ל-{date}",
  note: "הערה",
  close: "סגור",
  noNote: "אין הערה",
});

Object.assign(translations.he, {
  settings: "הגדרות",
  siteGpsSettings: "הגדרות GPS לאתר",
  gpsSettingsSubtitle: "הגדרת רדיוס כניסה לאתר הבנייה",
  siteName: "שם אתר",
  siteAddress: "כתובת אתר",
  latitude: "קו רוחב",
  longitude: "קו אורך",
  allowedRadius: "רדיוס מותר",
  allowedRadiusMeters: "רדיוס מותר במטרים",
  saveSettings: "שמור הגדרות",
  settingsSaved: "ההגדרות נשמרו",
  testCurrentLocation: "בדוק מיקום נוכחי",
  currentLatitude: "קו רוחב נוכחי",
  currentLongitude: "קו אורך נוכחי",
  siteLatitude: "קו רוחב של האתר",
  siteLongitude: "קו אורך של האתר",
  distanceFromSite: "מרחק מהאתר",
  insideAllowedRadius: "בתוך הרדיוס המותר",
  outsideAllowedRadius: "מחוץ לרדיוס המותר",
  gpsTestIntro: "פתח מהטלפון כדי להשוות את המיקום שלך למיקום האתר.",
  checkingLocation: "בודק מיקום...",
  locationPermissionRequired: "נדרש אישור מיקום כדי לבצע כניסה.",
  locationUnavailable: "לא ניתן לזהות את המיקום שלך. נסה שוב.",
  tooFarFromSite: "אתה רחוק מדי מאתר הבנייה. כניסה מותרת רק עד {radius} מטרים.",
  tooFarFromSiteWithDistance: "אתה נמצא במרחק {distance} מטרים מהאתר. כניסה מותרת רק עד {radius} מטרים.",
  withinRangeApproved: "אתה בתוך הטווח. הכניסה אושרה.",
  gpsSettingsInvalid: "יש להזין קו רוחב, קו אורך ורדיוס תקינים.",
  findCoordinates: "מצא קואורדינטות",
  searchingAddress: "מחפש כתובת...",
  addressUpdated: "הכתובת נמצאה. הקואורדינטות עודכנו.",
  addressNotFound: "לא הצלחתי למצוא את הכתובת. נסה כתובת מלאה יותר.",
  addressSuggestions: "הצעות כתובת",
  googleMapsReady: "השלמת כתובת של Google Maps פעילה.",
  googleMapsFallback: "חסר Google Maps API key. כרגע חיפוש הכתובת עובד במצב בדיקה פשוט.",
});

function timeToMinutes(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
}

function getRecordMinutes(record) {
  const entryMinutes = timeToMinutes(record.entry);
  const exitMinutes = timeToMinutes(record.exit);
  if (entryMinutes === null || exitMinutes === null || exitMinutes < entryMinutes) return null;
  return exitMinutes - entryMinutes;
}

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}

function getRecordTotal(record) {
  const minutes = getRecordMinutes(record);
  return minutes === null ? "" : formatMinutes(minutes);
}

function getDecimalHours(record) {
  const minutes = getRecordMinutes(record);
  return minutes === null ? 0 : minutes / 60;
}

function getDeterministicAttendance(workerId, dayIndex = 0) {
  const seed = workerId * 17 + dayIndex * 11;
  const entryMinutes = 390 + (seed % 61);
  const workMinutes = 510 + (seed % 91);
  return {
    entry: formatMinutes(entryMinutes),
    exit: formatMinutes(entryMinutes + workMinutes),
  };
}

function formatText(template, values = {}) {
  return Object.entries(values).reduce((message, [key, value]) => message.replaceAll(`{${key}}`, value), template || "");
}

function getInitialWorkerRecords(referenceDate = new Date()) {
  return getCurrentMonthDates(referenceDate)
    .filter((date) => !isSameDate(date, referenceDate))
    .map((date, index) => {
      const times = getDeterministicAttendance(1, index + 1);
      return {
        id: index + 1,
        date,
        entry: times.entry,
        exit: times.exit,
      };
    });
}

function getRecordsForMonth(records, referenceDate = new Date()) {
  const monthId = getMonthId(referenceDate);
  return records.filter((record) => isDateInMonth(record.date, monthId));
}

function getDailyReportDates(monthId, referenceDate = new Date()) {
  const dates = getReportDates(monthId, referenceDate);
  return dates.length ? [dates[0]] : [];
}

function normalizeAdminWorker(worker, index = 0, referenceDate = new Date()) {
  const hasStatus = Boolean(worker.status);
  const todayDate = getTodayDate(referenceDate);

  if (hasStatus) {
    return {
      ...worker,
      date: todayDate,
      entry: "",
      exit: "",
    };
  }

  const hasCompleteTimes = Boolean(worker.entry && worker.exit);
  const generatedTimes = hasCompleteTimes ? { entry: worker.entry, exit: worker.exit } : getDeterministicAttendance(worker.id, index);

  return {
    ...worker,
    date: todayDate,
    entry: generatedTimes.entry,
    exit: generatedTimes.exit,
    status: "",
  };
}

function getNormalizedAdminWorkers(workers, referenceDate = new Date()) {
  return workers.map((worker, index) => normalizeAdminWorker(worker, index, referenceDate));
}

function formatCurrentTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getMonthlyTotal(records) {
  return formatMinutes(records.reduce((sum, record) => sum + (getRecordMinutes(record) || 0), 0));
}

function getInitialWorkerLanguage() {
  const savedLanguage = localStorage.getItem(WORKER_LANGUAGE_STORAGE_KEY);
  return workerLanguages.some((item) => item.code === savedLanguage) ? savedLanguage : "en";
}

function getInitialAdminLanguage() {
  const savedLanguage = localStorage.getItem(ADMIN_LANGUAGE_STORAGE_KEY);
  return adminLanguages.some((item) => item.code === savedLanguage) ? savedLanguage : "en";
}

function getLanguageOptionLabel(item, currentLanguage, context) {
  if (currentLanguage === "he") return item.heLabel;
  if (context === "worker") return item.nativeLabel || item.enLabel;
  return item.enLabel;
}

function getStoredAdminWorkers() {
  try {
    const stored = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || "null");
    return Array.isArray(stored) ? getNormalizedAdminWorkers(stored) : getNormalizedAdminWorkers(workbookWorkers);
  } catch {
    return getNormalizedAdminWorkers(workbookWorkers);
  }
}

function normalizeGpsSettings(settings = {}) {
  const latitude = Number(settings.latitude);
  const longitude = Number(settings.longitude);
  const radiusMeters = Number(settings.radiusMeters);

  return {
    ...DEFAULT_SITE_GPS_SETTINGS,
    ...settings,
    latitude: Number.isFinite(latitude) ? latitude : DEFAULT_SITE_GPS_SETTINGS.latitude,
    longitude: Number.isFinite(longitude) ? longitude : DEFAULT_SITE_GPS_SETTINGS.longitude,
    radiusMeters: Number.isFinite(radiusMeters) && radiusMeters > 0 ? radiusMeters : DEFAULT_SITE_GPS_SETTINGS.radiusMeters,
  };
}

function getStoredGpsSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(GPS_SETTINGS_STORAGE_KEY) || "null");
    return normalizeGpsSettings(stored || DEFAULT_SITE_GPS_SETTINGS);
  } catch {
    return normalizeGpsSettings(DEFAULT_SITE_GPS_SETTINGS);
  }
}

function getGpsSiteLocation(gpsSettings) {
  return {
    latitude: Number(gpsSettings.latitude),
    longitude: Number(gpsSettings.longitude),
  };
}

function hasValidGpsSettings(gpsSettings) {
  const { latitude, longitude } = getGpsSiteLocation(gpsSettings);
  const radiusMeters = Number(gpsSettings.radiusMeters);
  return Number.isFinite(latitude) && Number.isFinite(longitude) && Number.isFinite(radiusMeters) && radiusMeters > 0;
}

function formatDistanceMeters(distanceMeters) {
  return new Intl.NumberFormat("en-US").format(Math.round(distanceMeters));
}

function formatGpsMessage(template, values) {
  return Object.entries(values).reduce((message, [key, value]) => message.replace(`{${key}}`, value), template);
}

function getSiteMetrics(workers, siteId, referenceDate = new Date()) {
  const todayDate = getTodayDate(referenceDate);
  const siteWorkers = workers.filter((worker) => worker.siteId === siteId && isSameDate(worker.date || todayDate, todayDate));
  const worked = siteWorkers.filter((worker) => worker.entry && worker.exit);
  const missing = siteWorkers.length - worked.length;
  const totalHours = siteWorkers.reduce((sum, worker) => sum + getDecimalHours(worker), 0);
  return {
    totalWorkers: siteWorkers.length,
    worked: worked.length,
    missing,
    attendance: siteWorkers.length ? Math.round((worked.length / siteWorkers.length) * 100) : 0,
    totalHours: Math.round(totalHours * 10) / 10,
  };
}

function getGlobalAdminMetrics(workers, referenceDate = new Date()) {
  const todayDate = getTodayDate(referenceDate);
  const todayWorkers = workers.filter((worker) => isSameDate(worker.date || todayDate, todayDate));
  const worked = todayWorkers.filter((worker) => worker.entry && worker.exit);
  const missing = todayWorkers.length - worked.length;
  const totalHours = todayWorkers.reduce((sum, worker) => sum + getDecimalHours(worker), 0);

  return {
    totalWorkers: todayWorkers.length,
    worked: worked.length,
    missing,
    attendance: todayWorkers.length ? Math.round((worked.length / todayWorkers.length) * 100) : 0,
    totalHours: Math.round(totalHours * 10) / 10,
  };
}

function getWorkerFullName(worker) {
  return [worker?.firstName, worker?.lastName].filter(Boolean).join(" ");
}

const countryLabels = {
  "סין": { en: "China", he: "סין" },
  "תאילנד": { en: "Thailand", he: "תאילנד" },
  "הודו": { en: "India", he: "הודו" },
  "רומניה": { en: "Romania", he: "רומניה" },
  "סרי לנקה": { en: "Sri Lanka", he: "סרי לנקה" },
  "נפאל": { en: "Nepal", he: "נפאל" },
  "מולדובה": { en: "Moldova", he: "מולדובה" },
  "אוקראינה": { en: "Ukraine", he: "אוקראינה" },
  "טורקיה": { en: "Turkey", he: "טורקיה" },
  "פלסטין": { en: "Palestine", he: "פלסטין" },
  "מצרים": { en: "Egypt", he: "מצרים" },
  "בנגלדש": { en: "Bangladesh", he: "בנגלדש" },
};

const statusLabels = {
  "מחלה": { en: "Illness", he: "מחלה" },
  "אינטר ויזה": { en: "Inter visa", he: "אינטר ויזה" },
  "אי הגעה": { en: "Did not arrive", he: "אי הגעה" },
  "תאונת עבודה": { en: "Work accident", he: "תאונת עבודה" },
};

function getCountryLabel(country, language) {
  return countryLabels[country]?.[language === "he" ? "he" : "en"] || country || "";
}

function getStatusLabel(status, language, t) {
  if (!status) return t.present;
  return statusLabels[status]?.[language === "he" ? "he" : "en"] || status;
}

function getWorkerMonthlySummary(worker, t, language, monthId = getDefaultReportMonthId()) {
  const records = getReportRowsForWorker(worker, monthId);
  const workedRecords = records.filter((record) => getRecordMinutes(record));
  const missingRecords = records.filter((record) => !getRecordMinutes(record));

  return {
    daysWorked: workedRecords.length,
    missingDays: missingRecords.length,
    totalHours: formatMinutes(records.reduce((sum, record) => sum + (getRecordMinutes(record) || 0), 0)),
  };
}

function getReportRowsForWorker(worker, monthId = getDefaultReportMonthId()) {
  const dates = getReportDates(monthId);
  return dates.map((date, index) => getDemoRecordForDate(worker, date, index));
}

function getDemoRecordForDate(worker, date, index = 0) {
  if (isSameDate(date, getTodayDate()) && worker) return { date, entry: worker.entry, exit: worker.exit, status: worker.status };
  const seed = worker?.id || 1;
  const day = Number(date.slice(0, 2));
  const month = Number(date.slice(3, 5));
  const marker = seed + day + month + index;
  if (marker % 7 === 0) return { date, entry: "", exit: "", status: "אי הגעה" };
  if (marker % 11 === 0) return { date, entry: "", exit: "", status: "מחלה" };
  const times = getDeterministicAttendance(seed, index + month);
  return { date, entry: times.entry, exit: times.exit, status: "" };
}

function getGlobalMonthlyHours(workers, monthId = getDefaultReportMonthId()) {
  const minutes = workers.reduce((sum, worker) => {
    return sum + getReportRowsForWorker(worker, monthId).reduce((recordSum, record) => recordSum + (getRecordMinutes(record) || 0), 0);
  }, 0);
  return Math.round((minutes / 60) * 10) / 10;
}

function getAttentionWorkers(workers, t, language) {
  return workers
    .map((worker) => {
      if (worker.status) return { worker, label: getStatusLabel(worker.status, language, t) };
      if (!worker.entry || !worker.exit) return { worker, label: t.missingData };
      const minutes = getRecordMinutes(worker);
      if (minutes && minutes > 11 * 60) return { worker, label: t.unusualHours };
      return null;
    })
    .filter(Boolean);
}

function getRecentActivity(workers, t, language) {
  const attention = getAttentionWorkers(workers, t, language);
  const sickWorker = attention.find(({ worker }) => worker.status);
  const missingWorkers = workers.filter((worker) => !worker.entry || !worker.exit).length;
  const updatedSite = siteDefinitions[0];

  return [
    {
      id: "worker-status",
      time: "08:20",
      text: sickWorker ? `${getWorkerFullName(sickWorker.worker)} · ${sickWorker.label}` : `${t.stableSites}`,
    },
    {
      id: "missing-workers",
      time: "09:05",
      text: `${missingWorkers} ${t.missingToday}`,
    },
    {
      id: "report-updated",
      time: "11:30",
      text: `${updatedSite.name} · ${t.reportStatus}`,
    },
    {
      id: "attendance-changed",
      time: "14:10",
      text: `${t.arrivedToday}: ${workers.filter((worker) => worker.entry && worker.exit).length}`,
    },
  ];
}

function getDashboardMissingWorkers(workers, t, language, referenceDate = new Date()) {
  const todayDate = getTodayDate(referenceDate);
  const todayWorkers = workers.filter((worker) => isSameDate(worker.date || todayDate, todayDate));
  const statusWorkers = todayWorkers.filter((worker) => worker.status || !worker.entry || !worker.exit);
  const fallbackWorkers = todayWorkers.filter((worker) => !statusWorkers.some((missingWorker) => missingWorker.id === worker.id));
  const focusedWorkers = [...statusWorkers, ...fallbackWorkers].slice(0, 3);

  return focusedWorkers.map((worker, index) => {
    const demoReason = worker.status || (index === 2 ? "אי הגעה" : "");
    return {
      worker,
      site: siteDefinitions.find((site) => site.id === worker.siteId),
      reason: getStatusLabel(demoReason || "אי הגעה", language, t),
      note: demoReason ? getStatusLabel(demoReason, language, t) : t.missingData,
    };
  });
}

function App() {
  const [fields, setFields] = useState(fieldInitialState);
  const [showError, setShowError] = useState(false);
  const [loginErrorType, setLoginErrorType] = useState("empty");
  const [screen, setScreen] = useState("login");
  const [adminView, setAdminView] = useState("dashboard");
  const [activeSiteId, setActiveSiteId] = useState(siteDefinitions[0].id);
  const [activeWorkerId, setActiveWorkerId] = useState(null);
  const [workerHistoryBackView, setWorkerHistoryBackView] = useState("site");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [activeEntryDate, setActiveEntryDate] = useState("");
  const [activeEntryTime, setActiveEntryTime] = useState("");
  const [records, setRecords] = useState(() => getInitialWorkerRecords());
  const [adminWorkers, setAdminWorkers] = useState(getStoredAdminWorkers);
  const [workerLanguage, setWorkerLanguage] = useState(getInitialWorkerLanguage);
  const [adminLanguage, setAdminLanguage] = useState(getInitialAdminLanguage);
  const [clock, setClock] = useState(new Date());
  const [selectedReportMonth, setSelectedReportMonth] = useState(() => getDefaultReportMonthId());
  const [gpsSettings, setGpsSettings] = useState(getStoredGpsSettings);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  const language = screen === "admin" ? adminLanguage : workerLanguage;
  const t = useMemo(() => translations[language], [language]);
  const isRtl = language === "he";
  const todayDate = getTodayDate(clock);
  const currentMonthId = getMonthId(clock);
  const currentMonthWorkerRecords = useMemo(() => getRecordsForMonth(records, clock), [records, currentMonthId]);
  const currentMonthLabel = getMonthLabel(currentMonthId, language);

  useEffect(() => {
    localStorage.setItem(WORKER_LANGUAGE_STORAGE_KEY, workerLanguage);
  }, [workerLanguage]);

  useEffect(() => {
    localStorage.setItem(ADMIN_LANGUAGE_STORAGE_KEY, adminLanguage);
  }, [adminLanguage]);

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminWorkers));
  }, [adminWorkers]);

  useEffect(() => {
    localStorage.setItem(GPS_SETTINGS_STORAGE_KEY, JSON.stringify(gpsSettings));
  }, [gpsSettings]);

  useEffect(() => {
    const interval = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setAdminWorkers((workers) => getNormalizedAdminWorkers(workers, clock));
    setSelectedReportMonth((monthId) => monthId || getDefaultReportMonthId(clock));
  }, [todayDate]);

  const handleWorkerLanguageChange = (event) => setWorkerLanguage(event.target.value);
  const handleAdminLanguageChange = (event) => setAdminLanguage(event.target.value);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((currentFields) => ({ ...currentFields, [name]: value }));
    if (showError) setShowError(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const username = fields.workerId.trim();
    const password = fields.password.trim();

    if (!username || !password) {
      setLoginErrorType("empty");
      setShowError(true);
      return;
    }

    if (username === WORKER_USERNAME && password === WORKER_PASSWORD) {
      setShowError(false);
      setScreen("dashboard");
      return;
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setShowError(false);
      setScreen("admin");
      setAdminView("dashboard");
      return;
    }

    setLoginErrorType("invalid");
    setShowError(true);
  };

  const handleLogout = () => {
    setScreen("login");
    setFields(fieldInitialState);
    setShowError(false);
    setIsCheckedIn(false);
    setActiveEntryDate("");
    setActiveEntryTime("");
    setAdminView("dashboard");
  };

  const handleAttendanceToggle = async () => {
    if (!isCheckedIn) {
      if (isCheckingLocation) return;
      setIsCheckingLocation(true);
      setGpsStatus({ type: "info", message: t.checkingLocation });

      try {
        if (!hasValidGpsSettings(gpsSettings)) {
          setGpsStatus({ type: "error", message: t.gpsSettingsInvalid });
          return;
        }

        const currentLocation = await getCurrentLocation();
        const siteLocation = getGpsSiteLocation(gpsSettings);
        const radiusMeters = Number(gpsSettings.radiusMeters);
        const result = isWithinAllowedRadius(currentLocation, siteLocation, radiusMeters);

        if (!result.isWithinRadius) {
          setGpsStatus({
            type: "error",
            message: formatGpsMessage(t.tooFarFromSiteWithDistance, {
              distance: formatDistanceMeters(result.distanceMeters),
              radius: formatDistanceMeters(radiusMeters),
            }),
          });
          return;
        }

        const entryDate = new Date();
        const entryDateLabel = getTodayDate(entryDate);
        const entryTime = formatCurrentTime(entryDate);
        setIsCheckedIn(true);
        setActiveEntryDate(entryDateLabel);
        setActiveEntryTime(entryTime);
        setRecords((currentRecords) => [
          { id: Date.now(), date: entryDateLabel, entry: entryTime, exit: "", source: "live" },
          ...currentRecords.filter((record) => !isSameDate(record.date, entryDateLabel)),
        ]);
        setGpsStatus({ type: "success", message: t.withinRangeApproved });
      } catch (error) {
        setGpsStatus({
          type: "error",
          message: error?.code === 1 ? t.locationPermissionRequired : t.locationUnavailable,
        });
      } finally {
        setIsCheckingLocation(false);
      }
      return;
    }

    const exitDate = new Date();
    const recordDate = getTodayDate(exitDate);
    const exitTime = formatCurrentTime(exitDate);
    setRecords((currentRecords) => [
      { id: Date.now(), date: activeEntryDate || recordDate, entry: activeEntryTime || formatCurrentTime(exitDate), exit: exitTime, source: "live" },
      ...currentRecords.filter((record) => !isSameDate(record.date, activeEntryDate || recordDate)),
    ]);
    setIsCheckedIn(false);
    setActiveEntryDate("");
    setActiveEntryTime("");
    setGpsStatus(null);
  };

  const updateAdminWorker = (workerId, field, value) => {
    setAdminWorkers((workers) =>
      workers.map((worker) => {
        if (worker.id !== workerId) return worker;
        const updated = { ...worker, [field]: value, date: todayDate };
        if (field === "status" && value) return { ...updated, entry: "", exit: "" };
        if (field === "status" && !value) return normalizeAdminWorker({ ...updated, status: "" });
        if ((field === "entry" || field === "exit") && value) return { ...updated, status: "" };
        return updated;
      }),
    );
  };

  if (screen === "history") {
    return (
      <DashboardShell t={t} isRtl={isRtl} language={language} onLanguageChange={handleWorkerLanguageChange} onLogout={handleLogout}>
        <FullHistoryView t={t} records={currentMonthWorkerRecords} monthLabel={currentMonthLabel} onBack={() => setScreen("dashboard")} />
      </DashboardShell>
    );
  }

  if (screen === "dashboard") {
    return (
      <DashboardShell t={t} isRtl={isRtl} language={language} onLanguageChange={handleWorkerLanguageChange} onLogout={handleLogout}>
        <WorkerDashboard
          t={t}
          isCheckedIn={isCheckedIn}
          entryTime={activeEntryTime}
          records={currentMonthWorkerRecords}
          onToggle={handleAttendanceToggle}
          isCheckingLocation={isCheckingLocation}
          gpsStatus={gpsStatus}
          onFullHistory={() => setScreen("history")}
        />
      </DashboardShell>
    );
  }

  if (screen === "admin") {
    return (
      <AdminShell
        t={t}
        isRtl={isRtl}
        language={language}
        clock={clock}
        workers={adminWorkers}
        activeView={adminView}
        onLanguageChange={handleAdminLanguageChange}
        onLogout={handleLogout}
        onNavigate={setAdminView}
      >
        {adminView === "dashboard" ? (
          <AdminDashboardView
            t={t}
            workers={adminWorkers}
            clock={clock}
            language={language}
            onOpenMissingWorkers={() => setAdminView("missingWorkers")}
            onOpenSite={(siteId) => {
              setActiveSiteId(siteId);
              setAdminView("site");
            }}
          />
        ) : null}
        {adminView === "missingWorkers" ? (
          <AdminMissingWorkersView
            t={t}
            language={language}
            workers={adminWorkers}
            clock={clock}
            onBack={() => setAdminView("dashboard")}
            onOpenSite={(siteId) => {
              setActiveSiteId(siteId);
              setAdminView("site");
            }}
          />
        ) : null}
        {adminView === "site" ? (
          <AdminSiteWorkersView
            t={t}
            language={language}
            siteId={activeSiteId}
            workers={adminWorkers}
            clock={clock}
            onBack={() => setAdminView("dashboard")}
            onUpdateWorker={updateAdminWorker}
            onOpenWorker={(workerId) => {
              setActiveWorkerId(workerId);
              setWorkerHistoryBackView("site");
              setAdminView("workerHistory");
            }}
          />
        ) : null}
        {adminView === "workerHistory" ? (
          <AdminWorkerHistoryView
            t={t}
            language={language}
            worker={adminWorkers.find((worker) => worker.id === activeWorkerId)}
            siteId={activeSiteId}
            clock={clock}
            onBack={() => setAdminView(workerHistoryBackView)}
          />
        ) : null}
        {adminView === "reports" ? (
          <AdminReportsView
            t={t}
            language={language}
            workers={adminWorkers}
            selectedMonth={selectedReportMonth}
            clock={clock}
            onMonthChange={setSelectedReportMonth}
            onOpenSite={(siteId) => {
              setActiveSiteId(siteId);
              setAdminView("siteReport");
            }}
          />
        ) : null}
        {adminView === "siteReport" ? (
          <AdminSiteReportView
            t={t}
            language={language}
            siteId={activeSiteId}
            workers={adminWorkers}
            selectedMonth={selectedReportMonth}
            clock={clock}
            onMonthChange={setSelectedReportMonth}
            onOpenWorker={(workerId) => {
              setActiveWorkerId(workerId);
              setWorkerHistoryBackView("siteReport");
              setAdminView("workerHistory");
            }}
            onBack={() => setAdminView("reports")}
          />
        ) : null}
        {adminView === "settings" ? (
          <AdminSettingsView
            t={t}
            gpsSettings={gpsSettings}
            onSaveGpsSettings={(nextSettings) => setGpsSettings(normalizeGpsSettings(nextSettings))}
          />
        ) : null}
        {adminView === "projects" ? <AdminProjectsView t={t} language={language} workers={adminWorkers} onOpenSite={(siteId) => {
          setActiveSiteId(siteId);
          setAdminView("site");
        }} /> : null}
      </AdminShell>
    );
  }

  return (
    <main className="app-shell" dir={isRtl ? "rtl" : "ltr"}>
      <div className="site-backdrop" aria-hidden="true" />
      <div className="screen-overlay" />
      <LanguageSelector language={language} onChange={handleWorkerLanguageChange} label={t.languageLabel} options={workerLanguages} context="worker" />
      <section className="login-layout">
        <header className="brand-header" aria-label="Connex">
          <BrandLockup subtitle={t.subtitle} />
        </header>
        <section className="login-card" aria-label="Connex login">
          <h2 className="login-title">{t.loginTitle}</h2>
          <form className="login-form" onSubmit={handleSubmit} noValidate dir={isRtl ? "rtl" : "ltr"}>
            <LoginField id="workerId" name="workerId" type="text" value={fields.workerId} onChange={handleChange} label={t.usernameLabel} placeholder={t.usernamePlaceholder} icon="user" />
            <LoginField id="password" name="password" type="password" value={fields.password} onChange={handleChange} label={t.passwordLabel} placeholder={t.passwordPlaceholder} icon="lock" />
            {showError ? <p className="form-error" role="alert">{loginErrorType === "empty" ? t.emptyFieldsError : t.invalidCredentialsError}</p> : null}
            <button type="submit">{t.signIn}</button>
            <p className="login-demo-note">{t.demoCredentials}</p>
          </form>
        </section>
      </section>
    </main>
  );
}

function LoginField({ id, name, type, value, onChange, label, placeholder, icon }) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-shell">
        <input id={id} name={name} type={type} value={value} onChange={onChange} autoComplete={type === "password" ? "current-password" : "username"} placeholder={placeholder} />
        <span className="input-icon" aria-hidden="true" />
      </div>
    </div>
  );
}

function DashboardShell({ t, isRtl, language, onLanguageChange, onLogout, children }) {
  return (
    <main className="worker-shell" dir={isRtl ? "rtl" : "ltr"}>
      <div className="worker-backdrop" aria-hidden="true" />
      <div className="worker-topbar">
        <button className="logout-button" type="button" onClick={onLogout}>{t.logout}</button>
        <LanguageSelector language={language} onChange={onLanguageChange} label={t.languageLabel} options={workerLanguages} context="worker" />
      </div>
      <header className="worker-brand" aria-label="Connex">
        <BrandLockup subtitle={t.dashboardSubtitle} dashboard />
      </header>
      {children}
    </main>
  );
}

function WorkerDashboard({ t, isCheckedIn, entryTime, records, onToggle, isCheckingLocation, gpsStatus, onFullHistory }) {
  return (
    <section className="worker-dashboard">
      <WorkerCard t={t} isCheckedIn={isCheckedIn} />
      <button className={isCheckedIn ? "attendance-button exit" : "attendance-button enter"} type="button" onClick={onToggle} disabled={isCheckingLocation}>
        <span className="attendance-main-text">{isCheckingLocation ? t.checkingLocation : isCheckedIn ? t.checkOut : t.checkIn}</span>
        {isCheckedIn ? <small className="attendance-time-text">{t.enteredAt.replace("{time}", entryTime || formatCurrentTime())}</small> : null}
      </button>
      {gpsStatus ? <p className={`gps-worker-message ${gpsStatus.type}`} role={gpsStatus.type === "error" ? "alert" : "status"}>{gpsStatus.message}</p> : null}
      <HistoryCard t={t} records={records.slice(0, 5)} onFullHistory={onFullHistory} />
    </section>
  );
}

function WorkerCard({ t, isCheckedIn }) {
  return (
    <section className="worker-card">
      <div className="worker-avatar" aria-hidden="true"><span className="avatar-helmet" /><span className="avatar-face" /><span className="avatar-shirt" /></div>
      <div className="worker-details">
        <h1>{t.workerName}</h1>
        <p>{t.passportNumber} <span>EL6998320</span></p>
        <p>{t.country} <span>{t.countryValue}</span></p>
      </div>
      <div className={isCheckedIn ? "status-pill working" : "status-pill idle"}><span />{isCheckedIn ? t.statusWorking : t.statusNotWorking}</div>
    </section>
  );
}

function HistoryCard({ t, records, onFullHistory }) {
  return (
    <section className="history-card">
      <SectionTitle>{t.recentHistory}</SectionTitle>
      <HistoryTable t={t} records={records} />
      <button className="full-history-button" type="button" onClick={onFullHistory}>{t.fullHistory}</button>
    </section>
  );
}

function FullHistoryView({ t, records, monthLabel, onBack }) {
  return (
    <section className="full-history-view">
      <button className="back-button" type="button" onClick={onBack}>{t.back}</button>
      <section className="history-card full">
        <SectionTitle>{formatText(t.monthlyHistory, { month: monthLabel })}</SectionTitle>
        <HistoryTable t={t} records={records} />
        <MonthlySummary t={t} records={records} />
      </section>
    </section>
  );
}

function HistoryTable({ t, records }) {
  return (
    <div className="history-table" role="table" aria-label={t.recentHistory}>
      <div className="history-row header" role="row"><span>{t.date}</span><span>{t.entry}</span><span>{t.exit}</span><span>{t.totalHours}</span></div>
      {records.map((record) => (
        <div className="history-row" role="row" key={record.id}><span>{record.date}</span><span>{record.entry}</span><span>{record.exit || t.noExitYet}</span><span>{record.exit ? getRecordTotal(record) : "-"}</span></div>
      ))}
    </div>
  );
}

function MonthlySummary({ t, records }) {
  return <section className="monthly-summary"><h3>{t.monthlySummary}</h3><p>{t.totalMonthlyHours.replace("{hours}", getMonthlyTotal(records))}</p></section>;
}

function AdminShell({ t, isRtl, language, clock, workers, activeView, onLanguageChange, onLogout, onNavigate, children }) {
  const sidebarMetrics = getGlobalAdminMetrics(workers || [], clock);

  return (
    <main className="admin-shell" dir={isRtl ? "rtl" : "ltr"}>
      <div className="admin-backdrop" aria-hidden="true" />
      <aside className="admin-sidebar">
        <section className="sidebar-profile-card" aria-label={t.managerRole}>
          <span className="profile-avatar sidebar-avatar" aria-hidden="true" />
          <div>
            <strong>{t.profileName}</strong>
            <small>{t.managerRole}</small>
          </div>
          <span className="sidebar-online"><i />{t.online}</span>
          <time>{formatCurrentTime(clock)}</time>
        </section>

        <nav className="admin-nav" aria-label="Admin navigation">
          <button className={["dashboard", "missingWorkers"].includes(activeView) ? "active" : ""} type="button" onClick={() => onNavigate("dashboard")}>{t.adminTitle}</button>
          <button className={["projects", "site", "workerHistory"].includes(activeView) ? "active" : ""} type="button" onClick={() => onNavigate("projects")}>{t.sites}</button>
          <button className={activeView === "reports" || activeView === "siteReport" ? "active" : ""} type="button" onClick={() => onNavigate("reports")}>{t.reports}</button>
          <button className={activeView === "settings" ? "active" : ""} type="button" onClick={() => onNavigate("settings")}>{t.settings}</button>
        </nav>

        <section className="sidebar-mini-stats" aria-label={t.quickStats}>
          <small>{t.quickStats}</small>
          <div><span>{t.attendancePercent}</span><strong>{sidebarMetrics.attendance}%</strong></div>
          <div><span>{t.missingToday}</span><strong>{sidebarMetrics.missing}</strong></div>
          <div><span>{t.activeSites}</span><strong>{siteDefinitions.length}</strong></div>
        </section>

        <footer className="sidebar-footer">
          <strong>Connex</strong>
        </footer>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <button className="admin-topbar-logout" type="button" onClick={onLogout}>{t.logout}</button>
          <div className="admin-logo-center"><BrandLockup subtitle={t.dashboardSubtitle} dashboard /></div>
          <div className="admin-tools">
            <div className="admin-clock"><span />{formatCurrentTime(clock)}</div>
            <LanguageSelector language={language} onChange={onLanguageChange} label={t.languageLabel} options={adminLanguages} context="admin" />
          </div>
        </header>
        {children}
      </section>
      <AdminMobileNav t={t} activeView={activeView} onNavigate={onNavigate} />
    </main>
  );
}

function AdminMobileNav({ t, activeView, onNavigate }) {
  const items = [
    { id: "dashboard", label: t.adminNavDashboard || t.adminTitle, icon: "dashboard", active: ["dashboard", "missingWorkers"].includes(activeView) },
    { id: "projects", label: t.sites, icon: "sites", active: ["projects", "site", "workerHistory"].includes(activeView) },
    { id: "reports", label: t.reports, icon: "reports", active: activeView === "reports" || activeView === "siteReport" },
    { id: "settings", label: t.settings, icon: "settings", active: activeView === "settings" },
  ];

  return (
    <nav className="admin-bottom-nav" aria-label="Mobile admin navigation">
      {items.map((item) => (
        <button key={item.id} className={item.active ? "active" : ""} type="button" onClick={() => onNavigate(item.id)} aria-current={item.active ? "page" : undefined}>
          <NavIcon type={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function NavIcon({ type }) {
  if (type === "sites") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M9 20v-7h6v7" />
        <path d="M4 20h16" />
      </svg>
    );
  }

  if (type === "reports") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M14 3v4h4" />
        <path d="M9 16h6M9 12h6" />
      </svg>
    );
  }

  if (type === "settings") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5z" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05a2 2 0 0 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6l-.03.04a2 2 0 0 1-3.94 0L10 20a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.05.05a2 2 0 0 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1l-.04-.03a2 2 0 0 1 0-3.94L4 10a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.05-.05a2 2 0 0 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6l.03-.04a2 2 0 0 1 3.94 0L14 4a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.05-.05a2 2 0 0 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9c.22.35.42.68.6 1l.04.03a2 2 0 0 1 0 3.94L20 14c-.18.32-.38.65-.6 1z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 13h7V4H4zM13 20h7V4h-7zM4 20h7v-5H4z" />
    </svg>
  );
}

function ReportActionIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path className="report-icon-sheet" d="M8 4.5h11.5L24 9v18.5H8z" />
      <path className="report-icon-fold" d="M19.5 4.5V9H24" />
      <path className="report-icon-line" d="M12 13h8" />
      <path className="report-icon-line" d="M12 17h5" />
      <path className="report-icon-chart" d="M12 23v-3.2M16 23v-5.4M20 23v-8" />
      <path className="report-icon-base" d="M11 23h10" />
    </svg>
  );
}

function AdminDashboardView({ t, workers, clock, language, onOpenMissingWorkers, onOpenSite }) {
  const todayDate = getTodayDate(clock);
  const monthId = getMonthId(clock);
  const monthLabel = getMonthLabel(monthId, language);
  const globalMetrics = getGlobalAdminMetrics(workers, clock);
  const monthHours = getGlobalMonthlyHours(workers, monthId);
  const dashboardMissingWorkers = getDashboardMissingWorkers(workers, t, language, clock);
  const siteHealth = siteDefinitions
    .map((site) => ({ site, metrics: getSiteMetrics(workers, site.id, clock) }))
    .sort((left, right) => right.metrics.missing - left.metrics.missing || left.metrics.attendance - right.metrics.attendance);
  const attentionSites = siteHealth.filter(({ metrics }) => metrics.missing > 0);
  const attentionWorkers = getAttentionWorkers(workers, t, language).slice(0, 5);
  const recentActivity = getRecentActivity(workers, t, language);

  return (
    <section className="admin-page admin-dashboard-page">
      <PageTitle title={t.adminTitle} subtitle={t.adminSubtitle} />
      <section className="control-center-hero">
        <div className="control-hero-main">
          <div className="control-hero-meta">
            <span>{t.today}</span>
            <strong>{todayDate}</strong>
            <span>{t.liveClock}</span>
            <strong>{formatCurrentTime(clock)}</strong>
          </div>
          <div>
            <small>{t.attendancePercent}</small>
            <h2>{globalMetrics.attendance}%</h2>
            <div className="overview-progress"><i style={{ width: `${globalMetrics.attendance}%` }} /></div>
          </div>
        </div>
        <div className="control-kpi-grid">
          <Metric value={globalMetrics.totalWorkers} label={t.totalWorkers} tone="blue" />
          <Metric value={globalMetrics.worked} label={t.arrivedToday} tone="green" />
          <ActionMetric value={dashboardMissingWorkers.length} label={t.missingToday} tone="red" onClick={onOpenMissingWorkers} />
          <Metric value={globalMetrics.totalHours} label={t.todayHours} tone="purple" />
          <Metric value={monthHours} label={formatText(t.monthHours, { month: monthLabel })} tone="blue" />
        </div>
      </section>
      <section className="dashboard-ops-grid">
        <section className="needs-attention-panel">
          <small>{t.operationalAlerts}</small>
          <h2>{attentionSites.length ? t.sitesNeedingAttention : t.stableSites}</h2>
          <div className="attention-worker-list">
            {attentionWorkers.map(({ worker, label }) => (
              <button type="button" key={worker.id} onClick={() => onOpenSite(worker.siteId)}>
                <span>{getWorkerFullName(worker)}</span>
                <strong>{label}</strong>
                <small>{siteDefinitions.find((site) => site.id === worker.siteId)?.name}</small>
              </button>
            ))}
          </div>
        </section>
        <section className="recent-activity-panel">
          <small>{t.recentActivity}</small>
          <div className="activity-feed">
            {recentActivity.map((item) => (
              <div key={item.id}>
                <span />
                <p>{item.text}</p>
                <small>{item.time}</small>
              </div>
            ))}
          </div>
        </section>
      </section>
      <section className="site-health-panel">
        <div className="panel-heading">
          <small>{t.healthOverview}</small>
          <h2>{t.siteHealth}</h2>
        </div>
        <div className="site-health-grid">
          {siteHealth.map(({ site, metrics }) => <SiteHealthCard key={site.id} site={site} metrics={metrics} t={t} onOpen={() => onOpenSite(site.id)} />)}
        </div>
      </section>
    </section>
  );
}

function AdminMissingWorkersView({ t, language, workers, clock, onBack, onOpenSite }) {
  const todayDate = getTodayDate(clock);
  const missingWorkers = getDashboardMissingWorkers(workers, t, language, clock);

  return (
    <section className="admin-page missing-workers-page">
      <button className="admin-back-button" type="button" onClick={onBack}>{t.back}</button>
      <div className="missing-workers-header">
        <div>
          <small>{t.missingToday}</small>
          <h2>{t.missingWorkersTitle}</h2>
          <p>{formatText(t.missingWorkersSubtitle, { date: todayDate })}</p>
        </div>
      </div>
      <div className="missing-workers-list">
        {missingWorkers.map(({ worker, site, reason }) => (
          <article key={worker.id} className="missing-worker-card">
            <div>
              <h3>{getWorkerFullName(worker)}</h3>
              <p>{t.passport}: {worker.passport}</p>
            </div>
            <div>
              <span>{t.workersOnSite}</span>
              <strong>{site?.name || "-"}</strong>
            </div>
            <div>
              <span>{t.country}</span>
              <strong>{getCountryLabel(worker.country, language)}</strong>
            </div>
            <div>
              <span>{t.statusReason}</span>
              <strong>{reason}</strong>
            </div>
            <div>
              <span>{t.date}</span>
              <strong>{worker.date || todayDate}</strong>
            </div>
            <button type="button" onClick={() => onOpenSite(worker.siteId)}>{t.openSite}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminSettingsView({ t, gpsSettings, onSaveGpsSettings }) {
  const [draft, setDraft] = useState(gpsSettings);
  const [saveMessage, setSaveMessage] = useState("");
  const [testState, setTestState] = useState({ status: "idle" });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressStatus, setAddressStatus] = useState("");
  const [isAddressSearching, setIsAddressSearching] = useState(false);

  useEffect(() => {
    setDraft(gpsSettings);
  }, [gpsSettings]);

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaveMessage("");
    if (field === "siteAddress") setAddressStatus("");
  };

  useEffect(() => {
    const query = String(draft.siteAddress || "").trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      return undefined;
    }

    let isCancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const suggestions = await searchAddressSuggestions(query);
        if (!isCancelled) setAddressSuggestions(suggestions.slice(0, 5));
      } catch {
        if (!isCancelled) setAddressSuggestions([]);
      }
    }, 450);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [draft.siteAddress]);

  const applyGeocodeResult = (result) => {
    setDraft((current) => ({
      ...current,
      siteAddress: result.address || result.description || current.siteAddress,
      latitude: Number(result.latitude).toFixed(6),
      longitude: Number(result.longitude).toFixed(6),
    }));
    setAddressSuggestions([]);
    setAddressStatus(t.addressUpdated);
    setSaveMessage("");
  };

  const handleFindCoordinates = async (address = draft.siteAddress) => {
    const query = String(address || "").trim();
    if (query.length < 3) {
      setAddressStatus(t.addressNotFound);
      return;
    }

    setIsAddressSearching(true);
    setAddressStatus(t.searchingAddress);

    try {
      const result = await geocodeAddress(query);
      applyGeocodeResult(result);
    } catch {
      setAddressStatus(t.addressNotFound);
    } finally {
      setIsAddressSearching(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    if (Number.isFinite(suggestion.latitude) && Number.isFinite(suggestion.longitude)) {
      applyGeocodeResult(suggestion);
      return;
    }

    await handleFindCoordinates(suggestion.description);
  };

  const getValidatedDraft = () => {
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);
    const radiusMeters = Number(draft.radiusMeters);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(radiusMeters) || radiusMeters <= 0) return null;
    return {
      ...draft,
      latitude,
      longitude,
      radiusMeters,
    };
  };

  const handleSave = (event) => {
    event.preventDefault();
    const nextSettings = getValidatedDraft();
    if (!nextSettings) {
      setSaveMessage(t.gpsSettingsInvalid);
      return;
    }
    onSaveGpsSettings(nextSettings);
    setSaveMessage(t.settingsSaved);
  };

  const handleTestLocation = async () => {
    const nextSettings = getValidatedDraft();
    if (!nextSettings) {
      setTestState({ status: "error", message: t.gpsSettingsInvalid });
      return;
    }

    setTestState({ status: "checking", message: t.checkingLocation });

    try {
      const currentLocation = await getCurrentLocation();
      const distanceMeters = calculateDistanceMeters(
        currentLocation.latitude,
        currentLocation.longitude,
        nextSettings.latitude,
        nextSettings.longitude,
      );
      const isInside = distanceMeters <= nextSettings.radiusMeters;

      setTestState({
        status: isInside ? "success" : "error",
        currentLocation,
        distanceMeters,
        isInside,
        settings: nextSettings,
      });
    } catch (error) {
      setTestState({
        status: "error",
        message: error?.code === 1 ? t.locationPermissionRequired : t.locationUnavailable,
      });
    }
  };

  return (
    <section className="admin-page admin-settings-page">
      <PageTitle title={t.settings} subtitle={t.gpsSettingsSubtitle} />
      <section className="gps-settings-card">
        <div className="panel-heading">
          <small>{t.settings}</small>
          <h2>{t.siteGpsSettings}</h2>
          <p>{t.gpsTestIntro}</p>
          <p className="gps-provider-note">{hasGoogleMapsApiKey() ? t.googleMapsReady : t.googleMapsFallback}</p>
        </div>
        <form className="gps-settings-form" onSubmit={handleSave}>
          <label>
            <span>{t.siteName}</span>
            <input value={draft.siteName} onChange={(event) => updateDraft("siteName", event.target.value)} />
          </label>
          <label className="gps-address-field">
            <span>{t.siteAddress}</span>
            <input
              value={draft.siteAddress}
              list="gps-address-suggestions"
              onBlur={() => handleFindCoordinates()}
              onChange={(event) => updateDraft("siteAddress", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleFindCoordinates();
                }
              }}
            />
            <datalist id="gps-address-suggestions">
              {addressSuggestions.map((suggestion) => (
                <option key={suggestion.id || suggestion.description} value={suggestion.description} />
              ))}
            </datalist>
          </label>
          {addressSuggestions.length ? (
            <div className="gps-address-suggestions" aria-label={t.addressSuggestions}>
              {addressSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id || suggestion.description}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.description}
                </button>
              ))}
            </div>
          ) : null}
          <label>
            <span>{t.latitude}</span>
            <input type="number" step="any" value={draft.latitude} onChange={(event) => updateDraft("latitude", event.target.value)} />
          </label>
          <label>
            <span>{t.longitude}</span>
            <input type="number" step="any" value={draft.longitude} onChange={(event) => updateDraft("longitude", event.target.value)} />
          </label>
          <label>
            <span>{t.allowedRadiusMeters}</span>
            <input type="number" min="1" step="1" value={draft.radiusMeters} onChange={(event) => updateDraft("radiusMeters", event.target.value)} />
          </label>
          <div className="gps-settings-actions">
            <button type="submit">{t.saveSettings}</button>
            <button type="button" onClick={() => handleFindCoordinates()} disabled={isAddressSearching}>{isAddressSearching ? t.searchingAddress : t.findCoordinates}</button>
            <button type="button" onClick={handleTestLocation}>{testState.status === "checking" ? t.checkingLocation : t.testCurrentLocation}</button>
          </div>
          {addressStatus ? <p className="gps-address-status" role="status">{addressStatus}</p> : null}
          {saveMessage ? <p className="gps-save-message" role="status">{saveMessage}</p> : null}
        </form>
        {testState.status !== "idle" ? (
          <section className={`gps-test-result ${testState.status}`} aria-live="polite">
            {testState.message ? <p>{testState.message}</p> : (
              <>
                <strong>{testState.isInside ? t.insideAllowedRadius : t.outsideAllowedRadius}</strong>
                <dl>
                  <div><dt>{t.currentLatitude}</dt><dd>{testState.currentLocation.latitude.toFixed(6)}</dd></div>
                  <div><dt>{t.currentLongitude}</dt><dd>{testState.currentLocation.longitude.toFixed(6)}</dd></div>
                  <div><dt>{t.siteLatitude}</dt><dd>{testState.settings.latitude}</dd></div>
                  <div><dt>{t.siteLongitude}</dt><dd>{testState.settings.longitude}</dd></div>
                  <div><dt>{t.distanceFromSite}</dt><dd>{formatDistanceMeters(testState.distanceMeters)} m</dd></div>
                  <div><dt>{t.allowedRadius}</dt><dd>{formatDistanceMeters(testState.settings.radiusMeters)} m</dd></div>
                </dl>
              </>
            )}
          </section>
        ) : null}
      </section>
    </section>
  );
}

function SiteHealthCard({ site, metrics, t, onOpen }) {
  return (
    <article className="site-health-card">
      <div>
        <span className={metrics.missing ? "health-badge warning" : "health-badge ok"}>{site.status}</span>
        <h3>{site.name}</h3>
        <p>{site.stage}</p>
      </div>
      <strong>{metrics.attendance}%</strong>
      <div className="site-health-progress"><i style={{ width: `${metrics.attendance}%` }} /></div>
      <div className="site-health-stats">
        <span>{metrics.worked} {t.arrivedToday}</span>
        <span>{metrics.missing} {t.missingToday}</span>
      </div>
      <button type="button" onClick={onOpen}>{t.openSite}</button>
    </article>
  );
}

function AdminSiteCard({ site, metrics, t, onClick }) {
  return (
    <button className="admin-site-card" type="button" onClick={onClick}>
      <img src={site.image} alt="" />
      <h3>{site.name}</h3>
      <div className="site-metrics">
        <Metric value={metrics.totalWorkers} label={t.totalWorkers} tone="blue" />
        <Metric value={metrics.missing} label={t.missingToday} tone="red" />
        <Metric value={`${metrics.attendance}%`} label={t.attendancePercent} tone="green" />
        <Metric value={metrics.totalHours} label={t.totalWorkHours} tone="blue" />
      </div>
    </button>
  );
}

function AdminTableFrame({ children, compact = false }) {
  const topRef = useRef(null);
  const bodyRef = useRef(null);
  const syncScroll = (source, target) => {
    if (source.current && target.current && target.current.scrollLeft !== source.current.scrollLeft) {
      target.current.scrollLeft = source.current.scrollLeft;
    }
  };

  return (
    <div className={compact ? "admin-table-shell compact-table" : "admin-table-shell"}>
      <div
        className="admin-scroll-top"
        ref={topRef}
        onScroll={() => syncScroll(topRef, bodyRef)}
        aria-hidden="true"
      >
        <div />
      </div>
      <div className="admin-table-wrap" ref={bodyRef} onScroll={() => syncScroll(bodyRef, topRef)}>
        {children}
      </div>
    </div>
  );
}

function AdminSiteWorkersView({ t, language, siteId, workers, clock, onBack, onUpdateWorker, onOpenWorker }) {
  const todayDate = getTodayDate(clock);
  const site = siteDefinitions.find((item) => item.id === siteId);
  const siteWorkers = workers.filter((worker) => worker.siteId === siteId && isSameDate(worker.date || todayDate, todayDate));
  const metrics = getSiteMetrics(workers, siteId, clock);
  return (
    <section className="admin-page">
      <button className="admin-back-button" type="button" onClick={onBack}>{t.back}</button>
      <PageTitle title={t.workersOnSite} subtitle={site.name} />
      <div className="admin-summary-strip">
        <Metric value={metrics.missing} label={t.missingToday} tone="red" />
        <Metric value={metrics.totalWorkers} label={t.totalWorkers} tone="blue" />
        <Metric value={metrics.worked} label={t.worked} tone="green" />
        <Metric value={metrics.totalHours} label={t.totalWorkHours} tone="purple" />
      </div>
      <AdminTableFrame>
        <table className="admin-table workers-table">
          <thead><tr><th>{t.date}</th><th>{t.workerNameColumn}</th><th>{t.passport}</th><th>{t.country}</th><th>{t.entry}</th><th>{t.exit}</th><th>{t.totalHours}</th><th>{t.statusReason}</th></tr></thead>
          <tbody>
            {siteWorkers.map((worker) => (
              <tr className={worker.status ? "status-alert-row" : ""} key={worker.id} onClick={() => onOpenWorker(worker.id)}>
                <td>{worker.date}</td><td>{getWorkerFullName(worker)}</td><td>{worker.passport}</td><td>{getCountryLabel(worker.country, language)}</td>
                <td><input type="time" value={worker.entry} onClick={(event) => event.stopPropagation()} onChange={(event) => onUpdateWorker(worker.id, "entry", event.target.value)} /></td>
                <td><input type="time" value={worker.exit} onClick={(event) => event.stopPropagation()} onChange={(event) => onUpdateWorker(worker.id, "exit", event.target.value)} /></td>
                <td>{getRecordTotal(worker) || "-"}</td>
                <td>
                  <select value={worker.status} onClick={(event) => event.stopPropagation()} onChange={(event) => onUpdateWorker(worker.id, "status", event.target.value)}>
                    <option value="">{t.present}</option>
                    {statusReasons.map((reason) => <option key={reason} value={reason}>{getStatusLabel(reason, language, t)}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableFrame>
    </section>
  );
}

function AdminWorkerHistoryView({ t, language, worker, siteId, clock, onBack }) {
  const site = siteDefinitions.find((item) => item.id === siteId);
  const history = getDemoWorkerHistory(worker, { includeToday: true, referenceDate: clock });
  const fullName = getWorkerFullName(worker);
  const monthlyTotal = getMonthlyHoursForWorker(worker, getDefaultReportMonthId(clock));
  return (
    <section className="admin-page">
      <button className="admin-back-button" type="button" onClick={onBack}>{t.back}</button>
      <PageTitle title={t.monthlyWorkerHistory} subtitle={`${fullName} · ${site?.name || ""}`} />
      <div className="worker-history-profile">
        <div className="worker-history-avatar" aria-hidden="true"><span className="avatar-helmet" /><span className="avatar-face" /><span className="avatar-shirt" /></div>
        <div><h3>{fullName}</h3><p>{t.passport}: {worker?.passport} · {t.country}: {getCountryLabel(worker?.country, language)}</p></div>
      </div>
      <section className="worker-history-summary">
        <Metric value={monthlyTotal} label={t.monthlyHours} tone="purple" />
      </section>
      <AdminTableFrame>
        <table className="admin-table">
          <thead><tr><th>{t.date}</th><th>{t.entry}</th><th>{t.exit}</th><th>{t.totalHours}</th><th>{t.statusReason}</th></tr></thead>
          <tbody>{history.map((record) => <tr className={record.status ? "status-alert-row" : ""} key={record.date}><td>{record.date}</td><td>{record.entry || "-"}</td><td>{record.exit || "-"}</td><td>{getRecordTotal(record) || "-"}</td><td>{getStatusLabel(record.status, language, t)}</td></tr>)}</tbody>
        </table>
      </AdminTableFrame>
    </section>
  );
}

function AdminReportsView({ t, language, workers, selectedMonth, clock, onMonthChange, onOpenSite }) {
  const [reportMode, setReportMode] = useState("daily");
  const reportMonths = getReportMonths(clock);
  const rangeLabel = getReportRangeLabel(selectedMonth, clock);

  return (
    <section className="admin-page reports-analytics-page">
      <PageTitle title={t.reports} subtitle={t.reportSelectionSubtitle} />
      <section className="report-control-panel">
        <div className="report-mode-preview" role="tablist" aria-label={t.reports}>
          <button className={reportMode === "daily" ? "active" : ""} type="button" onClick={() => setReportMode("daily")}>{t.dailyReport}</button>
          <button className={reportMode === "monthly" ? "active" : ""} type="button" onClick={() => setReportMode("monthly")}>{t.monthlyReport}</button>
        </div>
        <label className="report-range-select">
          <span>{t.reportMonth}</span>
          <select value={selectedMonth} onChange={(event) => onMonthChange(event.target.value)}>
            {reportMonths.map((month) => (
              <option key={month.id} value={month.id}>{language === "he" ? month.heLabel : month.label}</option>
            ))}
          </select>
        </label>
        <div className="report-range-summary">
          <small>{t.reportControls}</small>
          <h2>{t.dateRange}</h2>
          <p>{rangeLabel}</p>
        </div>
        <div className="selected-site-placeholder">
          <small>{t.selectSite}</small>
          <strong>{siteDefinitions.length}</strong>
          <span>{t.sites}</span>
        </div>
      </section>
      <div className="report-selector-grid">
        {siteDefinitions.map((site) => {
          const metrics = getSiteMetrics(workers, site.id, clock);
          const monthlyHours = getSiteMonthlyHours(workers, site.id, selectedMonth);
          return (
            <article className="report-selector-card" key={site.id}>
              <div className="report-selector-main">
                <div className="report-selector-copy">
                  <h3>{site.name}</h3>
                  <p>{rangeLabel}</p>
                  <small className="report-card-mode">{reportMode === "daily" ? t.dailyReport : t.monthlyReport}</small>
                </div>
                <button className="report-action-button" type="button" onClick={() => onOpenSite(site.id)} aria-label={`${t.siteReport}: ${site.name}`}>
                  <span className="report-action-label">{t.siteReport}</span>
                  <span className="report-selector-icon">
                    <ReportActionIcon />
                  </span>
                </button>
              </div>
              <div className="report-selector-metrics">
                {reportMode === "daily" ? (
                  <>
                    <Metric value={metrics.worked} label={t.arrivedToday} tone="green" />
                    <Metric value={metrics.missing} label={t.missingToday} tone="red" />
                    <Metric value={metrics.totalWorkers} label={t.totalWorkers} tone="blue" />
                    <Metric value={metrics.totalHours} label={t.todayHours} tone="purple" />
                  </>
                ) : (
                  <>
                    <Metric value={metrics.totalWorkers} label={t.totalWorkers} tone="blue" />
                    <Metric value={monthlyHours} label={t.monthlyHours} tone="purple" />
                    <Metric value={metrics.missing} label={t.missingDays} tone="red" />
                    <Metric value={metrics.worked} label={t.daysWorked} tone="green" />
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AdminSiteReportView({ t, language, siteId, workers, selectedMonth, clock, onMonthChange, onOpenWorker, onBack }) {
  const [reportMode, setReportMode] = useState("daily");
  const reportMonths = getReportMonths(clock);
  const site = siteDefinitions.find((item) => item.id === siteId);
  const todayDate = getTodayDate(clock);
  const siteWorkers = workers.filter((worker) => worker.siteId === siteId && isSameDate(worker.date || todayDate, todayDate));
  const siteTotal = getSiteMonthlyHours(workers, siteId, selectedMonth);
  const metrics = getSiteMetrics(workers, siteId, clock);
  const dailyRows = getDailyReportDates(selectedMonth, clock).flatMap((date) =>
    siteWorkers.map((worker) => {
      const record = getReportRowsForWorker(worker, selectedMonth).find((item) => isSameDate(item.date, date));
      return { worker, record: record || { date, entry: "", exit: "", status: "" } };
    }),
  );

  return (
    <section className="admin-page">
      <button className="admin-back-button" type="button" onClick={onBack}>{t.back}</button>
      <PageTitle title={t.reports} subtitle={site.name} />
      <section className="report-detail-controls">
        <div className="report-tabs" role="tablist" aria-label={t.reports}>
          <button className={reportMode === "daily" ? "active" : ""} type="button" onClick={() => setReportMode("daily")}>{t.dailyReport}</button>
          <button className={reportMode === "monthly" ? "active" : ""} type="button" onClick={() => setReportMode("monthly")}>{t.monthlyReport}</button>
        </div>
        <label className="report-range-select">
          <span>{t.reportMonth}</span>
          <select value={selectedMonth} onChange={(event) => onMonthChange(event.target.value)}>
            {reportMonths.map((month) => (
              <option key={month.id} value={month.id}>{language === "he" ? month.heLabel : month.label}</option>
            ))}
          </select>
        </label>
        <div>
          <small>{t.selectedRange}</small>
          <strong>{getReportRangeLabel(selectedMonth, clock)}</strong>
        </div>
      </section>
      <section className="report-summary-card">
        <Metric value={siteWorkers.length} label={t.totalWorkers} tone="blue" />
        <Metric value={metrics.worked} label={t.arrivedToday} tone="green" />
        <Metric value={metrics.missing} label={t.missingToday} tone="red" />
        <Metric value={siteTotal} label={t.siteMonthlyTotal} tone="purple" />
      </section>
      {reportMode === "daily" ? (
        <AdminTableFrame>
          <table className="admin-table daily-report-table">
            <thead>
              <tr><th>{t.date}</th><th>{t.workerNameColumn}</th><th>{t.passport}</th><th>{t.country}</th><th>{t.entry}</th><th>{t.exit}</th><th>{t.totalHours}</th><th>{t.statusReason}</th></tr>
            </thead>
            <tbody>
              {dailyRows.map(({ worker, record }) => (
                <tr className={record.status ? "status-alert-row" : ""} key={`${worker.id}-${record.date}`} onClick={() => onOpenWorker(worker.id)}>
                  <td>{record.date}</td><td>{getWorkerFullName(worker)}</td><td>{worker.passport}</td><td>{getCountryLabel(worker.country, language)}</td><td>{record.entry || "-"}</td><td>{record.exit || "-"}</td><td>{getRecordTotal(record) || "-"}</td><td>{getStatusLabel(record.status, language, t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableFrame>
      ) : (
        <AdminTableFrame>
          <table className="admin-table monthly-report-table">
            <thead>
              <tr><th>{t.workerNameColumn}</th><th>{t.passport}</th><th>{t.country}</th><th>{t.daysWorked}</th><th>{t.missingDays}</th><th>{t.monthlyHours}</th></tr>
            </thead>
            <tbody>
              {siteWorkers.map((worker) => {
                const summary = getWorkerMonthlySummary(worker, t, language, selectedMonth);
                return (
                  <tr className={worker.status ? "status-alert-row" : ""} key={worker.id} onClick={() => onOpenWorker(worker.id)}>
                    <td>{getWorkerFullName(worker)}</td><td>{worker.passport}</td><td>{getCountryLabel(worker.country, language)}</td><td>{summary.daysWorked}</td><td>{summary.missingDays}</td><td>{summary.totalHours}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminTableFrame>
      )}
    </section>
  );
}

function AdminProjectsView({ t, language, workers, onOpenSite }) {
  return (
    <section className="admin-page sites-management-page">
      <PageTitle title={t.sites} subtitle={t.projectsSubtitle} />
      <div className="project-list">
        {siteDefinitions.map((site) => {
          const metrics = getSiteMetrics(workers, site.id);
          return (
            <article className="project-card" key={site.id}>
              <div className="project-image-wrap">
                <img src={site.image} alt="" />
                <span className="project-image-badge">{site.status}</span>
              </div>
              <div className="project-info"><h3>{site.name}</h3><p>{t.location}: {site.location}</p><p>{t.contractorManager}: {site.client}</p><p>{t.stage}: {site.stage}</p></div>
              <div className="project-progress"><span>{t.progress}</span><strong>{site.progress}%</strong><div><i style={{ width: `${site.progress}%` }} /></div><small>{site.status}</small></div>
              <div className="project-stats"><Metric value={metrics.totalWorkers} label={t.assigned} tone="blue" /><Metric value={metrics.missing} label={t.missingToday} tone="red" /><Metric value={`${metrics.attendance}%`} label={t.attendancePercent} tone="green" /><Metric value={metrics.totalHours} label={t.totalWorkHours} tone="purple" /><button type="button" onClick={() => onOpenSite(site.id)}>{t.openSite}</button></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getDemoWorkerHistory(worker, { includeToday = false, referenceDate = new Date() } = {}) {
  const seed = worker?.id || 1;
  const todayDate = getTodayDate(referenceDate);
  const dates = getCurrentMonthDates(referenceDate).filter((date) => includeToday || !isSameDate(date, todayDate));
  return dates.map((date, index) => {
    if (isSameDate(date, todayDate) && worker) return { date, entry: worker.entry, exit: worker.exit, status: worker.status };
    if ((seed + index) % 7 === 0) return { date, entry: "", exit: "", status: "אי הגעה" };
    if ((seed + index) % 11 === 0) return { date, entry: "", exit: "", status: "מחלה" };
    const times = getDeterministicAttendance(seed, index);
    return { date, entry: times.entry, exit: times.exit, status: "" };
  });
}

function getMonthlyHoursForWorker(worker, monthId = getDefaultReportMonthId()) {
  const minutes = getReportRowsForWorker(worker, monthId).reduce((sum, record) => sum + (getRecordMinutes(record) || 0), 0);
  return formatMinutes(minutes);
}

function getSiteMonthlyHours(workers, siteId, monthId = getDefaultReportMonthId()) {
  const minutes = workers
    .filter((worker) => worker.siteId === siteId)
    .reduce((sum, worker) => {
      return sum + getReportRowsForWorker(worker, monthId).reduce((recordSum, record) => recordSum + (getRecordMinutes(record) || 0), 0);
    }, 0);
  return formatMinutes(minutes);
}

function Metric({ value, label, tone }) {
  return <div className={`metric ${tone}`}><strong>{value}</strong><span>{label}</span></div>;
}

function ActionMetric({ value, label, tone, onClick }) {
  return (
    <button className={`metric action-metric ${tone}`} type="button" onClick={onClick}>
      <strong>{value}</strong>
      <span>{label}</span>
    </button>
  );
}

function PageTitle({ title, subtitle }) {
  return <header className="admin-page-title"><h1>{title}</h1><p>{subtitle}</p></header>;
}

function SectionTitle({ children }) {
  return <h2 className="section-title"><span />{children}<span /></h2>;
}

function LanguageSelector({ language, onChange, label = "Language", options = workerLanguages, context = "worker" }) {
  return (
    <label className="language-selector">
      <span className="sr-only">{label}</span>
      <select value={language} onChange={onChange} aria-label={label}>
        {options.map((item) => <option key={item.code} value={item.code}>{getLanguageOptionLabel(item, language, context)}</option>)}
      </select>
    </label>
  );
}

function BrandLockup({ compact = false, dashboard = false, subtitle }) {
  const className = [compact ? "brand-lockup compact" : "brand-lockup", dashboard ? "dashboard-logo" : ""].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <div className="brand-icon" aria-hidden="true"><span className="helmet" /><span className="letter-c" /></div>
      <div className="brand-name" aria-label="Connex">Conne<span>x</span></div>
      <div className="brand-subtitle">{subtitle}</div>
    </div>
  );
}

export default App;
