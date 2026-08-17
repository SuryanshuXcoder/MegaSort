import type { Category } from '@/types';

const groups: Record<Category, Set<string>> = {
  Images: new Set(['jpg','jpeg','png','gif','webp','svg','bmp','ico','tif','tiff','avif','heic']),
  Documents: new Set(['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','csv','rtf','odt','ods','odp','md']),
  Videos: new Set(['mp4','mov','mkv','avi','webm','m4v','wmv','flv','3gp']),
  Audio: new Set(['mp3','wav','ogg','m4a','aac','flac','wma','opus']),
  Archives: new Set(['zip','rar','7z','tar','gz','bz2','xz','iso']),
  Code: new Set(['js','jsx','ts','tsx','html','css','scss','json','py','java','c','cpp','h','hpp','cs','php','go','rs','rb','swift','kt','sql','sh','bat','ps1']),
  Other: new Set(),
};

const mimeCategory = (mime: string): Category | null => {
  if (mime.startsWith('image/')) return 'Images';
  if (mime.startsWith('video/')) return 'Videos';
  if (mime.startsWith('audio/')) return 'Audio';
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('excel') || mime.includes('powerpoint') ||
      mime.startsWith('text/') || mime.includes('spreadsheet') || mime.includes('document')) return 'Documents';
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('7z') || mime.includes('tar') || mime.includes('gzip')) return 'Archives';
  return null;
};

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : '';
}

export function classifyFile(file: File): { category: Category; confidence: number; extension: string } {
  const extension = extensionOf(file.name);
  const fromExtension = (Object.keys(groups) as Category[]).find((category) => groups[category].has(extension));
  if (fromExtension) return { category: fromExtension, confidence: 0.99, extension };

  const fromMime = mimeCategory(file.type || '');
  if (fromMime) return { category: fromMime, confidence: 0.92, extension };

  return { category: 'Other', confidence: extension ? 0.55 : 0.35, extension };
}

export const categoryIcon = (category: Category): string => ({
  Images: '🖼️',
  Documents: '📄',
  Videos: '🎬',
  Audio: '🎵',
  Archives: '📦',
  Code: '💻',
  Other: '📁',
}[category]);
