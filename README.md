# ⚡ FlowForge — HR Workflow Designer

> A production-grade, visual HR workflow designer built with React, TypeScript, and React Flow. Design, configure, and simulate internal HR processes like employee onboarding, leave approvals, and document verification — all in a drag-and-drop canvas interface.

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18  |  npm ≥ 9

### Installation & Dev Server
```bash
git clone https://github.com/your-username/hr-workflow-designer.git
cd hr-workflow-designer
npm install
npm run dev
# → http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🗂️ Project Structure

```
src/
├── api/
│   └── index.ts              # Mock API layer (fetchAutomations, simulateWorkflow)
├── components/
│   ├── nodes/
│   │   ├── BaseNode.tsx      # Shared node wrapper with handles & header stripe
│   │   └── WorkflowNodes.tsx # 5 custom node components (Start/Task/Approval/Auto/End)
│   ├── panels/
│   │   ├── NodeEditPanel.tsx # Right-side configuration form panel
│   │   └── SandboxPanel.tsx  # Simulation modal with step-by-step log
│   ├── sidebar/
│   │   └── Sidebar.tsx       # Node palette, stats counter, workflow actions
│   └── ui/
│       ├── TopBar.tsx        # Header with validation status & run button
│       └── EmptyCanvas.tsx   # Placeholder shown on empty canvas
├── hooks/
│   ├── useAutomations.ts     # Fetches mock automation actions
│   └── useSimulation.ts      # Drives simulation with animated step reveal
├── store/
│   └── workflowStore.ts      # Zustand global state — all mutations live here
├── types/
│   └── index.ts              # All TypeScript interfaces and types
├── App.tsx                   # Root: React Flow canvas + drag-drop wiring
├── main.tsx                  # Entry point
└── index.css                 # CSS variables, Tailwind, React Flow overrides
```

---

## 🧱 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | React 19 + TypeScript | Component model, type safety |
| Build Tool | Vite 8 | Fast HMR, tree-shaken production bundles |
| Canvas | `@xyflow/react` v12 | Production-grade flow graph renderer |
| State | Zustand | Minimal, scalable global state without boilerplate |
| Styling | Tailwind CSS v4 + CSS Variables | Utility classes + design token system |
| Icons | Lucide React | Consistent, lightweight icon set |
| IDs | `uuid` v4 | Collision-free node/edge identifiers |
| Mock API | In-memory functions with setTimeout | No backend needed for prototype |

---

## 🧩 Node Types

### 🟢 Start Node
Entry point — every workflow must begin here. Holds a workflow title and optional metadata key-value pairs. Only **one** Start Node allowed per workflow.

### 🔵 Task Node
Represents a human task (e.g., collect documents, fill a form). Fields: title (required), description, assignee, due date, custom key-value fields.

### 🟡 Approval Node
Routes the workflow through a manager or HR approval step. Fields: title, approver role (Manager / HRBP / Director / VP / CEO / Legal), auto-approve threshold (%).

### 🟣 Automated Step Node
System-triggered action. Fields: title, action picker (from mock API), dynamic parameter inputs per action. Available actions: Send Email, Generate Document, Send Slack Message, Create JIRA Ticket, Update HRIS Record, Schedule Meeting, Send SMS, Trigger Webhook.

### 🔴 End Node
Marks workflow completion. Fields: end message, show summary toggle. At least **one** End Node required.

---

## 🔌 Mock API Layer (`src/api/index.ts`)

Simulates a real REST backend — no server required.

### `GET /automations`
Returns available automation actions with their parameter signatures:
```json
[
  { "id": "send_email",   "label": "Send Email",        "params": ["to", "subject", "body"] },
  { "id": "generate_doc", "label": "Generate Document", "params": ["template", "recipient"] },
  { "id": "send_slack",   "label": "Send Slack Message","params": ["channel", "message"] }
]
```

### `POST /simulate`
Accepts the full graph and returns a step-by-step execution log:
```json
{
  "success": true,
  "steps": [
    {
      "nodeId": "abc-123",
      "nodeType": "startNode",
      "label": "Onboarding Start",
      "status": "success",
      "message": "Workflow initiated: \"Onboarding Start\"",
      "duration": 312
    }
  ],
  "errors": [],
  "summary": "Workflow executed successfully across 4 step(s)."
}
```

The simulate function also performs:
- **Structural validation** — checks for Start/End nodes, disconnected nodes
- **Cycle detection** — DFS with recursion stack (enforces DAG)
- **Topological sort** — Kahn's BFS algorithm for correct execution order

---

## 🏗️ Architecture & Design Decisions

### State Management — Zustand
A single flat store (`workflowStore.ts`) holds all workflow state and exposes action methods. React Flow's `applyNodeChanges` / `applyEdgeChanges` helpers are called directly inside the store, keeping all mutation logic in one place. Components stay lean — they call store actions, not manage their own state.

### Node Data Typing
Each node type has its own strongly-typed data interface (`StartNodeData`, `TaskNodeData`, etc.) that extends `Record<string, unknown>` (required by React Flow's generic constraint). Node components receive `data` as `unknown` from React Flow's `NodeProps` and cast locally — a pragmatic trade-off that avoids complex generic gymnastics while retaining type safety within each component.

### Form Design — Controlled Components
Every form in `NodeEditPanel` uses controlled inputs wired directly to `updateNodeData()` in the Zustand store. Changes reflect on the canvas node immediately — no save button needed. The `AutomatedForm` dynamically renders parameter inputs based on whichever action is selected. When the action changes, params are cleanly reset.

### Mock API Abstraction
The API layer is fully in-memory. Switching to a real backend requires only replacing function implementations in `src/api/index.ts` — all hooks (`useAutomations`, `useSimulation`) and components are already coded against the interface.

### Graph Algorithms
- **Cycle Detection:** Depth-first search with a recursion stack (`hasCycle`)
- **Execution Order:** Kahn's BFS topological sort for correct step sequencing
- **Disconnected node detection:** Set intersection over edge source/target IDs

### Component Decomposition
```
App.tsx              → React Flow canvas wiring + drag-drop handlers
├── Sidebar          → Node palette (draggable) + workflow action buttons
├── Canvas (RF)      → Renders all custom nodes and animated edges
│   ├── StartNode    → Built on BaseNode
│   ├── TaskNode
│   ├── ApprovalNode
│   ├── AutomatedNode
│   └── EndNode
├── NodeEditPanel    → Conditional right panel with per-type form
└── SandboxPanel     → Modal overlay with simulation runner + step log
```

---

## ✅ Features Implemented

- [x] Drag-and-drop nodes from sidebar palette onto canvas
- [x] Connect nodes with animated dashed edges
- [x] Click node to open configuration form panel
- [x] Delete nodes/edges (Delete key or Delete button)
- [x] Duplicate node
- [x] Per-node configuration forms for all 5 node types
- [x] Dynamic parameter fields in Automated Step (driven by mock API)
- [x] Key-value pair editor for metadata and custom fields
- [x] Workflow validation — Start/End presence, connectivity, cycle detection
- [x] Simulation sandbox with animated step-by-step execution log
- [x] Export workflow as downloadable JSON file
- [x] Import workflow from a JSON file
- [x] Clear canvas with confirmation dialog
- [x] Live node/edge count stats in sidebar
- [x] MiniMap with per-type colour coding
- [x] Zoom controls (bottom-right)
- [x] Empty canvas placeholder with usage hints

---

## 🔮 What I'd Add With More Time

| Feature | Notes |
|---|---|
| **Undo / Redo** | Command pattern over Zustand store |
| **Auto-layout** | Dagre or ELK.js for automatic DAG arrangement |
| **Conditional edges** | Branching logic (e.g., Approved → onboard, Rejected → notify) |
| **Node templates** | One-click scaffold for "Employee Onboarding" etc. |
| **Backend persistence** | FastAPI + PostgreSQL via SQLAlchemy |
| **Real-time collab** | WebSocket-based multi-user editing |
| **Unit tests** | Jest + React Testing Library for store logic and forms |
| **E2E tests** | Playwright for drag-drop and simulation flows |
| **Visual validation** | Error/warning badges rendered directly on invalid nodes |
| **Workflow versioning** | Save snapshots and diff between versions |

---

## 📝 Assumptions

- No authentication or user system required (as stated in the brief)
- All data is in-memory — refreshing resets state (intentional for a prototype)
- Mock simulate always returns success for structurally valid graphs
- Tailwind v4 (`@tailwindcss/vite` plugin) used — no `tailwind.config.js` needed
- React Flow v12 (`@xyflow/react`) API is used, which differs from v11 (`reactflow`)

---

*Built as a case study submission for **Tredence Studio — AI Agents Engineering Internship 2025**.*  
*Stack: React 19 · TypeScript · Vite 8 · @xyflow/react v12 · Zustand · Tailwind CSS v4*
