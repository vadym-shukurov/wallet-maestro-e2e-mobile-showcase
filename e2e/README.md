E2E Test Suite — Test Automation Showcase
==========================================

Automated end-to-end smoke tests for the **E2E Test Automation Showcase** using
[Maestro](https://maestro.mobile.dev/), with optional test-result reporting to
[Qase](https://qase.io/). The app under test is a minimal stub (no real wallet
logic) built solely to exercise the automation framework.

Platform Scope
--------------

| Platform | Status   | Notes                                                                 |
|----------|----------|-----------------------------------------------------------------------|
| **iOS**  | Supported | Fully supported. CI runs on macOS with iPhone 16 Simulator.             |
| **Android** | Out of scope | Not supported in this showcase. Runner has a stub branch for future use. |

Test Case Catalogue
-------------------

### TC-001: Import Wallet — Happy Path

| Field             | Value                                                          |
|-------------------|----------------------------------------------------------------|
| **ID**            | TC-001                                                         |
| **Priority**      | Critical / P0                                                  |
| **Type**          | Smoke · Functional                                             |
| **Tags**          | `smoke`, `critical-path`, `wallet-import`                      |
| **Preconditions** | Fresh app install; valid 12-word BIP-39 mnemonic in `e2e/.env` |
| **Flow file**     | `e2e/flows/import-wallet.yaml`                                 |
| **Postcondition** | Import completes; wallet dashboard (`wallet-title`) visible   |

#### Steps

| \# | Screen           | Action                                                     | Assertion / Expected Result                                     |
|----|------------------|------------------------------------------------------------|-----------------------------------------------------------------|
| 1  | Onboarding       | App launches; Expo dev client connects to Metro            | Title, "Create Wallet", and "Import Wallet" buttons are visible |
| 2  | Onboarding       | Tap **Import Wallet** (`onboarding-download-button`)       | Navigates to Import Wallet screen                               |
| 3  | Import Wallet    | Screen loads                                               | Title, Paste button, and Submit button are visible              |
| 4  | Import Wallet    | Tap **Paste** (`import-paste-button`)                      | iOS clipboard dialog appears                                    |
| 5  | Import Wallet    | Tap **Allow Paste**                                        | 12 seed words populate the input fields; last word visible      |
| 6  | Import Wallet    | Tap **Import Wallet** (`import-wallet-submit-button`)      | Navigates to Name Your Wallet screen                            |
| 7  | Name Your Wallet | Screen loads                                               | Title and wallet name input are visible                         |
| 8  | Name Your Wallet | Type "Imported Wallet" into name input                     | Text appears in the input                                       |
| 9  | Name Your Wallet | Tap **Import Wallet** (`import-name-wallet-submit-button`) | Import begins; loading spinner appears                          |

### TC-002: Create Wallet — Seed Phrase Generation

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| **ID**            | TC-002                                                                |
| **Priority**      | Critical / P0                                                         |
| **Type**          | Smoke · Functional                                                    |
| **Tags**          | `smoke`, `critical-path`, `wallet-create`                             |
| **Preconditions** | Fresh app install (no wallet exists)                                  |
| **Flow file**     | `e2e/flows/create-wallet-seed-phrase.yaml`                            |
| **Postcondition** | Seed phrase screen displays 12 generated words with Copy/Hide actions |

#### Steps

| \# | Screen             | Action                                             | Assertion / Expected Result                                      |
|----|--------------------|----------------------------------------------------|------------------------------------------------------------------|
| 1  | Onboarding         | App launches; Expo dev client connects to Metro    | Title and "Create Wallet" button are visible                     |
| 2  | Onboarding         | Tap **Create Wallet** (`onboarding-wallet-button`) | Navigates to Name Your Wallet screen                             |
| 3  | Name Your Wallet   | Screen loads                                       | Title, wallet name input, and Next button are visible            |
| 4  | Name Your Wallet   | Type "Test Wallet" into name input                 | Text appears in the input                                        |
| 5  | Name Your Wallet   | Tap **Next** (`name-wallet-next-button`)           | Navigates to Secure Your Wallet screen                           |
| 6  | Secure Your Wallet | Wait for seed generation                           | First seed word appears (`seed-word-value-0`)                    |
| 7  | Secure Your Wallet | Verify seed phrase grid                            | Words at positions 1–3 are visible                               |
| 8  | Secure Your Wallet | Verify action buttons                              | "Copy Phrase" and "Hide Phrase" buttons are visible              |
| 9  | Secure Your Wallet | Verify Next button                                 | Next button (`secure-wallet-next-button`) is visible and enabled |

### TC-003: Onboarding — Navigation Smoke

| Field             | Value                                             |
|-------------------|---------------------------------------------------|
| **ID**            | TC-003                                            |
| **Priority**      | High / P1                                         |
| **Type**          | Smoke · Navigation                                |
| **Tags**          | `smoke`, `navigation`, `onboarding`               |
| **Preconditions** | Fresh app install (no wallet exists)              |
| **Flow file**     | `e2e/flows/onboarding-navigation.yaml`            |
| **Postcondition** | Onboarding screen is intact after two round-trips |

#### Steps

| \# | Screen           | Action                                               | Assertion / Expected Result                                    |
|----|------------------|------------------------------------------------------|----------------------------------------------------------------|
| 1  | Onboarding       | App launches; Expo dev client connects to Metro      | Title, subtitle, both CTA buttons are visible                  |
| 2  | Onboarding       | Tap **Import Wallet** (`onboarding-download-button`) | Navigates to Import Wallet screen                              |
| 3  | Import Wallet    | Verify screen elements                               | Title, Paste button, Submit button are visible                 |
| 4  | Import Wallet    | Tap **Back**                                         | Navigates back to Onboarding                                   |
| 5  | Onboarding       | Verify return                                        | Onboarding title is visible                                    |
| 6  | Onboarding       | Tap **Create Wallet** (`onboarding-wallet-button`)   | Navigates to Name Your Wallet screen                           |
| 7  | Name Your Wallet | Verify screen elements                               | Title, name input, Next button are visible                     |
| 8  | Name Your Wallet | Tap **Back**                                         | Navigates back to Onboarding                                   |
| 9  | Onboarding       | Verify return                                        | Onboarding title is visible                                    |
| 10 | Onboarding       | Final assertion                                      | Both "Create Wallet" and "Import Wallet" buttons still visible |

### TC-004: Seed Phrase — Hide/Show Toggle

| Field             | Value                                                       |
|-------------------|-------------------------------------------------------------|
| **ID**            | TC-004                                                      |
| **Priority**      | Medium / P2                                                 |
| **Type**          | Smoke · Functional                                          |
| **Tags**          | `smoke`, `functional`, `seed-phrase`                        |
| **Preconditions** | Fresh app install (no wallet exists)                        |
| **Flow file**     | `e2e/flows/seed-phrase-visibility.yaml`                     |
| **Postcondition** | Seed words can be hidden and re-shown via the toggle button |

#### Steps

| \# | Screen             | Action                                           | Assertion / Expected Result                                                    |
|----|--------------------|--------------------------------------------------|--------------------------------------------------------------------------------|
| 1  | Onboarding → Name  | Navigate through onboarding and name the wallet  | Secure Your Wallet screen loads; seed generation completes                     |
| 2  | Secure Your Wallet | Verify initial state                             | "Hide Phrase" visible; seed words at index 0, 5 visible; "Copy Phrase" visible |
| 3  | Secure Your Wallet | Tap **Hide Phrase** (`toggle-visibility-button`) | Button label changes to "Show Phrase"; "Hide Phrase" disappears                |
| 4  | Secure Your Wallet | Tap **Show Phrase** (`toggle-visibility-button`) | Button label changes back to "Hide Phrase"; "Show Phrase" disappears           |
| 5  | Secure Your Wallet | Verify unmasked state                            | Seed word at index 0 is visible again                                          |

>   **Note:** The seed-word elements remain in the view tree when masked (their
>   content changes to dots rather than being removed), so the toggle is
>   verified via button-label transitions, not element-removal assertions.

### TC-005: Create Wallet — Navigate to Confirm Phrase

| Field             | Value                                                            |
|-------------------|------------------------------------------------------------------|
| **ID**            | TC-005                                                           |
| **Priority**      | Critical / P0                                                    |
| **Type**          | Smoke · Critical Path                                            |
| **Tags**          | `smoke`, `critical-path`, `wallet-create`                        |
| **Preconditions** | Fresh app install (no wallet exists)                             |
| **Flow file**     | `e2e/flows/create-wallet-confirm-phrase.yaml`                    |
| **Postcondition** | Confirm Phrase screen loads with all 4 word-verification prompts |

#### Steps

| \# | Screen             | Action                                          | Assertion / Expected Result                                        |
|----|--------------------|-------------------------------------------------|--------------------------------------------------------------------|
| 1  | Onboarding → Name  | Navigate through onboarding and name the wallet | Secure Your Wallet screen loads with generated seed words          |
| 2  | Secure Your Wallet | Tap **Next** (`secure-wallet-next-button`)      | Navigates to Confirm Your Secret Phrase screen                     |
| 3  | Confirm Phrase     | Screen loads                                    | Title (`confirm-phrase-title`) is visible                          |
| 4  | Confirm Phrase     | Verify word prompts                             | "Word \#3", "Word \#5", "Word \#7", "Word \#12" labels are visible |

>   **Note:** The confirm-phrase screen uses randomized word options
>   (`Math.random()`), so deterministic automation of the word-matching step is
>   not possible without app-side test hooks. This test verifies navigation and
>   screen rendering only.

### TC-006: Import Wallet — Back Navigation Preserves State

| Field             | Value                                                          |
|-------------------|----------------------------------------------------------------|
| **ID**            | TC-006                                                         |
| **Priority**      | Medium / P2                                                    |
| **Type**          | Smoke · Navigation                                             |
| **Tags**          | `smoke`, `navigation`, `wallet-import`                         |
| **Preconditions** | Fresh app install; valid 12-word BIP-39 mnemonic in `e2e/.env` |
| **Flow file**     | `e2e/flows/import-wallet-back-navigation.yaml`                 |
| **Postcondition** | Seed phrase input state is preserved after navigating back     |

#### Steps

| \# | Screen           | Action                          | Assertion / Expected Result                      |
|----|------------------|---------------------------------|--------------------------------------------------|
| 1  | Onboarding       | App launches; tap Import Wallet | Import Wallet screen loads                       |
| 2  | Import Wallet    | Paste seed phrase and submit    | Name Your Wallet screen loads                    |
| 3  | Name Your Wallet | Tap **Back**                    | Returns to Import Wallet screen                  |
| 4  | Import Wallet    | Verify state preserved          | Last seed word is still visible in the inputs    |
| 5  | Import Wallet    | Tap **Import Wallet** again     | Name Your Wallet screen loads (form still valid) |
| 6  | Name Your Wallet | Verify screen                   | Wallet name input is visible                     |

### TC-007: Import Wallet — Invalid Seed Phrase Rejected

| Field             | Value                                             |
|-------------------|---------------------------------------------------|
| **ID**            | TC-007                                            |
| **Priority**      | High / P1                                         |
| **Type**          | Negative · Validation                             |
| **Tags**          | `smoke`, `negative`, `wallet-import`              |
| **Preconditions** | Fresh app install (no wallet exists)              |
| **Flow file**     | `e2e/flows/import-wallet-invalid-phrase.yaml`     |
| **Postcondition** | User stays on Import screen; no navigation occurs |

#### Steps

| \# | Screen        | Action                                                | Assertion / Expected Result                        |
|----|---------------|-------------------------------------------------------|----------------------------------------------------|
| 1  | Onboarding    | App launches; tap Import Wallet                       | Import Wallet screen loads                         |
| 2  | Import Wallet | Type "ab" into all 12 word fields (\< 3 chars each)   | All fields populated                               |
| 3  | Import Wallet | Tap **Import Wallet** (`import-wallet-submit-button`) | Alert: "Invalid Seed Phrase" appears               |
| 4  | Alert Dialog  | Verify error message                                  | Full validation message visible                    |
| 5  | Alert Dialog  | Tap **OK**                                            | Alert dismissed                                    |
| 6  | Import Wallet | Verify no navigation occurred                         | Import Wallet title and Paste button still visible |

### TC-008: Create Wallet — Empty Name Blocked

| Field             | Value                                                        |
|-------------------|--------------------------------------------------------------|
| **ID**            | TC-008                                                       |
| **Priority**      | Medium / P2                                                  |
| **Type**          | Negative · Validation                                        |
| **Tags**          | `smoke`, `negative`, `wallet-create`                         |
| **Preconditions** | Fresh app install (no wallet exists)                         |
| **Flow file**     | `e2e/flows/create-wallet-empty-name.yaml`                    |
| **Postcondition** | Next button stays disabled; no navigation when name is empty |

#### Steps

| \# | Screen             | Action                            | Assertion / Expected Result                   |
|----|--------------------|-----------------------------------|-----------------------------------------------|
| 1  | Onboarding         | App launches; tap Create Wallet   | Name Your Wallet screen loads                 |
| 2  | Name Your Wallet   | Verify default state              | Wallet name input and Next button are visible |
| 3  | Name Your Wallet   | Tap **Next** with empty name      | Nothing happens (button is disabled)          |
| 4  | Name Your Wallet   | Verify no navigation              | Still on Name Your Wallet screen              |
| 5  | Name Your Wallet   | Type "My Wallet" and tap **Next** | Navigates to Secure Your Wallet screen        |
| 6  | Secure Your Wallet | Tap **Back**                      | Returns to Name Your Wallet; name preserved   |

### TC-009: Import Wallet — Incomplete Phrase Rejected

| Field             | Value                                                 |
|-------------------|-------------------------------------------------------|
| **ID**            | TC-009                                                |
| **Priority**      | High / P1                                             |
| **Type**          | Negative · Validation                                 |
| **Tags**          | `smoke`, `negative`, `wallet-import`                  |
| **Preconditions** | Fresh app install (no wallet exists)                  |
| **Flow file**     | `e2e/flows/import-wallet-incomplete-phrase.yaml`      |
| **Postcondition** | User stays on Import screen; "Incomplete" alert shown |

#### Steps

| \# | Screen        | Action                                                | Assertion / Expected Result                                 |
|----|---------------|-------------------------------------------------------|-------------------------------------------------------------|
| 1  | Onboarding    | App launches; tap Import Wallet                       | Import Wallet screen loads                                  |
| 2  | Import Wallet | Type valid words into only 3 of 12 fields             | 3 fields populated, 9 empty                                 |
| 3  | Import Wallet | Tap **Import Wallet** (`import-wallet-submit-button`) | Alert: "Incomplete" appears                                 |
| 4  | Alert Dialog  | Verify error message                                  | "Please fill in all 12 words of your secret phrase" visible |
| 5  | Alert Dialog  | Tap **OK**                                            | Alert dismissed                                             |
| 6  | Import Wallet | Verify no navigation occurred                         | Import Wallet title and Paste button still visible          |
| 7  | Import Wallet | Verify data preserved                                 | Previously typed word "apple" still visible                 |

Project Structure
-----------------

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
e2e/
├── flows/
│   ├── setup/
│   │   └── expo-connect.yaml                  # Shared sub-flow: Expo dev client connection
│   ├── create-wallet-confirm-phrase.yaml       # TC-005
│   ├── create-wallet-empty-name.yaml           # TC-008  (negative)
│   ├── create-wallet-seed-phrase.yaml          # TC-002
│   ├── import-wallet.yaml                      # TC-001
│   ├── import-wallet-back-navigation.yaml      # TC-006
│   ├── import-wallet-incomplete-phrase.yaml     # TC-009  (negative)
│   ├── import-wallet-invalid-phrase.yaml        # TC-007  (negative)
│   ├── onboarding-navigation.yaml              # TC-003
│   └── seed-phrase-visibility.yaml             # TC-004
├── scripts/
│   ├── run-e2e.sh                              # Orchestrator (fresh install per test)
│   └── report-to-qase.js                      # Qase API v1 reporter (find-or-create + retry)
├── results/                                    # JUnit XML output (gitignored)
├── .env.example                                # Template for secrets
├── .env                                        # Actual secrets (gitignored)
└── README.md
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

>   **Note:** The Maestro suite in `e2e/` is the canonical E2E automation.

Prerequisites
-------------

| Dependency       | Install command                                     | Notes                             |
|------------------|-----------------------------------------------------|-----------------------------------|
| Maestro CLI      | `curl -Ls "https://get.maestro.mobile.dev" \| bash` | v1.38+ recommended                |
| Java 21+         | `brew install openjdk@21`                           | Required by Maestro               |
| iOS Simulator    | Xcode → Window → Devices & Simulators               | Or Android Emulator via `adb`     |
| App on simulator | `npx expo run:ios` / `npx expo run:android`         | Dev build must be installed first |
| `e2e/.env`       | `cp e2e/.env.example e2e/.env` then fill in values  | Holds seed phrase & Qase tokens   |

Environment Variables
---------------------

| Variable          | Required | Stored in  | Purpose                                           |
|-------------------|----------|------------|---------------------------------------------------|
| `E2E_SEED_PHRASE` | **Yes**  | `e2e/.env` | 12-word BIP-39 mnemonic for the import flow       |
| `E2E_FLOWS`       | No       | `e2e/.env` | Comma-separated flow names (e.g. `import-wallet`) |
| `E2E_TAGS`        | No       | `e2e/.env` | Comma-separated tags (e.g. `smoke` for smoke-only)|
| `E2E_RETRY_FAILED`| No       | `e2e/.env` | `1` = retry failed flows once (default), `0` = no retry |
| `QASE_API_TOKEN`  | No       | `e2e/.env` | API token from https://app.qase.io/user/api/token |
| `QASE_PROJECT`    | No       | `e2e/.env` | Qase project code (e.g. `RNS`)                    |
| `QASE_RUN_TITLE`  | No       | `e2e/.env` | Custom title for the Qase test run                |
| `QASE_CASE_MAP`   | No       | `e2e/.env` | JSON override: `{"import-wallet":1}`              |

>   The runner script (`run-e2e.sh`) automatically sources `e2e/.env`, extracts
>   the last word of the phrase for in-flow verification, and loads the full
>   phrase into the simulator clipboard. No secrets ever appear in tracked
>   files.

Running the Tests
-----------------

### Quick start (all flows)

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ bash
npm run e2e
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

### Run specific flows or by tag

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ bash
# Run only onboarding and import (via env)
E2E_FLOWS=onboarding-navigation,import-wallet npm run e2e

# Run only smoke-tagged flows
E2E_TAGS=smoke npm run e2e

# Run a single flow directly (clipboard/LAST_SEED_WORD not auto-set)
maestro test e2e/flows/onboarding-navigation.yaml
maestro test e2e/flows/import-wallet.yaml
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

>   When running `import-wallet.yaml` directly, you must set the clipboard and
>   `LAST_SEED_WORD` env var manually — the runner script handles this
>   automatically.

### With Qase reporting

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ bash
# Option A — inline
QASE_API_TOKEN=<token> QASE_PROJECT=RNS npm run e2e

# Option B — values in e2e/.env (recommended)
npm run e2e
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

### Run only the Qase reporter (after a prior test run)

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ bash
QASE_API_TOKEN=<token> QASE_PROJECT=RNS npm run e2e:report
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

How It Works
------------

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
npm run e2e
      │
      ▼
  run-e2e.sh
      │
      ├─ Source e2e/.env (secrets)
      ├─ Pre-flight checks (Maestro CLI, E2E_SEED_PHRASE)
      ├─ Detect platform (iOS / Android / auto)
      ├─ Locate pre-built .app binary in DerivedData
      │
      ├─ For each flow in e2e/flows/*.yaml:
      │     ├─ Fresh install (uninstall → reinstall app binary)
      │     ├─ Copy seed phrase to simulator clipboard
      │     └─ maestro test --format junit <flow>
      │           └── runFlow: setup/expo-connect.yaml (shared sub-flow)
      │
      └─ (if QASE_* vars set) → report-to-qase.js
            ├─ Parse individual JUnit XMLs
            ├─ Find or create Qase cases by title
            ├─ POST /run/{project}
            ├─ POST /result/{project}/{runId}  (× N cases, with screenshots)
            └─ POST /run/{project}/{runId}/complete
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Each test starts with a **full app uninstall + reinstall** (via `xcrun simctl`
on iOS) to guarantee complete state isolation. Flows run **sequentially** by
design — a single simulator, fresh install per flow, and no resource contention.
The Expo dev-client connection sequence is handled by a shared sub-flow
(`setup/expo-connect.yaml`) included via `runFlow` in every test.

Timeout Strategy
----------------

Every `extendedWaitUntil` in the flows has an inline comment explaining its
purpose. The timeouts fall into four tiers:

| Timeout | Category                        | Examples                                                 |
|---------|---------------------------------|----------------------------------------------------------|
| 45 s    | Cold-start                      | `onboarding-title` — first screen after Metro bundles JS |
| 30 s    | Expo dev-client                 | "Continue" dialog on first launch                        |
| 10–15 s | Screen transition / async work  | Navigation, mock seed generation                        |
| 5 s     | Dialogs / UI micro-interactions | Clipboard permission, toggle animation, alerts           |

These values include a safety margin for CI runners where the simulator may be
slower. On a local M-series Mac, most transitions complete in under 3 s.

`testID` Reference
------------------

Every selector used in flows is backed by a deterministic `testID` prop. No
coordinate-based or text-only selectors are used for core actions.

| `testID`                           | Screen               | Element                   |
|------------------------------------|----------------------|---------------------------|
| `onboarding-title`                 | Onboarding           | Title text                |
| `onboarding-subtitle`              | Onboarding           | Subtitle text             |
| `onboarding-wallet-button`         | Onboarding           | "Create Wallet" button    |
| `onboarding-download-button`       | Onboarding           | "Import Wallet" button    |
| `name-wallet-title`                | Name Your Wallet     | Screen title              |
| `wallet-name-input`                | Name Your Wallet     | Wallet name text input    |
| `name-wallet-next-button`          | Name Your Wallet     | "Next" button             |
| `secure-wallet-title`              | Secure Your Wallet   | Screen title              |
| `secure-wallet-next-button`        | Secure Your Wallet   | "Next" button             |
| `toggle-visibility-button`         | Secure Your Wallet   | "Hide/Show Phrase" toggle |
| `seed-word-value-{0..11}`          | SeedPhrase (read)    | Displayed seed words      |
| `seed-word-input-{0..11}`          | SeedPhrase (edit)    | Individual word inputs    |
| `confirm-phrase-title`             | Confirm Phrase       | Screen title              |
| `confirm-phrase-word-{3,5,7,12}`   | Confirm Phrase       | Word verification rows    |
| `import-wallet-title`              | Import Wallet        | Screen title              |
| `import-paste-button`              | Import Wallet        | "Paste" action button     |
| `import-wallet-submit-button`      | Import Wallet        | "Import Wallet" CTA       |
| `import-name-wallet-title`         | Name Imported Wallet | Screen title              |
| `import-wallet-name-input`         | Name Imported Wallet | Wallet name text input    |
| `import-name-wallet-submit-button` | Name Imported Wallet | "Import Wallet" CTA       |
| `import-wallet-loading`            | Name Imported Wallet | Loading spinner container |
| `wallet-title`                     | Wallet (post-import)  | Dashboard title           |

Known Limitations
-----------------

1.  **TC-001** asserts the full import flow through to the wallet dashboard
    (`wallet-title`).

2.  **TC-005 cannot complete the confirm-phrase screen.** The flow verifies
    navigation and that all 4 word prompts are visible (by testID). Completing
    the word-selection step would require a test-mode hook or seeded random.

3.  **iOS only.** Android is out of scope for this showcase (see Platform Scope).

4.  **Expo dev-client dependency.** All tests navigate through the Expo
    development launcher on fresh install. This overhead (\~15–30s per test)
    would be eliminated in a production/release build.

5.  **TC-005 uses testIDs for word rows.** The flow asserts by
    `confirm-phrase-word-{3,5,7,12}`. If positions change in the app, update
    both the component testIDs and the flow.

Extending the Suite
-------------------

1.  Create a new `.yaml` file in `e2e/flows/` — the runner auto-discovers all
    flows in that directory.

2.  Start each flow with `launchApp` + `runFlow: setup/expo-connect.yaml` for
    Expo dev-client setup.

3.  Add any needed `testID` props to the app source.

4.  Add the flow filename to `FLOW_FILE_TO_KEY` in `report-to-qase.js`.

5.  Document the case in this README.

6.  (Optional) Map the flow key to a Qase case ID via `QASE_CASE_MAP`.

CI/CD Integration
-----------------

The suite can run on any macOS CI runner with Xcode and a booted iOS Simulator:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ yaml
# Example GitHub Actions step
- name: Run E2E tests
  env:
    E2E_SEED_PHRASE: ${{ secrets.E2E_SEED_PHRASE }}
    QASE_API_TOKEN: ${{ secrets.QASE_API_TOKEN }}
    QASE_PROJECT: RNS
  run: |
    xcrun simctl boot "iPhone 16"
    npx expo run:ios --no-install
    npm run e2e
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

>   Use a dedicated test wallet with zero real funds for CI. The seed phrase is
>   copied to the simulator clipboard during execution — on shared CI runners,
>   other processes could theoretically read it.

**Artifact sensitivity:** The `e2e-results` artifact (JUnit XML + failure
screenshots) may contain sensitive UI if a test fails on a screen showing seed
words or other confidential data. Treat artifacts as internal; restrict access
and retention (default 7 days).
