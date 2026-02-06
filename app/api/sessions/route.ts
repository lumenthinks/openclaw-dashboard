import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const SESSIONS_DIR = '/home/pi/.openclaw/agents/main/sessions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (sessionId) {
      // Return specific session
      const sessionPath = join(SESSIONS_DIR, `${sessionId}.jsonl`);
      const content = await readFile(sessionPath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      const entries = lines.map(line => JSON.parse(line));
      
      // Filter to only message entries
      const messages = entries
        .filter(e => e.type === 'message')
        .map(e => ({ ...e.message, timestamp: e.timestamp, id: e.id }));
      
      return NextResponse.json({
        sessionId,
        messages: messages.slice(offset, offset + limit),
        total: messages.length,
      });
    }

    // List all sessions
    const files = await readdir(SESSIONS_DIR);
    const sessionFiles = files
      .filter(f => f.endsWith('.jsonl'))
      .map(f => f.replace('.jsonl', ''))
      .sort()
      .reverse();

    return NextResponse.json({
      sessions: sessionFiles,
      total: sessionFiles.length,
    });
  } catch (error) {
    console.error('Error reading sessions:', error);
    return NextResponse.json(
      { error: 'Failed to read sessions' },
      { status: 500 }
    );
  }
}
