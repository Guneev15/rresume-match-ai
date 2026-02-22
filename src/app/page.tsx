'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, FileWarning, Target, ShieldCheck, Lightbulb } from 'lucide-react';
import { AppState, JobInput, AnalysisResult, ResumeData } from '@/lib/types';
import { parseResumeFile } from '@/lib/resumeParser';
import { extractFields } from '@/lib/extractFields';
import { analyzeWithAI } from '@/lib/analyzeResume';
import { fallbackAnalysis } from '@/lib/fallbackAnalysis';
import JobRoleInput from '@/components/JobRoleInput';
import ResumeUpload from '@/components/ResumeUpload';
import AnalysisLoader from '@/components/AnalysisLoader';
import Dashboard from '@/components/Dashboard';
import AuthModal from '@/components/AuthModal';
import { useUser } from '@/contexts/UserContext';
import { ResumeService, AnalysisService } from '@/lib/supabase/services';

export default function Home() {
  const { user, profile, loading: authLoading } = useUser();
  const [appState, setAppState] = useState<AppState>('input');
  const [jobInput, setJobInput] = useState<JobInput>({ jobTitle: '', seniority: 'mid', industry: '' });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const jobInputRef = useRef<JobInput>(jobInput);



  const handleJobInput = useCallback((input: JobInput) => {
    setJobInput(input);
    jobInputRef.current = input;
  }, []);

  const handleFileSelected = useCallback((file: File) => {
    setResumeFile(file);
    setResumeText('');
    setError(null);
    setParseWarnings([]);
  }, []);

  const handleTextPaste = useCallback((text: string) => {
    setResumeText(text);
    setResumeFile(null);
    setError(null);
    setParseWarnings([]);
  }, []);

  const handleAnalyze = async () => {
    const currentJob = jobInputRef.current;
    if (!currentJob.jobTitle.trim()) {
      setError('Please enter a target job role.');
      return;
    }
    if (!resumeFile && !resumeText.trim()) {
      setError('Please upload a resume or paste your resume text.');
      return;
    }

    setError(null);
    setAppState('loading');

    try {
      // Step 1: Parse resume
      let text = resumeText;
      const warnings: string[] = [];

      if (resumeFile) {
        const parsed = await parseResumeFile(resumeFile);
        text = parsed.text;
        warnings.push(...parsed.warnings);
      }

      if (!text.trim()) {
        throw new Error('Could not extract text from the resume. Please try pasting the text directly.');
      }

      setParseWarnings(warnings);

      // Step 2: Extract structured fields
      const extractedData: ResumeData = extractFields(text);
      warnings.push(...extractedData.parseWarnings);
      setParseWarnings(warnings);
      setResumeData(extractedData);

      // Step 3: Analyze with hardcoded API key from environment
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

      let analysisResult: AnalysisResult;

      if (apiKey) {
        try {
          analysisResult = await analyzeWithAI(text, currentJob, apiKey);
        } catch (aiError: unknown) {
          console.warn('AI analysis failed, falling back to rule-based:', aiError);
          analysisResult = fallbackAnalysis(extractedData, currentJob);
          const errMsg = (aiError as { error?: { message?: string }; message?: string })?.error?.message
            || (aiError as Error)?.message
            || 'Unknown error';
          warnings.push(`AI analysis failed: ${errMsg}. Showing basic keyword-based analysis.`);
          setParseWarnings([...warnings]);
        }
      } else {
        analysisResult = fallbackAnalysis(extractedData, currentJob);
        warnings.push('API key not configured. Contact the administrator.');
        setParseWarnings([...warnings]);
      }

      // Step 4: Save to database if user is logged in
      if (user && profile) {
        try {
          // Save resume
          const savedResume = await ResumeService.saveResume(
            user.id,
            resumeFile?.name || 'Pasted Resume',
            text,
            extractedData
          ) as any;

          // Save analysis
          await AnalysisService.saveAnalysis(
            user.id,
            savedResume.id,
            currentJob,
            analysisResult
          );
          
          // Silent success - no console logs in production
        } catch (dbError: any) {
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.warn('Database save failed (app continues normally):', dbError?.message);
          }
          // Continue anyway - don't block the user
        }
      }

      setResult(analysisResult);
      setAppState('results');
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      // Translate common network errors into user-friendly messages
      let friendlyMsg: string;
      if (rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError') || rawMsg.includes('fetch')) {
        friendlyMsg = 'Network error — please check your internet connection and try again. If the issue persists, the AI service may be temporarily unavailable.';
      } else if (rawMsg.includes('abort') || rawMsg.includes('timeout')) {
        friendlyMsg = 'Analysis timed out. Please try again — shorter resumes analyze faster.';
      } else {
        friendlyMsg = rawMsg || 'An unexpected error occurred. Please try again.';
      }
      setError(friendlyMsg);
      setAppState('input');
    }
  };

  const handleRecheck = () => {
    setResult(null);
    setResumeData(null);
    setAppState('input');
  };

  const isReadyToAnalyze = jobInput.jobTitle.trim() && (resumeFile || resumeText.trim());

  /* ── Animation variants ── */
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  return (
    <>
      {/* ── Navbar ── */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 24px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={16} style={{ color: 'white' }} />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            ResumeMatch
            <span className="gradient-text">AI</span>
          </span>
        </div>
        
        {!authLoading && (
          <div>
            {user ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                color: 'var(--text-muted)',
                fontSize: '14px',
              }}>
                <span style={{ color: 'var(--text-sub)' }}>👋 {profile?.full_name || user.email}</span>
                <button
                  onClick={async () => {
                    const { signOut } = await import('@/lib/supabase/client').then(m => ({ signOut: () => m.supabase.auth.signOut() }));
                    await signOut();
                    window.location.reload();
                  }}
                  style={{
                    padding: '6px 14px',
                    background: 'rgba(255, 107, 107, 0.08)',
                    color: '#FF6B6B',
                    border: '1px solid rgba(255, 107, 107, 0.15)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    fontFamily: 'var(--font-heading)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 107, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 107, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.15)';
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '13px',
                }}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>

      {/* ── Main content ── */}
      <main style={{
        flex: 1,
        padding: '32px 24px 64px',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
      }}>
        <AnimatePresence mode="wait">
          {appState === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              {/* ── Hero — SEO Optimized ── */}
              <div style={{
                textAlign: 'center',
                marginBottom: '48px',
                marginTop: '32px',
                position: 'relative',
              }}>
                {/* Gradient glow behind hero */}
                <div style={{
                  position: 'absolute',
                  top: '-60px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '400px',
                  height: '200px',
                  background: 'radial-gradient(ellipse, rgba(124, 92, 252, 0.12) 0%, rgba(62, 207, 180, 0.06) 50%, transparent 80%)',
                  pointerEvents: 'none',
                  filter: 'blur(40px)',
                }} />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2rem, 4.5vw, 2.8rem)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: '20px',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                  }}>
                    AI Resume Analyzer &amp;
                    <br />
                    <span className="gradient-text">Job Match Optimizer</span>
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{
                    color: 'var(--text-sub)',
                    fontSize: '1.05rem',
                    maxWidth: '520px',
                    margin: '0 auto',
                    lineHeight: 1.7,
                  }}
                >
                  Upload your resume to instantly check job compatibility, ATS score,
                  and improvement suggestions. Our AI-powered resume analyzer helps
                  optimize keywords, skills, and structure to match real job profiles
                  — giving you a smarter edge in applications.
                </motion.p>
              </div>

              {/* ── Feature Cards — SEO Semantic Headings ── */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px',
                  marginBottom: '40px',
                }}
              >
                {[
                  { icon: Target, title: 'Resume Job Matching', desc: 'Analyze how well your resume aligns with specific job roles using intelligent keyword and skill matching.' },
                  { icon: ShieldCheck, title: 'ATS Optimization', desc: 'Ensure your resume passes applicant tracking systems with optimized formatting and targeted keywords.' },
                  { icon: Lightbulb, title: 'Smart Resume Feedback', desc: 'Get personalized insights on what to improve, rewrite, or highlight to increase interview chances.' },
                ].map((card) => (
                  <motion.div
                    key={card.title}
                    variants={staggerItem}
                    className="glass-card hover-lift"
                    style={{ textAlign: 'center', padding: '24px 20px' }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'var(--accent-subtle)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}>
                      <card.icon size={22} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h2 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      marginBottom: '8px',
                      letterSpacing: '-0.01em',
                    }}>
                      {card.title}
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                      {card.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* ── Input sections ── */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
              >
                {/* Step 1 — Target Job */}
                <motion.div variants={staggerItem} className="card">
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <span style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                      color: 'white',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      1
                    </span>
                    Target Job
                  </h2>
                  <JobRoleInput onChange={handleJobInput} initialValues={jobInput} />
                </motion.div>

                {/* Step 2 — Resume */}
                <motion.div variants={staggerItem} className="card">
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <span style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                      color: 'white',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      2
                    </span>
                    Your Resume
                  </h2>
                  <ResumeUpload
                    onFileSelected={handleFileSelected}
                    onTextPaste={handleTextPaste}
                    initialText={resumeText}
                  />
                </motion.div>

                {/* Warnings */}
                <AnimatePresence>
                  {parseWarnings.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      {parseWarnings.map((w, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '10px 14px',
                          background: 'rgba(255, 179, 71, 0.06)',
                          border: '1px solid rgba(255, 179, 71, 0.12)',
                          borderRadius: '10px',
                          fontSize: '0.82rem',
                          color: 'var(--warning)',
                          lineHeight: 1.5,
                        }}>
                          <FileWarning size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                          {w}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        background: 'rgba(255, 107, 107, 0.08)',
                        border: '1px solid rgba(255, 107, 107, 0.15)',
                        borderRadius: '12px',
                        color: 'var(--error)',
                        fontSize: '0.9rem',
                      }}
                    >
                      <AlertCircle size={18} style={{ flexShrink: 0 }} />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analyze button */}
                <motion.div variants={staggerItem}>
                  <button
                    className="btn-primary"
                    onClick={handleAnalyze}
                    disabled={!isReadyToAnalyze}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '16px',
                      fontSize: '1rem',
                      borderRadius: '14px',
                    }}
                  >
                    <Sparkles size={18} />
                    Analyze My Resume
                  </button>
                </motion.div>

              </motion.div>
            </motion.div>
          )}

          {appState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnalysisLoader />
            </motion.div>
          )}

          {appState === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              {/* Parse warnings at top of results */}
              {parseWarnings.length > 0 && (
                <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {parseWarnings.map((w, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '10px 14px',
                      background: 'rgba(255, 179, 71, 0.06)',
                      border: '1px solid rgba(255, 179, 71, 0.12)',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      color: 'var(--warning)',
                      lineHeight: 1.5,
                    }}>
                      <FileWarning size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      {w}
                    </div>
                  ))}
                </div>
              )}
              {resumeData && (
                <Dashboard
                  result={result}
                  resumeData={resumeData}
                  jobInput={jobInput}
                  onBack={handleRecheck}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer — SEO + Trust ── */}
      <footer style={{
        padding: '20px 24px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.78rem',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <span>© {new Date().getFullYear()} ResumeMatchAI — All rights reserved.</span>
        <span style={{ fontSize: '0.72rem', color: 'rgba(107, 107, 141, 0.7)' }}>
          Resume analysis and job matching insights are for guidance purposes only. Your data stays in your browser.
        </span>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

    </>
  );
}
