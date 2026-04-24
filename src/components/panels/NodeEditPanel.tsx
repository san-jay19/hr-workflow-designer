import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { useAutomations } from '../../hooks/useAutomations';
import type {
  StartNodeData, TaskNodeData, ApprovalNodeData,
  AutomatedNodeData, EndNodeData, KeyValuePair
} from '../../types';

// ─── Shared form primitives ────────────────────────────────────────────────────
function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{required && <span style={{ color: 'var(--accent-red)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', fontSize: 12,
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 7, color: 'var(--text-primary)', outline: 'none',
  fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={e => (e.target.style.borderColor = 'var(--accent-orange)')}
      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inputStyle, resize: 'vertical' }}
      onFocus={e => (e.target.style.borderColor = 'var(--accent-orange)')}
      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: 'pointer' }}
      onFocus={e => (e.target.style.borderColor = 'var(--accent-orange)')}
      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
    >
      <option value="">— Select —</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function KVEditor({ pairs, onChange }: { pairs: KeyValuePair[]; onChange: (p: KeyValuePair[]) => void }) {
  const add = () => onChange([...pairs, { key: '', value: '' }]);
  const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));
  const update = (i: number, field: 'key' | 'value', val: string) => {
    const next = [...pairs];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div>
      {pairs.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
          <input
            value={p.key}
            onChange={e => update(i, 'key', e.target.value)}
            placeholder="key"
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            value={p.value}
            onChange={e => update(i, 'value', e.target.value)}
            placeholder="value"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={() => remove(i)} style={{ background: 'var(--accent-red-dim)', border: '1px solid var(--accent-red)', borderRadius: 6, padding: '0 7px', cursor: 'pointer', color: 'var(--accent-red)' }}>
            <Trash2 size={11} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        style={{ fontSize: 11, color: 'var(--accent-blue)', background: 'var(--accent-blue-dim)', border: '1px solid var(--accent-blue)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)' }}
      >
        <Plus size={11} /> Add Field
      </button>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
          background: checked ? 'var(--accent-orange)' : 'var(--bg-elevated)',
          border: `1px solid ${checked ? 'var(--accent-orange)' : 'var(--border)'}`,
          position: 'relative', transition: 'all 0.2s',
        }}
      >
        <div style={{
          width: 14, height: 14, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

// ─── Individual node forms ─────────────────────────────────────────────────────
function StartForm({ data, update }: { data: StartNodeData; update: (d: Partial<StartNodeData>) => void }) {
  return (
    <>
      <FormField label="Workflow Title" required>
        <Input value={data.title} onChange={v => update({ title: v })} placeholder="e.g. Employee Onboarding" />
      </FormField>
      <FormField label="Metadata">
        <KVEditor pairs={data.metadata || []} onChange={metadata => update({ metadata })} />
      </FormField>
    </>
  );
}

function TaskForm({ data, update }: { data: TaskNodeData; update: (d: Partial<TaskNodeData>) => void }) {
  return (
    <>
      <FormField label="Task Title" required>
        <Input value={data.title} onChange={v => update({ title: v })} placeholder="e.g. Collect Documents" />
      </FormField>
      <FormField label="Description">
        <Textarea value={data.description} onChange={v => update({ description: v })} placeholder="Describe this task…" rows={2} />
      </FormField>
      <FormField label="Assignee">
        <Input value={data.assignee} onChange={v => update({ assignee: v })} placeholder="e.g. HR Admin" />
      </FormField>
      <FormField label="Due Date">
        <Input value={data.dueDate} onChange={v => update({ dueDate: v })} placeholder="e.g. 2025-01-31" type="date" />
      </FormField>
      <FormField label="Custom Fields">
        <KVEditor pairs={data.customFields || []} onChange={customFields => update({ customFields })} />
      </FormField>
    </>
  );
}

function ApprovalForm({ data, update }: { data: ApprovalNodeData; update: (d: Partial<ApprovalNodeData>) => void }) {
  const roles = ['Manager', 'HRBP', 'Director', 'VP', 'CEO', 'Legal'];
  return (
    <>
      <FormField label="Approval Title" required>
        <Input value={data.title} onChange={v => update({ title: v })} placeholder="e.g. Manager Approval" />
      </FormField>
      <FormField label="Approver Role">
        <Select value={data.approverRole} onChange={v => update({ approverRole: v })} options={roles.map(r => ({ value: r, label: r }))} />
      </FormField>
      <FormField label="Auto-Approve Threshold (%)">
        <input
          type="number" min={0} max={100}
          value={data.autoApproveThreshold}
          onChange={e => update({ autoApproveThreshold: Number(e.target.value) })}
          style={{ ...inputStyle, width: '100%' }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent-orange)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '3px 0 0' }}>Set to 0 to disable auto-approval.</p>
      </FormField>
    </>
  );
}

