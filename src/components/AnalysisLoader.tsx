'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Brain, Sparkles, ListChecks } from 'lucide-react';

const STEPS = [
  { icon: FileSearch, label: 'Parsing resume', sublabel: 'Extracting text and structure' },
  { icon: Brain, label: 'Extracting skills & experience', sublabel: 'Identifying key sections' },
  { icon: Sparkles, label: 'Analyzing job fit', sublabel: 'Computing match scores' },
  { icon: ListChecks, label: 'Generating suggestions', sublabel: 'Creating recommendations' },
];

const SUBTEXTS = [
  'Reviewing your experience...',
  'Cross-referencing job requirements...',
  'Identifying areas of strength...',
  'Finding areas to improve...',
  'Crafting personalized suggestions...',
];

export default function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [subtextIndex, setSubtextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtextIndex(prev => (prev + 1) % SUBTEXTS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeOffset = circumference - (progress / 100) * circumference;

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
      {/* Circular progress ring — no spinning */}
      <div style={{
        position: 'relative',
        width: '96px',
        height: '96px',
        marginBottom: '32px',
      }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx="48" cy="48" r="40"
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth="3"
          />
          {/* Progress ring */}
          <motion.circle
            cx="48" cy="48" r="40"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        {/* Center icon — subtle pulse */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Sparkles size={22} style={{ color: 'var(--accent)' }} />
        </motion.div>
      </div>

      {/* Main text */}
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.15rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '8px',
        letterSpacing: '-0.01em',
      }}>
        Analyzing your resume...
      </h3>

      {/* Rotating subtext */}
      <AnimatePresence mode="wait">
        <motion.p
          key={subtextIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.88rem',
            marginBottom: '36px',
          }}
        >
          {SUBTEXTS[subtextIndex]}
        </motion.p>
      </AnimatePresence>

      {/* Step indicators */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        maxWidth: '300px',
        marginBottom: '28px',
      }}>
        {STEPS.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                border: isActive ? '1px solid rgba(44, 182, 125, 0.1)' : '1px solid transparent',
                transition: 'all 0.2s var(--ease-standard)',
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: isDone ? 'var(--accent)' : isActive ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s var(--ease-standard)',
              }}>
                <StepIcon size={14} style={{
                  color: isDone ? 'white' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isDone || isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-heading)',
                }}>
                  {step.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Thin progress bar */}
      <div style={{ width: '100%', maxWidth: '300px' }}>
        <div className="progress-bar" style={{ height: '3px' }}>
          <motion.div
            className="progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
}
