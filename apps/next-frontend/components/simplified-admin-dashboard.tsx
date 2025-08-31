'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealTimeLogs } from '@/components/real-time-logs';
import { SimpleDeploysList } from '@/components/simple-deploys-list';
import { AdminStatsDashboard } from '@/components/admin-stats-dashboard';
import { GitBranch, Server, BarChart3 } from 'lucide-react';

export function SimplifiedAdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 px-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="stats" className="data-[state=active]:bg-card">
              <BarChart3 className="mr-2 h-4 w-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="deploys" className="data-[state=active]:bg-card">
              <GitBranch className="mr-2 h-4 w-4" />
              Deploys
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-card">
              <Server className="mr-2 h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <AdminStatsDashboard />
          </TabsContent>

          <TabsContent value="deploys" className="">
            <SimpleDeploysList />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <RealTimeLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
