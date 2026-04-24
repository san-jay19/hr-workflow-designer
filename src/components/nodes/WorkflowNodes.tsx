import { type NodeProps } from '@xyflow/react';
import { Play, CheckSquare, ThumbsUp, Zap, StopCircle } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../../types';

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px',
      borderRadius: 20, background: `${color}20`, color,
      border: `1px solid ${color}40`, display: 'inline-block',
    }}>
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 3 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 60, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

export function StartNode({ data, selected }: NodeProps) {
  const d = data as StartNodeData;
  return (
    <BaseNode accentColor="var(--accent-green)" icon={<Play size={14} />} label="Start" subtitle={d.title} showTarget={false} selected={selected}>
      {(d.metadata?.length ?? 0) > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
          {(d.metadata ?? []).slice(0, 3).map((m: { key: string; value: string }, i: number) => (
            <Chip key={i} label={`${m.key}: ${m.value}`} color="var(--accent-green)" />
          ))}
        </div>
      )}
    </BaseNode>
  );
}

export function TaskNode({ data, selected }: NodeProps) {
  const d = data as TaskNodeData;
  return (
    <BaseNode accentColor="var(--accent-blue)" icon={<CheckSquare size={14} />} label="Task" subtitle={d.title} selected={selected}>
      <div>
        <InfoRow label="Assignee" value={d.assignee} />
        <InfoRow label="Due" value={d.dueDate} />
        {d.description && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', overflow: 'hidden' }}>
            {d.description.slice(0, 60)}{d.description.length > 60 ? '…' : ''}
          </p>
        )}
      </div>
    </BaseNode>
  );
}

export function ApprovalNode({ data, selected }: NodeProps) {
  const d = data as ApprovalNodeData;
  return (
    <BaseNode accentColor="var(--accent-amber)" icon={<ThumbsUp size={14} />} label="Approval" subtitle={d.title} selected={selected}>
      <div>
        <InfoRow label="Approver" value={d.approverRole} />
        {d.autoApproveThreshold > 0 && <InfoRow label="Auto ≥" value={`${d.autoApproveThreshold}%`} />}
      </div>
    </BaseNode>
  );
}

export function AutomatedNode({ data, selected }: NodeProps) {
  const d = data as AutomatedNodeData;
  const paramCount = Object.keys(d.actionParams || {}).length;
  return (
    <BaseNode accentColor="var(--accent-purple)" icon={<Zap size={14} />} label="Automated" subtitle={d.title} selected={selected}>
      <div>
        {d.actionId ? (
          <>
            <Chip label={d.actionId.replace(/_/g, ' ')} color="var(--accent-purple)" />
            {paramCount > 0 && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>
                {paramCount} param{paramCount !== 1 ? 's' : ''}
              </span>
            )}
          </>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>No action selected</span>
        )}
      </div>
    </BaseNode>
  );
}

export function EndNode({ data, selected }: NodeProps) {
  const d = data as EndNodeData;
  return (
    <BaseNode accentColor="var(--accent-red)" icon={<StopCircle size={14} />} label="End" subtitle={d.endMessage} showSource={false} selected={selected}>
      {d.showSummary && <Chip label="Summary enabled" color="var(--accent-red)" />}
    </BaseNode>
  );
}
