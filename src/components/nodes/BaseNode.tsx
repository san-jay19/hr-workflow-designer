import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface BaseNodeProps {
  children: React.ReactNode;
  accentColor: string;
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  showSource?: boolean;
  showTarget?: boolean;
  selected?: boolean;
  minWidth?: number;
}

export function BaseNode({
  children,
  accentColor,
  icon,
  label,
  subtitle,
  showSource = true,
  showTarget = true,
  selected,
  minWidth = 220,
}: BaseNodeProps) {
  return (
    <div
      style={{
        minWidth,
        background: 'var(--bg-card)',
        border: `1px solid ${selected ? accentColor : 'var(--border)'}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: selected
          ? `0 0 0 2px ${accentColor}40, 0 8px 32px rgba(0,0,0,0.5)`
          : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'all 0.2s ease',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Header stripe */}
      <div
        style={{
          background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`,
          borderBottom: `1px solid ${accentColor}30`,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${accentColor}20`,
            border: `1px solid ${accentColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 14px', minHeight: 40 }}>
        {children}
      </div>

      {showTarget && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: 'var(--bg-elevated)', borderColor: accentColor }}
        />
      )}
      {showSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: 'var(--bg-elevated)', borderColor: accentColor }}
        />
      )}
    </div>
  );
}
