'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

export default function ApplicationForm() {
    const [form, setForm] = useState({
        fullName: '', age: '', gender: '', whatsappNumber: '', email: '', currentStatus: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handlePhoneChange = (value?: string) => {
        setForm(p => ({ ...p, whatsappNumber: value || '' }));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true); setError('');

        if (!form.whatsappNumber || !isValidPhoneNumber(form.whatsappNumber)) {
            setError('Please enter a valid  number.');
            setSubmitting(false);
            return;
        }
        try {
            const res = await fetch('/api/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) setSubmitted(true);
            else setError(data.error || 'Something went wrong.');
        } catch { setError('Network error. Please try again.'); }
        finally { setSubmitting(false); }
    };

    if (submitted) {
        return (
            <motion.div {...fadeUp} style={{ maxWidth: 480, margin: '0 auto', padding: '0 1rem' }}>
                <div className="card" style={{ padding: 'clamp(1.5rem, 5vw, 2.5rem)', textAlign: 'center' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'var(--green-light)', border: '1px solid rgba(22,163,74,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.75rem', margin: '0 auto 1.5rem',
                    }}>✅</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Application Received!</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '2rem' }}>
                        Thank you, <strong style={{ color: 'var(--text-primary)' }}>{form.fullName.split(' ')[0]}</strong>! We'll review your details and contact you soon.
                    </p>
                    <button className="btn btn-ghost" style={{ width: '100%' }}
                        onClick={() => { setForm({ fullName: '', age: '', gender: '', whatsappNumber: '', email: '', currentStatus: '' }); setSubmitted(false); }}>
                        ← Submit Another Response
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1rem' }}>

            {/* ── Header ── */}
            <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <span style={{
                    display: 'inline-block', fontSize: '0.75rem', fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--accent)', background: 'var(--accent-light)',
                    padding: '5px 14px', borderRadius: 9999, marginBottom: '1.25rem',
                    borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(59,130,246,0.2)',
                }}>
                    Limited Seats • 2026 Batch
                </span>
                <h1 style={{
                    fontSize: 'clamp(1.75rem, 5vw, 2.625rem)', fontWeight: 900,
                    lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1rem',
                }}>
                    Personal Training<br />Program 2026
                </h1>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 460, margin: '0 auto' }}>
                    A hands-on mentorship for those serious about upgrading skills, mindset, and execution. Starting <strong>March 1st, 2026</strong>.
                </p>
            </motion.div>

            {/* ── Benefits ── */}
            <motion.div {...fadeUp}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '0.625rem', marginBottom: '1.5rem',
                }}
            >
                {['Direct mentorship', 'Practical assignments', 'Real-world strategies', 'Personal accountability'].map(b => (
                    <div key={b} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: '10px 14px',
                        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)',
                    }}>
                        <span style={{ color: 'var(--green)' }}>✓</span> {b}
                    </div>
                ))}
            </motion.div>

            {/* ── Contact strip ── */}
            <motion.div {...fadeUp} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '12px 18px', marginBottom: '2rem',
                gap: '0.75rem', flexWrap: 'wrap',
            }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    📞 <strong style={{ color: 'var(--text-primary)' }}>Queries:</strong> +91 8919326355
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', flexShrink: 0 }}>
                    Let's build your next version 💪
                </p>
            </motion.div>

            {/* ── Form Card ── */}
            <motion.div {...fadeUp} className="card" style={{ padding: 'clamp(1.25rem, 5vw, 2rem)' }}>
                <p style={{
                    fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--text-muted)',
                    paddingBottom: '1rem', marginBottom: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                }}>
                    Application Form — Fill honestly
                </p>

                <form onSubmit={submit}>
                    {/* Row 1 — Name + Age */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '0.875rem', marginBottom: '0.875rem' }}>
                        <div className="field-group" style={{ margin: 0 }}>
                            <label className="field-label">Full Name <span className="req">*</span></label>
                            <input name="fullName" required className="field-input"
                                placeholder="Your full name"
                                value={form.fullName} onChange={handle} />
                        </div>
                        <div className="field-group" style={{ margin: 0 }}>
                            <label className="field-label">Age <span className="req">*</span></label>
                            <input name="age" type="number" min="16" max="60" required className="field-input"
                                placeholder="e.g. 24"
                                value={form.age} onChange={handle} />
                        </div>
                    </div>

                    {/* Row 2 — Gender + Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                        <div className="field-group" style={{ margin: 0 }}>
                            <label className="field-label">Gender <span className="req">*</span></label>
                            <select name="gender" required className="field-input"
                                value={form.gender} onChange={handle}>
                                <option value="" disabled>Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="field-group" style={{ margin: 0 }}>
                            <label className="field-label">Current Status <span className="req">*</span></label>
                            <select name="currentStatus" required className="field-input"
                                value={form.currentStatus} onChange={handle}>
                                <option value="" disabled>Select</option>
                                <option value="Student">Student</option>
                                <option value="Working Professional">Working Professional</option>
                                <option value="Freelancer">Freelancer</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3 — WhatsApp + Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.5rem' }}>
                        <div className="field-group" style={{ margin: 0 }}>
                            <label className="field-label">WhatsApp Number <span className="req">*</span></label>
                            <PhoneInput
                                defaultCountry="IN"
                                placeholder="+91 98765 43210"
                                value={form.whatsappNumber}
                                onChange={handlePhoneChange}
                                className="field-input phone-input-override"
                            />
                        </div>
                        <div className="field-group" style={{ margin: 0 }}>
                            <label className="field-label">Email Address <span className="req">*</span></label>
                            <input name="email" type="email" required className="field-input"
                                placeholder="you@example.com"
                                value={form.email} onChange={handle} />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            background: 'var(--red-light)', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(220,38,38,0.15)',
                            borderRadius: 10, padding: '10px 14px', color: 'var(--red)',
                            fontSize: '0.875rem', fontWeight: 500, marginBottom: '1.25rem',
                        }}>{error}</div>
                    )}

                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', height: 48, fontSize: '1rem' }}>
                        {submitting ? <><span className="spinner" /> Processing…</> : 'Submit Application →'}
                    </button>
                </form>
            </motion.div>

            <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
                Submit Now and Grab Your Opportunity Today!
            </p>

            {/* ── Mobile: make form rows stack on very small screens ── */}
            <style>{`
        @media (max-width: 420px) {
          form > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
        .phone-input-override {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
        }
        .phone-input-override .PhoneInputCountry {
          margin-right: 0;
          display: flex;
          align-items: center;
        }
        .phone-input-override .PhoneInputCountrySelectArrow {
          margin-left: 6px;
        }
        .phone-input-override input {
          border: none;
          background: transparent;
          outline: none;
          height: 100%;
          width: 100%;
          font-family: inherit;
          font-size: 0.9375rem;
          color: var(--text-primary);
        }
        .phone-input-override input::placeholder {
          color: var(--text-muted);
          font-weight: 400;
        }
      `}</style>
        </div>
    );
}
