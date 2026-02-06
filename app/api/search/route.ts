import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const SESSIONS_DIR = '/home/pi/.openclaw/agents/main/sessions';
const MEMORY_DIR = '/home/pi/.openclaw/workspace/memory';
const WORKSPACE_DIR = '/home/pi/.openclaw/workspace';

interface SearchResult {
  type: 'session' | 'memory' | 'workspace';
  path: string;
  snippet: string;
  matches: number;
  timestamp?: string;
}

async function searchInFile(filePath: string, query: string, type: string): Promise<SearchResult | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    if (!lowerContent.includes(lowerQuery)) {
      return null;
    }

    // Count matches
    const matches = (lowerContent.match(new RegExp(lowerQuery, 'g')) || []).length;

    // Extract snippet
    const index = lowerContent.indexOf(lowerQuery);
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + query.length + 100);
    let snippet = content.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return {
      type: type as any,
      path: filePath,
      snippet,
      matches,
    };
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const sourceFilter = searchParams.get('source');

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Query must be at least 2 characters',
      });
    }

    const results: SearchResult[] = [];

    // Search sessions
    if (!sourceFilter || sourceFilter === 'sessions') {
      try {
        const files = await readdir(SESSIONS_DIR);
        for (const file of files.filter(f => f.endsWith('.jsonl'))) {
          const result = await searchInFile(
            join(SESSIONS_DIR, file),
            query,
            'session'
          );
          if (result) results.push(result);
        }
      } catch (error) {
        console.error('Error searching sessions:', error);
      }
    }

    // Search memory files
    if (!sourceFilter || sourceFilter === 'memory') {
      try {
        const files = await readdir(MEMORY_DIR);
        for (const file of files.filter(f => f.endsWith('.md'))) {
          const result = await searchInFile(
            join(MEMORY_DIR, file),
            query,
            'memory'
          );
          if (result) results.push(result);
        }
      } catch (error) {
        console.error('Error searching memory:', error);
      }
    }

    // Search MEMORY.md
    if (!sourceFilter || sourceFilter === 'workspace') {
      try {
        const memoryFile = join(WORKSPACE_DIR, 'MEMORY.md');
        const result = await searchInFile(memoryFile, query, 'workspace');
        if (result) results.push(result);
      } catch (error) {
        // MEMORY.md might not exist
      }
    }

    // Search workspace files
    if (!sourceFilter || sourceFilter === 'workspace') {
      try {
        const files = await readdir(WORKSPACE_DIR);
        for (const file of files.filter(f => f.endsWith('.md') && f !== 'MEMORY.md')) {
          const result = await searchInFile(
            join(WORKSPACE_DIR, file),
            query,
            'workspace'
          );
          if (result) results.push(result);
        }
      } catch (error) {
        console.error('Error searching workspace:', error);
      }
    }

    // Sort by number of matches
    results.sort((a, b) => b.matches - a.matches);

    return NextResponse.json({
      results: results.slice(0, 50),
      total: results.length,
      query,
    });
  } catch (error) {
    console.error('Error in search:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
