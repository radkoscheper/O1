import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Home, 
  MapPin, 
  Users, 
  Calendar, 
  Settings, 
  BookOpen,
  Camera,
  Mountain,
  Coffee,
  Plane
} from 'lucide-react';

export function SidebarDemo() {
  const navItems = [
    { title: 'Dashboard', icon: Home, url: '#' },
    { title: 'Bestemmingen', icon: MapPin, url: '#' },
    { title: 'Reisgidsen', icon: BookOpen, url: '#' },
    { title: 'Activiteiten', icon: Mountain, url: '#' },
    { title: 'Fotogalerij', icon: Camera, url: '#' },
  ];

  const planningItems = [
    { title: 'Mijn Reizen', icon: Calendar, url: '#' },
    { title: 'Favorieten', icon: Coffee, url: '#' },
    { title: 'Boekingen', icon: Plane, url: '#' },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <Sidebar variant="inset" className="border-r">
          <SidebarHeader className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OP</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Ontdek Polen</h2>
                <p className="text-sm text-muted-foreground">Travel Admin</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center space-x-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Reisplanning</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {planningItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center space-x-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#" className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Profiel</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#" className="flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Instellingen</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 items-center gap-2 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Sidebar Component Demo</h1>
            </div>
          </header>

          <main className="flex-1 space-y-6 p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Welkom bij de Sidebar Demo</h2>
              <p className="text-muted-foreground">
                Dit is een volledig functionele sidebar component met collapsible functies.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bestemmingen</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">40</div>
                  <p className="text-xs text-muted-foreground">+2 deze maand</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reisgidsen</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+1 deze week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activiteiten</CardTitle>
                  <Mountain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">93</div>
                  <p className="text-xs text-muted-foreground">+5 deze week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bezoekers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4K</div>
                  <p className="text-xs text-muted-foreground">+10% vs vorige maand</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sidebar Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Collapsible design</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Mobile responsive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Keyboard shortcuts (Ctrl/Cmd + B)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">State persistence</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Dark mode support</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    • Klik op de hamburger menu om de sidebar te openen/sluiten
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Gebruik Ctrl/Cmd + B als keyboard shortcut
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Op mobile wordt de sidebar als overlay getoond
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • De staat wordt bewaard in cookies voor volgende bezoeken
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}