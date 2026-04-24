'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  score: number;
  size?: number;
  label?: string;
}

export default function ScoreRing({ score, size = 110, label }: Props) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const [displayScore, setDisplayScore] = useState(0);

  const motionScore = useMotionValue(0);
  const strokeDashoffset = useTransform(motionScore, [0, 100], [circumference, 0]);

  useEffect(() => {
    const controls = animate(motionScore, score, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });
    return () => controls.stop();
  }, [score, motionScore]);

  const getColor = (s: number) => {
    if (s >= 80) return 'var(--accent-secondary)';
    if (s >= 60) return 'var(--accent)';
    if (s >= 40) return 'var(--warning)';
    return 'var(--error)';
  };

  const color = getColor(score);

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        inset: '-6px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        filter: 'blur(8px)',
      }} />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={strokeWidth}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`scoreGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--gradient-start)" />
            <stop offset="100%" stopColor="var(--gradient-end)" />
          </linearGradient>
        </defs>
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#scoreGradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
      </svg>

      {/* Center text */}
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: size > 80 ? '1.6rem' : '1.2rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          {displayScore}
        </span>
        {label && (
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            marginTop: '2px',
            fontFamily: 'var(--font-heading)',
          }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
