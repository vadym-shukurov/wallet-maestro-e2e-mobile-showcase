#!/usr/bin/env node

/**
 * Qase Test Run Reporter
 *
 * Parses Maestro JUnit XML results and reports them to Qase via API v1.
 *
 * Workflow:
 *   1. Scans e2e/results/ for individual JUnit XML files
 *   2. Creates a new Qase test run
 *   3. For each result, finds or creates the matching Qase case
 *   4. Reports each test case result (pass/fail with timing and screenshots)
 *   5. Completes the test run
 *
 * Required env vars:
 *   QASE_API_TOKEN  – from https://app.qase.io/user/api/token
 *   QASE_PROJECT    – project code (e.g. "RNS")
 *
 * Optional env vars:
 *   QASE_RUN_TITLE  – custom title for the run
 *   QASE_CASE_MAP   – JSON: flow key → Qase case ID (overrides find-or-create)
 */

const fs = require("fs");
const path = require("path");

const QASE_BASE = "https://api.qase.io/v1";
const RESULTS_DIR = path.resolve(__dirname, "..", "results");
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Deterministic mapping from YAML filename (without extension) to a stable key.
// Every flow file must have an entry here; unknown files fall back to the filename.
const FLOW_FILE_TO_KEY = {
  "import-wallet": "import-wallet",
  "import-wallet-back-navigation": "import-wallet-back",
  "create-wallet-seed-phrase": "create-wallet",
  "create-wallet-confirm-phrase": "create-wallet-confirm",
  "onboarding-navigation": "onboarding-navigation",
  "seed-phrase-visibility": "seed-phrase-visibility",
  "import-wallet-invalid-phrase": "import-wallet-invalid",
  "import-wallet-incomplete-phrase": "import-wallet-incomplete",
  "create-wallet-empty-name": "create-wallet-empty-name",
};

// ── Qase API helper (with retry) ───────────────────────

async function qase(method, endpoint, body) {
  const token = process.env.QASE_API_TOKEN;
  if (!token) throw new Error("QASE_API_TOKEN is not set");

  const url = `${QASE_BASE}${endpoint}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const opts = {
      method,
      headers: {
        Token: token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    if (body) opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(url, opts);
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.warn(`  ⚠ Network error (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      throw err;
    }

    const text = await res.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.error(`Qase API returned non-JSON [${res.status}]: ${text.slice(0, 200)}`);
      throw new Error(`Qase API ${method} ${endpoint} → ${res.status}`);
    }

    if (res.status === 429 || res.status >= 500) {
      if (attempt < MAX_RETRIES) {
        console.warn(`  ⚠ Qase API ${res.status} (attempt ${attempt}/${MAX_RETRIES}), retrying...`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
    }

    if (!res.ok) {
      console.error(`Qase API error [${res.status}]:`, JSON.stringify(json, null, 2));
      throw new Error(`Qase API ${method} ${endpoint} → ${res.status}`);
    }

    return json;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── JUnit XML parsing ──────────────────────────────────

function parseAllResults(resultsDir = RESULTS_DIR) {
  if (!fs.existsSync(resultsDir)) {
    console.error(`Results directory not found: ${resultsDir}`);
    return [];
  }

  const xmlFiles = fs
    .readdirSync(resultsDir)
    .filter((f) => f.endsWith(".xml"))
    .map((f) => path.join(resultsDir, f));

  if (xmlFiles.length === 0) {
    console.error("No XML files found in results directory.");
    return [];
  }

  const results = [];

  for (const xmlPath of xmlFiles) {
    const xml = fs.readFileSync(xmlPath, "utf-8");
    const flowFile = path.basename(xmlPath, ".xml");

    const testcaseRegex =
      /<testcase[^>]*name="([^"]*)"[^>]*time="([^"]*)"[^>]*(?:\/>|>([\s\S]*?)<\/testcase>)/g;
    const failureRegex =
      /<failure[^>]*(?:message="([^"]*)")?[^>]*>([\s\S]*?)<\/failure>/;
    const screenshotRegex =
      /\[\[ATTACHMENT\|([^\]]+)\]\]/g;

    let match;
    while ((match = testcaseRegex.exec(xml)) !== null) {
      const name = match[1];
      const timeSeconds = parseFloat(match[2]) || 0;
      const inner = match[3] || "";
      const failureMatch = failureRegex.exec(inner);

      const screenshots = [];
      let ssMatch;
      while ((ssMatch = screenshotRegex.exec(inner)) !== null) {
        const ssPath = ssMatch[1];
        if (fs.existsSync(ssPath)) screenshots.push(ssPath);
      }

      results.push({
        name,
        flowFile,
        passed: !failureMatch,
        time_ms: Math.round(timeSeconds * 1000),
        error: failureMatch
          ? (failureMatch[1] || failureMatch[2] || "").trim()
          : null,
        screenshots,
      });
    }
  }

  return results;
}

// ── Flow file → stable key mapping ─────────────────────

function flowKeyFromFile(flowFile) {
  return FLOW_FILE_TO_KEY[flowFile] || flowFile;
}

// ── Case map: env override or find-or-create ───────────

function buildCaseMapFromEnv() {
  const envMap = process.env.QASE_CASE_MAP;
  if (envMap) {
    try {
      return JSON.parse(envMap);
    } catch {
      console.warn("⚠  Failed to parse QASE_CASE_MAP, falling back to find-or-create");
    }
  }
  return {};
}

async function findOrCreateCase(project, title, suiteTitle) {
  const searchRes = await qase("GET", `/case/${project}?search=${encodeURIComponent(title)}&limit=10`);
  const existing = (searchRes.result?.entities || []).find(
    (c) => c.title === title
  );
  if (existing) return existing.id;

  const createRes = await qase("POST", `/case/${project}`, {
    title,
    suite_title: suiteTitle,
  });
  return createRes.result?.id || null;
}

