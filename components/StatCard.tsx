import type { ReactNode } from 'react';

export function StatCard({ label, value, icon, sub, tone='violet', onClick }: { label:string; value:string|number; icon:ReactNode; sub?:string; tone?:'violet'|'blue'|'amber'|'rose'; onClick?:()=>void }) {
  return <button type="button" className={`stat-card stat-${tone} ${onClick?'clickable':''}`} onClick={onClick} disabled={!onClick}>
    <div className="stat-top"><div className="stat-icon">{icon}</div><span className="stat-spark">↗</span></div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </button>;
}
