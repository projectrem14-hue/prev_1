'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  PlusSquare, 
  CheckCircle2, 
  Brain, 
  BarChart3, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Modeler', href: '/modeler', icon: PlusSquare },
  { name: 'Sync', href: '/sync', icon: CheckCircle2 },
  { name: 'Pivot', href: '/pivot', icon: Brain },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: "Session Closed", description: "Returning to entry portal." });
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card z-50 p-6 flex-col">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight text-foreground">GapLogic</span>
        </div>

        <div className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 w-full transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:text-destructive" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}