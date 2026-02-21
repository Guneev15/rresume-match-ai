'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Your career is a marathon, not a sprint. Each step matters.", author: "Richard Branson" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Every expert was once a beginner. Keep pushing forward.", author: "Helen Hayes" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "What you lack in talent can be made up with desire, hustle, and giving 110%.", author: "Don Zimmer" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Your limitation — it's only your imagination.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Ben Francia" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Dream bigger. Do bigger.", author: "Unknown" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  { text: "Be so good they can't ignore you.", author: "Steve Martin" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
];

interface Props {
  message?: string;
}

export default function QuoteLoader({ message }: Props) {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => {
        let next;
        do { next = Math.floor(Math.random() * QUOTES.length); } while (next === prev);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const quote = QUOTES[quoteIndex];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      minHeight: '300px',
    }}>
      {/* Loading spinner */}
      <div style={{ marginBottom: '32px', position: 'relative' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(46, 196, 182, 0.15)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Optional message */}
      {message && (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          {message}
        </p>
      )}

      {/* Quote */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          style={{
            textAlign: 'center',
            maxWidth: '480px',
          }}
        >
          <p style={{
            fontSize: '16px',
            fontStyle: 'italic',
            color: 'var(--text-primary)',
            lineHeight: '1.7',
            marginBottom: '8px',
          }}>
            &ldquo;{quote.text}&rdquo;
          </p>
          <p style={{
            fontSize: '13px',
            color: 'var(--accent)',
            fontWeight: '500',
          }}>
            — {quote.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
