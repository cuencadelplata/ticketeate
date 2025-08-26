'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  GitBranch,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Github,
  MessageSquare,
} from 'lucide-react';
import Image from 'next/image';

interface Deploy {
  id: string;
  status: 'ready' | 'error' | 'building';
  environment: string;
  isCurrent: boolean;
  duration: string;
  timeAgo: string;
  repository: string;
  branch: string;
  commit: string;
  message: string;
  date: string;
  author: string;
  avatar: string;
  htmlUrl?: string;
  runNumber?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginationInfo {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}

export function SimpleDeploysList() {
  const [deploys, setDeploys] = useState<Deploy[]>([]);
  const [environment, setEnvironment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    perPage: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeploys = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || '',
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO || '',
        environment,
        page: currentPage.toString(),
        per_page: '10',
      });

      const response = await fetch(`/api/github/deploys?${params}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDeploys(data.deploys);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching deploys:', err);
      setError(err instanceof Error ? err.message : 'Error fetching deploys');
    } finally {
      setLoading(false);
    }
  }, [currentPage, environment]);

  useEffect(() => {
    fetchDeploys();
  }, [currentPage, environment, fetchDeploys]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDeploys();
    }, 50000);

    return () => clearInterval(interval);
  }, [fetchDeploys]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'building':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      default:
        return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
  };

  const filteredDeploys = deploys;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-foreground">Deployments</h1>
          <Image src="/icon-ucp.png" alt="UCP Logo" width={64} height={64} />
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
          Automatically created for pushes to {process.env.NEXT_PUBLIC_GITHUB_OWNER}/
          {process.env.NEXT_PUBLIC_GITHUB_REPO}
          <Github className="h-4 w-4" />
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="All Branches..."
              className="rounded-md border border-border bg-transparent py-2 pl-8 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <svg
              className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <Button variant="outline" size="sm" className="border-border bg-transparent">
            <Calendar className="mr-2 h-4 w-4" />
            Select Date Range
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDeploys}
            disabled={loading}
            className="border-border bg-transparent"
          >
            <div className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            Refresh
          </Button>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="w-40 border-border">
              <SelectValue placeholder="All Environments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant="secondary" className="bg-muted">
            {loading
              ? '...'
              : `${deploys.filter(d => d.status === 'ready').length}/${deploys.length}`}
          </Badge>
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
          )}
        </div>
      </div>

      <Card className="border-neutral-900 bg-neutral-950">
        {error && (
          <div className="border-b border-neutral-900 p-4 text-center text-red-500">
            <AlertCircle className="mx-auto mb-2 h-5 w-5" />
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDeploys}
              className="mt-2 border-border"
            >
              Reintentar
            </Button>
          </div>
        )}

        {loading && deploys.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Cargando deploys...</p>
          </div>
        ) : filteredDeploys.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No se encontraron deploys</p>
          </div>
        ) : (
          <div>
            {filteredDeploys.map((deploy: Deploy) => (
              <div
                key={deploy.id}
                className="border border-neutral-900 p-4 transition-colors hover:bg-muted/50"
              >
                <div
                  className="grid grid-cols-4 items-center"
                  style={{
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '8px 16px',
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {deploy.id}
                      </span>
                      {filteredDeploys.indexOf(deploy) === 0 && (
                        <Badge
                          variant="secondary"
                          className="border-blue-500/20 bg-blue-500/10 text-xs text-blue-400"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">Production</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(deploy.status)}
                      <span className="text-sm capitalize text-foreground">{deploy.status}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {deploy.duration} ({deploy.timeAgo})
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <span className="text-white">{deploy.branch}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-white">{deploy.message}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground">
                    <span>
                      {deploy.date} by {deploy.author}
                    </span>
                    <Image
                      src={deploy.avatar || '/placeholder.svg'}
                      alt={deploy.author}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-muted-foreground">...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="border-border"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
            disabled={currentPage === pagination.totalPages}
            className="border-border"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
