import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import OntdekMeer from "@/pages/ontdek-meer";
import Page from "@/pages/page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/ontdek-meer" component={OntdekMeer} />
      <Route path="/:slug" component={Page} />
      <Route path="/destination/:slug" component={Page} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Handle initial page load and browser refresh
  useEffect(() => {
    // Show loading screen during initial app bootstrap and page refresh
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 400); // Slightly longer to ensure it's visible during refresh

    return () => clearTimeout(timer);
  }, []);

  // Show our custom loading screen during initial page load/refresh
  if (isInitialLoading) {
    return (
      <LoadingScreen 
        isLoading={true}
        title="Ontdek Polen"
        subtitle="Jouw Poolse avontuur begint hier"
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
