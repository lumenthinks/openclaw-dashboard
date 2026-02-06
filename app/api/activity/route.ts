import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

const SESSIONS_DIR = '/home/pi/.openclaw/agents/main/sessions';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const sessionFilter = searchParams.get('session');
    const typeFilter = searchParams.get('type');

    const files = await readdir(SESSIONS_DIR);
    const sessionFiles = files.filter(f => f.endsWith('.jsonl'));

    const activities: ActivityItem[] = [];

    for (const file of sessionFiles) {
      const sessionId = file.replace('.jsonl', '');
      
      if (sessionFilter && sessionId !== sessionFilter) {
        continue;
      }

      const filePath = join(SESSIONS_DIR, file);
      const content = await readFile(filePath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          
          // Skip non-message entries
          if (entry.type !== 'message') {
            continue;
          }

          const msg = entry.message;
          const timestamp = entry.timestamp || new Date().toISOString();
          
          // Parse different message types
          if (msg.role === 'user') {
            activities.push({
              sessionId,
              timestamp,
              type: 'user',
              content: msg.content,
            });
          } else if (msg.role === 'assistant') {
            activities.push({
              sessionId,
              timestamp,
              type: 'assistant',
              content: msg.content,
              tokenUsage: msg.usage,
            });
          }

          // Extract tool calls
          if (msg.tool_calls) {
            for (const toolCall of msg.tool_calls) {
              activities.push({
                sessionId,
                timestamp,
                type: 'tool_call',
                content: toolCall,
              });
            }
          }

          // Tool results
          if (msg.role === 'tool') {
            activities.push({
              sessionId,
              timestamp,
              type: 'tool_result',
              content: msg,
            });
          }
        } catch (err) {
          console.error('Error parsing line:', err);
        }
      }
    }

    // Sort by timestamp descending
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply type filter
    let filtered = activities;
    if (typeFilter) {
      filtered = activities.filter(a => a.type === typeFilter);
    }

    return NextResponse.json({
      activities: filtered.slice(0, limit),
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error reading activity:', error);
    return NextResponse.json(
      { error: 'Failed to read activity' },
      { status: 500 }
    );
  }
}
