import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, BarChart3, Calendar, Activity } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

// SVG Logo — baseball diamond with bar chart element
function Logo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-label="MLB Analytics"
      className="flex-shrink-0"
    >
      <rect width="32" height="32" rx="8" fill="hsl(142 72% 45%)" />
      {/* Diamond shape */}
      <path d="M16 5 L24 13 L16 21 L8 13 Z" fill="none" stroke="hsl(222 20% 8%)" strokeWidth="2" strokeLinejoin="round" />
      {/* Bar chart rising */}
      <rect x="10" y="22" width="3" height="4" rx="1" fill="hsl(222 20% 8%)" />
      <rect x="14.5" y="20" width="3" height="6" rx="1" fill="hsl(222 20% 8%)" />
      <rect x="19" y="18" width="3" height="8" rx="1" fill="hsl(222 20% 8%)" />
    </svg>
  );
}

export default function AppShell({ children }: AppShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Today's Slate", icon: Calendar },
    { href: "#", label: "Analytics", icon: BarChart3 },
    { href: "#", label: "Live", icon: Activity },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Logo />
          <span className="font-bold text-base tracking-tight text-foreground hidden sm:block" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            MLB Analytics
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={label} href={href}>
              <a className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${location === href
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main scrollable content */}
      <main className="flex-1 scrollable-area" data-testid="main-content">
        {children}
      </main>
    </div>
  );
}
