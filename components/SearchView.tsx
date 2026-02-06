'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SearchResult {
  type: 'session' | 'memory' | 'workspace';
  path: string;
  snippet: string;
  matches: number;
}

export function SearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (query.length < 2) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({ q: query });
      if (sourceFilter !== 'all') {
        params.append('source', sourceFilter);
      }
      
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceBadgeColor = (type: string) => {
    switch (type) {
      case 'session': return 'bg-blue-500';
      case 'memory': return 'bg-purple-500';
      case 'workspace': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const highlightMatches = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-700">{part}</mark>
        : part
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Global Search</CardTitle>
          <CardDescription>
            Search across sessions, memory files, and workspace documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Search for anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="sessions">Sessions</SelectItem>
                <SelectItem value="memory">Memory</SelectItem>
                <SelectItem value="workspace">Workspace</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading || query.length < 2}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && (
        <div className="space-y-3">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                Searching...
              </CardContent>
            </Card>
          ) : results.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((result, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getSourceBadgeColor(result.type)}>
                            {result.type}
                          </Badge>
                          <span className="text-sm font-mono text-muted-foreground">
                            {result.path.replace('/home/pi/.openclaw/', '').replace('/home/pi/.openclaw/workspace/', '')}
                          </span>
                        </div>
                        <CardDescription className="text-xs">
                          {result.matches} match{result.matches !== 1 ? 'es' : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-mono bg-muted p-3 rounded whitespace-pre-wrap break-words">
                      {highlightMatches(result.snippet, query)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No results found for "{query}"
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
