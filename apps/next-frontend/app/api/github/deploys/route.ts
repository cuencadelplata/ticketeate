import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration purposes
const mockDeploys = [
  {
    id: '1',
    status: 'ready' as const,
    environment: 'production',
    isCurrent: true,
    duration: '2m 30s',
    timeAgo: '2 hours ago',
    repository: 'ticketeate/web',
    branch: 'main',
    commit: 'a1b2c3d',
    message: 'feat: Add new ticket management features',
    date: '2024-01-15T10:30:00Z',
    author: 'John Doe',
    avatar: 'https://github.com/github.png',
    htmlUrl: 'https://github.com/ticketeate/web/commit/a1b2c3d',
    runNumber: 123,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:32:30Z',
  },
  {
    id: '2',
    status: 'error' as const,
    environment: 'staging',
    isCurrent: false,
    duration: '1m 45s',
    timeAgo: '4 hours ago',
    repository: 'ticketeate/web',
    branch: 'feature/new-ui',
    commit: 'e4f5g6h',
    message: 'fix: Resolve authentication issues',
    date: '2024-01-15T08:15:00Z',
    author: 'Jane Smith',
    avatar: 'https://github.com/github.png',
    htmlUrl: 'https://github.com/ticketeate/web/commit/e4f5g6h',
    runNumber: 122,
    createdAt: '2024-01-15T08:15:00Z',
    updatedAt: '2024-01-15T08:16:45Z',
  },
  {
    id: '3',
    status: 'building' as const,
    environment: 'development',
    isCurrent: false,
    duration: '0m 30s',
    timeAgo: '10 minutes ago',
    repository: 'ticketeate/web',
    branch: 'hotfix/urgent-fix',
    commit: 'i7j8k9l',
    message: 'hotfix: Fix critical payment bug',
    date: '2024-01-15T12:20:00Z',
    author: 'Bob Johnson',
    avatar: 'https://github.com/github.png',
    htmlUrl: 'https://github.com/ticketeate/web/commit/i7j8k9l',
    runNumber: 124,
    createdAt: '2024-01-15T12:20:00Z',
    updatedAt: '2024-01-15T12:20:30Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');

    // Filter deploys by environment
    let filteredDeploys = mockDeploys;
    if (environment !== 'all') {
      filteredDeploys = mockDeploys.filter(deploy => deploy.environment === environment);
    }

    // Calculate pagination
    const totalCount = filteredDeploys.length;
    const totalPages = Math.ceil(totalCount / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedDeploys = filteredDeploys.slice(startIndex, endIndex);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      deploys: paginatedDeploys,
      pagination: {
        page,
        perPage,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching deploys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}