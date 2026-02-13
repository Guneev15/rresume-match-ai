import { ResumeData } from './types';

// Section header patterns — used to split the resume into sections
const SECTION_HEADERS = [
  { key: 'summary', pattern: /(?:^|\n)\s*(?:summary|objective|profile|about\s+me)\s*(?:\n|$)/i },
  { key: 'education', pattern: /(?:^|\n)\s*(?:education|academic|qualifications?)\s*(?:\n|$)/i },
  { key: 'skills', pattern: /(?:^|\n)\s*(?:(?:technical\s+)?skills|core\s+competencies|technologies)\s*(?:\n|$)/i },
  { key: 'experience', pattern: /(?:^|\n)\s*(?:(?:professional\s+|work\s+)?experience|work\s+history|employment)\s*(?:\n|$)/i },
  { key: 'projects', pattern: /(?:^|\n)\s*(?:(?:personal\s+|side\s+)?projects)\s*(?:\n|$)/i },
  { key: 'certifications', pattern: /(?:^|\n)\s*(?:certifications?|licenses?)\s*(?:\n|$)/i },
  { key: 'achievements', pattern: /(?:^|\n)\s*(?:achievements?|awards?|honors?)\s*(?:\n|$)/i },
];

/**
 * Normalise PDF-extracted text so that it has reasonable line breaks.
 * PDF.js often joins an entire page into one long line.
 */
