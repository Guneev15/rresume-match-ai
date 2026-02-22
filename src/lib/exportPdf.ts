import jsPDF from 'jspdf';
import { AnalysisResult, JobInput } from './types';

// Color palette
const COLORS = {
  primary: [79, 70, 229] as [number, number, number],     // indigo
  accent: [16, 185, 129] as [number, number, number],      // emerald
  danger: [239, 68, 68] as [number, number, number],       // red
  warning: [245, 158, 11] as [number, number, number],     // amber
  textDark: [15, 23, 42] as [number, number, number],      // slate-900
  textMuted: [100, 116, 139] as [number, number, number],  // slate-500
  bgLight: [248, 250, 252] as [number, number, number],    // slate-50
  bgCard: [241, 245, 249] as [number, number, number],     // slate-100
  white: [255, 255, 255] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],     // slate-200
};

function getScoreColor(score: number): [number, number, number] {
  if (score >= 75) return COLORS.accent;
  if (score >= 50) return COLORS.warning;
  return COLORS.danger;
}

/**
 * Generate a clean, professional PDF report of the resume analysis
 */
export function exportAnalysisPdf(result: AnalysisResult, jobInput: JobInput) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // —— Helper functions ——

  function checkPageBreak(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  }

  function drawSectionHeader(title: string) {
    checkPageBreak(18);
    y += 6;
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.white);
    doc.text(title.toUpperCase(), margin + 5, y + 6.5);
    y += 14;
    doc.setTextColor(...COLORS.textDark);
  }

  function drawScoreBar(label: string, score: number, x: number, barWidth: number) {
    const barHeight = 5;
    const color = getScoreColor(score);

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.textDark);
    doc.text(label, x, y);

    // Score value
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(`${score}%`, x + barWidth - 2, y, { align: 'right' });
    y += 2;

    // Background bar
    doc.setFillColor(...COLORS.bgCard);
    doc.roundedRect(x, y, barWidth, barHeight, 1, 1, 'F');

    // Filled bar
    const filled = (score / 100) * barWidth;
    if (filled > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(x, y, Math.max(filled, 2), barHeight, 1, 1, 'F');
    }
    y += barHeight + 5;
  }

  // —— HEADER ——
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.white);
  doc.text('Resume Analysis Report', margin, 16);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(210, 210, 255);
  const seniority = jobInput.seniority.charAt(0).toUpperCase() + jobInput.seniority.slice(1);
  doc.text(
    `${jobInput.jobTitle} · ${seniority}${jobInput.industry ? ` · ${jobInput.industry}` : ''}`,
    margin, 24
  );

  // Date
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 32);
  doc.text('ResumeMatchAI', pageWidth - margin, 32, { align: 'right' });

  y = 46;

  // —— OVERALL SCORE ——
  const scoreColor = getScoreColor(result.overallScore);

  // Score circle area
  doc.setFillColor(...COLORS.bgLight);
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'S');

  // Score number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...scoreColor);
  doc.text(`${result.overallScore}`, margin + 18, y + 22, { align: 'center' });

  // /100 label
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('/100', margin + 27, y + 22);

  // Summary text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.textDark);
  const summaryLines = doc.splitTextToSize(result.summary, contentWidth - 55);
  doc.text(summaryLines.slice(0, 3), margin + 42, y + 10);

  y += 42;

  // —— SECTION SCORES ——
  drawSectionHeader('Section Scores');

  const scores = [
    { label: 'Skills Match', value: result.sectionScores.skillsMatch },
    { label: 'Experience Match', value: result.sectionScores.experienceMatch },
    { label: 'Education', value: result.sectionScores.education },
    { label: 'ATS Readability', value: result.sectionScores.atsReadability },
    { label: 'Achievement Quality', value: result.sectionScores.achievementQuality },
  ];

  // Draw scores in two columns
  const colWidth = (contentWidth - 10) / 2;
  for (let i = 0; i < scores.length; i++) {
    const col = i % 2;
    if (col === 0 && i > 0) {
      // Don't add extra space between rows — already handled in drawScoreBar
    }
    const savedY = y;
    if (col === 1) y = savedY - 12; // Go back for right column
    drawScoreBar(scores[i].label, scores[i].value, margin + col * (colWidth + 10), colWidth);
    if (col === 0 && i + 1 < scores.length) y = savedY; // Restore for right column
  }

  y += 2;

  // —— TOP ACTIONS ——
  if (result.topActions.length > 0) {
    drawSectionHeader('Priority Actions');

    result.topActions.forEach((action, i) => {
      checkPageBreak(14);

      // Priority badge
      doc.setFillColor(...COLORS.primary);
      doc.circle(margin + 3.5, y - 0.5, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.white);
      doc.text(`${i + 1}`, margin + 3.5, y + 0.8, { align: 'center' });

      // Action text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textDark);
      const actionLines = doc.splitTextToSize(action.text, contentWidth - 14);
      doc.text(actionLines, margin + 10, y);
      y += actionLines.length * 4;

      // Why
      if (action.why) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.textMuted);
        const whyLines = doc.splitTextToSize(`Why: ${action.why}`, contentWidth - 14);
        doc.text(whyLines, margin + 10, y);
        y += whyLines.length * 3.5;
      }

      y += 4;
    });
  }

  // —— KEYWORDS TO ADD ——
  if (result.keywordsToAdd.length > 0) {
    drawSectionHeader('Keywords to Add');

    let kx = margin;
    const ky = y;
    let currentLineY = ky;

    result.keywordsToAdd.forEach((keyword) => {
      const tw = doc.getTextWidth(keyword) + 8;
      if (kx + tw > margin + contentWidth) {
        kx = margin;
        currentLineY += 8;
      }
      checkPageBreak(10);

      doc.setFillColor(238, 242, 255); // indigo-50
      doc.roundedRect(kx, currentLineY - 3.5, tw, 6, 1.5, 1.5, 'F');
      doc.setDrawColor(199, 210, 254); // indigo-200
      doc.roundedRect(kx, currentLineY - 3.5, tw, 6, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text(keyword, kx + 4, currentLineY);

      kx += tw + 3;
    });

    y = currentLineY + 10;
  }

  // —— ATS CHECKLIST ——
  if (result.atsChecklist.length > 0) {
    drawSectionHeader('ATS Checklist');

    result.atsChecklist.forEach((item) => {
      checkPageBreak(8);

      const icon = item.passed ? '✓' : '✗';
      const color = item.passed ? COLORS.accent : COLORS.danger;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...color);
      doc.text(icon, margin + 2, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.textDark);
      doc.text(item.item, margin + 10, y);

      y += 6;
    });
  }

  // —— REWRITTEN BULLETS ——
  if (result.rewrites.length > 0) {
    drawSectionHeader('Suggested Rewrites');

    result.rewrites.forEach((rw, i) => {
      checkPageBreak(24);

      // Original
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.danger);
      doc.text('BEFORE:', margin, y);
      y += 3.5;
      doc.setTextColor(...COLORS.textMuted);
      doc.setFontSize(8);
      const origLines = doc.splitTextToSize(rw.original, contentWidth - 5);
      doc.text(origLines, margin + 2, y);
      y += origLines.length * 3.5 + 2;

      // Improved
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.accent);
      doc.text('AFTER:', margin, y);
      y += 3.5;
      doc.setTextColor(...COLORS.textDark);
      doc.setFontSize(8);
      const impLines = doc.splitTextToSize(rw.improved, contentWidth - 5);
      doc.text(impLines, margin + 2, y);
      y += impLines.length * 3.5;

      // Divider (except last)
      if (i < result.rewrites.length - 1) {
        y += 3;
        doc.setDrawColor(...COLORS.border);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(margin, y, margin + contentWidth, y);
        doc.setLineDashPattern([], 0);
        y += 4;
      }
    });
  }

  // —— SCORE BREAKDOWN ——
  if (result.explainability.scoreBreakdown) {
    drawSectionHeader('How the Score Was Computed');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.textDark);
    const breakdownLines = doc.splitTextToSize(result.explainability.scoreBreakdown, contentWidth - 4);
    breakdownLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 2, y);
      y += 4;
    });
  }

  // —— FOOTER ——
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(
      `ResumeMatchAI — Page ${p} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // Download
  const filename = `ResumeAnalysis-${jobInput.jobTitle.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
