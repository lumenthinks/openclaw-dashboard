'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityFeed } from '@/components/ActivityFeed';
import { CalendarView } from '@/components/CalendarView';
import { SearchView } from '@/components/SearchView';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">OpenClaw Mission Control</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and control dashboard
          </p>
        </div>

        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <ActivityFeed />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="search">
            <SearchView />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
