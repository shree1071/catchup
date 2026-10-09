import React, { useState } from 'react';
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

  // Helper to format inline text: bold, code, channel tags
  const renderInline = (text: string): React.ReactNode => {
    // Split by inline code `...`
    const codeParts = text.split(/(`[^`]+`)/g);
    return codeParts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeText = part.slice(1, -1);
        if (/^#[a-z0-9_-]+$/i.test(codeText.trim())) {
          return (
            <span
              key={pIdx}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 mx-0.5 rounded-[4px] bg-[#1a1c28] border border-[#32364a] text-[#7eb7ff] font-['GeistMono'] text-[12px] font-medium"
            >
              <Hash className="w-3 h-3 opacity-60 shrink-0" />
              <span>{codeText.replace('#', '')}</span>
            </span>
          );
        }
        return (
          <code
            key={pIdx}
            className="px-1.5 py-0.5 rounded-[4px] bg-[#151722] border border-[#2b2e3e] text-[#ff8080] font-['GeistMono'] text-[12px]"
          >
            {codeText}
          </code>
        );
      }

      // Check bold **...**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={`${pIdx}-${bIdx}`} className="font-semibold text-[#ffffff]">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return <span key={`${pIdx}-${bIdx}`}>{bPart}</span>;
      });
    });
  };

  // Parse blocks: code fences, tables, headers, lists, paragraphs
  const renderBlocks = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (line === undefined) { i++; continue; }

      // Code Block fence ```
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim() || 'code';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i]!.trim().startsWith('```')) {
          codeLines.push(lines[i]!);
          i++;
        }
        i++; // skip closing ```
        const codeText = codeLines.join('\n');
        const isCopied = copiedCode === codeText;
        elements.push(
          <div
            key={`code-${i}`}
            className="relative my-3 rounded-[10px] bg-[#08090d] border border-[#232532] overflow-hidden text-[13px] font-['GeistMono']"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#10121a] border-b border-[#232532] text-[11px] text-[#8c8d94]">
              <span>{lang}</span>
              <button
                onClick={() => handleCopyCode(codeText)}
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
              <code>{codeText}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Markdown Table (| col1 | col2 |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i]!.trim().startsWith('|') && lines[i]!.trim().endsWith('|')) {
          tableLines.push(lines[i]!);
          i++;
        }
        if (tableLines.length >= 2) {
          const headerCells = tableLines[0]!
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          // row 1 is delimiter (| --- | --- |)
          const bodyRows = tableLines.slice(2).map((r) =>
            r
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim())
          );

          elements.push(
            <div
              key={`table-${i}`}
              className="w-full my-3.5 overflow-x-auto rounded-[10px] border border-[#282a36] bg-[#0b0c10] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              <table className="w-full border-collapse text-left text-[13px]">
                <thead className="bg-[#13151d] text-[#ffffff] font-semibold border-b border-[#282a36]">
                  <tr>
                    {headerCells.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-3.5 py-2.5 font-semibold text-[#ffffff] font-['Inter'] text-[12px] tracking-wide uppercase text-opacity-90"
                      >
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1e28]">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#151722]/70 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-3.5 py-2.5 text-[#d6d6d8] font-['Inter'] text-[13px] align-middle"
                        >
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Headers #, ##, ###
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-[20px] font-bold text-[#ffffff] mt-4 mb-2 pb-1 border-b border-[#232530] tracking-tight">
            {renderInline(line.slice(2))}
          </h1>
        );
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-[17px] font-bold text-[#ffffff] mt-3.5 mb-2 tracking-tight">
            {renderInline(line.slice(3))}
          </h2>
        );
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-[15px] font-semibold text-[#ffffff] mt-3 mb-1.5 text-opacity-95">
            {renderInline(line.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      // Blockquotes >
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={`quote-${i}`} className="my-3 pl-3.5 border-l-2 border-[#ff6363] bg-[#ff6363]/5 py-1.5 pr-3 rounded-r-[6px] text-[#bbbbbf] italic text-[13px]">
            {renderInline(line.slice(2))}
          </blockquote>
        );
        i++;
        continue;
      }

      // Horizontal Rules ---
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={`hr-${i}`} className="my-4 border-t border-[#232532]" />);
        i++;
        continue;
      }

      // Unordered List bullet points (•, -, *)
      if (/^(\s*[-*•])\s+/.test(line)) {
        const listItems: string[] = [];
        while (i < lines.length && /^(\s*[-*•])\s+/.test(lines[i]!)) {
          listItems.push(lines[i]!.replace(/^(\s*[-*•])\s+/, ''));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-2.5 pl-5 space-y-1.5 list-disc text-[#d6d6d8] marker:text-[#ff6363]">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} className="text-[14px] leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list 1. 2.
      if (/^\s*\d+\.\s+/.test(line)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]!)) {
          listItems.push(lines[i]!.replace(/^\s*\d+\.\s+/, ''));
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="my-2.5 pl-5 space-y-1.5 list-decimal text-[#d6d6d8] marker:text-[#ff6363]">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} className="text-[14px] leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Regular Paragraph
      if (line.trim()) {
        elements.push(
          <p key={`p-${i}`} className="my-2 text-[14px] sm:text-[15px] text-[#e3e3e5] leading-relaxed">
            {renderInline(line)}
          </p>
        );
      }
      i++;
    }

    return elements;
  };

  return (
    <div className={`markdown-content w-full leading-[1.65] font-['Inter'] ${className}`}>
      {renderBlocks()}
    </div>
  );
};
