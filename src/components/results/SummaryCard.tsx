import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import ScoreRing from './ScoreRing';

interface Props {
  result: AnalysisResult;
}

export default function SummaryCard({ result }: Props) {
  const summaryPoints = result.summary
    .split(/(?:^|\n)[-•·]\s*/)
    .filter(Boolean)
    .map(s => s.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="card-elevated"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Score Ring */}
        <div style={{ flexShrink: 0 }}>
          <ScoreRing score={result.overallScore} size={110} label="Overall" />
        </div>

        {/* Summary */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.05rem',
            fontWeight: 600,
            marginBottom: '12px',
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
          }}>
            Summary
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {summaryPoints.map((point, i) => (
              <li key={i} style={{
                fontSize: '0.85rem',
                color: 'var(--text-sub)',
                lineHeight: 1.6,
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  flexShrink: 0,
                  marginTop: '8px',
                }} />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
