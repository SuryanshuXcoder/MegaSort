import { useEffect, useState, type ReactNode } from 'react';
import { Archive, ChevronLeft, ChevronRight, Command, FileImage, FolderOpen, Hash, LayoutDashboard, Moon, Settings, Sun, Tag, Trash2, Upload, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export type Page = 'dashboard'|'upload'|'files'|'tags'|'trash'|'settings';

export function Layout({ page, setPage, children }: { page: Page; setPage: (p: Page)=>void; children: ReactNode }) {
  const { user, guest, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [command, setCommand] = useState(false);
  const nav = [
    ['dashboard','Dashboard',LayoutDashboard],
    ['upload','Upload',Upload],
    ['files','My Files',FolderOpen],
    ['tags','Tags',Tag],
    ['trash','Trash',Trash2],
    ['settings','Settings',Settings],
  ] as const;

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCommand(true); }
      if (e.key === 'Escape') setCommand(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  return <div className="app-shell">
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand"><div className="brand-icon"><Archive size={20}/></div>{!collapsed && <span>MegaSort</span>}</div>
      <nav>{nav.map(([id,label,Icon]) => <button key={id} className={page===id ? 'nav-item active' : 'nav-item'} onClick={()=>setPage(id)}><Icon size={18}/>{!collapsed && <span>{label}</span>}</button>)}</nav>
      <button className="collapse" onClick={()=>setCollapsed(v=>!v)}>{collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}</button>
      <div className="profile">
        <div className="avatar">{user?.email?.slice(0,1).toUpperCase() || 'G'}</div>
        {!collapsed && <div className="profile-text"><strong>{guest ? 'Guest' : user?.email}</strong><small>{guest ? 'Data stays in this session' : 'Cloud account'}</small></div>}
        {!guest && <button className="icon-btn" title="Sign out" onClick={signOut}><LogOut size={16}/></button>}
      </div>
    </aside>
    <main className="main">
      <header className="topbar">
        <button className="search-trigger" onClick={()=>setCommand(true)}><Search size={16}/><span>Search or jump to...</span><kbd><Command size={12}/>K</kbd></button>
        <button className="icon-btn" onClick={toggle} title="Toggle theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
      </header>
      <div className="content">{children}</div>
    </main>
    {command && <CommandPalette setPage={setPage} close={()=>setCommand(false)}/>}
  </div>;
}

function CommandPalette({ setPage, close }: { setPage:(p:Page)=>void; close:()=>void }) {
  const items: [Page,string][] = [['dashboard','Dashboard'],['upload','Upload files'],['files','My Files'],['tags','Tags'],['trash','Trash'],['settings','Settings']];
  return <div className="modal-backdrop" onMouseDown={close}><div className="command-modal" onMouseDown={e=>e.stopPropagation()}>
    <input autoFocus placeholder="Type a command..." onKeyDown={e=>{ if(e.key==='Escape') close(); }}/>
    {items.map(([p,l])=><button key={p} onClick={()=>{setPage(p);close();}}><Hash size={15}/>{l}</button>)}
  </div></div>;
}
