'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealTimeLogs } from '@/components/real-time-logs';
import { SimpleDeploysList } from '@/components/simple-deploys-list';
import { GitBranch, Server } from 'lucide-react';

export function SimplifiedAdminDashboard() {
  const [activeTab, setActiveTab] = useState('deploys');


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 px-24">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-3"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger
              value="deploys"
              className="data-[state=active]:bg-card"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Deploys
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-card">
              <Server className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

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