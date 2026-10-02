# 90-Day Sprint Tracker

React + Tailwind frontend, Node/Express API, PostgreSQL. Built from your `DSA_PLAN.xlsx`
(13 sprints x 7 days, 885 questions across DSA, SQL, OOP, OS, CN, LLD, DBMS).

## Setup (5 minutes)

**1. PostgreSQL** – either use Docker: `docker compose up -d`, or create the DB yourself:
```sql
CREATE USER tracker WITH PASSWORD 'tracker';
CREATE DATABASE tracker OWNER tracker;
```

**2. Backend**
```bash
cd server
npm install
cp .env.example .env        # edit DATABASE_URL if needed
npm run seed                # creates tables + loads your plan (your 26 finished Sprint-1 items are kept)
npm run dev                 # API on http://localhost:5000
```

**3. Frontend** (new terminal)
```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

Single-server mode: `cd client && npm run build`, then `cd server && npm start` and open http://localhost:5000.

## Using it
- **Today** – today's day, "x left for today" / "Today's task is complete", streak, and a list of unfinished questions from earlier days.
- **Sprints** – sidebar of 13 sprints, 7 day tabs each (with dates and progress), tick the checkbox to mark done.
- **Analytics** – completed vs total, days fully completed, ahead/behind schedule, last 14 days, progress per subject and sprint.
- **Bookmarks** – everything you bookmarked for revision.
- Row icons: LC (LeetCode), GfG, YouTube, notes, bookmark, and a menu to edit links / delete.
- Gear icon: set your Day 1 (a Wednesday). "Today" is calculated from it. Default = most recent Wednesday when you seeded.

## Links
Your Excel had no hyperlinks, so each DSA/SQL question gets **search links** by default (greyed-out LC / GfG).
Open the menu on a row and paste the exact LeetCode link (or GfG if it is not on LeetCode) and that icon
turns coloured and goes straight to the problem. OS / CN / DBMS / OOP / LLD rows get a web-search and YouTube-search link.

Bulk fill: make a CSV and run `cd server && npm run links -- links.csv`
```
title,lc_url,gfg_url,yt_url
Two Sum,https://leetcode.com/problems/two-sum/,,
```
Titles must match the question title exactly (case-insensitive).

## Notes
- Single-user app, no login. If you deploy it publicly, add auth first.
- Re-import the plan from scratch (wipes progress): `npm run seed:reset`.
- Subject tags (DSA, OS, ...) were assigned from the content of each day; change `topic` in the `questions` table if any is off.
"# DSA-Planly" 
