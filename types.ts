export type Category =
  | 'Images'
  | 'Documents'
  | 'Videos'
  | 'Audio'
  | 'Archives'
  | 'Code'
  | 'Other';

export type FileStatus = 'organized' | 'review' | 'duplicate' | 'trash';

export interface ManagedFile {
  id: string;
  user_id?: string | null;
  name: string;
  storage_path: string;
  mime_type: string;
  size: number;
  category: Category;
  extension: string;
  hash?: string | null;
  confidence: number;
  status: FileStatus;
  tags?: string[];
  created_at: string;
  deleted_at?: string | null;
}

export interface Tag {
  id: string;
  user_id?: string | null;
  name: string;
  color: string;
  created_at: string;
}

export interface Activity {
  id: string;
  action: string;
  file_name?: string | null;
  created_at: string;
}
