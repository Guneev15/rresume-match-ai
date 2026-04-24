import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, TrendingUp, BookOpen, FileText, PenTool, MessageSquare, GraduationCap, Linkedin } from 'lucide-react';
import { AnalysisResult, ResumeData, JobInput } from '@/lib/types';
import ResultsPage from '@/components/ResultsPage';
import JobRecommendations from '@/features/job-recommendations/JobRecommendations';
import SkillGapDashboard from '@/features/skill-gap/SkillGapDashboard';
import ResumeVersions from '@/features/resume-versions/ResumeVersions';
import CoverLetterGenerator from '@/features/cover-letter/CoverLetterGenerator';
import InterviewPrepEngine from '@/features/interview-prep/InterviewPrepEngine';
import LearningRoadmapView from '@/features/learning/LearningRoadmapView';
import LinkedInTools from '@/features/branding/LinkedInTools';
import FeedbackWidget from '@/features/feedback/FeedbackWidget';

interface DashboardProps {
  result: AnalysisResult;
  resumeData: ResumeData;
  jobInput: JobInput;
  onBack: () => void;
}

type TabType = 'analysis' | 'jobs' | 'skills' | 'coverletter' | 'interview' | 'learning' | 'linkedin' | 'versions';

export default function Dashboard({ result, resumeData, jobInput, onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');

  const tabs = [
    { id: 'analysis' as TabType, label: 'Analysis', icon: FileText },
    { id: 'jobs' as TabType, label: 'Job Matches', icon: Briefcase },
    { id: 'skills' as TabType, label: 'Skill Gap', icon: TrendingUp },
    { id: 'coverletter' as TabType, label: 'Cover Letter', icon: PenTool },
    { id: 'interview' as TabType, label: 'Interview', icon: MessageSquare },
    { id: 'learning' as TabType, label: 'Learning', icon: GraduationCap },
    { id: 'linkedin' as TabType, label: 'LinkedIn', icon: Linkedin },
    { id: 'versions' as TabType, label: 'Versions', icon: BookOpen },
  ];

  const contentTransition = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sub-header with job info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
          position: 'relative',
        }}
      >
        {/* Gradient accent line at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))',
          opacity: 0.6,
        }} />

        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '3px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.01em',
            }}>
              {jobInput.jobTitle}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'var(--accent-subtle)',
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '12px',
                fontFamily: 'var(--font-heading)',
              }}>
                {result.overallScore}/100
              </span>
              <span>·</span>
              <span>{jobInput.seniority}</span>
              <span>·</span>
              <span>{jobInput.industry || 'General'}</span>
            </p>
          </div>
          <button
            onClick={onBack}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
            }}
          >
            New Analysis
          </button>
        </div>
      </motion.div>

      {/* Tabs - Pill style, Scrollable */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          gap: '4px',
          padding: '8px 24px',
          minWidth: 'fit-content',
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  background: isActive ? 'var(--accent-subtle)' : 'transparent',
                  border: isActive ? '1px solid rgba(124, 92, 252, 0.15)' : '1px solid transparent',
                  borderRadius: '10px',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  fontFamily: 'var(--font-heading)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'analysis' && (
            <motion.div key="analysis" {...contentTransition}>
              <ResultsPage result={result} jobInput={jobInput} onRecheck={onBack} />
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div key="jobs" {...contentTransition}>
              <JobRecommendations resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div key="skills" {...contentTransition}>
              <SkillGapDashboard resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'coverletter' && (
            <motion.div key="coverletter" {...contentTransition}>
              <CoverLetterGenerator resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'interview' && (
            <motion.div key="interview" {...contentTransition}>
              <InterviewPrepEngine resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'learning' && (
            <motion.div key="learning" {...contentTransition}>
              <LearningRoadmapView resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'linkedin' && (
            <motion.div key="linkedin" {...contentTransition}>
              <LinkedInTools resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'versions' && (
            <motion.div key="versions" {...contentTransition}>
              <ResumeVersions
                currentResume={resumeData}
                currentJob={jobInput}
                currentAnalysis={result}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback Widget */}
      <FeedbackWidget featureId={activeTab} featureLabel={tabs.find(t => t.id === activeTab)?.label || 'Feature'} />
    </div>
  );
}
