import type { ManagedFile, Tag } from '@/types';

export const demoFiles: ManagedFile[] = [
  {
    id: 'demo-1',
    name: 'Project_Report.pdf',
    storage_path: '',
    mime_type: 'application/pdf',
    size: 3_900_000,
    category: 'Documents',
    extension: 'pdf',
    confidence: 0.99,
    status: 'organized',
    tags: ['College'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    name: 'Vacation.jpg',
    storage_path: '',
    mime_type: 'image/jpeg',
    size: 81200,
    category: 'Images',
    extension: 'jpg',
    confidence: 0.99,
    status: 'organized',
    tags: ['Personal'],
    created_at: new Date().toISOString(),
  },
];

export const demoTags: Tag[] = [
  { id: 'demo-tag-1', name: 'College', color: '#6366f1', created_at: new Date().toISOString() },
  { id: 'demo-tag-2', name: 'Personal', color: '#10b981', created_at: new Date().toISOString() },
];
