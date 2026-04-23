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

function getBarColor(score: number): string {
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--accent)';
  if (score >= 40) return 'var(--warning)';
  return 'var(--error)';
}

export default function SectionScores({ scores }: Props) {
  return (
    <div className="card-elevated" style={{ padding: '24px' }}>
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
              transition={{ duration: 0.3, delay: i * 0.06, ease: [0.4, 0, 0.2, 1] }}
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
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    height: '100%',
                    borderRadius: '999px',
                    background: getBarColor(section.score),
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
