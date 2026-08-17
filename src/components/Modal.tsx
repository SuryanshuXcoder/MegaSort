import type { ReactNode } from 'react';

export function Modal({ open, title, children, onClose }: { open:boolean; title:string; children:ReactNode; onClose:()=>void }) {
  if(!open)return null;
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="command-modal" onMouseDown={e=>e.stopPropagation()}><div style={{padding:'8px 8px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><strong>{title}</strong><button className="icon-btn" onClick={onClose}>×</button></div>{children}</div></div>;
}
