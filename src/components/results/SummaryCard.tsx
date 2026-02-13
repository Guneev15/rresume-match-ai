'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ScoreRing from './ScoreRing';

interface Props {
  score: number;
  summary: string;
}

export default function SummaryCard({ score, summary }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '24px',
        padding: '40px 32px',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(46, 196, 182, 0.03) 100%)',
      }}
    >
      <ScoreRing score={score} />
      <div>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}>
          Here&apos;s how your resume matches the role
        </h2>
        <div style={{
          color: 'var(--text-sub)',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          maxWidth: '560px',
          margin: '0 auto',
          textAlign: 'left',
        }}>
          {(() => {
            // Parse summary into sentences for bullet points
            const sentences = summary
              .split(/\.\s+/)
              .map(s => s.trim())
              .filter(s => s.length > 0);

            return (
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                {sentences.map((sentence, i) => (
                  <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}>•</span>
                    <span>{sentence}{sentence.endsWith('.') ? '' : '.'}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
}
