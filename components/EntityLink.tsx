import Link from 'next/link';

type Props = {
  id: string;
  name: string;
  kind: 'person' | 'org';
  subtitle?: string;
  badge?: React.ReactNode;
};

const ACCENT: Record<Props['kind'], string> = {
  person: 'hover:border-[#1b79c5]/50 hover:shadow-[0_8px_24px_-12px_rgba(27,121,197,0.6)]',
  org: 'hover:border-[#ff9e2c]/50 hover:shadow-[0_8px_24px_-12px_rgba(255,158,44,0.6)]',
};

const DOT: Record<Props['kind'], string> = {
  person: 'bg-[#1b79c5]',
  org: 'bg-[#ff9e2c]',
};

export default function EntityLink({ id, name, kind, subtitle, badge }: Props) {
  const href = kind === 'person' ? `/people/${id}` : `/orgs/${id}`;
  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] ${ACCENT[kind]}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[kind]}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium text-white">{name}</div>
            {badge}
          </div>
          {subtitle && (
            <div className="mt-0.5 truncate text-sm text-white/55">{subtitle}</div>
          )}
        </div>
        <span className="self-center text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/60">
          →
        </span>
      </div>
    </Link>
  );
}
