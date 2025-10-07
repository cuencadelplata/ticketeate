'use client';

import { useViewsHistory } from '@/hooks/use-views-history';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { Eye, TrendingUp, Calendar } from 'lucide-react';

interface ViewsChartProps {
  eventId: string;
  days?: number;
}

export function ViewsChart({ eventId, days = 7 }: ViewsChartProps) {
  const { data: viewsHistoryData, isLoading, error } = useViewsHistory(eventId, days);

  if (isLoading) {
    return (
      <div className="rounded-lg bg-[#1E1E1E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold">Evolución de Views</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-400">Cargando datos históricos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-[#1E1E1E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold">Evolución de Views</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-red-400">Error al cargar datos históricos</div>
        </div>
      </div>
    );
  }

  if (!viewsHistoryData) {
    return (
      <div className="rounded-lg bg-[#1E1E1E] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold">Evolución de Views</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-400">No hay datos disponibles</div>
        </div>
      </div>
    );
  }

  const { chartData, totalViews, averageDailyViews, maxDailyViews } = viewsHistoryData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2A2A2A] border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`${label}`}</p>
          <p className="text-orange-400 font-semibold">{`${payload[0].value} views`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg bg-[#1E1E1E] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold">Evolución de Views</h3>
        </div>
        <div className="flex items-center gap-1 text-orange-400">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Últimos {days} días</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#fb923c"
              strokeWidth={2}
              fill="url(#viewsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-400">
        <div className="text-center">
          <div className="text-orange-400 font-semibold">{totalViews.toLocaleString()}</div>
          <div>Total Views</div>
        </div>
        <div className="text-center">
          <div className="text-orange-400 font-semibold">{averageDailyViews.toLocaleString()}</div>
          <div>Promedio/día</div>
        </div>
        <div className="text-center">
          <div className="text-orange-400 font-semibold">{maxDailyViews.toLocaleString()}</div>
          <div>Máximo/día</div>
        </div>
      </div>
    </div>
  );
}
