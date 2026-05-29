import { useEffect, useMemo, useRef, useState } from "react";
import { MINIMUM_HOURLY_RATE_ILS, siteDefinitions, statusReasons, workbookWorkers, workerCredentials } from "./data/adminDemoData.js";
import {
  DEFAULT_SITE_GPS_SETTINGS,
  GEOLOCATION_ERROR_CODES,
  calculateDistanceMeters,
  geocodeAddress,
  getCurrentLocation,
  hasGoogleMapsApiKey,
  isDevGpsTestModeActive,
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

const ADMIN_USERNAME = "111";
const ADMIN_PASSWORD = "111";
const ADMIN_STORAGE_KEY = "connex-admin-workers-live-demo-june-2026-v1";
const WORKER_RECORDS_STORAGE_KEY = "connex-worker-records-live-demo-june-2026-v1";
const WORKER_ACTIVE_PUNCH_STORAGE_KEY = "connex-worker-active-punch-live-demo-june-2026-v1";
const WORKER_LANGUAGE_STORAGE_KEY = "connex-worker-language";
const ADMIN_LANGUAGE_STORAGE_KEY = "connex-admin-language";
const LEGACY_GPS_SETTINGS_STORAGE_KEY = "connex-site-gps-settings-v2";
const SITE_SETTINGS_STORAGE_KEY = "connex-site-settings-live-demo-june-2026-v1";
const DEMO_WORKER_SITE_ID = siteDefinitions[0].id;
const DEFAULT_WORK_DAY_START = "07:00";
const DEFAULT_WORK_DAY_END = "19:00";
const DEFAULT_ROUNDING_RULE = "site-day-cap";
const DEFAULT_ROUNDING_TOLERANCE_MINUTES = 15;
const ROUNDING_TOLERANCE_OPTIONS = [0, 10, 15, 20, 30];
const MIN_GPS_CHECKING_MS = 1200;

const fieldInitialState = { workerId: "", password: "" };

const workerLanguages = [
  { code: "he", enLabel: "Hebrew", heLabel: "עברית" },
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

const languageNativeLabels = {
  en: "English",
  he: "עברית",
  th: "ไทย",
  ro: "Română",
  hi: "हिन्दी",
  si: "සිංහල",
  zh: "中文",
};

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
    demoCredentials: "Worker assigned credentials · Admin 111 / 111",
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
    invalidCredentialsError: "Invalid username or password. Workers must use their assigned live-demo credentials.",
    logout: "Log out",
    workerName: "Worker",
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
    siteSettings: "Site Settings",
    gpsSettingsSubtitle: "Configure GPS, location radius, and work hours per site",
    siteName: "Site name",
    siteAddress: "Site address",
    latitude: "Latitude",
    longitude: "Longitude",
    allowedRadius: "Allowed radius",
    allowedRadiusMeters: "Allowed radius in meters",
    workDayStartTime: "Work day start time",
    workDayEndTime: "Work day end time",
    attendanceRounding: "Attendance rounding",
    roundingRules: "Attendance rounding",
    roundingTolerance: "Rounding tolerance",
    roundingRulesDescription: "Choose how much tolerance is allowed around the site work hours before rounding entry/exit times for reports.",
    noTolerance: "0 minutes",
    minutesShort: "{minutes} minutes",
    manualCoordinatesHint: "Enter coordinates manually or use current location.",
    siteSelection: "Site selection",
    siteIdentity: "Site identity",
    gpsLocation: "GPS location",
    workHours: "Work hours",
    gpsRadiusHelp: "Set how far from the site workers are allowed to check in.",
    useCurrentLocationAsSiteLocation: "Use current location as site location",
    currentLocationSetupHint: "Use this while physically standing at the site to set the site location from your current GPS position.",
    detectingCurrentLocation: "Detecting current location...",
    currentLocationAddedToSiteSettings: "Current location filled in. Click Save settings to save.",
    currentLocationPermissionRequired: "Location permission is required to use current location.",
    geolocationNotSupported: "This browser does not support location detection.",
    currentLocationUnavailable: "Could not detect current location.",
    saveSiteSettings: "Save site settings",
    saveSettings: "Save settings",
    cancel: "Cancel",
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
    siteSettingsInvalid: "Please enter valid site coordinates, radius, and work hours.",
    findCoordinates: "Find coordinates",
    searchingAddress: "Searching address...",
    addressUpdated: "Coordinates updated",
    addressNotFound: "Could not find coordinates for this address. Please enter them manually.",
    addressSuggestions: "Address suggestions",
    googleMapsReady: "Address lookup is available.",
    googleMapsFallback: "Enter coordinates manually or use current location.",
    dailyReportDataNotice: "Daily cards use today's local attendance. Demo data is not payroll truth.",
    monthlyReportDataNotice: "Monthly totals are generated from local/demo rows. Verify before payroll.",
    checkoutSavedWithGpsEvidence: "Check-out saved with GPS evidence.",
    checkoutGpsNotVerified: "Check-out saved. GPS evidence was not available.",
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
  demoCredentials: "คนงาน assigned credentials · ผู้ดูแล 111 / 111",
  emptyFieldsError: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน",
  invalidCredentialsError: "ใช้บัญชีตัวอย่าง: คนงาน assigned credentials หรือผู้ดูแล 111 / 111",
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
  demoCredentials: "वर्कर assigned credentials · एडमिन 111 / 111",
  emptyFieldsError: "कृपया उपयोगकर्ता नाम और पासवर्ड दोनों दर्ज करें।",
  invalidCredentialsError: "डेमो लॉगिन उपयोग करें: वर्कर assigned credentials या एडमिन 111 / 111।",
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
  demoCredentials: "Lucrător assigned credentials · Admin 111 / 111",
  emptyFieldsError: "Introdu utilizatorul și parola.",
  invalidCredentialsError: "Folosește datele demo: lucrător assigned credentials sau admin 111 / 111.",
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
  demoCredentials: "සේවක assigned credentials · පරිපාලක 111 / 111",
  emptyFieldsError: "කරුණාකර පරිශීලක නාමය සහ මුරපදය ඇතුළත් කරන්න.",
  invalidCredentialsError: "ඩෙමෝ පිවිසුම් භාවිත කරන්න: සේවක assigned credentials හෝ පරිපාලක 111 / 111.",
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
  invalidCredentialsError: "פרטי הדמו הם עובד assigned credentials או מנהל 111 / 111.",
  logout: "יציאה מהחשבון",
  workerName: "Worker",
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
  demoCredentials: "עובד assigned credentials · מנהל 111 / 111",
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
  invalidCredentialsError: "פרטי הדמו הם עובד assigned credentials או מנהל 111 / 111.",
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
  demoCredentials: "עובד assigned credentials · מנהל 111 / 111",
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
  siteSettings: "הגדרות אתר",
  gpsSettingsSubtitle: "הגדרת GPS, רדיוס ושעות עבודה לפי אתר",
  siteName: "שם אתר",
  siteAddress: "כתובת אתר",
  latitude: "קו רוחב",
  longitude: "קו אורך",
  allowedRadius: "רדיוס מותר",
  allowedRadiusMeters: "רדיוס מותר במטרים",
  workDayStartTime: "שעת התחלת יום עבודה",
  workDayEndTime: "שעת סיום יום עבודה",
  attendanceRounding: "עיגול שעות נוכחות",
  roundingRules: "עיגול שעות נוכחות",
  roundingTolerance: "טווח עיגול שעות",
  roundingRulesDescription: "בחר כמה דקות טווח מותרות סביב שעות העבודה באתר לפני עיגול שעות כניסה/יציאה בדוחות.",
  noTolerance: "ללא טווח",
  minutesShort: "{minutes} דקות",
  manualCoordinatesHint: "אפשר להזין קואורדינטות ידנית או להשתמש במיקום הנוכחי.",
  siteSelection: "בחירת אתר",
  siteIdentity: "פרטי האתר",
  gpsLocation: "מיקום GPS",
  workHours: "שעות עבודה",
  gpsRadiusHelp: "הגדר באיזה מרחק מהאתר עובדים יכולים לבצע כניסה.",
  useCurrentLocationAsSiteLocation: "השתמש במיקום הנוכחי כמיקום האתר",
  currentLocationSetupHint: "לחץ כשאתה נמצא פיזית באתר, כדי להגדיר את מיקום האתר לפי המיקום הנוכחי שלך.",
  detectingCurrentLocation: "מזהה מיקום נוכחי...",
  currentLocationAddedToSiteSettings: "המיקום הנוכחי הוזן לשדות. לחץ שמור הגדרות כדי לשמור.",
  currentLocationPermissionRequired: "נדרש אישור מיקום כדי להשתמש במיקום הנוכחי.",
  geolocationNotSupported: "הדפדפן הזה לא תומך בזיהוי מיקום.",
  currentLocationUnavailable: "לא ניתן היה לזהות את המיקום הנוכחי.",
  saveSiteSettings: "שמור הגדרות אתר",
  saveSettings: "שמור הגדרות",
  cancel: "ביטול",
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
  siteSettingsInvalid: "יש להזין קואורדינטות, רדיוס ושעות עבודה תקינים.",
  findCoordinates: "מצא קואורדינטות",
  searchingAddress: "מחפש כתובת...",
  addressUpdated: "הקואורדינטות עודכנו",
  addressNotFound: "לא נמצאו קואורדינטות לכתובת הזו. אפשר להזין אותן ידנית.",
  addressSuggestions: "הצעות כתובת",
  googleMapsReady: "חיפוש כתובת זמין.",
  googleMapsFallback: "אפשר להזין קואורדינטות ידנית או להשתמש במיקום הנוכחי.",
  dailyReportDataNotice: "כרטיסי היום משתמשים בנתוני נוכחות מקומיים. נתוני דמו אינם אמת לשכר.",
  monthlyReportDataNotice: "סיכומי החודש נוצרים מנתוני local/demo. יש לאמת לפני שכר.",
  checkoutSavedWithGpsEvidence: "היציאה נשמרה עם עדות GPS.",
  checkoutGpsNotVerified: "היציאה נשמרה. עדות GPS לא הייתה זמינה.",
});

