import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const projectRoot = process.cwd();
const dataPath = path.join(projectRoot, "src", "data", "adminDemoData.js");
const outputDir = path.join(projectRoot, "supabase", "generated");
const outputPath = path.join(outputDir, "connex_live_demo_seed.sql");

const gpsBySiteId = {
  "naomi-shemer": { latitude: 32.1474603, longitude: 34.8893482 },
  avgad: { latitude: 32.1441405, longitude: 34.8398525 },
  "electric-company": { latitude: 32.853151, longitude: 35.0828546 },
  "forma-tel-aviv": { latitude: 32.110132, longitude: 34.796307 },
};

function sql(value) {
  if (value === null || value === undefined || value === "") return "null";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlTime(value) {
  return value ? sql(`${value}:00`) : "null";
}

function evaluateDemoData() {
  const source = fs.readFileSync(dataPath, "utf8");
  const runnableSource = source
    .replace(/^import\s+.+?;\s*$/gm, "")
    .replace(/export const/g, "const");

  const context = {
    naomiImage: "naomi-shemer",
    avgadImage: "avgad",
    formaImage: "forma-tel-aviv",
    electricCompanyImage: "electric-company",
  };

  return vm.runInNewContext(
    `${runnableSource}\n({ siteDefinitions, workerCredentials, workbookWorkers, MINIMUM_HOURLY_RATE_ILS });`,
    context,
    { timeout: 1000 },
  );
}

function buildSitesInsert(siteDefinitions) {
  const values = siteDefinitions.map((site, index) => {
    const gps = gpsBySiteId[site.id];
    if (!gps) throw new Error(`Missing GPS settings for site ${site.id}`);
    return `(${[
      sql(site.id),
      sql(site.name),
      sql(site.location),
      sql(site.address),
      sql(site.client),
      sql(site.stage),
      sql(site.nextStage),
      sql(site.progress),
      sql(site.status),
      sql(site.id),
      sql(index + 1),
      sql(gps.latitude),
      sql(gps.longitude),
      sql(250),
      sqlTime("07:00"),
      sqlTime("19:00"),
      sql("site-day-cap"),
      sql(15),
    ].join(", ")})`;
  });

  return `insert into public.sites (
  id, name, location, address, client, stage, next_stage, progress, status,
  image_key, sort_order, latitude, longitude, radius_meters,
  work_day_start_time, work_day_end_time, rounding_rule, rounding_tolerance_minutes
) values
${values.join(",\n")}
on conflict (id) do update set
  name = excluded.name,
  location = excluded.location,
  address = excluded.address,
  client = excluded.client,
  stage = excluded.stage,
  next_stage = excluded.next_stage,
  progress = excluded.progress,
  status = excluded.status,
  image_key = excluded.image_key,
  sort_order = excluded.sort_order,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  radius_meters = excluded.radius_meters,
  work_day_start_time = excluded.work_day_start_time,
  work_day_end_time = excluded.work_day_end_time,
  rounding_rule = excluded.rounding_rule,
  rounding_tolerance_minutes = excluded.rounding_tolerance_minutes;`;
}

function buildWorkersInsert(workbookWorkers, workerCredentials, minimumHourlyRate) {
  const credentialsByWorkerId = new Map(workerCredentials.map((credential) => [Number(credential.workerId), credential]));
  const values = workbookWorkers.map((worker) => {
    const credential = credentialsByWorkerId.get(Number(worker.id));
    if (!credential) throw new Error(`Missing credentials for worker ${worker.id}`);
    return `(${[
      sql(worker.id),
      sql(worker.employeeNumber),
      sql(worker.firstName),
      sql(worker.lastName),
      sql(worker.passport),
      sql(worker.country || "Nepal"),
      sql(credential.username),
      sql(credential.password),
      sql(worker.siteId),
      sql(worker.sourceSiteName),
      sql(worker.hourlyRate || minimumHourlyRate),
      sql(worker.status || ""),
    ].join(", ")})`;
  });

  return `insert into public.workers (
  id, employee_number, first_name, last_name, passport, country,
  username, password, site_id, source_site_name, hourly_rate, status
) values
${values.join(",\n")}
on conflict (id) do update set
  employee_number = excluded.employee_number,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  passport = excluded.passport,
  country = excluded.country,
  username = excluded.username,
  password = excluded.password,
  site_id = excluded.site_id,
  source_site_name = excluded.source_site_name,
  hourly_rate = excluded.hourly_rate,
  status = excluded.status;`;
}

const { siteDefinitions, workerCredentials, workbookWorkers, MINIMUM_HOURLY_RATE_ILS } = evaluateDemoData();
fs.mkdirSync(outputDir, { recursive: true });

const seedSql = `-- Connex live-demo seed.
-- Sensitive: contains live-demo worker credentials and passport numbers.
-- This file is generated into supabase/generated/ and should not be committed.

begin;

${buildSitesInsert(siteDefinitions)}

${buildWorkersInsert(workbookWorkers, workerCredentials, MINIMUM_HOURLY_RATE_ILS)}

commit;
`;

fs.writeFileSync(outputPath, seedSql, "utf8");

console.log(JSON.stringify({
  ok: true,
  outputPath,
  sites: siteDefinitions.length,
  workers: workbookWorkers.length,
  credentials: workerCredentials.length,
}, null, 2));
