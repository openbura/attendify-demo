import { createRequire } from "module";
import fs from "fs";
import path from "path";

const require = createRequire(import.meta.url);

const PRODUCTION_URL = process.env.CONNEX_PRODUCTION_URL || "https://connex-worker-attendance.vercel.app";
const EXPECTED_WORKERS = Number(process.env.CONNEX_EXPECTED_WORKERS || 21);
const EXPECTED_SITES = Number(process.env.CONNEX_EXPECTED_SITES || 4);
const REQUEST_TIMEOUT_MS = Number(process.env.CONNEX_HEALTH_TIMEOUT_MS || 15000);
const RUN_BROWSER_CHECK = process.env.CONNEX_HEALTH_BROWSER !== "0";
const REQUIRE_BROWSER_CHECK = process.env.CONNEX_HEALTH_REQUIRE_BROWSER === "1";

const projectRoot = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    const envKey = key.trim();
    if (!envKey || process.env[envKey] !== undefined) continue;
    const rawValue = valueParts.join("=").trim();
    process.env[envKey] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env.production.local", ".env"]) {
    loadEnvFile(path.join(projectRoot, fileName));
  }
}

function normalizeSupabaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function createFailure(check, likelyCause, nextAction, details = "") {
  return { check, likelyCause, nextAction, details };
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetchWithTimeout(url, options);
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}${body ? `: ${body.slice(0, 160)}` : ""}`);
  }
  return response.json();
}

async function loadProductionAppShell(failures) {
  try {
    const response = await fetchWithTimeout(PRODUCTION_URL);
    if (response.status !== 200) {
      failures.push(createFailure(
        "production URL status",
        `Production URL returned HTTP ${response.status}.`,
        "Check Vercel deployment status and production alias.",
      ));
    }
    const html = await response.text();
    if (!html.includes('id="root"') || !html.includes("/assets/")) {
      failures.push(createFailure(
        "app shell HTML",
        "Production HTML does not look like the Connex Vite app shell.",
        "Check Vercel output directory/build and redeploy if needed.",
      ));
    }
    return html;
  } catch (error) {
    failures.push(createFailure(
      "production URL load",
      "Production URL is unreachable or timed out.",
      "Check Vercel deployment, domain alias, and network status.",
      error.message,
    ));
    return "";
  }
}

async function extractSupabaseConfigFromProduction(html) {
  if (!html) return { supabaseUrl: "", anonKey: "" };
  const scriptPaths = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1]);
  for (const scriptPath of scriptPaths) {
    const scriptUrl = new URL(scriptPath, PRODUCTION_URL).toString();
    const response = await fetchWithTimeout(scriptUrl);
    if (!response.ok) continue;
    const bundle = await response.text();
    const supabaseUrl = bundle.match(/https:\/\/[a-z0-9-]+\.supabase\.co/)?.[0] || "";
    const publishableKey = bundle.match(/sb_publishable_[A-Za-z0-9_-]+/)?.[0] || "";
    const legacyAnonKey = bundle.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/)?.[0] || "";
    const anonKey = publishableKey || legacyAnonKey;
    if (supabaseUrl && anonKey) return { supabaseUrl, anonKey };
  }
  return { supabaseUrl: "", anonKey: "" };
}

function getSupabaseHeaders(anonKey) {
  return {
    apikey: anonKey,
    authorization: `Bearer ${anonKey}`,
    "content-type": "application/json",
  };
}

async function querySupabaseTable({ supabaseUrl, anonKey, table, select = "id", limit = "" }) {
  const params = new URLSearchParams({ select });
  if (limit) params.set("limit", String(limit));
  const url = `${supabaseUrl}/rest/v1/${table}?${params.toString()}`;
  return fetchJson(url, { headers: getSupabaseHeaders(anonKey) });
}

function addCodexPlaywrightPath() {
  const homeDir = process.env.USERPROFILE || process.env.HOME || "";
  const codexPlaywrightNodeModules = path.join(homeDir, ".codex", "tools", "playwright-check", "node_modules");
  if (!fs.existsSync(codexPlaywrightNodeModules)) return;
  process.env.NODE_PATH = [process.env.NODE_PATH, codexPlaywrightNodeModules].filter(Boolean).join(path.delimiter);
  require("module").Module._initPaths();
}

async function runBrowserSmokeCheck(failures) {
  if (!RUN_BROWSER_CHECK) return "skipped";

  try {
    addCodexPlaywrightPath();
    const { chromium } = require("playwright");
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const browser = await chromium.launch({
      headless: true,
      executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
    });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "he-IL" });
    const page = await context.newPage();
    const consoleErrors = [];
    const requestFailures = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", (request) => {
      const url = request.url();
      if (!url.includes("favicon")) requestFailures.push(`${request.failure()?.errorText || "request failed"} ${url}`);
    });

    await page.goto(PRODUCTION_URL, { waitUntil: "domcontentloaded", timeout: REQUEST_TIMEOUT_MS });
    await page.waitForSelector("#workerId", { timeout: REQUEST_TIMEOUT_MS });
    await page.fill("#workerId", "111");
    await page.fill("#password", "111");
    await page.click('button[type="submit"]');
    await page.waitForSelector(".admin-shell", { timeout: REQUEST_TIMEOUT_MS });

    const adminText = await page.locator(".admin-shell").innerText();
    const direction = await page.locator(".admin-shell").evaluate((node) => node.getAttribute("dir"));
    await browser.close();

    if (direction !== "rtl") {
      failures.push(createFailure(
        "admin browser smoke",
        "Admin shell loaded but direction is not RTL.",
        "Open production admin and verify default language/direction.",
      ));
    }
    if (adminText.toLowerCase().includes("local-only")) {
      failures.push(createFailure(
        "Supabase mode in app shell",
        "Production appears to be in localStorage fallback mode.",
        "Check Vercel VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.",
      ));
    }
    const relevantConsoleErrors = consoleErrors.filter((error) =>
      !error.includes("favicon")
      && !error.includes("Failed to load resource: the server responded with a status of 404"),
    );
    if (requestFailures.length || relevantConsoleErrors.length) {
      failures.push(createFailure(
        "browser runtime",
        "Production loaded with console or request errors.",
        "Open the production URL in browser devtools and inspect console/network errors.",
        [...requestFailures, ...relevantConsoleErrors].slice(0, 3).join(" | "),
      ));
    }
    return "passed";
  } catch (error) {
    if (REQUIRE_BROWSER_CHECK) {
      failures.push(createFailure(
        "browser smoke",
        "Headless browser check could not complete.",
        "Confirm local Playwright/Chrome is available for Codex automation.",
        error.message,
      ));
      return "failed";
    }
    return "skipped";
  }
}

function printOk(summary) {
  console.log("CONNEX_HEALTH_OK");
  console.log(`productionUrl=${summary.productionUrl}`);
  console.log(`workers=${summary.workersCount}/${EXPECTED_WORKERS}`);
  console.log(`sites=${summary.sitesCount}/${EXPECTED_SITES}`);
  console.log(`active_punches=readable count=${summary.activePunchesCount}`);
  console.log(`attendance_records=readable sample=${summary.attendanceSampleCount}`);
  console.log(`browser=${summary.browserCheck}`);
}

function printFail(failures, summary) {
  console.log("CONNEX_HEALTH_FAIL");
  console.log(`productionUrl=${PRODUCTION_URL}`);
  if (summary) {
    console.log(`workers=${summary.workersCount ?? "unknown"}/${EXPECTED_WORKERS}`);
    console.log(`sites=${summary.sitesCount ?? "unknown"}/${EXPECTED_SITES}`);
    console.log(`active_punches=${summary.activePunchesStatus || "unknown"}`);
    console.log(`attendance_records=${summary.attendanceRecordsStatus || "unknown"}`);
  }
  for (const failure of failures) {
    console.log(`failed_check=${failure.check}`);
    console.log(`likely_cause=${failure.likelyCause}`);
    console.log(`next_action=${failure.nextAction}`);
    if (failure.details) console.log(`details=${failure.details}`);
  }
}

async function main() {
  loadLocalEnv();
  const failures = [];
  const summary = {
    productionUrl: PRODUCTION_URL,
    workersCount: null,
    sitesCount: null,
    activePunchesStatus: "not checked",
    attendanceRecordsStatus: "not checked",
  };

  const html = await loadProductionAppShell(failures);
  let supabaseUrl = normalizeSupabaseUrl(process.env.VITE_SUPABASE_URL);
  let anonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!supabaseUrl || !anonKey) {
    const productionConfig = await extractSupabaseConfigFromProduction(html);
    supabaseUrl = normalizeSupabaseUrl(productionConfig.supabaseUrl);
    anonKey = productionConfig.anonKey;
  }

  if (!supabaseUrl || !anonKey) {
    failures.push(createFailure(
      "Supabase environment",
      "Health check could not find Supabase env vars locally or in the production Vite bundle.",
      "Check Vercel VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY and redeploy production.",
    ));
  } else {
    try {
      const workers = await querySupabaseTable({ supabaseUrl, anonKey, table: "workers", select: "id" });
      summary.workersCount = Array.isArray(workers) ? workers.length : null;
      if (summary.workersCount !== EXPECTED_WORKERS) {
        failures.push(createFailure(
          "workers count",
          `Supabase workers count returned ${summary.workersCount}.`,
          "Check the Supabase seed/data state for the Connex live-demo project.",
        ));
      }
    } catch (error) {
      failures.push(createFailure(
        "workers read",
        "Supabase workers table read failed.",
        "Check Supabase project status, RLS/Data API grants, and Vercel/local env vars.",
        error.message,
      ));
    }

    try {
      const sites = await querySupabaseTable({ supabaseUrl, anonKey, table: "sites", select: "id" });
      summary.sitesCount = Array.isArray(sites) ? sites.length : null;
      if (summary.sitesCount !== EXPECTED_SITES) {
        failures.push(createFailure(
          "sites count",
          `Supabase sites count returned ${summary.sitesCount}.`,
          "Check the Supabase seed/data state for the 4 Connex live-demo sites.",
        ));
      }
    } catch (error) {
      failures.push(createFailure(
        "sites read",
        "Supabase sites table read failed.",
        "Check Supabase project status, RLS/Data API grants, and env vars.",
        error.message,
      ));
    }

    try {
      const activePunches = await querySupabaseTable({ supabaseUrl, anonKey, table: "active_punches", select: "worker_id", limit: 1000 });
      summary.activePunchesCount = Array.isArray(activePunches) ? activePunches.length : 0;
      summary.activePunchesStatus = "readable";
    } catch (error) {
      summary.activePunchesStatus = "failed";
      failures.push(createFailure(
        "active_punches read",
        "Supabase active_punches query failed.",
        "Check table existence, RLS/Data API grants, and Supabase availability.",
        error.message,
      ));
    }

    try {
      const attendanceRecords = await querySupabaseTable({ supabaseUrl, anonKey, table: "attendance_records", select: "id", limit: 1 });
      summary.attendanceSampleCount = Array.isArray(attendanceRecords) ? attendanceRecords.length : 0;
      summary.attendanceRecordsStatus = "readable";
    } catch (error) {
      summary.attendanceRecordsStatus = "failed";
      failures.push(createFailure(
        "attendance_records read",
        "Supabase attendance_records query failed.",
        "Check table existence, RLS/Data API grants, and Supabase availability.",
        error.message,
      ));
    }
  }

  summary.browserCheck = await runBrowserSmokeCheck(failures);

  if (failures.length) {
    printFail(failures, summary);
    process.exit(1);
  }

  printOk(summary);
}

main().catch((error) => {
  printFail([
    createFailure(
      "health script runtime",
      "The Connex health check script crashed before completing checks.",
      "Run npm run health:connex locally and inspect the runtime error.",
      error.message,
    ),
  ]);
  process.exit(1);
});
