import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
} from '@xyflow/react';
import { useWorkflowStore } from './store/workflowStore';
import { Sidebar } from './components/sidebar/Sidebar';
import { NodeEditPanel } from './components/panels/NodeEditPanel';
import { SandboxPanel } from './components/panels/SandboxPanel';
import { TopBar } from './components/ui/TopBar';
import { EmptyCanvas } from './components/ui/EmptyCanvas';
import {
  StartNode,
  TaskNode,
  ApprovalNode,
  AutomatedNode,
  EndNode,
} from './components/nodes/WorkflowNodes';
import type { NodeType, WorkflowNode } from './types';

const nodeTypes: NodeTypes = {
  startNode: StartNode as React.ComponentType<any>,
  taskNode: TaskNode as React.ComponentType<any>,
  approvalNode: ApprovalNode as React.ComponentType<any>,
  automatedNode: AutomatedNode as React.ComponentType<any>,
  endNode: EndNode as React.ComponentType<any>,
};

export default function App() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNode, setSelectedNodeId, selectedNodeId,
  } = useWorkflowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const rfInstanceRef = useRef<any>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType') as NodeType;
    if (!type || !reactFlowWrapper.current || !rfInstanceRef.current) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = rfInstanceRef.current.screenToFlowPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });

    addNode(type, position);
  }, [addNode]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: WorkflowNode) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <div
          ref={reactFlowWrapper}
          style={{ flex: 1, position: 'relative' }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {nodes.length === 0 && <EmptyCanvas />}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick as any}
            onPaneClick={onPaneClick}
            onInit={(instance) => { rfInstanceRef.current = instance; }}
            fitView
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            style={{ background: 'var(--bg-base)' }}
            defaultEdgeOptions={{
              animated: true,
              style: { strokeDasharray: '5,5', stroke: 'var(--border-light)', strokeWidth: 2 },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls position="bottom-right" />
            <MiniMap
              position="bottom-left"
              nodeColor={(node) => {
                const colors: Record<string, string> = {
                  startNode: '#22c55e',
                  taskNode: '#3b82f6',
                  approvalNode: '#f59e0b',
                  automatedNode: '#a855f7',
                  endNode: '#ef4444',
                };
                return colors[node.type!] || '#64748b';
              }}
            />
          </ReactFlow>
        </div>

        {selectedNodeId && <NodeEditPanel />}
      </div>

      <SandboxPanel />
    </div>
  );
}
