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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card"
      style={{
        background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.06) 0%, rgba(62, 207, 180, 0.03) 100%)',
        border: '1px solid rgba(124, 92, 252, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow orb */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(124, 92, 252, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

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
            fontWeight: 700,
            marginBottom: '12px',
            letterSpacing: '-0.01em',
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
                  background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
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
