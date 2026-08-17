import jsPDF from 'jspdf';
import type { ManagedFile } from '@/types';

const csvEscape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export function exportCSV(files: ManagedFile[]): void {
  const header = ['Name','Category','Extension','Size (bytes)','Confidence','Status','Uploaded'];
  const rows = files.map(f => [f.name,f.category,f.extension,f.size,`${Math.round(f.confidence*100)}%`,f.status,f.created_at]);
  const csv = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `megasort-files-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportPDF(files: ManagedFile[]): void {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text('MegaSort File Report', 14, 15);
  doc.setFontSize(8);
  let y = 25;
  const cols = ['Name','Category','Size','Status','Uploaded'];
  const widths = [100,35,35,35,55];
  const x = [14,114,149,184,219];
  doc.setFont('helvetica','bold');
  cols.forEach((c,i) => doc.text(c, x[i], y));
  doc.setFont('helvetica','normal');
  y += 7;
  files.forEach((f) => {
    if (y > 195) { doc.addPage(); y = 15; }
    const vals = [f.name.slice(0,42), f.category, formatBytes(f.size), f.status, new Date(f.created_at).toLocaleDateString()];
    vals.forEach((v,i) => doc.text(v, x[i], y));
    y += 6;
  });
  doc.save(`megasort-report-${new Date().toISOString().slice(0,10)}.pdf`);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B','KB','MB','GB','TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}
