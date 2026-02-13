'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { JobInput } from '@/lib/types';

interface Props {
  onChange: (job: JobInput) => void;
  initialValues?: JobInput;
}

const SENIORITY_OPTIONS: { value: JobInput['seniority']; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
];

export default function JobRoleInput({ onChange, initialValues }: Props) {
  const [jobTitle, setJobTitle] = useState(initialValues?.jobTitle || '');
  const [seniority, setSeniority] = useState<JobInput['seniority']>(initialValues?.seniority || 'mid');
  const [industry, setIndustry] = useState(initialValues?.industry || '');

  const emitChange = useCallback((title: string, sen: JobInput['seniority'], ind: string) => {
    onChange({ jobTitle: title, seniority: sen, industry: ind });
  }, [onChange]);

  useEffect(() => {
    emitChange(jobTitle, seniority, industry);
  }, [jobTitle, seniority, industry, emitChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <label
          htmlFor="job-title"
          style={{
            display: 'block',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'var(--text-sub)',
            marginBottom: '8px',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Target Role
        </label>
        <input
          id="job-title"
          type="text"
          className="input"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Software Engineer, Product Manager, Data Scientist"
        />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'var(--text-sub)',
            marginBottom: '10px',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Seniority Level
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {SENIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSeniority(opt.value); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: seniority === opt.value ? 'var(--accent)' : 'var(--bg-elevated)',
                color: seniority === opt.value ? 'var(--bg-primary)' : 'var(--text-sub)',
                border: `1px solid ${seniority === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontWeight: seniority === opt.value ? 600 : 400,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="industry"
          style={{
            display: 'block',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'var(--text-sub)',
            marginBottom: '8px',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Industry <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
        </label>
        <input
          id="industry"
          type="text"
          className="input"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="e.g. Fintech, Healthcare, E-commerce"
        />
      </div>
    </div>
  );
}
