import React, { useState } from 'react';
import { resolveAssetUrl } from '../api/httpClient';

// ── Image attachment marker: %%IMG|/files/attachments/...%% ──────────────────
// const IMG_RE = /%%IMG\|([^%]+)%%/g;

function ImageAttachment({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const src = resolveAssetUrl(url) ?? url;

  return (
    <>
      <div className="mt-1.5 inline-block">
        <img
          src={src}
          alt="вложение"
          onClick={() => setOpen(true)}
          className="max-w-[360px] max-h-[280px] rounded-xl object-cover border border-white/10 cursor-zoom-in hover:brightness-110 transition-[filter]"
          loading="lazy"
        />
      </div>
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <img
            src={src}
            alt="вложение"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}


interface MatchCandidate {
  index: number;
  end: number;
  node: React.ReactNode;
}

/** Parses a single line of text and returns an array of React nodes with inline formatting applied. */
function parseInline(text: string, prefix: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = text;
  let offset = 0;

  while (remaining.length > 0) {
    const candidates: MatchCandidate[] = [];

    // Inline code — processed first so its content is never re-parsed
    const codeM = /`([^`\n]+)`/.exec(remaining);
    if (codeM) candidates.push({
      index: codeM.index,
      end: codeM.index + codeM[0].length,
      node: (
        <code
          key={`${prefix}-c${offset + codeM.index}`}
          className="bg-black/30 text-indigo-300 rounded px-1 py-0.5 text-[0.82em] font-mono"
        >
          {codeM[1]}
        </code>
      ),
    });

    // Bold (**text**)
    const boldM = /\*\*(.+?)\*\*/.exec(remaining);
    if (boldM) candidates.push({
      index: boldM.index,
      end: boldM.index + boldM[0].length,
      node: (
        <strong key={`${prefix}-b${offset + boldM.index}`} className="font-semibold text-white">
          {boldM[1]}
        </strong>
      ),
    });

    // Italic (*text*) — negative lookaround avoids matching ** bold **
    const italicM = /(?<!\*)\*([^*\n]+)\*(?!\*)/.exec(remaining);
    if (italicM) candidates.push({
      index: italicM.index,
      end: italicM.index + italicM[0].length,
      node: (
        <em key={`${prefix}-i${offset + italicM.index}`} className="italic text-gray-200">
          {italicM[1]}
        </em>
      ),
    });

    // Strikethrough (~~text~~)
    const strikeM = /~~(.+?)~~/.exec(remaining);
    if (strikeM) candidates.push({
      index: strikeM.index,
      end: strikeM.index + strikeM[0].length,
      node: (
        <s key={`${prefix}-s${offset + strikeM.index}`} className="text-gray-500">
          {strikeM[1]}
        </s>
      ),
    });

    // @mention
    const mentionM = /@([\w.]+)/.exec(remaining);
    if (mentionM) candidates.push({
      index: mentionM.index,
      end: mentionM.index + mentionM[0].length,
      node: (
        <span
          key={`${prefix}-m${offset + mentionM.index}`}
          className="text-indigo-400 font-medium bg-indigo-500/10 rounded px-0.5"
        >
          @{mentionM[1]}
        </span>
      ),
    });

    // URL
    const urlM = /https?:\/\/[^\s)\]>]+/.exec(remaining);
    if (urlM) candidates.push({
      index: urlM.index,
      end: urlM.index + urlM[0].length,
      node: (
        <a
          key={`${prefix}-u${offset + urlM.index}`}
          href={urlM[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline break-all"
        >
          {urlM[0]}
        </a>
      ),
    });

    if (candidates.length === 0) {
      if (remaining) result.push(remaining);
      break;
    }

    // Pick the earliest match (bold wins over italic when at the same position)
    const earliest = candidates.reduce((a, b) => (a.index <= b.index ? a : b));

    if (earliest.index > 0) result.push(remaining.slice(0, earliest.index));
    result.push(earliest.node);
    offset += earliest.end;
    remaining = remaining.slice(earliest.end);
  }

  return result;
}

/**
 * Renders message content with markdown formatting:
 * - ```code blocks```
 * - `inline code`
 * - **bold**, *italic*, ~~strikethrough~~
 * - @mentions
 * - https:// links
 */
export function renderContent(text: string): React.ReactNode {
  // Split on fenced code blocks first so their contents are never processed as markdown
  const segments = text.split(/(```(?:[\w-]+)?\n?[\s\S]*?```)/g);
  const result: React.ReactNode[] = [];

  segments.forEach((segment, si) => {
    if (segment.startsWith('```') && segment.endsWith('```')) {
      const inner = segment.slice(3, -3);
      const firstNewline = inner.indexOf('\n');
      const lang = firstNewline >= 0 ? inner.slice(0, firstNewline).trim() : '';
      const code = firstNewline >= 0 ? inner.slice(firstNewline + 1) : inner;
      result.push(
        <pre
          key={`pre-${si}`}
          className="my-1.5 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[0.82em] font-mono text-gray-200 overflow-x-auto whitespace-pre"
          data-lang={lang || undefined}
        >
          <code>{code.trimEnd()}</code>
        </pre>
      );
    } else {
      // Split on %%IMG|url%% markers to render inline images
      const parts = segment.split(/(%%IMG\|[^%]+%%)/g);
      parts.forEach((part, pi) => {
        if (part.startsWith('%%IMG|') && part.endsWith('%%')) {
          const url = part.slice(6, -2);
          result.push(<ImageAttachment key={`img-${si}-${pi}`} url={url} />);
        } else {
          const lines = part.split('\n');
          lines.forEach((line, li) => {
            if (li > 0) result.push(<br key={`br-${si}-${pi}-${li}`} />);
            parseInline(line, `s${si}p${pi}l${li}`).forEach(node => result.push(node));
          });
        }
      });
    }
  });

  return <>{result}</>;
}
