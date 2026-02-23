'use client';

import { motion } from 'framer-motion';
import { Download, RefreshCw } from 'lucide-react';
import { AnalysisResult, JobInput } from '@/lib/types';
import SummaryCard from '@/components/results/SummaryCard';
import SectionScores from '@/components/results/SectionScores';
import ActionItems from '@/components/results/ActionItems';
import KeywordsATS from '@/components/results/KeywordsATS';
import RewrittenBullets from '@/components/results/RewrittenBullets';
import { exportAnalysisPdf } from '@/lib/exportPdf';

interface Props {
  result: AnalysisResult;
  jobInput: JobInput;
  onRecheck: () => void;
}

export default function ResultsPage({ result, jobInput, onRecheck }: Props) {
  const handleExport = () => {
    exportAnalysisPdf(result, jobInput);
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}>
            Analysis <span className="gradient-text">Results</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {jobInput.jobTitle} · {jobInput.seniority} · {jobInput.industry || 'General'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleExport}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={onRecheck}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} />
            Re-check
          </button>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div variants={fadeUp}>
        <SummaryCard result={result} />
      </motion.div>

      {/* Section Scores */}
      <motion.div variants={fadeUp}>
        <SectionScores scores={[
          { name: 'Skills', score: result.sectionScores.skillsMatch, weight: 30 },
          { name: 'Experience', score: result.sectionScores.experienceMatch, weight: 25 },
          { name: 'Education', score: result.sectionScores.education, weight: 15 },
          { name: 'ATS', score: result.sectionScores.atsReadability, weight: 15 },
          { name: 'Achievements', score: result.sectionScores.achievementQuality, weight: 15 },
        ]} />
      </motion.div>

      {/* Action Items */}
      <motion.div variants={fadeUp}>
        <ActionItems items={result.topActions.map(a => ({ action: a.text, priority: a.priority <= 1 ? 'high' as const : a.priority <= 2 ? 'medium' as const : 'low' as const, why: a.why }))} />
      </motion.div>

      {/* Keywords & ATS */}
      <motion.div variants={fadeUp}>
        <KeywordsATS keywords={result.keywordsToAdd} atsChecklist={result.atsChecklist.map(a => ({ check: a.item, passed: a.passed }))} />
      </motion.div>

      {/* Rewritten Bullets */}
      {result.rewrites && result.rewrites.length > 0 && (
        <motion.div variants={fadeUp}>
          <RewrittenBullets bullets={result.rewrites.map(r => ({ original: r.original, rewritten: r.improved, variations: r.toneVariants }))} />
        </motion.div>
      )}
    </motion.div>
  );
}
