import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText, Calendar, Tag, Trash2, Eye } from 'lucide-react';
import { ResumeData, JobInput, AnalysisResult } from '@/lib/types';
import { useUser } from '@/contexts/UserContext';
import { VersionService } from '@/lib/supabase/services';

interface ResumeVersionsProps {
  currentResume: ResumeData;
  currentJob: JobInput;
  currentAnalysis: AnalysisResult;
}

export default function ResumeVersions({ currentResume, currentJob, currentAnalysis }: ResumeVersionsProps) {
  const { user } = useUser();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (user) {
      loadVersions();
    }
  }, [user]);

  const loadVersions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // For now, we'll show a placeholder since we don't have resume_id yet
      // In a full implementation, this would load from the database
      setVersions([]);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!user || !versionName.trim()) return;

    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      
      // This would save to database in full implementation
      // For now, just show success message
      alert('Version saved! (Database integration pending)');
      setShowSaveModal(false);
      setVersionName('');
      setTags('');
    } catch (error) {
      console.error('Error saving version:', error);
      alert('Failed to save version');
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
          Sign In Required
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Sign in to save and manage different versions of your resume
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Resume Versions
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Save and compare different versions of your resume for different job applications
          </p>
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Save size={16} />
          Save Current Version
        </button>
      </div>

      {/* Current Version Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--accent)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Current Analysis
              </h3>
              <span
                style={{
                  padding: '4px 12px',
                  background: 'rgba(46, 196, 182, 0.2)',
                  color: 'var(--accent)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                ACTIVE
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {currentJob.jobTitle} • {currentJob.seniority} • Score: {currentAnalysis.overallScore}/100
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Skills</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {currentResume.skills.length} listed
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Experience</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {currentResume.experience.length} positions
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Education</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {currentResume.education.length} degrees
            </div>
          </div>
        </div>
      </motion.div>

      {/* Saved Versions */}
      {versions.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
            No Saved Versions Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            Save your current resume analysis to compare it with future versions
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {versions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {version.version_name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(version.created_at).toLocaleDateString()}
                    </div>
                    <div>{version.job_title}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      padding: '6px 12px',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Eye size={12} />
                    View
                  </button>
                  <button
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {version.tags && version.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {version.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowSaveModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
              Save Resume Version
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>
                Version Name
              </label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="e.g., Software Engineer - Google"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., tech, senior, remote"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={!versionName.trim()}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: versionName.trim() ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: versionName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Save Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
