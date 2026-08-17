import { useEffect, useMemo, useState } from 'react';
import { Check, Download, FileText, Image as ImageIcon, MoreVertical, Search, Trash2, X } from 'lucide-react';
import { listFiles, downloadFile, trashFile } from '@/lib/fileService';
import { exportCSV, exportPDF, formatBytes } from '@/lib/export';
import { categoryIcon } from '@/lib/classify';
import type { ManagedFile } from '@/types';
import { useToast } from '@/context/ToastContext';
import { PageTitle } from './Dashboard';

export function MyFiles({ refreshKey, onChange }: { refreshKey:number; onChange:()=>void }) {
  const [files,setFiles]=useState<ManagedFile[]>([]);
  const [q,setQ]=useState(''); const [cat,setCat]=useState('All'); const [selected,setSelected]=useState<string[]>([]);
  const [exportOpen,setExportOpen]=useState(false);
  const {toast}=useToast();
  const load=()=>listFiles().then(setFiles).catch(e=>toast(e.message,'error'));
  useEffect(()=>{load()},[refreshKey]);
  const filtered=useMemo(()=>files.filter(f=>(cat==='All'||f.category===cat)&&f.name.toLowerCase().includes(q.toLowerCase())),[files,q,cat]);
  const remove=async(id:string)=>{try{await trashFile(id);await load();onChange();toast('Moved to Trash','success')}catch(e:any){toast(e.message,'error')}};
  const toggle=(id:string)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const selectAll=()=>setSelected(selected.length===filtered.length?[]:filtered.map(f=>f.id));
  const cats=['All','Images','Documents','Videos','Audio','Archives','Code','Other'];
  return <div><PageTitle title="My Files" subtitle={`${filtered.length} organized file${filtered.length===1?'':'s'}.`} action={<div className="export-wrap"><button className="secondary" onClick={()=>setExportOpen(v=>!v)}>Export ▾</button>{exportOpen&&<div className="menu"><button onClick={()=>exportCSV(filtered)}>Export CSV</button><button onClick={()=>exportPDF(filtered)}>Export PDF</button></div>}</div>}/>
    <div className="toolbar"><div className="search-box"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search files..."/></div><select value={cat} onChange={e=>setCat(e.target.value)}>{cats.map(c=><option key={c}>{c}</option>)}</select>{selected.length>0&&<div className="selection-info">{selected.length} selected <button className="icon-btn" onClick={()=>setSelected([])}><X size={15}/></button></div>}</div>
    <div className="panel table-panel"><div className="table-head"><div><input type="checkbox" checked={filtered.length>0&&selected.length===filtered.length} onChange={selectAll}/></div><span>Name</span><span>Category</span><span>Status</span><span>Size</span><span>Uploaded</span><span/></div>
      {filtered.length===0?<div className="empty"><FileText size={32}/><h3>No files found</h3><p>Upload files or change your search filter.</p></div>:filtered.map(f=><div className="file-row" key={f.id}><div><input type="checkbox" checked={selected.includes(f.id)} onChange={()=>toggle(f.id)}/></div><div className="file-name"><span className="file-icon">{categoryIcon(f.category)}</span><span title={f.name}>{f.name}</span></div><div>{f.category}</div><div><span className={`badge ${f.status}`}>{f.status==='review'?'Needs review':f.status}</span></div><div>{formatBytes(f.size)}</div><div>{new Date(f.created_at).toLocaleDateString()}</div><div className="row-actions"><button className="icon-btn" title="Download" onClick={()=>downloadFile(f).catch(e=>toast(e.message,'error'))}><Download size={16}/></button><button className="icon-btn danger" title="Trash" onClick={()=>remove(f.id)}><Trash2 size={16}/></button></div></div>)}
    </div>
  </div>;
}
