'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Target, Zap, BarChart3, Settings, BrainCircuit } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Intention Modeler', href: '/modeler', icon: Target },
  { name: 'Reality Sync', href: '/sync', icon: Zap },
  { name: 'Cognitive Pivot', href: '/pivot', icon: BrainCircuit },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-64 border-r border-border/40 bg-card/30 backdrop-blur-xl z-50 p-6 flex flex-col gap-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-headline text-xl font-bold tracking-tight text-foreground">GapLogic</span>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary/15 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-border/40">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground w-full transition-all">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </nav>
  );
}
