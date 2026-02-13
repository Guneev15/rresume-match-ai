'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionItem } from '@/lib/types';
import { ChevronDown, AlertTriangle, Lightbulb } from 'lucide-react';

interface Props {
  actions: ActionItem[];
}

function getPriorityColor(priority: number): string {
  if (priority <= 2) return 'var(--error)';
  if (priority <= 4) return '#FFB347';
  return 'var(--accent)';
}

function getPriorityLabel(priority: number): string {
  if (priority <= 2) return 'High';
  if (priority <= 4) return 'Medium';
  return 'Helpful';
}

export default function ActionItems({ actions }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card"
    >
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1rem',
        fontWeight: 700,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Lightbulb size={18} style={{ color: 'var(--accent)' }} />
        Top Action Items
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {actions.map((action, i) => {
          const isExpanded = expandedIndex === i;
          const color = getPriorityColor(action.priority);
          const priorityLabel = getPriorityLabel(action.priority);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 16px',
                  background: isExpanded ? 'var(--bg-elevated)' : 'transparent',
                  border: `1px solid ${isExpanded ? 'var(--border-hover)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{
                    flexShrink: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: `${color}15`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}>
                    {action.priority}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      {action.text}
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${color}15`,
                        color: color,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {priorityLabel}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{
                      color: 'var(--text-muted)',
                      flexShrink: 0,
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        color: 'var(--text-sub)',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                      }}>
                        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '3px', color: 'var(--text-muted)' }} />
                        {action.why}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
