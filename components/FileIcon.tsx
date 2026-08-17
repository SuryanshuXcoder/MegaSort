import { categoryIcon } from '@/lib/classify';
import type { Category } from '@/types';

export function FileIcon({ category }: { category: Category }) {
  return <span className="file-icon" aria-hidden>{categoryIcon(category)}</span>;
}
