# Ituze QR Ltd - Property Enhancement & AI Description Generator - Product Requirements Document

## Overview
- **Summary**: Extend the Property & Unit data models with structural detail fields (unit count, floor count, unit size, amenities, proximity flags) and add an AI-powered property description generator that produces attractive, SEO-optimized marketing copy from those inputs.
- **Purpose**: Give property owners/agents structured data fields for richer listings and automate high-quality, compelling property descriptions so customers can browse informative listings without manual copywriting effort.
- **Target Users**: Property owners/landlords, admin users (approving/managing), and end-customers browsing rental/commercial listings.

## Goals
1. Property records store `total_units`, `total_floors` (ground floor inclusive), plus amenity and proximity flags.
2. Each Unit record stores `size_sqm` (e.g., 200 m²).
3. Frontend Create/Edit/Show/Index pages expose and render the new fields consistently.
4. A backend endpoint + frontend button generates an SEO-friendly property description from the form inputs and inserts it into the description textarea.
5. AI description generation gracefully handles missing/unconfigured LLM keys with a template-based fallback so the feature never blocks listing creation.

## Non-Goals
- Customer-facing search/faceted filtering by the new fields (can be added later).
- Bulk AI re-generation across many properties in one run.
- Image-based AI description (text inputs only).
- Multi-language description output; English only for v1.

## Background & Context
- Repo: Laravel 11 + React + Inertia.js, XAMPP local dev at `c:\xampp\htdocs\ituze-qraltd`.
- Existing `properties` columns: `id, owner_id, cell_id, property_type_id, name, address, description, status, timestamps` (plus `units_count` via `withCount`).
- Existing `units` columns: `id, property_id, unit_type_id, unit_number, rent_amount, description, status`.
- Mandatory profile completion middleware already enforced; image upload 2 MB cap already enforced.
- Location tiers: Province → District → Sector → Cell (endpoints in `routes/web.php` `/api/...`).
- Feedback UI convention: FlashToast + InlineAlert; session flash propagated via `HandleInertiaRequests`.
- Controller convention: try/catch with laravel.log errors and flash messages.
- `.env` currently has no LLM keys; AI integration should use the existing `get_llm_config` tool pattern and fall back to a deterministic template when no provider is configured.

## Functional Requirements
- **FR-1**: Database columns added to `properties`: `total_units` (unsigned int, nullable), `total_floors` (unsigned int, nullable), `amenities` (JSON/longtext, nullable — boolean feature map), `proximity` (JSON/longtext, nullable — e.g., near_tarmac, near_school).
- **FR-2**: Database column added to `units`: `size_sqm` (decimal 8,2, nullable).
- **FR-3**: `Property` and `Unit` models expose the new fields in `$fillable` and cast JSON columns to `array`.
- **FR-4**: `PropertyController@store/@update` validate and persist `total_units`, `total_floors`, `amenities`, `proximity`; `UnitController@store/@update` validate and persist `size_sqm`.
- **FR-5**: Properties `Create.jsx` & `Edit.jsx` render input fields for total_units, total_floors, a checklist of amenities (WiFi, Parking, Gym, Swimming Pool, Restaurant, Bar, Security, Generator, Water Tank, Elevator), and proximity checkboxes (Near Tarmac Road, Near School, Near Hospital, Near Market, Near Public Transport).
- **FR-6**: Properties `Create.jsx` & `Edit.jsx` include a "Generate Description with AI" button that collects all current form values, POSTs them to an endpoint, receives generated text, and populates the description textarea (user may still edit).
- **FR-7**: Units `Create.jsx`, `Edit.jsx`, `Show.jsx`, `Index.jsx` display `size_sqm` alongside rent; `Property Show.jsx` summary card shows total_units/total_floors.
- **FR-8**: New API endpoint `POST /api/ai/generate-property-description` (auth required) accepts the property inputs, calls an LLM when configured, otherwise returns a well-structured template description. Result is plain text suitable for the `description` field.
- **FR-9**: Controller uses try/catch per project convention; AI failure logs to `laravel.log` and returns an InlineAlert-friendly error but never breaks form submission.
- **FR-10**: Properties `Index.jsx` cards and `Show.jsx` hero summary visually surface total_units, total_floors, and key amenity badges (at least WiFi/Parking/Security when present).

