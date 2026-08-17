import { createContext, useContext, useState, type ReactNode } from 'react';

interface ToastContextValue { toast: (message: string, type?: 'success'|'error'|'info') => void; }
const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{id:number; message:string; type:string}[]>([]);
  const toast = (message: string, type = 'info' as 'success'|'error'|'info') => {
    const id = Date.now() + Math.random();
    setItems(v => [...v, { id, message, type }]);
    window.setTimeout(() => setItems(v => v.filter(x => x.id !== id)), 3500);
  };
  return <ToastContext.Provider value={{ toast }}>
    {children}
    <div className="toast-stack">{items.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>)}</div>
  </ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
