import type { AutomationAction, SimulateRequest, SimulateResponse, SimulationStep } from '../types';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
export const mockAutomations: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'send_slack', label: 'Send Slack Message', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary', 'priority'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employeeId', 'field', 'value'] },
  { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['attendees', 'duration', 'title'] },
  { id: 'send_sms', label: 'Send SMS', params: ['phone', 'message'] },
  { id: 'webhook', label: 'Trigger Webhook', params: ['url', 'method', 'payload'] },
];

// ─── GET /automations ──────────────────────────────────────────────────────────
export async function fetchAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return mockAutomations;
}

// ─── POST /simulate ────────────────────────────────────────────────────────────
export async function simulateWorkflow(req: SimulateRequest): Promise<SimulateResponse> {
  await delay(600);

  const { nodes, edges } = req;
  const errors: string[] = [];
  const steps: SimulationStep[] = [];

  // Basic validation
  const startNodes = nodes.filter(n => n.type === 'startNode');
  const endNodes = nodes.filter(n => n.type === 'endNode');

  if (startNodes.length === 0) {
    errors.push('Workflow must have exactly one Start Node.');
  }
  if (startNodes.length > 1) {
    errors.push('Workflow can only have one Start Node.');
  }
  if (endNodes.length === 0) {
    errors.push('Workflow must have at least one End Node.');
  }

  // Detect disconnected nodes
  const connectedNodeIds = new Set<string>();
  edges.forEach(e => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });

  nodes.forEach(node => {
    if (node.type !== 'startNode' && node.type !== 'endNode' && !connectedNodeIds.has(node.id)) {
      errors.push(`Node "${(node.data as { label?: string; title?: string }).label || node.id}" is disconnected.`);
    }
  });

  // Detect cycles using DFS
  if (hasCycle(nodes.map(n => n.id), edges)) {
    errors.push('Workflow contains a cycle — directed graphs must be acyclic.');
  }

  if (errors.length > 0) {
    return { success: false, steps: [], errors, summary: 'Workflow validation failed.' };
  }

  // Topological sort for execution order
  const sorted = topologicalSort(nodes.map(n => n.id), edges);

  // Simulate each step
  for (const nodeId of sorted) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;

    await delay(150);

    const data = node.data as Record<string, unknown>;
    const label = (data.title as string) || (data.label as string) || node.type || '';

    const step: SimulationStep = {
      nodeId,
      nodeType: node.type as import('../types').NodeType,
      label,
      status: 'success',
      message: getStepMessage(node.type as string, data),
      duration: Math.floor(Math.random() * 800) + 100,
    };

    steps.push(step);
  }

  return {
    success: true,
    steps,
    errors: [],
    summary: `Workflow executed successfully across ${steps.length} step(s).`,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStepMessage(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case 'startNode':
      return `Workflow initiated: "${data.title || 'Untitled'}"`;
    case 'taskNode':
      return `Task assigned to ${data.assignee || 'Unassigned'} — due ${data.dueDate || 'TBD'}`;
    case 'approvalNode':
      return `Awaiting approval from ${data.approverRole || 'Manager'} (auto-approve at ${data.autoApproveThreshold || 0}%)`;
    case 'automatedNode':
      return `Automated action triggered: ${data.actionId || 'Unknown action'}`;
    case 'endNode':
      return `Workflow completed. ${data.endMessage || ''}`;
    default:
      return 'Step executed.';
  }
}

function hasCycle(nodeIds: string[], edges: { source: string; target: string }[]): boolean {
  const adj: Record<string, string[]> = {};
  nodeIds.forEach(id => (adj[id] = []));
  edges.forEach(e => adj[e.source]?.push(e.target));

  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(node: string): boolean {
    visited.add(node);
    recStack.add(node);
    for (const neighbor of (adj[node] || [])) {
      if (!visited.has(neighbor) && dfs(neighbor)) return true;
      if (recStack.has(neighbor)) return true;
    }
    recStack.delete(node);
    return false;
  }

  return nodeIds.some(id => !visited.has(id) && dfs(id));
}

function topologicalSort(nodeIds: string[], edges: { source: string; target: string }[]): string[] {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  nodeIds.forEach(id => { inDegree[id] = 0; adj[id] = []; });
  edges.forEach(e => {
    adj[e.source]?.push(e.target);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  });

  const queue = nodeIds.filter(id => inDegree[id] === 0);
  const result: string[] = [];

  while (queue.length) {
    const node = queue.shift()!;
    result.push(node);
    (adj[node] || []).forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    });
  }

  return result;
}
