'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, UtensilsCrossed, ChefHat,
  TableProperties, LogOut, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api';
import { toast } from 'sonner';

const navItems = [
  { href: '/pos', label: 'POS', icon: TableProperties, roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { href: '/kds', label: 'Kitchen Display', icon: ChefHat, roles: ['OWNER', 'MANAGER', 'KITCHEN'] },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER'] },
  { href: '/menus', label: 'จัดการเมนู', icon: UtensilsCrossed, roles: ['OWNER', 'MANAGER'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ตรวจสอบว่ามี accessToken หรือไม่
    const hasToken = !!accessToken || !!localStorage.getItem('accessToken');
    
    if (!hasToken) {
      // ไม่มี token → redirect ไป login
      router.push('/login');
    } else if (!user && hasToken) {
      // มี token แต่ไม่มี user → fetch user info
      api.get('/auth/me')
        .then(() => setIsLoading(false))
        .catch(() => {
          clearAuth();
          router.push('/login');
        });
    } else {
      setIsLoading(false);
    }
  }, [user, accessToken, router, clearAuth]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      router.push('/login');
      toast.success('ออกจากระบบแล้ว');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍲</span>
            <div>
              <p className="font-bold text-red-600">Shabu</p>
              <p className="text-xs text-gray-400">Restaurant</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {filteredNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                {user.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-gray-400">{user.role.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-500 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}