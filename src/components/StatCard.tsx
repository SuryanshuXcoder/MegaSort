import type { ReactNode } from 'react';
export function StatCard({ label, value, icon, sub }: { label:string; value:string|number; icon:ReactNode; sub?:string }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><div className="stat-value">{value}</div><div className="stat-label">{label}</div>{sub && <div className="stat-sub">{sub}</div>}</div></div>;
}
