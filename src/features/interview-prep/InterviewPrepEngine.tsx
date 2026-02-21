'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, ChevronUp, Lightbulb, BookOpen, Star } from 'lucide-react';
import { InterviewPrep, generateInterviewPrep } from './interviewService';
import { ResumeData, JobInput } from '@/lib/types';
import QuoteLoader from '@/components/QuoteLoader';

interface Props {
  resume: ResumeData;
  jobInput: JobInput;
}

export default function InterviewPrepEngine({ resume, jobInput }: Props) {
  const [prep, setPrep] = useState<InterviewPrep | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'technical' | 'behavioral' | 'tips'>('technical');

  useEffect(() => {
    loadPrep();
  }, [resume, jobInput]);

  const loadPrep = async () => {
    setLoading(true);
    try {
      const result = await generateInterviewPrep(resume, jobInput);
      setPrep(result);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <QuoteLoader message="Preparing your interview questions..." />;
  }

  if (!prep) return null;

  const difficultyColors: Record<string, string> = {
    easy: '#22c55e',
    medium: '#f59e0b',
    hard: '#ef4444',
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
        Interview Prep
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Practice questions tailored for your {jobInput.jobTitle} interview
      </p>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {([
          { id: 'technical' as const, label: 'Technical', icon: BookOpen, count: prep.technicalQuestions.length },
          { id: 'behavioral' as const, label: 'Behavioral', icon: MessageSquare, count: prep.behavioralQuestions.length },
          { id: 'tips' as const, label: 'Tips', icon: Lightbulb, count: prep.generalTips.length },
        ]).map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '10px 18px',
                background: activeSection === section.id ? 'var(--accent)' : 'var(--bg-surface)',
                color: activeSection === section.id ? 'white' : 'var(--text-primary)',
                border: activeSection === section.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Icon size={14} />
              {section.label} ({section.count})
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'technical' && (
          <motion.div key="tech" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gap: '12px' }}>
            {prep.technicalQuestions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpandedQ(expandedQ === `t-${i}` ? null : `t-${i}`)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: `${difficultyColors[q.difficulty]}20`,
                        color: difficultyColors[q.difficulty],
                        fontWeight: '600',
                        textTransform: 'uppercase',
                      }}>
                        {q.difficulty}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{q.category}</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {q.question}
                    </div>
                  </div>
                  {expandedQ === `t-${i}` ? (
                    <ChevronUp size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '12px' }} />
                  ) : (
                    <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '12px' }} />
                  )}
                </button>

                <AnimatePresence>
                  {expandedQ === `t-${i}` && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        padding: '0 20px 16px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <div style={{ padding: '12px', background: 'rgba(46, 196, 182, 0.05)', borderRadius: '8px', marginTop: '12px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', marginBottom: '6px' }}>
                            Sample Answer
                          </div>
                          <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                            {q.sampleAnswer}
                          </div>
                        </div>
                        {q.tips && (
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '8px 12px' }}>
                            <Lightbulb size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{q.tips}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeSection === 'behavioral' && (
          <motion.div key="behav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gap: '12px' }}>
            {prep.behavioralQuestions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpandedQ(expandedQ === `b-${i}` ? null : `b-${i}`)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={14} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {q.question}
                    </span>
                  </div>
                  {expandedQ === `b-${i}` ? (
                    <ChevronUp size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  )}
                </button>

                <AnimatePresence>
                  {expandedQ === `b-${i}` && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', margin: '12px 0 8px', letterSpacing: '1px' }}>
                          STAR FRAMEWORK
                        </div>
                        {(['situation', 'task', 'action', 'result'] as const).map(step => (
                          <div key={step} style={{
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '8px',
                            padding: '10px 12px',
                            background: 'rgba(46, 196, 182, 0.03)',
                            borderRadius: '8px',
                            borderLeft: '3px solid var(--accent)',
                          }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '700',
                              color: 'var(--accent)',
                              textTransform: 'uppercase',
                              minWidth: '70px',
                            }}>
                              {step}
                            </span>
                            <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                              {q.starFramework[step]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeSection === 'tips' && (
          <motion.div key="tips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gap: '12px' }}>
            {prep.generalTips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  flexShrink: 0,
                }}>
                  <Lightbulb size={16} style={{ color: '#f59e0b' }} />
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{tip}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
