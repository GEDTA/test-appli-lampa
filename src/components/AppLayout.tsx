import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, BarChart3, Settings, Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: BarChart3 },
    { name: 'Carte', href: '/carte', icon: LayoutDashboard },
    { name: 'Inventaire', href: '/inventory', icon: List },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background app-shell">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="transition-transform hover:scale-110"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">WL</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Ville de Wolfisheim</p>
              <h1 className="text-lg font-semibold">Gestion des lampadaires</h1>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="transition-transform hover:scale-110"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="sm">
              <span className="text-sm">Support</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300 overflow-hidden",
            sidebarOpen ? "w-64" : "w-0"
          )}
        >
          <div className={cn("w-64 h-full flex flex-col", !sidebarOpen && "invisible")}>
            <nav className="space-y-1 p-4 flex-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:translate-x-1",
                      active
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {active && (
                      <div className="ml-auto w-1.5 h-6 rounded-full bg-primary-foreground"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
                    <span className="text-white font-bold">U</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Utilisateur mairie</p>
                    <p className="text-xs text-muted-foreground truncate">service.technique@wolfisheim.fr</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 pt-6 px-8 pb-16",
            sidebarOpen ? "ml-64" : "ml-0"
          )}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
