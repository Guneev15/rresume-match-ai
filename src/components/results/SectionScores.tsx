'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionScores as SectionScoresType } from '@/lib/types';
import { Code, Briefcase, GraduationCap, FileCheck, Trophy } from 'lucide-react';

interface Props {
  scores: SectionScoresType;
}

const SECTIONS = [
  { key: 'skillsMatch' as const, label: 'Skills Match', icon: Code, weight: '40%' },
  { key: 'experienceMatch' as const, label: 'Experience Match', icon: Briefcase, weight: '30%' },
  { key: 'education' as const, label: 'Education & Certs', icon: GraduationCap, weight: '10%' },
  { key: 'atsReadability' as const, label: 'ATS Readability', icon: FileCheck, weight: '10%' },
  { key: 'achievementQuality' as const, label: 'Achievement Quality', icon: Trophy, weight: '10%' },
];

function getBarColor(score: number): string {
  if (score >= 80) return 'var(--accent)';
  if (score >= 60) return '#FFB347';
  return 'var(--error)';
}

export default function SectionScores({ scores }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card"
    >
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1rem',
        fontWeight: 700,
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        📊 Section Breakdown
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {SECTIONS.map((section, i) => {
          const Icon = section.icon;
          const score = scores[section.key];
          const color = getBarColor(score);
          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                  }}>
                    {section.label}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-elevated)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    {section.weight}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: color,
                }}>
                  {score}
                </span>
              </div>
              <div style={{
                height: '6px',
                background: 'var(--bg-elevated)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  style={{
                    height: '100%',
                    background: color,
                    borderRadius: '3px',
                    boxShadow: `0 0 8px ${color}40`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
