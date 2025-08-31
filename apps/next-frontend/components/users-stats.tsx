'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserCheck, UserX, UserPlus, Trophy } from 'lucide-react';

interface UserStatsProps {
  users: {
    overview: {
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      recentRegistrations: number;
    };
    usersByRole: Array<{
      rol: string;
      _count: { rol: number };
    }>;
    topUsers: Array<{
      id: string;
      name: string;
      email: string;
      totalReservations: number;
    }>;
  };
}

export function UsersStats({ users }: UserStatsProps) {
  const getRoleLabel = (role: string) => {
    const roleLabels = {
      admin: 'Administrador',
      usuario: 'Usuario',
      moderador: 'Moderador',
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      usuario: 'bg-blue-100 text-blue-800',
      moderador: 'bg-purple-100 text-purple-800',
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const overviewCards = [
    {
      title: 'Total Usuarios',
      value: users.overview.totalUsers,
      icon: Users,
      description: 'Usuarios registrados',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Usuarios Activos',
      value: users.overview.activeUsers,
      icon: UserCheck,
      description: 'Estado activo',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Usuarios Inactivos',
      value: users.overview.inactiveUsers,
      icon: UserX,
      description: 'Estado inactivo',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Nuevos Registros',
      value: users.overview.recentRegistrations,
      icon: UserPlus,
      description: 'Últimos 30 días',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribución por roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribución por Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.usersByRole.map((roleData, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(roleData.rol)}>
                      {getRoleLabel(roleData.rol)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{roleData._count.rol}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((roleData._count.rol / users.overview.totalUsers) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usuarios más activos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Usuarios Más Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.topUsers.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{user.totalReservations}</div>
                    <div className="text-xs text-muted-foreground">reservas</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
