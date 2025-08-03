import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useState, useEffect } from "react";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import OntdekMeer from "@/pages/ontdek-meer";
import Page from "@/pages/page";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTitle, setLoadingTitle] = useState("Ontdek Polen");
  const [loadingSubtitle, setLoadingSubtitle] = useState("Laden van jouw Poolse avontuur...");

  // Handle route-based loading
  useEffect(() => {
    setIsLoading(true);
    
    // Set different loading messages based on route
    if (location === '/') {
      setLoadingTitle("Ontdek Polen");
      setLoadingSubtitle("Welkom bij jouw Poolse avontuur...");
    } else if (location === '/admin') {
      setLoadingTitle("Admin Dashboard");
      setLoadingSubtitle("Laden van beheer paneel...");
    } else if (location === '/ontdek-meer') {
      setLoadingTitle("Ontdek Meer");
      setLoadingSubtitle("Meer bestemmingen worden geladen...");
    } else {
      setLoadingTitle("Ontdek Polen");
      setLoadingSubtitle("Laden van pagina...");
    }

    // Simulate loading time (can be replaced with actual data loading)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <LoadingScreen
        isLoading={isLoading}
        title={loadingTitle}
        subtitle={loadingSubtitle}
      />
      
      {!isLoading && (
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/admin" component={Admin} />
          <Route path="/ontdek-meer" component={OntdekMeer} />
          <Route path="/:slug" component={Page} />
          <Route path="/destination/:slug" component={Page} />
          <Route component={NotFound} />
        </Switch>
      )}
    </>
  );
}

function App() {
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
