'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  score: number;
  size?: number;
  label?: string;
}

export default function ScoreRing({ score, size = 110, label }: Props) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const [displayScore, setDisplayScore] = useState(0);

  const motionScore = useMotionValue(0);
  const strokeDashoffset = useTransform(motionScore, [0, 100], [circumference, 0]);

  useEffect(() => {
    const controls = animate(motionScore, score, {
      duration: 1,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });
    return () => controls.stop();
  }, [score, motionScore]);

  const getColor = (s: number) => {
    if (s >= 80) return 'var(--success)';
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
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
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
        {/* Progress — solid accent color, no gradient */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
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
      }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: size > 80 ? '1.5rem' : '1.1rem',
          fontWeight: 700,
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
