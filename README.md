# FlowForge — HR Workflow Designer

FlowForge is a visual HR workflow designer built with React 19, TypeScript, and React Flow. It lets you drag, connect, and configure workflow nodes on a canvas to model HR processes like employee onboarding, leave approvals, and document verification — with built-in validation, cycle detection, and a step-by-step simulation sandbox. No backend required; all data is in-memory.

---

## Getting Started

**Prerequisites** — Node.js 18 or higher, npm 9 or higher.

**Install and run:**
```bash
git clone https://github.com/your-username/hr-workflow-designer.git
cd hr-workflow-designer
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

**For production:**
```bash
npm run build
npm run preview
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Canvas | @xyflow/react v12 |
| State | Zustand |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| IDs | uuid v4 |
| Mock API | In-memory functions with setTimeout |

---

## Project Structure

```
src/
├── api/
│   └── index.ts              # Mock API layer (fetchAutomations, simulateWorkflow)
├── components/
│   ├── nodes/
│   │   ├── BaseNode.tsx      # Shared node wrapper with handles and header stripe
│   │   └── WorkflowNodes.tsx # 5 custom node components (Start/Task/Approval/Auto/End)
│   ├── panels/
│   │   ├── NodeEditPanel.tsx # Right-side configuration form panel
│   │   └── SandboxPanel.tsx  # Simulation modal with step-by-step log
│   ├── sidebar/
│   │   └── Sidebar.tsx       # Node palette, stats counter, workflow actions
│   └── ui/
│       ├── TopBar.tsx        # Header with validation status and run button
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

## Project Flow

1. User drags a node from the sidebar palette onto the canvas.
2. App.tsx handles the drop event and creates a node via workflowStore.
3. The node renders using one of 5 typed components built on BaseNode.
4. User clicks a node to open NodeEditPanel — controlled inputs call updateNodeData() live.
5. User connects nodes with edges; React Flow emits onConnect and the store records them.
6. TopBar validates the graph — checks for Start/End presence, disconnected nodes, and cycles (DFS).
7. User runs the simulation — SandboxPanel calls POST /simulate and useSimulation reveals each step in order using Kahn's topological sort.

---

## API Endpoints (Mock)

### GET /automations

Returns available automation actions with their parameter signatures. Used by the Automated Step node to populate the action picker and render dynamic parameter inputs.

```json
[
  { "id": "send_email",   "label": "Send Email",        "params": ["to", "subject", "body"] },
  { "id": "generate_doc", "label": "Generate Document", "params": ["template", "recipient"] },
  { "id": "send_slack",   "label": "Send Slack Message","params": ["channel", "message"] }
]
```

Available actions: Send Email, Generate Document, Send Slack Message, Create JIRA Ticket, Update HRIS Record, Schedule Meeting, Send SMS, Trigger Webhook.

### POST /simulate

Accepts the full graph and returns a step-by-step execution log. Also performs structural validation, cycle detection (DFS), and topological sort (Kahn's BFS) before executing.

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

---

## Implemented

**Canvas and nodes**
- Drag-and-drop nodes from the sidebar palette onto the canvas
- 5 node types: Start, Task, Approval, Automated Step, End
- Connect nodes with animated dashed edges
- Delete nodes and edges via Delete key or Delete button
- Duplicate node
- MiniMap with per-type colour coding
- Zoom controls and empty canvas placeholder

**Configuration**
- Per-node configuration forms for all 5 node types
- Dynamic parameter fields in Automated Step node driven by mock API
- Key-value pair editor for metadata and custom fields
- Live updates — no save button needed

**Workflow actions**
- Validation — checks for Start/End presence, connectivity, and cycle detection
- Simulation sandbox with animated step-by-step execution log
- Export workflow as downloadable JSON
- Import workflow from a JSON file
- Clear canvas with confirmation dialog
- Live node and edge count in sidebar

---

## Roadmap

**Custom nodes and templates**
- User-defined node types with configurable shapes, colours, and fields
- One-click workflow templates for common HR processes (Employee Onboarding, Leave Approval, Exit Checklist)
- Node template library with save and reuse support
- Visual node grouping and subflow containers

**Integrations**
- Slack — post messages, send approval requests, and notify channels directly from Automated Step nodes
- Notion — create and update pages, databases, and task entries as workflow actions
- JIRA — create tickets, update issue status, and assign tasks
- Google Workspace — trigger calendar invites, send Gmail, update Sheets
- Custom webhook support for connecting any internal or third-party tool

**Custom configurations**
- Conditional edge logic — branch workflows based on approval outcome (Approved / Rejected) or field values
- Role-based access — restrict who can view, edit, or trigger specific workflows
- Workflow versioning — save snapshots and diff between versions
- Environment configs — separate settings for dev, staging, and production
- Per-node retry and timeout configuration for automated steps

**Infrastructure**
- Backend persistence with FastAPI and PostgreSQL
- Real-time collaboration via WebSocket
- Undo / Redo using command pattern over Zustand store
- Auto-layout with Dagre or ELK.js
- Unit tests with Jest and React Testing Library
- E2E tests with Playwright
