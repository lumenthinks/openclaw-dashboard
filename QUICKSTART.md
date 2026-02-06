# OpenClaw Mission Control - Quick Start

## 🎯 What's Been Built

A fully functional v1 dashboard with:

✅ **Activity Feed** - Real-time view of all OpenClaw activity
  - Auto-refreshes every 5 seconds
  - Filter by message type
  - Search by content
  - Token usage display

✅ **Global Search** - Full-text search across all data
  - Session transcripts
  - Memory files  
  - Workspace documents
  - Highlighted results

✅ **Calendar View** - Placeholder for scheduled tasks (v2 feature)

## 🚀 Running the Dashboard

### Development Mode (Hot Reload)
```bash
cd /home/pi/projects/openclaw-dashboard
npm run dev
```

Then open: **http://localhost:3000**

### Production Mode
```bash
cd /home/pi/projects/openclaw-dashboard
npm run build
npm start
```

## 📦 What's Included

```
openclaw-dashboard/
├── app/
│   ├── api/
│   │   ├── activity/       # Activity feed API
│   │   ├── search/         # Search API
│   │   └── sessions/       # Session data API
│   ├── layout.tsx          # App layout with dark mode
│   └── page.tsx            # Main dashboard page
├── components/
│   ├── ActivityFeed.tsx    # Real-time activity feed
│   ├── CalendarView.tsx    # Calendar placeholder
│   ├── SearchView.tsx      # Global search interface
│   └── ui/                 # shadcn/ui components
├── README.md               # Full documentation
└── package.json            # Dependencies
```

## 🔗 Pushing to GitHub

Run the setup script:
```bash
cd /home/pi/projects/openclaw-dashboard
./setup-github.sh
```

Or manually:
1. Create repo at: https://github.com/new (name: `openclaw-dashboard`)
2. Push:
```bash
git remote add origin git@github.com:lumenthinks/openclaw-dashboard.git
git push -u origin main
```

## 🎨 Tech Stack

- Next.js 14.2+ (App Router)
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- File-based data (no DB required)

## 📊 Data Sources

The dashboard automatically reads from:
- Sessions: `/home/pi/.openclaw/agents/main/sessions/*.jsonl`
- Memory: `/home/pi/.openclaw/workspace/memory/*.md`
- Workspace: `/home/pi/.openclaw/workspace/`

## ⚡ Next Steps

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Push to GitHub using `./setup-github.sh`
4. Start monitoring OpenClaw! 🎉

## 🔧 Customization

- **Dark/Light Mode**: Edit `app/layout.tsx` (currently dark mode only)
- **Refresh Rate**: Edit `ActivityFeed.tsx` (currently 5s)
- **Result Limits**: Edit API routes in `app/api/`

---

**Ready to use!** Just run `npm run dev` and visit http://localhost:3000
