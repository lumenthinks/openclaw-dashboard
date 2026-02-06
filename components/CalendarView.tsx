'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CalendarView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Tasks</CardTitle>
        <CardDescription>
          Weekly view of upcoming scheduled work (cron integration coming soon)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">
          <p>Calendar view will show:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Heartbeat schedules</li>
            <li>Recurring tasks from cron</li>
            <li>Upcoming reminders</li>
            <li>Scheduled maintenance</li>
          </ul>
          <p className="mt-4 text-sm">
            API endpoint for cron data will be added in the next iteration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
