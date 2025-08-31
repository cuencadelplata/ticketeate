'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useStats } from '@/hooks/use-stats';
import { StatsOverview } from './stats-overview';
import { EventsStatsTable } from './events-stats-table';
import { UsersStats } from './users-stats';
import { RevenueStats } from './revenue-stats';
import { PerformanceStats } from './performance-stats';

export function AdminStatsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    loading, 
    error, 
    overviewStats, 
    eventsStats, 
    usersStats, 
    revenueStats, 
    performanceStats, 
    refreshStats 
  } = useStats();

  const tabs = [
    {
      value: 'overview',
      label: 'Resumen General',
      icon: BarChart3,
      description: 'Vista general del sistema'
    },
    {
      value: 'events',
      label: 'Eventos',
      icon: Calendar,
      description: 'Estadísticas de eventos'
    },
    {
      value: 'users',
      label: 'Usuarios',
      icon: Users,
      description: 'Estadísticas de usuarios'
    },
    {
      value: 'revenue',
      label: 'Ingresos',
      icon: DollarSign,
      description: 'Análisis de ingresos'
    },
    {
      value: 'performance',
      label: 'Rendimiento',
      icon: TrendingUp,
      description: 'Métricas de rendimiento'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al cargar estadísticas</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard de Administración</h1>
              <p className="text-muted-foreground">
                Estadísticas, métricas y análisis del sistema Ticketeate
              </p>
            </div>
            <Button onClick={refreshStats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
          
          {/* Información rápida */}
          {overviewStats && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Eventos</p>
                      <p className="text-2xl font-bold">{overviewStats.overview.totalEvents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Usuarios</p>
                      <p className="text-2xl font-bold">{overviewStats.overview.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Reservas</p>
                      <p className="text-2xl font-bold">{overviewStats.overview.totalReservations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Ingresos Totales</p>
                      <p className="text-2xl font-bold">
                        ${overviewStats.overview.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Tabs de navegación */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="data-[state=active]:bg-card flex flex-col items-center gap-1 py-3"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Contenido de las tabs */}
          <TabsContent value="overview" className="space-y-6">
            {overviewStats && (
              <>
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Resumen General</h2>
                  <StatsOverview 
                    overview={overviewStats.overview} 
                    last30Days={overviewStats.last30Days} 
                  />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Estadísticas de Eventos</h2>
              <EventsStatsTable events={eventsStats} />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Estadísticas de Usuarios</h2>
              {usersStats && <UsersStats users={usersStats} />}
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Análisis de Ingresos</h2>
              {revenueStats && <RevenueStats revenue={revenueStats} />}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Métricas de Rendimiento</h2>
              {performanceStats && <PerformanceStats performance={performanceStats} />}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
