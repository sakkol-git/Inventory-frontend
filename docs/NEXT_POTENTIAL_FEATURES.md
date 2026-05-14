# NEXT POTENTIAL FEATURES — Prioritized Roadmap 🚀

This document lists high-impact, practical features to develop next for BioLab Compass. Each entry includes: a short description, user stories, expected impact, rough effort estimate, dependencies, MVP tasks, and acceptance criteria. Use this as a starting point to pick 1–3 items for the next sprint.

---

## Quick summary (Top 3 recommended next)
1. **Inventory Forecasting & Alerts** ✅ — Improve supply planning with simple forecasting and low-stock alerts. (Impact: High, Effort: M)
2. **Protocol Editor + Versioning** ✍️ — Rich editor for experimental protocols with version history and branching. (Impact: High, Effort: M)
3. **Mobile Offline Mode (PWA improvements)** 📱 — Make the app usable offline on mobile/tablet for greenhouses and labs with flaky connectivity. (Impact: High, Effort: L)

---

## Full prioritized list

### 1) Inventory Forecasting & Alerts (ML-lite)
- Description: Basic forecasting (moving average / seasonal) for inventory, per-item reorder suggestions, and automated low-stock alerts.
- User stories: "As a lab manager, I want to know which chemicals will run out within 14 days so I can reorder on time."
- Impact: High — reduces stockouts and interruptions in experiments.
- Estimate: Medium (2–4 weeks MVP)
- Dependencies: Historical transaction data (existing), scheduled job runner / backend cron, notification system (email/in-app/toast).
- MVP tasks:
  - Add historical aggregation API endpoint
  - Implement simple forecasting algorithm on server (moving average)
  - UI: Forecast panel on chemical/equipment pages + low stock badge
  - Notification: in-app alert + optional email
- Acceptance criteria: Forecast and notice appear for items with predictably low stock; test coverage for forecast function.

---

### 2) Protocol Editor + Versioning
- Description: WYSIWYG protocol editor (steps, materials, timings) with versioning and compare view.
- User stories: "As a researcher, I want to edit protocols and preserve previous versions so I can reproduce experiments." 
- Impact: High — improves reproducibility and collaboration.
- Estimate: Medium (3–5 weeks)
- Dependencies: Rich text editor (e.g., tiptap, slate), backend to store versions, diff/compare UI.
- MVP tasks:
  - Add `protocols/:id/edit` UI using a lightweight editor
  - Save snapshots as versions with metadata (author, timestamp)
  - Add a version history modal and simple compare (show both side-by-side)
- Acceptance criteria: Users can create/edit protocols, view history and restore versions.

---

### 3) Mobile Offline Mode (PWA enhancements)
- Description: Improve offline functionality: caching critical routes, background sync for queued actions (forms, sample counts), and enhanced service worker strategy.
- User stories: "As a field technician, I can record sample counts even without connectivity and sync later." 
- Impact: High — enables real-world lab/greenhouse usage.
- Estimate: Large (4–8 weeks)
- Dependencies: Service worker improvements, local queue storage, conflict resolution strategy, UI for offline state.
- MVP tasks:
  - Cache key pages and static assets (already started), add offline indicators
  - Implement local queue for actions, sync on reconnect
  - Add conflict resolution UI for sync errors
- Acceptance criteria: Data created offline is synced when connectivity returns and user is notified of conflicts.

---

### 4) Sample Barcoding & QR Workflow
- Description: Generate/print QR codes for samples and batches; scanning attaches metadata and quick access.
- Impact: Medium-high (operational efficiency)
- Estimate: Medium
- MVP tasks: QR generation, simple scanner view (camera/web), link scan → open sample detail.

---

### 5) Scheduling & Resource Booking (Equipment Calendar)
- Description: Reserve equipment (microscopes, hoods) with availability calendars and automated reminders.
- Impact: Medium
- Estimate: Medium

---

### 6) Audit Log & Compliance Mode
- Description: Immutable audit trail for critical actions (create/update/delete) + exportable logs for auditors.
- Impact: Regulatory readiness, high trust
- Estimate: Medium

---

### 7) Role-based Access Control (RBAC) Policies
- Description: Fine-grained roles and permissions for features; tenant/admin separation for deployments.
- Impact: Medium
- Estimate: Medium

---

### 8) Automated Report Generator (PDF/CSV) & Scheduled Exports
- Description: Scheduled or on-demand reports (e.g., monthly usage, experiment summaries) in PDF/CSV.
- Impact: Medium
- Estimate: Small–Medium

---

### 9) Real-time Collaboration (Presence, Editing) [Stretch]
- Description: Presence indicators, collaborative editing for protocols (OT or CRDT) — long-term.
- Impact: High for larger teams
- Estimate: Large

---

### 10) Integrations & Data Export (LIMS / ERP / APIs)
- Description: Add connectors to common systems, offer a stable public REST API and webhook events.
- Impact: High for enterprise customers
- Estimate: Medium–Large

---

## Prioritization rationale
- Focus early wins on features that reduce operational friction (forecasting, offline) and improve reproducibility (protocols). These provide immediate ROI and increase product stickiness.
- Mid-term: scheduling, barcoding and RBAC improve scale and operational maturity.
- Long-term: real-time collaboration, full LIMS integration for enterprise adoption.

---

## Implementation roadmap (recommended)
- Sprint 1 (1–3 weeks): Inventory Forecasting MVP + in-app notification
- Sprint 2 (2–4 weeks): Protocol Editor MVP + version history
- Sprint 3 (3–6 weeks): PWA offline queue & sync (critical routes cached)
- Sprint 4+ (ongoing): Barcoding, scheduling, audit logs, RBAC, exports

---

## Quick metrics to measure success
- Forecasting: reduction in stockouts by X% (track pre/post), increased on-time reorder rate
- Protocol Editor: number of protocol versions saved, time-to-protocol-publish
- Offline Mode: % of actions queued offline and successful sync rate

---

## Risks & mitigations
- Data conflicts (offline sync) — Add clear conflict UI and last-write strategies; surface merge suggestions.
- Complexity of editor/versioning — MVP uses snapshots first; defer CRDT real-time editing to later.
- Privacy/regulatory requirements — plan for audit logs and RBAC early when collecting sensitive ops data.

---

## Takeaway & next steps ✅
- Immediate suggestion: start with **Inventory Forecasting** (quick win) and **Protocol Editor** (researcher value). 
- If you'd like, I can: create a scoped RFC for the selected feature, wire up backlog tasks, and implement the MVP (PR + tests).

---

*Document created by development assistant — add comments or pick one item and I’ll scaffold an implementation plan and tasks.*
