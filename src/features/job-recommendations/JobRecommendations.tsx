import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, TrendingUp, ExternalLink, Bookmark, Check } from 'lucide-react';
import { JobRecommendation, generateJobRecommendations, generateAIJobRecommendations } from './jobRecommendationService';
import { ResumeData, JobInput } from '@/lib/types';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase/client';
import QuoteLoader from '@/components/QuoteLoader';

interface JobRecommendationsProps {
  resume: ResumeData;
  jobInput: JobInput;
}

export default function JobRecommendations({ resume, jobInput }: JobRecommendationsProps) {
  const { user } = useUser();
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'remote' | 'saved'>('all');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
    if (user) {
      loadSavedJobs();
    }
  }, [resume, jobInput, user]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Show fallback instantly for speed
      const fallback = await generateJobRecommendations(resume, jobInput);
      setJobs(fallback);
      setLoading(false);

      // Then try AI enhancement in background
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      const model = process.env.NEXT_PUBLIC_AI_MODEL;
      if (apiKey && model) {
        try {
          const aiRecs = await generateAIJobRecommendations(resume, jobInput, apiKey, model);
          if (aiRecs.length > 0) setJobs(aiRecs);
        } catch {}
      }
    } catch (error) {
      const recommendations = await generateJobRecommendations(resume, jobInput);
      setJobs(recommendations);
      setLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    if (!user) return;

    const { data, error } = await (supabase as any)
      .from('job_recommendations')
      .select('id')
      .eq('user_id', user.id)
      .eq('saved', true);

    if (!error && data) {
      setSavedJobs(new Set(data.map(j => j.id)));
    }
  };

  const toggleSaveJob = async (job: JobRecommendation) => {
    if (!user) return;

    const isSaved = savedJobs.has(job.id);

    if (isSaved) {
      // Unsave
      await (supabase as any)
        .from('job_recommendations')
        .delete()
        .eq('id', job.id)
        .eq('user_id', user.id);

      setSavedJobs(prev => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    } else {
      // Save
      await (supabase as any)
        .from('job_recommendations')
        .insert({
          id: job.id,
          user_id: user.id,
          job_title: job.title,
          company: job.company,
          location: job.location,
          remote: job.remote,
          salary_min: job.salary?.min,
          salary_max: job.salary?.max,
          match_score: job.matchScore,
          matched_skills: job.matchedSkills,
          missing_skills: job.missingSkills,
          description: job.description,
          url: job.url,
          source: job.source,
          saved: true,
        } as any);

      setSavedJobs(prev => new Set(prev).add(job.id));
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'remote') return job.remote;
    if (filter === 'saved') return savedJobs.has(job.id);
    return true;
  });

  if (loading) {
    return <QuoteLoader message="Finding the best job matches for you..." />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
          Job Recommendations
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          Based on your resume, here are {jobs.length} jobs that match your skills
        </p>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              background: filter === 'all' ? 'var(--accent)' : 'var(--bg-surface)',
              color: filter === 'all' ? 'white' : 'var(--text-primary)',
              border: filter === 'all' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('remote')}
            style={{
              padding: '8px 16px',
              background: filter === 'remote' ? 'var(--accent)' : 'var(--bg-surface)',
              color: filter === 'remote' ? 'white' : 'var(--text-primary)',
              border: filter === 'remote' ? 'none' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Remote ({jobs.filter(j => j.remote).length})
          </button>
          {user && (
            <button
              onClick={() => setFilter('saved')}
              style={{
                padding: '8px 16px',
                background: filter === 'saved' ? 'var(--accent)' : 'var(--bg-surface)',
                color: filter === 'saved' ? 'white' : 'var(--text-primary)',
                border: filter === 'saved' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Saved ({savedJobs.size})
            </button>
          )}
        </div>
      </div>

      {/* Job Cards */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px',
              position: 'relative',
            }}
          >
            {/* Match Score Badge */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: job.matchScore >= 70 ? 'rgba(46, 196, 182, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                color: job.matchScore >= 70 ? 'var(--accent)' : '#fbbf24',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <TrendingUp size={14} />
              {job.matchScore}% Match
            </div>

            {/* Job Info */}
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {job.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={16} />
                  {job.company}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} />
                  {job.location}
                  {job.remote && <span style={{ color: 'var(--accent)' }}>(Remote)</span>}
                </div>
                {job.salary && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} />
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div style={{ marginBottom: '16px' }}>
              {job.matchedSkills.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Matched Skills:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {job.matchedSkills.slice(0, 5).map(skill => (
                      <span
                        key={skill}
                        style={{
                          background: 'rgba(46, 196, 182, 0.1)',
                          color: 'var(--accent)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Check size={12} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.missingSkills.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Skills to Learn:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {job.missingSkills.slice(0, 3).map(skill => (
                      <span
                        key={skill}
                        style={{
                          background: 'rgba(251, 191, 36, 0.1)',
                          color: '#fbbf24',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  View Job <ExternalLink size={14} />
                </a>
              )}
              {user && (
                <button
                  onClick={() => toggleSaveJob(job)}
                  style={{
                    padding: '10px 16px',
                    background: savedJobs.has(job.id) ? 'rgba(46, 196, 182, 0.2)' : 'var(--bg-primary)',
                    color: savedJobs.has(job.id) ? 'var(--accent)' : 'var(--text-primary)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Bookmark size={14} fill={savedJobs.has(job.id) ? 'currentColor' : 'none'} />
                  {savedJobs.has(job.id) ? 'Saved' : 'Save'}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No jobs found matching your filters.
        </div>
      )}
    </div>
  );
}
