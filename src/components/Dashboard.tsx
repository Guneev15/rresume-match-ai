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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sub-header with job info + nav */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 24px',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
              {jobInput.jobTitle}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Score: {result.overallScore}/100 · {jobInput.seniority} · {jobInput.industry || 'General'}
            </p>
          </div>
          <button
            onClick={onBack}
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
            New Analysis
          </button>
        </div>
      </div>

      {/* Tabs - Scrollable */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          overflowX: 'auto',
        }}
      >
        <div style={{
          maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '4px', padding: '0 24px',
          minWidth: 'fit-content',
          /* Hide scrollbar */
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '14px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
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
            <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <ResultsPage result={result} jobInput={jobInput} onRecheck={onBack} />
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <JobRecommendations resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div key="skills" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <SkillGapDashboard resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'coverletter' && (
            <motion.div key="coverletter" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <CoverLetterGenerator resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'interview' && (
            <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <InterviewPrepEngine resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'learning' && (
            <motion.div key="learning" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <LearningRoadmapView resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'linkedin' && (
            <motion.div key="linkedin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <LinkedInTools resume={resumeData} jobInput={jobInput} />
            </motion.div>
          )}

          {activeTab === 'versions' && (
            <motion.div key="versions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
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
