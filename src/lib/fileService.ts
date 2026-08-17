import { supabase } from './supabase';
import { classifyFile } from './classify';
import { sha256 } from './hashing';
import type { Category, ManagedFile } from '@/types';

const BUCKET = 'files';
const LOCAL_KEY = 'megasort-local-files';

const readLocal = (): ManagedFile[] => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as ManagedFile[]; }
  catch { return []; }
};
const writeLocal = (files: ManagedFile[]) => localStorage.setItem(LOCAL_KEY, JSON.stringify(files));

const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : '';
};

const rowToFile = (r: any, duplicate = false): ManagedFile => ({
  id: r.id,
  user_id: r.user_id,
  name: r.name,
  storage_path: r.storage_path,
  mime_type: r.mime_type || '',
  size: Number(r.size_bytes || 0),
  category: r.category as Category,
  extension: extensionOf(r.name),
  hash: r.file_hash || null,
  confidence: Number(r.confidence ?? 1),
  status: r.is_deleted ? 'trash' : (duplicate ? 'duplicate' : (r.needs_review ? 'review' : 'organized')),
  tags: [],
  created_at: r.created_at,
  deleted_at: r.deleted_at,
});

const mapRows = (rows: any[]): ManagedFile[] => {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (row.file_hash && !row.is_deleted) counts.set(row.file_hash, (counts.get(row.file_hash) || 0) + 1);
  }
  return rows.map(row => rowToFile(row, Boolean(row.file_hash && counts.get(row.file_hash)! > 1)));
};

export async function listFiles(includeTrash = false): Promise<ManagedFile[]> {
  if (!supabase) return readLocal().filter(f => includeTrash ? f.status === 'trash' : f.status !== 'trash');
  const { data, error } = await supabase.from('files').select('*')
    .eq('is_deleted', includeTrash).order('created_at', { ascending: false });
  if (error) throw error;
  return mapRows(data || []);
}

export async function listAllFiles(): Promise<ManagedFile[]> {
  if (!supabase) return readLocal();
  const { data, error } = await supabase.from('files').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return mapRows(data || []);
}

export interface UploadProgress { total: number; completed: number; current?: string; failed: number; }

export async function uploadFiles(files: File[], onProgress?: (progress: UploadProgress) => void): Promise<ManagedFile[]> {
  const results: ManagedFile[] = [];
  let completed = 0;
  let failed = 0;
  const queue = [...files];
  const worker = async () => {
    while (queue.length) {
      const file = queue.shift();
      if (!file) return;
      try {
        const result = await uploadOne(file, onProgress, { total: files.length, get completed() { return completed; }, get failed() { return failed; } });
        results.push(result);
      } catch (error) {
        console.error('Upload failed:', file.name, error);
        failed += 1;
      } finally {
        completed += 1;
        onProgress?.({ total: files.length, completed, current: file.name, failed });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, files.length || 1) }, worker));
  return results;
}

async function uploadOne(file: File, onProgress: ((p: UploadProgress) => void) | undefined, state: { total: number; readonly completed: number; readonly failed: number }): Promise<ManagedFile> {
  const classification = classifyFile(file);
  const hash = await sha256(file);
  onProgress?.({ total: state.total, completed: state.completed, current: file.name, failed: state.failed });

  if (!supabase) {
    const existing = readLocal();
    const duplicate = existing.find(f => f.hash === hash && f.status !== 'trash');
    const item: ManagedFile = {
      id: crypto.randomUUID(), name: file.name, storage_path: '', mime_type: file.type, size: file.size,
      category: classification.category, extension: classification.extension, hash,
      confidence: classification.confidence,
      status: duplicate ? 'duplicate' : classification.confidence < 0.7 ? 'review' : 'organized',
      tags: [], created_at: new Date().toISOString(),
    };
    writeLocal([item, ...existing]);
    return item;
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Please sign in before uploading.');

  const { data: duplicateRows, error: duplicateError } = await supabase.from('files').select('id')
    .eq('user_id', auth.user.id).eq('file_hash', hash).eq('is_deleted', false).limit(1);
  if (duplicateError) throw duplicateError;
  const isDuplicate = Boolean(duplicateRows?.length);

  const safeName = file.name.replace(/[^\w.\- ()]/g, '_');
  const path = `${auth.user.id}/${classification.category.toLowerCase()}/${crypto.randomUUID()}-${safeName}`;
  const { error: storageError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream', upsert: false,
  });
  if (storageError) throw storageError;

  const { data, error } = await supabase.from('files').insert({
    user_id: auth.user.id, name: file.name, storage_path: path,
    mime_type: file.type || 'application/octet-stream', size_bytes: file.size,
    category: classification.category, confidence: classification.confidence,
    needs_review: classification.confidence < 0.7, file_hash: hash, is_deleted: false,
  }).select().single();

  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
  return rowToFile(data, isDuplicate);
}

export async function downloadFile(file: ManagedFile): Promise<void> {
  if (!supabase) { alert('This file was created in Guest mode. Sign in and upload again to enable cloud downloads.'); return; }
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(file.storage_path, 60);
  if (error) throw error;
  window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

export async function trashFile(id: string): Promise<void> {
  if (!supabase) { writeLocal(readLocal().map(f => f.id === id ? { ...f, status: 'trash', deleted_at: new Date().toISOString() } : f)); return; }
  const { error } = await supabase.from('files').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function restoreFile(id: string): Promise<void> {
  if (!supabase) { writeLocal(readLocal().map(f => f.id === id ? { ...f, status: 'organized', deleted_at: null } : f)); return; }
  const { error } = await supabase.from('files').update({ is_deleted: false, deleted_at: null }).eq('id', id);
  if (error) throw error;
}

export async function permanentDeleteFile(file: ManagedFile): Promise<void> {
  if (!supabase) { writeLocal(readLocal().filter(f => f.id !== file.id)); return; }
  if (file.storage_path) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([file.storage_path]);
    if (storageError) throw storageError;
  }
  const { error } = await supabase.from('files').delete().eq('id', file.id);
  if (error) throw error;
}
