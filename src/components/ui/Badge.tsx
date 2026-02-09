import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    info: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    primary: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
};

const dotColors: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
    neutral: 'bg-slate-500',
    primary: 'bg-blue-500',
};

const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
    children,
    variant = 'neutral',
    size = 'md',
    dot = false,
    className = '',
}: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
            )}
            {children}
        </span>
    );
}

// Status badge presets
export function StatusBadge({ status }: { status: 'online' | 'offline' | 'warning' }) {
    const config = {
        online: { variant: 'success' as BadgeVariant, label: 'Online' },
        offline: { variant: 'danger' as BadgeVariant, label: 'Offline' },
        warning: { variant: 'warning' as BadgeVariant, label: 'Warning' },
    };

    const { variant, label } = config[status];
    return <Badge variant={variant} dot>{label}</Badge>;
}

export function HealthBadge({ health }: { health: 'healthy' | 'faulty' | 'degraded' }) {
    const config = {
        healthy: { variant: 'success' as BadgeVariant, label: 'Healthy' },
        faulty: { variant: 'danger' as BadgeVariant, label: 'Faulty' },
        degraded: { variant: 'warning' as BadgeVariant, label: 'Degraded' },
    };

    const { variant, label } = config[health];
    return <Badge variant={variant}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: 'critical' | 'high' | 'medium' | 'low' }) {
    const config = {
        critical: { variant: 'danger' as BadgeVariant, label: 'Critical' },
        high: { variant: 'warning' as BadgeVariant, label: 'High' },
        medium: { variant: 'info' as BadgeVariant, label: 'Medium' },
        low: { variant: 'neutral' as BadgeVariant, label: 'Low' },
    };

    const { variant, label } = config[priority];
    return <Badge variant={variant}>{label}</Badge>;
}

export function TicketStatusBadge({ status }: { status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' }) {
    const config = {
        open: { variant: 'danger' as BadgeVariant, label: 'Open' },
        in_progress: { variant: 'primary' as BadgeVariant, label: 'In Progress' },
        pending: { variant: 'warning' as BadgeVariant, label: 'Pending' },
        resolved: { variant: 'success' as BadgeVariant, label: 'Resolved' },
        closed: { variant: 'neutral' as BadgeVariant, label: 'Closed' },
    };

    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
}

export function RoleBadge({ role }: { role: 'admin' | 'manager' | 'technician' | 'viewer' }) {
    const config = {
        admin: { variant: 'danger' as BadgeVariant, label: 'Admin' },
        manager: { variant: 'primary' as BadgeVariant, label: 'Manager' },
        technician: { variant: 'info' as BadgeVariant, label: 'Technician' },
        viewer: { variant: 'neutral' as BadgeVariant, label: 'Viewer' },
    };

    const { variant, label } = config[role];
    return <Badge variant={variant}>{label}</Badge>;
}
