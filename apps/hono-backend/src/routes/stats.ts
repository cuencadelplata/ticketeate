import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getAuth } from '@hono/clerk-auth';
import { prisma } from '../config/prisma';

const stats = new Hono();

stats.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// GET /api/stats/overview - Estadísticas generales del sistema
stats.get('/overview', async c => {
  try {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    // Verificar si el usuario es admin
    const user = await prisma.usuarios.findFirst({
      where: { clerk_id: auth.userId },
    });

    if (user?.rol !== 'admin') {
      return c.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        403
      );
    }

    // Estadísticas generales
    const [
      totalEvents,
      totalUsers,
      totalReservations,
      totalRevenue,
      activeEvents,
      completedEvents,
      pendingReservations,
      confirmedReservations,
    ] = await Promise.all([
      prisma.eventos.count(),
      prisma.usuarios.count(),
      prisma.reservas.count(),
      prisma.pagos.aggregate({
        where: { estado: 'confirmado' },
        _sum: { monto_total: true },
      }),
      prisma.eventos.count({
        where: { estado: 'activo' },
      }),
      prisma.eventos.count({
        where: { estado: 'completado' },
      }),
      prisma.reservas.count({
        where: { estado: 'pendiente' },
      }),
      prisma.reservas.count({
        where: { estado: 'confirmada' },
      }),
    ]);

    // Estadísticas de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentEvents, recentReservations, recentRevenue] = await Promise.all(
      [
        prisma.eventos.count({
          where: {
            fecha_creacion: { gte: thirtyDaysAgo },
          },
        }),
        prisma.reservas.count({
          where: {
            fecha_reserva: { gte: thirtyDaysAgo },
          },
        }),
        prisma.pagos.aggregate({
          where: {
            estado: 'confirmado',
            fecha_pago: { gte: thirtyDaysAgo },
          },
          _sum: { monto_total: true },
        }),
      ]
    );

    return c.json({
      overview: {
        totalEvents,
        totalUsers,
        totalReservations,
        totalRevenue: totalRevenue._sum.monto_total || 0,
        activeEvents,
        completedEvents,
        pendingReservations,
        confirmedReservations,
      },
      last30Days: {
        newEvents: recentEvents,
        newReservations: recentReservations,
        revenue: recentRevenue._sum.monto_total || 0,
      },
    });
  } catch (error) {
    console.error('Error getting overview stats:', error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500
    );
  }
});