// ── Screenshot upload ──────────────────────────────────

async function uploadScreenshot(project, screenshotPath) {
  const token = process.env.QASE_API_TOKEN;
  const url = `${QASE_BASE}/attachment/${project}`;

  const fileBuffer = fs.readFileSync(screenshotPath);
  const fileName = path.basename(screenshotPath);

  const boundary = `----FormBoundary${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`
    ),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Token: token,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        Accept: "application/json",
      },
      body,
    });
    const json = await res.json();
    if (json.result && json.result.length > 0) {
      return json.result[0].hash;
    }
  } catch (err) {
    console.warn(`  ⚠ Failed to upload screenshot ${fileName}: ${err.message}`);
  }
  return null;
}

// ── Main ───────────────────────────────────────────────

async function main() {
  const project = process.env.QASE_PROJECT;
  if (!project) {
    console.error("Error: QASE_PROJECT is required (e.g. 'RNS')");
    process.exit(1);
  }
  if (!process.env.QASE_API_TOKEN) {
    console.error("Error: QASE_API_TOKEN is required");
    process.exit(1);
  }

  // 1. Parse results
  const results = parseAllResults();
  if (results.length === 0) {
    console.warn("No test results found. Run tests first.");
    process.exit(0);
  }

  console.log(`\n📊 Found ${results.length} test result(s):\n`);
  const maxLen = Math.max(...results.map((r) => r.name.length));
  results.forEach((r) => {
    const icon = r.passed ? "✅" : "❌";
    const pad = " ".repeat(maxLen - r.name.length);
    console.log(`  ${icon}  ${r.name}${pad}  ${(r.time_ms / 1000).toFixed(1)}s`);
  });

  // 2. Resolve case IDs (from env override or find-or-create)
  const envCaseMap = buildCaseMapFromEnv();
  const resolvedCaseIds = {};

  console.log("\n🔍 Resolving Qase case IDs...\n");
  for (const result of results) {
    const flowKey = flowKeyFromFile(result.flowFile);
    if (envCaseMap[flowKey]) {
      resolvedCaseIds[flowKey] = envCaseMap[flowKey];
      console.log(`  📌 ${flowKey} → case #${envCaseMap[flowKey]} (from QASE_CASE_MAP)`);
    } else {
      const caseId = await findOrCreateCase(project, result.name, "E2E Automation");
      if (caseId) {
        resolvedCaseIds[flowKey] = caseId;
        console.log(`  🔗 ${flowKey} → case #${caseId} (found or created)`);
      } else {
        console.warn(`  ⚠ ${flowKey} → could not resolve case ID`);
      }
    }
  }

  // 3. Create test run
  const caseIds = Object.values(resolvedCaseIds).filter(Boolean);

  const runTitle =
    process.env.QASE_RUN_TITLE ||
    `E2E Automated Run — ${new Date().toISOString().slice(0, 16).replace("T", " ")}`;

  console.log(`\n🚀 Creating Qase run: "${runTitle}" in project ${project}...`);

  const runBody = {
    title: runTitle,
    description: `Automated run — ${results.filter((r) => r.passed).length}/${results.length} passed`,
    is_autotest: true,
  };
  if (caseIds.length > 0) runBody.cases = caseIds;

  const runRes = await qase("POST", `/run/${project}`, runBody);
  const runId = runRes.result?.id;
  if (!runId) {
    console.error("Failed to create run:", JSON.stringify(runRes));
    process.exit(1);
  }
  console.log(`   Run ID: ${runId}`);

  // 4. Report each result
  console.log("\n📤 Reporting results...\n");

  for (const result of results) {
    const flowKey = flowKeyFromFile(result.flowFile);
    const caseId = resolvedCaseIds[flowKey];

    const payload = {
      status: result.passed ? "passed" : "failed",
      time_ms: result.time_ms,
      comment: result.passed
        ? `✅ Automated test passed in ${(result.time_ms / 1000).toFixed(1)}s`
        : `❌ ${result.error || "Test failed"}`,
      stacktrace: result.error || undefined,
    };

    if (caseId) {
      payload.case_id = caseId;
    } else {
      payload.case = {
        title: result.name,
        suite_title: "E2E Automation",
      };
    }

    // Upload failure screenshots as attachments
    if (!result.passed && result.screenshots.length > 0) {
      const attachments = [];
      for (const ssPath of result.screenshots) {
        const hash = await uploadScreenshot(project, ssPath);
        if (hash) attachments.push(hash);
      }
      if (attachments.length > 0) payload.attachments = attachments;
    }

    const icon = result.passed ? "✅" : "❌";
    const idStr = caseId ? `case #${caseId}` : "auto-create";
    const ssStr = result.screenshots.length > 0 ? ` +${result.screenshots.length} screenshot(s)` : "";
    console.log(`  ${icon}  ${result.name} → ${result.passed ? "passed" : "FAILED"} (${idStr})${ssStr}`);

    await qase("POST", `/result/${project}/${runId}`, payload);
  }

  // 5. Complete the run
  console.log(`\n🏁 Completing run ${runId}...`);
  await qase("POST", `/run/${project}/${runId}/complete`);

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n✅ Done! ${passed}/${total} passed.`);
  console.log(`   View: https://app.qase.io/run/${project}/dashboard/${runId}\n`);
}

module.exports = { parseAllResults, flowKeyFromFile, buildCaseMapFromEnv };

if (require.main === module) {
  main().catch((err) => {
    console.error("\n❌ Fatal:", err.message);
    process.exit(1);
  });
}
