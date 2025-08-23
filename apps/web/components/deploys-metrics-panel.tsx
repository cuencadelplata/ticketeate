'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'building':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
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
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">
                Cargando métricas...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-2">Error al cargar métricas</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchMetrics}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const safeData = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Métricas de Deployments
          </h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real del rendimiento y estado de deployments
          </p>
        </div>
        <Button onClick={fetchMetrics} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deployments
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeData.summary.totalDeployments}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de deployments realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeData.summary.successRate}
            </div>
            <p className="text-xs text-muted-foreground">
              Porcentaje de deployments exitosos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo de Respuesta
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeData.summary.avgResponseTime}
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo promedio de respuesta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeData.summary.avgUptime}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponibilidad promedio del servicio
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deployments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Deployments</CardTitle>
              <CardDescription>Tasa de éxito y fallos por día</CardDescription>
            </CardHeader>
            <CardContent>
              {safeData.deploymentMetrics.length > 0 ? (
                <div className="h-[300px]">
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
                      <Tooltip />
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
                </div>
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
                  <div className="h-[200px]">
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
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="responseTime"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--accent))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No hay datos de rendimiento disponibles
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uptime del Servicio</CardTitle>
                <CardDescription>
                  Disponibilidad del servicio (%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {safeData.performanceMetrics.length > 0 ? (
                  <div className="h-[200px]">
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
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="uptime"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
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
                                  {deployment.duration}s
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              deployment.status === 'success'
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {deployment.status}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={`https://github.com/vercel/next.js/commit/${deployment.commit}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay deployments recientes
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
