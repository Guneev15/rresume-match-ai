'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Clock, Award, Code, ChevronRight } from 'lucide-react';
import { LearningRoadmap, generateLearningRoadmap } from './learningService';
import { ResumeData, JobInput } from '@/lib/types';
import QuoteLoader from '@/components/QuoteLoader';

interface Props {
  resume: ResumeData;
  jobInput: JobInput;
}

export default function LearningRoadmapView({ resume, jobInput }: Props) {
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmap();
  }, [resume, jobInput]);

  const loadRoadmap = async () => {
    setLoading(true);
    try {
      const result = await generateLearningRoadmap(resume, jobInput);
      setRoadmap(result);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <QuoteLoader message="Building your personalized learning roadmap..." />;
  }

  if (!roadmap) return null;

  const priorityColors: Record<string, { bg: string; text: string }> = {
    critical: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    high: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
    medium: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
  };

  const typeIcons: Record<string, any> = {
    course: BookOpen,
    book: BookOpen,
    project: Code,
    certification: Award,
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
        Learning Roadmap
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
        {roadmap.summary || `Your personalized path to becoming a ${jobInput.jobTitle}`}
      </p>

      {/* Timeline Overview */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          flex: 1,
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent)' }}>
            {roadmap.timeline.totalWeeks}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Weeks</div>
        </div>
        <div style={{
          flex: 1,
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent)' }}>
            {roadmap.timeline.hoursPerWeek}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>hrs/week</div>
        </div>
        <div style={{
          flex: 1,
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent)' }}>
            {roadmap.missingSkills.length}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Skills to Learn</div>
        </div>
      </div>

      {/* Skills Roadmap */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {roadmap.missingSkills.map((skill, i) => {
          const colors = priorityColors[skill.priority] || priorityColors.medium;
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Skill Header */}
              <div style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: colors.text,
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {skill.skill}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: colors.bg,
                        color: colors.text,
                        fontWeight: '600',
                        textTransform: 'uppercase',
                      }}>
                        {skill.priority}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> ~{skill.estimatedWeeks} weeks
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div style={{ padding: '12px 20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.5px' }}>
                  RESOURCES
                </div>
                {skill.resources.map((resource, j) => {
                  const TypeIcon = typeIcons[resource.type] || BookOpen;
                  return (
                    <a
                      key={j}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        marginBottom: '4px',
                        transition: 'background 0.15s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <TypeIcon size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
                          {resource.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                          <span>{resource.provider}</span>
                          <span>• {resource.duration}</span>
                          {resource.free && <span style={{ color: 'var(--accent)' }}>Free</span>}
                        </div>
                      </div>
                      <ExternalLink size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    </a>
                  );
                })}
              </div>

              {/* Milestones */}
              {skill.milestones.length > 0 && (
                <div style={{ padding: '0 20px 16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    MILESTONES
                  </div>
                  {skill.milestones.map((milestone, k) => (
                    <div key={k} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 0',
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                    }}>
                      <ChevronRight size={12} style={{ color: 'var(--accent)' }} />
                      {milestone}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
