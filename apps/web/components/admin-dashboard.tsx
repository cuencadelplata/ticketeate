'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GitHubActionsPanel } from '@/components/github-actions-panel';
import { RealTimeLogs } from '@/components/real-time-logs';
import { DeploysMetricsPanel } from '@/components/deploys-metrics-panel';
import {
  Activity,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Server,
  Monitor,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const deployments = [
    {
      id: 1,
      branch: 'main',
      status: 'success',
      time: '2 min ago',
      commit: 'feat: add new feature',
    },
    {
      id: 2,
      branch: 'develop',
      status: 'building',
      time: '5 min ago',
      commit: 'fix: resolve bug',
    },
    {
      id: 3,
      branch: 'main',
      status: 'failed',
      time: '1 hour ago',
      commit: 'update: dependencies',
    },
  ];

  const recentLogs = [
    {
      id: 1,
      level: 'info',
      message: 'Application started successfully',
      time: '10:30:45',
    },
    {
      id: 2,
      level: 'warning',
      message: 'High memory usage detected',
      time: '10:29:12',
    },
    {
      id: 3,
      level: 'error',
      message: 'Database connection timeout',
      time: '10:28:33',
    },
    {
      id: 4,
      level: 'info',
      message: 'User authentication successful',
      time: '10:27:21',
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'building':
        return <Clock className="h-4 w-4 text-accent animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      case 'warning':
        return 'bg-accent text-accent-foreground';
      case 'info':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Monitor className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="flex flex-col space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Deploys Exitosos
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +12% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tiempo Promedio
                </CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4m</div>
                <p className="text-xs text-muted-foreground">-8% más rápido</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Errores Activos
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-xs text-muted-foreground">Últimos 30 días</p>
              </CardContent>
            </Card>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="deployments">Deploys</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="github">GitHub Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5" />
                      Deploys Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {deployments.slice(0, 3).map(deploy => (
                        <div
                          key={deploy.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(deploy.status)}
                            <div>
                              <p className="text-sm font-medium">
                                {deploy.branch}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {deploy.commit}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {deploy.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      Logs Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {recentLogs.map(log => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 text-sm"
                          >
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getLogLevelColor(log.level)}`}
                            >
                              {log.level}
                            </Badge>
                            <div className="flex-1">
                              <p>{log.message}</p>
                              <span className="text-xs text-muted-foreground">
                                {log.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="deployments" className="space-y-4">
              <DeploysMetricsPanel />
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <RealTimeLogs />
            </TabsContent>

            <TabsContent value="github" className="space-y-4">
              <GitHubActionsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}