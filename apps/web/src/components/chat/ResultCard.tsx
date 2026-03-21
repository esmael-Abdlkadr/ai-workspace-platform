'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, Copy, Check, FileText, Download } from 'lucide-react';

type Props = { result: string; notionPageUrl: string | null; title?: string };

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

function markdownToPrintHtml(markdown: string, title: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${title}</title>
<style>
  body { font-family: Georgia, serif; max-width: 740px; margin: 40px auto; padding: 0 24px; color: #111; line-height: 1.7; }
  h1 { font-size: 2em; margin-bottom: 0.25em; }
  h2 { font-size: 1.4em; margin-top: 1.8em; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  h3 { font-size: 1.1em; color: #444; }
  p  { margin: 0.75em 0; }
  ul, ol { padding-left: 1.5em; }
  li { margin: 0.3em 0; }
  strong { font-weight: 600; }
  code { background: #f4f4f4; padding: 2px 5px; border-radius: 4px; font-size: 0.88em; }
  blockquote { border-left: 3px solid #ccc; padding-left: 1em; color: #555; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<pre style="white-space:pre-wrap;font-family:Georgia,serif">${markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
}

export function ResultCard({ result, notionPageUrl, title = 'document' }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    downloadFile(result, `${slugify(title)}.md`, 'text/markdown');
  };

  const handleDownloadPdf = () => {
    const html = markdownToPrintHtml(result, title);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-2)' }}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Result</span>
        </div>
        <div className="flex items-center gap-1.5">
          {notionPageUrl && (
            <a
              href={notionPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent-hover)', border: '1px solid var(--accent)30' }}
            >
              <ExternalLink className="h-3 w-3" />
              Notion
            </a>
          )}
          <button
            onClick={handleDownloadMd}
            title="Download as Markdown"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <Download className="h-3 w-3" />
            .md
          </button>
          <button
            onClick={handleDownloadPdf}
            title="Download as PDF"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <Download className="h-3 w-3" />
            PDF
          </button>
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:opacity-80"
            style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}
          >
            {copied ? <Check className="h-3.5 w-3.5" style={{ color: 'var(--success)' }} /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-5" style={{ maxHeight: '60vh' }}>
        <style>{`
          .result-prose h1, .result-prose h2, .result-prose h3 { color: var(--text-primary); font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
          .result-prose h1 { font-size: 1.25em; }
          .result-prose h2 { font-size: 1.1em; }
          .result-prose h3 { font-size: 1em; color: var(--accent-hover); }
          .result-prose p { color: var(--text-secondary); line-height: 1.7; margin-bottom: 0.75em; }
          .result-prose ul, .result-prose ol { color: var(--text-secondary); padding-left: 1.25em; }
          .result-prose li { margin-bottom: 0.25em; }
          .result-prose strong { color: var(--text-primary); font-weight: 600; }
          .result-prose code { background: var(--surface-3); color: var(--accent-hover); padding: 0.1em 0.3em; border-radius: 4px; font-size: 0.85em; }
          .result-prose blockquote { border-left: 2px solid var(--accent); padding-left: 1em; color: var(--text-muted); }
          .result-prose hr { border-color: var(--border); }
        `}</style>
        <div className="result-prose">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
