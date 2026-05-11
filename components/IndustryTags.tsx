type Props = { tags?: string[]; max?: number };

export default function IndustryTags({ tags, max = 3 }: Props) {
  if (!tags || tags.length === 0) {
    return <span className="text-white/30">—</span>;
  }
  const shown = tags.slice(0, max);
  const more = tags.length - shown.length;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((t) => (
        <span
          key={t}
          className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/75"
        >
          {t}
        </span>
      ))}
      {more > 0 && (
        <span className="text-[11px] text-white/40">+{more}</span>
      )}
    </div>
  );
}
