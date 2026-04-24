import React, { useState } from 'react';
import {
  Play, CheckSquare, ThumbsUp, Zap, StopCircle,
  ChevronDown, ChevronRight, LayoutTemplate,
  Download, Upload, RotateCcw, FlaskConical
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { NodeType } from '../../types';

interface NodeDef {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const NODE_DEFS: NodeDef[] = [
  { type: 'startNode', label: 'Start Node', description: 'Workflow entry point', icon: <Play size={14} />, color: 'var(--accent-green)' },
  { type: 'taskNode', label: 'Task Node', description: 'Human task or assignment', icon: <CheckSquare size={14} />, color: 'var(--accent-blue)' },
  { type: 'approvalNode', label: 'Approval Node', description: 'Manager/HR approval step', icon: <ThumbsUp size={14} />, color: 'var(--accent-amber)' },
  { type: 'automatedNode', label: 'Automated Step', description: 'System-triggered action', icon: <Zap size={14} />, color: 'var(--accent-purple)' },
  { type: 'endNode', label: 'End Node', description: 'Workflow completion', icon: <StopCircle size={14} />, color: 'var(--accent-red)' },
];

const TEMPLATES = [
  {
    name: 'Employee Onboarding',
    description: '5-step onboarding flow',
    nodeCount: 6,
  },
  {
    name: 'Leave Approval',
    description: 'Request → Approve → Notify',
    nodeCount: 4,
  },
  {
    name: 'Document Verification',
    description: 'Upload → Review → Confirm',
    nodeCount: 4,
  },
];

export function Sidebar() {
  const { clearWorkflow, exportWorkflow, importWorkflow, setSandboxOpen, workflowName, setWorkflowName, nodes, edges } = useWorkflowStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => importWorkflow(ev.target?.result as string);
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <aside style={{
      width: 240,
      height: '100%',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Logo / Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent-orange), #ff6b00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(249,115,22,0.4)',
          }}>
            <Zap size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>FlowForge</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>HR Workflow Designer</div>
          </div>
        </div>

        {/* Workflow name */}
        {isEditing ? (
          <input
            autoFocus
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={e => e.key === 'Enter' && setIsEditing(false)}
            style={{
              width: '100%', padding: '5px 8px', fontSize: 12,
              background: 'var(--bg-elevated)', border: '1px solid var(--accent-orange)',
              borderRadius: 6, color: 'var(--text-primary)', outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              width: '100%', textAlign: 'left', padding: '5px 8px', fontSize: 12,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 6, color: 'var(--text-secondary)', cursor: 'text',
              fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s',
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--accent-orange)')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {workflowName}
          </button>
        )}
      </div>

      {/* Node palette */}
      <div style={{ padding: '12px 12px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Node Library
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NODE_DEFS.map(def => (
            <div
              key={def.type}
              draggable
              onDragStart={e => onDragStart(e, def.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                cursor: 'grab', transition: 'all 0.2s', userSelect: 'none',
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = def.color;
                (e.currentTarget as HTMLDivElement).style.background = `${def.color}10`;
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)';
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 6,
                background: `${def.color}20`, color: def.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {def.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{def.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{def.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div style={{ padding: '0 12px 8px' }}>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 4px', background: 'transparent', border: 'none',
            cursor: 'pointer', color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <LayoutTemplate size={11} />
            Templates
          </div>
          {showTemplates ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        {showTemplates && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
            {TEMPLATES.map(t => (
              <div
                key={t.name}
                style={{
                  padding: '7px 10px', borderRadius: 7,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseOver={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-orange)'}
                onMouseOut={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.description} · {t.nodeCount} nodes</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        {[
          { label: 'Nodes', value: nodes.length },
          { label: 'Edges', value: edges.length },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '4px', borderRadius: 6, background: 'var(--bg-elevated)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-orange)' }}>{s.value}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 12px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <ActionButton icon={<FlaskConical size={13} />} label="Run Simulation" color="var(--accent-orange)" onClick={() => setSandboxOpen(true)} primary />
        <ActionButton icon={<Download size={13} />} label="Export JSON" color="var(--accent-blue)" onClick={handleExport} />
        <ActionButton icon={<Upload size={13} />} label="Import JSON" color="var(--accent-purple)" onClick={handleImport} />
        <ActionButton icon={<RotateCcw size={13} />} label="Clear Canvas" color="var(--accent-red)" onClick={() => { if (confirm('Clear all nodes?')) clearWorkflow(); }} />
      </div>
    </aside>
  );
}

function ActionButton({ icon, label, color, onClick, primary }: {
  icon: React.ReactNode; label: string; color: string; onClick: () => void; primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', borderRadius: 7, cursor: 'pointer',
        fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
        background: primary ? color : `${color}15`,
        color: primary ? '#fff' : color,
        border: `1px solid ${primary ? color : `${color}40`}`,
        transition: 'all 0.2s',
      }}
      onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
      onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
    >
      {icon}
      {label}
    </button>
  );
}
