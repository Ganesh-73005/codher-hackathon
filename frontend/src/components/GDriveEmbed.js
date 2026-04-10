import React from 'react';
import { ExternalLink, FileText, Video, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Extracts Google Drive file ID from a URL.
 * Supports: /file/d/{id}/, /open?id={id}, id={id}
 */
function extractGDriveFileId(url) {
  if (!url) return null;
  // /file/d/{id}/
  let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // /open?id={id}
  match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // /d/{id}
  match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return null;
}

/**
 * Embed a Google Drive PDF viewer.
 * Works by using the Google Drive preview URL.
 */
export function GDrivePDFEmbed({ url, title = 'Document' }) {
  const fileId = extractGDriveFileId(url);
  
  if (!url) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 text-muted-foreground">
        <FileText className="w-5 h-5" />
        <span className="text-sm">No PPT/PDF link provided</span>
      </div>
    );
  }
  
  const previewUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview`
    : url;

  return (
    <div className="rounded-xl overflow-hidden border bg-white" data-testid="gdrive-pdf-embed">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <a href={url} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <ExternalLink className="w-3 h-3" /> Open in Drive
          </Button>
        </a>
      </div>
      <iframe
        src={previewUrl}
        width="100%"
        height="480"
        allow="autoplay"
        title={title}
        className="border-0"
        style={{ minHeight: '480px' }}
      />
    </div>
  );
}

/**
 * Embed a Google Drive video viewer.
 */
export function GDriveVideoEmbed({ url, title = 'Demo Video' }) {
  const fileId = extractGDriveFileId(url);
  
  if (!url) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 text-muted-foreground">
        <Video className="w-5 h-5" />
        <span className="text-sm">No video link provided</span>
      </div>
    );
  }
  
  const previewUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview`
    : url;

  return (
    <div className="rounded-xl overflow-hidden border bg-white" data-testid="gdrive-video-embed">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <a href={url} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <ExternalLink className="w-3 h-3" /> Open in Drive
          </Button>
        </a>
      </div>
      <iframe
        src={previewUrl}
        width="100%"
        height="360"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title={title}
        className="border-0"
        style={{ minHeight: '360px' }}
      />
    </div>
  );
}

/**
 * GitHub link preview card.
 */
export function GitHubLinkCard({ url, title = 'GitHub Repository' }) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 text-muted-foreground">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">No GitHub link provided</span>
      </div>
    );
  }
  
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block" data-testid="github-link-card">
      <div className="flex items-center gap-3 p-4 rounded-xl border hover:border-primary/40 hover:bg-accent/30 transition-all">
        <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{url}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </a>
  );
}
