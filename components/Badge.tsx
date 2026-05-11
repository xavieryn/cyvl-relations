type Props = {
  kind: 'person' | 'org';
  label: string;
};

const STYLES: Record<Props['kind'], string> = {
  person: 'bg-[#1b79c5]/15 text-[#7ec3f1] border-[#1b79c5]/40',
  org: 'bg-[#ff9e2c]/15 text-[#ffb56a] border-[#ff9e2c]/40',
};

export default function Badge({ kind, label }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${STYLES[kind]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          kind === 'person' ? 'bg-[#1b79c5]' : 'bg-[#ff9e2c]'
        }`}
      />
      {label}
    </span>
  );
}
