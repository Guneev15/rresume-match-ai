import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, TrendingUp, BookOpen, FileText, PenTool, MessageSquare, GraduationCap, Linkedin, ArrowLeft } from 'lucide-react';
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
    { id: 'analysis' as TabType, label: 'Overview', icon: FileText },
    { id: 'jobs' as TabType, label: 'Job Matches', icon: Briefcase },
    { id: 'skills' as TabType, label: 'Skill Gap', icon: TrendingUp },
    { id: 'coverletter' as TabType, label: 'Cover Letter', icon: PenTool },
    { id: 'interview' as TabType, label: 'Interview', icon: MessageSquare },
    { id: 'learning' as TabType, label: 'Learning', icon: GraduationCap },
    { id: 'linkedin' as TabType, label: 'LinkedIn', icon: Linkedin },
    { id: 'versions' as TabType, label: 'Versions', icon: BookOpen },
  ];

  const contentTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sub-header with job info */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 24px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{
              fontSize: '17px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '3px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
            }}>
              {jobInput.jobTitle}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="score-badge" style={{ fontSize: '12px', padding: '2px 8px' }}>
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
            className="btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              gap: '6px',
            }}
          >
            <ArrowLeft size={14} />
            New Analysis
          </button>
        </div>
      </motion.div>

      {/* Main layout — Sidebar + Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '0',
        minHeight: 'calc(100vh - 72px)',
      }}>
        {/* ── Desktop Sidebar ── */}
        <aside style={{
          width: '220px',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
        className="dashboard-sidebar"
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* ── Mobile Tab Bar (hidden on desktop) ── */}
        <div
          className="dashboard-mobile-tabs"
          style={{
            display: 'none',
            overflowX: 'auto',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            padding: '8px 16px',
            gap: '4px',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 14px',
                  background: isActive ? 'var(--accent-subtle)' : 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'var(--font-heading)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s var(--ease-standard)',
                  flexShrink: 0,
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, padding: '24px', minWidth: 0 }}>
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
      </div>

      {/* Feedback Widget */}
      <FeedbackWidget featureId={activeTab} featureLabel={tabs.find(t => t.id === activeTab)?.label || 'Feature'} />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-sidebar {
            display: none !important;
          }
          .dashboard-mobile-tabs {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
