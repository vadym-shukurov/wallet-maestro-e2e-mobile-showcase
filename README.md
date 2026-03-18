# E2E Test Automation Showcase

A **test automation showcase** demonstrating Maestro E2E flows with Qase reporting. The app is a minimal stub — no real wallet logic — built solely to exercise the automation framework.

---

## What This Is

| Component | Description |
|-----------|-------------|
| **App** | Minimal Expo/React Native stub with screens and `testID`s for Maestro flows. No crypto, no WDK, no real wallet logic. |
| **Tests** | 9 Maestro YAML flows covering onboarding, create wallet, import wallet, validation, and navigation. |
| **Reporting** | JUnit output + Qase API integration (find-or-create cases, retry, screenshots). |
| **Runner** | `run-e2e.sh` — fresh install per test, clipboard seeding, platform detection. |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build the dev client (one-time)
npx expo run:ios

# 3. Configure secrets
cp e2e/.env.example e2e/.env
# Edit e2e/.env: set E2E_SEED_PHRASE (12 words), optionally QASE_API_TOKEN & QASE_PROJECT

# 4. Run tests (two terminals)
# Terminal 1:
npx expo start --dev-client

# Terminal 2:
npm run e2e
```

See **[e2e/README.md](e2e/README.md)** for full setup, troubleshooting, and Qase configuration.

---

## Project Structure

```
├── e2e/                    # Test automation (the showcase)
│   ├── flows/              # Maestro YAML flows (9 test cases)
│   │   ├── setup/          # Shared sub-flow (Expo dev client)
│   │   └── *.yaml          # TC-001 … TC-009
│   ├── scripts/
│   │   ├── run-e2e.sh         # Orchestrator
│   │   ├── report-to-qase.js  # Qase reporter
│   │   └── report-to-qase.test.js
│   ├── .env.example
│   └── README.md            # Test case catalogue + run instructions
├── src/                     # Minimal stub app (testIDs only)
│   ├── app/                 # Expo Router screens
│   ├── components/         # SeedPhrase, etc.
│   └── constants/
├── assets/                  # App icons, splash
├── app.json
└── package.json
```

---

## Test Cases (9 total)

| ID | Name | Type |
|----|------|------|
| TC-001 | Import Wallet — Happy Path | Smoke |
| TC-002 | Create Wallet — Seed Phrase Generation | Smoke |
| TC-003 | Onboarding — Navigation Smoke | Smoke |
| TC-004 | Seed Phrase — Hide/Show Toggle | Functional |
| TC-005 | Create Wallet — Navigate to Confirm Phrase | Critical |
| TC-006 | Import Wallet — Back Navigation Preserves State | Navigation |
| TC-007 | Import Wallet — Invalid Seed Phrase Rejected | Negative |
| TC-008 | Create Wallet — Empty Name Blocked | Negative |
| TC-009 | Import Wallet — Incomplete Phrase Rejected | Negative |

---

## Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run unit tests (report-to-qase.js) |
| `npm run e2e` | Run all Maestro flows + Qase report |
| `E2E_FLOWS=a,b E2E_TAGS=smoke npm run e2e` | Run subset by flow name or tag |
| `npm run e2e:report` | Re-run only Qase reporter (after tests) |
| `npx expo start --dev-client` | Start Metro for E2E |
| `npx expo run:ios` | Build iOS dev client |

---

## License

Apache License 2.0. See [LICENSE](LICENSE).

This project is a derivative of [tetherto/wdk-starter-react-native](https://github.com/tetherto/wdk-starter-react-native). Original copyright notices are retained per Apache 2.0.
