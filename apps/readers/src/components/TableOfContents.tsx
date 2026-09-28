import React from 'react';
import { ListOrdered } from 'lucide-react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
  activeId?: string;
}

export function TableOfContents({ items, activeId }: TableOfContentsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-900">
        <ListOrdered className="h-4 w-4 text-indigo-900" />
        <span>In This Essay</span>
      </div>

      <ul className="mt-3 space-y-2 text-xs">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              className={`block py-1 leading-snug transition-colors ${
                activeId === item.id
                  ? 'font-bold text-indigo-950 underline underline-offset-4'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
