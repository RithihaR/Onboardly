import React from 'react';
import { colors } from '../tokens/colors';
import { spacing, radius, fontSize } from '../tokens/spacing';

const STATUS_CONFIG = {
    'not-started': { label: 'Not started', icon: '○', tokenKey: 'notStarted' },
    'in-progress': { label: 'In progress', icon: '◐', tokenKey: 'inProgress' },
    'complete': { label: 'Complete', icon: '●', tokenKey: 'complete' },
};

export function StatusIndicator({ status, showLabel = true }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['not-started'];
    const tokens = colors.status[config.tokenKey];

    const style = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.xs,
        padding: `${spacing.xs} ${spacing.sm}`,
        borderRadius: radius.pill,
        background: tokens.bg,
        color: tokens.fg,
        border: `1px solid ${tokens.border}`,
        fontSize: fontSize.sm,
        fontWeight: 600,
    };

    return (
        <span style={style}>
            <span aria-hidden="true">{config.icon}</span>
            {showLabel && <span>{config.label}</span>}
        </span>
    );
}