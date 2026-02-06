'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronRight, User, Bot, Wrench, FileOutput } from 'lucide-react';

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

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'user':
        return {
          color: 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
          borderColor: 'border-l-blue-500',
          icon: User,
          label: 'User'
        };
      case 'assistant':
        return {
          color: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100',
          borderColor: 'border-l-green-500',
          icon: Bot,
          label: 'Assistant'
        };
      case 'tool_call':
        return {
          color: 'bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100',
          borderColor: 'border-l-orange-500',
          icon: Wrench,
          label: 'Tool Call'
        };
      case 'tool_result':
        return {
          color: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
          borderColor: 'border-l-yellow-500',
          icon: FileOutput,
          label: 'Tool Result'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100',
          borderColor: 'border-l-gray-500',
          icon: FileOutput,
          label: 'Unknown'
        };
    }
  };

  const extractUserContent = (content: any): string => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      // Handle array of content blocks
      return content
        .map(block => {
          if (typeof block === 'string') return block;
          if (block.type === 'text') return block.text;
          return '';
        })
        .filter(Boolean)
        .join('\n');
    }
    return JSON.stringify(content);
  };

  const extractAssistantContent = (content: any): string => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      // Handle array of content blocks, filter out thinking
      return content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .filter(Boolean)
        .join('\n');
    }
    return JSON.stringify(content);
  };

  const parseToolArguments = (args: any) => {
    if (typeof args === 'string') {
      try {
        return JSON.parse(args);
      } catch {
        return args;
      }
    }
    return args;
  };

  const renderUserMessage = (activity: ActivityItem) => {
    const content = extractUserContent(activity.content);
    const sessionShort = activity.sessionId.split(':').slice(-2).join(':');
    
    return (
      <div className="space-y-2">
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
        <div className="text-xs text-muted-foreground pt-1 border-t">
          Session: {sessionShort}
        </div>
      </div>
    );
  };

  const renderAssistantMessage = (activity: ActivityItem) => {
    const content = extractAssistantContent(activity.content);
    
    return (
      <div className="space-y-2">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
        {activity.tokenUsage && (
          <div className="text-xs text-muted-foreground pt-2 border-t flex gap-4">
            <span>Tokens: {activity.tokenUsage.input || 0} in</span>
            <span>{activity.tokenUsage.output || 0} out</span>
            <span className="font-medium">Total: {activity.tokenUsage.total || 0}</span>
          </div>
        )}
      </div>
    );
  };

  const renderToolCall = (activity: ActivityItem) => {
    const toolName = activity.content.function?.name || activity.content.name || 'Unknown';
    const rawArgs = activity.content.function?.arguments || activity.content.arguments || {};
    const args = parseToolArguments(rawArgs);
    
    // Filter out common noise fields
    const cleanArgs = { ...args };
    delete cleanArgs.thinkingSignature;
    
    const argsStr = JSON.stringify(cleanArgs, null, 2);
    const isLong = argsStr.length > 200;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          <span className="font-semibold text-sm font-mono">{toolName}</span>
        </div>
        
        {isLong ? (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-3 h-3" />
              Show parameters
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="text-xs font-mono bg-muted/50 p-3 rounded mt-2 overflow-x-auto">
                {argsStr}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <pre className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto">
            {argsStr}
          </pre>
        )}
      </div>
    );
  };

  const renderToolResult = (activity: ActivityItem) => {
    const toolName = activity.content.toolName || activity.content.name || 'Unknown';
    
    // Extract content from the toolResult structure
    let contentStr = '';
    if (activity.content.content) {
      if (Array.isArray(activity.content.content)) {
        // Extract text from content blocks
        contentStr = activity.content.content
          .map((block: any) => {
            if (typeof block === 'string') return block;
            if (block.type === 'text') return block.text;
            return JSON.stringify(block);
          })
          .join('\n');
      } else if (typeof activity.content.content === 'string') {
        contentStr = activity.content.content;
      } else {
        contentStr = JSON.stringify(activity.content.content, null, 2);
      }
    }
    
    // Truncate long results
    const isLong = contentStr.length > 300;
    const displayContent = isLong ? contentStr.substring(0, 300) + '...' : contentStr;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileOutput className="w-4 h-4" />
          <span className="font-semibold text-sm font-mono">{toolName}</span>
        </div>
        
        {isLong ? (
          <Collapsible>
            <div className="bg-muted/50 p-3 rounded">
              <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                {displayContent}
              </pre>
            </div>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1">
              <ChevronDown className="w-3 h-3" />
              Show full output
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-muted/50 p-3 rounded mt-2">
                <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                  {contentStr}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="bg-muted/50 p-3 rounded">
            <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
              {displayContent}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderContent = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'user':
        return renderUserMessage(activity);
      case 'assistant':
        return renderAssistantMessage(activity);
      case 'tool_call':
        return renderToolCall(activity);
      case 'tool_result':
        return renderToolResult(activity);
      default:
        return <div className="text-sm text-muted-foreground">Unknown activity type</div>;
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
        {filteredActivities.map((activity, idx) => {
          const config = getTypeConfig(activity.type);
          const Icon = config.icon;
          
          return (
            <Card key={idx} className={`border-l-4 ${config.borderColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <Badge className={config.color} variant="secondary">
                      {config.label}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {formatTimestamp(activity.timestamp)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {renderContent(activity)}
              </CardContent>
            </Card>
          );
        })}

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
