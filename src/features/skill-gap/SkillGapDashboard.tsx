import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BookOpen, Award, Target, ExternalLink } from 'lucide-react';
import { ResumeData, JobInput } from '@/lib/types';
import { analyzeSkillGaps, SkillGapAnalysis } from './skillGapService';
import QuoteLoader from '@/components/QuoteLoader';

interface SkillGapDashboardProps {
  resume: ResumeData;
  jobInput: JobInput;
}

export default function SkillGapDashboard({ resume, jobInput }: SkillGapDashboardProps) {
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);

  useEffect(() => {
    const result = analyzeSkillGaps(resume, jobInput);
    setAnalysis(result);
  }, [resume, jobInput]);

  if (!analysis) {
    return <QuoteLoader message="Analyzing your skill gaps..." />;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
          Skill Gap Analysis
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Comparing your skills against {jobInput.jobTitle} requirements
        </p>
      </div>

      {/* Overall Strength */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: `conic-gradient(var(--accent) ${analysis.overallStrength * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--accent)',
              }}
            >
              {analysis.overallStrength}%
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
              Overall Match Strength
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {analysis.overallStrength >= 70
                ? 'Strong match! You have most required skills.'
                : analysis.overallStrength >= 50
                ? 'Good foundation. Some skills need development.'
                : 'Significant skill gaps. Focus on learning key skills.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)', marginBottom: '4px' }}>
              {analysis.matchedSkills.length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Matched Skills</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#fbbf24', marginBottom: '4px' }}>
              {analysis.missingSkills.length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Skills to Learn</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {analysis.experienceDistribution.reduce((sum, cat) => sum + cat.years, 0).toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Years Experience</div>
          </div>
        </div>
      </motion.div>

      {/* Matched Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Your Strengths ({analysis.matchedSkills.length})
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {analysis.matchedSkills.map((skill, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(46, 196, 182, 0.05)',
                border: '1px solid rgba(46, 196, 182, 0.2)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {skill.skill}
                </div>
                <div
                  style={{
                    padding: '4px 12px',
                    background: 'rgba(46, 196, 182, 0.2)',
                    color: 'var(--accent)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {skill.proficiency}% Proficiency
                </div>
              </div>

              {/* Proficiency Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: `${skill.proficiency}%`,
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: '3px',
                  }}
                />
              </div>

              {/* Evidence */}
              {skill.evidence.length > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  <strong>Evidence:</strong> {skill.evidence[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Missing Skills */}
      {analysis.missingSkills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target size={20} style={{ color: '#fbbf24' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Skills to Develop ({analysis.missingSkills.length})
            </h3>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {analysis.missingSkills.map((skill, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(251, 191, 36, 0.05)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {skill.skill}
                  </div>
                  <div
                    style={{
                      padding: '4px 12px',
                      background:
                        skill.importance === 'critical'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : skill.importance === 'high'
                          ? 'rgba(251, 191, 36, 0.2)'
                          : 'rgba(156, 163, 175, 0.2)',
                      color:
                        skill.importance === 'critical'
                          ? '#ef4444'
                          : skill.importance === 'high'
                          ? '#fbbf24'
                          : '#9ca3af',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}
                  >
                    {skill.importance}
                  </div>
                </div>

                {/* Learning Resources */}
                {skill.learningResources && skill.learningResources.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={12} />
                      Learning Resources:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {skill.learningResources.map((resource, i) => (
                        <a
                          key={i}
                          href={`https://www.google.com/search?q=${encodeURIComponent(resource)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(251, 191, 36, 0.1)',
                            color: '#fbbf24',
                            borderRadius: '6px',
                            fontSize: '12px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {resource}
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Experience Distribution */}
      {analysis.experienceDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Award size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Experience Distribution
            </h3>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {analysis.experienceDistribution.map((cat, index) => {
              const maxYears = Math.max(...analysis.experienceDistribution.map(c => c.years));
              const percentage = (cat.years / maxYears) * 100;

              return (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {cat.category}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      {cat.years.toFixed(1)} years
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'var(--accent)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
