# FlowForge — HR Workflow Designer

A visual HR workflow designer built with React, TypeScript, and React Flow. Design, configure, and simulate internal HR processes like employee onboarding, leave approvals, and document verification — all in a drag-and-drop canvas interface.

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
