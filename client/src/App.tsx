import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import SlatePage from "@/pages/SlatePage";
import GameDetailPage from "@/pages/GameDetailPage";
import BullpenPage from "@/pages/BullpenPage";
import NotFound from "@/pages/not-found";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router hook={useHashLocation}>
          <AppShell>
            <Switch>
              <Route path="/" component={SlatePage} />
              <Route path="/game/:gamePk" component={GameDetailPage} />
              <Route path="/bullpen/:teamId" component={BullpenPage} />
              <Route component={NotFound} />
            </Switch>
          </AppShell>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
