'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Copy, Check, Sparkles, Hash, AtSign, FileText, Zap, RefreshCw } from 'lucide-react';
import { ResumeData, JobInput } from '@/lib/types';
import QuoteLoader from '@/components/QuoteLoader';

interface Props {
  resume: ResumeData;
  jobInput: JobInput;
}

type ContentType = 'headline' | 'summary' | 'post' | 'skills' | 'hashtags';

export default function LinkedInTools({ resume, jobInput }: Props) {
  const [activeSection, setActiveSection] = useState<ContentType>('headline');
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [post, setPost] = useState('');
  const [skillEndorsements, setSkillEndorsements] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerateAll = async () => {
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    const model = process.env.NEXT_PUBLIC_AI_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

    const skills = resume.skills.slice(0, 8).join(', ');
    const latestTitle = resume.experience[0]?.title || jobInput.jobTitle;
    const latestCompany = resume.experience[0]?.company || '';
    const name = resume.name || 'Professional';

    if (apiKey) {
      try {
        const prompt = `Generate LinkedIn profile optimization content for this professional.

NAME: ${name}
CURRENT/LATEST ROLE: ${latestTitle}${latestCompany ? ` at ${latestCompany}` : ''}
SKILLS: ${skills}
TARGET ROLE: ${jobInput.jobTitle} (${jobInput.seniority})
ACHIEVEMENTS: ${resume.achievements?.slice(0, 3).join('; ') || 'Multiple impactful projects'}

Return ONLY valid JSON:
{
  "headline": "<120 chars max, keyword-rich, impactful LinkedIn headline>",
  "summary": "<300 words professional summary in first person, authentic, with clear value proposition>",
  "post": "<LinkedIn post announcing career achievement or sharing industry insight, 150-200 words, engaging with emojis>",
  "skillEndorsements": ["<top 10 skills to list on LinkedIn profile for ${jobInput.jobTitle}>"],
  "hashtags": ["<10 relevant LinkedIn hashtags without # symbol>"]
}`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: 'You are a LinkedIn profile optimization expert. Return ONLY valid JSON.' }, { role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1200,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0]?.message?.content || '';
          const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
          const parsed = JSON.parse(cleaned.match(/\{[\s\S]*\}/)?.[0] || '{}');
          setHeadline(parsed.headline || '');
          setSummary(parsed.summary || '');
          setPost(parsed.post || '');
          setSkillEndorsements(parsed.skillEndorsements || []);
          setHashtags(parsed.hashtags || []);
          setGenerated(true);
          setLoading(false);
          return;
        }
      } catch {}
    }

    // Fallback generation
    setHeadline(`${latestTitle} | ${skills.split(', ').slice(0, 3).join(' · ')} | Driving Innovation & Impact`);
    setSummary(
      `I'm a passionate ${jobInput.jobTitle} with expertise in ${skills}. ` +
      `${latestCompany ? `Currently at ${latestCompany}, ` : ''}I specialize in building impactful solutions ` +
      `that drive measurable results. With a strong foundation in ${resume.skills.slice(0, 3).join(', ')}, ` +
      `I bring both technical depth and strategic thinking to every project.\n\n` +
      `What drives me:\n` +
      `• Building scalable solutions that solve real problems\n` +
      `• Collaborating with cross-functional teams to deliver excellence\n` +
      `• Continuous learning and staying ahead of industry trends\n\n` +
      `Always open to connecting with fellow professionals and discussing opportunities in ${jobInput.industry || 'technology'}.`
    );
    setPost(
      `🚀 Excited to share that I'm exploring new opportunities as a ${jobInput.jobTitle}!\n\n` +
      `Over the past few years, I've had the privilege of working with incredible teams ` +
      `and building solutions using ${resume.skills.slice(0, 4).join(', ')}.\n\n` +
      `Key highlights:\n` +
      `✅ ${resume.achievements?.[0] || 'Delivered multiple high-impact projects'}\n` +
      `✅ ${resume.achievements?.[1] || 'Drove innovation in development processes'}\n\n` +
      `I'm passionate about ${jobInput.industry || 'technology'} and eager to bring my skills to a forward-thinking team.\n\n` +
      `If you know of any exciting ${jobInput.jobTitle} opportunities, I'd love to connect! 🤝`
    );
    setSkillEndorsements(resume.skills.slice(0, 10));
    setHashtags([
      jobInput.jobTitle.replace(/\s+/g, ''),
      'OpenToWork',
      'CareerGrowth',
      jobInput.industry?.replace(/\s+/g, '') || 'Technology',
      'Innovation',
      'Hiring',
      'JobSearch',
      ...resume.skills.slice(0, 3).map(s => s.replace(/[\s./]+/g, '')),
    ]);
    setGenerated(true);
    setLoading(false);
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      style={{
        padding: '4px 10px',
        background: 'var(--bg-primary)',
        color: copiedField === field ? 'var(--accent)' : 'var(--text-muted)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {copiedField === field ? <Check size={12} /> : <Copy size={12} />}
      {copiedField === field ? 'Copied!' : 'Copy'}
    </button>
  );

  const sections = [
    { id: 'headline' as ContentType, label: 'Headline', icon: Zap },
    { id: 'summary' as ContentType, label: 'About', icon: FileText },
    { id: 'post' as ContentType, label: 'Post', icon: AtSign },
    { id: 'skills' as ContentType, label: 'Skills', icon: Sparkles },
    { id: 'hashtags' as ContentType, label: 'Hashtags', icon: Hash },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
        LinkedIn Optimizer
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Complete LinkedIn profile optimization — headline, about, posts, skills & hashtags
      </p>

      {!generated && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #0077b5, #00a0dc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Linkedin size={36} style={{ color: 'white' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Optimize Your LinkedIn Profile
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Generate a keyword-rich headline, compelling about section, engaging post, top skills, and trending hashtags
          </p>
          <button
            onClick={handleGenerateAll}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #0077b5, #00a0dc)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 119, 181, 0.3)',
            }}
          >
            <Sparkles size={18} />
            Generate All Content
          </button>
        </div>
      )}

      {loading && <QuoteLoader message="Crafting your LinkedIn content..." />}

      {generated && !loading && (
        <div>
          {/* Section Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {sections.map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    padding: '10px 16px',
                    background: activeSection === sec.id ? 'linear-gradient(135deg, #0077b5, #00a0dc)' : 'var(--bg-surface)',
                    color: activeSection === sec.id ? 'white' : 'var(--text-primary)',
                    border: activeSection === sec.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon size={14} />
                  {sec.label}
                </button>
              );
            })}
          </div>

          {/* Content Cards */}
          {activeSection === 'headline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
              background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#00a0dc' }}>LinkedIn Headline</span>
                <CopyButton text={headline} field="headline" />
              </div>
              <p style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {headline}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                {headline.length}/120 characters
              </p>
            </motion.div>
          )}

          {activeSection === 'summary' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
              background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#00a0dc' }}>About / Summary</span>
                <CopyButton text={summary} field="summary" />
              </div>
              <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {summary}
              </div>
            </motion.div>
          )}

          {activeSection === 'post' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
              background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#00a0dc' }}>Ready-to-Post Content</span>
                <CopyButton text={post} field="post" />
              </div>
              <div style={{
                fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.8', whiteSpace: 'pre-wrap',
                background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                {post}
              </div>
            </motion.div>
          )}

          {activeSection === 'skills' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
              background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#00a0dc' }}>Top Skills to Feature</span>
                <CopyButton text={skillEndorsements.join(', ')} field="skills" />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skillEndorsements.map((skill, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(0, 119, 181, 0.1)',
                      border: '1px solid rgba(0, 119, 181, 0.2)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: '#00a0dc',
                      fontWeight: '500',
                    }}
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                Add these skills to your LinkedIn profile for better discoverability
              </p>
            </motion.div>
          )}

          {activeSection === 'hashtags' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
              background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#00a0dc' }}>Trending Hashtags</span>
                <CopyButton text={hashtags.map(h => `#${h}`).join(' ')} field="hashtags" />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {hashtags.map((tag, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      padding: '6px 14px',
                      background: 'rgba(46, 196, 182, 0.08)',
                      borderRadius: '16px',
                      fontSize: '14px',
                      color: 'var(--accent)',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleCopy(`#${tag}`, `tag-${i}`)}
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                Use these hashtags in your posts and articles for better reach
              </p>
            </motion.div>
          )}

          {/* Regenerate */}
          <button
            onClick={() => { setGenerated(false); handleGenerateAll(); }}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '12px',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} />
            Regenerate All Content
          </button>
        </div>
      )}
    </div>
  );
}
