# OpenClaw Mission Control Dashboard

A real-time monitoring and control dashboard for OpenClaw, built with Next.js 14+.

## Features

### ✅ Activity Feed (v1)
- Real-time view of all OpenClaw activity
- Parse and display session transcripts from JSONL files
- Show user messages, assistant responses, tool calls, and results
- Filter by message type (user, assistant, tool calls, tool results)
- Search activities by content or session ID
- Display token usage and costs
- Auto-refresh every 5 seconds

### ✅ Global Search (v1)
- Full-text search across:
  - Session transcripts
  - Memory files
  - MEMORY.md
  - Workspace documents
- Filter by source type
- Highlighted search results
- Shows number of matches per result

### 📅 Calendar View (Placeholder)
- Weekly view of scheduled tasks (coming soon)
- Will integrate with cron for scheduled work
- Heartbeats, reminders, and recurring tasks

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **shadcn/ui** for beautiful, accessible components
- **Tailwind CSS** for styling
- **File-based data** - no external database needed

## Installation

```bash
# Navigate to the project directory
cd /home/pi/projects/openclaw-dashboard

# Install dependencies (already done during setup)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to:
   ```
   http://localhost:3000
   ```

3. The dashboard will automatically:
   - Load recent activity from `/home/pi/.openclaw/agents/main/sessions/*.jsonl`
   - Auto-refresh activity feed every 5 seconds
   - Allow searching across all OpenClaw data

## Data Sources

The dashboard reads from these locations:

- **Sessions**: `/home/pi/.openclaw/agents/main/sessions/*.jsonl`
- **Memory**: `/home/pi/.openclaw/workspace/memory/*.md`
- **Workspace**: `/home/pi/.openclaw/workspace/`

## Dark Mode

Dark mode is enabled by default. The UI is optimized for comfortable long-term monitoring.

## API Endpoints

### GET `/api/activity`
Returns recent activity across all sessions.

**Query Parameters:**
- `limit` (default: 50) - Maximum number of activities to return
- `session` - Filter by specific session ID
- `type` - Filter by activity type (user, assistant, tool_call, tool_result)

### GET `/api/sessions`
List all sessions or get a specific session's messages.

**Query Parameters:**
- `id` - Specific session ID to retrieve
- `limit` (default: 100) - Maximum messages to return
- `offset` (default: 0) - Offset for pagination

### GET `/api/search`
Full-text search across all data sources.

**Query Parameters:**
- `q` - Search query (minimum 2 characters)
- `source` - Filter by source type (sessions, memory, workspace)

## Future Enhancements

- [ ] Calendar integration with cron
- [ ] Real-time WebSocket updates instead of polling
- [ ] Session replay/debugging tools
- [ ] Token usage analytics and charts
- [ ] Export activity logs
- [ ] Dark/light mode toggle
- [ ] Filtering by date range
- [ ] Session comparison view

## Development

```bash
# Run development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## License

MIT

---

Built with ❤️ for OpenClaw
