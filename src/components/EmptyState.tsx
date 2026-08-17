import type { ReactNode } from 'react';

export function EmptyState({ icon, title, message }: { icon:ReactNode; title:string; message:string }) {
  return <div className="empty">{icon}<h3>{title}</h3><p>{message}</p></div>;
}
