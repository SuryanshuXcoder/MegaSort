import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { Layout, type Page } from '@/components/Layout';
import { Auth } from '@/pages/Auth';
import { Dashboard } from '@/pages/Dashboard';
import { Upload } from '@/pages/Upload';
import { MyFiles } from '@/pages/MyFiles';
import { Tags } from '@/pages/Tags';
import { Trash } from '@/pages/Trash';
import { Settings } from '@/pages/Settings';

function AppInner() {
 const {user,loading}=useAuth();
 const [guest,setGuest]=useState(()=>localStorage.getItem('megasort-guest')==='1');
 const [page,setPage]=useState<Page>(()=>(location.hash.replace('#/','') as Page)||'dashboard');
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{const on=()=>{const p=location.hash.replace('#/','') as Page;if(['dashboard','upload','files','tags','trash','settings'].includes(p))setPage(p)};window.addEventListener('hashchange',on);return()=>window.removeEventListener('hashchange',on)},[]);
 const navigate=(p:Page)=>{setPage(p);location.hash=`/${p}`};
 if(loading)return <div className="loading-screen">Loading MegaSort...</div>;
 if(!user&&!guest)return <Auth onGuest={()=>{localStorage.setItem('megasort-guest','1');setGuest(true)}}/>;
 const bump=()=>setRefresh(v=>v+1);
 return <Layout page={page} setPage={navigate}>{page==='dashboard'&&<Dashboard refreshKey={refresh}/>}
   {page==='upload'&&<Upload onDone={bump}/>}
   {page==='files'&&<MyFiles refreshKey={refresh} onChange={bump}/>}
   {page==='tags'&&<Tags refreshKey={refresh}/>}
   {page==='trash'&&<Trash refreshKey={refresh} onChange={bump}/>}
   {page==='settings'&&<Settings/>}
 </Layout>;
}

export default function App(){return <ThemeProvider><ToastProvider><AuthProvider><AppInner/></AuthProvider></ToastProvider></ThemeProvider>}
