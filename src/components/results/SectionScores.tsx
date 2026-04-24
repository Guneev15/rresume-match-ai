import { motion } from 'framer-motion';
import { BookOpen, Award, Briefcase, ShieldCheck, Star } from 'lucide-react';

interface SectionScore {
  name: string;
  score: number;
  weight: number;
}

interface Props {
  scores: SectionScore[];
}

const SECTION_ICONS: Record<string, any> = {
  'skills': BookOpen,
  'experience': Briefcase,
  'education': Award,
  'ats': ShieldCheck,
  'achievements': Star,
};

function getBarGradient(score: number): string {
  if (score >= 80) return 'linear-gradient(90deg, var(--accent-secondary), #2de0a6)';
  if (score >= 60) return 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))';
  if (score >= 40) return 'linear-gradient(90deg, var(--warning), #ffc966)';
  return 'linear-gradient(90deg, var(--error), #ff9494)';
}

export default function SectionScores({ scores }: Props) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.05rem',
        fontWeight: 700,
        marginBottom: '20px',
        letterSpacing: '-0.01em',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        Score Breakdown
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {scores.map((section, i) => {
          const IconComp = SECTION_ICONS[section.name.toLowerCase()] || BookOpen;
          return (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '7px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconComp size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                    textTransform: 'capitalize',
                  }}>
                    {section.name}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                  }}>
                    ×{section.weight}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                }}>
                  {section.score}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                height: '6px',
                background: 'var(--bg-elevated)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${section.score}%` }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    height: '100%',
                    borderRadius: '999px',
                    background: getBarGradient(section.score),
                    boxShadow: section.score >= 60 ? `0 0 10px ${section.score >= 80 ? 'rgba(62, 207, 180, 0.25)' : 'rgba(124, 92, 252, 0.2)'}` : 'none',
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
