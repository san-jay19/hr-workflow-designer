import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  NodeType,
  ValidationError,
} from '../types';

interface WorkflowStore {
  // State
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  validationErrors: ValidationError[];
  isSandboxOpen: boolean;
  workflowName: string;

  // Node actions
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;

  // Selection
  setSelectedNodeId: (id: string | null) => void;
  getSelectedNode: () => WorkflowNode | null;

  // Validation
  validateWorkflow: () => ValidationError[];

  // UI
  setSandboxOpen: (open: boolean) => void;
  setWorkflowName: (name: string) => void;

  // Import/Export
  exportWorkflow: () => string;
  importWorkflow: (json: string) => void;
  clearWorkflow: () => void;
}

const defaultNodeData: Record<NodeType, WorkflowNodeData> = {
  startNode: { label: 'Start', title: 'Workflow Start', metadata: [] },
  taskNode: { label: 'Task', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] },
  approvalNode: { label: 'Approval', title: 'Approval Required', approverRole: 'Manager', autoApproveThreshold: 0 },
  automatedNode: { label: 'Auto', title: 'Automated Step', actionId: '', actionParams: {} },
  endNode: { label: 'End', endMessage: 'Workflow complete!', showSummary: true },
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  validationErrors: [],
  isSandboxOpen: false,
  workflowName: 'Untitled Workflow',

  onNodesChange: (changes) => {
    set(state => ({ nodes: applyNodeChanges(changes, state.nodes) as WorkflowNode[] }));
  },

  onEdgesChange: (changes) => {
    set(state => ({ edges: applyEdgeChanges(changes, state.edges) }));
  },

  onConnect: (connection) => {
    set(state => ({
      edges: addEdge(
        { ...connection, id: uuidv4(), animated: true, style: { strokeDasharray: '5,5' } },
        state.edges
      ),
    }));
  },

  addNode: (type, position) => {
    const id = uuidv4();
    const newNode: WorkflowNode = {
      id,
      type,
      position,
      data: { ...defaultNodeData[type] } as WorkflowNodeData,
    };
    set(state => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: id,
    }));
  },

  updateNodeData: (nodeId, data) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData } : n
      ),
    }));
  },

  deleteNode: (nodeId) => {
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },

  duplicateNode: (nodeId) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;
    const newId = uuidv4();
    const duplicate: WorkflowNode = {
      ...node,
      id: newId,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: { ...node.data },
      selected: false,
    };
    set(state => ({ nodes: [...state.nodes, duplicate], selectedNodeId: newId }));
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  getSelectedNode: () => {
    const { nodes, selectedNodeId } = get();
    return nodes.find(n => n.id === selectedNodeId) ?? null;
  },

  validateWorkflow: () => {
    const { nodes, edges } = get();
    const errors: ValidationError[] = [];

    const startNodes = nodes.filter(n => n.type === 'startNode');
    const endNodes = nodes.filter(n => n.type === 'endNode');

    if (startNodes.length === 0)
      errors.push({ message: 'Workflow must begin with a Start Node.', type: 'error' });
    if (startNodes.length > 1)
      errors.push({ message: 'Only one Start Node is allowed.', type: 'error' });
    if (endNodes.length === 0)
      errors.push({ message: 'Workflow must end with at least one End Node.', type: 'error' });
    if (nodes.length < 2)
      errors.push({ message: 'Add more nodes to build a workflow.', type: 'warning' });

    // Disconnected nodes (non-start, non-end)
    const connectedIds = new Set<string>();
    edges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target); });
    nodes.forEach(n => {
      if (!connectedIds.has(n.id) && n.type !== 'startNode' && n.type !== 'endNode') {
        const data = n.data as { title?: string; label?: string };
        errors.push({
          nodeId: n.id,
          message: `"${data.title || data.label}" is not connected to the workflow.`,
          type: 'warning',
        });
      }
    });

    set({ validationErrors: errors });
    return errors;
  },

  setSandboxOpen: (open) => set({ isSandboxOpen: open }),

  setWorkflowName: (name) => set({ workflowName: name }),

  exportWorkflow: () => {
    const { nodes, edges, workflowName } = get();
    return JSON.stringify({ workflowName, nodes, edges }, null, 2);
  },

  importWorkflow: (json) => {
    try {
      const { workflowName, nodes, edges } = JSON.parse(json);
      set({ workflowName: workflowName || 'Imported Workflow', nodes: nodes || [], edges: edges || [], selectedNodeId: null });
    } catch {
      alert('Invalid workflow JSON.');
    }
  },

  clearWorkflow: () => set({ nodes: [], edges: [], selectedNodeId: null, validationErrors: [] }),
}));
