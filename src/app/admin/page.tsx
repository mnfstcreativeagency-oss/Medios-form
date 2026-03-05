'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Application {
    _id: string;
    fullName: string;
    age: number;
    gender: string;
    whatsappNumber: string;
    email: string;
    currentStatus: string;
    status: 'Pending' | 'Done with cold call';
    converted: 'Yes' | 'No' | 'Pending';
    createdAt: string;
}

/* ─── Avatar ─── */
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
    const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return (
        <div style={{
            width: size, height: size, borderRadius: Math.round(size * 0.3), flexShrink: 0,
            background: `hsl(${hue},50%,88%)`, color: `hsl(${hue},50%,32%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: Math.round(size * 0.35),
        }}>
            {initials}
        </div>
    );
}

/* ─── Stat Card ─── */
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: '1.875rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
        </div>
    );
}

/* ─── Login ─── */
function LoginScreen({ onLogin }: { onLogin: (pwd: string) => void }) {
    const [pwd, setPwd] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setErr('');
        try {
            const res = await fetch(`/api/applications?password=${pwd}`);
            const data = await res.json();
            if (data.success) onLogin(pwd);
            else setErr('Incorrect password. Please try again.');
        } catch { setErr('Network error. Please check your connection.'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg)' }}>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 400 }}>
                <div className="card" style={{ padding: 'clamp(1.75rem, 6vw, 2.5rem)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: 54, height: 54, borderRadius: 16, background: 'var(--surface-2)',
                            border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '1.625rem', margin: '0 auto 1.25rem',
                        }}>🔐</div>
                        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: 4 }}>Admin Access</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enter your password to continue</p>
                    </div>
                    <form onSubmit={submit}>
                        <div className="field-group">
                            <label className="field-label" htmlFor="pwd">Password</label>
                            <input id="pwd" type="password" className="field-input"
                                style={{ height: 50, textAlign: 'center', letterSpacing: '0.15em', fontSize: '1.25rem' }}
                                value={pwd} onChange={e => setPwd(e.target.value)}
                                placeholder="••••••••" required autoFocus />
                        </div>
                        {err && (
                            <div style={{
                                background: 'var(--red-light)', borderWidth: 1, borderStyle: 'solid',
                                borderColor: 'rgba(220,38,38,0.15)', borderRadius: 10,
                                padding: '10px 14px', color: 'var(--red)',
                                fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1rem',
                            }}>{err}</div>
                        )}
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 48 }} disabled={loading}>
                            {loading ? <><span className="spinner" /> Verifying…</> : 'Enter Dashboard →'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Main Dashboard ─── */
export default function AdminDashboard() {
    const [apps, setApps] = useState<Application[]>([]);
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Done with cold call'>('All');

    const handleLogin = async (pwd: string) => {
        const res = await fetch(`/api/applications?password=${pwd}`);
        const data = await res.json();
        if (data.success) { setApps(data.data); setPassword(pwd); setAuthenticated(true); }
    };

    const sync = async () => {
        setSyncing(true);
        try {
            const res = await fetch(`/api/applications?password=${password}`);
            const data = await res.json();
            if (data.success) setApps(data.data);
        } finally { setSyncing(false); }
    };

    const update = async (id: string, patch: Partial<Application>) => {
        setUpdatingId(id);
        try {
            const res = await fetch('/api/applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...patch, password }),
            });
            const data = await res.json();
            if (data.success) setApps(prev => prev.map(a => a._id === id ? data.data : a));
        } finally { setUpdatingId(null); }
    };

    const filtered = useMemo(() =>
        apps
            .filter(a => filterStatus === 'All' || a.status === filterStatus)
            .filter(a =>
                a.fullName.toLowerCase().includes(search.toLowerCase()) ||
                a.email.toLowerCase().includes(search.toLowerCase()) ||
                a.whatsappNumber.includes(search)
            ),
        [apps, search, filterStatus]
    );

    const stats = useMemo(() => ({
        total: apps.length,
        pending: apps.filter(a => a.status === 'Pending').length,
        done: apps.filter(a => a.status === 'Done with cold call').length,
        converted: apps.filter(a => a.converted === 'Yes').length,
    }), [apps]);

    if (!authenticated) return <LoginScreen onLogin={handleLogin} />;

    /* Shared sub-components */
    const StatusToggle = ({ app }: { app: Application }) => (
        <button
            disabled={updatingId === app._id}
            onClick={() => update(app._id, { status: app.status === 'Pending' ? 'Done with cold call' : 'Pending' })}
            className="chip"
            style={{
                background: app.status === 'Pending' ? 'var(--amber-light)' : 'var(--green-light)',
                color: app.status === 'Pending' ? 'var(--amber)' : 'var(--green)',
                borderWidth: 1, borderStyle: 'solid',
                borderColor: app.status === 'Pending' ? 'rgba(217,119,6,0.2)' : 'rgba(22,163,74,0.2)',
            }}
        >
            {updatingId === app._id ? '…' : app.status === 'Pending' ? 'Pending' : 'Called ✓'}
        </button>
    );

    const ConvertedPicker = ({ app }: { app: Application }) => (
        <div style={{ display: 'inline-flex', background: 'var(--surface-3)', borderRadius: 8, padding: 2, gap: 2 }}>
            {(['Yes', 'No'] as const).map(v => (
                <button key={v} disabled={updatingId === app._id}
                    onClick={() => update(app._id, { converted: v })}
                    style={{
                        padding: '3px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.15s',
                        background: app.converted === v ? (v === 'Yes' ? 'var(--green)' : 'var(--red)') : 'transparent',
                        color: app.converted === v ? '#fff' : 'var(--text-muted)',
                    }}>
                    {v}
                </button>
            ))}
        </div>
    );

    /* Toolbar shared between desktop + mobile */
    const Toolbar = () => (
        <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '0.9rem' }}>🔍</span>
                <input type="text" className="field-input"
                    style={{ paddingLeft: 38 }}
                    placeholder="Search name, email or phone…"
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: 3, gap: 2 }}>
                {(['All', 'Pending', 'Done with cold call'] as const).map(f => (
                    <button key={f} onClick={() => setFilterStatus(f)} style={{
                        padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        background: filterStatus === f ? 'var(--text-primary)' : 'transparent',
                        color: filterStatus === f ? 'var(--surface)' : 'var(--text-muted)',
                        fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.15s', whiteSpace: 'nowrap',
                    }}>
                        {f === 'Done with cold call' ? 'Called' : f}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="admin-layout">
            {/* ────────── Desktop Sidebar ────────── */}
            <aside className="admin-sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>🎯</div>
                    <span style={{ fontWeight: 800, fontSize: '1.0625rem' }}>Medios</span>
                </div>

                <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.375rem', padding: '0 0.25rem' }}>Workspace</p>

                <button style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0.5rem 0.75rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: 'var(--accent-light)', color: 'var(--accent)',
                    fontSize: '0.875rem', fontWeight: 700, width: '100%', textAlign: 'left',
                }}>
                    👥 Applications
                </button>

                <div style={{ marginTop: 'auto' }}>
                    <div style={{ borderTop: '1px solid var(--border)', marginBottom: '0.875rem' }} />
                    <button
                        onClick={() => { setAuthenticated(false); setApps([]); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '0.5rem 0.75rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                            background: 'transparent', color: 'var(--text-muted)',
                            fontSize: '0.875rem', fontWeight: 600, width: '100%', textAlign: 'left', transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                        ← Sign Out
                    </button>
                </div>
            </aside>

            {/* ────────── Right Column (topbar + main) ────────── */}
            <div className="admin-content">

                {/* Mobile Top Bar */}
                <header className="admin-topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>🎯</div>
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>Medios Admin</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={sync} style={{
                            padding: '0 12px', height: 36, borderRadius: 8, border: '1px solid var(--border-strong)',
                            background: 'var(--surface)', color: 'var(--text-secondary)',
                            fontFamily: 'inherit', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                        }}>
                            <span style={{ display: 'inline-block', animation: syncing ? 'spin 0.65s linear infinite' : 'none' }}>↻</span>
                        </button>
                        <button onClick={() => { setAuthenticated(false); setApps([]); }} style={{
                            padding: '0 12px', height: 36, borderRadius: 8,
                            borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(220,38,38,0.2)',
                            background: 'var(--red-light)', color: 'var(--red)',
                            fontFamily: 'inherit', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer',
                        }}>
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* Main */}
                <main className="admin-main">

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: 'clamp(1.375rem,3vw,1.75rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>Applications</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Review and manage all incoming applications</p>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid">
                        <StatCard label="Total" value={stats.total} color="var(--text-primary)" />
                        <StatCard label="Pending" value={stats.pending} color="var(--amber)" />
                        <StatCard label="Called" value={stats.done} color="var(--green)" />
                        <StatCard label="Converted" value={stats.converted} color="var(--accent)" />
                    </div>

                    <Toolbar />

                    {/* ── Desktop Table ── */}
                    <div className="data-table card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="table-header">
                            {['Applicant', 'Contact', 'Status', 'Converted', 'Date'].map(h => (
                                <p key={h} style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>{h}</p>
                            ))}
                        </div>

                        <AnimatePresence>
                            {filtered.map((app, i) => (
                                <motion.div key={app._id} className="table-row"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                        <Avatar name={app.fullName} />
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.fullName}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.age} · {app.gender} · {app.currentStatus}</p>
                                        </div>
                                    </div>

                                    <div style={{ minWidth: 0 }}>
                                        <a href={`https://wa.me/${app.whatsappNumber.replace(/\D/g, '')}`} target="_blank"
                                            style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--green)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                                            {app.whatsappNumber}
                                        </a>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.email}</p>
                                    </div>

                                    <div><StatusToggle app={app} /></div>
                                    <div><ConvertedPicker app={app} /></div>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filtered.length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</p>
                                <p style={{ fontWeight: 600, marginBottom: 4 }}>No records found</p>
                                <p style={{ fontSize: '0.875rem' }}>Try adjusting your search or filter.</p>
                            </div>
                        )}

                        <div style={{ padding: '0.75rem 1.5rem', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', borderRadius: '0 0 20px 20px' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                Showing {filtered.length} of {apps.length} records
                            </p>
                        </div>
                    </div>

                    {/* ── Mobile Cards ── */}
                    <div className="app-cards" style={{ flexDirection: 'column', gap: '0.875rem' }}>
                        <AnimatePresence>
                            {filtered.map((app, i) => (
                                <motion.div key={app._id}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                    className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}
                                >
                                    {/* Top row */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '0.875rem' }}>
                                        <Avatar name={app.fullName} size={44} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{app.fullName}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.age} · {app.gender} · {app.currentStatus}</p>
                                        </div>
                                        <StatusToggle app={app} />
                                    </div>

                                    {/* Contact */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                        <a href={`https://wa.me/${app.whatsappNumber.replace(/\D/g, '')}`} target="_blank"
                                            style={{
                                                display: 'flex', flexDirection: 'column', padding: '0.625rem 0.875rem',
                                                background: 'var(--green-light)', borderRadius: 10, textDecoration: 'none',
                                                borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(22,163,74,0.12)',
                                            }}>
                                            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--green)', marginBottom: 2 }}>WhatsApp</span>
                                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--green)' }}>{app.whatsappNumber}</span>
                                        </a>
                                        <div style={{
                                            display: 'flex', flexDirection: 'column', padding: '0.625rem 0.875rem',
                                            background: 'var(--surface-2)', borderRadius: 10,
                                            border: '1px solid var(--border)',
                                        }}>
                                            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 2 }}>Email</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.email}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Converted?</span>
                                            <ConvertedPicker app={app} />
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>

                                    {updatingId === app._id && (
                                        <div style={{
                                            position: 'absolute', inset: 0, borderRadius: 16,
                                            background: 'var(--surface)', opacity: 0.7,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <span className="spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'rgba(37,99,235,0.2)' }} />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filtered.length === 0 && (
                            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</p>
                                <p style={{ fontWeight: 600 }}>No records found</p>
                            </div>
                        )}
                    </div>

                </main>
            </div>{/* end .admin-content */}
        </div>
    );
}
