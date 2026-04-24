'use client';

import { useState, useCallback, useEffect } from 'react';
import { JobInput } from '@/lib/types';
import { Briefcase, ChevronDown } from 'lucide-react';

interface Props {
  onChange: (input: JobInput) => void;
  initialValues?: Partial<JobInput>;
}

const SENIORITY_OPTIONS = ['junior', 'mid', 'senior'] as const;

export default function JobRoleInput({ onChange, initialValues }: Props) {
  const [jobTitle, setJobTitle] = useState(initialValues?.jobTitle || '');
  const [seniority, setSeniority] = useState(initialValues?.seniority || 'mid');
  const [industry, setIndustry] = useState(initialValues?.industry || '');

  const emitChange = useCallback(() => {
    onChange({ jobTitle, seniority, industry });
  }, [jobTitle, seniority, industry, onChange]);

  useEffect(() => {
    emitChange();
  }, [emitChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Target Role */}
      <div>
        <label htmlFor="job-title" style={{
          display: 'block',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--text-sub)',
          marginBottom: '8px',
          fontFamily: 'var(--font-heading)',
          letterSpacing: '0.01em',
        }}>
          Target Role
        </label>
        <div style={{ position: 'relative' }}>
          <Briefcase size={16} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }} />
          <input
            id="job-title"
            type="text"
            className="input"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Software Engineer, Product Manager, Data Scientist"
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Seniority Level */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--text-sub)',
          marginBottom: '8px',
          fontFamily: 'var(--font-heading)',
          letterSpacing: '0.01em',
        }}>
          Seniority Level
        </label>
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--bg-elevated)',
          borderRadius: '12px',
          padding: '4px',
          border: '1px solid var(--border)',
        }}>
          {SENIORITY_OPTIONS.map(level => (
            <button
              key={level}
              type="button"
              onClick={() => setSeniority(level)}
              style={{
                flex: 1,
                padding: '8px 6px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: seniority === level ? 600 : 500,
                fontFamily: 'var(--font-heading)',
                textTransform: 'capitalize',
                color: seniority === level ? 'white' : 'var(--text-muted)',
                background: seniority === level
                  ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                  : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: seniority === level ? '0 2px 8px var(--accent-glow)' : 'none',
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="industry" style={{
          display: 'block',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--text-sub)',
          marginBottom: '8px',
          fontFamily: 'var(--font-heading)',
          letterSpacing: '0.01em',
        }}>
          Industry <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="industry"
            type="text"
            className="input"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Fintech, Healthcare, SaaS"
          />
          <ChevronDown size={16} style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>
    </div>
  );
}
