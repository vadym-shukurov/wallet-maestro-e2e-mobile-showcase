# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-02-24

### Security

- **Command injection**: E2E_FLOWS and E2E_TAGS sanitized (alphanumeric, hyphen, underscore, comma, space only); use IFS read instead of command substitution for tags
- **Shell injection (Android)**: Seed phrase passed via temp file + sed escape for adb; no longer interpolated in shell
- **Seed phrase in URL params**: Import flow now uses WalletSetupContext; phrase kept in memory, cleared after import
- **CI artifact sensitivity**: Documented in README; failure screenshots may contain sensitive UI
- **Secret scanning**: Gitleaks added to CI; .gitleaks.toml allowlists BIP-39 test vector

---

## [1.0.2] - 2025-02-24

### Added

- **Flake retry**: Failed flows retry once (configurable via `E2E_RETRY_FAILED=0` to disable)
- **Selective runs**: `E2E_FLOWS` (comma-separated) and `E2E_TAGS` for smoke-only or subset runs
- **TC-001 full coverage**: Import flow now asserts post-import wallet dashboard (`wallet-title`)

### Fixed

- TC-001 no longer stops at spinner; asserts full flow completion

---

## [1.0.1] - 2025-02-24

### Fixed

- **Expo setup selector**: App name now derived from `app.json` via `E2E_EXPO_APP_NAME` — no more brittle hardcoded text + index
- **TC-005 coupling**: Confirm phrase flow asserts by `testID` (`confirm-phrase-word-{3,5,7,12}`) instead of label text
- **CI artifacts**: JUnit XML and screenshots uploaded as `e2e-results` artifact (7-day retention)
- **Platform scope**: Android explicitly documented as out of scope
- **Sequential execution**: Documented as intentional (state isolation, single simulator)

---

## [1.0.0] - 2025-02-24

### Added

- Maestro E2E test suite with 9 flows (onboarding, create/import wallet, validation)
- Qase API v1 reporter for test-result tracking
- GitHub Actions CI workflow for E2E on macOS (iOS Simulator)
- Unit tests for `report-to-qase.js` (parseAllResults, flowKeyFromFile, buildCaseMapFromEnv)
- Platform scope documentation (iOS primary, Android experimental)
- `e2e/README.md` with test case catalogue, prerequisites, and troubleshooting

### Fixed

- README links updated (`e2e/README.txt` → `e2e/README.md`)
- Qase complete endpoint corrected (POST instead of PATCH)

### Security

- `.gitignore` and `e2e/.env.example` updated so secrets stay out of source control
