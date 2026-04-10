import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, ImageIcon, X } from 'lucide-react';
import { channelsApi } from '../api/channelsApi';
import { resolveAssetUrl } from '../api/httpClient';
import LinkPreviewResponse from '../types/LinkPreviewType';
import Skeleton from '../components/ui/Skeleton';

const FENCED_CODE_SEGMENT_RE = /(```(?:[\w-]+)?\n?[\s\S]*?```)/g;
const IMAGE_MARKER_RE = /%%IMG\|([^%]+)%%/g;
const URL_RE = /https?:\/\/[^\s)\]>]+/g;
const TRAILING_URL_PUNCTUATION_RE = /[.,!?;:'"]+$/;
const IMAGE_EXTENSION_RE = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
const GIF_EXTENSION_RE = /\.gif(?:[?#].*)?$/i;
const GIF_PROVIDER_HOSTS = [
  'giphy.com',
  'media.giphy.com',
  'i.giphy.com',
  'tenor.com',
  'media.tenor.com',
  'c.tenor.com',
];

type LinkPreviewCacheValue = LinkPreviewResponse | null;

const previewCache = new Map<string, LinkPreviewCacheValue>();
const previewPromiseCache = new Map<string, Promise<LinkPreviewCacheValue>>();

interface MatchCandidate {
  index: number;
  end: number;
  node: React.ReactNode;
}

function sanitizeUrl(rawUrl: string): string {
  return rawUrl.trim().replace(TRAILING_URL_PUNCTUATION_RE, '');
}

function formatDisplayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === '/' ? '' : parsed.pathname;
    return `${parsed.host}${path}${parsed.search}`;
  } catch {
    return url;
  }
}

function getHostname(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function isLikelyImageUrl(url: string): boolean {
  return IMAGE_EXTENSION_RE.test(url);
}

function isGifUrl(url: string): boolean {
  return GIF_EXTENSION_RE.test(url);
}

function isGifProviderHost(host: string | null): boolean {
  if (!host) {
    return false;
  }

  return GIF_PROVIDER_HOSTS.some((providerHost) => host === providerHost || host.endsWith(`.${providerHost}`));
}

function shouldHideInlineUrl(url: string): boolean {
  return isLikelyImageUrl(url) || isGifProviderHost(getHostname(url));
}

function shouldRenderAsMediaPreview(preview: LinkPreviewResponse, fallbackUrl: string): boolean {
  if (preview.kind === 'image' && !!preview.imageUrl) {
    return true;
  }

  if (!preview.imageUrl) {
    return false;
  }

  const finalUrl = preview.finalUrl || fallbackUrl;
  const previewHost = getHostname(finalUrl);
  const isGifLike = isGifUrl(preview.imageUrl)
    || isGifUrl(finalUrl)
    || (preview.contentType ?? '').toLowerCase().includes('gif');

  return isGifLike || isGifProviderHost(previewHost);
}

function createFallbackPreview(url: string): LinkPreviewResponse {
  return {
    url,
    finalUrl: url,
    kind: isLikelyImageUrl(url) ? 'image' : 'link',
    siteName: getHostname(url),
    imageUrl: isLikelyImageUrl(url) ? url : null,
    title: isLikelyImageUrl(url) ? formatDisplayUrl(url) : null,
  };
}

async function fetchLinkPreview(url: string): Promise<LinkPreviewCacheValue> {
  if (previewCache.has(url)) {
    return previewCache.get(url) ?? null;
  }

  const pendingRequest = previewPromiseCache.get(url);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = channelsApi
    .getLinkPreview(url)
    .then((response) => {
      const data = response.data ?? createFallbackPreview(url);
      previewCache.set(url, data);
      previewPromiseCache.delete(url);
      return data;
    })
    .catch(() => {
      const fallback = createFallbackPreview(url);
      previewCache.set(url, fallback);
      previewPromiseCache.delete(url);
      return fallback;
    });

  previewPromiseCache.set(url, request);
  return request;
}

function useLinkPreview(url: string) {
  const cachedPreview = previewCache.get(url) ?? null;
  const [preview, setPreview] = useState<LinkPreviewCacheValue>(cachedPreview);
  const [isLoading, setIsLoading] = useState(!cachedPreview);

  useEffect(() => {
    let isActive = true;

    if (previewCache.has(url)) {
      setPreview(previewCache.get(url) ?? null);
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    setIsLoading(true);

    void fetchLinkPreview(url).then((value) => {
      if (!isActive) return;
      setPreview(value);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [url]);

  return {
    isLoading,
    preview: preview ?? createFallbackPreview(url),
  };
}

function extractPreviewUrls(text: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const segments = text.split(FENCED_CODE_SEGMENT_RE);

  segments.forEach((segment) => {
    if (segment.startsWith('```') && segment.endsWith('```')) {
      return;
    }

    const withoutImages = segment.replace(IMAGE_MARKER_RE, ' ');
    const withoutInlineCode = withoutImages.replace(/`[^`\n]+`/g, ' ');
    const matches = withoutInlineCode.match(URL_RE) ?? [];

    matches.forEach((match) => {
      const normalizedUrl = sanitizeUrl(match);
      if (!normalizedUrl || seen.has(normalizedUrl)) {
        return;
      }

      seen.add(normalizedUrl);
      urls.push(normalizedUrl);
    });
  });

  return urls;
}

function ImageLightbox({
  src,
  alt,
  title,
  subtitle,
  onClose,
}: {
  src: string;
  alt: string;
  title?: string | null;
  subtitle?: string | null;
  onClose: () => void;
}) {
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-[#05070c]/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3">
        <div className="min-w-0">
          {title && <div className="truncate text-sm font-semibold text-white">{title}</div>}
          {(subtitle || imageSize) && (
            <div className="truncate text-xs text-gray-400">
              {[subtitle, imageSize ? `${imageSize.width} x ${imageSize.height}` : null]
                .filter(Boolean)
                .join(' • ')}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/[0.1]"
            onClick={(event) => event.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open original
          </a>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.1]"
            aria-label="Close image preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex h-full items-center justify-center px-6 pb-8 pt-20" onClick={onClose}>
        <div
          className="max-h-full max-w-[min(96vw,1440px)]"
          onClick={(event) => event.stopPropagation()}
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[calc(100vh-7rem)] max-w-full rounded-2xl border border-white/10 bg-black/20 object-contain shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
            onLoad={(event) => {
              setImageSize({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              });
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ClickableImagePreview({
  url,
  alt,
  title,
  subtitle,
  compact = false,
}: {
  url: string;
  alt: string;
  title?: string | null;
  subtitle?: string | null;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const src = resolveAssetUrl(url) ?? url;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group mt-2 inline-block max-w-full cursor-zoom-in text-left"
      >
        <div className="overflow-hidden rounded-xl shadow-[0_14px_40px_rgba(0,0,0,0.22)] transition duration-200">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className={`block h-auto w-auto max-w-full transition duration-200 group-hover:scale-[1.01] ${compact ? 'max-h-[300px] max-w-[380px] object-contain' : 'max-h-[360px] max-w-[460px] object-contain'}`}
          />
        </div>
      </button>

      {isOpen && (
        <ImageLightbox
          src={src}
          alt={alt}
          title={title}
          subtitle={subtitle}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

function InlineLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-300 underline decoration-sky-400/35 underline-offset-4 transition hover:text-sky-200"
    >
      {url}
    </a>
  );
}

function ImageAttachment({ url }: { url: string }) {
  return (
    <ClickableImagePreview
      url={url}
      alt="Message attachment"
      compact
    />
  );
}

function WebsitePreviewCard({ preview, url }: { preview: LinkPreviewResponse; url: string }) {
  const displayUrl = formatDisplayUrl(preview.finalUrl || url);
  const siteName = preview.siteName || getHostname(preview.finalUrl || url) || 'External link';
  const previewImage = preview.imageUrl ? resolveAssetUrl(preview.imageUrl) ?? preview.imageUrl : null;
  const favicon = preview.faviconUrl ? resolveAssetUrl(preview.faviconUrl) ?? preview.faviconUrl : null;

  return (
    <a
      href={preview.finalUrl || url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block w-full max-w-[460px] overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition hover:border-sky-400/35 hover:bg-[linear-gradient(180deg,rgba(56,189,248,0.12),rgba(255,255,255,0.03))]"
    >
      {previewImage && (
        <div className="border-b border-white/10 bg-black/20">
          <img
            src={previewImage}
            alt={preview.title || siteName}
            className="max-h-[220px] w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {favicon ? (
            <img src={favicon} alt="" className="h-4 w-4 rounded-sm object-cover" loading="lazy" />
          ) : (
            <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-white/[0.08] text-gray-300">
              <ImageIcon className="h-3 w-3" />
            </div>
          )}
          <span className="truncate">{siteName}</span>
          <span className="text-gray-600">•</span>
          <span className="truncate">{displayUrl}</span>
        </div>

        {preview.title && (
          <div className="line-clamp-2 text-sm font-semibold text-white">
            {preview.title}
          </div>
        )}

        {preview.description && (
          <div className="line-clamp-3 text-sm leading-6 text-gray-300">
            {preview.description}
          </div>
        )}
      </div>
    </a>
  );
}

function FallbackLinkCard({ preview, url }: { preview: LinkPreviewResponse; url: string }) {
  const finalUrl = preview.finalUrl || url;
  const displayUrl = formatDisplayUrl(finalUrl);
  const siteName = preview.siteName || getHostname(finalUrl) || 'External link';

  return (
    <a
      href={finalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex w-full max-w-[460px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-gray-200 transition hover:border-sky-400/35 hover:bg-sky-400/[0.08]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 text-sky-300">
        <ExternalLink className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium text-white">{siteName}</div>
        <div className="truncate text-xs text-gray-400">{displayUrl}</div>
      </div>
    </a>
  );
}

function LinkPreviewCard({ url }: { url: string }) {
  const { isLoading, preview } = useLinkPreview(url);
  const effectivePreview = preview ?? createFallbackPreview(url);
  const finalUrl = effectivePreview.finalUrl || url;
  const title = effectivePreview.title || formatDisplayUrl(finalUrl);
  const subtitle = effectivePreview.siteName || getHostname(finalUrl);

  if (isLoading && effectivePreview.kind === 'link') {
    return (
      <div className="mt-2 w-full max-w-[460px] rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-3 w-full max-w-[220px] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (shouldRenderAsMediaPreview(effectivePreview, url) && effectivePreview.imageUrl) {
    return (
      <ClickableImagePreview
        url={effectivePreview.imageUrl}
        alt={title}
        title={title}
        subtitle={subtitle}
      />
    );
  }

  if (effectivePreview.kind === 'website' && (effectivePreview.title || effectivePreview.description || effectivePreview.imageUrl)) {
    return <WebsitePreviewCard preview={effectivePreview} url={url} />;
  }

  return <FallbackLinkCard preview={effectivePreview} url={url} />;
}

function LinkPreviewList({ urls }: { urls: string[] }) {
  const uniqueUrls = useMemo(() => urls.filter(Boolean), [urls]);

  if (uniqueUrls.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {uniqueUrls.map((url) => (
        <LinkPreviewCard key={url} url={url} />
      ))}
    </div>
  );
}

function parseInline(text: string, prefix: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = text;
  let offset = 0;

  while (remaining.length > 0) {
    const candidates: MatchCandidate[] = [];

    const codeM = /`([^`\n]+)`/.exec(remaining);
    if (codeM) candidates.push({
      index: codeM.index,
      end: codeM.index + codeM[0].length,
      node: (
        <code
          key={`${prefix}-c${offset + codeM.index}`}
          className="rounded bg-black/30 px-1 py-0.5 font-mono text-[0.82em] text-indigo-300"
        >
          {codeM[1]}
        </code>
      ),
    });

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

    const mentionM = /@([\w.]+)/.exec(remaining);
    if (mentionM) candidates.push({
      index: mentionM.index,
      end: mentionM.index + mentionM[0].length,
      node: (
        <span
          key={`${prefix}-m${offset + mentionM.index}`}
          className="rounded bg-indigo-500/10 px-0.5 font-medium text-indigo-400"
        >
          @{mentionM[1]}
        </span>
      ),
    });

    const urlM = /https?:\/\/[^\s)\]>]+/.exec(remaining);
    if (urlM) {
      const sanitizedUrl = sanitizeUrl(urlM[0]);

      candidates.push({
        index: urlM.index,
        end: urlM.index + sanitizedUrl.length,
        node: shouldHideInlineUrl(sanitizedUrl)
          ? null
          : <InlineLink key={`${prefix}-u${offset + urlM.index}`} url={sanitizedUrl} />,
      });
    }

    if (candidates.length === 0) {
      if (remaining) result.push(remaining);
      break;
    }

    const earliest = candidates.reduce((a, b) => (a.index <= b.index ? a : b));

    if (earliest.index > 0) result.push(remaining.slice(0, earliest.index));
    result.push(earliest.node);
    offset += earliest.end;
    remaining = remaining.slice(earliest.end);
  }

  return result;
}

export function renderContent(text: string): React.ReactNode {
  const previewUrls = extractPreviewUrls(text);
  const segments = text.split(FENCED_CODE_SEGMENT_RE);
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
          className="my-1.5 overflow-x-auto whitespace-pre rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[0.82em] text-gray-200"
          data-lang={lang || undefined}
        >
          <code>{code.trimEnd()}</code>
        </pre>,
      );
    } else {
      const parts = segment.split(/(%%IMG\|[^%]+%%)/g);
      parts.forEach((part, pi) => {
        if (part.startsWith('%%IMG|') && part.endsWith('%%')) {
          const url = part.slice(6, -2);
          result.push(<ImageAttachment key={`img-${si}-${pi}`} url={url} />);
        } else {
          const lines = part.split('\n');
          lines.forEach((line, li) => {
            if (li > 0) result.push(<br key={`br-${si}-${pi}-${li}`} />);
            parseInline(line, `s${si}p${pi}l${li}`).forEach((node) => result.push(node));
          });
        }
      });
    }
  });

  return (
    <>
      {result}
      <LinkPreviewList urls={previewUrls} />
    </>
  );
}
