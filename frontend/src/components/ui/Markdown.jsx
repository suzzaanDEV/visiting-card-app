import React from 'react';

// Minimal, safe Markdown renderer — outputs React elements only (never innerHTML).
// Supports: #/##/### headings, - and 1. lists, **bold**, *italic*, _italic_, `code`,
// [links](url), --- rules, blockquotes, and paragraphs. Unknown content is escaped.

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderInline = (text, keyPrefix) => {
  // Per-call instance: exec() mutates the regex's lastIndex, so a shared
  // module-level /g regex is corrupted when renderInline recurses for **bold**.
  const INLINE_TOKEN = /(\*\*\*|\*\*|\*|_|`|\[([^\]]+)\]\(([^)]+)\))/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let i = 0;

  while ((match = INLINE_TOKEN.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;

    if (token.startsWith('`')) {
      parts.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 text-[0.9em] font-mono"
        >
          {escapeHtml(token.slice(1, -1))}
        </code>
      );
    } else if (token.startsWith('***')) {
      parts.push(<strong key={key} className="font-bold">{renderInline(token.slice(3, -3), key)}</strong>);
    } else if (token.startsWith('**')) {
      parts.push(<strong key={key} className="font-bold">{renderInline(token.slice(2, -2), key)}</strong>);
    } else if (token === '*' || token === '_') {
      parts.push(<em key={key} className="italic">{escapeHtml(token)}</em>);
    } else if (token.startsWith('*') || token.startsWith('_')) {
      parts.push(<em key={key} className="italic">{escapeHtml(token.slice(1, -1))}</em>);
    } else if (token.startsWith('[')) {
      const label = match[2];
      const href = match[3];
      parts.push(
        <a
          key={key}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300"
        >
          {escapeHtml(label)}
        </a>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return parts.map((p, idx) =>
    typeof p === 'string' ? <React.Fragment key={`${keyPrefix}-s-${idx}`}>{escapeHtml(p)}</React.Fragment> : p
  );
};

const TEXT = 'text-slate-600 dark:text-slate-300';

const Markdown = ({ content, className = '' }) => {
  const raw = String(content || '').replace(/\r\n/g, '\n');
  const lines = raw.split('\n');
  const blocks = [];
  let pendingList = null; // { ordered, items: [{key, node}] }
  let skipComment = false;

  const listClass = (ordered) =>
    `${ordered ? 'list-decimal' : 'list-disc'} pl-6 mb-4 space-y-1.5 ${TEXT}`;

  const flushList = () => {
    if (!pendingList) return;
    const { ordered, items } = pendingList;
    const List = ordered ? 'ol' : 'ul';
    blocks.push(
      <List key={`list-${blocks.length}`} className={listClass(ordered)}>
        {items.map((item) => (
          <li key={item.key}>{item.node}</li>
        ))}
      </List>
    );
    pendingList = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    const trimmed = line.trim();

    if (skipComment) {
      if (trimmed.includes('-->')) skipComment = false;
      continue;
    }
    if (trimmed.startsWith('<!--')) {
      if (!trimmed.includes('-->')) skipComment = true;
      continue;
    }

    if (!trimmed) {
      flushList();
      continue;
    }

    // Fenced code block
    if (/^```/.test(trimmed)) {
      flushList();
      const fence = [];
      while (i + 1 < lines.length) {
        i += 1;
        if (lines[i].trim().startsWith('```')) break;
        fence.push(lines[i]);
      }
      blocks.push(
        <pre
          key={`code-${i}`}
          className="mb-4 p-4 rounded-lg bg-slate-900 dark:bg-slate-900 text-slate-100 text-sm overflow-x-auto font-mono"
        >
          {fence.join('\n')}
        </pre>
      );
      continue;
    }

    // Headings
    const hdr = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (hdr) {
      flushList();
      const level = hdr[1].length;
      const Tag = `h${level}`;
      const hClass = ['text-3xl font-extrabold tracking-tight mb-4 mt-10 first:mt-0', 'text-2xl font-bold tracking-tight mb-3 mt-8', 'text-lg font-semibold mb-2 mt-6'][level - 1];
      blocks.push(
        <Tag key={`h-${i}`} className={`${hClass} text-slate-900 dark:text-white`}>
          {renderInline(hdr[2], `h-${i}`)}
        </Tag>
      );
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushList();
      blocks.push(<hr key={`hr-${i}`} className="border-slate-200 dark:border-slate-700 my-6" />);
      continue;
    }

    // Blockquote
    const bqMatch = trimmed.match(/^>\s?(.*)$/);
    if (bqMatch) {
      flushList();
      blocks.push(
        <blockquote key={`bq-${i}`} className="border-l-4 border-emerald-500 pl-4 my-4 italic text-slate-600 dark:text-slate-300">
          {renderInline(bqMatch[1], `bq-${i}`)}
        </blockquote>
      );
      continue;
    }

    // Lists
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    const olMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ulMatch || olMatch) {
      const ordered = Boolean(olMatch);
      const itemText = (olMatch || ulMatch)[1];
      if (!pendingList || pendingList.ordered !== ordered) {
        flushList();
        pendingList = { ordered, items: [] };
      }
      pendingList.items.push({ key: `li-${i}`, node: renderInline(itemText, `li-${i}`) });
      continue;
    }

    // Plain paragraph (accumulate consecutive non-special lines)
    flushList();
    const para = [trimmed];
    while (i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (!nextLine || /^(#{1,3})\s|^```|^[-*]\s|^\d+[.)]\s|^>/.test(nextLine)) break;
      para.push(nextLine);
      i += 1;
    }
    blocks.push(
      <p key={`p-${i}`} className={`leading-relaxed mb-4 ${TEXT}`}>
        {para.map((pLine, idx) => (
          <React.Fragment key={idx}>
            {renderInline(pLine, `p-${i}-${idx}`)}
            {idx < para.length - 1 ? <br /> : null}
          </React.Fragment>
        ))}
      </p>
    );
  }
  flushList();

  return <div className={className}>{blocks}</div>;
};

export default Markdown;