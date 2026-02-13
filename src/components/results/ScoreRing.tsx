'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  score: number;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#2EC4B6';
  if (score >= 70) return '#2EC4B6';
  if (score >= 50) return '#FFB347';
  return '#FF6B6B';
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Strong Match';
  if (score >= 70) return 'Good Match';
  if (score >= 50) return 'Moderate';
  return 'Low Match';
}

export default function ScoreRing({ score, size = 160 }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.1s ease',
              filter: `drop-shadow(0 0 8px ${color}40)`,
            }}
          />
        </svg>
        {/* Center score text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: `${size / 4}px`,
            fontWeight: 800,
            color: color,
            lineHeight: 1,
          }}>
            {animatedScore}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '4px',
          }}>
            / 100
          </span>
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
        fontSize: '0.95rem',
        color: color,
        padding: '4px 14px',
        background: `${color}15`,
        borderRadius: '20px',
      }}>
        {label}
      </div>
    </motion.div>
  );
}
