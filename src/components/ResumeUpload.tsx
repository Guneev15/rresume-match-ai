'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

interface Props {
  onFileSelected: (file: File) => void;
  onTextPaste: (text: string) => void;
  initialText?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['.pdf', '.docx', '.doc', '.txt'];

export default function ResumeUpload({ onFileSelected, onTextPaste, initialText }: Props) {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState(initialText || '');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 5 MB.');
      return false;
    }
    return true;
  }, []);

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setError(null);
      onFileSelected(file);
    }
  }, [validateFile, onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleTextChange = (text: string) => {
    setPasteText(text);
    if (text.trim().length > 20) {
      onTextPaste(text);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '4px' }}>
        <button
          onClick={() => setMode('upload')}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: mode === 'upload' ? 'var(--bg-surface)' : 'transparent',
            color: mode === 'upload' ? 'var(--text-primary)' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontWeight: 500,
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
          }}
        >
          <Upload size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Upload File
        </button>
        <button
          onClick={() => setMode('paste')}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: mode === 'paste' ? 'var(--bg-surface)' : 'transparent',
            color: mode === 'paste' ? 'var(--text-primary)' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontWeight: 500,
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
          }}
        >
          <FileText size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Paste Text
        </button>
      </div>

      {mode === 'upload' ? (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '12px',
              padding: selectedFile ? '20px' : '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'var(--accent-subtle)' : 'var(--bg-surface)',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            {selectedFile ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <FileText size={20} style={{ color: 'var(--accent)' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    transition: 'color 0.2s',
                  }}
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={32} style={{ color: dragOver ? 'var(--accent)' : 'var(--text-muted)', marginBottom: '12px' }} />
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '4px' }}>
                  Drop your resume here or click to browse
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Supports PDF, DOCX, and TXT — max 5 MB
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        </>
      ) : (
        <textarea
          value={pasteText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste your resume text here..."
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '16px',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.6,
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
      )}

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.2)',
          borderRadius: '8px',
          color: 'var(--error)',
          fontSize: '0.85rem',
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
