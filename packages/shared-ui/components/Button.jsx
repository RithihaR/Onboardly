import React from 'react';
import { colors } from '../tokens/colors';
import { spacing, radius, touchTarget, fontSize } from '../tokens/spacing';

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false }) {
    const variantStyles = {
        primary: {
            background: colors.primary,
            color: '#FFFFFF',
            border: 'none',
        },
        secondary: {
            background: colors.background.card,
            color: colors.text.primary,
            border: `1px solid ${colors.background.border}`,
        },
    };

    const style = {
        ...variantStyles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size === 'lg' ? `${spacing.md} ${spacing.lg}` : `${spacing.sm} ${spacing.md}`,
        minHeight: touchTarget.minHeight,
        borderRadius: radius.md,
        fontSize: size === 'lg' ? fontSize.lg : fontSize.md,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
    };

    return (
        <button style={style} onClick={disabled ? undefined : onClick} disabled={disabled}>
            {children}
        </button>
    );
}