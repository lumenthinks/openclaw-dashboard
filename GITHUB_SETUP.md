# GitHub Setup Instructions

The dashboard is ready to push to GitHub! Follow these steps:

## Option 1: Using GitHub CLI (Recommended)

If you have `gh` installed and authenticated:

```bash
cd /home/pi/projects/openclaw-dashboard
gh repo create lumenthinks/openclaw-dashboard --public --source=. --remote=origin --push
```

## Option 2: Manual Setup

1. Go to https://github.com/new
2. Create a new repository:
   - **Owner**: lumenthinks
   - **Repository name**: openclaw-dashboard
   - **Description**: OpenClaw Mission Control Dashboard - Real-time monitoring and control
   - **Visibility**: Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

3. After creating the repo, run these commands:

```bash
cd /home/pi/projects/openclaw-dashboard
git remote add origin https://github.com/lumenthinks/openclaw-dashboard.git
git branch -M main
git push -u origin main
```

## Verify

After pushing, the repository should be available at:
https://github.com/lumenthinks/openclaw-dashboard

The dashboard is already built and committed. Once pushed, you can:
- View the code on GitHub
- Clone it on other machines
- Set up GitHub Actions for CI/CD (future enhancement)
