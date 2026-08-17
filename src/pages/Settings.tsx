import { useAuth } from '@/context/AuthContext';
import { hasSupabase } from '@/lib/supabase';
import { PageTitle } from './Dashboard';

export function Settings() {
 const {user,guest,signOut}=useAuth();
 return <div><PageTitle title="Settings" subtitle="Account and MegaSort configuration."/>
 <div className="settings-grid"><section className="panel"><h2>Account</h2><div className="setting-row"><span>Status</span><strong>{guest?'Guest / local session':'Authenticated'}</strong></div><div className="setting-row"><span>Email</span><strong>{user?.email||'Not signed in'}</strong></div>{!guest&&<button className="danger-button" onClick={signOut}>Sign out</button>}</section>
 <section className="panel"><h2>Storage</h2><div className="setting-row"><span>Backend</span><strong>{hasSupabase?'Supabase Cloud':'Browser local mode'}</strong></div><div className="setting-row"><span>Bucket</span><strong>files</strong></div><p className="muted">For production cloud storage, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.</p></section></div></div>;
}