Object.assign(translations.en, {
  demoCredentials: "Workers use assigned credentials · Admin 111 / 111",
  invalidCredentialsError: "Invalid username or password. Workers must use their assigned live-demo credentials.",
  workerName: "Worker",
  countryValue: "",
  assignedSite: "Assigned site",
  siteAddressLabel: "Address",
  workerSiteFallbackTitle: "Choose the correct site",
  workerSiteFallbackMessage: "It looks like you are not near your assigned site. If you moved today to another site, choose the correct site and we will check your location again.",
  checkThisSite: "Check this site",
  retryLocation: "Retry location",
  checkingSelectedSite: "Checking site...",
  selectedSiteStillTooFar: "You are still outside {siteName}. Choose another site or retry location.",
  siteChangedForToday: "Location approved for {siteName}. Check-in saved for this site.",
  hourlyRate: "Hourly rate",
  paymentTotalHours: "Total hours",
  totalPayment: "Total payment",
  siteMonthlyHoursValue: "Monthly site hours",
  minimumWageHoursValue: "Minimum-wage value",
  minimumWageRateUsed: "Rate used",
  perHour: "per hour",
  locationPermissionDenied: "Location permission is blocked. Allow location access and try again.",
  locationGpsUnavailable: "GPS is unavailable right now. Turn on location services and try again.",
  locationTimeout: "Location check timed out. Move to an open area and try again.",
  locationInsecureContext: "Real mobile GPS is blocked on this non-secure HTTP address. Use HTTPS for real GPS, or open a dev-only GPS test URL.",
  gpsDevModeNotice: "Local GPS test mode is active - not for the regular demo.",
});

for (const code of ["th", "hi", "ro", "si", "zh"]) {
  Object.assign(translations[code], {
    demoCredentials: translations.en.demoCredentials,
    invalidCredentialsError: translations.en.invalidCredentialsError,
    assignedSite: translations.en.assignedSite,
    siteAddressLabel: translations.en.siteAddressLabel,
    workerSiteFallbackTitle: translations.en.workerSiteFallbackTitle,
    workerSiteFallbackMessage: translations.en.workerSiteFallbackMessage,
    checkThisSite: translations.en.checkThisSite,
    retryLocation: translations.en.retryLocation,
    checkingSelectedSite: translations.en.checkingSelectedSite,
    selectedSiteStillTooFar: translations.en.selectedSiteStillTooFar,
    siteChangedForToday: translations.en.siteChangedForToday,
    hourlyRate: translations.en.hourlyRate,
    paymentTotalHours: translations.en.paymentTotalHours,
    totalPayment: translations.en.totalPayment,
    siteMonthlyHoursValue: translations.en.siteMonthlyHoursValue,
    minimumWageHoursValue: translations.en.minimumWageHoursValue,
    minimumWageRateUsed: translations.en.minimumWageRateUsed,
    perHour: translations.en.perHour,
    locationPermissionDenied: translations.en.locationPermissionDenied,
    locationGpsUnavailable: translations.en.locationGpsUnavailable,
    locationTimeout: translations.en.locationTimeout,
    locationInsecureContext: translations.en.locationInsecureContext,
    gpsDevModeNotice: translations.en.gpsDevModeNotice,
  });
}

Object.assign(translations.he, {
  demoCredentials: "עובדים נכנסים עם הפרטים האישיים מהרשימה · מנהל 111 / 111",
  invalidCredentialsError: "שם המשתמש או הסיסמה לא נכונים. עובד צריך להשתמש בפרטי ההתחברות האישיים מהרשימה.",
  workerName: "עובד",
  countryValue: "",
  assignedSite: "אתר משויך",
  siteAddressLabel: "כתובת",
  workerSiteFallbackTitle: "בחירת אתר נכון להיום",
  workerSiteFallbackMessage: "נראה שאתה לא נמצא באתר שמוגדר לך כרגע. אם עברת היום לאתר אחר, בחר את האתר הנכון ונבדוק שוב את המיקום שלך.",
  checkThisSite: "בדוק אתר זה",
  retryLocation: "בדוק מיקום שוב",
  checkingSelectedSite: "בודק את האתר...",
  selectedSiteStillTooFar: "המיקום עדיין לא בתוך הטווח של {siteName}. אפשר לבחור אתר אחר או לבדוק שוב את המיקום.",
  siteChangedForToday: "המיקום אושר עבור {siteName}. הכניסה נשמרה באתר זה.",
  hourlyRate: "מחיר לשעה",
  paymentTotalHours: "סה״כ שעות",
  totalPayment: "סה״כ לתשלום",
  siteMonthlyHoursValue: "סה״כ שעות באתר החודש",
  minimumWageHoursValue: "שווי לפי שכר מינימום",
  minimumWageRateUsed: "תעריף לחישוב",
  perHour: "לשעה",
  locationPermissionDenied: "הרשאת המיקום חסומה. יש לאשר גישה למיקום ולנסות שוב.",
  locationGpsUnavailable: "שירות המיקום לא זמין כרגע. יש לוודא שה-GPS פעיל ולנסות שוב.",
  locationTimeout: "בדיקת המיקום נמשכה יותר מדי זמן. כדאי לעבור לאזור פתוח ולנסות שוב.",
  locationInsecureContext: "GPS אמיתי במובייל חסום בכתובת HTTP לא מאובטחת. לבדיקת GPS אמיתי צריך HTTPS, או לפתוח קישור בדיקת GPS מקומי.",
  gpsDevModeNotice: "מצב בדיקת GPS מקומי פעיל - לא לשימוש בדמו רגיל.",
});

function timeToMinutes(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
}

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}

const defaultSiteAddresses = Object.fromEntries(
  siteDefinitions.map((site) => [site.id, site.address || site.location || site.name]),
);

const defaultSiteCoordinates = {
  "naomi-shemer": {
    latitude: DEFAULT_SITE_GPS_SETTINGS.latitude,
    longitude: DEFAULT_SITE_GPS_SETTINGS.longitude,
  },
  avgad: {
    latitude: 32.1441405,
    longitude: 34.8398525,
  },
  "electric-company": {
    latitude: 32.853151,
    longitude: 35.0828546,
  },
  "forma-tel-aviv": {
    latitude: 32.110132,
    longitude: 34.796307,
  },
};

function getRoundingToleranceLabel(minutes, t) {
  const value = Number(minutes);
  if (!value) return t.noTolerance || "0 minutes";
  return formatText(t.minutesShort || "{minutes} minutes", { minutes: value });
}

function normalizeTimeValue(value, fallback) {
  return timeToMinutes(value) === null ? fallback : value;
}

function getDefaultSiteSettingsForSite(site) {
  const coordinates = defaultSiteCoordinates[site.id] || defaultSiteCoordinates[DEMO_WORKER_SITE_ID];
  return {
    siteId: site.id,
    siteName: site.name,
    siteAddress: defaultSiteAddresses[site.id] || site.location || site.name,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    radiusMeters: DEFAULT_SITE_GPS_SETTINGS.radiusMeters,
    workDayStartTime: DEFAULT_WORK_DAY_START,
    workDayEndTime: DEFAULT_WORK_DAY_END,
    roundingRule: DEFAULT_ROUNDING_RULE,
    roundingToleranceMinutes: DEFAULT_ROUNDING_TOLERANCE_MINUTES,
  };
}

function getDefaultSiteSettingsMap() {
  return Object.fromEntries(siteDefinitions.map((site) => [site.id, getDefaultSiteSettingsForSite(site)]));
}

function normalizeSiteSetting(siteId = DEMO_WORKER_SITE_ID, settings = {}) {
  const safeSettings = settings && typeof settings === "object" && !Array.isArray(settings) ? settings : {};
  const site = siteDefinitions.find((item) => item.id === siteId) || siteDefinitions[0];
  const defaults = getDefaultSiteSettingsForSite(site);
  const latitude = Number(safeSettings.latitude);
  const longitude = Number(safeSettings.longitude);
  const radiusMeters = Number(safeSettings.radiusMeters);
  const roundingToleranceMinutes = Number(safeSettings.roundingToleranceMinutes);

  return {
    ...defaults,
    ...safeSettings,
    siteId: site.id,
    siteName: safeSettings.siteName || defaults.siteName,
    siteAddress: safeSettings.siteAddress || defaults.siteAddress,
    latitude: Number.isFinite(latitude) ? latitude : defaults.latitude,
    longitude: Number.isFinite(longitude) ? longitude : defaults.longitude,
    radiusMeters: Number.isFinite(radiusMeters) && radiusMeters > 0 ? radiusMeters : defaults.radiusMeters,
    workDayStartTime: normalizeTimeValue(safeSettings.workDayStartTime, defaults.workDayStartTime),
    workDayEndTime: normalizeTimeValue(safeSettings.workDayEndTime, defaults.workDayEndTime),
    roundingRule: safeSettings.roundingRule || DEFAULT_ROUNDING_RULE,
    roundingToleranceMinutes: ROUNDING_TOLERANCE_OPTIONS.includes(roundingToleranceMinutes)
      ? roundingToleranceMinutes
      : defaults.roundingToleranceMinutes,
  };
}

function normalizeSiteSettingsMap(settingsMap = {}) {
  const looksLikeSingleGpsSetting =
    settingsMap &&
    typeof settingsMap === "object" &&
    !Array.isArray(settingsMap) &&
    ("latitude" in settingsMap || "longitude" in settingsMap || "radiusMeters" in settingsMap) &&
    !settingsMap[DEMO_WORKER_SITE_ID];
  const source = looksLikeSingleGpsSetting ? { [settingsMap.siteId || DEMO_WORKER_SITE_ID]: settingsMap } : settingsMap || {};

  return Object.fromEntries(
    siteDefinitions.map((site) => [site.id, normalizeSiteSetting(site.id, source[site.id])]),
  );
}

function getStoredSiteSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SITE_SETTINGS_STORAGE_KEY) || "null");
    if (stored) return normalizeSiteSettingsMap(stored);

    const legacyGpsSettings = JSON.parse(localStorage.getItem(LEGACY_GPS_SETTINGS_STORAGE_KEY) || "null");
    return normalizeSiteSettingsMap(legacyGpsSettings || getDefaultSiteSettingsMap());
  } catch {
    return normalizeSiteSettingsMap(getDefaultSiteSettingsMap());
  }
}

