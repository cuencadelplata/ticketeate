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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  GitBranch,
  User,
  RefreshCw,
  Settings,
} from 'lucide-react';

interface GitHubWorkflow {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  head_branch: string;
  head_commit: {
    message: string;
    author: string;
  };
  html_url: string;
  run_number: number;
}

interface GitHubActionsData {
  workflows: GitHubWorkflow[];
  error?: string;
}

export function GitHubActionsPanel() {
  const [workflows, setWorkflows] = useState<GitHubWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState('vercel');
  const [repo, setRepo] = useState('next.js');

  const fetchWorkflows = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/workflows?owner=${owner}&repo=${repo}`
      );
      const data: GitHubActionsData = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workflows');
      }

      setWorkflows(data.workflows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'in_progress' || status === 'queued') {
      return <Clock className="h-4 w-4 text-accent animate-spin" />;
    }

    if (conclusion === 'success') {
      return <CheckCircle className="h-4 w-4 text-primary" />;
    }

    if (conclusion === 'failure' || conclusion === 'cancelled') {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }

    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string, conclusion: string | null) => {
    if (status === 'in_progress') {
      return (
        <Badge variant="secondary" className="bg-accent text-accent-foreground">
          En progreso
        </Badge>
      );
    }

    if (status === 'queued') {
      return <Badge variant="secondary">En cola</Badge>;
    }

    if (conclusion === 'success') {
      return (
        <Badge variant="default" className="bg-primary text-primary-foreground">
          Exitoso
        </Badge>
      );
    }

    if (conclusion === 'failure') {
      return <Badge variant="destructive">Fallido</Badge>;
    }

    if (conclusion === 'cancelled') {
      return <Badge variant="outline">Cancelado</Badge>;
    }

    return <Badge variant="secondary">Desconocido</Badge>;
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Repositorio
          </CardTitle>
          <CardDescription>
            Configura el repositorio de GitHub para monitorear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Owner/Organización</Label>
              <Input
                id="owner"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                placeholder="vercel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repo">Repositorio</Label>
              <Input
                id="repo"
                value={repo}
                onChange={e => setRepo(e.target.value)}
                placeholder="next.js"
              />
            </div>
          </div>
          <Button onClick={fetchWorkflows} disabled={loading} className="mt-4">
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar Workflows
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GitHub Actions Workflows</CardTitle>
          <CardDescription>
            Últimos workflows ejecutados en {owner}/{repo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-2">Error al cargar workflows</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={fetchWorkflows}>
                Reintentar
              </Button>
            </div>
          )}

          {loading && !error && (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Cargando workflows...</p>
            </div>
          )}

          {!loading && !error && workflows.length === 0 && (
            <div className="text-center py-8">
              <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No se encontraron workflows
              </p>
            </div>
          )}

          {!loading && !error && workflows.length > 0 && (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {workflows.map(workflow => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(workflow.status, workflow.conclusion)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">
                            {workflow.name}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            #{workflow.run_number}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {workflow.head_commit.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {workflow.head_branch}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {workflow.head_commit.author}
                          </div>
                          <span>{formatDate(workflow.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(workflow.status, workflow.conclusion)}
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={workflow.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
