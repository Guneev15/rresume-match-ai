'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Send, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/contexts/UserContext';

interface Props {
  featureId: string;
  featureLabel: string;
}

export default function FeedbackWidget({ featureId, featureLabel }: Props) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);

    try {
      await supabase.from('feedback').insert({
        user_id: user?.id || null,
        feature_id: featureId,
        rating,
        comment: comment.trim() || null,
        anonymous: !user,
      } as any);
    } catch {
      // Continue silently
    }

    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setRating(0);
      setComment('');
    }, 2000);
  };

  return (
    <>
      {/* FAB Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px var(--accent-glow)',
          zIndex: 1000,
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 24px var(--accent-glow)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px var(--accent-glow)';
        }}
      >
        <MessageSquare size={20} />
      </button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card"
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '24px',
              width: '320px',
              background: 'rgba(18, 18, 26, 0.95)',
              border: '1px solid rgba(124, 92, 252, 0.12)',
              overflow: 'hidden',
              zIndex: 1001,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 24px rgba(124, 92, 252, 0.06)',
              padding: 0,
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
              }}>
                Rate {featureLabel}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
              {submitted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ textAlign: 'center', padding: '20px 0' }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'rgba(62, 207, 180, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}>
                    <Check size={24} style={{ color: 'var(--success)' }} />
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    Thank you!
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Your feedback helps us improve
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Stars */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                          transform: (hoveredStar >= star || rating >= star) ? 'scale(1.15)' : 'scale(1)',
                        }}
                      >
                        <Star
                          size={28}
                          fill={(hoveredStar >= star || rating >= star) ? '#f59e0b' : 'none'}
                          style={{ color: (hoveredStar >= star || rating >= star) ? '#f59e0b' : 'var(--text-muted)' }}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Comment */}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any suggestions? (optional)"
                    rows={3}
                    className="input"
                    style={{
                      resize: 'none',
                      marginBottom: '12px',
                      fontSize: '0.85rem',
                    }}
                  />

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || submitting}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '10px',
                      fontSize: '0.88rem',
                    }}
                  >
                    <Send size={14} />
                    {submitting ? 'Sending...' : 'Submit Feedback'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
