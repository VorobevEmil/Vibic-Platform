interface LinkPreviewResponse {
  url: string;
  finalUrl: string;
  kind: 'image' | 'website' | 'link';
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  siteName?: string | null;
  faviconUrl?: string | null;
  contentType?: string | null;
}

export default LinkPreviewResponse;
