import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, CheckCircle, XCircle, Search, Tag } from 'lucide-react';

interface ATSItem {
  check: string;
  passed: boolean;
}

interface Props {
  keywords: string[];
  atsChecklist: ATSItem[];
}

export default function KeywordsATS({ keywords, atsChecklist }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(keywords.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Keywords */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
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
            <Tag size={18} style={{ color: 'var(--accent)' }} />
            Suggested Keywords
          </h3>
          <button
            onClick={handleCopyAll}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy all'}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {keywords.map((kw, i) => (
            <motion.span
              key={kw}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="tag-pill"
            >
              {kw}
            </motion.span>
          ))}
        </div>
      </div>

      {/* ATS Checklist */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.05rem',
          fontWeight: 700,
          marginBottom: '16px',
          letterSpacing: '-0.01em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Search size={18} style={{ color: 'var(--accent)' }} />
          ATS Compatibility
          <span style={{
            fontSize: '0.72rem',
            padding: '3px 8px',
            borderRadius: '6px',
            background: atsChecklist.filter(a => a.passed).length === atsChecklist.length 
              ? 'rgba(62, 207, 180, 0.1)' 
              : 'rgba(255, 179, 71, 0.1)',
            color: atsChecklist.filter(a => a.passed).length === atsChecklist.length 
              ? 'var(--success)' 
              : 'var(--warning)',
            fontWeight: 600,
          }}>
            {atsChecklist.filter(a => a.passed).length}/{atsChecklist.length}
          </span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {atsChecklist.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: item.passed
                  ? 'rgba(62, 207, 180, 0.04)'
                  : 'rgba(255, 107, 107, 0.04)',
                border: '1px solid',
                borderColor: item.passed
                  ? 'rgba(62, 207, 180, 0.08)'
                  : 'rgba(255, 107, 107, 0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              {item.passed ? (
                <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
              ) : (
                <XCircle size={16} style={{ color: 'var(--error)', flexShrink: 0 }} />
              )}
              <span style={{
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}>
                {item.check}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
