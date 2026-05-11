/* eslint-disable @next/next/no-img-element */
type Props = {
  src?: string;
  name: string;
  kind: 'person' | 'org';
  size?: number;
};

const RING: Record<Props['kind'], string> = {
  person: 'ring-[#1b79c5]/40',
  org: 'ring-[#ff9e2c]/40',
};

const FALLBACK_BG: Record<Props['kind'], string> = {
  person: 'bg-[#1b79c5]',
  org: 'bg-[#ff9e2c]',
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Avatar({ src, name, kind, size = 56 }: Props) {
  const px = `${size}px`;
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{ width: px, height: px }}
        className={`shrink-0 rounded-full bg-white object-cover ring-2 ${RING[kind]}`}
      />
    );
  }
  return (
    <div
      style={{ width: px, height: px, fontSize: size / 2.6 }}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-black ring-2 ${FALLBACK_BG[kind]} ${RING[kind]}`}
    >
      {initials(name)}
    </div>
  );
}
