import { NextResponse } from 'next/server';

function generateMetricsData() {
  const now = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  const deploymentMetrics = last30Days.map((date, index) => ({
    date: date.toISOString().split('T')[0],
    successful: Math.floor(Math.random() * 10) + 5,
    failed: Math.floor(Math.random() * 3),
    total: 0,
  }));

  deploymentMetrics.forEach(metric => {
    metric.total = metric.successful + metric.failed;
  });

  const performanceMetrics = last30Days.map((date, index) => ({
    date: date.toISOString().split('T')[0],
    responseTime: Math.floor(Math.random() * 200) + 100,
    uptime: 99.5 + Math.random() * 0.5,
    requests: Math.floor(Math.random() * 10000) + 5000,
    errors: Math.floor(Math.random() * 50) + 10,
  }));

  const recentDeployments = Array.from({ length: 15 }, (_, i) => {
    const date = new Date(now);
    date.setHours(date.getHours() - i * 2);

    const statuses = ['success', 'failed', 'building'];
    const branches = ['main', 'develop', 'feature/auth', 'hotfix/bug-123'];
    const authors = ['john.doe', 'jane.smith', 'dev.team', 'ci-bot'];

    return {
      id: `deploy-${i + 1}`,
      status: i === 0 ? 'building' : statuses[Math.floor(Math.random() * 2)],
      branch: branches[Math.floor(Math.random() * branches.length)],
      commit: `${Math.random().toString(36).substring(2, 8)}`,
      message: [
        'feat: add new authentication system',
        'fix: resolve database connection issue',
        'update: upgrade dependencies to latest',
        'refactor: improve code structure',
        'docs: update API documentation',
      ][Math.floor(Math.random() * 5)],
      author: authors[Math.floor(Math.random() * authors.length)],
      timestamp: date.toISOString(),
      duration: Math.floor(Math.random() * 300) + 60,
      environment: Math.random() > 0.7 ? 'production' : 'staging',
    };
  });

  return {
    deploymentMetrics,
    performanceMetrics,
    recentDeployments,
    summary: {
      totalDeployments: deploymentMetrics.reduce((sum, m) => sum + m.total, 0),
      successRate: (
        (deploymentMetrics.reduce((sum, m) => sum + m.successful, 0) /
          deploymentMetrics.reduce((sum, m) => sum + m.total, 0)) *
        100
      ).toFixed(1),
      avgResponseTime: (
        performanceMetrics.reduce((sum, m) => sum + m.responseTime, 0) /
        performanceMetrics.length
      ).toFixed(0),
      avgUptime: (
        performanceMetrics.reduce((sum, m) => sum + m.uptime, 0) /
        performanceMetrics.length
      ).toFixed(2),
    },
  };
}

export async function GET() {
  try {
    const data = generateMetricsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
