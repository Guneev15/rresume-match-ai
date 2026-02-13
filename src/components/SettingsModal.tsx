'use client';

import React, { useState } from 'react';
import { Settings, X, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Provider = 'openai' | 'openrouter';

export default function SettingsModal({ isOpen, onClose }: Props) {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('openai_api_key') || '';
    }
    return '';
  });
  const [provider, setProvider] = useState<Provider>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('api_provider') as Provider) || 'openrouter';
    }
    return 'openrouter';
  });
  const [model, setModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_model') || 'openai/gpt-4o-mini';
    }
    return 'openai/gpt-4o-mini';
  });
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (apiKey.trim()) {
        localStorage.setItem('openai_api_key', apiKey.trim());
      } else {
        localStorage.removeItem('openai_api_key');
      }
      localStorage.setItem('api_provider', provider);
      localStorage.setItem('ai_model', model.trim() || (provider === 'openrouter' ? 'openai/gpt-4o-mini' : 'gpt-4o-mini'));
    }
    onClose();
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }
    setTestStatus('testing');
    try {
      const { default: OpenAI } = await import('openai');
      const baseURL = provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : undefined;
      const testModel = model.trim() || (provider === 'openrouter' ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

      const client = new OpenAI({ apiKey: apiKey.trim(), baseURL, dangerouslyAllowBrowser: true });
      await client.chat.completions.create({
        model: testModel,
        messages: [{ role: 'user', content: 'Respond with only the word ok.' }],
        max_tokens: 50,
      });
      setTestStatus('success');
      setTestMessage(`Connected! Model "${testModel}" is working.`);
    } catch (err: unknown) {
      setTestStatus('error');
      // Try to extract detailed error message
      const error = err as { message?: string; error?: { message?: string }; status?: number };
      const detail = error?.error?.message || error?.message || 'Connection failed.';
      setTestMessage(`${detail} — Check your API key, model ID, and account credits.`);
    }
  };

  const handleClear = () => {
    setApiKey('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('openai_api_key');
      localStorage.removeItem('api_provider');
      localStorage.removeItem('ai_model');
    }
    setTestStatus('idle');
    setTestMessage('');
  };

  const labelStyle = {
    display: 'block' as const,
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    fontSize: '0.85rem',
    color: 'var(--text-sub)',
    marginBottom: '8px',
    letterSpacing: '0.03em',
    textTransform: 'uppercase' as const,
  };

  return (
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
        padding: '20px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '480px',
          width: '100%',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Close settings"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Settings size={22} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>
            Settings
          </h2>
        </div>

        {/* Provider toggle */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>API Provider</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {([
              { value: 'openrouter' as Provider, label: 'OpenRouter' },
              { value: 'openai' as Provider, label: 'OpenAI Direct' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setProvider(opt.value);
                  setTestStatus('idle');
                  if (opt.value === 'openrouter' && !model.includes('/')) {
                    setModel('openai/' + model);
                  } else if (opt.value === 'openai' && model.includes('/')) {
                    setModel(model.split('/').pop() || 'gpt-4o-mini');
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: provider === opt.value ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: provider === opt.value ? 'var(--bg-primary)' : 'var(--text-sub)',
                  border: `1px solid ${provider === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: provider === opt.value ? 600 : 400,
                  fontSize: '0.88rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="api-key" style={labelStyle}>
            {provider === 'openrouter' ? 'OpenRouter' : 'OpenAI'} API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              className="input"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setTestStatus('idle'); }}
              placeholder={provider === 'openrouter' ? 'sk-or-...' : 'sk-...'}
              style={{ paddingRight: '40px' }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
              }}
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Model */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="model-id" style={labelStyle}>Model</label>
          <input
            id="model-id"
            type="text"
            className="input"
            value={model}
            onChange={(e) => { setModel(e.target.value); setTestStatus('idle'); }}
            placeholder={provider === 'openrouter' ? 'openai/gpt-4o-mini' : 'gpt-4o-mini'}
          />
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '6px',
            lineHeight: 1.4,
          }}>
            {provider === 'openrouter'
              ? 'Use OpenRouter model IDs like openai/gpt-4o-mini, openai/gpt-5.2-chat, anthropic/claude-sonnet-4, etc.'
              : 'Use OpenAI model IDs like gpt-4o-mini, gpt-4o, etc.'}
          </p>
        </div>

        <div style={{
          padding: '12px 14px',
          background: 'var(--accent-subtle)',
          borderRadius: '8px',
          fontSize: '0.82rem',
          color: 'var(--text-sub)',
          lineHeight: 1.5,
          marginBottom: '20px',
        }}>
          🔒 Your key is stored in your browser only and sent directly to {provider === 'openrouter' ? 'OpenRouter' : 'OpenAI'}. We never see or store it. Without a key, you&apos;ll get a basic keyword-based analysis.
        </div>

        {testMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: testStatus === 'success' ? 'rgba(46, 196, 182, 0.1)' : 'rgba(255, 107, 107, 0.1)',
            border: `1px solid ${testStatus === 'success' ? 'rgba(46, 196, 182, 0.2)' : 'rgba(255, 107, 107, 0.2)'}`,
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: testStatus === 'success' ? 'var(--accent)' : 'var(--error)',
            marginBottom: '20px',
          }}>
            {testStatus === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {testMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleTest} className="btn-secondary" style={{ flex: 1 }} disabled={testStatus === 'testing'}>
            {testStatus === 'testing' ? <Loader2 size={16} className="animate-spin" /> : null}
            Test Connection
          </button>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 1 }}>
            Save
          </button>
        </div>

        {apiKey && (
          <button
            onClick={handleClear}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--error)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Clear stored key
          </button>
        )}
      </div>
    </div>
  );
}