## Non-Functional Requirements
- **NFR-1**: All new DB columns are nullable so existing rows and partial forms keep working (data is enriched progressively).
- **NFR-2**: Frontend fields follow the existing rounded-xl border + `#0E3B2E` focus styling and form spacing conventions.
- **NFR-3**: AI endpoint response time < 10s on success, fallback < 200ms. Frontend shows a Loader2 spinner and disables the "Generate" button during the request.
- **NFR-4**: No API keys or secrets are logged or echoed to Inertia props; LLM keys read from `.env` only in the backend.
- **NFR-5**: New migration(s) follow the existing `database/migrations` naming pattern and are idempotent-safe where possible.

## Constraints
- **Technical**: Must use Laravel migrations (no manual DB edits). LLM integration relies on `get_llm_config`-style env keys; default provider is OpenAI if configured, else template fallback. HTTP client via Laravel `Http` facade.
- **Business**: Unit size uses square meters (m²) only. "Floors" explicitly counts the ground floor so a single-story building = `1`. Total units at property level is informational; unit count from `units_count` relation remains the source of truth for "actual" count (display both when they differ).
- **Dependencies**: Existing `routes/web.php` auth middleware group; existing Property/Unit CRUD endpoints. No new package installs required (use `Illuminate\Support\Facades\Http` already bundled with Laravel).

## Assumptions
- User will configure an OpenAI key via the IDE integration flow; until then template fallback is acceptable behavior.
- Amenity/proximity set for v1 is the fixed list enumerated in FR-5; adding more later is a separate change.
- `size_sqm` lives on the Unit because different units in the same building can differ; property-level display may show range (min/max) or the single value if units are uniform — v1 displays the unit's own size on Unit cards and "N/A" at property level if empty.

## Acceptance Criteria

### AC-1: Properties table has new structural columns
- **Type**: `rule`
- **Given**: A fresh or existing MySQL database for `ituze_qraltd`
- **When**: `php artisan migrate` runs after the new migration(s) are created
- **Then**: `DESCRIBE properties` shows columns `total_units` (int), `total_floors` (int), `amenities` (json/longtext), `proximity` (json/longtext); all are nullable
- **Pass Condition**: Migration runs cleanly and columns are visible via `DESCRIBE properties`
- **Evidence**: Artisan migrate output + DESCRIBE query result

### AC-2: Units table has size_sqm column
- **Type**: `rule`
- **Given**: A fresh or existing MySQL database
- **When**: Migration runs
- **Then**: `units.size_sqm` exists as DECIMAL(8,2) NULLABLE
- **Pass Condition**: Column present after migrate
- **Evidence**: Artisan migrate output + DESCRIBE query result

### AC-3: Model fillables + casts wire up new fields
- **Type**: `rule`
- **Given**: `Property.php` and `Unit.php`
- **When**: Reviewing the models
- **Then**: `Property::$fillable` contains `total_units,total_floors,amenities,proximity` and casts amenities/proximity to `array`; `Unit::$fillable` contains `size_sqm` with a decimal cast if needed
- **Pass Condition**: All new fields present in fillable + JSON casts exist
- **Evidence**: Source code inspection

### AC-4: PropertyController validates and stores new fields
- **Type**: `rule`
- **Given**: An authenticated POST/PUT to properties.store / properties.update
- **When**: Request contains `total_units=10`, `total_floors=3`, `amenities[wifi]=1`, `proximity[near_tarmac]=1`
- **Then**: The property row is written with these values (amenities/proximity as JSON); validation rejects non-numeric total_units/total_floors
- **Pass Condition**: DB row reflects inputs; invalid payloads return 422 with messages
- **Evidence**: Form submit test + `SELECT` verification, plus validation error on bad payload

### AC-5: UnitController validates and stores size_sqm
- **Type**: `rule`
- **Given**: POST/PUT to units.store / units.update with `size_sqm=75.5`
- **When**: Request processed
- **Then**: Unit row persists size_sqm; negative values rejected
- **Pass Condition**: Unit.size_sqm == 75.50; negative payload returns 422
- **Evidence**: Form submit test + `SELECT` verification

