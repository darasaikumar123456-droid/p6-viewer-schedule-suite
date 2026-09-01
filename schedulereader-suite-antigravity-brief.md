# ScheduleReader Suite — Build Brief for Google Antigravity

> **Note to Sai (delete before pasting, or leave in — it's harmless):** This whole document is written as a mission brief you can paste directly into Antigravity's Manager/Editor. It's organized so you can also feed it one "Phase" at a time (see the Build Phasing section) if you'd rather have the agent work incrementally and you review Artifacts between phases, which tends to produce better results than a single giant one-shot build. Assumptions I made to keep this concrete are flagged inline with **[ASSUMPTION]** — correct any of them before or during the build.

---

## 1. Role & Mission

You are the lead full-stack engineer building **ScheduleReader Suite**, a three-module web application for construction planning and scheduling professionals who use Oracle Primavera P6 as their system of record. Build the product exactly as specified below, in the phased order given in Section 10. After each phase, produce your standard Artifacts (implementation plan, screenshots, walkthrough) before moving to the next phase.

---

## 2. Product Positioning

Primavera P6 (standalone/desktop) remains the **system of record** — it is where schedules are authored, logic is finalized, and progress is officially updated. This suite does **not** replace P6. It is a companion suite that:

1. **Drafts** new schedule fragments (WBS + activities + logic) from a plain-language scope description, so a planner isn't starting from a blank P6 screen — the fragment is reviewed, adjusted, and exported for import back into P6.
2. **Visualizes** any P6 schedule (uploaded as XER/XML) in a fast, shareable, read-oriented web viewer — for people who need to look at, filter, and present a schedule without owning a P6 license.
3. **Analyzes** a portfolio of schedules and revisions together — trends, comparisons, and delay patterns across projects that P6 itself doesn't show you at a portfolio level.

The throughline across all three modules is a shared schedule data model and a shared XER/XML import-export engine — build that core once, well, and reuse it everywhere.

---

## 3. Reference UI (from existing product screenshots)

The attached reference screenshots are from a P6 viewer called "ScheduleReader Online." **Module 2 should be built to the same standard of polish and match its functional scope closely** (not pixel-clone the visuals — see Section 9 for visual direction), because it establishes the baseline feature set planners expect from this category of tool. The relevant screens and their exact behavior are catalogued in Section 6 — build to that spec.

---

## 4. Tech Stack

**[ASSUMPTION — confirm or override]** Since this will be built in Antigravity and hosted via Google AI Studio / Cloud Run, default to the Google-native stack:

- **Frontend:** React + TypeScript + Vite. Tailwind CSS for styling.
- **Gantt rendering:** Build a custom SVG/Canvas-based Gantt renderer (virtualized for thousands of activities) rather than a paid third-party Gantt library, since bar-type styling, WBS color cascading, and legend behavior all need to be fully custom and license-free.
- **Backend:** Node.js (Express or Fastify) as a container service on Cloud Run.
- **Database:** PostgreSQL (Cloud SQL) for the relational schedule model (WBS/Activities/Relationships/Calendars are inherently relational — see Section 5). Use Cloud Storage for raw uploaded XER/XML files.
- **Auth:** Firebase Auth (Google sign-in), since this integrates natively with the AI Studio / Cloud Run deployment path.
- **AI model (Module 1):** Gemini API, called server-side, using structured JSON output (response schema) — never expose the API key client-side. This also keeps the app aligned with AI Studio's server-side key handling model.
- **Deployment:** Deploy to Cloud Run directly from AI Studio Build mode / via Antigravity's Cloud Run export, so the same project can be iterated in either environment.

---

## 5. Core Data Model

Build one normalized schema that every module reads/writes. Model it close to P6's own XER structure so import/export is lossless where it matters. Minimum entities:

| Entity | Key fields | Notes |
|---|---|---|
| **Project** | id, short_id (e.g. "PR"), name, start_date, finish_date, data_date | One row per imported/created schedule |
| **WBS** | wbs_id, parent_wbs_id, short_code, name, level, project_id | Hierarchical, arbitrary depth (screenshots show 15+ levels supported) |
| **Activity** | activity_id (e.g. "A1240"), name, wbs_id, project_id, activity_type (Task Dependent / Start Milestone / Finish Milestone / Level of Effort / WBS Summary), status (Not Started / In Progress / Completed), is_critical, is_longest_path, constraint_type, calendar_id |
| **ActivityDates** | early_start, early_finish, late_start, late_finish, actual_start, actual_finish, expected_finish, remaining_late_start |
| **ActivityDuration** | planned_duration, remaining_duration, actual_duration, at_completion_duration, free_slack (float), total_float |
| **ActivityProgress** | activity_pct_complete, physical_pct_complete, units_pct_complete, pct_complete_type |
| **ActivityWork** | actual_labor_units, at_completion_units |
| **Relationship** | pred_activity_id, succ_activity_id, type (FS/SS/FF/SF), lag, is_driving |
| **Calendar** | id, name, work_hours_per_day, work_days_per_week, holidays[] — required for accurate duration-unit conversion (h/d/w/m) |
| **ActivityCode / ActivityCodeAssignment** | code_type, code_value, activity_id — powers the "Activity Codes" filter/column category |
| **Baseline/Revision** | project_id, revision_number, uploaded_at, source_file — a project accrues revisions over time; "Baselines" in the viewer compares current vs. a prior revision of the *same* schedule (confirmed by the reference screenshot's empty-state copy: "Baselines compare the current schedule against an earlier revision. Upload a newer version of this schedule to start using baselines.") |
| **ScheduleFragment** (Module 1 output) | draft_id, source_prompt, wbs_nodes[], activities[], relationships[], status (draft/confirmed/exported) |

**XER/XML import-export mapping [ASSUMPTION — verify field names against a real P6 XER export before finalizing]:** map to P6's native tables — `PROJECT`, `PROJWBS` (wbs_id, parent_wbs_id, wbs_short_name, wbs_name, proj_id), `TASK` (task_id, task_code, task_name, wbs_id, target_drtn_hr_cnt, act_start_date, act_end_date, status_code), `TASKPRED` (task_id, pred_task_id, pred_type, lag_hr_cnt), `CALENDAR`, `ACTVCODE`/`TASKACTV`. Build the parser/writer as an isolated shared library (`/lib/xer`) so all three modules call the same code, and so you can unit-test it against sample XER files independent of the UI.

---

## 6. Module 2 — Schedule Viewer

*(Specified first, in most detail, because it's the most concretely referenced module — build this one first per Section 10.)*

### 6.1 Shell
- Top nav bar: product logo/name, "Schedules" and "Help" links, a Gantt-chart search box, dark-mode toggle, profile menu.
- View-scale tabs: **Day / Week / Month / Quarter / Year**, controlling the Gantt timeline granularity.
- Toolbar icons near the view tabs: expand/collapse all, indent toggle, comment/annotation toggle, zoom in/out.
- Left icon rail (each opens a settings panel documented below): WBS/outline, Filters, Columns, Legend, view mode, history/Baselines, WBS color palette, map/location (if relevant to construction site data — otherwise omit), list view, print.
- Main body: split pane — left is a table (Name / Start / Finish + any user-selected columns), right is the Gantt timeline. Both scroll in sync vertically; the table pane is resizable against the Gantt pane.
- Bottom slide-up panel: **Activity Detail** — opens when a row is selected. Tabs: **General**, **Status**, **Relationships**. The Relationships tab shows two side-by-side tables, **Predecessors** and **Successors**, each with columns ID / Name / Type / Status / Resource / Driving (checkbox), and an empty state ("No predecessors found") when applicable.

### 6.2 Columns panel
Two-pane picker: "Available columns" (left, grouped into collapsible categories) → arrow buttons → "Selected columns" (right, draggable to reorder, each with a sort icon and a per-column settings gear). Include a "Search columns" box and an "Expand All Columns" toggle. Default selected columns: Name, Start, Finish.

Build out the full category tree, minimum:
- **Activity Codes:** Activity Global Codes (plus project-specific activity codes, dynamically populated from imported data)
- **Dates:** Actual Finish, Actual Start, Early Finish, Early Start, Expected Finish, Late Finish, Late Start, Remaining Late Start
- **Durations:** Actual Duration, At Completion Duration, Free Slack, Planned Duration, Remaining Duration, Total Float
- **General:** Constraint Type, Critical, Id, Longest Path, Milestone, Project Name, Status, Type, WBS
- **Lists:** Predecessors, Successors
- **Percent Complete:** Activity % Complete, Percentage Complete Type, Physical % Complete, Units % Complete
- **Work:** Actual Labor Units, At Completion Units (extend this group with any other work/units fields you add to the data model)

### 6.3 Bar Settings panel
Left side: a "WBS" section with a "Color" sub-link (opens WBS Color Settings, 6.7). Right side: a live "Preview" (labeled with the current project name, e.g. "Project Training") listing every bar type with a checkbox (visible/hidden on the Gantt) and its rendered sample:

| Bar type | Default color/shape |
|---|---|
| WBS | gray summary bar |
| Critical Task | red bar |
| Actual Task | blue bar |
| Remaining Task | green bar |
| Level of Efforts | dark green bar |
| Float Task | black bar (unchecked/hidden by default) |
| Critical Milestone | red diamond |
| Actual Milestone | blue diamond |
| Remaining Milestone | green diamond |

Footer buttons: "Reset Current Version", Cancel, Save.

### 6.4 Duration Format panel
Radio group: Hours (h) / Days (d) / Weeks (w) / Months (m), with an info callout: "The conversion uses project-specific calendar settings (work hours per day, days per week/month)." — this must actually read each activity's assigned Calendar record to do the conversion correctly, not use a flat multiplier.

### 6.5 Filters panel
Tabbed modal: **General**, **WBS**, **Activity Codes**.
- General tab: Start date / End date pickers (dd-mm-yyyy format with calendar icon), an Activity Status chip multi-select (Not Started / In Progress / Completed / Critical).
- WBS tab: tree-based multi-select of WBS nodes to include.
- Activity Codes tab: multi-select by code type/value, dynamically populated from the loaded schedule.
- A persistent "Hide if Empty" checkbox (hides table groups that have zero matching rows after filtering) and Cancel/Save.

### 6.6 Grouping panel
A table of grouping rules with columns **Group by** (dropdown: WBS, Activity Codes, Status, Resource, Calendar, custom fields, etc.), **Indent** (checkbox), **To level** (numeric, e.g. up to 20), **Group Interval** (used for date-based or numeric groupings). A "+" button adds another grouping row for multi-level grouping (e.g. group by WBS, then sub-group by Status). Rows are drag-reorderable (grip handle).

### 6.7 WBS Color Settings panel
- Top-right "Enable WBS Colors" toggle.
- A palette strip preview and a palette gallery: named palettes (**Default**, **Vivid Nordic**, **Steel Gradient**, **Pastel Spectrum** — ship at least these four, each with 4+ swatches that cycle/repeat down the WBS depth), with a "Show/Hide Palettes" expand toggle and a currently-selected palette highlighted.
- Right side: a live preview tree showing every WBS level colored per the selected palette, cycling colors as depth increases (screenshot shows 15 nested levels correctly cycling through a repeating color sequence).
- Footer: "Reset to Default", Cancel, Save.

### 6.8 Legend panel
A simple reference popup, grouped under "Phases", listing every bar/marker type used on the Gantt with its swatch: Project, End Only Task, Gradient Milestone, Critical Task, Remaining Task, Critical Milestone, Remaining Milestone, Task Duration, Start Only Task, WBS, Actual Task, Level of Efforts, Actual Milestone.

### 6.9 Baselines panel
Modal titled "Baselines: {Project Name}". If the project has no prior revision uploaded, show an empty state: an icon, "No other versions available", and copy explaining that baselines compare the current schedule against an earlier revision, prompting the user to upload a newer version to start using baselines. Once ≥2 revisions of a project exist, this panel should let the user pick a baseline revision and render baseline bars alongside current bars on the Gantt (dashed/lighter treatment for the baseline).

### 6.10 Project Info panel
Modal titled "Projects Information" — a table (Id, Name, Start Date, Finish Date, and additional columns scrollable to the right — extend with Data Date, Activity Count, etc.) listing every project/sub-project loaded into the current view.

### 6.11 Import
Accept XER and P6 XML on upload (use the shared `/lib/xer` parser from Section 5). Show import progress and a validation summary (activity count, date range, any parse warnings) before rendering.

### 6.12 Lightweight Edit & In-App CPM Preview
Module 2 supports a deliberately narrow, non-resource set of edits, so consultants without a P6 license can do real planning work and see its tentative downstream impact before it goes to P6 for authoritative recalculation.

**In scope — the only edit types the UI needs to support:**
1. Relationship type changes (FS ↔ SS ↔ FF ↔ SF)
2. Lead/lag add, remove, or adjust on any relationship
3. New activity insertion, linked to existing activities via predecessor/successor relationships
4. Marking an activity complete / in-progress, with actual start date, actual finish date, and actual duration entered directly
5. Duration edits — always a **direct manual value** from the consultant, never derived from units, resources, or cost. No resource assignment, resource leveling, or cost logic exists anywhere in this module — all of that remains exclusively in P6.

**Compute Schedule button:** runs an in-app, calendar-aware CPM forward pass + backward pass across the edited network and displays tentative early/late dates, total float, critical path, and overall project-finish drift. Requirements for this to be trustworthy:
- Calendar-aware throughout (durations/float are stored in hours in P6's own data model; convert using each activity's assigned calendar's hours-per-day — never a flat multiplier).
- Retained-logic handling for actual dates: a completed activity's dates are fixed as entered; an in-progress activity resumes its remaining duration forward from the project data date; a not-started activity schedules purely from predecessor logic. This is required specifically to support edit type 4 above.
- Must **read and respect** any constraints already present in the imported schedule (e.g. Start No Earlier Than) even though the UI doesn't offer constraint editing — otherwise the preview dates will be wrong even with zero edits.
- Critical path = float ≤ 0 by default (match whichever float threshold the source project uses, if non-default).
- Level of Effort / WBS Summary activities pass through without being treated as normal CPM nodes — no active support needed beyond not breaking on them.
- No resource- or unit-driven duration recalculation, no leveling, no cost — explicitly out of scope; this is a pure activity-duration-and-logic network calculation.

**This computation is preview-only.** It exists to give the consultant a tentative "if I import this, the finish date will land around here" view and to catch anything wildly out of line before sending the file onward — it is explicitly not represented as P6-accurate. **The XER export is unaffected by this feature:** it still contains only the edited/added activities, relationships, lags, actuals, and durations (Section 7.1 step 4's fragment mechanism, reused here) — never the in-app-computed dates or float. P6's own "Schedule" (F9) recalculation on import remains the sole authoritative computation.

**Calendars:** a full XER export already includes the CALENDAR table (it's one of the tables required for any valid P6 schedule export), so no separate export step is needed from P6 — parse it directly. Its `clndr_data` field is a proprietary nested-parentheses format (work week + exceptions); this is the fiddliest single part of the parser, but it's a solved problem — reference an existing open-source XER parser's calendar-decoding logic rather than reverse-engineering it from scratch. Maintain a reusable calendar library (imported from XER and/or defined natively in-app) so different consultants working across different projects can apply whichever calendar fits.

**Validation requirement before rollout:** before this reaches consultants, build a small validation harness — take real completed schedules from the steel plant project, compute in P6, compute in this engine, diff the two, and iterate until they converge on typical (non-resource, non-exotic-constraint) cases. This is what actually earns the trust needed to reduce reliance on the two P6 seats.

---

## 7. Module 1 — AI Schedule Drafting Assistant

### 7.1 Flow
1. **Prompt:** User describes a scope in plain language, e.g. *"I'm working on a Conveyor junction house of a steel plant."* Free-text chat input, optionally with structured hints (project type, region, approx. duration target, crew/resource constraints).
2. **Draft generation:** Server calls Gemini with a construction-domain system prompt (see 7.2) and returns a structured draft: a WBS hierarchy, activities under each WBS node with tentative durations and types, and predecessor logic between them. Render this as an editable tree/table — identical column/row affordances to Module 2's table pane, so the UI feels continuous across modules.
3. **Review & edit:** User can rename, reorder, delete, split, or merge WBS nodes and activities; adjust durations and logic; add/remove predecessor relationships — inline, before confirming. Nothing is written to a "final" schedule until the user explicitly confirms.
4. **Confirm → generate fragment:** On confirm, persist a `ScheduleFragment` record (Section 5) and generate:
   - An internal JSON representation (for continued editing / Schedule IQ ingestion), and
   - An **exportable XER/XML fragment** using the shared `/lib/xer` writer, using duration-only logic (no fixed dates) so it drops cleanly into any target project's calendar when imported into P6.
5. **Append to existing schedule:** User optionally uploads (or selects an already-viewed) full project schedule and picks a target WBS parent node; the system merges the fragment under that node, renumbering activity/WBS IDs to avoid collisions, and produces a single combined XER/XML the user downloads and imports into their P6 standalone client to finalize. **This module never claims to auto-finalize the schedule in P6 — the last-mile confirmation always happens in P6 itself**, consistent with the positioning in Section 2.

### 7.2 AI prompting approach
- System prompt should encode general industrial/civil construction WBS conventions (mobilization → civil/foundation → structural → mechanical/electrical → testing & commissioning → handover) and should be tunable per industry (steel plant, power, infrastructure). **[ASSUMPTION]** Ship a small library of industry templates (steel plant civil/structural packages, standard building packages, etc.) that get injected as few-shot context based on keywords in the user's prompt — this is far more reliable than relying on the model's raw judgment for domain-specific durations and sequencing.
- Force structured output via Gemini's response schema (JSON mode) — do not parse free text. Example schema:

```json
{
  "wbs": [
    { "wbs_id": "1.1", "parent_wbs_id": "1", "name": "Civil Works", "level": 2 }
  ],
  "activities": [
    {
      "activity_id": "A1010",
      "name": "Excavation for foundation",
      "wbs_id": "1.1",
      "duration_days": 6,
      "activity_type": "Task Dependent",
      "predecessors": [
        { "activity_id": "A1000", "type": "FS", "lag_days": 0 }
      ],
      "resource_tag": "Civil crew"
    }
  ],
  "assumptions": ["Standard 6-day work week assumed", "No soil report available — excavation duration is a placeholder"],
  "confidence_notes": "Medium confidence — durations are typical ranges, not project-specific estimates"
}
```
- Always surface `assumptions` and `confidence_notes` to the user in the review step (7.1 step 3) — this is a draft, not an estimate, and the UI should never let that ambiguity get lost.

---

## 8. Module 3 — Schedule IQ (Analytics)

### 8.1 Repository
A library where every uploaded/generated schedule and every revision of it lives, taggable by project, region, and package type (so "Conveyor junction house" packages across different steel plant projects can be benchmarked against each other later).

### 8.2 Single-schedule analytics
- S-curve: planned vs. actual vs. earned progress over time (needs `ActivityProgress` + dates from Section 5).
- Critical path length index and float distribution histogram.
- Resource/units histogram over time (from `ActivityWork`).

### 8.3 Cross-schedule / cross-revision analytics
- Revision-over-revision slippage trend for a single project (finish-date drift per revision).
- Delay-category tagging on slipped activities. **Reuse the delay taxonomy already scoped in the broader P6-replacement PRD** (monsoon, manpower crisis, drawing delays, material shortage) rather than inventing a new one — keep this consistent across your planning tools.
- Portfolio dashboard: on-time percentage, average total float, count of critical activities, across all projects in the repository.
- Benchmarking: compare the same WBS package (by name/tag) across multiple projects — e.g. average planned duration and actual duration for every "Conveyor junction house" package on file.

### 8.4 Comparison mode
Pick 2+ schedules or baseline revisions and produce an activity-level diff: added/removed/renamed activities, duration deltas, date shifts, logic changes — table view first, with a stretch goal of a side-by-side Gantt overlay reusing Module 2's rendering component.

---

## 9. Visual Design Direction

Match the *category* of polish shown in the reference screenshots — clean white surfaces, rounded modal corners, a single confident accent color, generous whitespace, consistent left-icon-rail navigation — but do not literally clone their specific layout or copy. Choose your own accent color, typography, and spacing scale and apply them consistently across all three modules so the suite reads as one product, not three stitched-together tools. Avoid generic default component-library styling; make deliberate typography and color choices.

---

## 10. Build Phasing

Build and verify in this order. Produce a working Artifact (screenshot/demo) at the end of each phase before starting the next.

1. **Phase 0 — Foundation:** Data model (Section 5), the shared `/lib/xer` import/export library, and a seeded sample project for development.
2. **Phase 1 — Module 2 (Viewer):** Shell, Gantt rendering, table pane, and every settings panel in Section 6. This is the largest phase — it's fine to sub-split it further (shell + import first, then panels one by one, then the lightweight-edit + CPM preview engine in 6.12 as its own final sub-step with the validation harness as its exit criterion).
3. **Phase 2 — Module 1 (AI Drafting):** Gemini integration, draft review UI, fragment generation, append-and-export flow.
4. **Phase 3 — Module 3 (Schedule IQ):** Repository, single- and cross-schedule analytics, comparison mode.
5. **Phase 4 — Integration & deploy:** Shared nav across modules, auth, and deployment to Cloud Run (via AI Studio's Build mode or Antigravity's Cloud Run export).

---

## 11. Open Questions / Assumptions to Confirm

- Tech stack (Section 4) — confirmed default is React/Node/PostgreSQL/Firebase Auth/Gemini on Cloud Run. Flag if a different stack is preferred.
- XER field mapping (Section 5) should be validated against a real exported XER file rather than field names recalled from documentation.
- Industry WBS template library for Module 1 (Section 7.2) — starting scope is steel-plant industrial packages; confirm which other industries/packages to prioritize.
- Whether Module 2 needs write-back (editing) capability at all, or stays strictly read/filter/present-only as scoped here.
