import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function PageHeader({
  title,
  crumbs = [],
  actions,
  description,
}: {
  title: string;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      {crumbs.length > 0 && (
        <nav className="flex items-center text-xs text-slate-500 mb-2">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <ChevronRight className="w-3 h-3 mx-1 text-slate-300" />}
              {c.href ? (
                <Link href={c.href} className="hover:text-brand">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
