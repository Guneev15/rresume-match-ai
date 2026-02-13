'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult, JobInput } from '@/lib/types';
import SummaryCard from './results/SummaryCard';
import SectionScores from './results/SectionScores';
import ActionItems from './results/ActionItems';
import RewrittenBullets from './results/RewrittenBullets';
import KeywordsATS from './results/KeywordsATS';
import { RefreshCw, Download } from 'lucide-react';

interface Props {
  result: AnalysisResult;
  jobInput: JobInput;
  onRecheck: () => void;
}

export default function ResultsPage({ result, jobInput, onRecheck }: Props) {
  const handleDownload = () => {
    const data = {
      job: jobInput,
      analysis: result,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-analysis-${jobInput.jobTitle.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '720px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            fontWeight: 800,
            marginBottom: '4px',
          }}>
            Your Analysis
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {jobInput.jobTitle} · {jobInput.seniority.charAt(0).toUpperCase() + jobInput.seniority.slice(1)}
            {jobInput.industry ? ` · ${jobInput.industry}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={handleDownload} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Download size={16} />
            Export
          </button>
          <button className="btn-primary" onClick={onRecheck} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <RefreshCw size={16} />
            Improve & Re-check
          </button>
        </div>
      </motion.div>

      {/* Summary + Score */}
      <SummaryCard score={result.overallScore} summary={result.summary} />

      {/* Section Scores */}
      <SectionScores scores={result.sectionScores} />

      {/* Action Items */}
      {result.topActions.length > 0 && (
        <ActionItems actions={result.topActions} />
      )}

      {/* Rewritten Bullets */}
      <RewrittenBullets rewrites={result.rewrites} />

      {/* Keywords + ATS */}
      <KeywordsATS keywords={result.keywordsToAdd} atsChecklist={result.atsChecklist} />

      {/* Score breakdown explanation */}
      {result.explainability.scoreBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card"
          style={{ borderLeft: '3px solid var(--accent)' }}
        >
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}>
            How This Score Was Computed
          </h3>
          <div style={{
            color: 'var(--text-sub)',
            fontSize: '0.88rem',
            lineHeight: 1.7,
          }}>
            {(() => {
              // Parse the breakdown text into bullet points
              // Expected format: "SectionName (score): explanation. AnotherSection (score): explanation."
              const breakdown = result.explainability.scoreBreakdown;
              const sections = breakdown.split(/\.\s+(?=[A-Z])/); // Split on ". " followed by capital letter
              
              return (
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  {sections.map((section, i) => {
                    const trimmed = section.trim();
                    if (!trimmed) return null;
                    
                    // Extract section name and score if present
                    const match = trimmed.match(/^([^(]+)\s*\((\d+)\):\s*(.+)$/);
                    if (match) {
                      const [, name, score, explanation] = match;
                      return (
                        <li key={i} style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span>
                          <span>
                            <strong style={{ color: 'var(--text-primary)' }}>
                              {name.trim()} ({score})
                            </strong>
                            : {explanation.trim()}
                          </span>
                        </li>
                      );
                    }
                    
                    // Fallback for non-matching format
                    return (
                      <li key={i} style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span>
                        <span>{trimmed}</span>
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Bottom encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          textAlign: 'center',
          padding: '24px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          lineHeight: 1.6,
        }}
      >
        <p>Nice work reviewing your resume! A few focused edits can make a big difference.</p>
        <p style={{ marginTop: '4px' }}>
          Hit <strong style={{ color: 'var(--accent)' }}>Improve & Re-check</strong> after making changes to see your updated score.
        </p>
      </motion.div>
    </div>
  );
}
