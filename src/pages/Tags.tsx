import { useEffect, useState } from 'react';
import { Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import { createTag, deleteTag, getTags } from '@/lib/tags';
import type { Tag } from '@/types';
import { useToast } from '@/context/ToastContext';
import { PageTitle } from './Dashboard';

export function Tags({refreshKey}:{refreshKey:number}) {
 const [tags,setTags]=useState<Tag[]>([]); const [name,setName]=useState(''); const {toast}=useToast();
 const load=()=>getTags().then(setTags).catch(e=>toast(e.message,'error')); useEffect(()=>{load()},[refreshKey]);
 const add=async()=>{if(!name.trim())return;try{await createTag(name);setName('');load();toast('Tag created','success')}catch(e:any){toast(e.message,'error')}};
 const remove=async(id:string)=>{try{await deleteTag(id);load();toast('Tag deleted','success')}catch(e:any){toast(e.message,'error')}};
 return <div><PageTitle title="Tags" subtitle="Create lightweight labels to organize your files."/>
 <div className="panel"><div className="tag-create"><input value={name} onChange={e=>setName(e.target.value)} placeholder="New tag name" onKeyDown={e=>e.key==='Enter'&&add()}/><button className="primary" onClick={add}><Plus size={16}/> Create tag</button></div><div className="tag-grid">{tags.map(t=><div className="tag-card" key={t.id}><span className="tag-dot" style={{background:t.color}}/><strong>{t.name}</strong><button className="icon-btn danger" onClick={()=>remove(t.id)}><Trash2 size={15}/></button></div>)}{!tags.length&&<div className="empty"><TagIcon size={30}/><p>No tags yet.</p></div>}</div></div></div>;
}