### AC-6: Properties Create form exposes new fields + generate button
- **Type**: `rule`
- **Given**: Navigating to `/properties/create`
- **When**: Rendering the form
- **Then**: Inputs present for `Total Units`, `Total Floors (incl. ground)`, Amenities checklist (10 items), Proximity checklist (5 items), and a button labeled "Generate Description with AI" next to the Description textarea
- **Pass Condition**: All fields render with correct labels and `#0E3B2E` focus styling matching existing fields
- **Evidence**: Browser snapshot / DOM inspection

### AC-7: AI generate endpoint produces description text
- **Type**: `rule`
- **Given**: POST `/api/ai/generate-property-description` with valid property payload (name, type, total_units, total_floors, amenities, proximity, location hierarchy)
- **When**: Endpoint responds (either LLM or template fallback)
- **Then**: Response JSON contains `{ description: "..." }` with at least 150 words mentioning property name, location, amenities, proximity, and units; no placeholder-only output
- **Pass Condition**: JSON 200 response, description length >= 150 chars and mentions >= 3 inputs
- **Evidence**: `curl` or Postman-style call response body

### AC-8: AI button populates description textarea
- **Type**: `rule`
- **Given**: Filled Property Create form (name, type, location, units=12, floors=4, wifi+parking amenities, near_tarmac proximity)
- **When**: Clicking "Generate Description with AI"
- **Then**: Description textarea receives generated text within 10s; button shows spinner during request; InlineAlert shown if AI endpoint fails (but form still submittable)
- **Pass Condition**: textarea non-empty after click, spinner rendered, failure shows error banner
- **Evidence**: Browser interaction recording / screenshot sequence

### AC-9: Property Show & Index display new fields
- **Type**: `rule`
- **Given**: A property with total_units=20, total_floors=5, amenities={wifi,parking,security}, unit.size_sqm=80
- **When**: Viewing `/properties` (Index) and `/properties/{id}` (Show)
- **Then**: Index cards display "20 units · 5 floors" and amenity badges (WiFi, Parking, Security); Show page summary card shows Total Units / Total Floors stats, unit rows append "80 m²" label
- **Pass Condition**: Strings and badges visible in their respective pages
- **Evidence**: Browser snapshots of Index + Show pages

### AC-10: Unit forms display size_sqm end to end
- **Type**: `rule`
- **Given**: Unit Create/Edit/Show/Index pages
- **When**: size_sqm is set (or blank)
- **Then**: Create/Edit have numeric input "Unit Size (m²)"; Show/Index render "X m²" next to rent; empty value shows "N/A"
- **Pass Condition**: All 4 unit pages render size correctly
- **Evidence**: Browser snapshots

### AC-11: Missing LLM key → template fallback (no crash)
- **Type**: `rule`
- **Given**: `.env` has no `OPENAI_API_KEY` or equivalent
- **When**: AI generate endpoint is called
- **Then**: Returns status 200 with a well-formatted template description (no 500 error), and optionally a warning flash/prop indicating "Generated using local template — configure an LLM key for richer output"
- **Pass Condition**: Endpoint returns 200 with description text and no errors
- **Evidence**: Call endpoint without LLM keys configured, inspect response body + logs

### AC-12: Graceful controller error handling
- **Type**: `rule`
- **Given**: Property or Unit store/update that triggers an Exception (e.g., simulated DB constraint)
- **When**: Exception thrown inside try/catch
- **Then**: Error written to `laravel.log`; user redirected `back()->withInput()` with a readable `error` flash InlineAlert; no stack trace exposed to client
- **Pass Condition**: Log entry present + flash error shown
- **Evidence**: Log tail + browser alert rendering

### AC-13: SEO quality of generated description
- **Type**: `rubric`
- **Dimension**: Marketing + SEO richness of AI description output
- **Scale**: 1-5
- **Anchors**: 1 = generic template only, no location/amenity specifics; 3 = template fallback with all given inputs interpolated, 2-3 keyword repetitions; 5 = LLM-produced copy with structured flow (hook → location → amenities → proximity → units/size → CTA), keywords for "Kigali rent", "apartment for rent", natural readability
- **Pass Threshold**: >= 4 (with LLM configured) OR >= 3 (template-only environment)
- **Evidence**: Captured generated text sample, keyword count, and manual readability rating

## Open Questions
- None outstanding. Amenity/proximity lists, metric units, and template-vs-LLM strategy are assumed per Assumptions above; user can adjust in a follow-up.
