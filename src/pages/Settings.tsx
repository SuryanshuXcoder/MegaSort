import { useEffect, useRef, useState } from 'react';
import { Cloud, Download, HardDrive, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { hasSupabase, supabase } from '@/lib/supabase';
import { listAllFiles } from '@/lib/fileService';
import { PageTitle } from './Dashboard';

type BackupRow = {
  id: string;
  label: string;
  file_count: number;
  folder_count: number;
  created_at: string;
  payload?: any;
};

function getLocalSnapshot() {
  const local: Record<string,string> = {};
  for (let i=0;i<localStorage.length;i++) {
    const key=localStorage.key(i);
    if (key && key.startsWith('megasort')) local[key]=localStorage.getItem(key) || '';
  }
  return local;
}

function downloadJson(name:string, data:any){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=name;a.click();
  URL.revokeObjectURL(url);
}

export function Settings() {
 const {user,guest,signOut}=useAuth();
 const [backups,setBackups]=useState<BackupRow[]>([]);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const fileInput=useRef<HTMLInputElement>(null);

 const loadBackups=async()=>{
   if(!supabase||!user||guest){setBackups([]);return;}
   const {data,error}=await supabase.from('app_backups').select('id,label,file_count,folder_count,created_at').order('created_at',{ascending:false}).limit(10);
   if(error){setMessage(error.message);return;}
   setBackups((data||[]) as BackupRow[]);
 };

 useEffect(()=>{void loadBackups()},[user?.id,guest]);

 const createCloudBackup=async()=>{
   if(!supabase||!user||guest)return;
   setBusy(true);setMessage('');
   try{
     const files=await listAllFiles();
     const payload={version:1,createdAt:new Date().toISOString(),files,local:getLocalSnapshot()};
     const {error}=await supabase.from('app_backups').insert({
       user_id:user.id,
       label:'MegaSort backup '+new Date().toLocaleString(),
       payload,
       file_count:files.length,
       folder_count:0
     });
     if(error)throw error;
     setMessage('Cloud backup created successfully.');
     await loadBackups();
   }catch(e:any){setMessage(e.message||'Backup failed');}
   finally{setBusy(false);}
 };

 const exportLocal=async()=>{
   const files=await listAllFiles();
   downloadJson('megasort-backup-'+new Date().toISOString().slice(0,10)+'.json',{
     app:'MegaSort',version:1,createdAt:new Date().toISOString(),files,local:getLocalSnapshot()
   });
   setMessage('Backup file exported.');
 };

 const restoreCloud=async(id:string)=>{
   if(!supabase||!user||guest)return;
   setBusy(true);setMessage('');
   try{
     const {data,error}=await supabase.from('app_backups').select('payload').eq('id',id).single();
     if(error)throw error;
     const local=data?.payload?.local||{};
     Object.entries(local).forEach(([k,v])=>localStorage.setItem(k,String(v)));
     setMessage('Backup preferences restored. File metadata snapshot is preserved in the cloud backup.');
   }catch(e:any){setMessage(e.message||'Restore failed');}
   finally{setBusy(false);}
 };

 const deleteBackup=async(id:string)=>{
   if(!supabase||!user||guest)return;
   const {error}=await supabase.from('app_backups').delete().eq('id',id);
   if(error){setMessage(error.message);return;}
   setMessage('Backup deleted.');
   await loadBackups();
 };

 const importLocal=async(file:File)=>{
   try{
     const raw=await file.text();
     const parsed=JSON.parse(raw);
     if(parsed?.app!=='MegaSort' && !parsed?.local) throw new Error('This is not a valid MegaSort backup.');
     Object.entries(parsed.local||{}).forEach(([k,v])=>localStorage.setItem(k,String(v)));
     setMessage('Local backup imported. Refreshing the page will apply restored preferences.');
   }catch(e:any){setMessage(e.message||'Import failed');}
 };

 return <div>
   <PageTitle title="Settings" subtitle="Account, storage and backup configuration."/>
   <div className="settings-grid">
     <section className="panel">
       <h2>Account</h2>
       <div className="setting-row"><span>Status</span><strong>{guest?'Guest / local session':'Authenticated'}</strong></div>
       <div className="setting-row"><span>Email</span><strong>{user?.email||'Not signed in'}</strong></div>
       {!guest&&<button className="danger-button" onClick={signOut}>Sign out</button>}
     </section>
     <section className="panel">
       <h2>Storage</h2>
       <div className="setting-row"><span>Backend</span><strong>{hasSupabase?'Supabase Cloud':'Browser local mode'}</strong></div>
       <div className="setting-row"><span>Bucket</span><strong>files</strong></div>
       <p className="muted">Your live files remain in Supabase Storage. Backups below preserve your MegaSort metadata and browser preferences.</p>
     </section>
   </div>

   <section className="panel backup-panel">
     <div className="backup-head">
       <div><h2>Backup Center</h2><p className="muted">Create cloud snapshots or download a portable JSON backup.</p></div>
       <div className="backup-actions">
         {!guest&&hasSupabase&&<button className="primary" onClick={createCloudBackup} disabled={busy}><Cloud size={16}/>{busy?'Working...':'Cloud backup'}</button>}
         <button className="secondary" onClick={exportLocal}><Download size={16}/>Export JSON</button>
         <button className="secondary" onClick={()=>fileInput.current?.click()}><Upload size={16}/>Import JSON</button>
         <input ref={fileInput} hidden type="file" accept=".json,application/json" onChange={e=>{const f=e.target.files?.[0];if(f)void importLocal(f);e.currentTarget.value=''}}/>
       </div>
     </div>

     {guest&&<div className="backup-info"><HardDrive size={17}/> Guest mode uses local export/import. Sign in to enable private Supabase cloud backups.</div>}
     {message&&<div className="backup-message">{message}</div>}

     {!guest&&hasSupabase&&<div className="backup-list">
       {backups.length===0?<div className="empty-backup">No cloud backups yet.</div>:backups.map(b=><div className="backup-row" key={b.id}>
         <div className="backup-icon"><Cloud size={17}/></div>
         <div className="backup-meta"><strong>{b.label}</strong><small>{new Date(b.created_at).toLocaleString()} · {b.file_count} file records</small></div>
         <button className="secondary small" disabled={busy} onClick={()=>restoreCloud(b.id)}><RefreshCw size={14}/>Restore</button>
         <button className="icon-btn danger" title="Delete backup" onClick={()=>deleteBackup(b.id)}><Trash2 size={15}/></button>
       </div>)}
     </div>}
   </section>
 </div>;
}
