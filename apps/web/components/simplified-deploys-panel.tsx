'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from 'recharts';
import {
  CheckCircle,
  XCircle,
  Clock,
  GitBranch,
  Calendar,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface DeployData {
  id: string;
  branch: string;
  commit: string;
  status: 'success' | 'failed' | 'building';
  duration: string;
  timestamp: string;
  url?: string;
}

interface ChartData {
  time: string;
  deploys: number;
  success: number;
  failed: number;
}

export function SimplifiedDeploysPanel() {
  const [deployData, setDeployData] = useState<DeployData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateMockData = () => {
    const mockDeploys: DeployData[] = [
      {
        id: '1',
        branch: 'main',
        commit: 'feat: add user authentication',
        status: 'success',
        duration: '1.2m',
        timestamp: '2024-01-15 14:30:00',
        url: 'https://app-main.vercel.app',
      },
      {
        id: '2',
        branch: 'develop',
        commit: 'fix: resolve memory leak',
        status: 'building',
        duration: '0.8m',
        timestamp: '2024-01-15 14:25:00',
      },
      {
        id: '3',
        branch: 'feature/api',
        commit: 'update: API endpoints',
        status: 'failed',
        duration: '2.1m',
        timestamp: '2024-01-15 14:20:00',
      },
      {
        id: '4',
        branch: 'main',
        commit: 'style: update UI components',
        status: 'success',
        duration: '1.5m',
        timestamp: '2024-01-15 14:15:00',
        url: 'https://app-main.vercel.app',
      },
      {
        id: '5',
        branch: 'hotfix/critical',
        commit: 'fix: critical security patch',
        status: 'success',
        duration: '0.9m',
        timestamp: '2024-01-15 14:10:00',
        url: 'https://app-hotfix.vercel.app',
      },
    ];

    const mockChart: ChartData[] = [
      { time: '13:00', deploys: 3, success: 2, failed: 1 },
      { time: '13:15', deploys: 5, success: 4, failed: 1 },
      { time: '13:30', deploys: 2, success: 2, failed: 0 },
      { time: '13:45', deploys: 7, success: 5, failed: 2 },
      { time: '14:00', deploys: 4, success: 3, failed: 1 },
      { time: '14:15', deploys: 6, success: 6, failed: 0 },
      { time: '14:30', deploys: 3, success: 2, failed: 1 },
    ];

    setDeployData(mockDeploys);
    setChartData(mockChart);
  };

  useEffect(() => {
    generateMockData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'building':
        return <Clock className="h-4 w-4 text-accent animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            Failed
          </Badge>
        );
      case 'building':
        return (
          <Badge className="bg-accent/20 text-accent border-accent/30">
            Building
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };



  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              Deploy Frequency
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    generateMockData();
                    setIsLoading(false);
                  }, 1000);
                }}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12,
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="deploys"
                    fill="hsl(var(--primary))"
                    radius={2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12,
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    dataKey="success"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    dataKey="failed"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={{
                      fill: 'hsl(var(--destructive))',
                      strokeWidth: 2,
                      r: 4,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Recent Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {deployData.map(deploy => (
                <div
                  key={deploy.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(deploy.status)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {deploy.branch}
                        </span>
                        {getStatusBadge(deploy.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {deploy.commit}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {deploy.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {deploy.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                  {deploy.url && deploy.status === 'success' && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={deploy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}