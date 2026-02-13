'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import { Tag, Clipboard, Check, ShieldCheck, X as XIcon, CheckCircle } from 'lucide-react';

interface Props {
  keywords: string[];
  atsChecklist: AnalysisResult['atsChecklist'];
}

export default function KeywordsATS({ keywords, atsChecklist }: Props) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(keywords.join(', '));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Keywords */}
      {keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Tag size={18} style={{ color: 'var(--accent)' }} />
              Suggested Keywords to Add
            </h3>
            <button
              onClick={handleCopyAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: copiedAll ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-heading)',
                transition: 'all 0.2s',
              }}
            >
              {copiedAll ? <Check size={14} /> : <Clipboard size={14} />}
              {copiedAll ? 'Copied!' : 'Copy all'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {keywords.map((keyword, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.04 }}
                style={{
                  padding: '6px 14px',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 500,
                  fontSize: '0.82rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(46, 196, 182, 0.15)',
                  cursor: 'default',
                  transition: 'all 0.2s',
                }}
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ATS Checklist */}
      {atsChecklist.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card"
        >
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
            ATS & Formatting Checklist
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {atsChecklist.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '8px',
                }}
              >
                {item.passed ? (
                  <CheckCircle size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                ) : (
                  <XIcon size={16} style={{ color: 'var(--error)', flexShrink: 0 }} />
                )}
                <span style={{
                  fontSize: '0.88rem',
                  color: item.passed ? 'var(--text-sub)' : 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                }}>
                  {item.item}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
