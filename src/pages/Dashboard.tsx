import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Archive, Copy, File, Image, HardDrive, Activity as ActivityIcon } from 'lucide-react';
import { listAllFiles } from '@/lib/fileService';
import { formatBytes } from '@/lib/export';
import type { ManagedFile } from '@/types';
import { StatCard } from '@/components/StatCard';
import { categoryIcon } from '@/lib/classify';

export function Dashboard({ refreshKey }: { refreshKey:number }) {
  const [files,setFiles]=useState<ManagedFile[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{setLoading(true);listAllFiles().then(setFiles).finally(()=>setLoading(false))},[refreshKey]);
  const active=files.filter(f=>f.status!=='trash');
  const total=active.reduce((n,f)=>n+f.size,0);
  const counts=useMemo(()=>active.reduce((a,f)=>{a[f.category]=(a[f.category]||0)+1;return a},{} as Record<string,number>),[active]);
  const categories=['Images','Documents','Videos','Audio','Archives','Code','Other'];
  return <div>
    <PageTitle title="Dashboard" subtitle="An overview of your files and storage."/>
    <div className="stats-grid">
      <StatCard label="Total files" value={active.length} icon={<File/>}/>
      <StatCard label="Storage used" value={formatBytes(total)} icon={<HardDrive/>}/>
      <StatCard label="Needs review" value={active.filter(f=>f.status==='review').length} icon={<AlertCircle/>}/>
      <StatCard label="Duplicates" value={active.filter(f=>f.status==='duplicate').length} icon={<Copy/>}/>
    </div>
    <div className="dashboard-grid">
      <section className="panel"><h2>Storage by category</h2><div className="category-list">{categories.map(c=><div className="category-row" key={c}><span>{categoryIcon(c as any)} {c}</span><strong>{counts[c]||0}</strong></div>)}</div></section>
      <section className="panel"><h2>Recent activity</h2>{loading?<p className="muted">Loading...</p>:active.slice(0,8).map(f=><div className="activity-row" key={f.id}><ActivityIcon size={15}/><div><div>Uploaded <strong>{f.name}</strong></div><small>{new Date(f.created_at).toLocaleString()}</small></div></div>)}</section>
    </div>
  </div>;
}
export function PageTitle({title,subtitle,action}:{title:string;subtitle?:string;action?:React.ReactNode}){return <div className="page-title"><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>}
