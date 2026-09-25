# Ituze QR Ltd - Property Enhancement & AI Description Generator - Implementation Plan

## Task 1: Create DB migrations for properties new columns + units.size_sqm
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Create migration `2026_09_24_XXXXXX_add_structural_and_amenity_columns_to_properties_table.php` adding nullable `total_units` (unsignedInteger), `total_floors` (unsignedInteger), `amenities` (json), `proximity` (json) to `properties`.
  - Create migration `2026_09_24_XXXXXX_add_size_sqm_to_units_table.php` adding nullable `size_sqm` (decimal 8,2) to `units`.
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `rule` TR-1.1: `php artisan migrate` runs without errors on a fresh or existing DB; `DESCRIBE properties` and `DESCRIBE units` reflect the new columns. Evidence: Artisan output + MySQL describe query captured.
- **Notes**: Use `->nullable()` everywhere per NFR-1 so existing rows keep working.

## Task 2: Update Property + Unit models (fillable + casts)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - `Property.php` `$fillable` add `total_units`, `total_floors`, `amenities`, `proximity`; `$casts` add `amenities => 'array'`, `proximity => 'array'`, `total_units => 'integer'`, `total_floors => 'integer'`.
  - `Unit.php` `$fillable` add `size_sqm`; `$casts` add `size_sqm => 'decimal:2'`.
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `rule` TR-2.1: Code inspection of both models confirms new fields in `$fillable` and appropriate casts. Evidence: Read of [Property.php](file:///c:/xampp/htdocs/ituze-qraltd/app/Models/Property.php) and [Unit.php](file:///c:/xampp/htdocs/ituze-qraltd/app/Models/Unit.php).

## Task 3: Update PropertyController validation + persistence
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - In `store()` and `update()` validation: add `total_units` => `nullable|integer|min:0`, `total_floors` => `nullable|integer|min:1` (min 1 = ground floor), `amenities` => `nullable|array`, `amenities.*` => `boolean`, `proximity` => `nullable|array`, `proximity.*` => `boolean`.
  - Custom error messages for the new fields (project convention of friendly ❌/📍 prefixed where appropriate).
  - `Property::create([...])` and `$property->update([...])` include the four new fields.
  - Preserve try/catch with logging per project convention.
- **Acceptance Criteria Addressed**: AC-4, AC-12
- **Test Requirements**:
  - `rule` TR-3.1: Valid payload saves the 4 new fields; `total_floors=0` triggers validation error. Evidence: Form submit + DB SELECT snapshot.
  - `rule` TR-3.2: Exception injected via a bad write (e.g., manually trigger during debugging or use a wrong DB field to simulate) produces a `laravel.log` entry and redirect back with flash error + old input. Evidence: Log tail + browser InlineAlert render.

## Task 4: Update UnitController validation + persistence
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Add validation `size_sqm` => `nullable|numeric|min:0` in `store()` and `update()`.
  - Include `size_sqm` in create/update arrays.
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-4.1: `size_sqm=75.5` saves as `75.50`; `size_sqm=-5` returns 422 with error. Evidence: POST + SELECT result.

## Task 5: Add AI description generator backend endpoint + service
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 (parallelizable with 2-4)
- **Description**:
  - Create `App\Services\PropertyDescriptionGenerator` with `generate(array $inputs): string` method.
    - Step 1: Check for LLM config (OpenAI key via `config('services.openai.api_key')` / env `OPENAI_API_KEY`).
    - Step 2: If available, use `Illuminate\Support\Facades\Http` to POST `https://api.openai.com/v1/chat/completions` with a system + user prompt that mentions: name, type, location (Province/District/Sector/Cell), total_units, total_floors, amenities list, proximity list, unit size range if available. Target 250-400 words, SEO keywords: "Kigali rental", "apartment for rent Kigali", "commercial space Kigali", plus the names of the Province/District. Temperature 0.7, model `gpt-4o-mini` (or `gpt-3.5-turbo` if mini unavailable). Reads key from env only — never logs.
    - Step 3: If LLM not configured or call fails (timeout, 4xx, 5xx), log warning and return the template fallback: ~200-300 words deterministic description incorporating every provided field (name, address, units, floors, amenities, proximity, location) with a "Why rent here?" section and a gentle CTA.
  - Add route inside the `Route::middleware('auth')` group in [web.php](file:///c:/xampp/htdocs/ituze-qraltd/routes/web.php): `POST /api/ai/generate-property-description` → new `AIDescriptionController@generatePropertyDescription`. Controller wraps the service call in try/catch, returns `{description: "...", source: "llm"|"template"|"fallback"}`, and logs errors.
  - Optionally add `.env.example` line for `OPENAI_API_KEY=`.
- **Acceptance Criteria Addressed**: AC-7, AC-11, AC-12
- **Test Requirements**:
  - `rule` TR-5.1: `curl` POST to the endpoint with a sample payload returns 200 `{description, source}`. `strlen(description) >= 200` and contains >= 3 of the input fields.
  - `rule` TR-5.2: With no `OPENAI_API_KEY` set, returns HTTP 200 + `source:"template"` and no exceptions/500s; warning appears in `laravel.log`.
  - `rubric` TR-5.3: AC-13 SEO quality — capture one generated sample; scale 1-5, threshold >= 3 (template) / >= 4 (LLM if configured). Evidence: The sample text + scoring rationale.

## Task 6: Frontend — Properties Create/Edit: Add new form fields + AI Generate button
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Tasks 3, 5
- **Description**:
  - Update [Create.jsx](file:///c:/xampp/htdocs/ituze-qraltd/resources/js/Pages/Properties/Create.jsx) and [Edit.jsx](file:///c:/xampp/htdocs/ituze-qraltd/resources/js/Pages/Properties/Edit.jsx):
    - Add to `useForm` initial state: `total_units: ''`, `total_floors: ''`, `amenities: {}`, `proximity: {}`. Pre-fill in Edit.jsx from `property.amenities / proximity / total_units / total_floors`.
    - Amenities checklist (10): WiFi, Parking, Gym, Swimming Pool, Restaurant, Bar, Security, Generator, Water Tank, Elevator.
    - Proximity checklist (5): Near Tarmac Road, Near School, Near Hospital, Near Market, Near Public Transport.
    - Render amenity/proximity as grouped checkboxes with labels matching the existing UI theme (`rounded-xl`, focus ring `#0E3B2E`).
    - Add `Total Units` (number, min 0) and `Total Floors (incl. ground floor)` (number, min 1) inputs.
    - Add "Generate Description with AI" button positioned to the right of the Description label; button: light outline styling, icon `Sparkles` from lucide-react. During request: show `Loader2` spinner inside the button, disable it.
    - On click: POST to `/api/ai/generate-property-description` with payload `{ name, property_type_id, address, total_units, total_floors, amenities, proximity, cell_id, selectedProvince/District/Sector labels }`. Use `fetch` with `X-CSRF-TOKEN` from `document.querySelector('meta[name="csrf-token"]')` or Inertia helper. On 2xx: `setData('description', res.description)`. On error: `setBannerMsg(...)` type `error` mentioning the endpoint failure but emphasizing manual description is still allowed.
    - Ensure `FormData` in `handleSubmit` appends `amenities[wifi]`, `amenities[parking]`, etc., plus `total_units`, `total_floors`, and `proximity[...]` booleans correctly (checkbox true = "1"/"on", but we already have them in `data.amenities/proximity` objects, so walk the keys).
    - Pre-flight validation in `handleSubmit`: `total_floors` must be >= 1 if provided.
  - Same structural changes applied to Edit.jsx (keep image deletion logic intact).
- **Acceptance Criteria Addressed**: AC-6, AC-8
- **Test Requirements**:
  - `rule` TR-6.1: Browser render of Create page shows all inputs and the "Generate Description with AI" button. Evidence: Browser snapshot.
  - `rule` TR-6.2: Clicking Generate with pre-filled example (12 units, 4 floors, wifi/parking, near_tarmac) populates description textarea within 10s; spinner shows. Evidence: Sequence of screenshots.
  - `rule` TR-6.3: Broken endpoint (simulated) yields red InlineAlert banner; description textarea remains editable. Evidence: Screenshot with banner.

## Task 7: Frontend — Property Show & Index display new fields and badges
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 6
- **Description**:
  - [Show.jsx](file:///c:/xampp/htdocs/ituze-qraltd/resources/js/Pages/Properties/Show.jsx):
    - Stats grid currently 4 cols (units_count, images, status, type). Replace/adjust to: Total Units (`property.total_units ?? property.units_count ?? 0` with a note if mismatch, e.g. "Configured: 20 / Actual: X"), Floors (`property.total_floors ?? 'N/A'`), Images, Status.
    - If `property.amenities` has any true entries, render an "Amenities" section as small pill badges (green/gray background).
    - If `property.proximity` has entries, render "Nearby" pill badges (blue/gray).
    - Unit rows in the Units section: append size badge `"80 m²"` after unit_type pill or next to rent.
  - [Index.jsx](file:///c:/xampp/htdocs/ituze-qraltd/resources/js/Pages/Properties/Index.jsx):
    - Each card footer currently shows `{units_count} units`. Extend to `"20 units · 5 floors"` when `total_floors` is present.
    - If WiFi, Parking, or Security amenities are true, render 1-3 small badges on the card (corner or below address). Use tiny icons if available via lucide.
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rule` TR-7.1: Show page stats display configured totals and N/A fallback; amenities badges render; unit list shows m². Evidence: Screenshot.
  - `rule` TR-7.2: Index card shows "units · floors" and amenity badges. Evidence: Screenshot.

## Task 8: Frontend — All 4 Unit pages (Create/Edit/Show/Index) expose size_sqm
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 4
- **Description**:
  - [Units/Create.jsx](file:///c:/xampp/htdocs/ituze-qraltd/resources/js/Pages/Units/Create.jsx) + [Edit.jsx](file:///c:/xampp/htdocs/ituze-qraltd/resources/js/Pages/Units/Edit.jsx):
    - Add to `useForm`: `size_sqm: ''` (prefill from existing unit in Edit).
    - Render field: "Unit Size (m²)" numeric input (min 0, step 0.01), same styling as rent_amount (with a square/area icon e.g. `Grid3x3` or no icon — avoid DollarSign). Position above Description for flow.
    - Append `size_sqm` to post payload.
  - [Units/Show.jsx](file:///c:/xampp/htdocs/ituze-qraltd/resources/js/Pages/Units/Show.jsx):
    - Display size alongside rent, e.g., "80 m² · RWF 150,000 / month".
  - [Units/Index.jsx](file:///c:/xampp/htdocs/ituze-qraltd/resources/js/Pages/Units/Index.jsx):
    - Show size in each row/card; empty size → "Size: N/A".
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rule` TR-8.1: Every Unit page renders size_sqm field (or value if Show/Index). Evidence: Screenshots of all 4 pages.
  - `rule` TR-8.2: `size_sqm=75.5` created in Task 4 appears as "75.50 m²" or "75.5 m²" on Show/Index. Evidence: Page snapshot.

## Task 9: Configure LLM env bridge (OpenAI key wiring + .env.example) + get_llm_config verification
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 5
- **Description**:
  - Add to `.env.example`: `OPENAI_API_KEY=`, `OPENAI_MODEL=gpt-4o-mini` (commented out if desired).
  - Add to `config/services.php` an `openai` entry: `'api_key' => env('OPENAI_API_KEY')`, `'model' => env('OPENAI_MODEL', 'gpt-4o-mini')` so Task 5 service can use `config('services.openai.*')`.
  - (No key written to repo; `.env` left untouched — follow security best practices.)
  - Call the `get_llm_config` IDE tool with `["openai"]` as part of the verification step to confirm whether the local IDE environment already has an OpenAI key provisioned; log result and rely on template fallback when it does not.
- **Acceptance Criteria Addressed**: AC-7, AC-11, NFR-4
- **Test Requirements**:
  - `rule` TR-9.1: `config/services.php` contains openai config block; `.env.example` has the 2 lines. Evidence: Code read.
  - `rule` TR-9.2: `get_llm_config` tool call succeeds and reports configured/unconfigured status without error. Evidence: Tool result.

## Task 10: End-to-end verification + diagnostics
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Tasks 1–9
- **Description**:
  - Run `php artisan migrate` (no fresh — just new migrations).
  - Open app in browser:
    1. Create a property via UI with all new fields populated, attach 1 small image, click Generate Description, save → confirm DB row.
    2. Add a unit with `size_sqm=60` → confirm DB and card render.
    3. View property Show, Index, Unit Show/Index → confirm visuals.
    4. Edit → change total_floors, toggle amenities, re-generate → confirm persistence.
  - Run `GetDiagnostics` IDE tool for JS/TS/PHP lint issues; fix any issues introduced.
  - Run `php artisan route:list` to confirm new `api/ai/generate-property-description` route appears (auth middleware).
- **Acceptance Criteria Addressed**: AC-1 through AC-13 (overall integration)
- **Test Requirements**:
  - `rule` TR-10.1: End-to-end create → show → edit flow succeeds end to end with no JS console errors or 500s. Evidence: Browser console log, network tab, final page snapshot.
  - `rule` TR-10.2: `GetDiagnostics` returns 0 new errors introduced by these changes. Evidence: Tool output.
  - `rule` TR-10.3: `php artisan route:list | grep -i generate` returns the new route. Evidence: CLI output.
