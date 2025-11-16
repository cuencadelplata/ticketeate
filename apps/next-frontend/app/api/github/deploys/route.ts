import { type NextRequest, NextResponse } from 'next/server';

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
  htmlUrl: string;
  runNumber: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner') || process.env.GITHUB_OWNER;
  const repo = searchParams.get('repo') || process.env.GITHUB_REPO;
  const environment = searchParams.get('environment') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '10');

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
  }

  try {
    // Obtener workflow runs (deploys)
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Admin-Panel-App',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const totalCount = data.total_count;

    // Obtener información del deployment más reciente para determinar cuál es el "current"
    const deploymentsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/deployments?per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Admin-Panel-App',
        },
      },
    );

    let currentDeploymentId = null;
    if (deploymentsResponse.ok) {
      const deploymentsData = await deploymentsResponse.json();
      if (deploymentsData.length > 0) {
        currentDeploymentId = deploymentsData[0].id;
      }
    }

    const deploys: Deploy[] = data.workflow_runs.map((run: any) => {
      const startTime = new Date(run.created_at);
      const endTime = run.updated_at ? new Date(run.updated_at) : new Date();
      const durationMs = endTime.getTime() - startTime.getTime();
      const duration = formatDuration(durationMs);
      const timeAgo = formatTimeAgo(startTime);

      return {
        id: run.id.toString(),
        status: mapGitHubStatus(run.status, run.conclusion),
        environment: 'Production', // Por defecto, se puede expandir después
        isCurrent: run.id.toString() === currentDeploymentId?.toString(),
        duration,
        timeAgo,
        repository: repo,
        branch: run.head_branch,
        commit: run.head_commit?.sha?.substring(0, 7) || 'N/A',
        message: run.head_commit?.message || 'No commit message',
        date: startTime.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        author: run.head_commit?.author?.name || 'Unknown',
        avatar: run.head_commit?.author?.avatar_url || '/placeholder.svg',
        htmlUrl: run.html_url,
        runNumber: run.run_number,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
      };
    });

    // Filtrar por environment si no es "all"
    const filteredDeploys =
      environment === 'all'
        ? deploys
        : deploys.filter(
            (deploy: Deploy) => deploy.environment.toLowerCase() === environment.toLowerCase(),
          );

    return NextResponse.json({
      deploys: filteredDeploys,
      pagination: {
        page,
        perPage,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      },
    });
  } catch (error) {
    console.error('Error fetching GitHub deploys:', error);
    return NextResponse.json({ error: 'Failed to fetch deploys' }, { status: 500 });
  }
}

function mapGitHubStatus(status: string, conclusion: string): 'ready' | 'error' | 'building' {
  if (status === 'completed') {
    return conclusion === 'success' ? 'ready' : 'error';
  } else if (status === 'in_progress') {
    return 'building';
  } else if (status === 'queued' || status === 'waiting') {
    return 'building';
  } else {
    return 'error';
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return '1d ago';
  } else {
    return `${diffDays}d ago`;
  }
}
