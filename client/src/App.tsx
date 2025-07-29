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
import CloudinaryTest from "@/pages/cloudinary-test";
import CloudinaryDemo from "@/pages/cloudinary-demo";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/ontdek-meer" component={OntdekMeer} />
      <Route path="/cloudinary-test" component={CloudinaryTest} />
      <Route path="/cloudinary-demo" component={CloudinaryDemo} />
      <Route path="/:slug" component={Page} />
      <Route path="/destination/:slug" component={Page} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Signal that React app is mounted, hide HTML loader
    document.body.classList.add('react-loaded');
  }, []);

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