function getSiteSetting(siteSettings, siteId = DEMO_WORKER_SITE_ID) {
  return normalizeSiteSetting(siteId, siteSettings?.[siteId]);
}

function getGpsSiteLocation(siteSetting) {
  const safeSiteSetting = normalizeSiteSetting(siteSetting?.siteId || DEMO_WORKER_SITE_ID, siteSetting);
  return {
    latitude: Number(safeSiteSetting.latitude),
    longitude: Number(safeSiteSetting.longitude),
  };
}

function hasValidSiteSettings(siteSetting) {
  const safeSiteSetting = normalizeSiteSetting(siteSetting?.siteId || DEMO_WORKER_SITE_ID, siteSetting);
  const { latitude, longitude } = getGpsSiteLocation(safeSiteSetting);
  const radiusMeters = Number(safeSiteSetting.radiusMeters);
  const startMinutes = timeToMinutes(safeSiteSetting.workDayStartTime);
  const endMinutes = timeToMinutes(safeSiteSetting.workDayEndTime);
  const roundingToleranceMinutes = Number(safeSiteSetting.roundingToleranceMinutes);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Number.isFinite(radiusMeters) &&
    radiusMeters > 0 &&
    startMinutes !== null &&
    endMinutes !== null &&
    endMinutes > startMinutes &&
    ROUNDING_TOLERANCE_OPTIONS.includes(roundingToleranceMinutes)
  );
}

function getCalculatedAttendance(record, siteSetting = getSiteSetting(null)) {
  if (!record || record.status) {
    return {
      actualEntryTime: record?.actualEntryTime || record?.entry || "",
      actualExitTime: record?.actualExitTime || record?.exit || "",
      calculatedEntryTime: "",
      calculatedExitTime: "",
      minutes: null,
    };
  }

  const setting = normalizeSiteSetting(record.siteId || siteSetting.siteId || DEMO_WORKER_SITE_ID, siteSetting);
  const actualEntryTime = record.actualEntryTime || record.entry || "";
  const actualExitTime = record.actualExitTime || record.exit || "";
  const entryMinutes = timeToMinutes(actualEntryTime);
  const exitMinutes = timeToMinutes(actualExitTime);
  const startMinutes = timeToMinutes(setting.workDayStartTime);
  const endMinutes = timeToMinutes(setting.workDayEndTime);
  const toleranceMinutes = ROUNDING_TOLERANCE_OPTIONS.includes(Number(setting.roundingToleranceMinutes))
    ? Number(setting.roundingToleranceMinutes)
    : DEFAULT_ROUNDING_TOLERANCE_MINUTES;

  if (entryMinutes === null || startMinutes === null || endMinutes === null) {
    return { actualEntryTime, actualExitTime, calculatedEntryTime: "", calculatedExitTime: "", minutes: null };
  }

  const calculatedEntryMinutes =
    entryMinutes < startMinutes && startMinutes - entryMinutes > toleranceMinutes
      ? startMinutes
      : entryMinutes;
  if (exitMinutes === null) {
    return {
      actualEntryTime,
      actualExitTime,
      calculatedEntryTime: formatMinutes(calculatedEntryMinutes),
      calculatedExitTime: "",
      minutes: null,
    };
  }

  const calculatedExitMinutes =
    exitMinutes > endMinutes && exitMinutes - endMinutes > toleranceMinutes
      ? endMinutes
      : exitMinutes;
  if (calculatedExitMinutes < calculatedEntryMinutes) {
    return {
      actualEntryTime,
      actualExitTime,
      calculatedEntryTime: formatMinutes(calculatedEntryMinutes),
      calculatedExitTime: formatMinutes(calculatedExitMinutes),
      minutes: null,
    };
  }

  return {
    actualEntryTime,
    actualExitTime,
    calculatedEntryTime: formatMinutes(calculatedEntryMinutes),
    calculatedExitTime: formatMinutes(calculatedExitMinutes),
    minutes: calculatedExitMinutes - calculatedEntryMinutes,
  };
}

function applyAttendanceRules(record, siteSetting) {
  const calculated = getCalculatedAttendance(record, siteSetting);
  const totalCalculatedHours = calculated.minutes === null ? "" : formatMinutes(calculated.minutes);
  return {
    ...record,
    actualEntryTime: calculated.actualEntryTime,
    actualExitTime: calculated.actualExitTime,
    entry: calculated.calculatedEntryTime || "",
    exit: calculated.calculatedExitTime || "",
    calculatedEntryTime: calculated.calculatedEntryTime,
    calculatedExitTime: calculated.calculatedExitTime,
    totalCalculatedHours,
  };
}

function getRecordMinutes(record, siteSetting) {
  return getCalculatedAttendance(record, siteSetting).minutes;
}

function getRecordTotal(record, siteSetting) {
  const minutes = getRecordMinutes(record, siteSetting);
  return minutes === null ? "" : formatMinutes(minutes);
}

