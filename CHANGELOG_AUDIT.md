# WildTrace — Audit Changelog

This document tracks all changes, defect fixes, tests, and documentation added during the full codebase audit on October 11, 2026.

---

## 1. Defect Fixes & Code Modifications

### `package.json`
- Replaced non-functional `"lint": "next lint"` with `"lint": "eslint src"`.
- Added test scripts:
  - `"test": "tsx tests/run-all-tests.ts"`
  - `"test:unit": "tsx tests/vision-engine.test.ts"`
  - `"test:api": "tsx tests/api-integration.test.ts"`
  - `"test:journey": "tsx tests/verify-journey.ts"`

### `eslint.config.mjs` (New File)
- Configured ESLint 9 flat configuration using `@typescript-eslint/parser` for TypeScript and JSX files.
- Configured appropriate ignores for `.next/`, `node_modules/`, `data/`, and test fixtures.

### `src/lib/storage/db.ts`
- Implemented `deleteSite(id: string): boolean`:
  - Removes site from database.
  - Cascades deletion to child observations, comparisons, and AI interpretations.
  - Synchronously unlinks physical image files from `data/uploads/` on disk.
  - Synchronizes deletion to Prisma SQLite (`prisma.site.delete`).
- Replaced `prisma.site.create` with `prisma.site.upsert` in `createSite` for idempotent background sync.

### `src/app/api/sites/[id]/route.ts`
- Added `DELETE` method handler:
  - Enforces demonstration site protection (returns HTTP 403 Forbidden for demo habitats).
  - Calls `deleteSite` and returns structured JSON response.

### `src/app/sites/[id]/page.tsx`
- Added `handleDeleteSite` action and `Trash2` "Delete Site" button for user-created (non-demo) habitats with confirmation dialog.

### `src/app/api/sites/route.ts`
- Added comprehensive server-side input validation:
  - Rejects empty and whitespace-only site names.
  - Limits name length to 100 characters.
  - Validates `habitatType` against allowed enums.
  - Validates latitude ([-90, 90]) and longitude ([-180, 180]).
  - Fuzzes coordinates to 2 decimal places before saving.

### `src/app/api/observations/route.ts`
- Added early site validation: verifies site existence before writing any image to disk, eliminating orphaned upload files.
- Added 10MB maximum file size limit (HTTP 413).
- Added MIME type validation (`image/jpeg`, `image/png`, `image/webp`).
- Wrapped Sharp processing with descriptive HTTP 400 error responses on corrupt/invalid image inputs.
- Added catch-block cleanup to unlink temporary files if database operations fail.
- Added input length bounds on `weatherNotes` (1000 chars) and `fieldNotes` (4000 chars).

### `src/app/api/uploads/[filename]/route.ts`
- Hardened file-serving endpoint against directory traversal:
  - Strictly confines path resolution to `UPLOADS_DIR`.
  - Rejects directory accesses (`.` and `..`) using `fs.statSync().isFile()`.
  - Added `X-Content-Type-Options: nosniff` header.

### `src/app/api/seed/route.ts`
- Added production environment guard: requires `Authorization: Bearer <ADMIN_SECRET>` or `ALLOW_SEED_RESET=true` when running in `NODE_ENV === 'production'`.

### `src/lib/vision/diffEngine.ts`
- Tuned Euclidean color distance threshold from 35 to 30 to detect subtle natural greening shifts.
- Enhanced `loadSharpBuffer` to support multiple SVG data URI encodings, public directory paths, and relative paths.

### `src/lib/ai/heuristicFallback.ts`
- Harmonized limitation flag checks: now inspects both `HIGH_ILLUMINATION_DISPARITY` and `PERSPECTIVE_SHIFT_DETECTED`, aligning with flags emitted by `diffEngine.ts`.

### `src/components/site/ObservationModal.tsx`
- Added explicit scientific framing advisory note under Ghost View controls.
- Added accessibility `aria-label` attributes to the Ghost View toggle and opacity slider.

---

## 2. New Test Suites & Fixtures

### `tests/fixtures/images/` (14 Synthetic Test Fixtures)
- Generated deterministic synthetic image dataset covering identity, greening, autumn senescence, brightness shifts, moisture darkening, translation drift, camera rotation, distance scale, partial occlusion, blur, unrelated scenes, 16:9 aspect ratios, and corrupted files.

### `tests/fixtures/images/README.md`
- Complete manifest recording fixture filenames, generation methods, test purposes, expected results, and provenance.

### `tests/fixtures/generate-fixtures.ts`
- Deterministic fixture generation script using Sharp.

### `tests/vision-engine.test.ts`
- 12 unit tests verifying mathematical invariance of ExG, Sobel edge correlation, and suitability thresholds.

### `tests/api-integration.test.ts`
- 22 integration tests verifying all API routes, error states, security guards, EXIF stripping, and cascading deletion.

### `tests/run-all-tests.ts`
- Master test runner executing all suites sequentially with structured summary reporting.

---

## 3. Documentation

- `tutorial.md` — Complete user manual, architectural map, and developer guide with tested commands.
- `AUDIT_REPORT.md` — Detailed executive summary, environment verification, security findings, and defect tracking.
- `TEST_PLAN.md` — Full test matrix with expected and actual outcomes.
- `CHANGELOG_AUDIT.md` — This changelog.
