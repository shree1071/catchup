import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Hash } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className = '' }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`markdown-content w-full leading-[1.65] font-['Inter'] ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Table styling: Sleek, high-contrast, rounded Raycast / Linear aesthetic
          table({ children }) {
            return (
              <div className="w-full my-3.5 overflow-x-auto rounded-[10px] border border-[#282a36] bg-[#0b0c10] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <table className="w-full border-collapse text-left text-[13px]">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-[#13151d] text-[#ffffff] font-semibold border-b border-[#282a36]">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-[#1c1e28]">{children}</tbody>;
          },
          tr({ children }) {
            return (
              <tr className="hover:bg-[#151722]/70 transition-colors">
                {children}
              </tr>
            );
          },
          th({ children }) {
            return (
              <th className="px-3.5 py-2.5 font-semibold text-[#ffffff] font-['Inter'] text-[12px] tracking-wide uppercase text-opacity-90">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3.5 py-2.5 text-[#d6d6d8] font-['Inter'] text-[13px] align-middle">
                {children}
              </td>
            );
          },
          // Headings
          h1({ children }) {
            return (
              <h1 className="text-[20px] font-bold text-[#ffffff] mt-4 mb-2 pb-1 border-b border-[#232530] tracking-tight">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-[17px] font-bold text-[#ffffff] mt-3.5 mb-2 tracking-tight flex items-center gap-2">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-[15px] font-semibold text-[#ffffff] mt-3 mb-1.5 text-opacity-95">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-[13px] font-semibold text-[#ff6363] uppercase tracking-wider mt-2.5 mb-1 font-['GeistMono']">
                {children}
              </h4>
            );
          },
          // Paragraphs
          p({ children }) {
            return <p className="my-2 text-[14px] sm:text-[15px] text-[#e3e3e5] leading-relaxed">{children}</p>;
          },
          // Bold text
          strong({ children }) {
            return <strong className="font-semibold text-[#ffffff] font-['Inter']">{children}</strong>;
          },
          // Unordered Lists
          ul({ children }) {
            return <ul className="my-2.5 pl-5 space-y-1.5 list-disc text-[#d6d6d8] marker:text-[#ff6363]">{children}</ul>;
          },
          // Ordered Lists
          ol({ children }) {
            return <ol className="my-2.5 pl-5 space-y-1.5 list-decimal text-[#d6d6d8] marker:text-[#ff6363] font-['Inter']">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-[14px] leading-relaxed">{children}</li>;
          },
          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="my-3 pl-3.5 border-l-2 border-[#ff6363] bg-[#ff6363]/5 py-1.5 pr-3 rounded-r-[6px] text-[#bbbbbf] italic text-[13px]">
                {children}
              </blockquote>
            );
          },
          // Code blocks & inline code
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              const textContent = String(children);
              // Special channel badge formatting: #all-inmodel, #social, etc.
              if (/^#[a-z0-9_-]+$/i.test(textContent.trim())) {
                return (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 mx-0.5 rounded-[4px] bg-[#1a1c28] border border-[#32364a] text-[#7eb7ff] font-['GeistMono'] text-[12px] font-medium">
                    <Hash className="w-3 h-3 opacity-60 shrink-0" />
                    <span>{textContent.replace('#', '')}</span>
                  </span>
                );
              }
              // Normal inline code
              return (
                <code
                  className="px-1.5 py-0.5 rounded-[4px] bg-[#151722] border border-[#2b2e3e] text-[#ff8080] font-['GeistMono'] text-[12px] font-normal"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Multi-line code block with copy button
            const codeString = String(children).replace(/\n$/, '');
            const isCopied = copiedCode === codeString;
            return (
              <div className="relative my-3 rounded-[10px] bg-[#08090d] border border-[#232532] overflow-hidden text-[13px] font-['GeistMono']">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#10121a] border-b border-[#232532] text-[11px] text-[#8c8d94]">
                  <span>{match ? match[1] : 'code'}</span>
                  <button
                    onClick={() => handleCopyCode(codeString)}
                    className="flex items-center gap-1 hover:text-[#ffffff] transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-[#59d499]" />
                        <span className="text-[#59d499]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-[#d8d8dc] leading-relaxed">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
          // Horizontal Rule
          hr() {
            return <hr className="my-4 border-t border-[#232532]" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
