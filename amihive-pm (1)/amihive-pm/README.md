# Hivework – Project Management Dashboard

React 19 + Tailwind CSS 4 + Axios, frontend only. Data persists in `localStorage`.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Features
- **Dashboard**: totals, completion %, status/priority/progress charts, recent activity, upcoming deadlines (live-updating).
- **Projects**: create/edit/archive/delete, search, sort, status filter, pagination, progress derived from tasks.
- **Tasks**: full form with validation (required fields, date range, hours), dependencies and blocked indicators, comments, activity history, bulk status/priority/delete.
- **Kanban**: native drag-and-drop across four columns, live counts, overdue/blocked/high-priority highlighting; blocked tasks cannot move to In Progress or Completed.
- **Search & filters**: title/description/label/project search, combinable filters and sorting, active-filter chips, clear all; filters persist between Tasks and Board.
- **Drawer**: edit in place, unsaved-changes warning.
- **Persistence**: localStorage with schema checks and fallback to demo data; "Reset demo data" in the sidebar.
- **Axios**: "Import from API" on the Tasks page pulls todos/users from JSONPlaceholder, with loading and error states.

## Structure
`src/store.jsx` (reducer + context + persistence), `src/utils/` (helpers, seed, api), `src/hooks/useFilters.js`, `src/components/`.
