import { supabase } from './supabase';
import type { Activity } from '@/types';

export async function logActivity(action:string,fileName?:string,fileId?:string):Promise<void>{
  if(!supabase)return;
  const {data:user}=await supabase.auth.getUser();
  if(!user.user)return;
  await supabase.from('activity_logs').insert({user_id:user.user.id,action,file_name:fileName||null,file_id:fileId||null});
}
export async function getActivity(limit=20):Promise<Activity[]>{
  if(!supabase)return [];
  const {data,error}=await supabase.from('activity_logs').select('id,action,file_name,created_at').order('created_at',{ascending:false}).limit(limit);
  if(error)throw error;
  return data||[];
}
