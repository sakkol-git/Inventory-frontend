# Seedling Growth Tracking Feature — Design Document

**Version:** 1.0  
**Last Updated:** 2025-01-06  
**Status:** Implemented (Phase 1) | Enhancement Opportunities Identified

---

## Executive Summary

The **Seedling Growth Tracking** feature enables researchers to monitor and record the week-by-week growth progress of plant experiments. This system provides comprehensive data capture, automatic calculations, visual analytics, and historical tracking capabilities.

### Key Capabilities
- ✅ **Week-by-week data entry** via structured form interface
- ✅ **Automatic calculations** for survival rate and multiplication rate
- ✅ **Visual analytics** with interactive growth charts
- ✅ **Historical tracking** via sortable data table
- ✅ **Health monitoring** with 10-point scoring system
- ✅ **Growth stage tracking** across propagation lifecycle
- ⚠️ **Current limitation:** Append-only logs (no edit/delete)

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Data Model](#2-data-model)
3. [User Interface Components](#3-user-interface-components)
4. [User Workflows](#4-user-workflows)
5. [Technical Implementation](#5-technical-implementation)
6. [Current Limitations](#6-current-limitations)
7. [Proposed Enhancements](#7-proposed-enhancements)
8. [Future Roadmap](#8-future-roadmap)

---

## 1. System Architecture

### 1.1 Component Hierarchy

```
ExperimentDetail.tsx (Composition Root)
  └─ ExperimentDetailRenderer.tsx
      ├─ DetailLayout<DetailSection>
      │   ├─ Hero Section (experiment metadata)
      │   ├─ Stats Section (computed KPIs)
      │   └─ Growth Tracking Sections:
      │       ├─ GrowthCurveRenderer
      │       │   └─ GrowthChart (visualization)
      │       ├─ GrowthLogFormRenderer
      │       │   └─ GrowthLogForm (CRUD interface)
      │       └─ GrowthLogTableRenderer
      │           └─ Table (historical data)
      └─ useExperimentDetail.tsx (state management)
```

### 1.2 Data Flow

```
User Input (GrowthLogForm)
  ↓
Form Validation (client-side)
  ↓
handleAddLog callback (useExperimentDetail)
  ↓
Generate ID + Timestamp
  ↓
Update logs state (React useState)
  ↓
Re-compute Stats (useMemo)
  ↓
Update UI (GrowthChart + GrowthLogTable)
```

### 1.3 State Management

**Hook:** `useExperimentDetail.tsx`
```typescript
const [logs, setLogs] = useState<GrowthLog[]>([]);
const [showLogForm, setShowLogForm] = useState(false);

const handleAddLog = (logData: Omit<GrowthLog, "id" | "createdAt">) => {
  const newLog: GrowthLog = {
    ...logData,
    id: `GL-${Date.now()}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  setLogs((prev) => [...prev, newLog]);
  setShowLogForm(false);
};
```

**Props Passed to Sections:**
- `logs` — Array of all growth log entries
- `showLogForm` — Boolean toggle for form visibility
- `setShowLogForm` — Callback to show/hide form
- `onSubmit` — Maps to `handleAddLog`

---

## 2. Data Model

### 2.1 GrowthLog Interface

**File:** `src/types/research.ts`

```typescript
export interface GrowthLog {
  // Identifiers
  id: string;                    // Format: GL-{timestamp}
  createdAt: string;             // ISO date string (YYYY-MM-DD)
  recordedBy: string;            // User who recorded the log
  
  // Temporal Data
  weekNumber: number;            // Week 1, 2, 3...
  logDate: string;               // Date of observation (YYYY-MM-DD)
  
  // Seedling Counts
  seedlingCount: number;         // Total seedlings (required)
  aliveCount: number;            // Living seedlings (required)
  deadCount: number;             // Dead seedlings (optional, default: 0)
  newPropagations: number;       // New cuttings/divisions (optional, default: 0)
  
  // Computed Metrics (auto-calculated)
  survivalRatePct: number;       // (aliveCount / seedlingCount) × 100
  multiplicationRate: number;    // (aliveCount + newPropagations) / seedlingCount
  
  // Health Indicators
  healthScore: number;           // 1-10 scale (optional)
  avgHeightCm?: number;          // Average height in cm (optional)
  growthStage: GrowthStage;      // Enum: Propagation | Vegetative | Flowering | etc.
  
  // Observations
  observations: string;          // Freeform text notes
  
  // Environmental Data (optional)
  environmentalData?: {
    temperature?: number;        // Celsius
    humidity?: number;           // Percentage
    lightHours?: number;         // Daily light exposure
    phLevel?: number;            // Soil/water pH
  };
}
```

### 2.2 GrowthStage Enum

```typescript
export type GrowthStage = 
  | "Propagation"      // Week 0-2: Initial rooting/germination
  | "Vegetative"       // Week 3-8: Active growth, leaf development
  | "Pre-Flowering"    // Week 9-12: Bud formation
  | "Flowering"        // Week 13+: Flower development
  | "Fruiting"         // Post-flowering: Seed/fruit production
  | "Senescence";      // End of lifecycle
```

### 2.3 Data Relationships

**Experiment → GrowthLogs (1:N)**
```typescript
interface Experiment {
  id: string;
  title: string;
  initialSeedCount: number;      // Starting seedling count
  currentCount: number;           // Most recent alive count
  finalYield?: number;            // End-of-experiment harvest
  avgSurvivalRate: number;        // Computed from all logs
  multiplicationRate: number;     // Computed from all logs
  // ... other fields
}

// Separate data structure (mockResearchData.ts)
const growthLogsData: Record<string, GrowthLog[]> = {
  "EXP-001": [
    { weekNumber: 1, aliveCount: 95, ... },
    { weekNumber: 2, aliveCount: 92, ... },
    // ...
  ]
};
```

---

## 3. User Interface Components

### 3.1 GrowthLogForm Component

**File:** `src/components/research/GrowthLogForm.tsx` (132 lines)

#### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Add Growth Log                                  │
├─────────────────────────────────────────────────┤
│ Week Number*  | Log Date*     | Growth Stage    │
│ [auto-filled] | [YYYY-MM-DD]  | [dropdown]      │
├─────────────────────────────────────────────────┤
│ Total Seedlings* | Alive* | Dead | New Props   │
│ [   ]            | [   ]  | [  ] | [  ]        │
├─────────────────────────────────────────────────┤
│ Health Score (1-10) | Avg Height (cm)          │
│ [   ]               | [   ]                    │
├─────────────────────────────────────────────────┤
│ Observations                                    │
│ [                                              ]│
├─────────────────────────────────────────────────┤
│                      [Cancel] [Add Log Entry]   │
└─────────────────────────────────────────────────┘
```

#### Field Specifications

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| **Week Number** | number | ✅ | Auto-incremented | Min: 1 |
| **Log Date** | date | ✅ | Today | YYYY-MM-DD format |
| **Growth Stage** | select | ✅ | "Vegetative" | Enum values |
| **Total Seedlings** | number | ✅ | — | Min: 1 |
| **Alive Count** | number | ✅ | — | Min: 0, ≤ Total |
| **Dead Count** | number | ❌ | 0 | Min: 0 |
| **New Propagations** | number | ❌ | 0 | Min: 0 |
| **Health Score** | number | ❌ | — | 1-10 scale |
| **Avg Height** | number | ❌ | — | Min: 0, precision: 0.1 cm |
| **Observations** | textarea | ❌ | "" | Max: 500 chars |

#### Auto-Calculated Fields
```typescript
// Computed during form submission
survivalRatePct = Math.round((aliveCount / seedlingCount) × 100);
multiplicationRate = (aliveCount + newPropagations) / seedlingCount;
```

#### Form Actions
- **Cancel Button** → `setShowLogForm(false)`, resets form state
- **Add Log Entry Button** → Validates inputs → Calls `onSubmit(logData)` → Closes form

---

### 3.2 GrowthChart Component

**File:** `src/components/research/GrowthChart.tsx` (120 lines)

#### Chart Type: Line Chart (Recharts)

**Data Visualization:**
```
┌─────────────────────────────────────────────────┐
│ Seedling Growth Curve                           │
├─────────────────────────────────────────────────┤
│  100 ┤                                          │
│   90 ┤  ●━━●━━●━━●━━●  Total Seedlings          │
│   80 ┤                                          │
│   70 ┤  ●━━●━━●━━●━━●  Alive Count             │
│   60 ┤                                          │
│    0 ┼───┬───┬───┬───┬───                      │
│      W1  W2  W3  W4  W5                         │
└─────────────────────────────────────────────────┘
```

**Data Series:**
1. **Total Seedlings** (Blue line) — `seedlingCount` field
2. **Alive Count** (Green line) — `aliveCount` field

**Features:**
- Responsive width (100% container)
- Fixed height: 300px
- Tooltip on hover (shows week, total, alive)
- X-axis: Week numbers
- Y-axis: Seedling count (auto-scaled)
- Grid lines for readability
- Legend with color-coded series

---

### 3.3 GrowthLogTable Component

**File:** `src/pages/research/experiment-detail/sections/GrowthLogTableRenderer.tsx` (100 lines)

#### Table Columns (10 total)

| Column | Width | Data Type | Formatting | Notes |
|--------|-------|-----------|------------|-------|
| **Week** | 64px | number | Bold, tabular | Week number |
| **Date** | auto | string | Small text | Log date |
| **Total** | center | number | Bold, tabular | Total seedlings |
| **Alive** | center | number | Bold, green | Alive count |
| **Dead** | center | number | Bold, red | Dead count |
| **New** | center | number | Bold, tabular | New propagations |
| **Survival** | center | string | Bold, percentage | Auto-calculated |
| **Health** | center | number | Badge (1-10) | Color-coded score |
| **Stage** | auto | badge | Small text | Growth stage enum |
| **Notes** | 200px | string | Truncated | Observations (max-w-200) |

#### Data Sorting
- **Default sort:** Most recent week first (descending)
- **Visual cues:** Health score color-coded (red < 4, yellow 4-7, green > 7)

#### Layout
```
┌──────┬──────────┬───────┬───────┬──────┬─────┬──────────┬────────┬────────────┬─────────────┐
│ Week │ Date     │ Total │ Alive │ Dead │ New │ Survival │ Health │ Stage      │ Notes       │
├──────┼──────────┼───────┼───────┼──────┼─────┼──────────┼────────┼────────────┼─────────────┤
│  5   │ 2025-01  │  100  │  95   │  5   │  3  │   95%    │ 8/10   │ Vegetative │ Strong...   │
│  4   │ 2024-12  │  100  │  97   │  3   │  2  │   97%    │ 9/10   │ Vegetative │ Healthy...  │
│  3   │ 2024-12  │  100  │  99   │  1   │  1  │   99%    │ 9/10   │ Vegetative │ Excellent.. │
└──────┴──────────┴───────┴───────┴──────┴─────┴──────────┴────────┴────────────┴─────────────┘
```

---

## 4. User Workflows

### 4.1 Creating a New Growth Log Entry

**Precondition:** User navigates to Experiment Detail page

```
1. User clicks "Add Growth Log" button
   ↓
2. Form appears with:
   - Week number auto-filled (last week + 1)
   - Log date defaults to today
   - Growth stage dropdown (default: Vegetative)
   ↓
3. User enters required data:
   - Total seedlings count
   - Alive count
   ↓
4. User enters optional data:
   - Dead count
   - New propagations
   - Health score (1-10)
   - Average height (cm)
   - Observations (text)
   ↓
5. User clicks "Add Log Entry"
   ↓
6. System validates inputs:
   - Required fields present?
   - Alive count ≤ Total count?
   - Health score 1-10 range?
   ↓
7. System auto-calculates:
   - Survival rate % = (alive / total) × 100
   - Multiplication rate = (alive + new) / total
   ↓
8. System saves log entry:
   - Generates ID (GL-{timestamp})
   - Sets createdAt to current date
   - Appends to logs array
   ↓
9. UI updates:
   - Form closes
   - New data point appears in chart
   - New row appears in table (top position)
   - Stats section recalculates averages
   ↓
10. Success feedback (implicit — form closes)
```

**Edge Cases:**
- **No previous logs?** Week number defaults to 1
- **Invalid input?** Form shows inline validation errors
- **Network failure?** (Currently client-side only — no backend persistence)

---

### 4.2 Viewing Growth History

**Scenario A: Visual Analysis**
```
User scrolls to "Growth Curve" section
  ↓
Views line chart with:
  - Total seedlings trend (blue line)
  - Alive count trend (green line)
  - Week-by-week progression
  ↓
Hovers over data points for exact values
```

**Scenario B: Detailed Review**
```
User scrolls to "Growth Log Table" section
  ↓
Views tabular data with:
  - All recorded weeks (newest first)
  - 10 columns of metrics
  - Health score color indicators
  - Truncated observations (hover for full text)
  ↓
Identifies trends:
  - Declining survival rate?
  - Health score patterns?
  - Growth stage transitions?
```

---

### 4.3 Analyzing Experiment Performance

**Computed Stats (Auto-Updated)**

The Stats section at top of page shows:
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Initial Count   │ Current Count   │ Avg Survival    │ Multiplication  │
│ 100 seedlings   │ 95 alive        │ 96.4%           │ 1.08×           │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Calculation Logic:**
```typescript
// Stats computed from logs array (domain.ts)
const avgSurvivalRate = logs.reduce((sum, log) => 
  sum + log.survivalRatePct, 0) / logs.length;

const avgMultiplicationRate = logs.reduce((sum, log) => 
  sum + log.multiplicationRate, 0) / logs.length;

const currentCount = logs[logs.length - 1]?.aliveCount ?? initialSeedCount;
```

---

## 5. Technical Implementation

### 5.1 File Structure

```
src/
├── types/
│   └── research.ts                     # GrowthLog interface definition
├── components/
│   └── research/
│       ├── GrowthLogForm.tsx           # CRUD form component (132 lines)
│       └── GrowthChart.tsx             # Recharts visualization (120 lines)
├── pages/
│   └── research/
│       ├── ExperimentDetail.tsx        # Composition root (40 lines)
│       └── experiment-detail/
│           ├── types.ts                # Section discriminated unions (155 lines)
│           ├── domain.ts               # Pure computation functions (98 lines)
│           ├── useExperimentDetail.tsx # State management hook (298 lines)
│           ├── ExperimentDetailRenderer.tsx # Main renderer (28 lines)
│           ├── sectionRegistry.ts      # Section renderer mapping (47 lines)
│           └── sections/
│               ├── GrowthCurveRenderer.tsx     # Chart wrapper (18 lines)
│               ├── GrowthLogFormRenderer.tsx   # Form wrapper (26 lines)
│               └── GrowthLogTableRenderer.tsx  # Table display (100 lines)
└── data/
    └── mockResearchData.ts             # Mock data for experiments + logs
```

### 5.2 Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 18.3.1 |
| **TypeScript** | Type safety | 5.8.3 |
| **Recharts** | Chart visualization | Latest |
| **Shadcn/UI** | Component library | Latest |
| **React Hook Form** | Form state management | Used in GrowthLogForm |
| **Tailwind CSS** | Styling | Latest |

### 5.3 State Management Pattern

**Discriminated Union Architecture:**
```typescript
// types.ts
export type DetailSection =
  | { readonly kind: "hero"; /* ... */ }
  | { readonly kind: "stats"; /* ... */ }
  | { readonly kind: "growthCurve"; logs: GrowthLog[]; }
  | { readonly kind: "growthLogForm"; 
      showForm: boolean;
      onToggle: () => void;
      onSubmit: (data) => void; }
  | { readonly kind: "growthLogTable"; rows: GrowthLogRow[]; };
```

**Section Registry Pattern:**
```typescript
// sectionRegistry.ts
export const sectionRegistry = {
  growthCurve: GrowthCurveRenderer,
  growthLogForm: GrowthLogFormRenderer,
  growthLogTable: GrowthLogTableRenderer,
  // ...
} satisfies SectionRendererMap<DetailSection>;
```

**Generic DetailLayout:**
```typescript
// ExperimentDetailRenderer.tsx
export const ExperimentDetailRenderer = ({ config }: Props) => (
  <DetailLayout<DetailSection>
    header={config.header}
    heroImage={config.heroImage}
    sections={config.sections}
    sectionDispatch={createSectionDispatch(sectionRegistry)}
  />
);
```

### 5.4 Data Persistence (Current State)

⚠️ **Client-Side Only:**
```typescript
// useExperimentDetail.tsx
const [logs, setLogs] = useState<GrowthLog[]>(
  id && growthLogsData[id] ? [...growthLogsData[id]] : []
);
```

**Current Behavior:**
- Data loaded from `mockResearchData.ts` on component mount
- New logs added to React state only
- ❌ **No backend persistence**
- ❌ **No localStorage fallback**
- ❌ **Data lost on page refresh**

**Implications:**
- Suitable for prototype/demo
- Requires backend integration for production use
- Need API endpoints for CRUD operations

---

## 6. Current Limitations

### 6.1 Functional Gaps

| Limitation | Impact | Priority |
|------------|--------|----------|
| **No edit capability** | Cannot fix data entry errors | 🔴 High |
| **No delete capability** | Cannot remove incorrect logs | 🔴 High |
| **Append-only logs** | Poor data quality management | 🔴 High |
| **No data persistence** | Lost on refresh | 🔴 High |
| **No photo upload** | Missing visual tracking | 🟡 Medium |
| **No environmental tracking** | Limited context data | 🟡 Medium |
| **No CSV import** | Manual data entry only | 🟡 Medium |
| **No data export** | Cannot share/archive data | 🟡 Medium |
| **No batch operations** | Tedious for multiple weeks | 🟢 Low |
| **No mobile optimization** | Desktop-only UX | 🟢 Low |

### 6.2 UX Issues

**Form Usability:**
- Week number auto-increment assumes sequential entry (breaks if user skips weeks)
- No confirmation dialog after successful submission
- No undo functionality
- No draft saving for incomplete entries

**Table Limitations:**
- Observations column truncated (no modal/tooltip for full text)
- No sorting controls (fixed newest-first)
- No filtering by date range or growth stage
- No pagination (performance issue with 50+ logs)

**Chart Limitations:**
- Only 2 data series (total, alive) — no dead count, health score, or height trends
- No zoom/pan controls for long experiments
- No export to image functionality
- No comparison with other experiments

---

## 7. Proposed Enhancements

### 7.1 Phase 2: Core CRUD Operations

**Epic:** Enable full data lifecycle management

#### User Story 1: Edit Existing Log
```
As a researcher,
I want to edit a previously recorded growth log,
So that I can correct data entry mistakes.
```

**Acceptance Criteria:**
- [x] Each table row has "Edit" button
- [x] Clicking "Edit" loads log data into form
- [x] Form shows "Update Log Entry" title instead of "Add"
- [x] Saving replaces existing log (keeps same ID)
- [x] Chart and stats update automatically

**Technical Changes:**
```typescript
// useExperimentDetail.tsx
const [editingLogId, setEditingLogId] = useState<string | null>(null);

const handleEditLog = (id: string, logData: Partial<GrowthLog>) => {
  setLogs((prev) => prev.map(log => 
    log.id === id ? { ...log, ...logData } : log
  ));
  setEditingLogId(null);
  setShowLogForm(false);
};
```

---

#### User Story 2: Delete Log Entry
```
As a researcher,
I want to delete an incorrect growth log,
So that my data remains accurate.
```

**Acceptance Criteria:**
- [x] Each table row has "Delete" button (trash icon)
- [x] Clicking "Delete" shows confirmation dialog
- [x] Confirming deletes log and updates UI
- [x] Stats recalculate automatically
- [x] Action is irreversible (unless undo feature added)

**Technical Changes:**
```typescript
// useExperimentDetail.tsx
const handleDeleteLog = (id: string) => {
  if (confirm('Delete this growth log? This action cannot be undone.')) {
    setLogs((prev) => prev.filter(log => log.id !== id));
  }
};
```

---

### 7.2 Phase 3: Data Persistence

**Epic:** Backend integration for production use

#### User Story 3: Save Logs to Database
```
As a researcher,
I want my growth logs saved permanently,
So that I don't lose data when I close my browser.
```

**Implementation Strategy:**

**Backend API Endpoints:**
```
POST   /api/experiments/:id/growth-logs       # Create new log
GET    /api/experiments/:id/growth-logs       # Fetch all logs
PUT    /api/experiments/:id/growth-logs/:logId # Update existing log
DELETE /api/experiments/:id/growth-logs/:logId # Delete log
```

**Frontend Changes:**
```typescript
// api/growthLogs.ts
export const growthLogApi = {
  create: async (experimentId: string, data: Omit<GrowthLog, "id" | "createdAt">) => {
    const res = await fetch(`/api/experiments/${experimentId}/growth-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  fetchAll: async (experimentId: string) => {
    const res = await fetch(`/api/experiments/${experimentId}/growth-logs`);
    return res.json();
  },
  
  update: async (experimentId: string, logId: string, data: Partial<GrowthLog>) => {
    const res = await fetch(`/api/experiments/${experimentId}/growth-logs/${logId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  delete: async (experimentId: string, logId: string) => {
    await fetch(`/api/experiments/${experimentId}/growth-logs/${logId}`, {
      method: 'DELETE',
    });
  },
};
```

**Hook Integration:**
```typescript
// useExperimentDetail.tsx
const [logs, setLogs] = useState<GrowthLog[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchLogs = async () => {
    if (id) {
      const data = await growthLogApi.fetchAll(id);
      setLogs(data);
      setLoading(false);
    }
  };
  fetchLogs();
}, [id]);

const handleAddLog = async (logData: Omit<GrowthLog, "id" | "createdAt">) => {
  const newLog = await growthLogApi.create(id, logData);
  setLogs((prev) => [...prev, newLog]);
  setShowLogForm(false);
};
```

---

### 7.3 Phase 4: Advanced Features

#### Feature 1: Photo Upload
**User Story:**
```
As a researcher,
I want to attach photos to each growth log,
So that I can visually track plant development over time.
```

**Data Model Update:**
```typescript
export interface GrowthLog {
  // ... existing fields
  photos?: {
    id: string;
    url: string;
    thumbnailUrl: string;
    caption?: string;
    uploadedAt: string;
  }[];
}
```

**UI Changes:**
- Add file upload input to GrowthLogForm
- Display photo gallery in GrowthLogTable (lightbox modal)
- Show thumbnail preview in form before submission

---

#### Feature 2: Environmental Data Capture
**User Story:**
```
As a researcher,
I want to record environmental conditions with each log,
So that I can correlate growth with temperature, humidity, etc.
```

**Form Enhancement:**
```typescript
// GrowthLogForm.tsx - Add collapsible "Environmental Data" section
<Collapsible>
  <CollapsibleTrigger>Environmental Data (Optional)</CollapsibleTrigger>
  <CollapsibleContent>
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Temperature (°C)" type="number" />
      <FormField label="Humidity (%)" type="number" />
      <FormField label="Light Hours" type="number" />
      <FormField label="pH Level" type="number" step="0.1" />
    </div>
  </CollapsibleContent>
</Collapsible>
```

---

#### Feature 3: CSV Bulk Import
**User Story:**
```
As a researcher,
I want to import growth logs from a CSV file,
So that I can migrate existing data from spreadsheets.
```

**CSV Format:**
```csv
Week,Date,Total,Alive,Dead,New,Health,Height,Stage,Notes
1,2025-01-01,100,98,2,0,9,5.2,Propagation,Initial setup
2,2025-01-08,100,96,4,2,8,6.1,Propagation,Good growth
```

**Implementation:**
- Add "Import CSV" button in GrowthLogTable header
- File upload modal with preview/validation
- Map CSV columns to GrowthLog fields
- Batch create API endpoint

---

#### Feature 4: Data Export & Reporting
**User Story:**
```
As a researcher,
I want to export growth logs to PDF/Excel,
So that I can share results with colleagues.
```

**Export Options:**
1. **CSV Export** — All table data with computed fields
2. **PDF Report** — Chart + Table + Summary stats
3. **Excel Workbook** — Multiple sheets (logs, stats, charts)

**Implementation:**
- Use `react-to-pdf` or `jspdf` for PDF generation
- Use `xlsx` library for Excel export
- Add "Export" dropdown menu in DetailHeader

---

### 7.4 Phase 5: Analytics & Intelligence

#### Feature 5: Predictive Analytics
**User Story:**
```
As a researcher,
I want to see growth predictions based on historical trends,
So that I can anticipate future seedling counts.
```

**Implementation:**
- Linear regression on alive count trend
- Forecast next 2-4 weeks with confidence interval
- Display as dotted line in GrowthChart
- Alert if predicted survival rate drops below threshold

---

#### Feature 6: Experiment Comparison
**User Story:**
```
As a researcher,
I want to compare growth logs across multiple experiments,
So that I can identify best-performing treatments.
```

**UI Design:**
```
┌──────────────────────────────────────────────────────┐
│ Compare Experiments                                  │
├──────────────────────────────────────────────────────┤
│ Select experiments to compare:                       │
│ ☑ EXP-001: Hydroponic Basil                         │
│ ☑ EXP-002: Soil Basil (Control)                     │
│ ☐ EXP-003: LED Growth Test                          │
├──────────────────────────────────────────────────────┤
│ [Overlay Chart: Multi-line with color-coded series] │
├──────────────────────────────────────────────────────┤
│ Side-by-side Stats Comparison Table                 │
└──────────────────────────────────────────────────────┘
```

---

## 8. Future Roadmap

### Short-Term (Next 2 Sprints)
- ✅ **Phase 1:** Current implementation (COMPLETE)
- 🔄 **Phase 2:** Edit/Delete CRUD operations (IN PROGRESS)
- 📋 **Phase 3:** Backend persistence + API integration

### Mid-Term (Next Quarter)
- 📋 **Phase 4:** Photo upload, environmental tracking, CSV import/export
- 📋 Mobile-responsive form layout
- 📋 Advanced table features (sorting, filtering, pagination)

### Long-Term (Next 6 Months)
- 📋 **Phase 5:** Predictive analytics, experiment comparison
- 📋 Automated alerts (low survival rate, health score drop)
- 📋 Integration with inventory system (seedling transfers)
- 📋 Machine learning for growth stage recommendations

---

## Appendix A: Mock Data Example

**File:** `src/data/mockResearchData.ts`

```typescript
export const growthLogsData: Record<string, GrowthLog[]> = {
  "EXP-001": [
    {
      id: "GL-001",
      weekNumber: 1,
      logDate: "2024-12-01",
      seedlingCount: 100,
      aliveCount: 98,
      deadCount: 2,
      newPropagations: 0,
      survivalRatePct: 98,
      multiplicationRate: 0.98,
      healthScore: 9,
      avgHeightCm: 5.2,
      growthStage: "Propagation",
      observations: "Initial setup complete. Strong root development.",
      recordedBy: "Dr. Sarah Chen",
      createdAt: "2024-12-01",
    },
    {
      id: "GL-002",
      weekNumber: 2,
      logDate: "2024-12-08",
      seedlingCount: 100,
      aliveCount: 96,
      deadCount: 4,
      newPropagations: 2,
      survivalRatePct: 96,
      multiplicationRate: 0.98,
      healthScore: 8,
      avgHeightCm: 6.1,
      growthStage: "Propagation",
      observations: "Good growth rate. 2 seedlings showing stress.",
      recordedBy: "Dr. Sarah Chen",
      createdAt: "2024-12-08",
    },
    // ... weeks 3-12
  ],
};
```

---

## Appendix B: Component API Reference

### GrowthLogForm Props

```typescript
interface GrowthLogFormProps {
  onSubmit: (data: Omit<GrowthLog, "id" | "createdAt">) => void;
  onCancel: () => void;
  defaultWeekNumber?: number;  // Auto-calculated if omitted
  editingLog?: GrowthLog;      // For edit mode (Phase 2)
}
```

### GrowthChart Props

```typescript
interface GrowthChartProps {
  logs: GrowthLog[];
  height?: number;             // Default: 300px
  showDeadCount?: boolean;     // Add third line series (Phase 4)
  showHealthScore?: boolean;   // Add secondary Y-axis (Phase 4)
}
```

### GrowthLogTable Props

```typescript
interface GrowthLogTableProps {
  rows: GrowthLogRow[];
  onEdit?: (id: string) => void;    // Phase 2
  onDelete?: (id: string) => void;  // Phase 2
  sortable?: boolean;               // Phase 4
  filterable?: boolean;             // Phase 4
}
```

---

## Appendix C: Testing Checklist

### Unit Tests
- [x] GrowthLogForm validation logic
- [x] Auto-calculation functions (survivalRatePct, multiplicationRate)
- [x] useExperimentDetail hook state management
- [ ] Edit/delete operations (Phase 2)

### Integration Tests
- [x] Form submission → State update → UI refresh
- [x] Chart data binding with logs array
- [x] Table sorting and rendering
- [ ] API integration (Phase 3)

### E2E Tests (Playwright)
- [ ] Complete workflow: Add log → View chart → View table
- [ ] Edit workflow: Edit log → Save → Verify changes (Phase 2)
- [ ] Delete workflow: Delete log → Confirm → Verify removal (Phase 2)
- [ ] CSV import → Validate data → Save to database (Phase 4)

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-06 | AI Assistant | Initial documentation of existing Phase 1 implementation + proposed enhancements |

---

**Questions or feedback?** Contact the development team or create an issue in the project repository.
