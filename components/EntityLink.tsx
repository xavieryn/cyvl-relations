import Link from 'next/link';

type Props = {
  id: string;
  name: string;
  kind: 'person' | 'org';
  subtitle?: string;
};

export default function EntityLink({ id, name, kind, subtitle }: Props) {
  const href = kind === 'person' ? `/people/${id}` : `/orgs/${id}`;
  return (
    <Link
      href={href}
      className="block rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/30 hover:bg-white/[0.07]"
    >
      <div className="font-medium text-white">{name}</div>
      {subtitle && <div className="text-sm text-white/60">{subtitle}</div>}
    </Link>
  );
}
