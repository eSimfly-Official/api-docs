import React, {useState, useCallback} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import prompts from '@site/src/prompts';
import styles from './styles.module.css';

function copyText(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers / non-secure contexts
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Renders the AI-assistant prompt for one endpoint (or the full API) with a
 * copy button, a link to the raw .txt, and a collapsible preview.
 *
 * <LlmPrompt id="packages" />           – per-endpoint prompt
 * <LlmPrompt id="esimfly-api-full-prompt" open />  – full prompt, expanded
 */
export default function LlmPrompt({id, open = false}) {
  const prompt = prompts[id];
  const rawUrl = useBaseUrl(`/llm/${id}.txt`);
  const guideUrl = useBaseUrl('/docs/llm-integration');
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const onCopy = useCallback(() => {
    if (!prompt) return;
    copyText(prompt.text)
      .then(() => {
        setFailed(false);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        setCopied(false);
        setFailed(true);
        setTimeout(() => setFailed(false), 4000);
      });
  }, [prompt]);

  if (!prompt) {
    return <div className={styles.card}>Unknown prompt: {id}</div>;
  }

  const isFull = id === 'esimfly-api-full-prompt';
  const lines = prompt.text.split('\n').length;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.title}>
          <span aria-hidden="true">🤖</span>
          {isFull ? 'AI prompt — complete integration' : `AI prompt — ${prompt.title}`}
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={onCopy}>
            {copied ? 'Copied ✓' : failed ? 'Copy failed — select the text below' : 'Copy prompt'}
          </button>
          <a
            className="button button--outline button--secondary button--sm"
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer">
            Open raw .txt
          </a>
        </div>
      </div>
      <p className={styles.pattern}>
        Paste into ChatGPT, Claude, Cursor, Copilot or any coding agent to generate this part of your
        integration. <strong>Built-in recommendation:</strong> {prompt.pattern}.
      </p>
      <details className={styles.details} open={open}>
        <summary>{open ? 'Prompt text' : `Show prompt text (${lines} lines)`}</summary>
        <pre className={styles.pre}>
          <code>{prompt.text}</code>
        </pre>
      </details>
      {!isFull && (
        <p className={styles.meta}>
          Building the whole integration? Use the{' '}
          <a href={guideUrl}>complete prompt for all endpoints</a> instead of
          combining the per-endpoint ones.
        </p>
      )}
    </div>
  );
}
