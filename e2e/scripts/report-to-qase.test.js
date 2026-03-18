/**
 * Unit tests for report-to-qase.js
 * Run: node --test e2e/scripts/report-to-qase.test.js
 */

const { describe, it, afterEach } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const os = require("os");

const { parseAllResults, flowKeyFromFile, buildCaseMapFromEnv } = require("./report-to-qase.js");

describe("flowKeyFromFile", () => {
  it("maps known flow files to stable keys", () => {
    assert.strictEqual(flowKeyFromFile("import-wallet"), "import-wallet");
    assert.strictEqual(flowKeyFromFile("import-wallet-back-navigation"), "import-wallet-back");
    assert.strictEqual(flowKeyFromFile("create-wallet-seed-phrase"), "create-wallet");
    assert.strictEqual(flowKeyFromFile("create-wallet-confirm-phrase"), "create-wallet-confirm");
    assert.strictEqual(flowKeyFromFile("onboarding-navigation"), "onboarding-navigation");
    assert.strictEqual(flowKeyFromFile("import-wallet-incomplete-phrase"), "import-wallet-incomplete");
  });

  it("returns filename as-is for unknown flows", () => {
    assert.strictEqual(flowKeyFromFile("custom-flow"), "custom-flow");
    assert.strictEqual(flowKeyFromFile("new-test-123"), "new-test-123");
  });
});

describe("buildCaseMapFromEnv", () => {
  const origEnv = process.env.QASE_CASE_MAP;

  afterEach(() => {
    if (origEnv !== undefined) process.env.QASE_CASE_MAP = origEnv;
    else delete process.env.QASE_CASE_MAP;
  });

  it("returns empty object when QASE_CASE_MAP is not set", () => {
    delete process.env.QASE_CASE_MAP;
    assert.deepStrictEqual(buildCaseMapFromEnv(), {});
  });

  it("parses valid JSON from QASE_CASE_MAP", () => {
    process.env.QASE_CASE_MAP = '{"import-wallet":1,"create-wallet":2}';
    assert.deepStrictEqual(buildCaseMapFromEnv(), { "import-wallet": 1, "create-wallet": 2 });
  });

  it("returns empty object for invalid JSON (fallback)", () => {
    process.env.QASE_CASE_MAP = "not valid json {";
    assert.deepStrictEqual(buildCaseMapFromEnv(), {});
  });
});

describe("parseAllResults", () => {
  it("returns empty array when results dir does not exist", () => {
    const dir = path.join(os.tmpdir(), `qase-test-nonexistent-${Date.now()}`);
    assert.deepStrictEqual(parseAllResults(dir), []);
  });

  it("returns empty array when results dir has no XML files", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qase-test-empty-"));
    try {
      fs.writeFileSync(path.join(dir, "readme.txt"), "no xml");
      assert.deepStrictEqual(parseAllResults(dir), []);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("parses passed test from JUnit XML", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qase-test-pass-"));
    try {
      const xml = `<?xml version="1.0"?>
<testsuites>
  <testsuite>
    <testcase name="Import Wallet — Happy Path" time="12.5"/>
  </testsuite>
</testsuites>`;
      fs.writeFileSync(path.join(dir, "import-wallet.xml"), xml);
      const results = parseAllResults(dir);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].name, "Import Wallet — Happy Path");
      assert.strictEqual(results[0].flowFile, "import-wallet");
      assert.strictEqual(results[0].passed, true);
      assert.strictEqual(results[0].time_ms, 12500);
      assert.strictEqual(results[0].error, null);
      assert.deepStrictEqual(results[0].screenshots, []);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("parses failed test with failure message from JUnit XML", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qase-test-fail-"));
    try {
      const xml = `<?xml version="1.0"?>
<testsuites>
  <testsuite>
    <testcase name="Create Wallet" time="3.2">
      <failure message="Element not found">AssertionError: element onboarding-title not visible</failure>
    </testcase>
  </testsuite>
</testsuites>`;
      fs.writeFileSync(path.join(dir, "create-wallet-seed-phrase.xml"), xml);
      const results = parseAllResults(dir);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].passed, false);
      assert.ok(results[0].error, "error should be set for failed test");
      assert.ok(
        results[0].error.includes("Element not found") || results[0].error.includes("onboarding-title"),
        "error should contain failure message or assertion text"
      );
      assert.strictEqual(results[0].time_ms, 3200);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("extracts screenshot paths from failure content", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qase-test-ss-"));
    const screenshotPath = path.join(dir, "screenshot-1.png");
    try {
      fs.writeFileSync(screenshotPath, "fake png");
      const xml = `<?xml version="1.0"?>
<testsuites>
  <testsuite>
    <testcase name="Test" time="1.0">
      <failure>[[ATTACHMENT|${screenshotPath}]]</failure>
    </testcase>
  </testsuite>
</testsuites>`;
      fs.writeFileSync(path.join(dir, "flow.xml"), xml);
      const results = parseAllResults(dir);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].screenshots.length, 1);
      assert.strictEqual(results[0].screenshots[0], screenshotPath);
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("parses multiple XML files", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qase-test-multi-"));
    try {
      fs.writeFileSync(
        path.join(dir, "a.xml"),
        '<testsuites><testsuite><testcase name="A" time="1"/></testsuite></testsuites>'
      );
      fs.writeFileSync(
        path.join(dir, "b.xml"),
        '<testsuites><testsuite><testcase name="B" time="2"/></testsuite></testsuites>'
      );
      const results = parseAllResults(dir);
      assert.strictEqual(results.length, 2);
      assert.strictEqual(results[0].name, "A");
      assert.strictEqual(results[0].flowFile, "a");
      assert.strictEqual(results[1].name, "B");
      assert.strictEqual(results[1].flowFile, "b");
    } finally {
      fs.rmSync(dir, { recursive: true });
    }
  });
});
