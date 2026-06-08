import React, { useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Manifest } from '../services/contentService';

interface MarkdownRendererProps {
  markdown: string;
  className?: string;
  inline?: boolean;
  manifest?: Manifest | null;
}

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const CustomCodeComponent: React.FC<any> = ({ node, inline, className, children, ...props }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        });
    };
    
    return !inline ? (
        <div className="code-block-wrapper relative group bg-gray-900/70 rounded-lg ring-1 ring-white/10 my-4 overflow-hidden">
            <div className="flex justify-between items-center px-4 py-1.5 bg-gray-800/50 border-b border-white/10">
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-700/50 rounded-md hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Copy code to clipboard"
                >
                    {copyStatus === 'idle' ? <CopyIcon /> : <CheckIcon />}
                    {copyStatus === 'idle' ? 'Copy' : 'Copied!'}
                </button>
            </div>
            <SyntaxHighlighter
                {...props}
                style={atomDark}
                language={language}
                showLineNumbers
                wrapLines={true}
                customStyle={{ margin: 0, backgroundColor: 'transparent' }}
            >
                {codeString}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code {...props}>{children}</code>
    );
};

const CustomTable: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ node, ...props }: any) => (
    <div className="markdown-table-card">
        <table {...props} />
    </div>
);

const CustomHr: React.FC = () => <hr className="custom-hr" />;

const CustomA: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ node, ...props }: any) => (
    <a target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-200 underline decoration-amber-500/30 transition-colors" {...props} />
);

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown, className, inline = false, manifest }) => {
  if (!markdown) return null;

  const components: Components = {
    p: inline ? React.Fragment : 'p',
    code: CustomCodeComponent,
    table: CustomTable,
    hr: CustomHr,
    a: CustomA,
    img: ({ src, alt, title, ...props }) => {
        let finalSrc = src;
        // If path is relative and we have manifest, resolve it to GitHub Raw
        if (src && !src.startsWith('http') && manifest) {
            const { user, repo, branch } = manifest.data.git;
            finalSrc = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${src.startsWith('/') ? src.slice(1) : src}`;
        }
        return <img src={finalSrc} alt={alt} title={title} loading="lazy" {...props} />;
    }
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
        <ReactMarkdown
            components={components}
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
        >
            {markdown}
        </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;