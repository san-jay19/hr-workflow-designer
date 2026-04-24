import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export function TopBar() {
  const { workflowName, validateWorkflow, setSandboxOpen, nodes, validationErrors } = useWorkflowStore();

  const handleValidate = () => {
    validateWorkflow();
  };

  const errors = validationErrors.filter(e => e.type === 'error');
  const warnings = validationErrors.filter(e => e.type === 'warning');
  const hasValidated = validationErrors.length > 0 || nodes.length === 0;

  return (
    <header style={{
      height: 52,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      flexShrink: 0,
    }}>
      {/* Workflow name */}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
        {workflowName}
      </div>

      {/* Validation status */}
      {nodes.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {errors.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent-red)' }}>
              <XCircle size={13} />
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </div>
          ) : warnings.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent-amber)' }}>
              <AlertTriangle size={13} />
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </div>
          ) : hasValidated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent-green)' }}>
              <CheckCircle2 size={13} />
              Valid
            </div>
          ) : null}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <TopBarBtn label="Validate" onClick={handleValidate} secondary />
        <TopBarBtn label="▶ Run Simulation" onClick={() => { validateWorkflow(); setSandboxOpen(true); }} primary />
      </div>
    </header>
  );
}

function TopBarBtn({ label, onClick, primary, secondary }: { label: string; onClick: () => void; primary?: boolean; secondary?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        borderRadius: 7, fontFamily: 'var(--font-sans)', transition: 'all 0.2s',
        background: primary ? 'var(--accent-orange)' : secondary ? 'var(--bg-elevated)' : 'transparent',
        color: primary ? '#fff' : 'var(--text-secondary)',
        border: primary ? '1px solid var(--accent-orange)' : '1px solid var(--border)',
      }}
      onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
      onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
    >
      {label}
    </button>
  );
}
