import React from 'react';
import ReactMarkdown from 'react-markdown';

/** Fix escaped markdown from LLM (e.g. \*\*bold\*\*) */
function normalizeMarkdown(text: string): string {
  return text
    .replace(/\\\*\\\*/g, '**')
    .replace(/\\\*/g, '*')
    .replace(/\\n/g, '\n');
}

interface ChatMessageContentProps {
  content: string;
  className?: string;
}

export function ChatMessageContent({ content, className = '' }: ChatMessageContentProps) {
  const normalized = normalizeMarkdown(content);

  return (
    <div className={`chat-markdown text-sm leading-relaxed text-white/95 ${className}`}>
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-white">{children}</strong>
        ),
        em: ({ children }) => <em className="text-white/90 italic">{children}</em>,
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-1.5 marker:text-[#0F6B3E]">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-1.5">{children}</ol>
        ),
        li: ({ children }) => <li className="text-white/90 pl-0.5">{children}</li>,
        h1: ({ children }) => (
          <h3 className="text-base font-bold text-white mb-2 mt-1">{children}</h3>
        ),
        h2: ({ children }) => (
          <h4 className="text-sm font-bold text-white mb-2 mt-1">{children}</h4>
        ),
        h3: ({ children }) => (
          <h5 className="text-sm font-semibold text-[#0F6B3E] mb-1">{children}</h5>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0F6B3E] underline hover:text-white transition-colors"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="bg-white/10 px-1.5 py-0.5 rounded text-[#0F6B3E] text-xs">
            {children}
          </code>
        ),
      }}
    >
      {normalized}
    </ReactMarkdown>
    </div>
  );
}