// GET /api/stats/events - Estadísticas detalladas de eventos
stats.get('/events', async c => {
  try {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    // Verificar si el usuario es admin
    const user = await prisma.usuarios.findFirst({
      where: { clerk_id: auth.userId },
    });

    if (user?.rol !== 'admin') {
      return c.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        403
      );
    }

    // Estadísticas por evento
    const eventsStats = await prisma.eventos.findMany({
      include: {
        _count: {
          select: {
            reservas: true,
            categorias_entrada: true,
          },
        },
        estadisticas: true,
        categorias_entrada: {
          select: {
            stock_total: true,
            stock_disponible: true,
            precio: true,
          },
        },
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    // Calcular métricas por evento
    interface CategoriaEntrada {
      stock_total: number;
      stock_disponible: number;
      precio: number | string;
    }

    interface EventoStats {
      id_evento: number;
      titulo: string;
      estado: string;
      fecha_creacion: Date;
      _count: {
        reservas: number;
        categorias_entrada: number;
      };
      estadisticas: any;
      categorias_entrada: CategoriaEntrada[];
    }

    interface EventWithMetrics {
      id: number;
      titulo: string;
      estado: string;
      fecha_creacion: Date;
      totalReservations: number;
      totalCategories: number;
      totalStock: number;
      availableStock: number;
      soldStock: number;
      avgPrice: number;
      occupancyRate: number;
    }

    const eventsWithMetrics: EventWithMetrics[] = eventsStats.map((event: EventoStats): EventWithMetrics => {
      const totalStock = event.categorias_entrada.reduce(
        (sum, cat) => sum + cat.stock_total,
        0
      );
      const availableStock = event.categorias_entrada.reduce(
        (sum, cat) => sum + cat.stock_disponible,
        0
      );
      const soldStock = totalStock - availableStock;
      const avgPrice =
        event.categorias_entrada.length > 0
          ? event.categorias_entrada.reduce(
              (sum, cat) => sum + Number(cat.precio),
              0
            ) / event.categorias_entrada.length
          : 0;

      return {
        id: event.id_evento,
        titulo: event.titulo,
        estado: event.estado,
        fecha_creacion: event.fecha_creacion,
        totalReservations: event._count.reservas,
        totalCategories: event._count.categorias_entrada,
        totalStock,
        availableStock,
        soldStock,
        avgPrice: Math.round(avgPrice * 100) / 100,
        occupancyRate:
          totalStock > 0 ? Math.round((soldStock / totalStock) * 100) : 0,
      };
    });

    return c.json({
      events: eventsWithMetrics,
      total: eventsWithMetrics.length,
    });
  } catch (error) {
    console.error('Error getting events stats:', error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500
    );
  }
});

// GET /api/stats/users - Estadísticas de usuarios
stats.get('/users', async c => {
  try {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    // Verificar si el usuario es admin
    const user = await prisma.usuarios.findFirst({
      where: { clerk_id: auth.userId },
    });

    if (user?.rol !== 'admin') {
      return c.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        403
      );
    }

    // Estadísticas de usuarios
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      recentRegistrations,
    ] = await Promise.all([
      prisma.usuarios.count(),
      prisma.usuarios.count({ where: { estado: 'activo' } }),
      prisma.usuarios.count({ where: { estado: 'inactivo' } }),
      prisma.usuarios.groupBy({
        by: ['rol'],
        _count: { rol: true },
      }),
      prisma.usuarios.count({
        where: {
          fecha_registro: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Usuarios más activos (con más reservas)
    const topUsers = await prisma.usuarios.findMany({
      select: {
        id_usuario: true,
        nombre: true,
        apellido: true,
        email: true,
        _count: {
          select: { reservas: true },
        },
      },
      orderBy: {
        reservas: { _count: 'desc' },
      },
      take: 10,
    });

    return c.json({
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        recentRegistrations,
      },
      usersByRole,
      topUsers: topUsers.map(user => ({
        id: user.id_usuario,
        name: `${user.nombre} ${user.apellido}`,
        email: user.email,
        totalReservations: user._count.reservas,
      })),
    });
  } catch (error) {
    console.error('Error getting users stats:', error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500
    );
  }
});

// GET /api/stats/revenue - Estadísticas de ingresos
stats.get('/revenue', async c => {
  try {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    // Verificar si el usuario es admin
    const user = await prisma.usuarios.findFirst({
      where: { clerk_id: auth.userId },
    });

    if (user?.rol !== 'admin') {
      return c.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        403
      );
    }

    // Estadísticas de ingresos
    const [
      totalRevenue,
      confirmedRevenue,
      pendingRevenue,
      revenueByMonth,
      revenueByEvent,
    ] = await Promise.all([
      prisma.pagos.aggregate({
        _sum: { monto_total: true },
      }),
      prisma.pagos.aggregate({
        where: { estado: 'confirmado' },
        _sum: { monto_total: true },
      }),
      prisma.pagos.aggregate({
        where: { estado: 'pendiente' },
        _sum: { monto_total: true },
      }),
      prisma.pagos.groupBy({
        by: ['estado'],
        _sum: { monto_total: true },
        _count: { id_pago: true },
      }),
      prisma.pagos.findMany({
        include: {
          reservas: {
            include: {
              eventos: {
                select: { titulo: true },
              },
            },
          },
        },
        orderBy: {
          monto_total: 'desc',
        },
        take: 10,
      }),
    ]);

    // Ingresos por método de pago
    const revenueByMethod = await prisma.pagos.groupBy({
      by: ['metodo_pago'],
      _sum: { monto_total: true },
      _count: { id_pago: true },
    });

    interface RevenueOverview {
      totalRevenue: number;
      confirmedRevenue: number;
      pendingRevenue: number;
    }

    interface RevenueByStatus {
      estado: string;
      _sum: { monto_total: number | null };
      _count: { id_pago: number };
    }

    interface RevenueByMethod {
      metodo_pago: string;
      _sum: { monto_total: number | null };
      _count: { id_pago: number };
    }

    interface TopPayment {
      id: number;
      amount: number;
      method: string;
      status: string;
      eventTitle: string;
      date: Date;
    }

    return c.json<{
      overview: RevenueOverview;
      byStatus: RevenueByStatus[];
      byMethod: RevenueByMethod[];
      topPayments: TopPayment[];
    }>({
      overview: {
        totalRevenue: totalRevenue._sum.monto_total || 0,
        confirmedRevenue: confirmedRevenue._sum.monto_total || 0,
        pendingRevenue: pendingRevenue._sum.monto_total || 0,
      },
      byStatus: revenueByMonth,
      byMethod: revenueByMethod,
      topPayments: revenueByEvent.map(payment => ({
        id: payment.id_pago,
        amount: payment.monto_total,
        method: payment.metodo_pago,
        status: payment.estado,
        eventTitle: payment.reservas.eventos.titulo,
        date: payment.fecha_pago,
      })),
    });
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500
    );
  }
});

// GET /api/stats/performance - Métricas de rendimiento
stats.get('/performance', async c => {
  try {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Usuario no autenticado' }, 401);
    }

    // Verificar si el usuario es admin
    const user = await prisma.usuarios.findFirst({
      where: { clerk_id: auth.userId },
    });

    if (user?.rol !== 'admin') {
      return c.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        403
      );
    }

    // Métricas de rendimiento
    const [
      avgReservationsPerEvent,
      avgRevenuePerEvent,
      conversionRate,
      avgTicketPrice,
      topPerformingEvents,
    ] = await Promise.all([
      prisma.reservas
        .groupBy({
          by: ['id_evento'],
          _count: { id_reserva: true },
        })
        .then(results => {
          const total = results.reduce(
            (sum, r) => sum + r._count.id_reserva,
            0
          );
          return results.length > 0 ? total / results.length : 0;
        }),
      prisma.pagos.aggregate({
        where: { estado: 'confirmado' },
        _avg: { monto_total: true },
      }),
      prisma.reservas
        .count({
          where: { estado: 'confirmada' },
        })
        .then(confirmed =>
          prisma.reservas
            .count()
            .then(total => (total > 0 ? (confirmed / total) * 100 : 0))
        ),
      prisma.categorias_entrada.aggregate({
        _avg: { precio: true },
      }),
      prisma.eventos.findMany({
        include: {
          _count: {
            select: { reservas: true },
          },
          estadisticas: true,
        },
        orderBy: {
          reservas: { _count: 'desc' },
        },
        take: 5,
      }),
    ]);

    return c.json({
      metrics: {
        avgReservationsPerEvent:
          Math.round(avgReservationsPerEvent * 100) / 100,
        avgRevenuePerEvent: avgRevenuePerEvent._avg.monto_total || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgTicketPrice: avgTicketPrice._avg.precio || 0,
      },
      topPerformingEvents: topPerformingEvents.map(event => ({
        id: event.id_evento,
        title: event.titulo,
        totalReservations: event._count.reservas,
        totalSold: event.estadisticas[0]?.total_vendidos || 0,
        totalRevenue: event.estadisticas[0]?.total_ingresos || 0,
      })),
    });
  } catch (error) {
    console.error('Error getting performance stats:', error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      500
    );
  }
});

export { stats };
