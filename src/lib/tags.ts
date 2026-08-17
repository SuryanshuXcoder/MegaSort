import { supabase } from './supabase';
import type { Tag } from '@/types';

const KEY = 'megasort-local-tags';
const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899'];

const local = (): Tag[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};

export async function getTags(): Promise<Tag[]> {
  if (!supabase) return local();
  const { data, error } = await supabase.from('tags').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createTag(name: string): Promise<Tag> {
  if (!supabase) {
    const tag = { id: crypto.randomUUID(), name: name.trim(), color: colors[local().length % colors.length], created_at: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify([...local(), tag]));
    return tag;
  }
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Sign in required');
  const { data, error } = await supabase.from('tags').insert({ user_id: user.user.id, name: name.trim(), color: colors[Math.floor(Math.random()*colors.length)] }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTag(id: string): Promise<void> {
  if (!supabase) { localStorage.setItem(KEY, JSON.stringify(local().filter(t => t.id !== id))); return; }
  const { error } = await supabase.from('tags').delete().eq('id', id);
  if (error) throw error;
}
