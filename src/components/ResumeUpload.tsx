'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  onFileSelected: (file: File) => void;
  onTextPaste: (text: string) => void;
  initialText?: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const MAX_SIZE_MB = 5;

export default function ResumeUpload({ onFileSelected, onTextPaste, initialText }: Props) {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState(initialText || '');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback((file: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    setSelectedFile(file);
    onFileSelected(file);
  }, [onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  }, [validateAndSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleTextChange = (text: string) => {
    setPasteText(text);
    onTextPaste(text);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Mode toggle */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'var(--bg-elevated)',
        borderRadius: '12px',
        padding: '4px',
        border: '1px solid var(--border)',
      }}>
        <button
          type="button"
          onClick={() => setMode('upload')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '9px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: mode === 'upload' ? 600 : 500,
            fontFamily: 'var(--font-heading)',
            color: mode === 'upload' ? 'white' : 'var(--text-muted)',
            background: mode === 'upload'
              ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
              : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Upload size={14} /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode('paste')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '9px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: mode === 'paste' ? 600 : 500,
            fontFamily: 'var(--font-heading)',
            color: mode === 'paste' ? 'white' : 'var(--text-muted)',
            background: mode === 'paste'
              ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
              : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <FileText size={14} /> Paste Text
        </button>
      </div>

      {mode === 'upload' ? (
        <>
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '14px',
              padding: selectedFile ? '20px' : '40px 24px',
              textAlign: 'center',
              cursor: selectedFile ? 'default' : 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              background: dragOver ? 'var(--accent-subtle)' : 'rgba(18, 18, 26, 0.4)',
              boxShadow: dragOver ? '0 0 24px var(--accent-glow)' : 'none',
            }}
          >
            {selectedFile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(62, 207, 180, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {(selectedFile.size / 1024).toFixed(0)} KB · Ready
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  style={{
                    background: 'rgba(255, 107, 107, 0.08)',
                    border: '1px solid rgba(255, 107, 107, 0.12)',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--error)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--accent-subtle)',
                  margin: '0 auto 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Upload size={22} style={{ color: 'var(--accent)' }} />
                </div>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}>
                  Drop your resume here or <span style={{ color: 'var(--accent)' }}>browse</span>
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  PDF, DOCX, or TXT · max {MAX_SIZE_MB}MB
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) validateAndSelect(file);
              }}
              style={{ display: 'none' }}
            />
          </div>
        </>
      ) : (
        <textarea
          value={pasteText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste your resume text here..."
          rows={10}
          className="input"
          style={{
            minHeight: '200px',
            resize: 'vertical',
            lineHeight: 1.7,
            fontSize: '0.88rem',
          }}
        />
      )}

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'rgba(255, 107, 107, 0.06)',
          border: '1px solid rgba(255, 107, 107, 0.12)',
          borderRadius: '10px',
          color: 'var(--error)',
          fontSize: '0.82rem',
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}
    </div>
  );
}
