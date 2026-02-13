'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, FileSearch, Brain, Sparkles, ListChecks } from 'lucide-react';

const STEPS = [
  { icon: FileSearch, label: 'Parsing resume', sublabel: 'Extracting text and structure' },
  { icon: Brain, label: 'Extracting skills & experience', sublabel: 'Identifying key sections' },
  { icon: Sparkles, label: 'Analyzing job fit', sublabel: 'Computing match scores' },
  { icon: ListChecks, label: 'Generating suggestions', sublabel: 'Creating actionable recommendations' },
];

export default function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '40px 20px',
    }}>
      {/* Pulsing main icon */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--accent-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
        }}
      >
        <Loader2 size={36} style={{ color: 'var(--accent)' }} className="animate-spin" />
      </motion.div>

      <h2 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.3rem',
        fontWeight: 700,
        marginBottom: '8px',
        color: 'var(--text-primary)',
      }}>
        Analyzing your resume
      </h2>
      <p style={{
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        marginBottom: '40px',
      }}>
        This usually takes 10–20 seconds
      </p>

      {/* Steps progress */}
      <div style={{ width: '100%', maxWidth: '380px' }}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '8px',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                transition: 'background 0.3s ease',
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isDone ? 'var(--accent)' : isActive ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                flexShrink: 0,
              }}>
                <Icon size={18} style={{
                  color: isDone ? 'var(--bg-primary)' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                }} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: isDone || isActive ? 600 : 400,
                  fontSize: '0.9rem',
                  color: isDone ? 'var(--accent)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'color 0.3s ease',
                }}>
                  {step.label}
                  {isDone && ' ✓'}
                </div>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}
                  >
                    {step.sublabel}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: '380px', marginTop: '16px' }}>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
