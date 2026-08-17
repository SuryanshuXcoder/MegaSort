import { useRef, useState } from 'react';
import { CheckCircle2, CloudUpload, FileUp, Loader2 } from 'lucide-react';
import { uploadFiles, type UploadProgress } from '@/lib/fileService';
import { useToast } from '@/context/ToastContext';
import { PageTitle } from './Dashboard';

export function Upload({ onDone }: { onDone:()=>void }) {
  const input=useRef<HTMLInputElement>(null);
  const [drag,setDrag]=useState(false);
  const [progress,setProgress]=useState<UploadProgress|null>(null);
  const [selected,setSelected]=useState<File[]>([]);
  const {toast}=useToast();

  const choose=(list:FileList|null)=>{if(!list)return;setSelected(Array.from(list));setProgress(null)};
  const start=async()=>{if(!selected.length)return;setProgress({total:selected.length,completed:0,failed:0});const results=await uploadFiles(selected,setProgress);setSelected([]);setProgress(null);onDone();toast(`${results.length} file${results.length===1?'':'s'} organized successfully`,'success')};
  const pct=progress?Math.round(progress.completed/progress.total*100):0;
  return <div><PageTitle title="Upload" subtitle="Drop hundreds of files and MegaSort will classify them automatically."/>
    <div className={`dropzone ${drag?'dragging':''}`} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);choose(e.dataTransfer.files)}} onClick={()=>input.current?.click()}>
      <input ref={input} hidden type="file" multiple onChange={e=>choose(e.target.files)}/>
      <div className="upload-icon"><CloudUpload size={32}/></div><h2>Drop files here</h2><p>or click to browse — 500+ files are supported</p><span className="muted">Files are classified by type, extension and MIME metadata.</span>
    </div>
    {selected.length>0 && <div className="panel upload-queue"><div className="queue-head"><div><h2>{selected.length} files ready</h2><p className="muted">MegaSort uses a 4-file concurrent upload queue.</p></div><button className="primary" onClick={start} disabled={!!progress}><FileUp size={17}/> Start organizing</button></div>
      <div className="file-preview">{selected.slice(0,12).map(f=><div key={f.name+f.lastModified}><span>{f.name}</span><small>{(f.size/1024).toFixed(1)} KB</small></div>)}{selected.length>12&&<div className="muted">+ {selected.length-12} more...</div>}</div>
    </div>}
    {progress&&<div className="panel progress-panel"><div className="progress-head"><span><Loader2 className="spin" size={17}/> Processing {progress.current}</span><strong>{progress.completed}/{progress.total}</strong></div><div className="progress-bar"><div style={{width:`${pct}%`}}/></div><div className="progress-foot"><span>{pct}% complete</span><span>{progress.failed} failed</span></div>{progress.completed===progress.total&&<div className="success-line"><CheckCircle2 size={17}/> Processing complete.</div>}</div>}
  </div>;
}
