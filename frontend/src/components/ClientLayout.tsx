'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage =
    pathname === '/' || pathname === '/login' || pathname === '/signup';

  if (isPublicPage) {
    return <>{children}</>; // Pas de sidebar ni de marge
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