function AutomatedForm({ data, update }: { data: AutomatedNodeData; update: (d: Partial<AutomatedNodeData>) => void }) {
  const { automations, loading } = useAutomations();
  const selected = automations.find(a => a.id === data.actionId);

  const handleActionChange = (id: string) => {
    const action = automations.find(a => a.id === id);
    const actionParams: Record<string, string> = {};
    action?.params.forEach(p => { actionParams[p] = data.actionParams?.[p] || ''; });
    update({ actionId: id, actionParams });
  };

  const updateParam = (key: string, value: string) => {
    update({ actionParams: { ...data.actionParams, [key]: value } });
  };

  return (
    <>
      <FormField label="Step Title" required>
        <Input value={data.title} onChange={v => update({ title: v })} placeholder="e.g. Send Welcome Email" />
      </FormField>
      <FormField label="Action">
        {loading ? (
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading actions…</div>
        ) : (
          <Select
            value={data.actionId}
            onChange={handleActionChange}
            options={automations.map(a => ({ value: a.id, label: a.label }))}
          />
        )}
      </FormField>
      {selected && selected.params.length > 0 && (
        <FormField label="Action Parameters">
          {selected.params.map(p => (
            <div key={p} style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, fontFamily: 'var(--font-mono)' }}>{p}</div>
              <Input
                value={data.actionParams?.[p] || ''}
                onChange={v => updateParam(p, v)}
                placeholder={`Enter ${p}…`}
              />
            </div>
          ))}
        </FormField>
      )}
    </>
  );
}

function EndForm({ data, update }: { data: EndNodeData; update: (d: Partial<EndNodeData>) => void }) {
  return (
    <>
      <FormField label="End Message">
        <Textarea value={data.endMessage} onChange={v => update({ endMessage: v })} placeholder="Workflow complete!" rows={2} />
      </FormField>
      <FormField label="Display Summary">
        <Toggle checked={data.showSummary} onChange={v => update({ showSummary: v })} label="Show workflow summary on completion" />
      </FormField>
    </>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  startNode: 'var(--accent-green)',
  taskNode: 'var(--accent-blue)',
  approvalNode: 'var(--accent-amber)',
  automatedNode: 'var(--accent-purple)',
  endNode: 'var(--accent-red)',
};

const TYPE_LABELS: Record<string, string> = {
  startNode: 'Start Node',
  taskNode: 'Task Node',
  approvalNode: 'Approval Node',
  automatedNode: 'Automated Step',
  endNode: 'End Node',
};

export function NodeEditPanel() {
  const { getSelectedNode, setSelectedNodeId, updateNodeData, deleteNode, duplicateNode } = useWorkflowStore();
  const node = getSelectedNode();

  if (!node) return null;

  const color = TYPE_COLORS[node.type!] || 'var(--accent-orange)';
  const typeLabel = TYPE_LABELS[node.type!] || node.type;

  const update = (data: Partial<typeof node.data>) => {
    updateNodeData(node.id, data as Partial<typeof node.data>);
  };

  const renderForm = () => {
    switch (node.type) {
      case 'startNode': return <StartForm data={node.data as StartNodeData} update={update} />;
      case 'taskNode': return <TaskForm data={node.data as TaskNodeData} update={update} />;
      case 'approvalNode': return <ApprovalForm data={node.data as ApprovalNodeData} update={update} />;
      case 'automatedNode': return <AutomatedForm data={node.data as AutomatedNodeData} update={update} />;
      case 'endNode': return <EndForm data={node.data as EndNodeData} update={update} />;
      default: return null;
    }
  };

  return (
    <aside
      className="animate-slide-in"
      style={{
        width: 280,
        height: '100%',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
        background: `linear-gradient(135deg, ${color}15, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {typeLabel}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
            {node.id.slice(0, 8)}…
          </div>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: 5, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {renderForm()}
      </div>

      {/* Danger zone */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
        <button
          onClick={() => duplicateNode(node.id)}
          style={{ flex: 1, padding: '7px', fontSize: 11, fontWeight: 600, cursor: 'pointer', borderRadius: 7, background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', border: '1px solid var(--accent-blue)40', fontFamily: 'var(--font-sans)' }}
        >
          Duplicate
        </button>
        <button
          onClick={() => deleteNode(node.id)}
          style={{ flex: 1, padding: '7px', fontSize: 11, fontWeight: 600, cursor: 'pointer', borderRadius: 7, background: 'var(--accent-red-dim)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)40', fontFamily: 'var(--font-sans)' }}
        >
          Delete Node
        </button>
      </div>
    </aside>
  );
}
