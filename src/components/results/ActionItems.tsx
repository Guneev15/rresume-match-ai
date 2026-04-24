import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, ArrowUpCircle, Info, CheckCircle } from 'lucide-react';

interface ActionItem {
  action: string;
  priority: 'high' | 'medium' | 'low';
  why: string;
}

interface Props {
  items: ActionItem[];
}

const PRIORITY_STYLES: Record<string, { bg: string; border: string; color: string; icon: any }> = {
  high: { bg: 'rgba(255, 107, 107, 0.08)', border: 'rgba(255, 107, 107, 0.15)', color: '#FF6B6B', icon: AlertTriangle },
  medium: { bg: 'rgba(255, 179, 71, 0.08)', border: 'rgba(255, 179, 71, 0.15)', color: '#FFB347', icon: ArrowUpCircle },
  low: { bg: 'rgba(62, 207, 180, 0.08)', border: 'rgba(62, 207, 180, 0.15)', color: '#3ECFB4', icon: Info },
};

export default function ActionItems({ items }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.05rem',
        fontWeight: 700,
        marginBottom: '18px',
        letterSpacing: '-0.01em',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <CheckCircle size={18} style={{ color: 'var(--accent)' }} />
        Action Items
        <span style={{
          fontSize: '0.72rem',
          padding: '3px 8px',
          borderRadius: '6px',
          background: 'var(--accent-subtle)',
          color: 'var(--accent)',
          fontWeight: 600,
          marginLeft: '4px',
        }}>
          {items.length}
        </span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => {
          const priorityStyle = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.low;
          const PriorityIcon = priorityStyle.icon;
          const isExpanded = expandedIndex === i;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              style={{
                borderRadius: '12px',
                border: `1px solid ${isExpanded ? priorityStyle.border : 'var(--border)'}`,
                background: isExpanded ? priorityStyle.bg : 'var(--bg-surface)',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
              }}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                }}
              >
                <PriorityIcon size={16} style={{ color: priorityStyle.color, flexShrink: 0 }} />
                <span style={{
                  flex: 1,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}>
                  {item.action}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: priorityStyle.bg,
                  color: priorityStyle.color,
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}>
                  {item.priority}
                </span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '0 14px 14px 40px',
                      fontSize: '0.82rem',
                      color: 'var(--text-sub)',
                      lineHeight: 1.7,
                    }}>
                      {item.why}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
