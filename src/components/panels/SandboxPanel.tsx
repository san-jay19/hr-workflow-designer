import { useEffect } from 'react';
import { X, Play, RotateCcw, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { useSimulation } from '../../hooks/useSimulation';
import type { SimulationStep, NodeType } from '../../types';

const NODE_COLORS: Record<NodeType, string> = {
  startNode: 'var(--accent-green)',
  taskNode: 'var(--accent-blue)',
  approvalNode: 'var(--accent-amber)',
  automatedNode: 'var(--accent-purple)',
  endNode: 'var(--accent-red)',
};

const NODE_LABELS: Record<NodeType, string> = {
  startNode: 'Start',
  taskNode: 'Task',
  approvalNode: 'Approval',
  automatedNode: 'Automated',
  endNode: 'End',
};

function StepRow({ step, index, isCurrent, isPast }: {
  step: SimulationStep; index: number; isCurrent: boolean; isPast: boolean;
}) {
  const color = NODE_COLORS[step.nodeType] || 'var(--accent-blue)';
  const opacity = !isCurrent && !isPast ? 0.4 : 1;

  return (
    <div
      style={{
        display: 'flex', gap: 12, padding: '10px 14px',
        background: isCurrent ? `${color}12` : 'transparent',
        borderLeft: `3px solid ${isCurrent ? color : isPast ? `${color}60` : 'var(--border)'}`,
        marginBottom: 2, opacity, transition: 'all 0.3s',
      }}
    >
      {/* Step indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: isPast || isCurrent ? color : 'var(--bg-elevated)',
          border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isPast || isCurrent ? '#fff' : color,
          fontSize: 10, fontWeight: 700, flexShrink: 0,
        }}>
          {isCurrent ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : isPast ? <CheckCircle2 size={11} /> : index + 1}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {NODE_LABELS[step.nodeType]}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{step.label}</span>
        </div>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{step.message}</p>
        <div style={{ marginTop: 3, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {isPast && `~${step.duration}ms`}
        </div>
      </div>

      {/* Status */}
      {isPast && <CheckCircle2 size={14} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: 4 }} />}
    </div>
  );
}

export function SandboxPanel() {
  const { isSandboxOpen, setSandboxOpen, nodes, edges, validateWorkflow, validationErrors } = useWorkflowStore();
  const { result, loading, currentStep, run, reset } = useSimulation();

  useEffect(() => {
    if (isSandboxOpen) {
      validateWorkflow();
      reset();
    }
  }, [isSandboxOpen]);

  if (!isSandboxOpen) return null;

  const handleRun = () => {
    const errors = validateWorkflow();
    if (errors.filter(e => e.type === 'error').length > 0) return;
    run(nodes, edges);
  };

  const hasErrors = validationErrors.filter(e => e.type === 'error').length > 0;
  const hasWarnings = validationErrors.filter(e => e.type === 'warning').length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setSandboxOpen(false)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', zIndex: 100,
        }}
      />

      {/* Modal */}
      <div
        className="animate-fade-in"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 560, maxHeight: '85vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column',
          zIndex: 101, overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.1), transparent)',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Workflow Simulator</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {nodes.length} nodes · {edges.length} edges
            </div>
          </div>
          <button
            onClick={() => setSandboxOpen(false)}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 7, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Validation */}
        {(hasErrors || hasWarnings) && !result && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {validationErrors.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
                {e.type === 'error'
                  ? <XCircle size={14} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: 1 }} />
                  : <AlertTriangle size={14} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: 1 }} />
                }
                <span style={{ color: e.type === 'error' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>{e.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Result summary */}
        {result && (
          <div style={{
            padding: '12px 20px', borderBottom: '1px solid var(--border)',
            background: result.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {result.success
              ? <CheckCircle2 size={16} color="var(--accent-green)" />
              : <XCircle size={16} color="var(--accent-red)" />
            }
            <span style={{ fontSize: 13, color: result.success ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
              {result.summary}
            </span>
          </div>
        )}

        {/* Steps / Errors */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!result && !loading && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                {hasErrors ? 'Fix the errors above before running.' : 'Press "Run Simulation" to execute your workflow.'}
              </p>
            </div>
          )}

          {loading && !result && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Loader2 size={32} color="var(--accent-orange)" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Running simulation…</p>
            </div>
          )}

          {result?.errors && result.errors.length > 0 && (
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.errors.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--accent-red)' }}>
                  <XCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  {e}
                </div>
              ))}
            </div>
          )}

          {result?.steps && result.steps.length > 0 && (
            <div style={{ padding: '8px 0' }}>
              {result.steps.map((step, i) => (
                <StepRow
                  key={step.nodeId}
                  step={step}
                  index={i}
                  isCurrent={i === currentStep && loading}
                  isPast={i <= currentStep || !loading}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {result && (
            <button
              onClick={reset}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 8, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontFamily: 'var(--font-sans)' }}
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
          <button
            onClick={handleRun}
            disabled={loading || hasErrors}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', fontSize: 12,
              fontWeight: 700, cursor: loading || hasErrors ? 'not-allowed' : 'pointer',
              borderRadius: 8, background: loading || hasErrors ? 'var(--bg-elevated)' : 'var(--accent-orange)',
              color: loading || hasErrors ? 'var(--text-muted)' : '#fff',
              border: '1px solid transparent', fontFamily: 'var(--font-sans)',
              opacity: loading || hasErrors ? 0.6 : 1, transition: 'all 0.2s',
            }}
          >
            {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={13} />}
            {loading ? 'Running…' : 'Run Simulation'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
