'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActivityItem {
  sessionId: string;
  timestamp: string;
  type: 'user' | 'assistant' | 'tool_call' | 'tool_result';
  content: any;
  tokenUsage?: {
    input?: number;
    output?: number;
    total?: number;
  };
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, [typeFilter]);

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      const res = await fetch(`/api/activity?${params}`);
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (!searchTerm) return true;
    const contentStr = JSON.stringify(activity.content).toLowerCase();
    return contentStr.includes(searchTerm.toLowerCase()) || 
           activity.sessionId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-500';
      case 'assistant': return 'bg-green-500';
      case 'tool_call': return 'bg-purple-500';
      case 'tool_result': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const renderContent = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'user':
        return (
          <div className="text-sm">
            {typeof activity.content === 'string' 
              ? activity.content 
              : JSON.stringify(activity.content, null, 2)}
          </div>
        );
      case 'assistant':
        return (
          <div className="space-y-2">
            <div className="text-sm">
              {typeof activity.content === 'string' 
                ? activity.content 
                : JSON.stringify(activity.content, null, 2)}
            </div>
            {activity.tokenUsage && (
              <div className="text-xs text-muted-foreground">
                Tokens: {activity.tokenUsage.input || 0} in / {activity.tokenUsage.output || 0} out
              </div>
            )}
          </div>
        );
      case 'tool_call':
        return (
          <div className="text-sm font-mono bg-muted p-2 rounded">
            <div className="font-semibold">{activity.content.function?.name || activity.content.name}</div>
            <pre className="text-xs mt-1 overflow-x-auto">
              {JSON.stringify(activity.content.function?.arguments || activity.content.arguments, null, 2)}
            </pre>
          </div>
        );
      case 'tool_result':
        return (
          <div className="text-sm font-mono bg-muted p-2 rounded">
            <div className="font-semibold">{activity.content.name}</div>
            <pre className="text-xs mt-1 overflow-x-auto max-h-32">
              {activity.content.content?.substring(0, 500)}
              {activity.content.content?.length > 500 && '...'}
            </pre>
          </div>
        );
      default:
        return <div className="text-sm">Unknown activity type</div>;
    }
  };

  if (loading) {
    return <div className="p-4">Loading activities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">User Messages</SelectItem>
            <SelectItem value="assistant">Assistant</SelectItem>
            <SelectItem value="tool_call">Tool Calls</SelectItem>
            <SelectItem value="tool_result">Tool Results</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredActivities.map((activity, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeBadgeColor(activity.type)}>
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.sessionId}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    {formatTimestamp(activity.timestamp)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderContent(activity)}
            </CardContent>
          </Card>
        ))}

        {filteredActivities.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No activities found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
