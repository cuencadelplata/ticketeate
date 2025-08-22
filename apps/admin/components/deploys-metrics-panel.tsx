'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  RefreshCw,
  ExternalLink,
  GitBranch,
  User,
  Calendar,
  Zap,
} from 'lucide-react';

interface DeploymentMetric {
  date: string;
  successful: number;
  failed: number;
  total: number;
}

interface PerformanceMetric {
  date: string;
  responseTime: number;
  uptime: number;
  requests: number;
  errors: number;
}

interface Deployment {
  id: string;
  status: string;
  branch: string;
  commit: string;
  message: string;
  author: string;
  timestamp: string;
  duration: number;
  environment: string;
}

interface MetricsData {
  deploymentMetrics: DeploymentMetric[];
  performanceMetrics: PerformanceMetric[];
  recentDeployments: Deployment[];
  summary: {
    totalDeployments: number;
    successRate: string;
    avgResponseTime: string;
    avgUptime: string;
  };
  error?: string;
}

export function DeploysMetricsPanel() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/metrics');
      const metricsData: MetricsData = await response.json();

      if (!response.ok) {
        throw new Error(metricsData.error || 'Failed to fetch metrics');
      }

      setData(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'building':
        return <Clock className="h-4 w-4 text-accent animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge
            variant="default"
            className="bg-primary text-primary-foreground"
          >
            Exitoso
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      case 'building':
        return (
          <Badge
            variant="secondary"
            className="bg-accent text-accent-foreground"
          >
            Construyendo
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} min`;
    }

    if (diffInMinutes < 1440) {
      return `hace ${Math.floor(diffInMinutes / 60)} h`;
    }

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const safeData = {
    deploymentMetrics: data?.deploymentMetrics || [],
    performanceMetrics: data?.performanceMetrics || [],
    recentDeployments: data?.recentDeployments || [],
    summary: {
      totalDeployments: data?.summary?.totalDeployments || 0,
      successRate: data?.summary?.successRate || '0',
      avgResponseTime: data?.summary?.avgResponseTime || '0',
      avgUptime: data?.summary?.avgUptime || '0',
    },
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
        <p className="text-muted-foreground">Cargando métricas...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-2">Error al cargar métricas</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchMetrics}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deploys</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeData.summary.totalDeployments}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeData.summary.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">Promedio mensual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Respuesta
            </CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeData.summary.avgResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">Promedio mensual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeData.summary.avgUptime}%
            </div>
            <p className="text-xs text-muted-foreground">Disponibilidad</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Deployments */}
      <Tabs defaultValue="deployments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deployments">Deploys</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Deployment</CardTitle>
              <CardDescription>
                Deploys exitosos vs fallidos en los últimos 30 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeData.deploymentMetrics.length > 0 ? (
                <ChartContainer
                  config={{
                    successful: {
                      label: 'Exitosos',
                      color: 'hsl(var(--primary))',
                    },
                    failed: {
                      label: 'Fallidos',
                      color: 'hsl(var(--destructive))',
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safeData.deploymentMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                          })
                        }
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="successful"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="failed"
                        stackId="1"
                        stroke="hsl(var(--destructive))"
                        fill="hsl(var(--destructive))"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No hay datos de deployment disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tiempo de Respuesta</CardTitle>
                <CardDescription>
                  Latencia promedio en milisegundos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {safeData.performanceMetrics.length > 0 ? (
                  <ChartContainer
                    config={{
                      responseTime: {
                        label: 'Tiempo de Respuesta (ms)',
                        color: 'hsl(var(--accent))',
                      },
                    }}
                    className="h-[200px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={safeData.performanceMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={value =>
                            new Date(value).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                            })
                          }
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="responseTime"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--accent))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No hay datos de rendimiento disponibles
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uptime</CardTitle>
                <CardDescription>
                  Disponibilidad del servicio (%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {safeData.performanceMetrics.length > 0 ? (
                  <ChartContainer
                    config={{
                      uptime: {
                        label: 'Uptime (%)',
                        color: 'hsl(var(--primary))',
                      },
                    }}
                    className="h-[200px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={safeData.performanceMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={value =>
                            new Date(value).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                            })
                          }
                        />
                        <YAxis domain={[99, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="uptime"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No hay datos de uptime disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Historial de Deployments</span>
                <Button variant="outline" size="sm" onClick={fetchMetrics}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </CardTitle>
              <CardDescription>
                Deployments recientes con detalles completos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {safeData.recentDeployments.length > 0 ? (
                    safeData.recentDeployments.map(deployment => (
                      <div
                        key={deployment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {getStatusIcon(deployment.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">
                                {deployment.message}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {deployment.environment}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                {deployment.branch}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {deployment.author}
                              </div>
                              <span>#{deployment.commit}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(deployment.timestamp)}
                              </div>
                              {deployment.status !== 'building' && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(deployment.duration)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(deployment.status)}
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay deployments recientes disponibles
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
