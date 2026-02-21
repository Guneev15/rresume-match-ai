'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Download, Sparkles, Check } from 'lucide-react';
import { CoverLetter, generateCoverLetter } from './coverLetterService';
import { ResumeData, JobInput } from '@/lib/types';
import QuoteLoader from '@/components/QuoteLoader';

interface Props {
  resume: ResumeData;
  jobInput: JobInput;
}

export default function CoverLetterGenerator({ resume, jobInput }: Props) {
  const [company, setCompany] = useState('');
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'formal'>('professional');
  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!company.trim()) return;
    setLoading(true);
    try {
      const result = await generateCoverLetter(resume, jobInput, company.trim(), tone);
      setLetter(result);
    } catch {
      // Fallback handled in service
    } finally {
      setLoading(false);
    }
  };

  const getFullText = () => {
    if (!letter) return '';
    return [
      letter.greeting,
      '',
      letter.opening,
      '',
      ...letter.body.map(p => p + '\n'),
      letter.closing,
      '',
      letter.signature,
    ].join('\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getFullText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${company.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
        Cover Letter Generator
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Generate a tailored cover letter for your {jobInput.jobTitle} application
      </p>

      {/* Input Section */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Company Name *
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, Microsoft, Startup Inc."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-primary)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none',
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Tone
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['professional', 'enthusiastic', 'formal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                style={{
                  padding: '8px 16px',
                  background: tone === t ? 'var(--accent)' : 'var(--bg-primary)',
                  color: tone === t ? 'white' : 'var(--text-muted)',
                  border: tone === t ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !company.trim()}
          style={{
            width: '100%',
            padding: '12px',
            background: loading || !company.trim() ? 'rgba(46, 196, 182, 0.3)' : 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || !company.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} />
          {loading ? 'Generating...' : 'Generate Cover Letter'}
        </button>
      </div>

      {/* QuoteLoader while generating */}
      {loading && <QuoteLoader message="Crafting your personalized cover letter..." />}

      {/* Generated Letter */}
      <AnimatePresence>
        {letter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {/* Header with actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                <FileText size={18} />
                <span style={{ fontWeight: '600', fontSize: '15px' }}>
                  Cover Letter for {letter.metadata.company}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--bg-primary)',
                    color: copied ? 'var(--accent)' : 'var(--text-primary)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>

            {/* Letter content */}
            <div style={{
              padding: '24px',
              color: 'var(--text-primary)',
              lineHeight: '1.8',
              fontSize: '15px',
              whiteSpace: 'pre-wrap',
            }}>
              <p style={{ fontWeight: '500', marginBottom: '16px' }}>{letter.greeting}</p>
              <p style={{ marginBottom: '16px' }}>{letter.opening}</p>
              {letter.body.map((paragraph, i) => (
                <p key={i} style={{ marginBottom: '16px' }}>{paragraph}</p>
              ))}
              <p style={{ marginBottom: '16px' }}>{letter.closing}</p>
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{letter.signature}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
