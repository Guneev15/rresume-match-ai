/* eslint-disable @typescript-eslint/no-explicit-any */

export async function parsePDF(file: File): Promise<{ text: string; warnings: string[] }> {
  const warnings: string[] = [];
  try {
    // Dynamic import to avoid SSR issues — only loads in browser
    const pdfjsModule = await import('pdfjs-dist' as any);
    const pdfjsLib = pdfjsModule.default || pdfjsModule;

    // Set worker to use CDN to avoid bundling issues
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const items = content.items as any[];

      // Use Y-position (transform[5]) to detect line breaks
      let lastY: number | null = null;
      const lineChunks: string[] = [];

      for (const item of items) {
        const str = item.str || '';
        if (!str) continue;

        const y = item.transform ? item.transform[5] : null;

        if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
          // Y position changed significantly → new line
          lineChunks.push('\n');
        } else if (lineChunks.length > 0 && !lineChunks[lineChunks.length - 1].endsWith(' ') && !str.startsWith(' ')) {
          lineChunks.push(' ');
        }

        lineChunks.push(str);
        if (y !== null) lastY = y;
      }

      textParts.push(lineChunks.join(''));
    }

    const text = textParts.join('\n\n');
    console.log('[ResumeParser] Extracted text (first 500 chars):', text.slice(0, 500));
    if (text.trim().length < 50) {
      warnings.push(
        'Very little text was extracted — the PDF may be image-based or have unusual formatting. Try pasting the text directly.'
      );
    }
    return { text, warnings };
  } catch (error) {
    console.error('PDF parsing error:', error);
    warnings.push(
      `PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}. Try pasting your resume text instead.`
    );
    return { text: '', warnings };
  }
}

export async function parseDOCX(file: File): Promise<{ text: string; warnings: string[] }> {
  const warnings: string[] = [];
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    if (result.messages.length > 0) {
      warnings.push(...result.messages.map((m: any) => m.message));
    }
    return { text: result.value, warnings };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    warnings.push(`DOCX parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { text: '', warnings };
  }
}

export async function parseTXT(file: File): Promise<{ text: string; warnings: string[] }> {
  const warnings: string[] = [];
  try {
    const text = await file.text();
    return { text, warnings };
  } catch (error) {
    warnings.push(`Text file read error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { text: '', warnings };
  }
}

export async function parseResumeFile(file: File): Promise<{ text: string; warnings: string[] }> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) {
    return parsePDF(file);
  } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
    return parseDOCX(file);
  } else if (name.endsWith('.txt') || name.endsWith('.text')) {
    return parseTXT(file);
  } else {
    return { text: '', warnings: ['Unsupported file type. Please upload a PDF, DOCX, or TXT file.'] };
  }
}
