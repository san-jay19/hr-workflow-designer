import type { Node, Edge } from '@xyflow/react';

// ─── Node Types ────────────────────────────────────────────────────────────────
export type NodeType = 'startNode' | 'taskNode' | 'approvalNode' | 'automatedNode' | 'endNode';

// ─── Node Data Shapes ──────────────────────────────────────────────────────────
export interface KeyValuePair {
  key: string;
  value: string;
}

export interface StartNodeData extends Record<string, unknown> {
  label: string;
  title: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData extends Record<string, unknown> {
  label: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData extends Record<string, unknown> {
  label: string;
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData extends Record<string, unknown> {
  label: string;
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData extends Record<string, unknown> {
  label: string;
  endMessage: string;
  showSummary: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export type WorkflowNode = Node<WorkflowNodeData, NodeType>;
export type WorkflowEdge = Edge;

// ─── API Types ─────────────────────────────────────────────────────────────────
export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulateRequest {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export type StepStatus = 'pending' | 'running' | 'success' | 'error' | 'skipped';

export interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  label: string;
  status: StepStatus;
  message: string;
  duration: number;
}

export interface SimulateResponse {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
  summary: string;
}

// ─── Validation ────────────────────────────────────────────────────────────────
export interface ValidationError {
  nodeId?: string;
  message: string;
  type: 'error' | 'warning';
}
