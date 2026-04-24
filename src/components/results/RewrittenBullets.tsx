import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, PenTool } from 'lucide-react';

interface RewrittenBullet {
  original: string;
  rewritten: string;
  variations?: {
    technical?: string;
    product?: string;
    leadership?: string;
  };
}

interface Props {
  bullets: RewrittenBullet[];
}

type Tone = 'default' | 'technical' | 'product' | 'leadership';

const TONES: { id: Tone; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'technical', label: 'Technical' },
  { id: 'product', label: 'Product' },
  { id: 'leadership', label: 'Leadership' },
];

export default function RewrittenBullets({ bullets }: Props) {
  const [selectedTone, setSelectedTone] = useState<Tone>('default');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getRewrittenText = (bullet: RewrittenBullet): string => {
    if (selectedTone === 'default') return bullet.rewritten;
    return bullet.variations?.[selectedTone] || bullet.rewritten;
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.05rem',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <PenTool size={18} style={{ color: 'var(--accent)' }} />
          Rewritten Bullets
        </h3>

        {/* Tone selector */}
        <div style={{
          display: 'flex',
          gap: '3px',
          background: 'var(--bg-elevated)',
          borderRadius: '10px',
          padding: '3px',
          border: '1px solid var(--border)',
        }}>
          {TONES.map(tone => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: selectedTone === tone.id ? 600 : 500,
                fontFamily: 'var(--font-heading)',
                color: selectedTone === tone.id ? 'white' : 'var(--text-muted)',
                background: selectedTone === tone.id
                  ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                  : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <AnimatePresence mode="wait">
          {bullets.map((bullet, i) => (
            <motion.div
              key={`${i}-${selectedTone}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              style={{
                borderRadius: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              {/* Original */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  Before
                </span>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  textDecoration: 'line-through',
                  textDecorationColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                  {bullet.original}
                </p>
              </div>

              {/* Rewritten */}
              <div style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: 'rgba(124, 92, 252, 0.03)',
              }}>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  After
                </span>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  flex: 1,
                }}>
                  {getRewrittenText(bullet)}
                </p>
                <button
                  onClick={() => handleCopy(getRewrittenText(bullet), i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: copiedIndex === i ? 'var(--success)' : 'var(--text-muted)',
                    flexShrink: 0,
                    transition: 'color 0.15s ease',
                  }}
                  title="Copy"
                >
                  {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
