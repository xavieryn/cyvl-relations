'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import type { NotificationCounts } from '@/lib/notifications';

type Props = {
  children: React.ReactNode;
  notifications: NotificationCounts;
};

export default function ConditionalShell({ children, notifications }: Props) {
  const pathname = usePathname() ?? '/';
  const isHome = pathname === '/';

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar notifications={notifications} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
