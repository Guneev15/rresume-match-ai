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
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setAppState('input');
    }
  };

  const handleRecheck = () => {
    setResult(null);
    setResumeData(null);
    setAppState('input');
  };

  const isReadyToAnalyze = jobInput.jobTitle.trim() && (resumeFile || resumeText.trim());

  return (
    <>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-primary)',
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={22} style={{ color: 'var(--accent)' }} />
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
          }}>
            ResumeMatch
            <span style={{ color: 'var(--accent)' }}>AI</span>
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
                <span>👋 {profile?.full_name || user.email}</span>
                <button
                  onClick={async () => {
                    const { signOut } = await import('@/lib/supabase/client').then(m => ({ signOut: () => m.supabase.auth.signOut() }));
                    await signOut();
                    window.location.reload();
                  }}
                  style={{
                    padding: '6px 14px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Main content */}
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
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero — SEO Optimized */}
              <div style={{ textAlign: 'center', marginBottom: '48px', marginTop: '24px' }}>
                <h1 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  marginBottom: '16px',
                }}>
                  AI Resume Analyzer &amp;
                  <br />
                  <span style={{ color: 'var(--accent)' }}>Job Match Optimizer</span>
                </h1>
                <p style={{
                  color: 'var(--text-sub)',
                  fontSize: '1.05rem',
                  maxWidth: '540px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                }}>
                  Upload your resume to instantly check job compatibility, ATS score,
                  and improvement suggestions. Our AI-powered resume analyzer helps
                  optimize keywords, skills, and structure to match real job profiles
                  — giving you a smarter edge in applications.
                </p>
              </div>

              {/* Feature Cards — SEO Semantic Headings */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '40px',
              }}>
                <div style={{
                  padding: '20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  textAlign: 'center',
                }}>
                  <Target size={28} style={{ color: 'var(--accent)', marginBottom: '10px' }} />
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}>
                    Resume Job Matching
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                    Analyze how well your resume aligns with specific job roles using intelligent keyword and skill matching.
                  </p>
                </div>
                <div style={{
                  padding: '20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  textAlign: 'center',
                }}>
                  <ShieldCheck size={28} style={{ color: 'var(--accent)', marginBottom: '10px' }} />
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}>
                    ATS Optimization
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                    Ensure your resume passes applicant tracking systems with optimized formatting and targeted keywords.
                  </p>
                </div>
                <div style={{
                  padding: '20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  textAlign: 'center',
                }}>
                  <Lightbulb size={28} style={{ color: 'var(--accent)', marginBottom: '10px' }} />
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}>
                    Smart Resume Feedback
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                    Get personalized insights on what to improve, rewrite, or highlight to increase interview chances.
                  </p>
                </div>
              </div>

              {/* Input sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className="card">
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'var(--accent)',
                      color: 'var(--bg-primary)',
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
                </div>

                <div className="card">
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'var(--accent)',
                      color: 'var(--bg-primary)',
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
                </div>

                {/* Warnings */}
                {parseWarnings.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}>
                    {parseWarnings.map((w, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '10px 14px',
                        background: 'rgba(255, 179, 71, 0.08)',
                        border: '1px solid rgba(255, 179, 71, 0.15)',
                        borderRadius: '8px',
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

                {/* Error */}
                {error && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    background: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid rgba(255, 107, 107, 0.2)',
                    borderRadius: '10px',
                    color: 'var(--error)',
                    fontSize: '0.9rem',
                  }}>
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                {/* Analyze button */}
                <button
                  className="btn-primary"
                  onClick={handleAnalyze}
                  disabled={!isReadyToAnalyze}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '16px',
                    fontSize: '1rem',
                  }}
                >
                  <Sparkles size={18} />
                  Analyze My Resume
                </button>

              </div>
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
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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
                      background: 'rgba(255, 179, 71, 0.08)',
                      border: '1px solid rgba(255, 179, 71, 0.15)',
                      borderRadius: '8px',
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

      {/* Footer — SEO + Trust */}
      <footer style={{
        padding: '20px 24px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.78rem',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <span>© {new Date().getFullYear()} ResumeMatchAI. All rights reserved.</span>
        <span style={{ fontSize: '0.72rem' }}>
          Resume analysis and job matching insights are for guidance purposes only. Your data stays in your browser — nothing is stored on any server.
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
