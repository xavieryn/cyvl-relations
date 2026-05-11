type Props = {
  website?: string;
  linkedin?: string;
};

export default function EntityLinks({ website, linkedin }: Props) {
  if (!website && !linkedin) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5 text-white/80 transition hover:border-white/40 hover:text-white"
        >
          <span className="text-white/50">↗</span>
          Website
        </a>
      )}
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5 text-white/80 transition hover:border-white/40 hover:text-white"
        >
          <span className="text-white/50">in</span>
          LinkedIn
        </a>
      )}
    </div>
  );
}
