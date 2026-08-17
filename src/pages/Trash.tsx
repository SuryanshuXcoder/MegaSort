import { useEffect, useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { listFiles, restoreFile, permanentDeleteFile } from '@/lib/fileService';
import type { ManagedFile } from '@/types';
import { formatBytes } from '@/lib/export';
import { useToast } from '@/context/ToastContext';
import { PageTitle } from './Dashboard';

export function Trash({ refreshKey,onChange }:{refreshKey:number;onChange:()=>void}) {
 const [files,setFiles]=useState<ManagedFile[]>([]); const {toast}=useToast();
 const load=()=>listFiles(true).then(setFiles).catch(e=>toast(e.message,'error')); useEffect(()=>{load()},[refreshKey]);
 const restore=async(f:ManagedFile)=>{try{await restoreFile(f.id);await load();onChange();toast('File restored','success')}catch(e:any){toast(e.message,'error')}};
 const destroy=async(f:ManagedFile)=>{if(!confirm(`Permanently delete ${f.name}?`))return;try{await permanentDeleteFile(f);await load();onChange();toast('File permanently deleted','success')}catch(e:any){toast(e.message,'error')}};
 return <div><PageTitle title="Trash" subtitle="Deleted files can be restored or permanently removed."/>
 <div className="panel table-panel">{files.length===0?<div className="empty"><Trash2 size={32}/><h3>Trash is empty</h3><p>Deleted files will appear here.</p></div>:files.map(f=><div className="file-row simple" key={f.id}><div className="file-name"><span className="file-icon">🗑️</span><span>{f.name}</span></div><div>{f.category}</div><div>{formatBytes(f.size)}</div><div>{f.deleted_at?new Date(f.deleted_at).toLocaleDateString():''}</div><div className="row-actions"><button className="secondary small" onClick={()=>restore(f)}><RotateCcw size={15}/> Restore</button><button className="danger-button small" onClick={()=>destroy(f)}><Trash2 size={15}/> Delete forever</button></div></div>)}</div></div>;
}
