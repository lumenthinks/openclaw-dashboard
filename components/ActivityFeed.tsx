'use client';

import { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronRight, User, Bot, Wrench, FileOutput, Terminal, Globe, MessageSquare, ArrowUp } from 'lucide-react';

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

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ActivityFeed error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="border-red-500">
          <CardContent className="pt-6 text-red-600">
            <p className="font-semibold">Error rendering activity</p>
            <p className="text-sm mt-2">{this.state.error?.message}</p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
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

  // Tool-specific result renderers
  const renderMoltbookResult = (data: any, rawData: string) => {
    const [showRaw, setShowRaw] = React.useState(false);
    
    try {
      // Parse if string
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Handle various data structures - look for posts in common locations
      let posts: any[] = [];
      if (Array.isArray(parsed)) {
        posts = parsed;
      } else if (parsed?.posts) {
        posts = parsed.posts;
      } else if (parsed?.data?.posts) {
        posts = parsed.data.posts;
      } else if (parsed?.results) {
        posts = parsed.results;
      } else if (parsed?.post) {
        posts = [parsed.post];
      } else {
        posts = [parsed];
      }
      
      // Helper to extract title from various structures
      const getTitle = (post: any) => {
        return post?.title || post?.question || post?.name || post?.headline || null;
      };
      
      const getAuthor = (post: any) => {
        const author = post?.author;
        if (!author) return 'unknown';
        if (typeof author === 'string') return author;
        return author?.name || author?.username || author?.handle || 'unknown';
      };
      
      const getSubmolt = (post: any) => {
        const submolt = post?.submolt;
        if (!submolt) return null;
        if (typeof submolt === 'string') return submolt;
        return submolt?.name || submolt?.display_name || null;
      };
      
      return (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowRaw(!showRaw)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              {showRaw ? 'Show Parsed' : 'Show Raw (Debug)'}
            </button>
          </div>
          
          {showRaw ? (
            <pre className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto max-h-96 overflow-y-auto">
              {rawData || JSON.stringify(parsed, null, 2)}
            </pre>
          ) : (
            posts.map((post: any, idx: number) => {
              const title = getTitle(post);
              const author = getAuthor(post);
              const submolt = getSubmolt(post);
              
              return (
                <Card key={idx} className="bg-muted/30 border-purple-200 dark:border-purple-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base">{title || 'Untitled Post'}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>@{author}</span>
                          {submolt && (
                            <Badge variant="outline" className="text-xs">
                              m/{submolt}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {post.upvotes !== undefined && (
                        <div className="flex items-center gap-1 text-sm">
                          <ArrowUp className="w-4 h-4" />
                          <span className="font-semibold">{post.upvotes}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {post.content && (
                    <CardContent className="pt-0">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {typeof post.content === 'string' ? post.content : JSON.stringify(post.content)}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      );
    } catch (e) {
      return (
        <div className="space-y-2">
          <div className="text-sm text-red-500">Error parsing Moltbook data</div>
          <pre className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto">
            {rawData || String(data)}
          </pre>
        </div>
      );
    }
  };

  const renderExecResult = (data: any) => {
    try {
      let parsed = data;
      if (typeof data === 'string') {
        try {
          parsed = JSON.parse(data);
        } catch {
          // If it's not JSON, treat the whole string as output
          return (
            <div className="bg-muted/50 p-3 rounded max-h-64 overflow-y-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap">{data}</pre>
            </div>
          );
        }
      }
      if (!parsed || typeof parsed !== 'object') {
        return <div className="text-xs text-muted-foreground">No output</div>;
      }
      const command = parsed.command || parsed.cmd || '';
      const output = parsed.output || parsed.stdout || parsed.result || (typeof parsed === 'string' ? parsed : '');
      const isLong = output.length > 500;
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Terminal className="w-4 h-4" />
            <span className="font-semibold">Command</span>
          </div>
          <pre className="text-xs font-mono bg-black text-green-400 p-3 rounded">
            $ {command}
          </pre>
          
          {output && (
            <div>
              <div className="text-sm font-semibold mb-1">Output</div>
              {isLong ? (
                <Collapsible>
                  <div className="bg-muted/50 p-3 rounded max-h-32 overflow-y-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {output.substring(0, 500)}...
                    </pre>
                  </div>
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1">
                    <ChevronDown className="w-3 h-3" />
                    Show full output
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="bg-muted/50 p-3 rounded mt-2 max-h-96 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {output}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div className="bg-muted/50 p-3 rounded max-h-64 overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {output}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      );
    } catch (e) {
      return <div className="text-sm text-red-500">Error parsing exec data</div>;
    }
  };

  const renderBrowserResult = (data: any) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const url = parsed.url || parsed.targetUrl || '';
      const action = parsed.action || parsed.request?.kind || 'unknown';
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-semibold">Browser Action: {action}</span>
          </div>
          
          {url && (
            <div className="text-xs">
              <span className="text-muted-foreground">URL: </span>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {url}
              </a>
            </div>
          )}
          
          {action === 'snapshot' && (
            <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground">
              📸 Page snapshot captured
            </div>
          )}
          
          {parsed.request && (
            <div className="text-xs">
              <span className="font-semibold">Action: </span>
              {parsed.request.kind}
              {parsed.request.ref && <span className="text-muted-foreground"> → {parsed.request.ref}</span>}
              {parsed.request.text && <span className="text-muted-foreground"> "{parsed.request.text}"</span>}
            </div>
          )}
        </div>
      );
    } catch (e) {
      return <div className="text-sm text-red-500">Error parsing browser data</div>;
    }
  };

  const renderWebFetchResult = (data: any) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const url = parsed.url || '';
      const content = parsed.content || parsed.markdown || '';
      const isLong = content.length > 300;
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-semibold">Web Fetch</span>
          </div>
          
          {url && (
            <div className="text-xs">
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {url}
              </a>
            </div>
          )}
          
          {content && (
            <div>
              {isLong ? (
                <Collapsible>
                  <div className="bg-muted/50 p-3 rounded">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content.substring(0, 300)}...
                      </ReactMarkdown>
                    </div>
                  </div>
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1">
                    <ChevronDown className="w-3 h-3" />
                    Show full content
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="bg-muted/50 p-3 rounded mt-2 max-h-96 overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div className="bg-muted/50 p-3 rounded">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    } catch (e) {
      return <div className="text-sm text-red-500">Error parsing web_fetch data</div>;
    }
  };

  const renderWebSearchResult = (data: any) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const query = parsed.query || '';
      const results = parsed.results || parsed.web?.results || [];
      
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-semibold">Search: {query}</span>
          </div>
          
          {results.length > 0 && (
            <div className="space-y-2">
              {results.slice(0, 5).map((result: any, idx: number) => (
                <Card key={idx} className="bg-muted/30">
                  <CardContent className="p-3">
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      {result.title}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.description || result.snippet}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    } catch (e) {
      return <div className="text-sm text-red-500">Error parsing web_search data</div>;
    }
  };

  const renderToolResult = (activity: ActivityItem) => {
    const toolName = activity.content.toolName || activity.content.name || 'Unknown';
    
    // Extract content
    let contentStr = '';
    let contentData: any = null;
    
    if (activity.content.content) {
      if (Array.isArray(activity.content.content)) {
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
        contentData = activity.content.content;
        contentStr = JSON.stringify(activity.content.content, null, 2);
      }
    }

    // Try to parse as JSON for tool-specific rendering
    try {
      if (!contentData && contentStr) {
        contentData = JSON.parse(contentStr);
      }
    } catch {
      // Not JSON, that's fine
    }

    // Tool-specific rendering
    const toolLower = toolName.toLowerCase();
    
    if (toolLower.includes('moltbook') || (contentData && (contentData.submolt || contentData.title))) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="font-semibold text-sm font-mono">{toolName}</span>
          </div>
          {renderMoltbookResult(contentData || contentStr, contentStr)}
        </div>
      );
    }
    
    if (toolLower === 'exec' || (contentData && contentData.command)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span className="font-semibold text-sm font-mono">{toolName}</span>
          </div>
          {renderExecResult(contentData || contentStr)}
        </div>
      );
    }
    
    if (toolLower === 'browser' || (contentData && (contentData.action || contentData.request))) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="font-semibold text-sm font-mono">{toolName}</span>
          </div>
          {renderBrowserResult(contentData || contentStr)}
        </div>
      );
    }
    
    if (toolLower === 'web_fetch' && contentData) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="font-semibold text-sm font-mono">{toolName}</span>
          </div>
          {renderWebFetchResult(contentData)}
        </div>
      );
    }
    
    if (toolLower === 'web_search' || (contentData && contentData.query)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="font-semibold text-sm font-mono">{toolName}</span>
          </div>
          {renderWebSearchResult(contentData || contentStr)}
        </div>
      );
    }
    
    // Default rendering for unknown tools
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
    try {
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
    } catch (error) {
      console.error('Error rendering activity content:', error);
      return (
        <div className="text-sm text-red-500">
          Error rendering content: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      );
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
            <ErrorBoundary key={idx}>
              <Card className={`border-l-4 ${config.borderColor}`}>
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
            </ErrorBoundary>
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
