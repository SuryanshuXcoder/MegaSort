import { supabase } from './supabase';

export interface Folder { id:string; user_id:string; name:string; parent_id:string|null; created_at:string; }

export async function getFolders(): Promise<Folder[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('folders').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createFolder(name:string, parentId:string|null=null): Promise<Folder> {
  if (!supabase) throw new Error('Folders require Supabase cloud mode.');
  const { data:user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Sign in required');
  const { data,error } = await supabase.from('folders').insert({ user_id:user.user.id, name:name.trim(), parent_id:parentId }).select().single();
  if(error) throw error;
  return data;
}
