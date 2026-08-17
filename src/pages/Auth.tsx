import { useState } from 'react';
import { Archive, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { hasSupabase } from '@/lib/supabase';

export function Auth({ onGuest }: { onGuest:()=>void }) {
  const { signIn, signUp } = useAuth();
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [show,setShow]=useState(false);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');setBusy(true);try{mode==='login'?await signIn(email,password):await signUp(email,password); if(mode==='signup') setError('Account created. Check your email if confirmation is enabled.');}catch(err:any){setError(err.message||'Authentication failed');}finally{setBusy(false)}};
  return <div className="auth-shell"><div className="auth-card">
    <div className="brand auth-brand"><div className="brand-icon"><Archive size={22}/></div><span>MegaSort</span></div>
    <h1>{mode==='login'?'Welcome back':'Create your MegaSort account'}</h1>
    <p className="muted">{hasSupabase?'Sign in to keep your files synced across devices.':'Supabase is not configured. You can still explore MegaSort in Guest mode.'}</p>
    {hasSupabase && <form onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/></label>
      <label>Password<div className="password"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters"/><button type="button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
      {error && <div className="form-error">{error}</div>}
      <button className="primary full" disabled={busy}>{busy?'Please wait...':mode==='login'?'Sign in':'Create account'}</button>
    </form>}
    {!hasSupabase && <button className="primary full" onClick={onGuest}>Continue as Guest</button>}
    {hasSupabase && <button className="link-button" onClick={()=>{setMode(mode==='login'?'signup':'login');setError('')}}>{mode==='login'?'Need an account? Sign up':'Already have an account? Sign in'}</button>}
    <div className="auth-note"><ShieldCheck size={16}/> Your private cloud files are protected by Supabase Row Level Security.</div>
  </div></div>;
}
