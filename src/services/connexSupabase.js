import { isSupabaseConfigured, requireSupabaseClient } from "../lib/supabaseClient.js";

export { isSupabaseConfigured };

function pad(value) {
  return String(value).padStart(2, "0");
}

function toIsoDate(dateValue) {
  if (!dateValue) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
  const [day, month, year] = String(dateValue).split("/").map(Number);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

function fromIsoDate(dateValue) {
  if (!dateValue) return "";
  const [year, month, day] = String(dateValue).slice(0, 10).split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
}

function toDbTime(timeValue) {
  if (!timeValue) return null;
  const [hours, minutes] = String(timeValue).split(":");
  if (hours === undefined || minutes === undefined) return null;
  return `${pad(Number(hours))}:${pad(Number(minutes))}:00`;
}

function fromDbTime(timeValue) {
  if (!timeValue) return "";
  return String(timeValue).slice(0, 5);
}

function normalizeNumber(value, fallback = null) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

async function runSupabaseQuery(query, fallbackMessage = "Supabase request failed.") {
  const { data, error } = await query;
  if (error) {
    throw new Error(`${fallbackMessage} ${error.message || ""}`.trim());
  }
  return data;
}

function mapWorker(row) {
  return {
    id: Number(row.id),
    employeeNumber: row.employee_number || "",
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    passport: row.passport || "",
    country: row.country || "Nepal",
    entry: "",
    exit: "",
    status: row.status || "",
    siteId: row.site_id || "",
    sourceSiteName: row.source_site_name || "",
    hourlyRate: normalizeNumber(row.hourly_rate, 35.4),
    source: "supabase-worker",
  };
}

function mapAttendanceRecord(row) {
  const checkInGpsEvidence = row.check_in_gps_evidence || null;
  const checkOutGpsEvidence = row.check_out_gps_evidence || null;
  return {
    id: row.id,
    remoteId: row.id,
    workerId: Number(row.worker_id),
    date: fromIsoDate(row.work_date),
    siteId: row.site_id || "",
    actualEntryTime: fromDbTime(row.actual_entry_time),
    actualExitTime: fromDbTime(row.actual_exit_time),
    entry: fromDbTime(row.entry_time || row.actual_entry_time),
    exit: fromDbTime(row.exit_time || row.actual_exit_time),
    status: row.status || "",
    source: row.source || "live",
    checkInGpsEvidence,
    checkOutGpsEvidence,
    gpsEvidence: {
      checkIn: checkInGpsEvidence,
      checkOut: checkOutGpsEvidence,
    },
  };
}

function mapActivePunch(row) {
  return {
    workerId: Number(row.worker_id),
    entryDate: fromIsoDate(row.entry_date),
    entryTime: fromDbTime(row.entry_time),
    siteId: row.site_id || "",
    checkInGpsEvidence: row.check_in_gps_evidence || null,
  };
}

function mapSiteSettings(row) {
  return {
    siteId: row.id,
    siteName: row.name,
    siteAddress: row.address,
    latitude: normalizeNumber(row.latitude),
    longitude: normalizeNumber(row.longitude),
    radiusMeters: normalizeNumber(row.radius_meters, 250),
    workDayStartTime: fromDbTime(row.work_day_start_time) || "07:00",
    workDayEndTime: fromDbTime(row.work_day_end_time) || "19:00",
    roundingRule: row.rounding_rule || "site-day-cap",
    roundingToleranceMinutes: normalizeNumber(row.rounding_tolerance_minutes, 15),
  };
}

function toAttendanceRow(record) {
  return {
    worker_id: Number(record.workerId),
    work_date: toIsoDate(record.date),
    site_id: record.siteId,
    actual_entry_time: toDbTime(record.actualEntryTime || record.entry),
    actual_exit_time: toDbTime(record.actualExitTime || record.exit),
    entry_time: toDbTime(record.entry || record.actualEntryTime),
    exit_time: toDbTime(record.exit || record.actualExitTime),
    status: record.status || "",
    source: record.source || "live",
    check_in_gps_evidence: record.checkInGpsEvidence || record.gpsEvidence?.checkIn || null,
    check_out_gps_evidence: record.checkOutGpsEvidence || record.gpsEvidence?.checkOut || null,
    updated_at: new Date().toISOString(),
  };
}

export async function loadSupabaseLiveData() {
  if (!isSupabaseConfigured) return null;
  const client = requireSupabaseClient();

  const [workers, sites, attendanceRecords, activePunches] = await Promise.all([
    runSupabaseQuery(client.from("workers").select("*").order("id", { ascending: true }), "Could not load workers."),
    runSupabaseQuery(client.from("sites").select("*").order("sort_order", { ascending: true }), "Could not load sites."),
    runSupabaseQuery(
      client.from("attendance_records").select("*").order("work_date", { ascending: false }).order("created_at", { ascending: false }).limit(2000),
      "Could not load attendance records.",
    ),
    runSupabaseQuery(client.from("active_punches").select("*"), "Could not load active punches."),
  ]);

  return {
    workers: Array.isArray(workers) ? workers.map(mapWorker) : [],
    records: Array.isArray(attendanceRecords) ? attendanceRecords.map(mapAttendanceRecord) : [],
    activePunches: Array.isArray(activePunches) ? activePunches.map(mapActivePunch) : [],
    siteSettings: Object.fromEntries((Array.isArray(sites) ? sites : []).map((site) => [site.id, mapSiteSettings(site)])),
  };
}

export async function findSupabaseWorkerLogin(username, password) {
  if (!isSupabaseConfigured) return null;
  const client = requireSupabaseClient();
  const row = await runSupabaseQuery(
    client.from("workers").select("id").eq("username", username).eq("password", password).limit(1).maybeSingle(),
    "Could not verify worker login.",
  );
  return row ? { workerId: Number(row.id) } : null;
}

export async function getSupabaseActivePunch(workerId) {
  if (!isSupabaseConfigured || !workerId) return null;
  const client = requireSupabaseClient();
  const row = await runSupabaseQuery(
    client.from("active_punches").select("*").eq("worker_id", Number(workerId)).limit(1).maybeSingle(),
    "Could not load active punch.",
  );
  return row ? mapActivePunch(row) : null;
}

export async function saveSupabaseActivePunch(punch) {
  if (!isSupabaseConfigured || !punch?.workerId) return null;
  const client = requireSupabaseClient();
  const row = {
    worker_id: Number(punch.workerId),
    entry_date: toIsoDate(punch.entryDate),
    entry_time: toDbTime(punch.entryTime),
    site_id: punch.siteId,
    check_in_gps_evidence: punch.checkInGpsEvidence || null,
    updated_at: new Date().toISOString(),
  };
  await runSupabaseQuery(client.from("active_punches").upsert(row, { onConflict: "worker_id" }), "Could not save active punch.");
  return punch;
}

export async function clearSupabaseActivePunch(workerId) {
  if (!isSupabaseConfigured || !workerId) return;
  const client = requireSupabaseClient();
  await runSupabaseQuery(client.from("active_punches").delete().eq("worker_id", Number(workerId)), "Could not clear active punch.");
}

export async function saveSupabaseAttendanceRecord(record) {
  if (!isSupabaseConfigured || !record?.workerId || !record?.date) return null;
  const client = requireSupabaseClient();
  const row = toAttendanceRow(record);
  const rows = await runSupabaseQuery(
    client.from("attendance_records").upsert(row, { onConflict: "worker_id,work_date" }).select(),
    "Could not save attendance record.",
  );
  return Array.isArray(rows) && rows[0] ? mapAttendanceRecord(rows[0]) : record;
}

export async function updateSupabaseWorker(workerId, patch) {
  if (!isSupabaseConfigured || !workerId) return null;
  const client = requireSupabaseClient();
  const body = {
    updated_at: new Date().toISOString(),
  };
  if (patch.siteId !== undefined) body.site_id = patch.siteId;
  if (patch.status !== undefined) body.status = patch.status;
  if (patch.hourlyRate !== undefined) body.hourly_rate = patch.hourlyRate;
  await runSupabaseQuery(client.from("workers").update(body).eq("id", Number(workerId)), "Could not update worker.");
}

export async function saveSupabaseSiteSetting(siteId, settings) {
  if (!isSupabaseConfigured || !siteId) return null;
  const client = requireSupabaseClient();
  const body = {
    name: settings.siteName,
    address: settings.siteAddress,
    latitude: settings.latitude,
    longitude: settings.longitude,
    radius_meters: settings.radiusMeters,
    work_day_start_time: toDbTime(settings.workDayStartTime),
    work_day_end_time: toDbTime(settings.workDayEndTime),
    rounding_rule: settings.roundingRule,
    rounding_tolerance_minutes: settings.roundingToleranceMinutes,
    updated_at: new Date().toISOString(),
  };
  await runSupabaseQuery(client.from("sites").update(body).eq("id", siteId), "Could not save site settings.");
}