function normaliseText(raw: string): string {
  // First, collapse multiple spaces into single space
  let t = raw.replace(/[ \t]{2,}/g, ' ');

  // Insert line breaks BEFORE common section headings (case-insensitive)
  const headings = [
    'Summary', 'Objective', 'Profile', 'About Me',
    'Education', 'Academic',
    'Technical Skills', 'Skills', 'Core Competencies', 'Technologies',
    'Professional Experience', 'Work Experience', 'Experience', 'Work History', 'Employment',
    'Personal Projects', 'Projects',
    'Certifications', 'Licenses',
    'Achievements', 'Awards', 'Honors',
    'References',
  ];

  for (const h of headings) {
    // Insert newline before section heading when it appears mid-line
    const escaped = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<!\\n)\\s+(${escaped})\\s*(?=\\n|[A-Z]|[•·\\-]|$)`, 'gi');
    t = t.replace(re, '\n$1\n');
  }

  // Insert newlines before bullet-like patterns
  t = t.replace(/ ([•·▪■]) /g, '\n$1 ');

  // Insert newlines before date patterns like "01/2026" or "2023 –"
  t = t.replace(/\s+(\d{1,2}\/\d{4}\s*[-–—])/g, '\n$1');

  // Clean up multiple newlines
  t = t.replace(/\n{3,}/g, '\n\n');

  return t.trim();
}

/**
 * Split text into named sections based on detected headings
 */
function splitIntoSections(text: string): Record<string, string> {
  const sections: Record<string, string> = { header: '' };
  const positions: { key: string; index: number; matchLen: number }[] = [];

  for (const sh of SECTION_HEADERS) {
    const m = text.match(sh.pattern);
    if (m && m.index !== undefined) {
      positions.push({ key: sh.key, index: m.index, matchLen: m[0].length });
    }
  }

  // Sort by position in text
  positions.sort((a, b) => a.index - b.index);

  if (positions.length === 0) {
    sections.header = text;
    return sections;
  }

  // Everything before first section is header
  sections.header = text.slice(0, positions[0].index).trim();

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index + positions[i].matchLen;
    const end = i + 1 < positions.length ? positions[i + 1].index : text.length;
    sections[positions[i].key] = text.slice(start, end).trim();
  }

  return sections;
}

export function extractFields(text: string): ResumeData {
  const warnings: string[] = [];
  const normalised = normaliseText(text);
  const sections = splitIntoSections(normalised);

  // --- Name ---
  // Take from the header section — first substantial non-contact line
  const headerLines = (sections.header || '').split('\n').map(l => l.trim()).filter(Boolean);
  let name: string | null = null;
  for (const line of headerLines.slice(0, 8)) {
    if (
      !line.includes('@') &&
      !/^\+?\d[\d\s()\-]{6,}/.test(line) &&
      !line.includes('http') &&
      !line.includes('linkedin') &&
      !/^[•·\-–—▪]/.test(line) &&
      line.length > 1 &&
      line.length < 60 &&
      /[A-Za-z]/.test(line)
    ) {
      name = line;
      break;
    }
  }

  // --- Email ---
  const emailMatch = text.match(/[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // --- Phone ---
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  // --- LinkedIn ---
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
  const linkedinUrl = linkedinMatch ? linkedinMatch[0] : null;

  // --- Website ---
  const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?!linkedin\.com)[\w.-]+\.[a-zA-Z]{2,}(?:\/[\w.-]*)?/i);
  const websiteUrl = websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('gmail') ? websiteMatch[0] : null;

  // --- Skills ---
  let skills: string[] = [];
  const skillSection = sections.skills || '';
  if (skillSection) {
    // Split by bullets, commas, pipes, colons for categories
    const skillLines = skillSection.split('\n');
    for (const line of skillLines) {
      // Remove category labels like "Programming Languages:", "Libraries & Frameworks:"
      const afterColon = line.includes(':') ? line.split(':').slice(1).join(':') : line;
      const parts = afterColon.split(/[,|•·]/).map(s => s.replace(/^[-–—\s]+|[-–—\s]+$/g, '').trim()).filter(s => s.length > 0 && s.length < 60);
      skills.push(...parts);
    }
  }

  // Common skill keywords fallback
  if (skills.length < 3) {
    const commonSkills = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
      'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring', 'fastapi',
      'html', 'css', 'sass', 'tailwind', 'bootstrap',
      'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'firebase', 'supabase',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
      'git', 'ci/cd', 'jenkins', 'github actions', 'linux',
      'machine learning', 'deep learning', 'nlp', 'computer vision', 'data science',
      'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'matplotlib', 'seaborn',
      'power bi', 'tableau', 'jupyter',
      'figma', 'sketch', 'photoshop',
      'agile', 'scrum', 'jira',
      'rest api', 'graphql', 'microservices',
    ];
    const lowerText = text.toLowerCase();
    const foundSkills = commonSkills.filter(s => {
      const re = new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return re.test(lowerText);
    });
    skills = [...new Set([...skills, ...foundSkills])];
  }
  // De-duplicate skills
  skills = [...new Set(skills.map(s => s.trim()).filter(s => s.length > 0))];

  // --- Experience ---
  const experience = extractExperience(sections.experience || '');

  // --- Education ---
  const education = extractEducation(sections.education || '');

  // --- Summary ---
  const summary = sections.summary ? sections.summary.slice(0, 500) : null;

  // --- Projects ---
  const projects = extractProjects(sections.projects || '');

  // --- Certifications ---
  const certifications: string[] = [];
  if (sections.certifications) {
    const certLines = sections.certifications.split('\n')
      .map(l => l.replace(/^[•·\-–—▪■]\s*/, '').trim())
      .filter(l => l.length > 3);
    certifications.push(...certLines);
  }

  // --- Achievements ---
  const achievements: string[] = [];
  if (sections.achievements) {
    const achLines = sections.achievements.split('\n')
      .map(l => l.replace(/^[•·\-–—▪■]\s*/, '').trim())
      .filter(l => l.length > 3);
    achievements.push(...achLines);
  }

  // Warnings
  if (!name) warnings.push('Could not detect candidate name.');
  if (!email) warnings.push('Could not detect email address.');
  if (skills.length === 0) warnings.push('Could not detect skills — consider listing them clearly.');
  if (experience.length === 0) warnings.push('Could not detect work experience sections.');

  return {
    name,
    email,
    phone,
    location: null,
    linkedinUrl,
    websiteUrl,
    headline: null,
    summary,
    skills,
    experience,
    education,
    certifications,
    projects,
    achievements,
    rawText: text,
    parseWarnings: warnings,
  };
}

function extractExperience(section: string): ResumeData['experience'] {
  if (!section.trim()) return [];

  const entries: ResumeData['experience'] = [];
  const lines = section.split('\n').filter(l => l.trim().length > 0);

  let current: ResumeData['experience'][0] | null = null;

  // Date patterns: "01/2026 – 02/2026", "Jan 2024 - Present", "2023 – 2027", etc
  const datePattern = /(?:\d{1,2}\/\d{4}|\d{4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{0,4})\s*[-–—]+\s*(?:present|current|\d{1,2}\/\d{4}|\d{4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{0,4})/i;

  for (const line of lines) {
    const trimmed = line.trim();
    const isBullet = /^[•·\-–—▪■]\s/.test(trimmed);
    const hasDate = datePattern.test(trimmed);

    if (hasDate && !isBullet) {
      // This is a new job entry
      if (current) entries.push(current);
      const dateMatch = trimmed.match(datePattern);
      const remaining = trimmed.replace(datePattern, '').replace(/[,]/g, ' ').trim();
      // Try to split into title and company
      const parts = remaining.split(/\s{2,}|[|]/).map(p => p.trim()).filter(p => p.length > 0);
      current = {
        company: parts.length > 1 ? parts[1] : remaining,
        title: parts[0] || remaining,
        startDate: dateMatch ? dateMatch[0].split(/[-–—]/)[0].trim() : '',
        endDate: dateMatch ? (dateMatch[0].split(/[-–—]/).pop()?.trim() || '') : '',
        location: parts.length > 2 ? parts[2] : '',
        bullets: [],
      };
    } else if (current && isBullet) {
      const bulletText = trimmed.replace(/^[•·\-–—▪■]\s*/, '');
      if (bulletText.length > 5) {
        current.bullets.push(bulletText);
      }
    } else if (current && trimmed.length > 10 && !isBullet) {
      // Continuation line or sub-title
      if (current.bullets.length === 0 && !current.title.includes(trimmed)) {
        // Could be a project name or sub-title under the role
        current.bullets.push(trimmed);
      } else {
        current.bullets.push(trimmed);
      }
    } else if (!current && trimmed.length > 5 && !isBullet) {
      // Might be a role/company header without dates on same line
      current = {
        company: trimmed,
        title: trimmed,
        startDate: '',
        endDate: '',
        location: '',
        bullets: [],
      };
    }
  }
  if (current) entries.push(current);
  return entries;
}

function extractEducation(section: string): ResumeData['education'] {
  if (!section.trim()) return [];

  const entries: ResumeData['education'] = [];
  const lines = section.split('\n').filter(l => l.trim().length > 3);

  for (const line of lines) {
    const trimmed = line.replace(/^[•·\-–—▪■]\s*/, '').trim();
    if (trimmed.length < 5) continue;

    const degreePatterns = /(?:b\.?e\.?|b\.?s\.?|b\.?a\.?|b\.?tech|m\.?s\.?|m\.?a\.?|m\.?tech|ph\.?d|bachelor|master|mba|associate|diploma|degree|b\.?sc|m\.?sc)/i;
    const dateMatch = trimmed.match(/\d{4}\s*[-–—]\s*(?:\d{4}|present)/i);

    if (degreePatterns.test(trimmed) || entries.length === 0) {
      entries.push({
        institution: trimmed.replace(/\d{4}\s*[-–—]\s*(?:\d{4}|present)/i, '').trim(),
        degree: trimmed,
        startDate: dateMatch ? dateMatch[0].split(/[-–—]/)[0].trim() : '',
        endDate: dateMatch ? (dateMatch[0].split(/[-–—]/).pop()?.trim() || '') : '',
      });
    }
  }

  return entries;
}

function extractProjects(section: string): { name: string; description: string; stack: string[] }[] {
  if (!section.trim()) return [];

  const projects: { name: string; description: string; stack: string[] }[] = [];
  const lines = section.split('\n').filter(l => l.trim().length > 3);

  let currentProject: { name: string; description: string; stack: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const isBullet = /^[•·\-–—▪■]\s/.test(trimmed);

    if (!isBullet && trimmed.length > 3) {
      // New project header
      if (currentProject) projects.push(currentProject);
      currentProject = {
        name: trimmed.replace(/\d{1,2}\/\d{4}\s*[-–—]\s*\d{1,2}\/\d{4}/g, '').trim(),
        description: '',
        stack: [],
      };
    } else if (currentProject && isBullet) {
      const bulletText = trimmed.replace(/^[•·\-–—▪■]\s*/, '');
      if (currentProject.description) {
        currentProject.description += ' ' + bulletText;
      } else {
        currentProject.description = bulletText;
      }
    }
  }
  if (currentProject) projects.push(currentProject);
  return projects;
}
