'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Boxes, Package, ShoppingCart, Users, History, FolderOpen,
  LogOut, PlusCircle, ClipboardList
} from 'lucide-react';

type Item = { label: string; href: string; icon: React.ComponentType<{className?: string}> };

const items: Item[] = [
  { label: 'Dashboard',         href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Items',             href: '/items',                icon: Package },
  { label: 'Profile',           href: '/profile/password',     icon: ClipboardList },
  { label: 'Orders',            href: '/orders',               icon: ShoppingCart },
  { label: 'Create Order',      href: '/orders/create',        icon: PlusCircle },
  { label: 'Inventories',       href: '/inventories',          icon: Boxes },
  { label: 'Users',             href: '/users',                icon: Users },
  { label: 'Admin Orders',      href: '/admin/orders',         icon: FolderOpen },
  { label: 'Admin Order History', href: '/admin/orders/history', icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  // Ne rien afficher sur les pages publiques
  const isPublic =
    pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup');
  if (isPublic) return null;

  return (
    <aside
      className="
        fixed top-0 left-0 z-50 h-screen w-64
        flex flex-col justify-between
        text-white shadow-2xl
        bg-gradient-to-b from-[#0f4d92] to-[#0b2f57]
        border-r border-white/10
      "
    >
      {/* Header */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="text-2xl font-extrabold tracking-tight">
          <span className="text-white">Inventory</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            App
          </span>
        </div>
        <p className="mt-1 text-xs text-white/70">Gestion des stocks & commandes</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`
                group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm
                transition
                ${active
                  ? 'bg-white text-[#0b2f57] shadow'
                  : 'text-white/90 hover:bg-white/10 hover:shadow'}
              `}
            >
              {/* Accent bar gauche quand actif */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-white" />
              )}
              <Icon className={`h-4 w-4 ${active ? 'text-[#0b2f57]' : 'text-white/90'}`} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="
            w-full inline-flex items-center justify-center gap-2
            rounded-full bg-red-600 hover:bg-red-700
            text-white text-sm font-medium py-2 transition
            shadow-md
          "
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
