'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Pencil, RefreshCw, BrainCircuit, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Modeler', href: '/modeler', icon: Pencil },
  { name: 'Sync', href: '/sync', icon: RefreshCw },
  { name: 'Pivot', href: '/pivot', icon: BrainCircuit },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: "Session Closed", description: "Your cognitive data is synced." });
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 border-r border-white/5 bg-background/80 backdrop-blur-2xl z-50 p-8 flex-col gap-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tighter text-foreground glow-text">GapLogic</span>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 ml-4">Behavioral Engine</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group relative overflow-hidden",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                )}
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:scale-110"
                )} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-2 pt-8 border-t border-white/5">
          <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 w-full transition-all">
            <Settings className="w-5 h-5" />
            Config
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-destructive hover:bg-destructive/10 w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            Terminate Session
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-3xl border-t border-white/5 z-50 flex items-center justify-around px-4 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all relative",
                isActive ? "text-primary scale-110" : "text-muted-foreground opacity-60"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.name}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-6 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}