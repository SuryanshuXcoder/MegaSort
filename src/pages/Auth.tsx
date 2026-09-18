import { useState } from 'react';
import { Archive, Eye, EyeOff, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { hasSupabase } from '@/lib/supabase';

export function Auth({ onGuest }: { onGuest:()=>void }) {
  const { signIn, signUp } = useAuth();
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [show,setShow]=useState(false);
  const [message,setMessage]=useState('');
  const [isError,setIsError]=useState(false);
  const [busy,setBusy]=useState(false);

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setBusy(true);
    try{
      if(mode==='login'){
        await signIn(email,password);
      }else{
        await signUp(email,password);
        setMessage('Account created successfully. If email confirmation is enabled in Supabase, confirm your email once.');
      }
    }catch(err:any){
      setIsError(true);
      setMessage(err.message||'Authentication failed');
    }finally{
      setBusy(false);
    }
  };

  return <div className="auth-shell">
    <div className="auth-orb auth-orb-one"/>
    <div className="auth-orb auth-orb-two"/>
    <div className="auth-layout">
      <section className="auth-hero">
        <div className="brand auth-brand"><div className="brand-icon"><Archive size={22}/></div><span>MegaSort</span></div>
        <div className="auth-badge"><Sparkles size={14}/> Smart file management</div>
        <h1>Organize everything.<br/><span>Find anything.</span></h1>
        <p>Secure cloud file management, smart organization, duplicate detection and backups in one premium workspace.</p>
        <div className="auth-feature-grid">
          <div><ShieldCheck size={18}/><span><strong>Secure</strong><small>Supabase + RLS</small></span></div>
          <div><Archive size={18}/><span><strong>Backups</strong><small>Cloud + local export</small></span></div>
          <div><UserRound size={18}/><span><strong>Guest mode</strong><small>Explore instantly</small></span></div>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-mobile-brand brand"><div className="brand-icon"><Archive size={20}/></div><span>MegaSort</span></div>
        <div className="auth-tabs">
          <button className={mode==='login'?'active':''} onClick={()=>{setMode('login');setMessage('')}}>Sign in</button>
          <button className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');setMessage('')}}>Create account</button>
        </div>
        <h2>{mode==='login'?'Welcome back':'Create your account'}</h2>
        <p className="muted">{hasSupabase?'Your account is connected to MegaSort cloud.':'Cloud login is unavailable until Supabase environment variables are configured.'}</p>

        {hasSupabase && <form onSubmit={submit}>
          <label>Email
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" autoComplete="email"/>
          </label>
          <label>Password
            <div className="password">
              <input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" autoComplete={mode==='login'?'current-password':'new-password'}/>
              <button type="button" onClick={()=>setShow(v=>!v)} aria-label={show?'Hide password':'Show password'}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button>
            </div>
          </label>
          {message && <div className={isError?'form-error':'form-success'}>{message}</div>}
          <button className="primary full auth-submit" disabled={busy}>{busy?'Please wait...':mode==='login'?'Sign in securely':'Create account'}</button>
        </form>}

        <div className="auth-divider"><span>or</span></div>
        <button className="guest-button" onClick={onGuest}><UserRound size={18}/> Continue as Guest</button>
        <div className="auth-note"><ShieldCheck size={16}/> Guest data stays in this browser. Sign in for private cloud backup and sync.</div>
      </section>
    </div>
  </div>;
}