function getDecimalHours(record, siteSetting) {
  const minutes = getRecordMinutes(record, siteSetting);
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

function getInitialWorkerRecords() {
  return [];
}

function normalizeWorkerRecord(record, siteSettings = getDefaultSiteSettingsMap()) {
  const siteId = record?.siteId || DEMO_WORKER_SITE_ID;
  return applyAttendanceRules({
    ...record,
    siteId,
  }, getSiteSetting(siteSettings, siteId));
}

function mergeWorkerRecords(baseRecords = [], storedRecords = [], siteSettings = getDefaultSiteSettingsMap()) {
  const recordsByDate = new Map();
  for (const record of baseRecords) {
    if (record?.date) recordsByDate.set(`${record.workerId || "legacy"}-${record.date}`, record);
  }
  for (const record of storedRecords) {
    if (record?.date) recordsByDate.set(`${record.workerId || "legacy"}-${record.date}`, normalizeWorkerRecord(record, siteSettings));
  }
  return Array.from(recordsByDate.values());
}

function getStoredWorkerRecords(referenceDate = new Date(), siteSettings = getDefaultSiteSettingsMap()) {
  const baselineRecords = getInitialWorkerRecords(referenceDate, siteSettings);
  try {
    const storedRecords = JSON.parse(localStorage.getItem(WORKER_RECORDS_STORAGE_KEY) || "[]");
    return Array.isArray(storedRecords) ? mergeWorkerRecords(baselineRecords, storedRecords, siteSettings) : baselineRecords;
  } catch {
    return baselineRecords;
  }
}

function getPersistableWorkerRecords(records = []) {
  return records.filter((record) => record?.source === "live" || record?.gpsEvidence || record?.checkInGpsEvidence || record?.checkOutGpsEvidence);
}

function getWorkerLogin(username, password) {
  return workerCredentials.find((credential) => credential.username === username && credential.password === password) || null;
}

function getWorkerRecords(records = [], workerId) {
  if (!workerId) return [];
  return records.filter((record) => Number(record.workerId) === Number(workerId));
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
  const hourlyRate = normalizeHourlyRate(worker.hourlyRate);

  if (hasStatus) {
    return {
      ...worker,
      hourlyRate,
      date: todayDate,
      entry: "",
      exit: "",
      actualEntryTime: "",
      actualExitTime: "",
    };
  }

  if (worker.source === "live" && worker.entry && !worker.exit) {
    return {
      ...worker,
      hourlyRate,
      date: worker.date || todayDate,
      actualEntryTime: worker.actualEntryTime || worker.entry,
      actualExitTime: "",
      entry: worker.entry,
      exit: "",
      status: "",
    };
  }

  const hasCompleteTimes = Boolean(worker.entry && worker.exit);
  const generatedTimes = hasCompleteTimes ? { entry: worker.entry, exit: worker.exit } : getDeterministicAttendance(worker.id, index);

  return {
    ...worker,
    hourlyRate,
    date: todayDate,
    actualEntryTime: worker.actualEntryTime || generatedTimes.entry,
    actualExitTime: worker.actualExitTime || generatedTimes.exit,
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

function getMonthlyTotal(records, siteSetting) {
  return formatMinutes(records.reduce((sum, record) => sum + (getRecordMinutes(record, siteSetting) || 0), 0));
}

function normalizeHourlyRate(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : MINIMUM_HOURLY_RATE_ILS;
}

function getWorkerHourlyRate(worker) {
  return normalizeHourlyRate(worker?.hourlyRate);
}

function getWorkerPaymentSummary(records, siteSetting, hourlyRate) {
  const totalMinutes = records.reduce((sum, record) => sum + (getRecordMinutes(record, siteSetting) || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
  return {
    totalMinutes,
    totalHours,
    totalPayment: totalHours * hourlyRate,
  };
}

function formatPaymentHours(hours, language = "he") {
  return new Intl.NumberFormat(language === "he" ? "he-IL" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(hours) ? hours : 0);
}

function formatCurrencyAmount(value, language = "he") {
  return new Intl.NumberFormat(language === "he" ? "he-IL" : "en-US", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function getInitialWorkerLanguage() {
  const savedLanguage = localStorage.getItem(WORKER_LANGUAGE_STORAGE_KEY);
  return workerLanguages.some((item) => item.code === savedLanguage) ? savedLanguage : "en";
}

function getInitialAdminLanguage() {
  const savedLanguage = localStorage.getItem(ADMIN_LANGUAGE_STORAGE_KEY);
  return adminLanguages.some((item) => item.code === savedLanguage) ? savedLanguage : "he";
}

function getLanguageOptionLabel(item, currentLanguage, context) {
  return languageNativeLabels[item.code] || item.nativeLabel || item.enLabel;
}

function getStoredAdminWorkers() {
  try {
    const stored = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || "null");
    if (Array.isArray(stored)) {
      const currentSeedWorkers = new Map(workbookWorkers.map((worker) => [Number(worker.id), worker]));
      return getNormalizedAdminWorkers(stored.map((worker) => ({
        ...worker,
        hourlyRate: currentSeedWorkers.get(Number(worker.id))?.hourlyRate ?? worker.hourlyRate,
        country: currentSeedWorkers.get(Number(worker.id))?.country || worker.country,
      })));
    }
    return getNormalizedAdminWorkers(workbookWorkers);
  } catch {
    return getNormalizedAdminWorkers(workbookWorkers);
  }
}

function formatDistanceMeters(distanceMeters) {
  return new Intl.NumberFormat("en-US").format(Math.round(distanceMeters));
}

function formatGpsMessage(template, values) {
  return Object.entries(values).reduce((message, [key, value]) => message.replace(`{${key}}`, value), template);
}

function getLocationErrorMessage(error, t) {
  if (error?.code === GEOLOCATION_ERROR_CODES.INSECURE_CONTEXT || /secure context|secure origin/i.test(error?.message || "")) {
    return t.locationInsecureContext || t.locationUnavailable;
  }
  if (error?.code === GEOLOCATION_ERROR_CODES.UNSUPPORTED || error?.code === 0) return t.geolocationNotSupported || t.locationUnavailable;
  if (error?.code === 1) return t.locationPermissionDenied || t.locationPermissionRequired;
  if (error?.code === 2) return t.locationGpsUnavailable || t.locationUnavailable;
  if (error?.code === 3) return t.locationTimeout || t.locationUnavailable;
  return t.locationUnavailable;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function keepGpsCheckingStateVisible(startedAt) {
  const remaining = MIN_GPS_CHECKING_MS - (Date.now() - startedAt);
  if (remaining > 0) await wait(remaining);
}

function getStoredActivePunch(workerId = null) {
  try {
    const storedPunch = JSON.parse(localStorage.getItem(WORKER_ACTIVE_PUNCH_STORAGE_KEY) || "null");
    if (!storedPunch?.entryDate || !storedPunch?.entryTime) return null;
    if (workerId && Number(storedPunch.workerId) !== Number(workerId)) return null;
    return storedPunch;
  } catch {
    return null;
  }
}

function createGpsEvidence({ action, siteSetting, timestamp = new Date(), currentLocation = null, radiusResult = null, error = null }) {
  const safeSiteSetting = normalizeSiteSetting(siteSetting?.siteId || DEMO_WORKER_SITE_ID, siteSetting);
  return {
    action,
    timestamp: timestamp.toISOString(),
    site: {
      id: safeSiteSetting.siteId,
      name: safeSiteSetting.siteName,
      address: safeSiteSetting.siteAddress,
    },
    latitude: Number.isFinite(currentLocation?.latitude) ? currentLocation.latitude : null,
    longitude: Number.isFinite(currentLocation?.longitude) ? currentLocation.longitude : null,
    accuracy: Number.isFinite(currentLocation?.accuracy) ? currentLocation.accuracy : null,
    distanceMeters: Number.isFinite(radiusResult?.distanceMeters) ? Math.round(radiusResult.distanceMeters) : null,
    allowedRadiusMeters: Number(safeSiteSetting.radiusMeters),
    isWithinRadius: typeof radiusResult?.isWithinRadius === "boolean" ? radiusResult.isWithinRadius : null,
    errorCode: error?.code ?? null,
    errorMessage: error?.message || "",
  };
}

async function captureGpsEvidence(action, siteSetting) {
  const timestamp = new Date();
  if (!hasValidSiteSettings(siteSetting)) {
    const error = new Error("Invalid site GPS settings.");
    return {
      evidence: createGpsEvidence({ action, siteSetting, timestamp, error }),
      error,
    };
  }

  const currentLocation = await getCurrentLocation();
  const siteLocation = getGpsSiteLocation(siteSetting);
  const radiusMeters = Number(siteSetting.radiusMeters);
  const radiusResult = isWithinAllowedRadius(currentLocation, siteLocation, radiusMeters);

  return {
    evidence: createGpsEvidence({ action, siteSetting, timestamp, currentLocation, radiusResult }),
    currentLocation,
    radiusResult,
  };
}

function isWorkerMissingToday(worker, todayDate) {
  return isSameDate(worker?.date || todayDate, todayDate) && Boolean(worker?.status || !worker?.entry);
}

function getSiteMetrics(workers, siteId, referenceDate = new Date(), siteSettings = getDefaultSiteSettingsMap()) {
  const todayDate = getTodayDate(referenceDate);
  const siteWorkers = workers.filter((worker) => worker.siteId === siteId && isSameDate(worker.date || todayDate, todayDate));
  const siteSetting = getSiteSetting(siteSettings, siteId);
  const worked = siteWorkers.filter((worker) => worker.entry);
  const missing = siteWorkers.filter((worker) => isWorkerMissingToday(worker, todayDate)).length;
  const totalHours = siteWorkers.reduce((sum, worker) => sum + getDecimalHours(worker, siteSetting), 0);
  return {
    totalWorkers: siteWorkers.length,
    worked: worked.length,
    missing,
    attendance: siteWorkers.length ? Math.round((worked.length / siteWorkers.length) * 100) : 0,
    totalHours: Math.round(totalHours * 10) / 10,
  };
}

function getGlobalAdminMetrics(workers, referenceDate = new Date(), siteSettings = getDefaultSiteSettingsMap()) {
  const todayDate = getTodayDate(referenceDate);
  const todayWorkers = workers.filter((worker) => isSameDate(worker.date || todayDate, todayDate));
  const worked = todayWorkers.filter((worker) => worker.entry);
  const missing = todayWorkers.filter((worker) => isWorkerMissingToday(worker, todayDate)).length;
  const totalHours = todayWorkers.reduce((sum, worker) => sum + getDecimalHours(worker, getSiteSetting(siteSettings, worker.siteId)), 0);

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
  Nepal: { en: "Nepal", he: "נפאל" },
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

function getWorkerMonthlySummary(worker, t, language, monthId = getDefaultReportMonthId(), referenceDate = new Date(), siteSettings = getDefaultSiteSettingsMap()) {
  const siteSetting = getSiteSetting(siteSettings, worker?.siteId);
  const records = getReportRowsForWorker(worker, monthId, referenceDate, siteSettings);
  const workedRecords = records.filter((record) => getRecordMinutes(record, siteSetting));
  const missingRecords = records.filter((record) => !getRecordMinutes(record, siteSetting));

  return {
    daysWorked: workedRecords.length,
    missingDays: missingRecords.length,
    totalHours: formatMinutes(records.reduce((sum, record) => sum + (getRecordMinutes(record, siteSetting) || 0), 0)),
  };
}

function getReportRowsForWorker(worker, monthId = getDefaultReportMonthId(), referenceDate = new Date(), siteSettings = getDefaultSiteSettingsMap()) {
  const dates = getReportDates(monthId, referenceDate);
  const siteSetting = getSiteSetting(siteSettings, worker?.siteId);
  return dates.map((date, index) => applyAttendanceRules(getDemoRecordForDate(worker, date, index), siteSetting));
}

function getDemoRecordForDate(worker, date, index = 0) {
  if (isSameDate(date, getTodayDate()) && worker) {
    return {
      date,
      siteId: worker.siteId,
      actualEntryTime: worker.actualEntryTime || worker.entry,
      actualExitTime: worker.actualExitTime || worker.exit,
      entry: worker.entry,
      exit: worker.exit,
      status: worker.status,
      source: worker.source || "local-today",
    };
  }
  const seed = worker?.id || 1;
  const day = Number(date.slice(0, 2));
  const month = Number(date.slice(3, 5));
  const marker = seed + day + month + index;
  if (marker % 7 === 0) return { date, entry: "", exit: "", status: "אי הגעה", source: "demo-generated" };
  if (marker % 11 === 0) return { date, entry: "", exit: "", status: "מחלה", source: "demo-generated" };
  const times = getDeterministicAttendance(seed, index + month);
  return {
    date,
    siteId: worker?.siteId,
    actualEntryTime: times.entry,
    actualExitTime: times.exit,
    entry: times.entry,
    exit: times.exit,
    status: "",
    source: "demo-generated",
  };
}

function getGlobalMonthlyHours(workers, monthId = getDefaultReportMonthId(), referenceDate = new Date(), siteSettings = getDefaultSiteSettingsMap()) {
  const minutes = workers.reduce((sum, worker) => {
    const siteSetting = getSiteSetting(siteSettings, worker.siteId);
    return sum + getReportRowsForWorker(worker, monthId, referenceDate, siteSettings).reduce((recordSum, record) => recordSum + (getRecordMinutes(record, siteSetting) || 0), 0);
  }, 0);
  return Math.round((minutes / 60) * 10) / 10;
}

function getSiteReportTotals(workers, siteId, monthId = getDefaultReportMonthId(), referenceDate = new Date(), siteSettings = getDefaultSiteSettingsMap()) {
  const siteWorkers = workers.filter((worker) => worker.siteId === siteId);
  const totals = siteWorkers.reduce((siteTotals, worker) => {
    const siteSetting = getSiteSetting(siteSettings, worker.siteId);
    const records = getReportRowsForWorker(worker, monthId, referenceDate, siteSettings);
    const workedRecords = records.filter((record) => getRecordMinutes(record, siteSetting));
    const missingRecords = records.filter((record) => !getRecordMinutes(record, siteSetting));
    return {
      daysWorked: siteTotals.daysWorked + workedRecords.length,
      missingDays: siteTotals.missingDays + missingRecords.length,
      minutes: siteTotals.minutes + records.reduce((sum, record) => sum + (getRecordMinutes(record, siteSetting) || 0), 0),
    };
  }, { daysWorked: 0, missingDays: 0, minutes: 0 });

  const totalDays = totals.daysWorked + totals.missingDays;
  const monthlyHoursDecimal = Math.round((totals.minutes / 60) * 100) / 100;
  return {
    totalWorkers: siteWorkers.length,
    daysWorked: totals.daysWorked,
    missingDays: totals.missingDays,
    monthlyHours: formatMinutes(totals.minutes),
    monthlyHoursDecimal,
    minimumWageValue: monthlyHoursDecimal * MINIMUM_HOURLY_RATE_ILS,
    minimumHourlyRate: MINIMUM_HOURLY_RATE_ILS,
    attendance: totalDays ? Math.round((totals.daysWorked / totalDays) * 100) : 0,
  };
}

function getAttentionWorkers(workers, t, language, siteSettings = getDefaultSiteSettingsMap()) {
  return workers
    .map((worker) => {
      if (worker.status) return { worker, label: getStatusLabel(worker.status, language, t) };
      if (!worker.entry) return { worker, label: t.missingToday };
      if (!worker.exit) return { worker, label: t.missingData };
      const minutes = getRecordMinutes(worker, getSiteSetting(siteSettings, worker.siteId));
      if (minutes && minutes > 11 * 60) return { worker, label: t.unusualHours };
      return null;
    })
    .filter(Boolean);
}

function getRecentActivity(workers, t, language, siteSettings = getDefaultSiteSettingsMap()) {
  const attention = getAttentionWorkers(workers, t, language, siteSettings);
  const sickWorker = attention.find(({ worker }) => worker.status);
  const todayDate = getTodayDate();
  const missingWorkers = workers.filter((worker) => isWorkerMissingToday(worker, todayDate)).length;
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
  const missingWorkers = todayWorkers.filter((worker) => isWorkerMissingToday(worker, todayDate));

  return missingWorkers.map((worker) => {
    const reason = worker.status || "אי הגעה";
    return {
      worker,
      site: siteDefinitions.find((site) => site.id === worker.siteId),
      reason: getStatusLabel(reason, language, t),
      note: getStatusLabel(reason, language, t),
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
  const [loggedInWorkerId, setLoggedInWorkerId] = useState(null);
  const [workerHistoryBackView, setWorkerHistoryBackView] = useState("site");
  const [siteSettings, setSiteSettings] = useState(getStoredSiteSettings);
  const [activePunch, setActivePunch] = useState(null);
  const [records, setRecords] = useState(() => getStoredWorkerRecords(new Date(), getStoredSiteSettings()));
  const [adminWorkers, setAdminWorkers] = useState(getStoredAdminWorkers);
  const [workerLanguage, setWorkerLanguage] = useState(getInitialWorkerLanguage);
  const [adminLanguage, setAdminLanguage] = useState(getInitialAdminLanguage);
  const [clock, setClock] = useState(new Date());
  const [selectedReportMonth, setSelectedReportMonth] = useState(() => getDefaultReportMonthId());
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);
  const [gpsFallback, setGpsFallback] = useState(null);
  const [checkingSiteId, setCheckingSiteId] = useState(null);

  const language = screen === "admin" ? adminLanguage : workerLanguage;
  const t = useMemo(() => translations[language], [language]);
  const isRtl = language === "he";
  const isGpsDevMode = isDevGpsTestModeActive();
  const isCheckedIn = Boolean(activePunch);
  const activeEntryDate = activePunch?.entryDate || "";
  const activeEntryTime = activePunch?.entryTime || "";
  const todayDate = getTodayDate(clock);
  const currentMonthId = getMonthId(clock);
  const currentMonthWorkerRecords = useMemo(() => getRecordsForMonth(records, clock), [records, currentMonthId]);
  const currentMonthLabel = getMonthLabel(currentMonthId, language);
  const loggedInWorker = useMemo(
    () => adminWorkers.find((worker) => Number(worker.id) === Number(loggedInWorkerId)) || null,
    [adminWorkers, loggedInWorkerId],
  );
  const workerSiteId = loggedInWorker?.siteId || DEMO_WORKER_SITE_ID;
  const workerSiteSetting = useMemo(() => getSiteSetting(siteSettings, workerSiteId), [siteSettings, workerSiteId]);
  const activeWorkerRecords = useMemo(
    () => getWorkerRecords(currentMonthWorkerRecords, loggedInWorkerId),
    [currentMonthWorkerRecords, loggedInWorkerId],
  );

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
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem(WORKER_RECORDS_STORAGE_KEY, JSON.stringify(getPersistableWorkerRecords(records)));
  }, [records]);

  useEffect(() => {
    if (activePunch) {
      localStorage.setItem(WORKER_ACTIVE_PUNCH_STORAGE_KEY, JSON.stringify(activePunch));
      return;
    }
    localStorage.removeItem(WORKER_ACTIVE_PUNCH_STORAGE_KEY);
  }, [activePunch]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [language, isRtl]);

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

    const workerLogin = getWorkerLogin(username, password);
    if (workerLogin) {
      setShowError(false);
      setLoggedInWorkerId(workerLogin.workerId);
      setActivePunch(getStoredActivePunch(workerLogin.workerId));
      setGpsStatus(null);
      setGpsFallback(null);
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
    setLoggedInWorkerId(null);
    setFields(fieldInitialState);
    setShowError(false);
    setGpsStatus(null);
    setGpsFallback(null);
    setAdminView("dashboard");
  };

  const completeWorkerCheckIn = ({ siteId, siteSetting, evidence }) => {
    const entryDate = new Date();
    const entryDateLabel = getTodayDate(entryDate);
    const entryTime = formatCurrentTime(entryDate);
    const site = siteDefinitions.find((item) => item.id === siteId);

    setActivePunch({
      workerId: loggedInWorkerId,
      entryDate: entryDateLabel,
      entryTime,
      siteId,
      checkInGpsEvidence: evidence,
    });
    setRecords((currentRecords) => [
      applyAttendanceRules({
        id: Date.now(),
        workerId: loggedInWorkerId,
        date: entryDateLabel,
        siteId,
        actualEntryTime: entryTime,
        actualExitTime: "",
        entry: entryTime,
        exit: "",
        source: "live",
        checkInGpsEvidence: evidence,
        gpsEvidence: {
          checkIn: evidence,
          checkOut: null,
        },
      }, siteSetting),
      ...currentRecords.filter((record) => !(Number(record.workerId) === Number(loggedInWorkerId) && isSameDate(record.date, entryDateLabel))),
    ]);
    setAdminWorkers((workers) =>
      workers.map((worker, index) =>
        Number(worker.id) === Number(loggedInWorkerId)
          ? normalizeAdminWorker({
              ...worker,
              siteId,
              date: entryDateLabel,
              actualEntryTime: entryTime,
              actualExitTime: "",
              entry: entryTime,
              exit: "",
              status: "",
              source: "live",
            }, index, entryDate)
          : worker,
      ),
    );
    setGpsFallback(null);
    setGpsStatus({
      type: "success",
      message: formatText(siteId === workerSiteId ? t.withinRangeApproved : t.siteChangedForToday, { siteName: site?.name || "" }),
    });
  };

  const attemptWorkerCheckIn = async (siteId) => {
    if (!loggedInWorker || isCheckingLocation) return;
    const siteSetting = getSiteSetting(siteSettings, siteId);
    const site = siteDefinitions.find((item) => item.id === siteId);
    const isAssignedSite = siteId === workerSiteId;

    setGpsFallback((currentFallback) =>
      isAssignedSite
        ? null
        : { ...(currentFallback || {}), assignedSiteId: workerSiteId, selectedSiteId: siteId },
    );
    setIsCheckingLocation(true);
    setCheckingSiteId(siteId);
    setGpsStatus({ type: "info", message: isAssignedSite ? t.checkingLocation : t.checkingSelectedSite || t.checkingLocation });
    const gpsStartedAt = Date.now();

    try {
      const { evidence, radiusResult, error } = await captureGpsEvidence("check-in", siteSetting);
      await keepGpsCheckingStateVisible(gpsStartedAt);
      if (error) {
        setGpsFallback(null);
        setGpsStatus({ type: "error", message: t.siteSettingsInvalid || t.gpsSettingsInvalid, canRetry: true });
        return;
      }

      if (!radiusResult.isWithinRadius) {
        setGpsFallback({ assignedSiteId: workerSiteId, lastAttemptedSiteId: siteId });
        setGpsStatus({
          type: "error",
          message: siteId === workerSiteId
            ? t.workerSiteFallbackMessage
            : formatText(t.selectedSiteStillTooFar, { siteName: site?.name || "" }),
        });
        return;
      }

      completeWorkerCheckIn({ siteId, siteSetting, evidence });
    } catch (error) {
      await keepGpsCheckingStateVisible(gpsStartedAt);
      setGpsFallback(null);
      setGpsStatus({
        type: "error",
        message: getLocationErrorMessage(error, t),
        canRetry: true,
      });
    } finally {
      setIsCheckingLocation(false);
      setCheckingSiteId(null);
    }
  };

  const handleAttendanceToggle = async () => {
    if (isCheckingLocation || !loggedInWorker) return;

    if (!isCheckedIn) {
      await attemptWorkerCheckIn(workerSiteId);
      return;
    }

    const checkOutSiteId = activePunch?.siteId || workerSiteId;
    const checkOutSiteSetting = getSiteSetting(siteSettings, checkOutSiteId);
    setIsCheckingLocation(true);
    setCheckingSiteId(checkOutSiteId);
    setGpsStatus({ type: "info", message: t.checkingLocation });
    let checkOutGpsEvidence = null;
    try {
      const { evidence } = await captureGpsEvidence("check-out", checkOutSiteSetting);
      checkOutGpsEvidence = evidence;
    } catch (error) {
      checkOutGpsEvidence = createGpsEvidence({ action: "check-out", siteSetting: checkOutSiteSetting, error });
    } finally {
      setIsCheckingLocation(false);
      setCheckingSiteId(null);
    }

    const exitDate = new Date();
    const recordDate = getTodayDate(exitDate);
    const exitTime = formatCurrentTime(exitDate);
    const checkInGpsEvidence = activePunch?.checkInGpsEvidence || null;
    const attendanceDate = activeEntryDate || recordDate;
    const entryTime = activeEntryTime || formatCurrentTime(exitDate);
    setRecords((currentRecords) => [
      applyAttendanceRules({
        id: Date.now(),
        workerId: loggedInWorkerId,
        date: attendanceDate,
        siteId: checkOutSiteId,
        actualEntryTime: entryTime,
        actualExitTime: exitTime,
        entry: entryTime,
        exit: exitTime,
        source: "live",
        checkInGpsEvidence,
        checkOutGpsEvidence,
        gpsEvidence: {
          checkIn: checkInGpsEvidence,
          checkOut: checkOutGpsEvidence,
        },
      }, checkOutSiteSetting),
      ...currentRecords.filter((record) => !(Number(record.workerId) === Number(loggedInWorkerId) && isSameDate(record.date, attendanceDate))),
    ]);
    setAdminWorkers((workers) =>
      workers.map((worker, index) =>
        Number(worker.id) === Number(loggedInWorkerId)
          ? normalizeAdminWorker({
              ...worker,
              siteId: checkOutSiteId,
              date: attendanceDate,
              actualEntryTime: entryTime,
              actualExitTime: exitTime,
              entry: entryTime,
              exit: exitTime,
              status: "",
              source: "live",
            }, index, exitDate)
          : worker,
      ),
    );
    setActivePunch(null);
    setGpsFallback(null);
    setGpsStatus({
      type: checkOutGpsEvidence?.latitude ? "success" : "info",
      message: checkOutGpsEvidence?.latitude ? t.checkoutSavedWithGpsEvidence : t.checkoutGpsNotVerified,
    });
  };

  const updateAdminWorker = (workerId, field, value) => {
    setAdminWorkers((workers) =>
      workers.map((worker) => {
        if (worker.id !== workerId) return worker;
        const updated = { ...worker, [field]: value, date: todayDate };
        if (field === "entry") return { ...updated, actualEntryTime: value, calculatedEntryTime: "", totalCalculatedHours: "", status: "" };
        if (field === "exit") return { ...updated, actualExitTime: value, calculatedExitTime: "", totalCalculatedHours: "", status: "" };
        if (field === "status" && value) return { ...updated, entry: "", exit: "" };
        if (field === "status" && !value) return normalizeAdminWorker({ ...updated, status: "" });
        return updated;
      }),
    );
  };

  if (screen === "history") {
    return (
      <DashboardShell t={t} isRtl={isRtl} language={language} onLanguageChange={handleWorkerLanguageChange} onLogout={handleLogout}>
        <FullHistoryView t={t} records={activeWorkerRecords} monthLabel={currentMonthLabel} siteSetting={workerSiteSetting} onBack={() => setScreen("dashboard")} />
      </DashboardShell>
    );
  }

  if (screen === "dashboard") {
    return (
      <DashboardShell t={t} isRtl={isRtl} language={language} onLanguageChange={handleWorkerLanguageChange} onLogout={handleLogout}>
        <WorkerDashboard
          t={t}
          language={language}
          isCheckedIn={isCheckedIn}
          entryTime={activeEntryTime}
          worker={loggedInWorker}
          records={activeWorkerRecords}
          siteSetting={workerSiteSetting}
          siteSettings={siteSettings}
          currentSiteId={workerSiteId}
          gpsFallback={gpsFallback}
          checkingSiteId={checkingSiteId}
          onToggle={handleAttendanceToggle}
          onSelectFallbackSite={attemptWorkerCheckIn}
          onRetryAssignedSite={() => attemptWorkerCheckIn(workerSiteId)}
          isCheckingLocation={isCheckingLocation}
          gpsStatus={gpsStatus}
          canRetryGps={Boolean(gpsStatus?.canRetry)}
          isGpsDevMode={isGpsDevMode}
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
        siteSettings={siteSettings}
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
            siteSettings={siteSettings}
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
            siteSettings={siteSettings}
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
            siteSettings={siteSettings}
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
            siteSettings={siteSettings}
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
            siteSettings={siteSettings}
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
            siteSettings={siteSettings}
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
          <AdminSiteSettingsView
            t={t}
            siteSettings={siteSettings}
            onSaveSiteSettings={(siteId, nextSettings) =>
              setSiteSettings((currentSettings) => ({
                ...currentSettings,
                [siteId]: normalizeSiteSetting(siteId, nextSettings),
              }))
            }
          />
        ) : null}
        {adminView === "projects" ? <AdminProjectsView t={t} language={language} workers={adminWorkers} siteSettings={siteSettings} onOpenSite={(siteId) => {
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

function WorkerDashboard({
  t,
  language,
  worker,
  isCheckedIn,
  entryTime,
  records,
  siteSetting,
  siteSettings,
  currentSiteId,
  gpsFallback,
  checkingSiteId,
  onToggle,
  onSelectFallbackSite,
  onRetryAssignedSite,
  isCheckingLocation,
  gpsStatus,
  canRetryGps,
  isGpsDevMode,
  onFullHistory,
}) {
  const fallbackSites = siteDefinitions.filter((site) => site.id !== currentSiteId);
  return (
    <section className="worker-dashboard">
      <WorkerCard t={t} language={language} worker={worker} siteSetting={siteSetting} isCheckedIn={isCheckedIn} />
      <button className={isCheckedIn ? "attendance-button exit" : "attendance-button enter"} type="button" onClick={onToggle} disabled={isCheckingLocation}>
        <span className="attendance-main-text">{isCheckingLocation ? t.checkingLocation : isCheckedIn ? t.checkOut : t.checkIn}</span>
        {isCheckedIn ? <small className="attendance-time-text">{t.enteredAt.replace("{time}", entryTime || formatCurrentTime())}</small> : null}
      </button>
      {gpsStatus ? <p className={`gps-worker-message ${gpsStatus.type}`} role={gpsStatus.type === "error" ? "alert" : "status"}>{gpsStatus.message}</p> : null}
      {isGpsDevMode ? <p className="gps-dev-mode-notice">{t.gpsDevModeNotice}</p> : null}
      {canRetryGps && !gpsFallback ? (
        <button className="gps-retry-button" type="button" onClick={onRetryAssignedSite} disabled={isCheckingLocation}>
          {isCheckingLocation ? t.checkingLocation : t.retryLocation}
        </button>
      ) : null}
      {gpsFallback ? (
        <SiteFallbackSelector
          t={t}
          sites={fallbackSites}
          siteSettings={siteSettings}
          checkingSiteId={checkingSiteId}
          isCheckingLocation={isCheckingLocation}
          onSelectSite={onSelectFallbackSite}
          onRetryAssignedSite={onRetryAssignedSite}
        />
      ) : null}
      <HistoryCard t={t} records={records.slice(0, 5)} siteSetting={siteSetting} onFullHistory={onFullHistory} />
    </section>
  );
}

function WorkerCard({ t, language, worker, siteSetting, isCheckedIn }) {
  const fullName = getWorkerFullName(worker);
  const country = getCountryLabel(worker?.country, language);
  return (
    <section className="worker-card">
      <div className="worker-avatar" aria-hidden="true"><span className="avatar-helmet" /><span className="avatar-face" /><span className="avatar-shirt" /></div>
      <div className="worker-details">
        <h1>{fullName || t.workerName}</h1>
        <p>{t.passportNumber} <NumericToken className="passport-token">{worker?.passport || ""}</NumericToken></p>
        {country ? <p>{t.country} <span>{country}</span></p> : null}
        <p>{t.assignedSite}: <span>{siteSetting.siteName}</span></p>
        <p>{t.siteAddressLabel}: <span>{siteSetting.siteAddress}</span></p>
      </div>
      <div className={isCheckedIn ? "status-pill working" : "status-pill idle"}><span />{isCheckedIn ? t.statusWorking : t.statusNotWorking}</div>
    </section>
  );
}

function SiteFallbackSelector({ t, sites, siteSettings, checkingSiteId, isCheckingLocation, onSelectSite, onRetryAssignedSite }) {
  return (
    <section className="site-fallback-panel" aria-live="polite">
      <div className="site-fallback-heading">
        <h2>{t.workerSiteFallbackTitle}</h2>
        <p>{t.workerSiteFallbackMessage}</p>
      </div>
      <div className="site-fallback-actions">
        {sites.map((site) => {
          const setting = getSiteSetting(siteSettings, site.id);
          const isCheckingThisSite = isCheckingLocation && checkingSiteId === site.id;
          return (
            <button key={site.id} type="button" onClick={() => onSelectSite(site.id)} disabled={isCheckingLocation}>
              <strong>{site.name}</strong>
              <span>{setting.siteAddress}</span>
              <small>{isCheckingThisSite ? t.checkingSelectedSite : t.checkThisSite}</small>
            </button>
          );
        })}
      </div>
      <button className="site-fallback-retry" type="button" onClick={onRetryAssignedSite} disabled={isCheckingLocation}>
        {isCheckingLocation ? t.checkingLocation : t.retryLocation}
      </button>
    </section>
  );
}

function HistoryCard({ t, records, siteSetting, onFullHistory }) {
  return (
    <section className="history-card">
      <SectionTitle>{t.recentHistory}</SectionTitle>
      <HistoryTable t={t} records={records} siteSetting={siteSetting} />
      <button className="full-history-button" type="button" onClick={onFullHistory}>{t.fullHistory}</button>
    </section>
  );
}

function FullHistoryView({ t, records, monthLabel, siteSetting, onBack }) {
  return (
    <section className="full-history-view">
      <button className="back-button" type="button" onClick={onBack}>{t.back}</button>
      <section className="history-card full">
        <SectionTitle>{formatText(t.monthlyHistory, { month: monthLabel })}</SectionTitle>
        <HistoryTable t={t} records={records} siteSetting={siteSetting} />
        <MonthlySummary t={t} records={records} siteSetting={siteSetting} />
      </section>
    </section>
  );
}

function HistoryTable({ t, records, siteSetting }) {
  return (
    <div className="history-table" role="table" aria-label={t.recentHistory}>
      <div className="history-row header" role="row"><span>{t.date}</span><span>{t.entry}</span><span>{t.exit}</span><span>{t.totalHours}</span></div>
      {records.map((record) => {
        const displayRecord = applyAttendanceRules(record, siteSetting);
        return (
          <div className="history-row" role="row" key={record.id}>
            <span><NumericToken>{displayRecord.date}</NumericToken></span>
            <span><NumericToken>{displayRecord.entry}</NumericToken></span>
            <span>{displayRecord.exit ? <NumericToken>{displayRecord.exit}</NumericToken> : t.noExitYet}</span>
            <span>{displayRecord.exit ? <NumericToken>{getRecordTotal(displayRecord, siteSetting)}</NumericToken> : "-"}</span>
          </div>
        );
      })}
    </div>
  );
}

function MonthlySummary({ t, records, siteSetting }) {
  return <section className="monthly-summary"><h3>{t.monthlySummary}</h3><p>{t.totalMonthlyHours.replace("{hours}", getMonthlyTotal(records, siteSetting))}</p></section>;
}

function AdminShell({ t, isRtl, language, clock, workers, siteSettings, activeView, onLanguageChange, onLogout, onNavigate, children }) {
  const sidebarMetrics = getGlobalAdminMetrics(workers || [], clock, siteSettings);

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
        <AdminMobileNav t={t} activeView={activeView} onNavigate={onNavigate} />
        {children}
      </section>
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

function AdminDashboardView({ t, workers, clock, language, siteSettings, onOpenMissingWorkers, onOpenSite }) {
  const todayDate = getTodayDate(clock);
  const monthId = getMonthId(clock);
  const monthLabel = getMonthLabel(monthId, language);
  const globalMetrics = getGlobalAdminMetrics(workers, clock, siteSettings);
  const monthHours = getGlobalMonthlyHours(workers, monthId, clock, siteSettings);
  const siteHealth = siteDefinitions
    .map((site) => ({ site, metrics: getSiteMetrics(workers, site.id, clock, siteSettings) }))
    .sort((left, right) => right.metrics.missing - left.metrics.missing || left.metrics.attendance - right.metrics.attendance);
  const attentionSites = siteHealth.filter(({ metrics }) => metrics.missing > 0);
  const attentionWorkers = getAttentionWorkers(workers, t, language, siteSettings).slice(0, 5);
  const recentActivity = getRecentActivity(workers, t, language, siteSettings);

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
          <ActionMetric value={globalMetrics.missing} label={t.missingToday} tone="red" onClick={onOpenMissingWorkers} />
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
              <p>{t.passport}: <NumericToken className="passport-token">{worker.passport}</NumericToken></p>
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
              <strong><NumericToken>{worker.date || todayDate}</NumericToken></strong>
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

function AdminSiteSettingsView({ t, siteSettings, onSaveSiteSettings }) {
  const [selectedSiteId, setSelectedSiteId] = useState(DEMO_WORKER_SITE_ID);
  const selectedSite = siteDefinitions.find((site) => site.id === selectedSiteId) || siteDefinitions[0];
  const selectedSiteSetting = getSiteSetting(siteSettings, selectedSiteId);
  const [draft, setDraft] = useState(selectedSiteSetting);
  const [saveMessage, setSaveMessage] = useState("");
  const [addressStatus, setAddressStatus] = useState("");
  const [addressStatusType, setAddressStatusType] = useState("info");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    setDraft(selectedSiteSetting);
    setSaveMessage("");
    setAddressStatus("");
    setAddressStatusType("info");
    setIsDetectingLocation(false);
  }, [selectedSiteId, siteSettings]);

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaveMessage("");
    if (field === "siteAddress") setAddressStatus("");
  };

  const getValidatedDraft = () => {
    const nextSettings = normalizeSiteSetting(selectedSiteId, draft);
    if (!hasValidSiteSettings(nextSettings)) return null;
    return nextSettings;
  };

  const handleSave = (event) => {
    event.preventDefault();
    const nextSettings = getValidatedDraft();
    if (!nextSettings) {
      setSaveMessage(t.siteSettingsInvalid || t.gpsSettingsInvalid);
      return;
    }
    onSaveSiteSettings(selectedSiteId, nextSettings);
    setDraft(nextSettings);
    setSaveMessage(t.settingsSaved);
  };

  const handleUseCurrentLocation = async () => {
    if (isDetectingLocation) return;
    setIsDetectingLocation(true);
    setAddressStatus(t.detectingCurrentLocation || t.checkingLocation);
    setAddressStatusType("info");
    setSaveMessage("");
    try {
      const currentLocation = await getCurrentLocation();
      setDraft((current) => ({
        ...current,
        latitude: currentLocation.latitude.toFixed(6),
        longitude: currentLocation.longitude.toFixed(6),
      }));
      setAddressStatus(t.currentLocationAddedToSiteSettings);
      setAddressStatusType("success");
    } catch (error) {
      const message = error?.code === 1
        ? t.currentLocationPermissionRequired
        : error?.code === 0
          ? t.geolocationNotSupported || t.currentLocationUnavailable
          : t.currentLocationUnavailable;
      setAddressStatus(message);
      setAddressStatusType("error");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  return (
    <section className="admin-page admin-settings-page">
      <PageTitle title={t.settings} subtitle={t.gpsSettingsSubtitle} />
      <section className="gps-settings-card site-settings-card">
        <div className="panel-heading">
          <small>{t.settings}</small>
          <h2>{t.siteSettings || t.siteGpsSettings}</h2>
          <p>{t.gpsTestIntro}</p>
          <p className="gps-provider-note">{t.manualCoordinatesHint}</p>
        </div>
        <form className="gps-settings-form" onSubmit={handleSave}>
          <section className="settings-section-card site-settings-selector-card">
            <h3>{t.siteSelection}</h3>
            <label className="site-settings-selector">
              <span>{t.selectSite}</span>
              <select value={selectedSiteId} onChange={(event) => setSelectedSiteId(event.target.value)}>
                {siteDefinitions.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
              </select>
            </label>
          </section>

          <section className="settings-section-card">
            <h3>{t.siteIdentity}</h3>
            <div className="settings-section-grid">
              <label>
                <span>{t.siteName}</span>
                <input value={draft.siteName || selectedSite.name} onChange={(event) => updateDraft("siteName", event.target.value)} />
              </label>
              <label>
                <span>{t.siteAddress}</span>
                <input value={draft.siteAddress || ""} onChange={(event) => updateDraft("siteAddress", event.target.value)} />
              </label>
            </div>
          </section>

          <section className="settings-section-card">
            <h3>{t.gpsLocation}</h3>
            <p>{t.gpsRadiusHelp}</p>
            <div className="settings-section-grid">
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
            </div>
            <div className="location-fill-row">
              <button className="settings-action-secondary location-fill-button" type="button" onClick={handleUseCurrentLocation} disabled={isDetectingLocation}>
                {isDetectingLocation ? (t.detectingCurrentLocation || t.checkingLocation) : t.useCurrentLocationAsSiteLocation}
              </button>
              <p className="location-fill-helper">{t.currentLocationSetupHint}</p>
              {addressStatus ? <p className={`gps-address-status ${addressStatusType}`} role="status" aria-live="polite">{addressStatus}</p> : null}
            </div>
          </section>

          <section className="settings-section-card">
            <h3>{t.workHours}</h3>
            <div className="settings-section-grid two-columns">
              <label>
                <span>{t.workDayStartTime}</span>
                <input type="time" value={draft.workDayStartTime} onChange={(event) => updateDraft("workDayStartTime", event.target.value)} />
              </label>
              <label>
                <span>{t.workDayEndTime}</span>
                <input type="time" value={draft.workDayEndTime} onChange={(event) => updateDraft("workDayEndTime", event.target.value)} />
              </label>
            </div>
          </section>

          <section className="settings-section-card site-settings-rule">
            <h3>{t.attendanceRounding || t.roundingRules}</h3>
            <p>{t.roundingRulesDescription}</p>
            <label>
              <span>{t.roundingTolerance}</span>
              <select value={draft.roundingToleranceMinutes ?? DEFAULT_ROUNDING_TOLERANCE_MINUTES} onChange={(event) => updateDraft("roundingToleranceMinutes", Number(event.target.value))}>
                {ROUNDING_TOLERANCE_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>{getRoundingToleranceLabel(minutes, t)}</option>
                ))}
              </select>
            </label>
          </section>
          <div className="gps-settings-actions">
            <button className="settings-action-primary" type="submit">{t.saveSettings}</button>
          </div>
          {saveMessage ? <p className="gps-save-message" role="status">{saveMessage}</p> : null}
        </form>
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
        <p>{site.address || site.location}</p>
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
      <p>{site.address || site.location}</p>
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

function AdminSiteWorkersView({ t, language, siteId, workers, clock, siteSettings, onBack, onUpdateWorker, onOpenWorker }) {
  const todayDate = getTodayDate(clock);
  const site = siteDefinitions.find((item) => item.id === siteId);
  const siteWorkers = workers.filter((worker) => worker.siteId === siteId && isSameDate(worker.date || todayDate, todayDate));
  const siteSetting = getSiteSetting(siteSettings, siteId);
  const metrics = getSiteMetrics(workers, siteId, clock, siteSettings);
  return (
    <section className="admin-page site-workers-page">
      <button className="admin-back-button" type="button" onClick={onBack}>{t.back}</button>
      <PageTitle title={t.workersOnSite} subtitle={`${site.name} · ${site.address || site.location}`} />
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
                <td>{getRecordTotal(worker, siteSetting) || "-"}</td>
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

function AdminWorkerHistoryView({ t, language, worker, siteId, clock, siteSettings, onBack }) {
  const site = siteDefinitions.find((item) => item.id === siteId);
  const siteSetting = getSiteSetting(siteSettings, worker?.siteId || siteId);
  const history = getDemoWorkerHistory(worker, { includeToday: true, referenceDate: clock, siteSettings });
  const fullName = getWorkerFullName(worker);
  const hourlyRate = getWorkerHourlyRate(worker);
  const paymentSummary = getWorkerPaymentSummary(history, siteSetting, hourlyRate);
  return (
    <section className="admin-page">
      <button className="admin-back-button" type="button" onClick={onBack}>{t.back}</button>
      <PageTitle title={t.monthlyWorkerHistory} subtitle={`${fullName} · ${site?.name || ""}`} />
      <div className="worker-history-profile">
        <div className="worker-history-avatar" aria-hidden="true"><span className="avatar-helmet" /><span className="avatar-face" /><span className="avatar-shirt" /></div>
        <div><h3>{fullName}</h3><p>{t.passport}: <NumericToken className="passport-token">{worker?.passport}</NumericToken> · {t.country}: {getCountryLabel(worker?.country, language)}</p></div>
      </div>
      <section className="worker-history-summary">
        <Metric value={formatCurrencyAmount(hourlyRate, language)} label={t.hourlyRate} tone="blue" />
        <Metric value={formatPaymentHours(paymentSummary.totalHours, language)} label={t.paymentTotalHours} tone="purple" />
        <Metric value={formatCurrencyAmount(paymentSummary.totalPayment, language)} label={t.totalPayment} tone="green" />
      </section>
      <AdminTableFrame>
        <table className="admin-table">
          <thead><tr><th>{t.date}</th><th>{t.entry}</th><th>{t.exit}</th><th>{t.totalHours}</th><th>{t.statusReason}</th></tr></thead>
          <tbody>{history.map((record) => <tr className={record.status ? "status-alert-row" : ""} key={record.date}><td><NumericToken>{record.date}</NumericToken></td><td><NumericToken>{record.entry || "-"}</NumericToken></td><td><NumericToken>{record.exit || "-"}</NumericToken></td><td><NumericToken>{getRecordTotal(record, siteSetting) || "-"}</NumericToken></td><td>{getStatusLabel(record.status, language, t)}</td></tr>)}</tbody>
        </table>
      </AdminTableFrame>
    </section>
  );
}

function AdminReportsView({ t, language, workers, selectedMonth, clock, siteSettings, onMonthChange, onOpenSite }) {
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
          <p className="report-data-notice">{reportMode === "daily" ? t.dailyReportDataNotice : t.monthlyReportDataNotice}</p>
        </div>
        <div className="selected-site-placeholder">
          <small>{t.selectSite}</small>
          <strong>{siteDefinitions.length}</strong>
          <span>{t.sites}</span>
        </div>
      </section>
      <div className="report-selector-grid">
        {siteDefinitions.map((site) => {
          const metrics = getSiteMetrics(workers, site.id, clock, siteSettings);
          const reportTotals = getSiteReportTotals(workers, site.id, selectedMonth, clock, siteSettings);
          return (
            <article className="report-selector-card" key={site.id}>
              <div className="report-selector-main">
                <div className="report-selector-copy">
                  <h3>{site.name}</h3>
                  <p>{site.address || rangeLabel}</p>
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
                    <Metric value={formatPaymentHours(reportTotals.monthlyHoursDecimal, language)} label={t.siteMonthlyHoursValue} tone="purple" />
                    <Metric value={formatCurrencyAmount(reportTotals.minimumWageValue, language)} label={t.minimumWageHoursValue} tone="green" />
                  </>
                ) : (
                  <>
                    <Metric value={reportTotals.totalWorkers} label={t.totalWorkers} tone="blue" />
                    <Metric value={formatPaymentHours(reportTotals.monthlyHoursDecimal, language)} label={t.siteMonthlyHoursValue} tone="purple" />
                    <Metric value={formatCurrencyAmount(reportTotals.minimumWageValue, language)} label={t.minimumWageHoursValue} tone="green" />
                    <Metric value={reportTotals.missingDays} label={t.missingDays} tone="red" />
                    <Metric value={reportTotals.daysWorked} label={t.daysWorked} tone="green" />
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

function AdminSiteReportView({ t, language, siteId, workers, selectedMonth, clock, siteSettings, onMonthChange, onOpenWorker, onBack }) {
  const [reportMode, setReportMode] = useState("daily");
  const reportMonths = getReportMonths(clock);
  const site = siteDefinitions.find((item) => item.id === siteId);
  const todayDate = getTodayDate(clock);
  const siteWorkers = workers.filter((worker) => worker.siteId === siteId && isSameDate(worker.date || todayDate, todayDate));
  const siteSetting = getSiteSetting(siteSettings, siteId);
  const reportTotals = getSiteReportTotals(workers, siteId, selectedMonth, clock, siteSettings);
  const dailyRows = getDailyReportDates(selectedMonth, clock).flatMap((date) =>
    siteWorkers.map((worker) => {
      const record = getReportRowsForWorker(worker, selectedMonth, clock, siteSettings).find((item) => isSameDate(item.date, date));
      return { worker, record: record || { date, entry: "", exit: "", status: "" } };
    }),
  );

  return (
    <section className="admin-page site-report-page">
      <button className="admin-back-button" type="button" onClick={onBack}>{t.back}</button>
      <PageTitle title={t.reports} subtitle={`${site.name} · ${site.address || site.location} · ${getReportRangeLabel(selectedMonth, clock)}`} />
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
          <p className="report-data-notice">{reportMode === "daily" ? t.dailyReportDataNotice : t.monthlyReportDataNotice}</p>
        </div>
      </section>
      <section className="report-summary-card">
        <Metric value={reportTotals.totalWorkers} label={t.totalWorkers} tone="blue" />
        <Metric value={reportTotals.daysWorked} label={t.daysWorked} tone="green" />
        <Metric value={reportTotals.missingDays} label={t.missingDays} tone="red" />
        <Metric value={`${reportTotals.attendance}%`} label={t.attendancePercent} tone="blue" />
        <Metric value={formatPaymentHours(reportTotals.monthlyHoursDecimal, language)} label={t.siteMonthlyHoursValue} tone="purple" />
        <Metric value={formatCurrencyAmount(reportTotals.minimumWageValue, language)} label={t.minimumWageHoursValue} tone="green" />
        <Metric value={`${formatCurrencyAmount(reportTotals.minimumHourlyRate, language)} ${t.perHour}`} label={t.minimumWageRateUsed} tone="blue" />
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
                  <td><NumericToken>{record.date}</NumericToken></td><td>{getWorkerFullName(worker)}</td><td><NumericToken className="passport-token">{worker.passport}</NumericToken></td><td>{getCountryLabel(worker.country, language)}</td><td><NumericToken>{record.entry || "-"}</NumericToken></td><td><NumericToken>{record.exit || "-"}</NumericToken></td><td><NumericToken>{getRecordTotal(record, siteSetting) || "-"}</NumericToken></td><td>{getStatusLabel(record.status, language, t)}</td>
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
                const summary = getWorkerMonthlySummary(worker, t, language, selectedMonth, clock, siteSettings);
                return (
                  <tr className={worker.status ? "status-alert-row" : ""} key={worker.id} onClick={() => onOpenWorker(worker.id)}>
                    <td>{getWorkerFullName(worker)}</td><td><NumericToken className="passport-token">{worker.passport}</NumericToken></td><td>{getCountryLabel(worker.country, language)}</td><td><NumericToken>{summary.daysWorked}</NumericToken></td><td><NumericToken>{summary.missingDays}</NumericToken></td><td><NumericToken>{summary.totalHours}</NumericToken></td>
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

function AdminProjectsView({ t, language, workers, siteSettings, onOpenSite }) {
  return (
    <section className="admin-page sites-management-page">
      <PageTitle title={t.sites} subtitle={t.projectsSubtitle} />
      <div className="project-list">
        {siteDefinitions.map((site) => {
          const metrics = getSiteMetrics(workers, site.id, new Date(), siteSettings);
          return (
            <article className="project-card" key={site.id}>
              <div className="project-image-wrap">
                <img src={site.image} alt="" />
                <span className="project-image-badge">{site.status}</span>
              </div>
              <div className="project-info"><h3>{site.name}</h3><p>{t.location}: {site.location}</p><p>{t.siteAddress}: {site.address}</p><p>{t.contractorManager}: {site.client}</p><p>{t.stage}: {site.stage}</p></div>
              <div className="project-progress"><span>{t.progress}</span><strong>{site.progress}%</strong><div><i style={{ width: `${site.progress}%` }} /></div><small>{site.status}</small></div>
              <div className="project-stats"><Metric value={metrics.totalWorkers} label={t.assigned} tone="blue" /><Metric value={metrics.missing} label={t.missingToday} tone="red" /><Metric value={`${metrics.attendance}%`} label={t.attendancePercent} tone="green" /><Metric value={metrics.totalHours} label={t.totalWorkHours} tone="purple" /><button type="button" onClick={() => onOpenSite(site.id)}>{t.openSite}</button></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getDemoWorkerHistory(worker, { includeToday = false, referenceDate = new Date(), siteSettings = getDefaultSiteSettingsMap() } = {}) {
  const seed = worker?.id || 1;
  const todayDate = getTodayDate(referenceDate);
  const siteSetting = getSiteSetting(siteSettings, worker?.siteId);
  const dates = getCurrentMonthDates(referenceDate).filter((date) => includeToday || !isSameDate(date, todayDate));
  return dates.map((date, index) => {
    if (isSameDate(date, todayDate) && worker) {
      return applyAttendanceRules({
        date,
        siteId: worker.siteId,
        actualEntryTime: worker.actualEntryTime || worker.entry,
        actualExitTime: worker.actualExitTime || worker.exit,
        entry: worker.entry,
        exit: worker.exit,
        status: worker.status,
      }, siteSetting);
    }
    if ((seed + index) % 7 === 0) return { date, entry: "", exit: "", status: "אי הגעה" };
    if ((seed + index) % 11 === 0) return { date, entry: "", exit: "", status: "מחלה" };
    const times = getDeterministicAttendance(seed, index);
    return applyAttendanceRules({
      date,
      siteId: worker?.siteId,
      actualEntryTime: times.entry,
      actualExitTime: times.exit,
      entry: times.entry,
      exit: times.exit,
      status: "",
    }, siteSetting);
  });
}

function getMonthlyHoursForWorker(worker, monthId = getDefaultReportMonthId(), referenceDate = new Date(), siteSettings = getDefaultSiteSettingsMap()) {
  const siteSetting = getSiteSetting(siteSettings, worker?.siteId);
  const minutes = getReportRowsForWorker(worker, monthId, referenceDate, siteSettings).reduce((sum, record) => sum + (getRecordMinutes(record, siteSetting) || 0), 0);
  return formatMinutes(minutes);
}

function getSiteMonthlyHours(workers, siteId, monthId = getDefaultReportMonthId(), referenceDate = new Date(), siteSettings = getDefaultSiteSettingsMap()) {
  const siteSetting = getSiteSetting(siteSettings, siteId);
  const minutes = workers
    .filter((worker) => worker.siteId === siteId)
    .reduce((sum, worker) => {
      return sum + getReportRowsForWorker(worker, monthId, referenceDate, siteSettings).reduce((recordSum, record) => recordSum + (getRecordMinutes(record, siteSetting) || 0), 0);
    }, 0);
  return formatMinutes(minutes);
}

function Metric({ value, label, tone }) {
  return <div className={`metric ${tone}`}><strong>{value}</strong><span>{label}</span></div>;
}

function NumericToken({ children, className = "" }) {
  return <bdi className={["numeric-token", className].filter(Boolean).join(" ")}>{children}</bdi>;
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
