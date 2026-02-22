'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Brain, Sparkles, ListChecks, Quote } from 'lucide-react';

const STEPS = [
  { icon: FileSearch, label: 'Parsing resume', sublabel: 'Extracting text and structure' },
  { icon: Brain, label: 'Extracting skills & experience', sublabel: 'Identifying key sections' },
  { icon: Sparkles, label: 'Analyzing job fit', sublabel: 'Computing match scores' },
  { icon: ListChecks, label: 'Generating suggestions', sublabel: 'Creating actionable recommendations' },
];

const QUOTES = [
  '"Opportunities don\'t happen. You create them." \u2013 Chris Grosser',
  '"Success usually comes to those who are too busy to be looking for it." \u2013 Henry David Thoreau',
  '"Don\'t be afraid to give up the good to go for the great." \u2013 John D. Rockefeller',
  '"The only way to do great work is to love what you do." \u2013 Steve Jobs',
  '"Your career is a marathon, not a sprint." \u2013 Unknown',
];

export default function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      {/* Pulsing gradient spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, var(--gradient-start), var(--gradient-end), transparent)',
          padding: '3px',
          marginBottom: '32px',
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={24} style={{ color: 'var(--accent)' }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Steps */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        maxWidth: '320px',
        marginBottom: '32px',
      }}>
        {STEPS.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                border: isActive ? '1px solid rgba(124, 92, 252, 0.12)' : '1px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isDone
                  ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                  : isActive
                    ? 'var(--accent-subtle)'
                    : 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.3s ease',
              }}>
                <StepIcon size={15} style={{
                  color: isDone ? 'white' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isDone || isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-heading)',
                }}>
                  {step.label}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '1px',
                }}>
                  {step.sublabel}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        maxWidth: '320px',
        marginBottom: '28px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          <span>Processing...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar" style={{ height: '4px' }}>
          <motion.div
            className="progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Motivational quote */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            fontStyle: 'italic',
            maxWidth: '400px',
          }}
        >
          <Quote size={14} style={{ flexShrink: 0, color: 'var(--accent)', opacity: 0.6 }} />
          {QUOTES[quoteIndex]}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
