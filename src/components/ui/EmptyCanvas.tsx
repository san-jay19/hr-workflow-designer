export function EmptyCanvas() {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 2,
    }}>
      <div style={{
        padding: '32px 40px', borderRadius: 16, textAlign: 'center',
        background: 'rgba(26,29,37,0.8)', border: '1px solid var(--border)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12, filter: 'grayscale(0.2)' }}>⚡</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Start Building Your Workflow
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280, margin: 0, lineHeight: 1.5 }}>
          Drag nodes from the left panel onto the canvas to begin designing your HR workflow.
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[
            { label: '① Drag', desc: 'nodes from sidebar' },
            { label: '② Connect', desc: 'nodes with edges' },
            { label: '③ Configure', desc: 'click to edit' },
          ].map(s => (
            <div key={s.label} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-orange)', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
