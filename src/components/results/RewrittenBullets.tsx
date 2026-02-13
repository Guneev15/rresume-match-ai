'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rewrite } from '@/lib/types';
import { ArrowRight, Copy, Check, RotateCcw } from 'lucide-react';

interface Props {
  rewrites: Rewrite[];
}

type ToneKey = 'improved' | 'technical' | 'product' | 'leadership';

export default function RewrittenBullets({ rewrites }: Props) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTone, setActiveTone] = useState<ToneKey>('improved');

  if (rewrites.length === 0) return null;

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getRewriteText = (rewrite: Rewrite): string => {
    if (activeTone === 'improved') return rewrite.improved;
    return rewrite.toneVariants?.[activeTone as keyof typeof rewrite.toneVariants] || rewrite.improved;
  };

  const toneOptions: { key: ToneKey; label: string }[] = [
    { key: 'improved', label: 'Default' },
    { key: 'technical', label: 'Technical' },
    { key: 'product', label: 'Product' },
    { key: 'leadership', label: 'Leadership' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card"
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <RotateCcw size={18} style={{ color: 'var(--accent)' }} />
          Rewritten Bullets
        </h3>

        {/* Tone toggle */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--bg-elevated)',
          borderRadius: '8px',
          padding: '3px',
        }}>
          {toneOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setActiveTone(opt.key)}
              style={{
                padding: '5px 10px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: activeTone === opt.key ? 600 : 400,
                background: activeTone === opt.key ? 'var(--bg-surface)' : 'transparent',
                color: activeTone === opt.key ? 'var(--accent)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rewrites.map((rewrite, i) => {
          const displayText = getRewriteText(rewrite);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
              }}
            >
              {/* Original */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Original
                </div>
                <div style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-sub)',
                  lineHeight: 1.5,
                  textDecoration: 'line-through',
                  textDecorationColor: 'var(--text-muted)',
                }}>
                  {rewrite.original}
                </div>
              </div>

              {/* Improved */}
              <div style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <ArrowRight size={16} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--accent)',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Improved
                  </div>
                  <div style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                  }}>
                    {displayText}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(displayText, i)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    color: copiedIndex === i ? 'var(--accent)' : 'var(--text-muted)',
                    flexShrink: 0,
                    transition: 'color 0.2s',
                    display: 'flex',
                  }}
                  title="Copy to clipboard"
                >
                  {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
